/* eslint-disable prefer-const */
import _ from 'lodash';
import mime from 'mime-types';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { parseMoney } from '@services/collection/util';
import * as SubscriptionEvents from './subscriptions.events';
import * as TaskEvents from './task.events';
import * as NotificationEvents from './notification.events';
import * as EventManagerHelper from './event-manager.helper';

import {
  AttendanceStore,
  CollectionStore,
  CompanyStore,
  ContactStore,
  createLoaders,
  EventManagerStore,
  WorkspaceStore,
} from '@data-access';
import {
  ContactGroupModel,
  ContactId,
  ContactModel,
  ContactPicModel,
  ContactPublicId,
} from '@models/contact.model';
import { UserId, UserModel } from '@models/user.model';
import { ShortUrlModel } from '@models/url.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
  CompanyPublicId,
  CompanyServiceHistoryId,
  CompanyServiceHistoryModel,
  CompanyTeamModel,
  CompanyTeamStatusModel,
} from '@models/company.model';
import {
  CollectorMemberModel,
  CollectorModel,
  CollectorPublicId,
} from '@models/collector.model';
import {
  CompanyMemberNotifyEventManagerModel,
  EventCollectionPayload,
} from '@models/event-manager.model';
import {
  CollectionId,
  CollectionModel,
  CollectionPaymentModel,
  CollectionPeriodId,
  CollectionPeriodModel,
  UpdateCollectionPayload,
} from '@models/collection.model';
import dayjs from 'dayjs';
import {
  NOTIFICATION_TYPES as TYPES,
  NOTIFICATION_TEMPLATE_TYPES,
} from '@services/notification/constant';
import s3 from '@tools/s3';
import { MessageServiceModel } from '@models/notification.model';
import {
  memberTypes,
  SERVICE_STATUS,
  SERVICE_TYPES,
} from '@services/company/constant';
import {
  AffectedRowsResult,
  TaskAttachmentModel,
  TaskBoardModel,
  TaskMemberModel,
  TaskModel,
  TaskPicModel,
} from '@models/task.model';
import { AUDIT_LOG_TYPES } from '@data-access/contact/utils';
import {
  UpdateContactInput,
  UpdateContactPicInput,
} from '@generated/graphql-types';

import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CompleteSenangPayTransactionPayload } from '@models/senangpay.model';
import {
  CollectionService,
  CompanyService,
  ContactService,
  EmailService,
  MessagingService,
  SubscriptionService,
  TimesheetService,
  UrlService,
  UserService,
  MobileService,
} from '@services';
import { CompanySubscriptionModel } from '@models/subscription.model';
import { EmailAttachmentModel } from '@models/email.model';
import {
  TimesheetActivityModel,
  TimesheetModel,
  ActivityTrackerWeeklyModel,
  ActivityTrackerMonthlyModel,
  ActivityTrackerDailyModel,
  TimeTrackedModel,
  TimeTrackedWeeklyPayload,
} from '@models/timesheet.model';
import {
  createEmailOption,
  currentDay,
  getReminderType,
} from './event-manager.helper';
import { AttendanceModel } from '@models/attendance.model';
import logger from '@tools/logger';
import { COLLECTION_TYPES } from '@services/collection/collection.constant';
import { TableNames } from '@db-tables';
import { SigningWorkflowsModel } from '@models/dedoco.model';
import slack from '@tools/slack';
import { QuotaType } from '@services/subscription/subscription-new.service';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(tz);
dayjs.extend(updateLocale);
dayjs.extend(weekday);
dayjs.extend(isoWeek);

export enum LogEventsProjectActionTypes {
  PROJECT_INVOICE_CREATED = 1,
  PROJECT_INVOICE_DELETED = 2,
  PROJECT_INVOICE_EDITED = 3,
  PROJECT_INVOICE_SENT = 4,
  PROJECT_CLAIM_CREATED = 5,
  PROJECT_CLAIM_DELETED = 6,
  PROJECT_CLAIM_EDITED = 7,
  PROJECT_CLAIM_APPROVED = 8,
  PROJECT_CLAIM_REJECTED = 9,
  PROJECT_TIME_COST_CREATED = 10,
  PROJECT_TIME_COST_DELETED = 11,
  PROJECT_TIME_COST_EDITED = 12,
}

export enum LogEventsProjectBillingTypes {
  PROJECT_INVOICES = 1,
  PROJECT_CLAIMS = 2,
  PROJECT_TIME_COSTS = 3,
}

type LogEventsProjectBillingInput = {
  actionType: LogEventsProjectActionTypes;
  billingType: LogEventsProjectBillingTypes;
  note?: string;
  memberId?: CompanyMemberId;
  name: string; //Task name, invoice name, or member name
  createdBy: UserId;
  data?: string;
};

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];

const handleCollectionReminderEvent = async ({
  data,
  overdue,
  isResend,
  isCreate,
}: {
  data: EventCollectionPayload;
  overdue: boolean;
  isResend: boolean;
  isCreate: boolean;
}): Promise<void> => {
  const loaders = createLoaders();
  try {
    const notifyPics =
      typeof data?.notify_pics === 'string'
        ? JSON.parse(data.notify_pics)
        : data.notify_pics || [];
    const totalDue = parseMoney(_.get(data, 'total_due', 0));
    const contact = (await loaders.contacts.load(
      data?.contact_id,
    )) as ContactModel;
    const company = (await loaders.companies.load(
      data?.company_id,
    )) as CompanyModel;
    const collection = (await loaders.collections.load(
      data?.id,
    )) as CollectionModel;
    const user = (await loaders.users.load(data.created_by)) as UserModel;
    const collector = (await loaders.collectors.load(
      contact.id,
    )) as CollectorModel;

    if (!collector) {
      return slack.postToDevLog(
        'handleCollectionReminderEvent, collector not found',
        data,
      );
    }

    const companyLogoUrl = company.logo_url;
    const link = await getCollectionLink({
      collection,
      collector,
      contact,
      company,
    });

    const period = await getPeriodDuration({
      remindType: data.remind_type,
      periodIds: data.period_ids,
    });

    if (!period || !link) {
      const failed = period ? link : period;
      const failedText = period ? 'link' : 'period';

      slack.postToDevLog(
        `handleCollectionReminderEvent failed, ${failedText} not found`,
        failed,
      );

      return;
    }

    const constants = await getCollectionConstants({
      isResend,
      isCreate,
      overdue,
      paymentType: data?.payment_type,
      data,
      company,
    });

    if (!constants?.templateId || !constants.type || !constants.message) {
      return;
    }

    let companySubscription = (await CompanyService.getCompanySubscription(
      company.id,
    )) as CompanySubscriptionModel;

    if (!companySubscription) {
      if (isResend || isCreate) {
        throw new Error(
          'Your current subscription plans may have expired or you may not possess the relevant plan to perform this service.',
        );
      } else {
        return;
      }
    }

    if (notifyPics?.length === 0) {
      return;
    }

    const pics = (await getPicsToNotify(notifyPics)) as ContactPicModel[];

    if (_.isEmpty(pics) || pics.some((p) => p === undefined)) {
      return Promise.resolve();
    }

    const attachments = (await getAttachments({
      fileName: data?.file_name,
      invoice: data?.invoice,
    })) as EmailAttachmentModel[];

    const amount = parseMoney(data.payable_amount);
    let dueType = '';
    if (data.is_on_due) {
      dueType = 'due today';
    } else if (data.is_overdue) {
      dueType = 'overdue';
    }
    const picContacts = _.filter(pics, (p) => !p.deleted_at);
    const picContactNumbers = _.uniqBy(picContacts, (p) => p.contact_no);

    let picUsers: UserModel[] = [];

    await Promise.all(
      _.map(pics, async ({ contact_id, name, user_id }) => {
        if (!contact_id) return;
        const users = (await processSendEmailToPic({
          data,
          companySubscription,
          templateId: constants?.templateId,
          totalDue,
          link,
          period,
          attachments,
          contact_id,
          picName: name,
          user_id,
          companyLogoUrl,
          isResend,
          isCreate,
        })) as (UserModel | void)[];

        if (users) {
          // To send in-app notifications to all users who have duplicate accounts
          users.forEach((user) => {
            if (user) {
              picUsers.push(user);
            }
          });
        }
      }),
    );

    await Promise.all(
      picUsers.map(async (pu) => {
        if (process.env.NOTIFICATION_FEATURE) {
          const collectionTemplate = () => {
            if ((isResend && !overdue) || isCreate) {
              return NOTIFICATION_TEMPLATE_TYPES.COLLECTION_CREATED;
            } else if (!isResend && overdue) {
              if (data?.payment_type) {
                return NOTIFICATION_TEMPLATE_TYPES.COLLECTION_OVERDUE_SP;
              } else {
                return NOTIFICATION_TEMPLATE_TYPES.COLLECTION_OVERDUE;
              }
            } else {
              if (data?.payment_type) {
                return NOTIFICATION_TEMPLATE_TYPES.COLLECTION_DUE_SP;
              } else {
                return NOTIFICATION_TEMPLATE_TYPES.COLLECTION_DUE;
              }
            }
          };

          await NotificationEvents.createCollectionReminderNotification({
            collectionId: data?.id,
            companyId: company?.id,
            templateType: collectionTemplate(),
            recipientId: pu?.id,
            amount: totalDue,
            dueDate: data?.due_date,
          });
        }
      }),
    );

    await Promise.all(
      _.map(picContactNumbers, async ({ contact_no: num, name: picName }) => {
        if (data.whatsapp_notify) {
          let isMessageSent;

          if (!num) {
            return;
          }

          const isProduction = process.env.GK_ENVIRONMENT === 'production';
          const isSandbox = process.env.GK_ENVIRONMENT === 'sandbox';
          if (isProduction) {
            isMessageSent = await processSendMessage({
              isCreate,
              isResend,
              picName,
              data,
              dueType,
              amount,
              link,
              period,
              num,
              companySubscription,
              messageType: 'whatsapp',
            });
          } else if (isSandbox) {
            const allowedNumbers = [
              '+60143524874',
              '+601111686001',
              '+60169286706',
              '+60173161261',
              '+60176047707',
            ];
            if (allowedNumbers.includes(num)) {
              isMessageSent = await processSendMessage({
                isCreate,
                isResend,
                picName,
                data,
                dueType,
                amount,
                link,
                period,
                num,
                companySubscription,
                messageType: 'whatsapp',
              });
            } else {
              isMessageSent = true;
            }
          } else {
            isMessageSent = true;
          }
        }
      }),
    );

    if (isCreate)
      await logCollectionCreateDelete({
        collections: [collection],
        updatedBy: user,
        changedValue: { is_create: true, collection: true },
      });

    return Promise.resolve();
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleCollectionReminderEvent.name,
        data,
        overdue,
        isResend,
        isCreate,
      },
      sendToSlack: true,
    });
  }
};

const logCollectionCreateDelete = async ({
  collections,
  updatedBy,
  changedValue,
}: {
  collections: CollectionModel[];
  updatedBy: UserModel;
  changedValue: { is_create: boolean; collection: boolean };
}): Promise<void | Error> => {
  try {
    const loaders = createLoaders();

    await Promise.all(
      _.map(collections, async (c) => {
        const collector = (await loaders.collectors.load(
          c.contact_id,
        )) as CollectorModel;

        await ContactService.createAuditLog({
          action: changedValue.is_create
            ? AUDIT_LOG_TYPES.ACTION.CREATE
            : AUDIT_LOG_TYPES.ACTION.DELETE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: TableNames.COLLECTIONS,
          table_row_id: c?.id,
          current_values: JSON.stringify({
            ...c,
            contact_id: null,
            id: c.id_text,
            created_by: null,
            collector_id: collector.id_text,
            created_by_name: updatedBy?.name || updatedBy?.email,
            created_by_id: updatedBy?.id_text,
          }),
          changed_values: JSON.stringify(changedValue),
        });
      }),
    );

    return;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logCollectionCreateDelete.name,
        collections,
        updatedBy,
        changedValue,
      },
      sendToSlack: true,
    });
  }
};

const processSendMessage = async (input: {
  isCreate: boolean;
  isResend: boolean;
  picName: string;
  data: EventCollectionPayload;
  dueType: string;
  amount: string;
  period: string;
  link: string;
  num: string;
  companySubscription: CompanySubscriptionModel;
  messageType: string;
}): Promise<boolean | void> => {
  const {
    isCreate,
    isResend,
    picName,
    data,
    dueType,
    amount,
    period,
    link,
    num,
    companySubscription,
    messageType,
  } = input;
  try {
    if (!num) {
      return;
    }

    const message = isCreate
      ? await MessagingService.createCollectionCreatedMessage(messageType, {
          picName,
          companyName: data?.company_name,
          dueType,
          title: data?.title,
          refNo: data?.ref_no,
          amount,
          period,
          link,
          paymentType: data?.payment_type ? true : false,
        })
      : await MessagingService.createCollectionReminderMessage(
          data?.payment_type,
          messageType,
          {
            picName,
            companyName: data?.company_name,
            dueType,
            title: data?.title,
            refNo: data?.ref_no,
            amount,
            period,
            link,
            date: dayjs(data.due_date).format('LL'),
          },
        );

    const history = (await CompanyService.createCompanyServiceHistory({
      companyId: data?.company_id,
      collectionId: data?.id,
      type: SERVICE_TYPES.WHATSAPP,
      status: 1,
      to: num,
      data,
    })) as CompanyServiceHistoryModel;

    if (messageType !== 'sms') {
      if (data.whatsapp_notify && companySubscription.whatsApp_quota === 0)
        return false;
      let sendWhatsApp = { errorCode: 0 };

      if (companySubscription.whatsApp_quota > 0) {
        sendWhatsApp = (await MessagingService.sendWhatsapp({
          body: message,
          to: num,
        })) as MessageInstance;
      }

      if (!sendWhatsApp?.errorCode) {
        await CompanyService.updateCompanyServiceHistory({
          historyId: history.id,
          status: SERVICE_STATUS.SENT.value,
        });

        await CompanyService.upsertCompanyQuotaUsage({
          services: { whatsapp: true },
          companyId: data?.company_id,
          interval: companySubscription?.interval,
        });

        const sub = (await SubscriptionService.decrementQuotaByOne({
          subscriptionId: companySubscription.id,
          services: { whatsapp: true },
        })) as CompanySubscriptionModel;

        if (sub) {
          await CollectionService.createCollectionMessageLog({
            collection_id: data?.collection_id,
            type: SERVICE_TYPES.WHATSAPP,
            phone: num,
            status: 1,
          });
          logger.quotaLogger.log('info', 'decrementWhatsAppQuota', {
            sub: {
              company_id: sub?.company_id,
              id: sub?.id,
              whatsApp_quota: sub?.whatsApp_quota,
              email_quota: sub?.email_quota,
              updated_at: sub?.updated_at,
            },
            collection_id: data?.collection_id,
            info: {
              phone: num,
              reminderType: await getReminderType({ isCreate, isResend }),
            },
          });
        }

        return true;
      } else {
        await CompanyService.updateCompanyServiceHistory({
          historyId: history.id,
          status: SERVICE_STATUS.FAILED.value,
        });

        await CollectionService.createCollectionMessageLog({
          collection_id: data?.collection_id,
          type: SERVICE_TYPES.WHATSAPP,
          phone: num,
          status: 2,
        });

        return false;
      }
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: processSendMessage.name,
        input,
      },
      sendToSlack: true,
    });

    const existingHistory = await CompanyService.checkCompanyServiceHistory({
      collectionId: data?.collection_id,
      type: SERVICE_TYPES.WHATSAPP,
    });
    const isError = existingHistory instanceof Error;

    if (!isError) {
      await CompanyService.updateCompanyServiceHistory({
        historyId: existingHistory.id,
        status: SERVICE_STATUS.FAILED.value,
      });

      await CollectionService.createCollectionMessageLog({
        collection_id: data?.collection_id,
        type: SERVICE_TYPES.WHATSAPP,
        phone: num,
        status: 2,
      });
    }

    return false;
  }
};

