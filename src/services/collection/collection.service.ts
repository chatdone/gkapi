/* eslint-disable prefer-const */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import _ from 'lodash';
import { CollectionStore, createLoaders } from '@data-access';
import {
  UpdateCollectionPaymentTypePayload,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  CollectionReminderReadModel,
  CollectionPeriodModel,
  CollectionPeriodId,
  CreateCollectionPaymentPayload,
  CollectionPaymentModel,
  UpdatePaymentStatusRejectedPayload,
  UpdatePaymentStatusApprovedPayload,
  CollectionPaymentId,
  CollectionRemindOnDaysModel,
  CreateCollectionPaymentReceiptPayload,
  CollectionPublicId,
  CollectionPaymentPublicId,
  CollectionId,
  CollectionModel,
  CollectionPaymentSummaryModel,
  PaymentOrderId,
  PaymentOrderDetailModel,
  CollectionMessageLogModel,
  CollectionPaymentLinkModel,
  CollectionActivityLogModel,
} from '@models/collection.model';
import {
  ContactId,
  ContactModel,
  ContactPicModel,
} from '@models/contact.model';
import { AffectedRowsResult } from '@models/task.model';
import s3 from '@tools/s3';
import { CreateCollectionInput } from '@generated/graphql-types';
import {
  calculateReminderDueDate,
  numberToArray,
  ringgitRounding,
} from './util';
import { UserId, UserModel } from '@models/user.model';
import { AttachmentPayload } from '@models/common.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
} from '@models/company.model';
import {
  CollectorService,
  CompanyService,
  ContactService,
  EventManagerService,
  FilterService,
  NotificationService,
  SenangPayService,
  SubscriptionService,
  TagService,
} from '@services';
import { EventCollectionPayload } from '@models/event-manager.model';
import {
  CollectorId,
  CollectorMemberModel,
  CollectorModel,
} from '@models/collector.model';
import { FilterOptionsModel } from '@models/filter.model';
import { TagModel } from '@models/tag.model';
import {
  CollectionPaymentStatusTypes,
  CollectionPeriodStatusTypes,
  CollectionRemindTypes,
  CollectionStatusTypes,
  PAYMENT_METHODS,
} from '@data-access/collection/collection.store';
import { TableNames } from '@db-tables';
import { AUDIT_LOG_TYPES } from '@data-access/contact/utils';
import { ACTION_TYPES } from '@services/event-manager/event-manager.constants';
import logger from '@tools/logger';
dayjs.extend(utc);
dayjs.extend(tz);