const processSendEmailToPic = async (input: {
  data: EventCollectionPayload;
  isResend: boolean;
  isCreate: boolean;
  companySubscription: CompanySubscriptionModel;
  templateId: string;
  totalDue: string;
  period: string;
  link: string;
  attachments: EmailAttachmentModel[];
  contact_id: ContactId;
  picName: string;
  user_id: UserId;
  companyLogoUrl: string;
}): Promise<UserModel[] | Error | void> => {
  const loaders = createLoaders();
  const {
    data,
    isResend,
    isCreate,
    companySubscription,
    templateId,
    totalDue,
    period,
    link,
    attachments,
    contact_id,
    picName,
    user_id,
    companyLogoUrl,
  } = input;
  try {
    if (!contact_id) return;
    const { email } = (await loaders.users.load(user_id)) as UserModel;

    if (!email || _.isEmpty(email)) {
      return;
    }

    if (data.email_notify && companySubscription.email_quota === 0) {
      return;
    }

    // To send in-app notifications to all users who have duplicate accounts
    const users = (await UserService.getDuplicateUsersByEmail(
      email,
    )) as UserModel[];

    const userTimezone = await UserService.getUserDefaultTimezone(user_id);

    if (data.email_notify) {
      const to = JSON.stringify([{ email, name: picName }]);
      const option = await createEmailOption({
        email,
        templateId,
        receiverName: picName,
        refNo: data?.ref_no,
        companyName: data?.company_name,
        title: data?.title,
        dueDate: dayjs(data?.due_date)
          .tz(userTimezone)
          .format('YYYY-MM-DD HH:mm:ss'),
        totalDue,
        period,
        link,
        attachments,
        collectionType: data?.remind_type == 1 ? 'one-off' : 'instalment',
        companyLogoUrl,
      });

      const historyId = await updateEmailNotificationStatus({
        data: {
          collectionId: data?.id,
          companyId: data?.company_id,
          template_id: templateId,
        },
        to,
      });

      if (option) {
        let isEmailSent = false;
        if (companySubscription.email_quota > 0) {
          isEmailSent = await EmailService.sendEmail(option);
        }

        if (isEmailSent) {
          await CompanyService.updateCompanyServiceHistory({
            historyId: historyId as number,
            status: SERVICE_STATUS.SENT.value,
          });

          await CompanyService.upsertCompanyQuotaUsage({
            services: { email: true },
            companyId: data?.company_id,
            interval: companySubscription?.interval,
          });

          const sub = (await SubscriptionService.decrementQuotaByOne({
            subscriptionId: companySubscription.id,
            services: { email: true },
          })) as CompanySubscriptionModel;

          if (sub) {
            await CollectionService.createCollectionMessageLog({
              collection_id: data?.collection_id,
              type: SERVICE_TYPES.EMAIL,
              email_address: email,
              status: 1,
            });
            logger.quotaLogger.log('info', 'decrementEmailQuota', {
              sub: {
                company_id: sub?.company_id,
                id: sub?.id,
                whatsApp_quota: sub?.whatsApp_quota,
                email_quota: sub?.email_quota,
                updated_at: sub?.updated_at,
              },
              collection_id: data?.collection_id,
              info: {
                email,
                reminderType: await getReminderType({ isCreate, isResend }),
              },
            });
          }
        } else {
          await CompanyService.updateCompanyServiceHistory({
            historyId: historyId as number,
            status: SERVICE_STATUS.FAILED.value,
          });

          await CollectionService.createCollectionMessageLog({
            collection_id: data?.collection_id,
            type: SERVICE_TYPES.EMAIL,
            email_address: email,
            status: 2,
          });
        }
      }
    }

    return users;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: processSendEmailToPic.name,
        input,
      },
      sendToSlack: true,
    });
    if (!contact_id) return;
    const { email } = (await loaders.users.load(user_id)) as UserModel;

    if (data?.email_notify) {
      const to = JSON.stringify([{ email, name: picName }]);
      const historyId = await updateEmailNotificationStatus({
        data: {
          collectionId: data?.id,
          companyId: data?.company_id,
          template_id: templateId,
        },
        to,
      });

      if (typeof historyId === 'number') {
        await CompanyService.updateCompanyServiceHistory({
          historyId: historyId,
          status: SERVICE_STATUS.FAILED.value,
        });

        await CollectionService.createCollectionMessageLog({
          collection_id: data?.collection_id,
          type: SERVICE_TYPES.EMAIL,
          email_address: email,
          status: 2,
        });
      }
    }
  }
};

const logTaskCreateDelete = async (input: {
  tasks: TaskModel[];
  updatedBy: UserModel;
  changedValue: { is_create: boolean; task: boolean; project_task: boolean };
}): Promise<void | Error> => {
  const { tasks, updatedBy, changedValue } = input;
  try {
    const loaders = createLoaders();

    await Promise.all(
      _.map(tasks, async (t) => {
        const taskBoard = (await loaders.taskBoards.load(
          t.job_id,
        )) as TaskBoardModel;
        let contact_name = '';
        let contact_id = null;
        if (taskBoard.contact_id) {
          const contact = (await loaders.contacts.load(
            taskBoard.contact_id,
          )) as ContactModel;
          contact_name = contact.name;
          contact_id = contact.id;
        }
        await ContactService.createAuditLog({
          action: changedValue.is_create
            ? AUDIT_LOG_TYPES.ACTION.CREATE
            : AUDIT_LOG_TYPES.ACTION.DELETE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: TableNames.TASKS,
          table_row_id: t?.id,
          current_values: JSON.stringify({
            ...t,
            sub_status_id: null,
            id: t.id_text,
            created_by: null,
            job_id: taskBoard.id_text,
            created_by_name: updatedBy?.name || updatedBy?.email,
            created_by_id: updatedBy?.id_text,
            task_board_name: taskBoard.name,
            task_board_id: taskBoard.id_text,
            task_board_type: taskBoard?.type,
            task_board_category: taskBoard?.category,
            contact_name,
            contact_id,
          }),
          changed_values: JSON.stringify(changedValue),
        });
      }),
    );

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logTaskCreateDelete.name,
        input,
      },
      sendToSlack: true,
    });
  }
};
const logContactCreate = async (input: {
  contact: ContactModel;
  updatedBy: UserModel;
  changedValue: { is_create: boolean; contact: boolean };
}): Promise<void | Error> => {
  const { contact, updatedBy, changedValue } = input;
  try {
    const loaders = createLoaders();

    const dealCreatorUser = (await loaders.users.load(
      contact.deal_creator,
    )) as UserModel;
    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.CREATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.CONTACTS,
      table_row_id: contact?.id,
      current_values: JSON.stringify({
        ...contact,
        deal_creator: dealCreatorUser?.id_text,
        company_id: null,
        id: contact.id_text,
        created_by: null,
        created_by_name: updatedBy?.name || updatedBy?.email,
        created_by_id: updatedBy?.id_text,
        contact_id: contact.id,
        updated_by: updatedBy?.id_text,
      }),
      changed_values: JSON.stringify(changedValue),
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logContactCreate.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const getCollectionConstants = async (input: {
  paymentType: number;
  overdue: boolean;
  isResend: boolean;
  isCreate: boolean;
  data: EventCollectionPayload;
  company: CompanyModel;
}): Promise<{ type: string; templateId: string; message: string } | void> => {
  const { paymentType, overdue, isResend, isCreate, data, company } = input;
  try {
    let type = paymentType
      ? TYPES.COLLECTION_DUE_SP.value
      : TYPES.COLLECTION_DUE.value;
    let templateId = paymentType
      ? TYPES.COLLECTION_DUE_SP.template
      : TYPES.COLLECTION_DUE.template;
    let message = paymentType
      ? await TYPES.COLLECTION_DUE_SP.toMessage(data)
      : await TYPES.COLLECTION_DUE.toMessage(data);
    if (isResend && !overdue) {
      type = TYPES.COLLECTION_CREATED.value;
      templateId = TYPES.COLLECTION_CREATED.template;
      message = await TYPES.COLLECTION_CREATED.toMessage({
        companyName: company.name,
        collection: {
          title: data.title,
          payable_amount: data.payable_amount,
        },
      });
    } else if (!isResend && overdue) {
      type = TYPES.COLLECTION_OVERDUE.value;
      templateId = TYPES.COLLECTION_OVERDUE.template;
      message = await TYPES.COLLECTION_OVERDUE.toMessage(data);

      if (paymentType == 1) {
        type = TYPES.COLLECTION_OVERDUE_SP.value;
        templateId = TYPES.COLLECTION_OVERDUE_SP.template;
        message = await TYPES.COLLECTION_OVERDUE_SP.toMessage(data);
      }
    } else if (isCreate) {
      type = TYPES.COLLECTION_CREATED.value;
      templateId = TYPES.COLLECTION_CREATED.template;
      message = await TYPES.COLLECTION_CREATED.toMessage({
        companyName: company.name,
        collection: {
          title: data.title,
          payable_amount: data.payable_amount,
        },
      });
    }

    return Promise.resolve({ type, templateId, message });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getCollectionConstants.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logContactPicCreateDelete = async (input: {
  contactPics: ContactPicModel[];
  contact: ContactModel;
  changedValue: { is_create: boolean; contact_pic: true };
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { contactPics, contact, changedValue, updatedBy } = input;
  try {
    await Promise.all(
      _.map(contactPics, async (cp) => {
        await ContactService.createAuditLog({
          action: changedValue.is_create
            ? AUDIT_LOG_TYPES.ACTION.CREATE
            : AUDIT_LOG_TYPES.ACTION.DELETE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy.id,
          table_name: TableNames.CONTACT_PICS,
          table_row_id: cp?.id,
          current_values: JSON.stringify({
            ...cp,
            id: contact.id_text,
            pic_id: cp.id_text,
            name: cp.name,
            contact_id: cp.contact_id,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
          }),
          changed_values: JSON.stringify(changedValue),
        });
      }),
    );

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logContactPicCreateDelete.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logContactMovedGroup = async (input: {
  group: ContactGroupModel | null;
  updatedBy: UserModel;
  changedValue: { contact_group: boolean };
}): Promise<void | Error> => {
  const { group, updatedBy, changedValue } = input;
  try {
    if (!group) return;

    const contactGroupName = _.get(group, 'name');

    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.CONTACT_GROUPS,
      table_row_id: group?.id,
      current_values: JSON.stringify({ contact_group_name: contactGroupName }),
      changed_values: JSON.stringify(changedValue),
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logContactMovedGroup.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logUpdatedTaskDueDate = async (input: {
  task: TaskModel;
  updatedTask: TaskModel;
  updatedBy: UserModel;
  taskBoard: TaskBoardModel;
}): Promise<void | Error> => {
  const { task, updatedTask, updatedBy, taskBoard } = input;
  try {
    let contact_id = taskBoard?.contact_id;

    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.TASKS,
      table_row_id: task?.id,
      current_values: JSON.stringify({
        ...updatedTask,
        id: updatedTask.id_text,
        task_board_id: taskBoard.id_text,
        task_board_category: taskBoard?.category,
        contact_id,
        job_id: '',
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      previous_values: JSON.stringify({
        ...task,
        id: task.id,
        task_board_id: taskBoard.id_text,
        task_board_category: taskBoard?.category,
        contact_id,
        job_id: '',
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      changed_values: JSON.stringify({
        due_date: true,
        task: taskBoard?.category ? false : true,
        project_task: taskBoard?.category ? true : false,
      }),
    });
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logUpdatedTaskDueDate.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logUpdatedTaskProjectDueDate = async (input: {
  task: TaskModel;
  updatedTask: TaskModel;
  updatedBy: UserModel;
  taskBoard: TaskBoardModel;
}): Promise<void | Error> => {
  const { task, updatedTask, updatedBy, taskBoard } = input;
  try {
    const changedValues = {
      start_date:
        (task?.start_date || '').toString() ===
        (updatedTask?.start_date || '').toString()
          ? false
          : true,
      end_date:
        (task?.end_date || '').toString() ===
        (updatedTask?.end_date || '').toString()
          ? false
          : true,
    };

    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.TASKS,
      table_row_id: task?.id,
      current_values: JSON.stringify({
        ...updatedTask,
        id: updatedTask?.id_text,
        task_board_id: taskBoard.id_text,
        job_id: '',
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      previous_values: JSON.stringify({
        ...task,
        id: task?.id_text,
        task_board_id: taskBoard?.id_text,
        job_id: '',
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      changed_values: JSON.stringify({
        ...changedValues,
        task: taskBoard?.category ? false : true,
        project_task: taskBoard?.category ? true : false,
      }),
    });
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logUpdatedTaskProjectDueDate.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logUpdatedCollectionDueDate = async (input: {
  collection: CollectionModel;
  updatedCollection: CollectionModel;
  collector: CollectorModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { collection, updatedCollection, collector, updatedBy } = input;
  try {
    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.COLLECTIONS,
      table_row_id: collection?.id,
      current_values: JSON.stringify({
        ...updatedCollection,
        id: updatedCollection.id_text,
        created_by: null,
        contact_id: collection.contact_id,
        collector_id: collector.id_text,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      previous_values: JSON.stringify({
        ...collection,
        id: collection.id_text,
        created_by: null,
        contact_id: collection.contact_id,
        collector_id: collector.id_text,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      changed_values: JSON.stringify({
        due_date: true,
        collection: true,
      }),
    });
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logUpdatedCollectionDueDate.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logUpdatedTaskCompanyTeamStatus = async (input: {
  companyTeamStatus: CompanyTeamStatusModel;
  updatedCompanyTeamStatus: CompanyTeamStatusModel;
  taskBoard: TaskBoardModel;
  task: TaskModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const {
    companyTeamStatus,
    updatedCompanyTeamStatus,
    taskBoard,
    task,
    updatedBy,
  } = input;
  try {
    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.TASK_STATUSES,
      table_row_id: companyTeamStatus?.id,
      previous_values: JSON.stringify({
        ...companyTeamStatus,
        id: companyTeamStatus.id_text,
        team_id: '',
        contact_id: taskBoard?.contact_id,
        created_by: null,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
        name: task.name,
        task_id: task.id_text,
        task_board_name: taskBoard.name,
        task_board_category: taskBoard?.category,
        task_board_id: taskBoard.id_text,
        task_board_type: taskBoard?.type,
      }),
      current_values: JSON.stringify({
        ...updatedCompanyTeamStatus,
        id: updatedCompanyTeamStatus.id_text,
        team_id: '',
        created_by: null,
        contact_id: taskBoard?.contact_id,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
        task_board_category: taskBoard?.category,
        name: task.name,
        task_id: task.id_text,
        task_board_name: taskBoard.name,
        task_board_id: taskBoard.id_text,
        task_board_type: taskBoard?.type,
      }),
      changed_values: JSON.stringify({
        company_team_status: true,
        task: taskBoard?.category ? false : true,
        project_task: taskBoard?.category ? true : false,
      }),
    });
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logUpdatedTaskCompanyTeamStatus.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logUpdatedCollectionMisc = async (input: {
  payload: UpdateCollectionPayload;
  collection: CollectionModel;
  collector: CollectorModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { payload, collection, collector, updatedBy } = input;
  try {
    if (!payload.title) return;
    if (!payload.ref_no) return;

    if (payload.title !== collection.title) {
      await ContactService.createAuditLog({
        action: AUDIT_LOG_TYPES.ACTION.UPDATE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: updatedBy?.id,
        table_name: TableNames.COLLECTIONS,
        table_row_id: collection?.id,
        current_values: JSON.stringify({
          ...payload,
          id: collection.id_text,
          contact_id: collection.contact_id,
          updated_by_name: updatedBy?.name || updatedBy?.email,
          updated_by_id: updatedBy?.id_text,
          collector_id: collector.id_text,
        }),
        previous_values: JSON.stringify({
          ...collection,
          id: collection.id_text,
          contact_id: collection.contact_id,
          updated_by_name: updatedBy?.name || updatedBy?.email,
          updated_by_id: updatedBy?.id_text,
          collector_id: collector.id_text,
        }),
        changed_values: JSON.stringify({ title: true, collection: true }),
      });
    }

    if (payload.ref_no !== collection.ref_no) {
      await ContactService.createAuditLog({
        action: AUDIT_LOG_TYPES.ACTION.UPDATE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: updatedBy?.id,
        table_name: TableNames.COLLECTIONS,
        table_row_id: collection?.id,
        current_values: JSON.stringify({
          ...payload,
          id: collection.id_text,
          contact_id: collection.contact_id,
          updated_by_name: updatedBy?.name || updatedBy?.email,
          updated_by_id: updatedBy?.id_text,
          collector_id: collector.id_text,
        }),
        previous_values: JSON.stringify({
          ...collection,
          id: collection.id_text,
          contact_id: collection.contact_id,
          updated_by_name: updatedBy?.name || updatedBy?.email,
          updated_by_id: updatedBy?.id_text,
          collector_id: collector.id_text,
        }),
        changed_values: JSON.stringify({ ref_no: true, collection: true }),
      });
    }

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logUpdatedCollectionMisc.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logUpdatedContactMisc = async (input: {
  payload: UpdateContactInput;
  contact: ContactModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { payload, contact, updatedBy } = input;
  try {
    let changedValue = {
      name: false,
      type: false,
      address: false,
      contact: true,
    };

    let currentValue = {
      name: '',
      type: '',
      address: '',
      id: contact.id_text,
      contact_id: contact.id,
      updated_by_name: updatedBy?.name || updatedBy?.email,
      updated_by_id: updatedBy?.id_text,
    };

    let previousValue = {
      name: '',
      type: '',
      address: '',
      id: contact.id_text,
      contact_id: contact.id,
      updated_by_name: updatedBy?.name || updatedBy?.email,
      updated_by_id: updatedBy?.id_text,
    };

    if (payload.name !== contact.name) {
      changedValue = {
        ...changedValue,
        name: true,
      };

      currentValue = {
        ...currentValue,
        name: payload?.name,
      };

      previousValue = {
        ...previousValue,
        name: contact?.name,
      };
    }

    if (payload.type !== contact.type) {
      changedValue = {
        ...changedValue,
        type: true,
      };
      currentValue = {
        ...currentValue,
        name: payload?.name,
        type: payload?.type == 1 ? 'PERSONAL' : 'COMPANY',
      };

      previousValue = {
        ...previousValue,
        name: contact?.name,
        type: contact?.type == 1 ? 'PERSONAL' : 'COMPANY',
      };
    }

    if (payload.address !== contact.address) {
      changedValue = {
        ...changedValue,
        address: true,
      };
      currentValue = {
        ...currentValue,
        name: payload?.name,
        address: payload?.address as string,
      };

      previousValue = {
        ...previousValue,
        name: contact?.name,
        address: contact?.address,
      };
    }

    if (payload.name !== contact.name) {
      await ContactService.createAuditLog({
        action: AUDIT_LOG_TYPES.ACTION.UPDATE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: updatedBy?.id,
        table_name: TableNames.CONTACTS,
        table_row_id: contact?.id,
        current_values: JSON.stringify(currentValue),
        previous_values: JSON.stringify(previousValue),
        changed_values: JSON.stringify({ contact: true, name: true }),
      });
    }

    if (payload.type !== contact.type) {
      await ContactService.createAuditLog({
        action: AUDIT_LOG_TYPES.ACTION.UPDATE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: updatedBy?.id,
        table_name: TableNames.CONTACTS,
        table_row_id: contact?.id,
        current_values: JSON.stringify(currentValue),
        previous_values: JSON.stringify(previousValue),
        changed_values: JSON.stringify({ contact: true, type: true }),
      });
    }

    if (!_.isEmpty(payload.address) && payload.address !== contact.address) {
      await ContactService.createAuditLog({
        action: AUDIT_LOG_TYPES.ACTION.UPDATE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: updatedBy?.id,
        table_name: TableNames.CONTACTS,
        table_row_id: contact?.id,
        current_values: JSON.stringify(currentValue),
        previous_values: JSON.stringify(previousValue),
        changed_values: JSON.stringify({ contact: true, address: true }),
      });
    }

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logUpdatedContactMisc.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logUpdatedContactPicMisc = async (input: {
  payload: UpdateContactPicInput;
  contactPic: ContactPicModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { payload, contactPic, updatedBy } = input;
  try {
    const loaders = createLoaders();

    const contact = (await loaders.contacts.load(
      contactPic.contact_id,
    )) as ContactModel;

    let changedValue = {};
    let currentValue = {};
    let previousValue = {};

    if (payload.name !== contactPic?.name) {
      changedValue = {
        contact_pic_name: true,
      };
      currentValue = {
        ...currentValue,
        contact_pic_name: payload?.name,
      };
      previousValue = {
        ...previousValue,
        contact_pic_name: contactPic?.name,
      };
    }

    if (payload.contact_no !== contactPic?.contact_no) {
      changedValue = {
        ...changedValue,
        contact_no: true,
      };
      currentValue = {
        ...currentValue,
        contact_pic_name: contactPic.name,
        contact_no: payload?.contact_no,
      };

      previousValue = {
        ...previousValue,
        contact_pic_name: contactPic.name,
        contact_no: contactPic?.contact_no,
      };
    }

    previousValue = {
      ...previousValue,
      updated_by_name: updatedBy?.name || updatedBy?.email,
      updated_by_id: updatedBy?.id_text,
      name: contact.name,
      contact_id: contact.id,
      id: contact.id_text,
    };

    currentValue = {
      ...currentValue,
      updated_by_name: updatedBy?.name || updatedBy?.email,
      updated_by_id: updatedBy?.id_text,
      name: contact.name,
      contact_id: contact.id,
      id: contact.id_text,
    };

    changedValue = {
      ...changedValue,
      contact_pic: true,
      contact: true,
    };

    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.CONTACT_PICS,
      table_row_id: contactPic?.id,
      current_values: JSON.stringify(currentValue),
      previous_values: JSON.stringify(previousValue),
      changed_values: JSON.stringify(changedValue),
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logUpdatedContactPicMisc.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logArchiveTask = async (input: {
  tasks: TaskModel[];
  affectedTasksCount: AffectedRowsResult | Error;
  updatedBy: UserModel;
  isArchive: boolean;
}): Promise<void | Error> => {
  const { tasks, affectedTasksCount, updatedBy, isArchive } = input;
  try {
    if (tasks.length !== affectedTasksCount) return;

    const loaders = createLoaders();

    await Promise.all(
      _.map(tasks, async (task) => {
        const taskBoard = (await loaders.taskBoards.load(
          task.job_id,
        )) as TaskBoardModel;
        await ContactService.createAuditLog({
          action: AUDIT_LOG_TYPES.ACTION.UPDATE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: TableNames.TASKS,
          table_row_id: task?.id,
          current_values: JSON.stringify({
            ...task,
            id: task.id_text,
            job_id: null,
            task_board_id: taskBoard.id_text,
            task_board_type: taskBoard?.type,
            created_by: null,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            task_board_category: taskBoard?.category,
            contact_id: taskBoard?.contact_id,
            updated_by_id: updatedBy?.id_text,
          }),
          changed_values: JSON.stringify({
            archive: isArchive,
            task: taskBoard?.category ? false : true,
            project_task: taskBoard?.category ? true : false,
          }),
        });
      }),
    );
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logArchiveTask.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logArchiveCollection = async (input: {
  collections: CollectionModel[];
  affectedCollectionsCount: AffectedRowsResult | Error;
  updatedBy: UserModel;
  isArchive: boolean;
}): Promise<void | Error> => {
  const { collections, affectedCollectionsCount, updatedBy, isArchive } = input;
  try {
    if (collections.length !== affectedCollectionsCount) return;

    const loaders = createLoaders();

    await Promise.all(
      _.map(collections, async (collection) => {
        const collector = (await loaders.collectors.load(
          collection.contact_id,
        )) as CollectorModel;
        await ContactService.createAuditLog({
          action: AUDIT_LOG_TYPES.ACTION.UPDATE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: TableNames.COLLECTIONS,
          table_row_id: collection?.id,
          current_values: JSON.stringify({
            ...collection,
            id: collection.id_text,
            collector_id: collector.id_text,
            contact_id: collection.contact_id,
            created_by: null,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
          }),
          changed_values: JSON.stringify({
            archive: isArchive,
            collection: true,
          }),
        });
      }),
    );
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logArchiveCollection.name,
        input,
      },
      sendToSlack: true,
    });
  }
};
const logPicAddRemoveTask = async (input: {
  updatedPics: ContactPicModel[];
  task: TaskModel;
  taskPics: TaskPicModel[];
  updatedBy: UserModel;
  taskBoard: TaskBoardModel;
  changedValue: { is_create: boolean };
}): Promise<void | Error> => {
  const { updatedPics, task, taskPics, updatedBy, taskBoard, changedValue } =
    input;
  try {
    const loaders = createLoaders();
    const currentPicIds = taskPics.map((p) => p?.contact_id);

    const updatePics = updatedPics.filter(
      (x) => !currentPicIds.includes(x?.id),
    );

    const isProject = taskBoard?.category ? true : false;

    if (changedValue?.is_create) {
      await Promise.all(
        _.map(updatePics, async (p) => {
          await ContactService.createAuditLog({
            action: AUDIT_LOG_TYPES.ACTION.UPDATE,
            source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
            source_id: updatedBy?.id,
            table_name: TableNames.TASK_PICS,
            table_row_id: task?.id,
            current_values: JSON.stringify({
              contact_pic_name: p?.name,
              ...task,
              id: task?.id_text,
              created_by: null,
              updated_by_name: updatedBy?.name || updatedBy?.email,
              updated_by_id: updatedBy?.id_text,
              job_id: null,
              task_board_id: taskBoard?.id_text,
              contact_id: taskBoard?.contact_id,
              task_board_category: taskBoard?.category,
              task_board_type: taskBoard?.type,
            }),
            changed_values: JSON.stringify({
              notify_pics: true,
              task_pic: isProject ? false : true,
              project_task_pic: isProject ? true : false,
              is_create: true,
            }),
          });
        }),
      );
    }

    if (!changedValue?.is_create) {
      await Promise.all(
        _.map(updatePics, async (p) => {
          const user = (await loaders.users.load(p.user_id)) as UserModel;
          await ContactService.createAuditLog({
            action: AUDIT_LOG_TYPES.ACTION.DELETE,
            source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
            source_id: updatedBy?.id,
            table_name: TableNames.TASK_PICS,
            table_row_id: task?.id,
            current_values: JSON.stringify({
              contact_pic_name: p?.name,
              ...task,
              id: task?.id_text,
              created_by: null,
              updated_by_name: updatedBy?.name || updatedBy?.email,
              updated_by_id: updatedBy?.id_text,
              task_board_category: taskBoard?.category,
              job_id: '',
              task_board_id: taskBoard?.id_text,
              contact_id: taskBoard?.contact_id,
              task_board_type: taskBoard?.type,
            }),
            changed_values: JSON.stringify({
              notify_pics: false,
              task_pic: isProject ? false : true,
              project_task_pic: isProject ? true : false,
              is_create: false,
            }),
          });
        }),
      );
    }
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logPicAddRemoveTask.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logPicAddRemoveCollection = async (input: {
  updatedNotifyPics: any[];
  collection: CollectionModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { updatedNotifyPics, collection, updatedBy } = input;
  try {
    const loaders = createLoaders();
    const collector = (await loaders.collectors.load(
      collection.contact_id,
    )) as CollectorModel;
    const pics = _.get(collection, 'notify_pics');
    const currentPicIds = typeof pics === 'string' ? JSON.parse(pics) : pics;
    const removedPicIds = currentPicIds.filter(
      (x: number) => !updatedNotifyPics.includes(x),
    );
    const addedPics = updatedNotifyPics.filter(
      (x: number) => !currentPicIds.includes(x),
    );

    if (!addedPics.length && !removedPicIds.length) return;

    await Promise.all(
      _.map(addedPics, async (p) => {
        const contactPic = (await loaders.contactPics.load(
          p,
        )) as ContactPicModel;
        const user = (await loaders.users.load(
          contactPic.user_id,
        )) as UserModel;
        await ContactService.createAuditLog({
          action: AUDIT_LOG_TYPES.ACTION.UPDATE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: TableNames.COLLECTIONS,
          table_row_id: collection?.id,
          current_values: JSON.stringify({
            contact_pic_name: user?.name,
            ...collection,
            id: collection.id_text,
            contact_id: collection.contact_id,
            collector_id: collector.id_text,
            created_by: null,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
          }),
          changed_values: JSON.stringify({
            notify_pics: true,
            collection_pic: true,
          }),
        });
      }),
    );

    await Promise.all(
      _.map(removedPicIds, async (p) => {
        const contactPic = (await loaders.contactPics.load(
          p,
        )) as ContactPicModel;
        const user = (await loaders.users.load(
          contactPic.user_id,
        )) as UserModel;
        await ContactService.createAuditLog({
          action: AUDIT_LOG_TYPES.ACTION.DELETE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: TableNames.COLLECTIONS,
          table_row_id: collection?.id,
          current_values: JSON.stringify({
            contact_pic_name: user?.name,
            ...collection,
            id: collection.id_text,
            contact_id: collection.contact_id,
            collector_id: collector.id_text,
            created_by: null,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
          }),
          changed_values: JSON.stringify({
            notify_pics: false,
            collection_pic: true,
          }),
        });
      }),
    );

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logPicAddRemoveCollection.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logAssigneeAddRemoveTask = async (input: {
  updatedMemberIds: CompanyMemberId[];
  taskMembers: TaskMemberModel[];
  task: TaskModel;
  updatedBy: UserModel;
  changedValue: { is_create: boolean };
}): Promise<void | Error> => {
  const { updatedMemberIds, taskMembers, task, updatedBy, changedValue } =
    input;
  try {
    const loaders = createLoaders();

    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;

    const currentMemberIds = _.map(taskMembers, (cm) => cm.member_id);

    const memberIds = updatedMemberIds.filter(
      (x: number) => !currentMemberIds.includes(x),
    );
    const isProject = taskBoard?.category ? true : false;

    if (changedValue.is_create && taskBoard.contact_id) {
      await Promise.all(
        _.map(memberIds, async (cm) => {
          const companyMember = (await loaders.companyMembers.load(
            cm,
          )) as CompanyMemberModel;
          const user = (await loaders.users.load(
            companyMember.user_id,
          )) as UserModel;
          await ContactService.createAuditLog({
            action: AUDIT_LOG_TYPES.ACTION.UPDATE,
            source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
            source_id: updatedBy?.id,
            table_name: TableNames.TASK_MEMBERS,
            table_row_id: task?.id,
            current_values: JSON.stringify({
              member_name: user?.name || user?.email,
              ...task,
              id: task.id_text,
              job_id: null,
              team_id: null,
              contact_id: taskBoard?.contact_id,
              task_board_category: taskBoard?.category,
              task_board_type: taskBoard?.type,
              task_board_id: taskBoard.id_text,
              created_by: null,
              updated_by_name: updatedBy?.name || updatedBy?.email,
              updated_by_id: updatedBy?.id_text,
            }),
            changed_values: JSON.stringify({
              task_member: isProject ? false : true,
              project_task_member: isProject ? true : false,
              is_create: true,
            }),
          });
        }),
      );
    }

    if (!changedValue.is_create) {
      await Promise.all(
        _.map(memberIds, async (cm) => {
          const companyMember = (await loaders.companyMembers.load(
            cm,
          )) as CompanyMemberModel;
          const user = (await loaders.users.load(
            companyMember.user_id,
          )) as UserModel;
          await ContactService.createAuditLog({
            action: AUDIT_LOG_TYPES.ACTION.DELETE,
            source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
            source_id: updatedBy?.id,
            table_name: TableNames.TASK_MEMBERS,
            table_row_id: task?.id,
            current_values: JSON.stringify({
              member_name: user?.name || user?.email,
              ...task,
              id: task.id_text,
              job_id: null,
              team_id: null,
              contact_id: taskBoard?.contact_id,
              task_board_category: taskBoard?.category,
              task_board_type: taskBoard?.type,
              task_board_id: taskBoard.id_text,
              created_by: null,
              updated_by_name: updatedBy?.name || updatedBy?.email,
              updated_by_id: updatedBy?.id_text,
            }),
            changed_values: JSON.stringify({
              task_member: isProject ? false : true,
              project_task_member: isProject ? true : false,
              is_create: false,
            }),
          });
        }),
      );
    }

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logAssigneeAddRemoveTask.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logAssigneeAddRemoveCollector = async (input: {
  updatedMemberIds: CompanyMemberId[];
  collector: CollectorModel;
  contact: ContactModel;
  collectorMembers: CollectorMemberModel[];
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { updatedMemberIds, collector, contact, collectorMembers, updatedBy } =
    input;
  try {
    const loaders = createLoaders();

    if (collector.team_id) {
      const team = (await loaders.companyTeams.load(
        collector.team_id,
      )) as CompanyTeamModel;
      await ContactService.createAuditLog({
        action: AUDIT_LOG_TYPES.ACTION.DELETE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: updatedBy?.id,
        table_name: 'collector_members',
        table_row_id: collector?.id,
        previous_values: JSON.stringify({
          team_name: team.title,
          ...collector,
          contact_id: contact.id,
          name: contact.name,
          id: collector.id_text,
          updated_by_name: updatedBy?.name || updatedBy?.email,
          updated_by_id: updatedBy?.id_text,
        }),
        current_values: JSON.stringify({
          team_name: team.title,
          ...collector,
          contact_id: contact.id,
          name: contact.name,
          id: collector.id_text,
          updated_by_name: updatedBy?.name || updatedBy?.email,
          updated_by_id: updatedBy?.id_text,
        }),
        changed_values: JSON.stringify({
          collector_team: true,
        }),
      });
    }

    const currentMemberIds = _.map(collectorMembers, (cm) => cm.member_id);

    const removedMemberIds = currentMemberIds.filter(
      (x: number) => !updatedMemberIds.includes(x),
    );
    const addedMemberIds = updatedMemberIds.filter(
      (x: number) => !currentMemberIds.includes(x),
    );

    if (!addedMemberIds.length && !removedMemberIds.length) return;
    await Promise.all(
      _.map(addedMemberIds, async (cm) => {
        const companyMember = (await loaders.companyMembers.load(
          cm,
        )) as CompanyMemberModel;
        const user = (await loaders.users.load(
          companyMember.user_id,
        )) as UserModel;
        await ContactService.createAuditLog({
          action: AUDIT_LOG_TYPES.ACTION.UPDATE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: 'collector_members',
          table_row_id: collector?.id,
          previous_values: JSON.stringify({
            member_name: user?.name || user?.email,
            ...collector,
            id: collector.id_text,
            contact_id: contact.id,
            name: contact.name,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
          }),
          current_values: JSON.stringify({
            member_name: user?.name || user?.email,
            ...collector,
            id: collector.id_text,
            contact_id: contact.id,
            name: contact.name,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
          }),
          changed_values: JSON.stringify({
            collector_member: true,
          }),
        });
      }),
    );

    await Promise.all(
      _.map(removedMemberIds, async (cm) => {
        const companyMember = (await loaders.companyMembers.load(
          cm,
        )) as CompanyMemberModel;
        const user = (await loaders.users.load(
          companyMember.user_id,
        )) as UserModel;
        await ContactService.createAuditLog({
          action: AUDIT_LOG_TYPES.ACTION.DELETE,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: updatedBy?.id,
          table_name: 'collector_members',
          table_row_id: collector?.id,
          previous_values: JSON.stringify({
            member_name: user?.name || user?.email,
            ...collector,
            id: collector.id_text,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
            contact_id: contact.id,
            name: contact.name,
          }),
          current_values: JSON.stringify({
            member_name: user?.name || user?.email,
            ...collector,
            id: collector.id_text,
            updated_by_name: updatedBy?.name || updatedBy?.email,
            updated_by_id: updatedBy?.id_text,
            contact_id: contact.id,
            name: contact.name,
          }),
          changed_values: JSON.stringify({
            collector_member: true,
          }),
        });
      }),
    );

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logAssigneeAddRemoveCollector.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logTeamAddRemoveCollector = async (input: {
  updatedTeam: CompanyTeamModel;
  collector: CollectorModel;
  collectorMembers: CollectorMemberModel[];
  contact: ContactModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { updatedTeam, collector, collectorMembers, contact, updatedBy } =
    input;
  try {
    const loaders = createLoaders();

    const currentTeamId = _.get(collector, 'team_id', null);

    if (collectorMembers.length > 0) {
      const currentMemberIds = _.map(collectorMembers, (cm) => cm.member_id);

      await Promise.all(
        _.map(currentMemberIds, async (cm) => {
          const companyMember = (await loaders.companyMembers.load(
            cm,
          )) as CompanyMemberModel;
          const user = (await loaders.users.load(
            companyMember.user_id,
          )) as UserModel;
          await ContactService.createAuditLog({
            action: AUDIT_LOG_TYPES.ACTION.DELETE,
            source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
            source_id: updatedBy?.id,
            table_name: 'collector_members',
            table_row_id: collector?.id,
            previous_values: JSON.stringify({
              member_name: user?.name || user?.email,
              ...collector,
              id: collector.id_text,
              updated_by_name: updatedBy?.name || updatedBy?.email,
              updated_by_id: updatedBy?.id_text,
              name: contact.name,
              contact_id: contact.id,
            }),
            current_values: JSON.stringify({
              member_name: user?.name || user?.email,
              ...collector,
              id: collector.id_text,
              updated_by_name: updatedBy?.name || updatedBy?.email,
              updated_by_id: updatedBy?.id_text,
              name: contact.name,
              contact_id: contact.id,
            }),
            changed_values: JSON.stringify({
              collector_member: true,
            }),
          });
        }),
      );
    }

    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: 'collector_members',
      table_row_id: collector?.id,
      current_values: JSON.stringify({
        team_name: updatedTeam.title,
        ...collector,
        id: collector.id_text,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
        name: contact.name,
        contact_id: contact.id,
      }),
      changed_values: JSON.stringify({
        collector_team: true,
      }),
    });

    if (currentTeamId) {
      const team = (await loaders.companyTeams.load(
        currentTeamId,
      )) as CompanyTeamModel;
      await ContactService.createAuditLog({
        action: AUDIT_LOG_TYPES.ACTION.DELETE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: updatedBy?.id,
        table_name: 'collector_members',
        table_row_id: collector?.id,
        current_values: JSON.stringify({
          team_name: team.title,
          ...collector,
          id: collector.id_text,
          updated_by_name: updatedBy?.name || updatedBy?.email,
          updated_by_id: updatedBy?.id_text,
          name: contact.name,
          contact_id: contact.id,
        }),
        changed_values: JSON.stringify({
          collector_team: true,
        }),
      });
    }
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logTeamAddRemoveCollector.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logTaskAttachmentUploaded = async (input: {
  taskAttachment: TaskAttachmentModel;
  uploadedBy: UserModel;
  changedValue: {
    uploaded_attachment: boolean;
  };
}): Promise<void | Error> => {
  const { taskAttachment, uploadedBy, changedValue } = input;
  try {
    const loaders = createLoaders();

    const task = (await loaders.tasks.load(
      taskAttachment.card_id,
    )) as TaskModel;
    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;

    const isProject = taskBoard?.category ? true : false;

    if (taskBoard.contact_id) {
      await ContactService.createAuditLog({
        action: changedValue.uploaded_attachment
          ? AUDIT_LOG_TYPES.ACTION.UPDATE
          : AUDIT_LOG_TYPES.ACTION.DELETE,
        source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
        source_id: uploadedBy?.id,
        table_name: TableNames.TASK_ATTACHMENTS,
        table_row_id: taskAttachment?.id,
        current_values: JSON.stringify({
          attachment_name: taskAttachment?.name,
          ...task,
          id: task.id_text,
          created_by: null,
          contact_id: taskBoard?.contact_id,
          task_board_name: taskBoard.name,
          task_board_id: taskBoard.id_text,
          task_board_category: taskBoard?.category,
          updated_by_name: uploadedBy.name || uploadedBy?.email,
          updated_by_id: uploadedBy.id_text,
          task_board_type: taskBoard?.type,
        }),
        changed_values: JSON.stringify({
          ...changedValue,
          task_attachment: isProject ? false : true,
          project_task_attachment: isProject ? true : false,
        }),
      });
    }

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logTaskAttachmentUploaded.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logPaymentOrReceiptUploaded = async (input: {
  collectionPayment: CollectionPaymentModel;
  uploadedBy: UserModel;
  changedValue: {
    uploaded_payment?: boolean;
    uploaded_receipt?: boolean;
    collection_paid?: boolean;
    rejected_payment?: boolean;
  };
}): Promise<void | Error> => {
  const { collectionPayment, uploadedBy, changedValue } = input;
  try {
    const loaders = createLoaders();
    const collection = (await loaders.collections.load(
      collectionPayment.receivable_id,
    )) as CollectionModel;
    const collector = (await loaders.collectors.load(
      collection.contact_id,
    )) as CollectorModel;

    let picName = uploadedBy.name || uploadedBy?.email;

    if (collectionPayment?.pic_id) {
      const contactPic = (await loaders.contactPics.load(
        collectionPayment?.pic_id,
      )) as ContactPicModel;
      picName = contactPic?.name;
    }

    let attachment_title = collectionPayment?.payment_proof_file_name;

    if (changedValue.uploaded_payment) {
      attachment_title = collectionPayment.payment_proof_file_name;
    } else if (changedValue.uploaded_receipt) {
      attachment_title = collectionPayment.receipt_file_name;
    }

    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: uploadedBy?.id,
      table_name: 'collection_payments',
      table_row_id: collectionPayment?.id,
      current_values: JSON.stringify({
        ...collection,
        id: collection.id_text,
        attachment_title,
        contact_id: collection.contact_id,
        created_by: null,
        collector_id: collector.id_text,
        updated_by_name: picName,
        updated_by_id: uploadedBy.id_text,
      }),
      changed_values: JSON.stringify({
        ...changedValue,
        collection_payment: true,
      }),
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logPaymentOrReceiptUploaded.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logCollectionMarkedPaid = async (input: {
  collection: CollectionModel;
  updatedBy: UserModel;
  changedValue: { marked_paid: boolean };
}): Promise<void | Error> => {
  const { collection, updatedBy, changedValue } = input;
  try {
    const loaders = createLoaders();
    const collector = (await loaders.collectors.load(
      collection.contact_id,
    )) as CollectorModel;
    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.COLLECTIONS,
      table_row_id: collection?.id,
      previous_values: JSON.stringify({
        ...collection,
        contact_id: collection.contact_id,
        created_by: null,
        id: collection.id_text,
        collector_id: collector.id_text,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      current_values: JSON.stringify({
        ...collection,
        status: changedValue.marked_paid ? 2 : 1,
        contact_id: collection.contact_id,
        created_by: null,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
        id: collection.id_text,
        collector_id: collector.id_text,
      }),
      changed_values: JSON.stringify({ ...changedValue, collection: true }),
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logCollectionMarkedPaid.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const logCollectionPaymentApproved = async (input: {
  collection: CollectionModel;
  updatedBy: UserModel;
  changedValue: { payment_approve: boolean };
}): Promise<void | Error> => {
  const { collection, updatedBy, changedValue } = input;
  try {
    const loaders = createLoaders();
    const collector = (await loaders.collectors.load(
      collection.contact_id,
    )) as CollectorModel;
    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: TableNames.COLLECTIONS,
      table_row_id: collection?.id,
      previous_values: JSON.stringify({
        ...collection,
        contact_id: collection.contact_id,
        created_by: null,
        id: collection.id_text,
        collector_id: collector.id_text,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
      }),
      current_values: JSON.stringify({
        ...collection,
        status: changedValue.payment_approve ? 2 : 1,
        contact_id: collection.contact_id,
        created_by: null,
        updated_by_name: updatedBy?.name || updatedBy?.email,
        updated_by_id: updatedBy?.id_text,
        id: collection.id_text,
        collector_id: collector.id_text,
      }),
      changed_values: JSON.stringify({ ...changedValue, collection: true }),
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logCollectionPaymentApproved.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleCollectionMarkedUnpaid = async (input: {
  collection: CollectionModel;
  updatedBy: UserModel;
}): Promise<void | Error> => {
  const { collection, updatedBy } = input;
  try {
    await logCollectionMarkedPaid({
      collection,
      updatedBy,
      changedValue: { marked_paid: false },
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleCollectionMarkedUnpaid.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleInvitedMemberToCompany = async (input: {
  user: UserModel;
  company: CompanyModel;
  type: number;
  memberUser: UserModel;
}): Promise<boolean | void> => {
  const { user, company, type, memberUser } = input;
  try {
    const companyName = company.name;
    const templateId = TYPES.INVITED_TO_COMPANY.template;
    let memberType = memberTypes.ADMIN;

    if (type === 2) {
      memberType = memberTypes.MANAGER;
    } else if (type === 3) {
      memberType = memberTypes.MEMBER;
    }

    await NotificationEvents.createInvitedToCompanyNotification({
      userId: memberUser?.id,
      companyId: company.id,
      memberType,
      recipientId: user?.id,
      createdBy: memberUser.id,
    });

    await MobileService.sendPushNotification({
      message: {
        title: 'Member Invitation',
        body: `${memberUser.name} invited you to ${company.name}`,
        data: {
          companyId: company.id_text,
          type: MobileService.PushNotificationType.COMPANY_INVITE_MEMBER,
        },
      },
      userId: user.id,
    });

    const option = await createEmailOption({
      email: user.email,
      receiverName: user?.name || user?.email,
      templateId,
      companyName,
      companyLogoUrl: company.logo_url,
    });

    const isEmailSent = await EmailService.sendEmail(option);

    if (!isEmailSent) {
      slack.postToDevLog('handleInvitedMemberToCompany', option, user);
    }

    // if (!isEmailSent) throw new Error('Unable to invite member');
    return isEmailSent;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleInvitedMemberToCompany.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleMemberAssignedToTeam = async (input: {
  memberId: CompanyMemberId;
  team: CompanyTeamModel;
  updatedBy: UserModel;
}): Promise<boolean | void> => {
  const { memberId, team, updatedBy } = input;
  try {
    if (!memberId || !team || !updatedBy) {
      return;
    }
    const templateId = TYPES.ASSIGNED_TO_TEAM.template;
    const loaders = createLoaders();

    const companyMember = (await loaders.companyMembers.load(
      memberId,
    )) as CompanyMemberModel;
    const company = (await loaders.companies.load(
      companyMember.company_id,
    )) as CompanyModel;
    const user = (await loaders.users.load(companyMember.user_id)) as UserModel;

    if (user?.id === updatedBy?.id) {
      return;
    }

    await NotificationEvents.createAssignedToTeamNotification({
      userId: updatedBy?.id,
      teamId: team?.id,
      recipientId: companyMember?.user_id,
      createdBy: updatedBy.id,
    });

    await MobileService.sendPushNotification({
      message: {
        title: 'Team Invitation',
        body: `${updatedBy.name} invited you to ${team.title}`,
        data: {
          companyId: company.id_text,
          type: MobileService.PushNotificationType.COMPANY_REMOVE_MEMBER,
        },
      },
      userId: user.id,
    });

    const option = await createEmailOption({
      email: user.email,
      receiverName: user?.name || user?.email,
      templateId,
      companyName: company.name,
      teamName: team?.title,
      companyLogoUrl: company?.logo_url,
    });

    const isEmailSent = await EmailService.sendEmail(option);

    if (!isEmailSent) {
      slack.postToDevLog('handleMemberAssignedToTeam', option, {
        memberId,
        teamId: team?.id,
        updatedById: updatedBy?.id,
      });
    }

    return isEmailSent;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleMemberAssignedToTeam.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleNotifyRejectedPayment = async (input: {
  memberUserId: UserId;
  memberId: CompanyMemberId;
  collectionPayment: CollectionPaymentModel;
  companyId: CompanyId;
  remarks: string;
}): Promise<null | void> => {
  const { memberUserId, memberId, collectionPayment, companyId, remarks } =
    input;
  try {
    const loaders = createLoaders();
    const user = (await loaders.users.load(memberUserId)) as UserModel;

    const contact = (await loaders.contacts.load(
      collectionPayment.contact_id,
    )) as ContactModel;

    const collector = (await loaders.collectors.load(
      collectionPayment.contact_id,
    )) as CollectorModel;

    const collection = (await loaders.collections.load(
      collectionPayment.receivable_id,
    )) as CollectionModel;

    const company = (await loaders.companies.load(companyId)) as CompanyModel;
    const notifyPics =
      typeof collection.notify_pics === 'string'
        ? JSON.parse(collection.notify_pics)
        : collection.notify_pics;
    const pics = (await loaders.contactPics.loadMany(
      notifyPics,
    )) as ContactPicModel[];

    if (_.isEmpty(notifyPics)) {
      return null;
    }

    const templateId = TYPES.COLLECTION_PAYMENT_REJECTED.template;
    const memberName = user.name || user?.email;
    const receivableTitle = collection.title;
    const companyName = company.name;
    const url = await createCollectionReminderLink({
      collection,
      contact,
      companyPublicId: company.id_text,
      collectorPublicId: collector.id_text,
      companySlug: company.slug,
    });

    let picUsers: UserModel[] = [];

    await Promise.all(
      _.map(pics, async ({ name, user_id }) => {
        const { email } = (await loaders.users.load(user_id)) as UserModel;
        const option = await createEmailOption({
          email,
          memberName,
          receiverName: name,
          companyName,
          link: url,
          title: receivableTitle,
          remarks,
          templateId,
          companyLogoUrl: company.logo_url,
        });

        const users = (await UserService.getDuplicateUsersByEmail(
          email,
        )) as UserModel[];

        users.forEach((user) => {
          picUsers.push(user);
        });

        await EmailService.sendEmail(option);
      }),
    );

    await Promise.all(
      _.map(picUsers, async ({ id, name }) => {
        await NotificationEvents.createPaymentStatusForPicNotification({
          userId: user.id,
          companyId: company.id,
          collectionId: collection.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.COLLECTION_PAYMENT_REJECTED,
          recipientId: id,
          createdBy: user.id,
        });
      }),
    );

    await logPaymentOrReceiptUploaded({
      uploadedBy: user,
      collectionPayment,
      changedValue: { rejected_payment: true },
    });

    return null;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleNotifyRejectedPayment.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleRemovedMemberFromCompany = async (input: {
  company: CompanyModel;
  companyMemberUserId: UserId;
  removedByUserId: UserId;
}): Promise<boolean | void> => {
  const { company, companyMemberUserId, removedByUserId } = input;
  try {
    const loaders = createLoaders();

    const user = (await loaders.users.load(companyMemberUserId)) as UserModel;
    const templateId = TYPES.REMOVED_FROM_COMPANY.template;
    const receiverName = user.name;
    const email = user.email;

    const option = await createEmailOption({
      templateId,
      receiverName,
      companyName: company.name,
      email,
      companyLogoUrl: company.logo_url,
    });
    const isEmailSent = await EmailService.sendEmail(option);

    const removedByUser = (await loaders.users.load(
      removedByUserId,
    )) as UserModel;

    await MobileService.sendPushNotification({
      message: {
        title: 'Member Removal',
        body: `${removedByUser.name} removed you from ${company.name}`,
        data: {
          companyId: company.id_text,
          type: MobileService.PushNotificationType.COMPANY_REMOVE_MEMBER,
        },
      },
      userId: user.id,
    });

    return isEmailSent;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleRemovedMemberFromCompany.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleRemovedMemberFromTeam = async (input: {
  companyMember: CompanyMemberModel;
  companyTeam: CompanyTeamModel;
  updatedById: UserId;
}): Promise<boolean | void> => {
  const { companyMember, companyTeam, updatedById } = input;
  try {
    const loaders = createLoaders();

    const user = (await loaders.users.load(companyMember.user_id)) as UserModel;
    const company = (await loaders.companies.load(
      companyMember.company_id,
    )) as CompanyModel;
    const templateId = TYPES.REMOVED_FROM_TEAM.template;
    const receiverName = user.name;

    const createdByUser = (await loaders.users.load(updatedById)) as UserModel;

    await NotificationEvents.createRemovedFromTeamNotification({
      teamId: companyTeam?.id,
      recipientId: companyMember?.user_id,
      createdBy: updatedById,
    });

    await MobileService.sendPushNotification({
      message: {
        title: 'Team Removal',
        body: `${createdByUser.name} removed you from ${companyTeam.title}`,
        data: {
          companyId: company.id_text,
          type: MobileService.PushNotificationType
            .COMPANY_REMOVE_MEMBER_FROM_TEAM,
        },
      },
      userId: user.id,
    });

    const email = user.email;
    const option = await createEmailOption({
      templateId,
      receiverName,
      companyName: company.name,
      email,
      companyLogoUrl: company.logo_url,
      teamName: companyTeam.title,
    });

    const isEmailSent = await EmailService.sendEmail(option);

    return isEmailSent;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleRemovedMemberFromTeam.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleNotifyUploadedPaymentProof = async (input: {
  collectionPayment: CollectionPaymentModel;
  collectorMembers: CollectorMemberModel[];
  uploadedBy: UserModel;
}): Promise<void> => {
  const { collectionPayment, collectorMembers, uploadedBy } = input;
  try {
    const loaders = createLoaders();
    const collectionId = _.get(collectionPayment, 'receivable_id');

    const collection = (await loaders.collections.load(
      collectionId,
    )) as CollectionModel;

    const contact = (await loaders.contacts.load(
      _.get(collectionPayment, 'contact_id'),
    )) as ContactModel;
    const collector = (await loaders.collectors.load(
      contact.id,
    )) as CollectorModel;
    const company = (await loaders.companies.load(
      _.get(contact, 'company_id'),
    )) as CompanyModel;

    let companyMembers;

    if (collectorMembers.length == 0 && collector.team_id) {
      companyMembers = (await CompanyService.getCompanyTeamMembers(
        collector.team_id,
      )) as CompanyMemberModel[];
    } else {
      companyMembers = await Promise.all(
        _.map(collectorMembers, async (cm) => {
          return (await loaders.companyMembers.load(
            _.get(cm, 'member_id'),
          )) as CompanyMemberModel;
        }),
      );
    }

    const memberUsers = await Promise.all(
      _.map(companyMembers, async (cm) => {
        return (await loaders.users.load(_.get(cm, 'user_id'))) as UserModel;
      }),
    );

    const templateId = TYPES.COLLECTION_PAYMENT_PROOF.template;
    const contactName = _.get(contact, 'name');
    const title = _.get(collection, 'title');
    const refNo = _.get(collection, 'ref_no');
    const amount = _.get(collection, 'payable_amount');
    const url = await createCollectionReminderLink({
      collection,
      contact,
      companyPublicId: company.id_text,
      collectorPublicId: collector.id_text,
      companySlug: company.slug,
    });

    await Promise.all(
      _.map(memberUsers, async (user) => {
        const receiverName = _.get(user, 'name');
        const email = _.get(user, 'email');

        await NotificationEvents.createPaymentStatusForMemberNotification({
          userId: uploadedBy.id,
          collectionId: collection.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.COLLECTION_PAYMENT_PROOF,
          recipientId: user?.id,
          createdBy: uploadedBy.id,
        });

        const option = await createEmailOption({
          receiverName,
          picName: _.get(uploadedBy, 'name'),
          email,
          templateId,
          contactName,
          title,
          refNo,
          companyLogoUrl: company.logo_url,
          amount: `RM${_.toString(amount)}`,
          url,
        });

        await EmailService.sendEmail(option);
      }),
    );

    await logPaymentOrReceiptUploaded({
      uploadedBy,
      collectionPayment,
      changedValue: { uploaded_payment: true },
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleNotifyUploadedPaymentProof.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleNotifyUploadedReceipt = async (input: {
  collectionPayment: CollectionPaymentModel;
  uploadedBy: UserModel;
}): Promise<void> => {
  const { collectionPayment, uploadedBy } = input;
  try {
    const loaders = createLoaders();
    const collectionId = _.get(collectionPayment, 'receivable_id');

    const collection = (await loaders.collections.load(
      collectionId,
    )) as CollectionModel;

    const contact = (await loaders.contacts.load(
      _.get(collectionPayment, 'contact_id'),
    )) as ContactModel;
    const company = (await loaders.companies.load(
      _.get(contact, 'company_id'),
    )) as CompanyModel;

    const picIds =
      typeof collection.notify_pics === 'string'
        ? JSON.parse(collection.notify_pics)
        : collection.notify_pics;

    const pics = (await loaders.contactPics.loadMany(
      picIds,
    )) as ContactPicModel[];
    const picUserIds = pics.map((pic) => pic.user_id);
    const picUsers = (await loaders.users.loadMany(picUserIds)) as UserModel[];

    await Promise.all(
      _.map(picUsers, async (user) => {
        await NotificationEvents.createPaymentStatusForPicNotification({
          userId: uploadedBy?.id,
          companyId: company?.id,
          collectionId: collection?.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.COLLECTION_RECEIPT,
          recipientId: user?.id,
          createdBy: uploadedBy.id,
        });
      }),
    );

    await logPaymentOrReceiptUploaded({
      uploadedBy,
      collectionPayment,
      changedValue: { uploaded_receipt: true },
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleNotifyUploadedReceipt.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleCollectionMarkedAsPaid = async (input: {
  collection: CollectionModel;
  collectionPeriodId: CollectionPeriodId;
  updatedBy: UserModel;
}): Promise<void> => {
  const { collection, collectionPeriodId, updatedBy } = input;
  try {
    const loaders = createLoaders();
    const contact = (await loaders.contacts.load(
      collection.contact_id,
    )) as ContactModel;
    const company = (await loaders.companies.load(
      contact.company_id,
    )) as CompanyModel;

    const contactPicIds =
      typeof collection.notify_pics === 'string'
        ? JSON.parse(collection.notify_pics)
        : collection.notify_pics;

    await Promise.all(
      _.map(contactPicIds, async (cip) => {
        const contactPic = (await loaders.contactPics.load(
          cip,
        )) as ContactPicModel;
        const picUser = (await loaders.users.load(
          contactPic?.user_id,
        )) as UserModel;

        await NotificationEvents.createPaymentStatusForPicNotification({
          userId: updatedBy?.id,
          companyId: company?.id,
          collectionId: collection?.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.COLLECTION_MARKED_AS_PAID,
          recipientId: picUser?.id,
          createdBy: updatedBy.id,
        });
      }),
    );

    await logCollectionMarkedPaid({
      updatedBy,
      collection,
      changedValue: { marked_paid: true },
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleCollectionMarkedAsPaid.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const updateEmailNotificationStatus = async (input: {
  data: {
    collectionId: CollectionId;
    companyId: CompanyId;
    template_id: string;
  };
  to: string;
}): Promise<CompanyServiceHistoryId | void> => {
  const { data, to } = input;
  try {
    const { companyId, collectionId } = data;

    let historyId = 0;
    const prevHistory = (await CompanyService.checkCompanyServiceHistory({
      collectionId: collectionId,
      type: 'Email',
    })) as CompanyServiceHistoryModel;

    if (prevHistory) {
      const prevHistoryData =
        typeof prevHistory?.data === 'string'
          ? JSON.parse(prevHistory?.data)
          : prevHistory?.data;
      if (prevHistoryData.template_id == TYPES.COLLECTION_CREATED.template) {
        historyId = prevHistory.id;
      }
    } else {
      const createHistory = (await CompanyService.createCompanyServiceHistory({
        companyId,
        collectionId: collectionId,
        type: SERVICE_TYPES.EMAIL,
        status: SERVICE_STATUS.IN_PROGRESS.value,
        to,
        data,
      })) as CompanyServiceHistoryModel;

      historyId = createHistory.id;
    }

    return historyId;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: updateEmailNotificationStatus.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const createCollectionReminderLink = async (input: {
  collection: CollectionModel;
  collectorPublicId: CollectorPublicId;
  contact: ContactModel;
  companySlug: string;
  companyPublicId: CompanyPublicId;
}): Promise<string | undefined> => {
  const {
    collection,
    collectorPublicId,
    contact,
    companySlug,
    companyPublicId,
  } = input;
  try {
    const linkToken = await UrlService.createLinkToken({
      contact,
      companyPublicId,
      collectionPublicId: collection.id_text,
      collectionRefNo: collection.ref_no,
    });

    const paymentType = parseInt(collection.payment_type);
    const shortcode = (await UrlService.createShortUrl(
      paymentType === 0
        ? `/${companySlug}/collection/${collection?.id_text}`
        : `${process.env.PAYMENT_PATH}${linkToken}`,
    )) as ShortUrlModel;

    await CollectionStore.createCollectionPaymentLink(
      collection.id,
      shortcode.id,
    );

    return `${process.env.REDIRECT_URL}/${shortcode.short_id}`;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createCollectionReminderLink.name,
        input,
      },
      sendToSlack: true,
    });
    return undefined;
  }
};

const getPeriodDuration = async (input: {
  remindType: number;
  periodIds: string;
}): Promise<string | void> => {
  const loaders = createLoaders();
  const { remindType, periodIds } = input;
  try {
    const parsedPeriodIds = JSON.parse(periodIds);

    let period = '-';
    if (remindType === 2 && parsedPeriodIds.length > 0) {
      const periods = (await loaders.collectionPeriods.loadMany(
        parsedPeriodIds,
      )) as CollectionPeriodModel[];

      const periodMonths = periods.map((period) => {
        return dayjs(period.month).format('MMM YYYY');
      });

      if (periodMonths?.length > 1) {
        period = `${periodMonths[0]} to ${
          periodMonths[periodMonths.length - 1]
        }`;
      } else if (periodMonths?.length === 1) {
        period = `${periodMonths[0]}`;
      }
    }

    return period;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getPeriodDuration.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleQuotaConsume = async (input: {
  services: MessageServiceModel;
  emailSentCount: number;
  whatsAppSentCount: number;

  companyId: CompanyId;
}): Promise<{
  email_quota: number;
  whatsApp_quota: number;
} | void> => {
  const { services, emailSentCount, whatsAppSentCount, companyId } = input;
  try {
    const quotas = {
      email_quota:
        services.email.quota === 0 ? 0 : services.email.quota - emailSentCount,
      whatsApp_quota:
        services.whatsApp.quota === 0
          ? 0
          : services.whatsApp.quota - whatsAppSentCount,
    };

    await SubscriptionService.consumeQuotas({
      quotas: { ...quotas, id: services.subscriptionId },
      companyId,
    });
    return quotas;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleQuotaConsume.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const getAttachments = async (input: {
  fileName: string;
  invoice: string;
}): Promise<
  { filename: string; content: string; type: string | false }[] | void
> => {
  const { fileName, invoice } = input;
  try {
    const s3Object = await s3.getObjectFromS3({
      filePath: invoice,
      isPublicAccess: true,
    });

    const buff = _.get(s3Object, 'Body', _.get(s3Object, 'body'));
    const fileType = await mime.lookup(fileName);

    const attachments = [
      {
        filename: fileName,
        content: buff.toString('base64') as string,
        type: fileType,
      },
    ];
    return attachments;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getAttachments.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const getEventManagerCollection = async (input: {
  collection: CollectionModel;
  periodIds: CollectionPeriodId[];
  company: CompanyModel;
}): Promise<EventCollectionPayload | void> => {
  const { collection, periodIds, company } = input;
  try {
    const evtManFormat = {
      ...collection,
      period_ids: JSON.stringify(periodIds),
      payment_type: parseInt(collection.payment_type),
      is_on_due: 1,
      is_overdue: 0,
      total_due: collection.payable_amount,
      company_id: company.id,
      company_name: company.name,
      collection_id: collection.id,
    };
    return evtManFormat;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getEventManagerCollection.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleCollectionPaymentComplete = async (input: {
  event: CompleteSenangPayTransactionPayload;
  collection: CollectionModel;
  periods: CollectionPeriodModel[];
  collectorMembers: CollectorMemberModel[];
  collectionPayment: CollectionPaymentModel | undefined;
}): Promise<void | Error> => {
  const { event, collection, periods, collectorMembers, collectionPayment } =
    input;
  const {
    // statusId,
    // orderId,
    // transactionId,
    message,
    // hash,
    data,
    // periods = await CollectionService.getCollectionPeriods(collection.id)
  } = event;

  const loaders = createLoaders();

  try {
    const collectionId = collection.id;
    const contactId = collection.contact_id;
    const contact = (await loaders.contacts.load(contactId)) as ContactModel;
    const company = (await loaders.companies.load(
      contact.company_id,
    )) as CompanyModel;

    const companyId = company.id;
    const receivableTitle = collection.title;

    const paymentPeriod = (await loaders.collectionPeriods.load(
      collectionPayment?.receivable_period_id as number,
    )) as CollectionPeriodModel;

    let periodId = paymentPeriod?.id;

    let paymentInfo = {
      ...paymentPeriod,
      company,
      receivableReminder: {
        ...collection,
        payableAmount: collection.payable_amount,
        refNo: collection.ref_no,
      },
    };

    const companyMembers = await Promise.all(
      _.map(collectorMembers, async (cm) => {
        return (await loaders.companyMembers.load(
          cm?.member_id,
        )) as CompanyMemberModel;
      }),
    );

    const memberUsers = await Promise.all(
      _.map(companyMembers, async (cm) => {
        return (await loaders.users.load(cm?.user_id)) as UserModel;
      }),
    );

    await Promise.all(
      _.map(memberUsers, async (mu) => {
        await NotificationEvents.createPaymentSpPaidNotification({
          collectionId: collection?.id,
          recipientId: mu?.id,
        });
      }),
    );

    if (collectionPayment) {
      //pic_id is always empty when paying for SP, this won't work.

      // const contactPic = (await loaders.contactPics.load(
      //   collectionPayment.pic_id,
      // )) as ContactPicModel;
      // const picUser = (await loaders.users.load(
      //   contactPic.user_id,
      // )) as UserModel;

      const collector = (await loaders.collectors.load(
        contact.id,
      )) as CollectorModel;
      await logUpdateContactData({
        updatedData: {
          name: '', //SP will not return any information of the payer, so we don't know who paid it.
          rowId: collection?.id_text,
          rowName: collection?.title,
          parentId: collector?.id_text,
        },
        // updatedBy: ,
        logType: '',
        contactPublicId: contact?.id_text,
        changedValues: {
          spPayment: true,
          title: collection?.title,
          subTitle: [
            {
              value: collection.payment_type
                ? COLLECTION_TYPES.PAYMENT.SENANGPAY
                : COLLECTION_TYPES.PAYMENT.DEFAULT,
              label: 'Payment Method',
            },
            {
              value:
                collection.remind_type === 1
                  ? COLLECTION_TYPES.REMIND.FULL
                  : COLLECTION_TYPES.REMIND.INSTALMENT,
              label: 'Payment Type',
            },
          ],
        },
      });
    }

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleCollectionPaymentComplete.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const getPicsToNotify = async (
  notifyPics: number[] | null,
): Promise<ContactPicModel[] | void> => {
  const loaders = createLoaders();
  try {
    const pics =
      notifyPics !== null
        ? ((await loaders.contactPics.loadMany(
            notifyPics,
          )) as ContactPicModel[])
        : [];

    return pics;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getPicsToNotify.name,
        input: {
          notifyPics,
        },
      },
      sendToSlack: true,
    });
  }
};

const handleActivityTimerStopped = async (input: {
  timesheet: TimesheetModel;
  companyId: CompanyId;
}): Promise<void> => {
  const { timesheet, companyId } = input;
  try {
    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId,
    });
    const dailyActivityTrackers = await handleRecalculateActivityTrackerDaily({
      timesheet,
      companyId,
      companyTimezone,
    });

    if (!dailyActivityTrackers || dailyActivityTrackers?.length === 0) {
      // consoleLog(dailyActivityTrackers);
      logger.errorLogger.log(
        'info',
        'handleActivityTimerStopped dailyActivityTrackers undefined',
        { timesheet, companyId },
      );
      return slack.postToDevLog(
        'handleActivityTimerStopped, dailyActivityTrackers',
        { dailyActivityTrackers, timesheet, companyId },
      );
    }

    const weeklyActivityTrackers =
      await exportFunctions.handleRecalculateActivityTrackerWeekly({
        timesheet,
        dailyActivityTrackers,
        companyId,
      });

    if (
      !weeklyActivityTrackers ||
      _.head(weeklyActivityTrackers) === undefined
    ) {
      return slack.postToDevLog(
        'handleActivityTimerStopped, weeklyActivityTrackers undefined',
        weeklyActivityTrackers,
      );
    }

    await exportFunctions.handleRecalculateActivityTrackerMonthly({
      weeklyTimeTracked: weeklyActivityTrackers,
      timesheet,
      companyId,
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleActivityTimerStopped.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleRecalculateActivityTrackerDaily = async (input: {
  timesheet: TimesheetModel;
  companyId: CompanyId;
  companyTimezone: string;
}): Promise<ActivityTrackerDailyModel[] | undefined> => {
  const { timesheet, companyId, companyTimezone } = input;
  try {
    dayjs.updateLocale('en', {
      weekStart: 1,
    });

    const loaders = createLoaders();

    const timesheetActivity = (await loaders.timesheetActivities.load(
      timesheet.activity_id,
    )) as TimesheetActivityModel;

    const startDate = dayjs(timesheet.start_date)
      .tz(companyTimezone)
      .format('YYYY-MM-DD HH:mm:ss');

    const endDate = dayjs(timesheet.end_date)
      .tz(companyTimezone)
      .format('YYYY-MM-DD HH:mm:ss');

    const res = (await TimesheetService.getTimeTracked({
      query: { start_date: startDate, end_date: endDate },
    })) as TimeTrackedModel[];

    const dailyActivityTrackers = new Set();

    for (let i = 0; i < res?.length; i++) {
      const query = {
        task_id: timesheetActivity.task_id,
        company_member_id: timesheet.company_member_id,
        day: res[i].day,
        month: res[i].month,
        year: res[i].year,
      };

      const dailies = (await TimesheetService.getActivityTimeSummaryByDay({
        query,
        companyId,
      })) as ActivityTrackerDailyModel[];

      const daily = _.head(dailies);

      if (!daily && res[i]?.total) {
        const create =
          (await TimesheetService.createDailyActivityTrackerSummary({
            payload: {
              ...query,
              total: res[i]?.total as number,
            },
          })) as ActivityTrackerDailyModel;

        dailyActivityTrackers.add(create);
      } else if (daily && res[i]?.total) {
        const update = (await TimesheetService.updateDailyTimesheetSummary({
          dailyActivityTrackerId: daily.id,
          total: (daily.total + res[i].total) as number,
        })) as ActivityTrackerDailyModel;

        dailyActivityTrackers.add(update);
      }
    }

    return Array.from(dailyActivityTrackers) as ActivityTrackerDailyModel[];
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleRecalculateActivityTrackerDaily.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleRecalculateActivityTrackerWeekly = async (input: {
  timesheet: TimesheetModel;
  dailyActivityTrackers: ActivityTrackerDailyModel[];
  companyId: CompanyId;
}): Promise<ActivityTrackerWeeklyModel[] | void> => {
  const { timesheet, dailyActivityTrackers, companyId } = input;
  try {
    const weeksInvolved = await exportFunctions.getWeekNumbersInvolved({
      timesheet,
      dailyActivityTrackers,
    });

    if (!weeksInvolved || weeksInvolved?.length === 0) {
      slack.postToDevLog('handleRecalculateActivityTrackerWeekly', {
        message: 'getWeekNumbersInvolved returns undefined or 0 length',
        companyId,
      });
      return;
    }

    const res = await Promise.all(
      _.map(weeksInvolved, async (wi) => {
        const getExistingWeeks =
          (await TimesheetService.getActivityTimeSummaryByWeek({
            payload: {
              company_member_id: timesheet.company_member_id,
              task_id: _.head(dailyActivityTrackers)?.task_id,
              week_number: wi.week_number,
              year: wi.year,
            },
            companyId,
          })) as ActivityTrackerWeeklyModel[];

        const selectedWeek = _.find(
          getExistingWeeks,
          (w) => w.company_member_id === timesheet.company_member_id,
        );

        if (selectedWeek) {
          const res = await TimesheetService.updateWeeklyTimesheetSummary({
            weeklyTimesheetId: selectedWeek.id,
            payload: {
              company_member_id: timesheet.company_member_id,
              task_id: _.head(dailyActivityTrackers)?.task_id as number,
              monday: wi.monday - selectedWeek.monday,
              tuesday: wi.tuesday - selectedWeek.tuesday,
              wednesday: wi.wednesday - selectedWeek.wednesday,
              thursday: wi.thursday - selectedWeek.thursday,
              friday: wi.friday - selectedWeek.friday,
              saturday: wi.saturday - selectedWeek.saturday,
              sunday: wi.sunday - selectedWeek.sunday,
              week_number: wi.week_number,
              year: wi.year,
            },
          });

          return res;
        } else {
          const res = await TimesheetService.createWeeklyActivityTrackerSummary(
            {
              payload: {
                company_member_id: timesheet.company_member_id,
                task_id: _.head(dailyActivityTrackers)?.task_id as number,
                ...wi,
              },
            },
          );

          return res;
        }
      }),
    );

    return res as ActivityTrackerWeeklyModel[];
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleRecalculateActivityTrackerWeekly.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const handleRecalculateActivityTrackerMonthly = async (input: {
  weeklyTimeTracked: ActivityTrackerWeeklyModel[];
  timesheet: TimesheetModel;
  companyId: CompanyId;
}): Promise<(ActivityTrackerMonthlyModel | undefined)[] | void> => {
  const { weeklyTimeTracked, timesheet, companyId } = input;
  try {
    // consoleLog(weeklyTimeTracked, 'weeklyTimeTracked');
    const res = await Promise.all(
      _.map(weeklyTimeTracked, async (wtt) => {
        const getMonthly =
          (await TimesheetService.getActivityTimeSummaryByMonth({
            companyId,
            query: {
              task_id: wtt.task_id,
              company_member_id: wtt.company_member_id,
              week_number: [wtt.week_number],
              year: wtt.year,
            },
          })) as ActivityTrackerMonthlyModel[];

        const monthly = _.find(
          getMonthly,
          (gm) => gm.company_member_id === wtt.company_member_id,
        );

        if (monthly) {
          const update = (await TimesheetService.updateMonthlyTimesheetSummary({
            monthlyTimesheetId: monthly.id,
            payload: {
              company_member_id: wtt.company_member_id,
              task_id: wtt.task_id,
              week_number: wtt.week_number,
              week_total: wtt.total_weekly - monthly.week_total,
              year: wtt.year,
            },
          })) as ActivityTrackerMonthlyModel;

          if (!update) {
            return;
            //TODO: Error here
          }

          return update;
        } else {
          const create =
            (await TimesheetService.createMonthlyActivityTrackerSummary({
              payload: {
                company_member_id: wtt.company_member_id,
                task_id: wtt.task_id,
                week_number: wtt.week_number,
                week_total: wtt.total_weekly,
                year: wtt.year,
              },
            })) as ActivityTrackerMonthlyModel;

          if (!create) {
            return;
            //TODO: Error here
          }

          return create;
        }
      }),
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: handleRecalculateActivityTrackerMonthly.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const getWeekNumbersInvolved = async (input: {
  timesheet: TimesheetModel;
  dailyActivityTrackers: ActivityTrackerDailyModel[];
}): Promise<TimeTrackedWeeklyPayload[] | void> => {
  const { timesheet, dailyActivityTrackers } = input;
  try {
    dayjs.updateLocale('en', {
      weekStart: 1,
    });

    const startWeek = dayjs(timesheet.start_date).isoWeek();
    const endWeek = dayjs(timesheet.end_date).isoWeek();

    const timeTrackedWeek = new Set();

    if (startWeek === endWeek) {
      const firstWeek = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        week_number: startWeek,
        year: dayjs(timesheet.start_date).year(),
      };

      for (let i = 0; i < dailyActivityTrackers.length; i++) {
        const day = dailyActivityTrackers[i].day;
        const month = dailyActivityTrackers[i].month;
        const year = dailyActivityTrackers[i].year;
        const date = `${year}-${month < 10 ? '0' : ''}${month}-${
          day < 10 ? '0' : ''
        }${day}`;

        const isMember =
          dailyActivityTrackers[i].company_member_id ===
          timesheet.company_member_id;

        const dayOfWeek = dayjs(date).weekday();

        const total = dailyActivityTrackers[i].total;
        if (isMember) {
          switch (dayOfWeek) {
            case 0:
              firstWeek.monday = total + firstWeek.monday;
              break;

            case 1:
              firstWeek.tuesday = total + firstWeek.tuesday;
              break;

            case 2:
              firstWeek.wednesday = total + firstWeek.wednesday;
              break;

            case 3:
              firstWeek.thursday = total + firstWeek.thursday;
              break;

            case 4:
              firstWeek.friday = total + firstWeek.friday;
              break;

            case 5:
              firstWeek.saturday = total + firstWeek.saturday;
              break;

            case 6:
              firstWeek.sunday = total + firstWeek.sunday;
              break;

            default:
              break;
          }
        }

        timeTrackedWeek.add(firstWeek);
      }
      return Array.from(timeTrackedWeek) as TimeTrackedWeeklyPayload[];
    } else if (endWeek > startWeek) {
      const firstWeek = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        week_number: startWeek,
        year: dayjs(timesheet.start_date).year(),
      };

      const lastWeek = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        week_number: endWeek,
        year: dayjs(timesheet.end_date).year(),
      };

      const weekBetween = {
        monday: 86400,
        tuesday: 86400,
        wednesday: 86400,
        thursday: 86400,
        friday: 86400,
        saturday: 86400,
        sunday: 86400,
        week_number: 0,
        year: dayjs(timesheet.start_date).year(),
      };

      for (let i = 0; i < dailyActivityTrackers.length; i++) {
        const day = dailyActivityTrackers[i].day;
        const month = dailyActivityTrackers[i].month;
        const year = dailyActivityTrackers[i].year;
        const date = `${year}-${month < 10 ? '0' : ''}${month}-${
          day < 10 ? '0' : ''
        }${day}`;

        const dayOfWeek = dayjs(date).weekday();

        const total = dailyActivityTrackers[i].total;

        if (dayjs(date).isoWeek() === startWeek) {
          switch (dayOfWeek) {
            case 0:
              firstWeek.monday = total + firstWeek.monday;
              break;

            case 1:
              firstWeek.tuesday = total + firstWeek.tuesday;
              break;

            case 2:
              firstWeek.wednesday = total + firstWeek.wednesday;
              break;

            case 3:
              firstWeek.thursday = total + firstWeek.thursday;
              break;

            case 4:
              firstWeek.friday = total + firstWeek.friday;
              break;

            case 5:
              firstWeek.saturday = total + firstWeek.saturday;
              break;

            case 6:
              firstWeek.sunday = total + firstWeek.sunday;

              break;

            default:
              break;
          }

          timeTrackedWeek.add(firstWeek);
        } else if (dayjs(date).isoWeek() === endWeek) {
          switch (dayOfWeek) {
            case 0:
              lastWeek.monday = total + lastWeek.monday;
              break;

            case 1:
              lastWeek.tuesday = total + lastWeek.tuesday;
              break;

            case 2:
              lastWeek.wednesday = total + lastWeek.wednesday;
              break;

            case 3:
              lastWeek.thursday = total + lastWeek.thursday;
              break;

            case 4:
              lastWeek.friday = total + lastWeek.friday;
              break;

            case 5:
              lastWeek.saturday = total + lastWeek.saturday;
              break;

            case 6:
              lastWeek.sunday = total + lastWeek.sunday;

              break;

            default:
              break;
          }

          timeTrackedWeek.add(lastWeek);
        } else if (
          dayjs(date).isoWeek() > startWeek &&
          dayjs(date).isoWeek() < endWeek
        ) {
          weekBetween.week_number = dayjs(date).isoWeek();

          timeTrackedWeek.add(weekBetween);
        }
      }

      return Array.from(timeTrackedWeek) as TimeTrackedWeeklyPayload[];
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getWeekNumbersInvolved.name,
        input,
      },
      sendToSlack: true,
    });
  }
};

const remindClockInBeforeWorkStart = async (): Promise<void> => {
  let whitelistedMembers: CompanyMemberNotifyEventManagerModel[] = [];
  try {
    const membersToBeReminded =
      (await EventManagerStore.getMembersRemindWorkingHours({
        currentDay: currentDay(),
        minutes: 1000,
      })) as CompanyMemberNotifyEventManagerModel[];

    whitelistedMembers = (await Promise.all(
      _.map(membersToBeReminded, async (cm) => {
        const openAttendance = (await AttendanceStore.getMemberOpenAttendance({
          memberId: cm.id,
        })) as AttendanceModel;

        const memberIsWhitelisted =
          await SubscriptionService.isMemberWhitelistedToAttendance(cm?.id);

        if (openAttendance?.id) {
          return;
        } else if (memberIsWhitelisted) {
          return cm;
        } else {
          return;
        }
      }).filter((cm) => cm),
    )) as CompanyMemberNotifyEventManagerModel[];

    if (!_.isEmpty(whitelistedMembers)) {
      const cIds = _.map(whitelistedMembers, (m) => m?.company_id);
      const companyIds = _.uniqBy(cIds, (id) => id).filter((id) => id);

      const loaders = createLoaders();

      await Promise.all(
        _.map(companyIds, async (companyId) => {
          const company = (await loaders.companies.load(
            companyId,
          )) as CompanyModel;

          const whitelistedMembersInCompany = _.filter(
            whitelistedMembers,
            (m) => m?.company_id === companyId,
          );

          await Promise.all(
            _.map(whitelistedMembersInCompany, async (mem) => {
              await MobileService.sendPushNotification({
                userId: mem.user_id,
                message: {
                  title: 'Clock In Reminder',
                  body: 'Just to remind you to clock in for work today. Click here to clock in.',
                  data: {
                    companyId: company.id_text,
                    type: MobileService.PushNotificationType.CLOCK_IN_REMINDER,
                  },
                },
              });

              await NotificationEvents.createAttendanceReminderNotification({
                templateType:
                  NOTIFICATION_TEMPLATE_TYPES.CLOCK_IN_BEFORE_TEN_MINUTES,
                recipientId: mem?.user_id,
                companyId,
              });
            }),
          );
        }),
      );
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: remindClockInBeforeWorkStart.name,
        whitelistedMembers,
      },
    });
  }
};

const remindClockInAfterWorkStart = async (): Promise<void> => {
  try {
    const membersToBeReminded =
      (await EventManagerStore.getMembersRemindWorkingHours({
        currentDay: currentDay(),
        isAfter: true,
        minutes: 1000, // ten minutes
      })) as CompanyMemberNotifyEventManagerModel[];

    const whitelistedMembers = await Promise.all(
      _.map(membersToBeReminded, async (cm) => {
        const openAttendance = (await AttendanceStore.getMemberOpenAttendance({
          memberId: cm.id,
        })) as AttendanceModel;

        const memberIsWhitelisted =
          await SubscriptionService.isMemberWhitelistedToAttendance(cm?.id);

        if (openAttendance?.id) {
          return;
        } else if (memberIsWhitelisted) {
          return cm;
        } else {
          return;
        }
      }),
    );

    const members = whitelistedMembers.filter(
      (cm) => cm,
    ) as CompanyMemberNotifyEventManagerModel[];

    if (members?.length > 0) {
      const cIds = _.map(members, (m) => m.company_id);
      const companyIds = _.uniqBy(cIds, (id) => id);

      const loaders = createLoaders();

      await Promise.all(
        _.map(companyIds, async (companyId) => {
          const company = (await loaders.companies.load(
            companyId,
          )) as CompanyModel;

          const whitelistedMembersInCompany = _.filter(
            members,
            (m) => m?.company_id === companyId,
          );

          await Promise.all(
            _.map(whitelistedMembersInCompany, async (mem) => {
              await MobileService.sendPushNotification({
                userId: mem.user_id,
                message: {
                  title: 'Clock In Reminder',
                  body: 'It looks like you have not clock in for today. Click here to clock in.',
                  data: {
                    companyId: company.id_text,
                    type: MobileService.PushNotificationType.CLOCK_IN_REMINDER,
                  },
                },
              });

              await NotificationEvents.createAttendanceReminderNotification({
                templateType:
                  NOTIFICATION_TEMPLATE_TYPES.CLOCK_IN_AFTER_TEN_MINUTES,
                recipientId: mem?.user_id,
                companyId,
              });
            }),
          );
        }),
      );
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: remindClockInAfterWorkStart.name,
      },
    });
  }
};

const remindClockOutAfterWorkEnd = async (): Promise<void> => {
  try {
    const membersToBeReminded =
      (await EventManagerStore.getMembersRemindWorkingHours({
        currentDay: currentDay(),
        isAfter: true,
        isEndHour: true,
        minutes: 20000, //2 hours
      })) as CompanyMemberNotifyEventManagerModel[];

    const whitelistedMembers = await Promise.all(
      _.map(membersToBeReminded, async (cm) => {
        const openAttendance = (await AttendanceStore.getMemberOpenAttendance({
          memberId: cm.id,
        })) as AttendanceModel;

        const memberIsWhitelisted =
          await SubscriptionService.isMemberWhitelistedToAttendance(cm?.id);

        if (openAttendance?.id) {
          return cm;
        } else if (memberIsWhitelisted) {
          return cm;
        } else {
          return;
        }
      }),
    );

    const members = whitelistedMembers.filter(
      (cm) => cm,
    ) as CompanyMemberNotifyEventManagerModel[];

    if (members?.length > 0) {
      const cIds = _.map(members, (m) => m.company_id);
      const companyIds = _.uniqBy(cIds, (id) => id);

      const loaders = createLoaders();

      await Promise.all(
        _.map(companyIds, async (companyId) => {
          const company = (await loaders.companies.load(
            companyId,
          )) as CompanyModel;

          const whitelistedMembersInCompany = _.filter(
            members,
            (m) => m?.company_id === companyId,
          );

          await Promise.all(
            _.map(whitelistedMembersInCompany, async (mem) => {
              await MobileService.sendPushNotification({
                userId: mem.user_id,
                message: {
                  title: 'Clock Out Reminder',
                  body: 'It looks like you have not clock out for today. Click here to clock out.',
                  data: {
                    companyId: company?.id_text,
                    type: MobileService.PushNotificationType.CLOCK_OUT_REMINDER,
                  },
                },
              });

              await NotificationEvents.createAttendanceReminderNotification({
                templateType:
                  NOTIFICATION_TEMPLATE_TYPES.CLOCK_OUT_AFTER_TWO_HOURS,
                recipientId: mem?.user_id,
                companyId,
              });
            }),
          );
        }),
      );
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: remindClockOutAfterWorkEnd.name,
      },
    });
  }
};

const logUpdatedData = async (input: {
  updatedDataId?: number;
  updatedData?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
  contactPublicId: ContactPublicId;
  updatedBy: UserModel;
  logType: string;
  changedValues: Record<string, unknown>;
}): Promise<void | Error> => {
  const {
    updatedDataId,
    updatedData,
    data,
    contactPublicId,
    updatedBy,
    logType,
    changedValues,
  } = input;
  try {
    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.UPDATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: logType,
      table_row_id: updatedDataId,
      current_values: JSON.stringify(updatedData),
      previous_values: JSON.stringify(data),
      changed_values: JSON.stringify({
        ...changedValues,
        contactPublicId,
        updatedByName: updatedBy?.name,
      }),
    });
    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: logUpdatedData.name,
        input,
      },
    });
    return err;
  }
};

const logUpdateContactData = async (input: {
  updatedDataId?: number;
  updatedData?: Record<string, unknown> | null;
  contactPublicId: ContactPublicId;
  updatedBy?: UserModel;
  logType: string;
  changedValues: Record<string, unknown>;
}): Promise<void | Error> => {
  const {
    updatedDataId,
    updatedData,
    contactPublicId,
    updatedBy,
    logType,
    changedValues,
  } = input;
  try {
    await ContactService.createAuditLog({
      action: AUDIT_LOG_TYPES.ACTION.CREATE,
      source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
      source_id: updatedBy?.id,
      table_name: logType,
      table_row_id: updatedDataId,
      current_values: JSON.stringify(updatedData),
      changed_values: JSON.stringify({
        ...changedValues,
        contactPublicId,
        updatedByName: updatedBy?.name,
      }),
    });

    return;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: logUpdateContactData.name,
        input,
      },
    });
    return err;
  }
};

const getCollectionLink = async (input: {
  collection: CollectionModel;
  collector: CollectorModel;
  contact: ContactModel;
  company: CompanyModel;
}): Promise<string | undefined> => {
  const { collection, collector, contact, company } = input;
  try {
    const existingLink = await CollectionService.getCollectionPaymentLink(
      collection.id,
    );

    if (typeof existingLink === 'string') {
      return existingLink;
    } else {
      const link = await createCollectionReminderLink({
        collection,
        collectorPublicId: collector.id_text,
        contact,
        companySlug: company?.slug,
        companyPublicId: company.id_text,
      });

      return link;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: getCollectionLink.name,
        input,
      },
    });
    return;
  }
};

const notifyMemberTypeChanged = async (input: {
  type: number;
  updatedById: UserId;
  memberId: CompanyMemberId;
}) => {
  const { type, updatedById, memberId } = input;
  try {
    let memberType = memberTypes.ADMIN;

    if (type === 2) {
      memberType = memberTypes.MANAGER;
    } else if (type === 3) {
      memberType = memberTypes.MEMBER;
    }

    const loaders = createLoaders();

    const member = (await loaders.companyMembers.load(
      memberId,
    )) as CompanyMemberModel;

    await NotificationEvents.createMemberTypeChangedNotification({
      userId: updatedById,
      memberType,
      companyId: member?.company_id,
      recipientId: member?.user_id,
      createdBy: updatedById,
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: notifyMemberTypeChanged.name,
        input,
      },
    });
  }
};

const createLogData = async (input: {
  tableName: string;
  auditActionType: string;
  sourceId: UserId;
  tableRowId: number;
  table: {
    task?: TaskModel;
    collection?: CollectionModel;
    signingWorkFlow?: SigningWorkflowsModel;
    contact?: ContactModel;
  };
  picName?: string;
  contactPublicId: ContactPublicId;
}) => {
  const loaders = createLoaders();
  const {
    tableName,
    auditActionType,
    sourceId,
    tableRowId,
    table,
    picName,
    contactPublicId,
  } = input;

  const user = (await loaders.users.load(sourceId)) as UserModel;
  try {
    if (tableName === TableNames.COLLECTIONS) {
      const currentValues = JSON.stringify({
        id: table?.collection?.id_text,
        name: table.collection?.title,
        title: table.collection?.title,
        created_by_name: user?.name || user?.email,
        created_by_id: user?.id_text,
      });
      if (auditActionType === AUDIT_LOG_TYPES.ACTION.CREATE) {
        await ContactStore.createAuditLog({
          action: auditActionType,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: sourceId,
          table_name: tableName,
          table_row_id: tableRowId,
          current_values: currentValues,
          changed_values: JSON.stringify({
            is_create: true,
            collection: true,
            contactPublicId: contactPublicId,
          }),
        });
      }
    } else if (tableName === TableNames.SIGNING_WORKFLOWS) {
      const currentValues = JSON.stringify({
        id: table?.signingWorkFlow?.id_text,
        status: table.signingWorkFlow?.status,
        card_id: table.signingWorkFlow?.card_id,
        job_id: table.signingWorkFlow?.job_id,
        created_by_id: table.signingWorkFlow?.created_by,
        created_at: table.signingWorkFlow?.created_at,
      });
      if (auditActionType === AUDIT_LOG_TYPES.ACTION.CREATE) {
        await ContactStore.createAuditLog({
          action: auditActionType,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: sourceId,
          table_name: tableName,
          table_row_id: tableRowId,
          current_values: currentValues,
          changed_values: JSON.stringify({
            is_create: true,
            signing_workflow: true,
            contactPublicId: contactPublicId || undefined,
          }),
        });
      }
    } else if (tableName === TableNames.CONTACTS) {
      const currentValues = JSON.stringify({
        id: table?.contact?.id_text,
        name: table?.contact?.name,
        created_by_name: user?.name || user?.email,
        created_by_id: user?.id_text,
      });
      if (auditActionType === AUDIT_LOG_TYPES.ACTION.CREATE) {
        await ContactStore.createAuditLog({
          action: auditActionType,
          source_type: AUDIT_LOG_TYPES.SOURCE_TYPE.USER,
          source_id: sourceId,
          table_name: tableName,
          table_row_id: tableRowId,
          current_values: currentValues,
          changed_values: JSON.stringify({
            is_create: true,
            contact: true,
            contactPublicId: contactPublicId,
          }),
        });
      }
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        fnName: createLogData.name,
        input,
      },
    });
  }
};

const logProjectBilling = async (input: LogEventsProjectBillingInput) => {
  const { actionType, billingType, note, memberId, name, createdBy, data } =
    input;
  try {
    for (const action of Object.values(LogEventsProjectActionTypes)) {
      if (action === actionType) {
        await WorkspaceStore.createProjectBillingAuditLog({
          actionType,
          billingType,
          note,
          memberId,
          name,
          createdBy,
          data,
        });

        logger.activityLogger.log('info', 'logProjectBilling', input);
      }
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: logProjectBilling.name,
        input,
      },
    });
  }
};

const notifyLowQuota = async (input: {
  quotaType: QuotaType;
  companyId: CompanyId;
}) => {
  try {
    const { quotaType, companyId } = input;

    const members = (await CompanyService.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];

    const company = (await CompanyStore.getCompaniesById(
      companyId,
    )) as CompanyModel;

    const templateId = TYPES.QUOTA_EXCEED.template;

    for (const member of members) {
      await NotificationEvents.createQuotaExceededNotification({
        services: quotaType,
        companyId,
        recipientId: member.userId,
        templateType: NOTIFICATION_TEMPLATE_TYPES.QUOTA_EXCEED,
      });

      const companyUser = (await UserService.getUser(
        member.userId,
      )) as UserModel;

      const option = await createEmailOption({
        email: companyUser.email,
        receiverName: companyUser?.name || companyUser?.email,
        templateId,
        companyLogoUrl: company.logoUrl,
        companyName: company.name,
        exceededServicesString: quotaType,
      });
      await EmailService.sendEmail(option);
    }
  } catch (error) {
    console.error(error);
    return;
  }
};

const exportFunctions = {
  ...SubscriptionEvents,
  ...TaskEvents,
  ...NotificationEvents,
  ...EventManagerHelper,
  handleCollectionReminderEvent,
  handleInvitedMemberToCompany,
  handleMemberAssignedToTeam,
  handleRemovedMemberFromCompany,
  handleRemovedMemberFromTeam,
  handleNotifyRejectedPayment,
  handleNotifyUploadedPaymentProof,
  getEventManagerCollection,
  logUpdatedCollectionDueDate,
  logArchiveCollection,
  logPicAddRemoveCollection,
  logAssigneeAddRemoveCollector,
  logTeamAddRemoveCollector,
  logPaymentOrReceiptUploaded,
  handleNotifyUploadedReceipt,
  handleCollectionMarkedAsPaid,
  handleCollectionMarkedUnpaid,
  logCollectionCreateDelete,
  logUpdatedCollectionMisc,
  logUpdatedContactMisc,
  logUpdatedContactPicMisc,
  logTaskCreateDelete,
  logUpdatedTaskDueDate,
  logUpdatedTaskCompanyTeamStatus,
  logArchiveTask,
  logPicAddRemoveTask,
  logAssigneeAddRemoveTask,
  logTaskAttachmentUploaded,
  logContactCreate,
  logContactPicCreateDelete,
  logContactMovedGroup,
  handleCollectionPaymentComplete,
  getCollectionConstants,
  getAttachments,
  handleQuotaConsume,
  createCollectionReminderLink,
  getPeriodDuration,
  getPicsToNotify,
  processSendEmailToPic,
  logCollectionPaymentApproved,
  logUpdatedTaskProjectDueDate,
  handleActivityTimerStopped,
  handleRecalculateActivityTrackerWeekly,
  handleRecalculateActivityTrackerDaily,
  getWeekNumbersInvolved,
  handleRecalculateActivityTrackerMonthly,
  remindClockInBeforeWorkStart,
  remindClockInAfterWorkStart,
  remindClockOutAfterWorkEnd,
  logUpdatedData,
  logUpdateContactData,
  getCollectionLink,
  notifyMemberTypeChanged,
  logProjectBilling,
  createLogData,
  notifyLowQuota,
};

export default exportFunctions;