const modifyPaymentType = async ({
  collection,
  payload,
  user,
}: {
  collection: CollectionModel;
  payload: UpdateCollectionPaymentTypePayload;
  user: UserModel;
}): Promise<CollectionModel | Error> => {
  if (collection.created_by !== user.id) {
    return Promise.reject(
      'This user do not have permission to modify this collection',
    );
  }
  try {
    const res = await CollectionStore.modifyPaymentType({
      id: collection.id as CollectionId,
      payload,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollection = async ({
  payload,
  attachment,
  remindOnDays,
  contact,
  tags,
  companyId,
}: {
  payload: CreateCollectionInput;
  attachment: AttachmentPayload;
  remindOnDays: number[] | undefined | null;
  contact: ContactModel;
  tags?: TagModel[];
  companyId: CompanyId;
}): Promise<CollectionModel | Error> => {
  try {
    const loaders = await createLoaders();

    //yet to implement company storage validation, that is the use of companyId
    const uploaded = await s3.processUploadToS3({
      attachment,
      s3Directory: 'invoice/',
      isPublicAccess: true,
      companyId,
    });

    if (!uploaded.success) {
      throw new Error('Invoice Upload Failed');
    }
    const dbPayload = {
      ...payload,
      file_name: uploaded.name,
      invoice_file_size: uploaded.file_size,
      invoice: uploaded.path,
      periods: payload.periods ? payload.periods : 1,
      payable_amount: payload.periods
        ? payload.periods * payload.payable_amount
        : payload.payable_amount,
    } as CreateCollectionPayload;

    //-------------Check quota if okay -------------------
    const isPaidCompany = await SubscriptionService.isPaidCompany(
      contact.company_id,
    );

    if (isPaidCompany) {
      await NotificationService.checkQuotaBeforeCreateCollection({
        companyId: contact.company_id,
        serviceNotify: {
          emailNotify: _.get(payload, 'email_notify') ? true : false,
          whatsAppNotify: _.get(payload, 'whatsapp_notify') ? true : false,
        },
        contactId: contact.id,
        loaders,
      });
    }
    //------------------end check quota-----------------------------------
    const collection = (await CollectionStore.createCollection({
      dbPayload,
      contactId: contact.id,
    })) as CollectionModel;

    if (dbPayload.remind_interval === 'Week') {
      let createRemindOnDaysPayload: any[] = [];
      if (remindOnDays !== null || remindOnDays !== undefined) {
        let processedRemindOnDays = getRemindOnDays(remindOnDays as number[]);
        if (_.isEmpty(processedRemindOnDays)) {
          throw new Error('remind on days values are incompatible');
        }
        _.map(processedRemindOnDays, (day, i) => {
          createRemindOnDaysPayload[i] = { day, receivable_id: collection.id };
        });
        await CollectionStore.createRemindOnDays({
          payload: createRemindOnDaysPayload,
        });
      }
    }

    const { periods, start_month, due_date, payable_amount, remind_type } =
      collection;

    //2 is INSTALMENT TYPE
    if (remind_type === CollectionRemindTypes.INSTALMENT) {
      const { valid, maxDate } = validateInstalmentDueDate({
        numOfMonth: periods,
        start_month,
        due_date,
      });

      if (!valid) {
        throw new Error(
          `Invalid due date. Due date cannot be later than ${maxDate}`,
        );
      }

      let periodAmount;
      let monthAmount: number[] = [];

      // FIXME: This needs to be changed to a default value in the inputs
      const isSenangPay =
        (dbPayload.payment_type || PAYMENT_METHODS.MANUAL) ===
        PAYMENT_METHODS.SENANGPAY;

      periodAmount = ringgitRounding(_.round(payable_amount / periods, 2));

      let total = _.toNumber(payable_amount);

      for (let i = 0; i < _.toNumber(periods); i++) {
        if (_.toNumber(periods) !== i + 1) {
          monthAmount.push(periodAmount);
        } else {
          monthAmount.push(_.round(total, 2));
        }
        total = periodAmount;
      }

      const due = dayjs(due_date).format('DD');
      let lastDue;

      await Promise.all(
        _.map(numberToArray(periods), async (period, periodKey) => {
          let periodDue = dayjs(start_month);
          if (period - 1 > 0) periodDue = periodDue.add(period - 1, 'M');
          if (_.toNumber(periods) === period) {
            lastDue = periodDue.format(`YYYY-MM-${due}`);
          }
          const receivablePeriodsPayload = {
            receivableId: collection.id,
            period,
            month: periodDue.format('YYYY-MM-01'),
            amount: monthAmount[periodKey],
            dueDate: periodDue.format(`YYYY-MM-${due}`),
            status: 1,
          };
          await CollectionStore.createReceivablePeriods(
            receivablePeriodsPayload,
          );
        }),
      );

      if (lastDue)
        await CollectionStore.updateDueDate({
          dueDate: lastDue,
          collectionId: collection.id,
        });

      if (isSenangPay) {
        const workerOptions = {
          name: payload.title,
          price: total,
          code: payload.ref_no,
          recurringType: 'instalment',
          repetition: payload.periods as number,
          companyId: contact.company_id,
          collectionId: collection.id,
        };

        await SenangPayService.createRecurringProduct(workerOptions);
      }
    } else {
      const receivablePeriodsPayload = {
        receivableId: collection.id,
        period: 1,
        month: dayjs(due_date).format('YYYY-MM-01'),
        amount: payable_amount,
        dueDate: due_date,
        status: CollectionPeriodStatusTypes.PENDING,
      };

      await CollectionStore.createReceivablePeriods(receivablePeriodsPayload);
    }

    if (isPaidCompany) {
      const collectionPeriods = (await getCollectionPeriods({
        collectionId: collection.id,
      })) as CollectionPeriodModel[];
      const contact = (await loaders.contacts.load(
        collection.contact_id,
      )) as ContactModel;
      const company = (await loaders.companies.load(
        contact.company_id,
      )) as CompanyModel;

      const evtCollection =
        (await EventManagerService.getEventManagerCollection({
          collection,
          periodIds: collectionPeriods.map((cp) => cp.id),
          company,
        })) as EventCollectionPayload;

      await EventManagerService.handleCollectionReminderEvent({
        data: evtCollection,
        overdue: false,
        isResend: false,
        isCreate: true,
      });
    }

    if (tags && !_.isEmpty(tags)) {
      await TagService.assignTagsToCollection({
        tagIds: tags.map((tag) => tag.id),
        collectionId: collection?.id,
      });
    }

    await EventManagerService.createLogData({
      tableName: TableNames.COLLECTIONS,
      sourceId: collection.created_by,
      tableRowId: collection.id,
      auditActionType: AUDIT_LOG_TYPES.ACTION.CREATE,
      table: {
        collection,
      },
      contactPublicId: contact?.id_text,
    });

    return collection;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getRemindOnDays = (remindOnDays: number[]) => {
  let data = _.filter(remindOnDays, (day) => day <= 7 && day >= 1);
  data = _.uniq(data);
  return data;
};

const validateInstalmentDueDate = ({
  numOfMonth,
  start_month,
  due_date,
}: {
  numOfMonth: number;
  start_month: string;
  due_date: string;
}): any => {
  let valid = true;
  let maxDate = 28;

  const due = dayjs(due_date).tz('Asia/Kuala_Lumpur').format('DD');
  const periods = numberToArray(numOfMonth);
  _.map(periods, (p) => {
    const currentDate = dayjs(start_month).tz('Asia/Kuala_Lumpur');
    if (p > 0) currentDate.add(p, 'M');
    const endOfMonth = currentDate.endOf('months').format('DD');
    if (due > endOfMonth) {
      valid = false;
      maxDate = _.toNumber(endOfMonth);
    }
  });
  return { valid, maxDate };
};

const deleteCollections = async ({
  collections,
  user,
}: {
  collections: CollectionModel[];
  user: UserModel;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = CollectionStore.deleteCollections({
      collectionIds: collections.map((c) => c.id as CollectionId),
      userId: user.id,
    });

    await EventManagerService.logCollectionCreateDelete({
      collections,
      updatedBy: user,
      changedValue: { is_create: false, collection: true },
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollection = async ({
  payload,
  collection,
  contact,
  collector,
  user,
  remindOnDays,
  attachment,
  companyId,
}: {
  payload: UpdateCollectionPayload;
  collection: CollectionModel;
  contact: ContactModel;
  collector: CollectorModel;
  user: UserModel;
  remindOnDays: number[];
  attachment: AttachmentPayload;
  companyId: CompanyId;
}): Promise<CollectionModel | Error> => {
  try {
    const { contact_id, remind_type, periods, start_month } = collection;

    let updateObj = {
      ...payload,
      updated_by: user.id,
    } as any;

    //if notify_pics update is required
    if (payload.notify_pics) {
      const contactPics = (await ContactService.getContactPics(
        contact_id,
      )) as ContactPicModel[];
      const picIds = _.map(contactPics, 'id');
      const notifyPics: any[] = [];
      _.map(payload.notify_pics, (id) => {
        if (_.includes(picIds, _.toNumber(id))) notifyPics.push(_.toNumber(id));
      });

      await EventManagerService.logPicAddRemoveCollection({
        updatedNotifyPics: notifyPics,
        collection,
        updatedBy: user,
      });

      updateObj.notify_pics = JSON.stringify(notifyPics);
    }

    //if remind type update is required
    if (payload.due_date) {
      if (remind_type === CollectionRemindTypes.INSTALMENT) {
        const due_date = _.get(updateObj, 'due_date');
        if (due_date) {
          const { valid, maxDate } = validateInstalmentDueDate({
            numOfMonth: periods,
            start_month,
            due_date,
          });
          if (!valid)
            return Promise.reject(
              `Invalid due date. Due date cannot be later than ${maxDate}`,
            );
          updateObj.due_date = calculateReminderDueDate(
            collection.due_date,
            due_date,
          );
        }
      }
    }

    //if attachment update required
    if (attachment) {
      const uploaded = await s3.processUploadToS3({
        attachment,
        s3Directory: 'invoice/',
        isPublicAccess: true,
        companyId,
      });

      if (!uploaded.success) {
        return Promise.reject('Invoice Upload Failed');
      }

      updateObj.file_name = uploaded.name;
      updateObj.invoice = uploaded.path;
      updateObj.invoice_file_size = uploaded.file_size;
    }

    const updatedCollection = (await CollectionStore.updateCollection({
      collectionId: collection.id,
      payload: updateObj,
    })) as CollectionModel;

    if (payload.due_date) {
      if (remind_type === CollectionRemindTypes.FULL) {
        const due_date = _.get(updateObj, 'due_date');
        await CollectionStore.updateCollectionPeriodDueDate({
          collectionId: updatedCollection.id,
          dueDate: due_date,
        });

        const updatedCollectionDate = dayjs(updatedCollection.due_date).format(
          'DD-MM-YYYY',
        );
        const collDate = dayjs(collection.due_date).format('DD-MM-YYYY');
        if (updatedCollectionDate !== collDate) {
          await EventManagerService.logUpdatedCollectionDueDate({
            collection,
            updatedCollection: updatedCollection,
            updatedBy: user,
            collector,
          });
        }
      }
    }

    if (remindOnDays) {
      const { remind_interval } = updatedCollection;
      await CollectionStore.deleteRemindOnDays(updatedCollection.id);

      if (remind_interval === 'Week') {
        let createRemindOnDaysPayload: any[] = [];
        const remind_on_days = getRemindOnDays(remindOnDays);
        if (_.isEmpty(remind_on_days))
          return Promise.reject(
            `'remindOnDays' is required for weekly reminder`,
          );
        _.map(remindOnDays, (day, i) => {
          createRemindOnDaysPayload[i] = {
            day,
            receivable_id: updatedCollection.id,
          };
        });
        await CollectionStore.createRemindOnDays({
          payload: createRemindOnDaysPayload,
        });
      }
    }

    await EventManagerService.logUpdatedCollectionMisc({
      payload,
      collection,
      updatedBy: user,
      collector,
    });

    return updatedCollection;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deactivateCollections = async ({
  userId,
  collectionIds,
}: {
  userId: UserId;
  collectionIds: CollectionId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await CollectionStore.deactivateCollections({
      userId,
      collectionIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const activateCollections = async ({
  userId,
  collectionIds,
}: {
  userId: UserId;
  collectionIds: CollectionId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await CollectionStore.activateCollections({
      userId,
      collectionIds,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const archiveCollections = async ({
  user,
  collections,
}: {
  user: UserModel;
  collections: CollectionModel[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await CollectionStore.archiveCollections({
      userId: user.id,
      collectionIds: collections.map((c) => c.id),
    });

    await EventManagerService.logArchiveCollection({
      collections,
      affectedCollectionsCount: res,
      updatedBy: user,
      isArchive: true,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const unarchiveCollections = async ({
  user,
  collections,
}: {
  user: UserModel;
  collections: CollectionModel[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await CollectionStore.unarchiveCollections({
      userId: user.id,
      collectionIds: collections.map((c) => c.id),
    });

    await EventManagerService.logArchiveCollection({
      collections,
      affectedCollectionsCount: res,
      updatedBy: user,
      isArchive: false,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const collectionReminderRead = async ({
  userId,
  collectionId,
}: {
  userId: UserId;
  collectionId: CollectionId;
}): Promise<CollectionReminderReadModel | Error> => {
  try {
    const res = (await CollectionStore.collectionReminderRead({
      userId,
      collectionId,
    })) as CollectionReminderReadModel;
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPeriods = async ({
  collectionId,
}: {
  collectionId: CollectionId;
}): Promise<(CollectionPeriodModel | Error)[]> => {
  try {
    const res = await CollectionStore.getCollectionPeriods(collectionId);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPeriod = async ({
  collectionPeriodId,
}: {
  collectionPeriodId: CollectionPeriodId;
}): Promise<CollectionPeriodModel | Error> => {
  try {
    const res = await CollectionStore.getCollectionPeriod(collectionPeriodId);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionRemindOnDays = async ({
  queryBy,
}: {
  queryBy: any;
}): Promise<(CollectionRemindOnDaysModel | Error)[]> => {
  try {
    const res = await CollectionStore.getCollectionRemindOnDays({ queryBy });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollectionPeriodStatus = async ({
  user,
  collection,
  collectionPeriodId,
  status,
}: {
  user: UserModel;
  collection: CollectionModel;
  collectionPeriodId: CollectionPeriodId;
  status: number;
}): Promise<CollectionPeriodModel | Error> => {
  try {
    const res = await CollectionStore.updateCollectionPeriodStatus({
      collectionPeriodId,
      status,
    });

    const periods = (await CollectionStore.getCollectionPeriods(
      collection.id,
    )) as CollectionPeriodModel[];

    const allPaid = periods.every((period) => period.status === 2);

    if (allPaid) {
      const payload = {
        status: CollectionStatusTypes.PAID,
      };
      await CollectionStore.updateCollection({
        collectionId: collection.id,
        payload,
      });
    } else {
      const payload = {
        status: CollectionStatusTypes.PENDING,
      };
      await CollectionStore.updateCollection({
        collectionId: collection.id,
        payload,
      });
    }

    if (status === CollectionPeriodStatusTypes.PAID) {
      await EventManagerService.handleCollectionMarkedAsPaid({
        collection,
        collectionPeriodId,
        updatedBy: user,
      });
    } else if (status === CollectionPeriodStatusTypes.PENDING) {
      await EventManagerService.handleCollectionMarkedUnpaid({
        collection,
        updatedBy: user,
      });
    }
    await removeCollectionDraftStatus({
      collectionId: collection.id,
      userId: user.id,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeCollectionDraftStatus = async ({
  collectionId,
  userId,
}: {
  collectionId: CollectionId;
  userId: UserId;
}) => {
  try {
    await CollectionStore.removeCollectionDraftStatus({
      collectionId,
      userId,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollectionPayment = async ({
  user,
  attachment,
  collection,
  collectionPeriod,
  contactPic,
  contact,
  companyId,
}: {
  user: UserModel;
  attachment: AttachmentPayload;
  collection: CollectionModel;
  collectionPeriod: CollectionPeriodModel;
  contactPic: ContactPicModel;
  contact: ContactModel;
  companyId: CompanyId;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    if (collectionPeriod.status === CollectionPeriodStatusTypes.PAID) {
      await updateCollectionPeriodStatus({
        user,
        collection,
        collectionPeriodId: collectionPeriod.id,
        status: CollectionPeriodStatusTypes.PENDING,
      });
    }

    // const{company_id} = contact;
    // await validateStorageLimit(companyId, {
    //   size: paymentProof.size,
    //   throwError: true
    // });
    const uploaded = await s3.processUploadToS3({
      attachment,
      s3Directory: 'payment/',
      isPublicAccess: true,
      companyId,
    });

    const payload = {
      receivable_id: collection.id,
      receivable_period_id: collectionPeriod.id,
      contact_id: contact.id,
      pic_id: _.get(contactPic, 'id', null),
      payment_proof: uploaded.path,
      payment_proof_file_name: uploaded.name,
      payment_proof_file_size: uploaded.file_size,
      created_by: user.id,
      status: CollectionPaymentStatusTypes.PENDING,
    } as CreateCollectionPaymentPayload;
    const collectionPayment =
      await CollectionStore.createCollectionPaymentRecord(payload);

    const collectorMembers =
      (await CollectorService.getCollectorMembersByCollectorId({
        collectorId: _.get(contact, 'id'),
      })) as CollectorMemberModel[];

    await EventManagerService.handleNotifyUploadedPaymentProof({
      collectionPayment: collectionPayment as CollectionPaymentModel,
      collectorMembers,
      uploadedBy: user,
    });

    return collectionPayment;
  } catch (error) {
    return Promise.reject(error);
  }
};

const uploadPaymentReceipt = async ({
  collectionPayment,
  collectionPeriod,
  user,
  attachment,
  companyId,
}: {
  collectionPayment: CollectionPaymentModel;
  collectionPeriod: CollectionPeriodModel;
  user: UserModel;
  attachment: AttachmentPayload;
  companyId: CompanyId;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    const uploaded = await s3.processUploadToS3({
      attachment,
      s3Directory: 'receipt/',
      isPublicAccess: true,
      companyId,
    });

    const payload = {
      receipt: uploaded.path,
      receipt_file_name: uploaded.name,
      receipt_file_size: uploaded.file_size,
      status: CollectionPaymentStatusTypes.APPROVED,
      updated_by: user.id,
    } as CreateCollectionPaymentReceiptPayload;

    const res = await CollectionStore.createCollectionPaymentReceipt({
      collectionPaymentId: collectionPayment.id,
      collectionPeriodId: collectionPeriod.id,
      payload,
    });
    await EventManagerService.handleNotifyUploadedReceipt({
      collectionPayment: collectionPayment as CollectionPaymentModel,
      uploadedBy: user,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPayment = async (
  collectionPaymentId: CollectionPaymentPublicId | CollectionPaymentId,
): Promise<CollectionPaymentModel | Error> => {
  try {
    const loaders = await createLoaders();
    const res = (await loaders.collectionPayments.load(
      collectionPaymentId,
    )) as CollectionPaymentModel;
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCollectionPaymentRecord = async ({
  userId,
  collection,
  collectionPeriod,
}: {
  userId: UserId;
  collection: CollectionModel;
  collectionPeriod: CollectionPeriodModel;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    const collectionPayment =
      (await CollectionStore.getCollectionPaymentByCollectionIdPeriodId({
        collectionId: collection.id,
        collectionPeriodId: collectionPeriod.id,
      })) as CollectionPaymentModel;
    if (collectionPayment.status !== 1)
      throw new Error('Cannot delete approved or rejected payment proof');
    const res = await CollectionStore.deleteCollectionPaymentRecord({
      collectionPaymentId: collectionPayment.id,
      userId,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollectionPaymentStatus = async ({
  collectionPaymentId,
  collectionPeriodId,
  companyId,
  userId,
  status,
  remarks,
}: {
  collectionPaymentId: CollectionPaymentId;
  collectionPeriodId: CollectionPeriodId;
  companyId: CompanyId;
  userId: UserId;
  status: number;
  remarks: string;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    let company_member = (await CompanyService.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];
    company_member = _.filter(company_member, (c) => c.user_id === userId);
    if (!company_member) throw new Error('Permission Denied');

    if (status === CollectionPaymentStatusTypes.APPROVED) {
      const payload = {
        status: CollectionPaymentStatusTypes.APPROVED,
        member_id: _.head(company_member.map((c) => c.id)),
      } as UpdatePaymentStatusApprovedPayload;
      const res = (await CollectionStore.updatePaymentStatusApproved({
        payload,
        userId,
        collectionPeriodId,
        collectionPaymentId,
      })) as CollectionPaymentModel;

      const loaders = createLoaders();
      const collection = (await loaders.collections.load(
        res.receivable_id,
      )) as CollectionModel;

      await CollectionStore.updateCollection({
        collectionId: collection.id,
        payload: { status: CollectionStatusTypes.PAID },
      });
      const updatedBy = (await loaders.users.load(userId)) as UserModel;

      await EventManagerService.handleCollectionMarkedAsPaid({
        collection,
        updatedBy,
        collectionPeriodId,
      });
      await EventManagerService.logCollectionPaymentApproved({
        collection,
        updatedBy,
        changedValue: { payment_approve: true },
      });
      return res;
    } else if (status === CollectionPaymentStatusTypes.REJECTED) {
      if (!remarks) remarks = '';
      const payload = {
        status: CollectionPaymentStatusTypes.REJECTED,
        member_id: _.head(company_member.map((c) => c.id)),
        remarks: remarks,
      } as UpdatePaymentStatusRejectedPayload;

      const res = (await CollectionStore.updatePaymentStatusRejected({
        payload,
        userId,
        collectionPaymentId,
      })) as CollectionPaymentModel;

      await EventManagerService.handleNotifyRejectedPayment({
        memberUserId: userId,
        memberId: _.head(company_member.map((c) => c.id)) as number,
        collectionPayment: res,
        companyId,
        remarks,
      });

      return res;
    } else {
      throw new Error('Failed to update payment');
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const listCollectionsByContactId = async ({
  contactId,
  filters,
  contactPicId,
}: {
  contactId: ContactId;
  filters?: FilterOptionsModel;
  contactPicId?: number;
}): Promise<(CollectionModel | Error)[]> => {
  try {
    const res = (await CollectionStore.listCollectionsByContactId(
      contactId,
    )) as CollectionModel[];

    let collections = filters ? await FilterService.Filter(res, filters) : res;

    if (contactPicId) {
      collections = await FilterService.filterCollectionsForCollector({
        collections: collections as CollectionModel[],
        contactPicId: contactPicId,
      });
    }

    return collections;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPeriodPayments = async ({
  collectionId,
  periodId,
}: {
  collectionId: CollectionId;
  periodId: CollectionPeriodId;
}): Promise<(CollectionPaymentModel | Error)[]> => {
  try {
    const res = await CollectionStore.getCollectionPeriodPayments({
      collectionId,
      periodId,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const downloadFile = async ({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName: string;
}): Promise<any | Error> => {
  try {
    const file = s3.getObjectFromS3({
      filePath,
      isPublicAccess: true,
    }) as any;

    return file;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollection = async (
  collectionId: CollectionPublicId | CollectionId,
): Promise<CollectionModel | Error> => {
  try {
    const loaders = await createLoaders();
    const res = (await loaders.collections.load(
      collectionId,
    )) as CollectionModel;
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionForPayment = (
  id: number,
): Promise<CollectionPaymentSummaryModel | Error> => {
  try {
    const res = CollectionStore.getCollectionForPayment(id);
    return res;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const getPaymentOrderDetail = async (
  orderId: PaymentOrderId,
): Promise<PaymentOrderDetailModel | Error> => {
  try {
    const res = await CollectionStore.getPaymentOrderDetail(orderId);
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createPaymentOrder = async ({
  collectionId,
  orderId,
  jsonDataString,
}: {
  collectionId: CollectionId;
  orderId: string;
  jsonDataString: string;
}): Promise<number[]> => {
  return await CollectionStore.createPaymentOrder({
    collectionId,
    orderId,
    jsonDataString,
  });
};

const getCollectionMessageLogs = async (
  collectionId: CollectionId,
): Promise<(CollectionMessageLogModel | Error)[]> => {
  try {
    const res = await CollectionStore.getCollectionMessageLogs(collectionId);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollectionMessageLog = async (payload: {
  collection_id: CollectionId;
  type: string;
  email_address?: string;
  phone?: string;
  status: number;
}): Promise<CollectionMessageLogModel | Error> => {
  try {
    const res = await CollectionStore.createCollectionMessageLog(payload);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPaymentLink = async (
  collectionId: CollectionId,
): Promise<string | null | Error> => {
  try {
    const res = (await CollectionStore.getCollectionPaymentLink(
      collectionId,
    )) as CollectionPaymentLinkModel;

    if (res?.shortId) {
      return `${process.env.REDIRECT_URL}/${res.shortId}`;
    } else {
      return null;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionAssignees = async ({
  collectionId,
  user,
}: {
  collectionId: CollectionId;
  user: UserModel;
}) => {
  try {
    const res = await CollectionStore.getCollectionAssignees({
      collectionId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignMembersToCollection = async ({
  collectionId,
  memberIds,
  user,
}: {
  collectionId: CollectionId;
  memberIds: CompanyMemberId[];
  user: UserModel;
}) => {
  try {
    const res = await CollectionStore.assignMembersToCollection({
      collectionId,
      memberIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeMembersFromCollection = async ({
  collectionId,
  memberIds,
  user,
}: {
  collectionId: CollectionId;
  memberIds: CompanyMemberId[];
  user: UserModel;
}) => {
  try {
    const res = await CollectionStore.removeMembersFromCollection({
      collectionId,
      memberIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionActivityLogs = async (
  collectionId: CollectionId,
): Promise<CollectionActivityLogModel[]> => {
  const res = await CollectionStore.getCollectionActivityLogs(collectionId);

  const processed = await Promise.all(
    _.map(res, async (log) => {
      const changedValues = log.changed_values as unknown as {
        is_create: boolean;
        uploaded_payment: boolean;
        rejected_payment: boolean;
        uploaded_receipt: boolean;
        marked_paid: boolean;
        payment_approve: boolean;
        due_date: boolean;
        notify_pics: boolean;
        archive: boolean;
        title: boolean;
        ref_no: boolean;
      };

      const activityLog = {
        actionType: ACTION_TYPES.COLLECTION_CREATED,
        createdBy: log.source_id,
        createdAt: log.timestamp,
        collectionId: log.table_row_id,
        currentValues: log?.current_values as unknown as JSON,
        previousValues: log?.previous_values as unknown as JSON,
        changedValues: log?.changed_values as unknown as JSON,
      };

      if (
        log.action === AUDIT_LOG_TYPES.ACTION.CREATE &&
        changedValues?.is_create
      ) {
        return {
          ...activityLog,
          actionType: ACTION_TYPES.COLLECTION_CREATED,
        };
      } else if (
        log.action === AUDIT_LOG_TYPES.ACTION.DELETE &&
        changedValues?.is_create === false
      ) {
        return {
          ...activityLog,
          actionType: ACTION_TYPES.COLLECTION_REMOVED,
        };
      } else if (log.action === AUDIT_LOG_TYPES.ACTION.UPDATE) {
        if (changedValues?.uploaded_payment) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_UPLOADED_PAYMENT,
          };
        } else if (changedValues.rejected_payment) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_PAYMENT_REJECTED,
          };
        } else if (changedValues.uploaded_receipt) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_UPLOADED_RECEIPT,
          };
        } else if (changedValues.marked_paid === true) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_MARKED_PAID,
          };
        } else if (changedValues.marked_paid === false) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_MARKED_UNPAID,
          };
        } else if (changedValues.payment_approve === true) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_PAYMENT_APPROVED,
          };
        } else if (changedValues.payment_approve === false) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_PAYMENT_REJECTED,
          };
        } else if (changedValues.due_date) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_UPDATED_DUE_DATE,
          };
        } else if (changedValues.notify_pics) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_PIC_UPDATED,
          };
        } else if (changedValues.archive) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_ARCHIVED,
          };
        } else if (changedValues.archive === false) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_UNARCHIVED,
          };
        } else if (changedValues.title) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_UPDATED_TITLE,
          };
        } else if (changedValues.ref_no) {
          return {
            ...activityLog,
            actionType: ACTION_TYPES.COLLECTION_UPDATED_REF_NO,
          };
        } else {
          logger.activityLogger.log('info', 'getCollectionActivityLogs', log);
        }
      }
    }),
  );

  return processed.filter(
    (p) => p !== undefined,
  ) as CollectionActivityLogModel[];
};

const getCollectorCollectionActivityLogs = async (
  collectorId: CollectorId,
): Promise<CollectionActivityLogModel[]> => {
  try {
    const collections = await CollectionStore.getAllCollectionsByContactId(
      collectorId,
    );
    const collectionIds = _.map(collections, 'id');
    const logs: CollectionActivityLogModel[] = [];

    for (const collectionId of collectionIds) {
      const collectionLogs = await getCollectionActivityLogs(collectionId);
      logs.push(...collectionLogs);
    }

    return logs;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getCollection,
  createCollection,
  modifyPaymentType,
  deleteCollections,
  updateCollection,
  deactivateCollections,
  activateCollections,
  archiveCollections,
  unarchiveCollections,
  collectionReminderRead,
  getCollectionPeriods,
  getCollectionPeriod,
  getCollectionRemindOnDays,
  updateCollectionPeriodStatus,
  createCollectionPayment,
  getCollectionPayment,
  deleteCollectionPaymentRecord,
  listCollectionsByContactId,
  updateCollectionPaymentStatus,
  getCollectionPeriodPayments,
  uploadPaymentReceipt,
  downloadFile,
  getCollectionForPayment,
  getPaymentOrderDetail,
  createPaymentOrder,
  getCollectionMessageLogs,
  createCollectionMessageLog,
  getCollectionPaymentLink,
  getCollectionAssignees,
  assignMembersToCollection,
  removeMembersFromCollection,
  getCollectionActivityLogs,
  getCollectorCollectionActivityLogs,
};
