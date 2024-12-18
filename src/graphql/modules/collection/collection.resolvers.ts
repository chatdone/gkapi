import dayjs from 'dayjs';
import { Resolvers } from '@generated/graphql-types';
import { withAuth } from '@graphql/wrappers';
import { UserInputError } from 'apollo-server-express';
import { CompanyModel } from '@models/company.model';
import {
  CollectionService,
  CollectorService,
  CompanyService,
  ContactService,
  FilterService,
  TagService,
} from '@services';
import { handleResolverError } from '@graphql/errors';
import { GraphQLUpload } from 'graphql-upload';
import _ from 'lodash';
import tz from 'dayjs/plugin/timezone';
import {
  CollectionModel,
  CollectionPeriodModel,
} from '@models/collection.model';
import { ContactModel, ContactPicModel } from '@models/contact.model';
import {
  getCollection,
  getCollectionPayment,
  getCollectionPeriod,
  getCollections,
  getCompanyMembers,
  getContact,
  getContactPics,
} from '@data-access/getters';
import { TagModel } from '@models/tag.model';
dayjs.extend(tz);

export const resolvers: Resolvers = {
  Query: {
    collection: withAuth(
      async (
        root,
        { collectionId, isForMember },
        { loaders, auth: { user } },
      ) => {
        try {
          const collection = (await loaders.collections.load(
            collectionId,
          )) as CollectionModel;

          if (!collection) {
            throw new UserInputError('That collection id does not exist');
          } else if (collection.deleted_by) {
            throw new UserInputError('That collection is deleted');
          }

          const contact = (await loaders.contacts.load(
            collection?.contact_id,
          )) as ContactModel;
          const company = (await loaders.companies.load(
            contact?.company_id,
          )) as CompanyModel;

          const member = await CompanyService.getMemberByUserIdAndCompanyId({
            userId: user.id,
            companyId: company?.id,
          });

          if (member) {
            return collection;
          } else {
            const pic = await CollectorService.getAssigneesByCollectorId({
              collectorId: collection?.contact_id,
              userId: user?.id,
            });

            if (pic instanceof Error) {
              throw new UserInputError('PIC ID does not exist');
            } else {
              const filteredCollections =
                await FilterService.filterCollectionsForCollector({
                  collections: [collection] as CollectionModel[],
                  contactPicId: pic?.id,
                });

              const isError = filteredCollections instanceof Error;

              if (!isError && filteredCollections?.length > 0) {
                return _.head(filteredCollections);
              }
            }
          }
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    collectionPeriods: withAuth(async (root, { collectionId }, { loaders }) => {
      try {
        const collection = (await loaders.collections.load(
          collectionId,
        )) as CollectionModel;

        const res = (await CollectionService.getCollectionPeriods({
          collectionId: collection.id,
        })) as CollectionPeriodModel[];

        return res;
      } catch (error) {
        return [handleResolverError(error)];
      }
    }),
    collectionPeriod: withAuth(
      async (root, { collectionPeriodId }, { loaders }) => {
        const collectionPeriod = (await loaders.collectionPeriods.load(
          collectionPeriodId,
        )) as CollectionPeriodModel;

        const res = await CollectionService.getCollectionPeriods({
          collectionId: collectionPeriod.id,
        });

        return res;
      },
    ),
  },
  Upload: GraphQLUpload,
  Mutation: {
    updateCollectionPaymentType: withAuth(
      async (_, { collectionId, input }, { loaders, auth: { user } }) => {
        const collection = (await loaders.collections.load(
          collectionId,
        )) as CollectionModel;

        const res = (await CollectionService.modifyPaymentType({
          collection,
          payload: input,
          user,
        })) as CollectionModel;
        return res;
      },
    ),
    createCollection: withAuth(
      async (
        _,
        { input, attachment, remindOnDays },
        { loaders, auth: { user } },
      ) => {
        let payload;
        const contact = (await getContact(input.contact_id)) as ContactModel;
        const collections = (await CollectionService.listCollectionsByContactId(
          { contactId: contact.id },
        )) as CollectionModel[];

        if (collections) {
          const invoiceExist = collections.find(
            (collection) => collection.ref_no === input.ref_no,
          );
          if (invoiceExist) {
            throw new Error('Invoice number already exist.');
          }
        }
        if (input.notify_pics) {
          const pics = await loaders.contactPics.loadMany(input.notify_pics);
          if (pics.length !== input.notify_pics.length) {
            throw new UserInputError(
              'One or more person in charge ID not found',
            );
          }
          //temporary solution to insert array as string in db
          const picIds = pics.map((pic: any) => pic.id);
          const str = picIds.toString();

          payload = {
            ...input,
            notify_pics: `[${str}]`,
            created_by: user.id,
          };
        } else {
          payload = {
            ...input,
            notify_pics: null,
            created_by: user.id,
          };
        }
        const tags = input?.tagIds
          ? ((await loaders.tags.loadMany(input?.tagIds)) as TagModel[])
          : undefined;
        if (input?.tagIds) {
          delete payload?.tagIds;
        }

        const res = (await CollectionService.createCollection({
          payload,
          attachment,
          remindOnDays,
          contact,
          tags,
          companyId: contact.company_id,
        })) as CollectionModel;

        return res;
      },
    ),
    updateCollection: withAuth(
      async (
        _,
        { collectionId, input, remindOnDays, attachment },
        { loaders, auth: { user } },
      ) => {
        try {
          let payload;
          const collection = await getCollection(collectionId);

          //cannot use getters here due to contact_id being private in collection model
          const contact = (await loaders.contacts.load(
            collection.contact_id,
          )) as ContactModel;
          if (!contact)
            throw new Error('Contact ID does not exist for this collection ID');

          //cannot use getters here due to private contact_id is the collector_id
          const collector = await loaders.collectors.load(contact.id);

          if (!collector) {
            throw new Error('Collector id does not exist');
          }

          if (input.notify_pics) {
            const pics = await getContactPics(input.notify_pics);
            const picIds = pics.map((pic: any) => pic.id);

            payload = {
              ...input,
              notify_pics: picIds,
              created_by: user.id,
            };
          } else {
            payload = {
              ...input,
              created_by: user.id,
            };
          }

          const res = await CollectionService.updateCollection({
            payload,
            collection,
            contact,
            collector,
            user,
            attachment,
            remindOnDays,
            companyId: contact.company_id,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    deleteCollections: withAuth(
      async (_, { collectionIds }, { loaders, auth: { user } }) => {
        const collections = await getCollections(collectionIds);

        const deletedResults = await CollectionService.deleteCollections({
          collections,
          user,
        });

        if (deletedResults !== collections.length)
          throw new Error('One or more collection failed to be deleted');

        return collections;
      },
    ),
    deactivateCollections: withAuth(
      async (_, { collectionIds }, { loaders, auth: { user } }) => {
        const collections = await getCollections(collectionIds);

        const deactivatedCollections =
          await CollectionService.deactivateCollections({
            userId: user.id,
            collectionIds: collections.map((c) => c.id),
          });

        if (deactivatedCollections !== collections.length)
          throw new Error('One or more collections failed to be deactivated');

        return collections;
      },
    ),
    activateCollections: withAuth(
      async (_, { collectionIds }, { loaders, auth: { user } }) => {
        const collections = await getCollections(collectionIds);

        const activatedCollections =
          await CollectionService.activateCollections({
            userId: user.id,
            collectionIds: collections.map((c) => c.id),
          });

        if (activatedCollections !== collections.length)
          throw new Error('One or more collections failed to be activated');

        return collections;
      },
    ),
    archiveCollections: withAuth(
      async (_, { collectionIds }, { loaders, auth: { user } }) => {
        const collections = await getCollections(collectionIds);

        const archivedCollections = await CollectionService.archiveCollections({
          user,
          collections,
        });

        if (archivedCollections !== collections.length)
          throw new Error('One or more collections failed to be archived');

        return collections;
      },
    ),
    unarchiveCollections: withAuth(
      async (_, { collectionIds }, { loaders, auth: { user } }) => {
        const collections = await getCollections(collectionIds);

        const unarchivedCollections =
          await CollectionService.unarchiveCollections({
            user,
            collections,
          });

        if (unarchivedCollections !== collections.length)
          throw new Error('One or more collections failed to be unarchived');

        return collections;
      },
    ),
    collectionReminderRead: withAuth(
      async (_, { collectionId }, { loaders, auth: { user } }) => {
        try {
          const collection = await getCollection(collectionId);
          const res = await CollectionService.collectionReminderRead({
            userId: user.id,
            collectionId: collection.id,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCollectionPeriodStatus: withAuth(
      async (
        _,
        { collectionId, collectionPeriodId, status },
        { loaders, auth: { user } },
      ) => {
        const collection = await getCollection(collectionId);
        const collectionPeriod = await getCollectionPeriod(collectionPeriodId);

        const res = CollectionService.updateCollectionPeriodStatus({
          user,
          collection,
          collectionPeriodId: collectionPeriod.id,
          status,
        });
        return res;
      },
    ),
    uploadPaymentProof: withAuth(
      async (_, { input, attachment }, { loaders, auth: { user } }) => {
        const collection = await getCollection(input.collection_id);

        const collectionPeriod = await getCollectionPeriod(
          input.collection_period_id,
        );

        //cannot use getters here due to contact_id being private in collection model
        const contact = (await loaders.contacts.load(
          collection.contact_id,
        )) as ContactModel;

        if (!contact)
          throw new Error('Contact id not found for this collection');

        const contactPic =
          (await ContactService.getContactPicsByUserIdAndContactId({
            contactId: contact.id,
            userId: user.id,
          })) as ContactPicModel;

        const res = await CollectionService.createCollectionPayment({
          user,
          attachment,
          collection,
          collectionPeriod,
          contactPic,
          contact,
          companyId: contact?.company_id,
        });
        return res;
      },
    ),
    deletePaymentProof: withAuth(
      async (_, { input }, { loaders, auth: { user } }) => {
        const collection = await getCollection(input.collection_id);

        const collectionPeriod = await getCollectionPeriod(
          input.collection_period_id,
        );

        //cannot use getters here due to contact_id being private in collection model
        const contact = (await loaders.contacts.load(
          collection.contact_id,
        )) as ContactModel;
        if (!contact)
          throw new Error('Contact id not found for this collection');

        const contactPic =
          (await ContactService.getContactPicsByUserIdAndContactId({
            contactId: contact.id,
            userId: user.id,
          })) as ContactPicModel;

        if (!contactPic) throw new Error('Permission denied');

        const res = CollectionService.deleteCollectionPaymentRecord({
          userId: user.id,
          collection,
          collectionPeriod,
        });
        return res;
      },
    ),
    updatePaymentStatus: withAuth(
      async (_, { input }, { loaders, auth: { user } }) => {
        const collectionPeriod = await getCollectionPeriod(
          input.collection_period_id,
        );

        const collection = await getCollection(input.collection_id);

        const collectionPayment = await getCollectionPayment(
          input.collection_payment_id,
        );

        const contact = (await loaders.contacts.load(
          collection.contact_id,
        )) as ContactModel;
        if (!contact)
          throw new UserInputError(
            'No matching contact id found in collections',
          );

        const res = await CollectionService.updateCollectionPaymentStatus({
          collectionPaymentId: collectionPayment.id,
          collectionPeriodId: collectionPeriod.id,
          companyId: contact.company_id,
          userId: user.id,
          status: input.status,
          remarks: input.remarks,
        });
        return res;
      },
    ),
    uploadPaymentReceipt: withAuth(
      async (_, { input, attachment }, { loaders, auth: { user } }) => {
        if (!attachment) throw new UserInputError('Receipt is required');

        const collectionPayment = await getCollectionPayment(
          input.collection_payment_id,
        );

        const collection = await getCollection(input.collection_id);

        const contact = (await loaders.contacts.load(
          collection?.contact_id,
        )) as ContactModel;

        const collectionPeriod = await getCollectionPeriod(
          input.collection_period_id,
        );

        const res = await CollectionService.uploadPaymentReceipt({
          collectionPayment,
          collectionPeriod,
          user,
          attachment,
          companyId: contact?.company_id,
        });
        return res;
      },
    ),
    assignMembersToCollection: async (root, { input }, { auth: { user } }) => {
      try {
        const collection = await getCollection(input.collectionId);
        const members = await getCompanyMembers(input.memberIds);

        const res = await CollectionService.assignMembersToCollection({
          collectionId: collection.id,
          memberIds: members.map((m) => m.id),
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    removeMembersFromCollection: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const collection = await getCollection(input.collectionId);
        const members = await getCompanyMembers(input.memberIds);

        const res = await CollectionService.removeMembersFromCollection({
          collectionId: collection.id,
          memberIds: members.map((m) => m.id),
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
  },

  CollectionStatusTypes: {
    PENDING: 1,
    PAID: 2,
  },
  CollectionPaymentTypes: {
    MANUAL: 0,
    SENANGPAY: 1,
  },
  CollectionPaymentStatusTypes: {
    PENDING: 1,
    APPROVED: 2,
    REJECTED: 3,
  },
  CollectionRemindTypes: {
    FULL: 1,
    INSTALMENT: 2,
  },
  CollectionRemindIntervalTypes: {
    Day: 'Day',
    Week: 'Week',
    Month: 'Month',
    Year: 'Year',
  },
  CollectionPeriodStatusTypes: {
    PENDING: 1,
    PAID: 2,
  },
  CollectionActiveTypes: {
    TRUE: 1,
    FALSE: 0,
  },
  CollectionDraftType: {
    TRUE: 1,
    FALSE: 0,
  },
  CollectionArchiveType: {
    TRUE: 1,
    FALSE: 0,
  },
  ReminderStatusTypes: {
    IN_PROGRESS: 1,
    SENT: 2,
    FAILED: 3,
  },
  CollectionMessageLogStatusTypes: {
    SENT: 1,
    FAILED: 2,
  },
  Collection: {
    id: ({ id_text }) => id_text,
    //deprecated
    collection_periods: async ({ id }) => {
      const res = await CollectionService.getCollectionPeriods({
        collectionId: id,
      });
      return res;
    },
    collectionPeriods: async ({ id }) => {
      const res = await CollectionService.getCollectionPeriods({
        collectionId: id,
      });
      return res;
    },
    collector: async ({ contact_id }, args, { loaders }) => {
      return await loaders.collectors.load(contact_id);
    },
    //deprecated
    remind_on_days: async ({ id }) => {
      // eslint-disable-next-line prefer-const
      let queryBy = {
        receivable_id: id,
      };
      return id
        ? await CollectionService.getCollectionRemindOnDays({
            queryBy,
          })
        : null;
    },
    remindOnDays: async ({ id }) => {
      // eslint-disable-next-line prefer-const
      let queryBy = {
        receivable_id: id,
      };
      return id
        ? await CollectionService.getCollectionRemindOnDays({
            queryBy,
          })
        : null;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    notify_pics: async ({ notify_pics }, args, { loaders }) => {
      const picIds = JSON.parse(notify_pics);
      const pics = notify_pics
        ? ((await loaders.contactPics.loadMany(picIds)) as ContactPicModel[])
        : [];
      return pics;
    },
    notifyPics: async ({ notify_pics }, args, { loaders }) => {
      const picIds = JSON.parse(notify_pics);
      const pics = notify_pics
        ? ((await loaders.contactPics.loadMany(picIds)) as ContactPicModel[])
        : [];
      return pics;
    },
    //deprecated
    reminder_status: async ({ id }, args, { loaders }) => {
      const emailHistory = await CompanyService.checkCompanyServiceHistory({
        collectionId: id,
        type: 'Email',
      });

      const whatsappHistory = await CompanyService.checkCompanyServiceHistory({
        collectionId: id,
        type: 'WhatsApp',
      });

      return {
        email: emailHistory,
        whatsapp: whatsappHistory,
      };
    },
    reminderStatus: async ({ id }, args, { loaders }) => {
      const emailHistory = await CompanyService.checkCompanyServiceHistory({
        collectionId: id,
        type: 'Email',
      });

      const whatsappHistory = await CompanyService.checkCompanyServiceHistory({
        collectionId: id,
        type: 'WhatsApp',
      });

      return {
        email: emailHistory,
        whatsapp: whatsappHistory,
      };
    },
    //deprecated
    message_logs: async ({ id }, args, { loaders }) => {
      const collection = (await loaders.collections.load(
        id,
      )) as CollectionModel;

      const messageLogs = await CollectionService.getCollectionMessageLogs(
        collection?.id,
      );

      return messageLogs;
    },
    messageLogs: async ({ id }, args, { loaders }) => {
      const collection = (await loaders.collections.load(
        id,
      )) as CollectionModel;

      const messageLogs = await CollectionService.getCollectionMessageLogs(
        collection?.id,
      );

      return messageLogs;
    },
    //deprecated
    short_link: async ({ id }) => {
      const link = (await CollectionService.getCollectionPaymentLink(id)) as
        | string
        | null;

      return link;
    },
    shortLink: async ({ id }) => {
      const link = (await CollectionService.getCollectionPaymentLink(id)) as
        | string
        | null;

      return link;
    },
    tags: async ({ id }) => {
      const res = await TagService.getTagsByCollectionId({
        collectionId: id,
      });

      return res;
    },
    assignees: async ({ id }, {}, { auth: { user } }) => {
      const res = await CollectionService.getCollectionAssignees({
        collectionId: id,
        user,
      });

      return res;
    },
    activityLogs: async ({ id }, {}, { auth: { user } }) => {
      const res = await CollectionService.getCollectionActivityLogs(id);

      return res;
    },
    dueDate: ({ due_date }) => {
      const isDate = _.isDate(due_date);
      const isNull = JSON.stringify(due_date) === 'null';

      if (!isDate || isNull) {
        return null;
      }
      return due_date.toISOString();
    },
    due_date: ({ due_date }) => {
      const isDate = _.isDate(due_date);
      const isNull = JSON.stringify(due_date) === 'null';

      if (!isDate || isNull) {
        return null;
      }

      return due_date.toISOString();
    },
  },
  CollectionReminderRead: {
    id: ({ id_text }) => id_text,
    user: async ({ user_id }, args, { loaders }) => {
      return user_id ? await loaders.users.load(user_id) : null;
    },
    collection: async ({ reminder_id }, args, { loaders }) => {
      return reminder_id ? await loaders.collections.load(reminder_id) : null;
    },
  },
  CollectionPeriod: {
    id: ({ id_text }) => id_text,
    collection: async ({ receivable_id }, args, { loaders }) => {
      return receivable_id
        ? await loaders.collections.load(receivable_id)
        : null;
    },
    payments: async ({ id, receivable_id }) => {
      const res = await CollectionService.getCollectionPeriodPayments({
        periodId: id,
        collectionId: receivable_id,
      });
      return res;
    },
  },
  CollectionPayment: {
    id: ({ id_text }) => id_text,
    collection: async ({ receivable_id }, args, { loaders }) => {
      return receivable_id
        ? await loaders.collections.load(receivable_id)
        : null;
    },
    //deprecated
    collection_period: async ({ receivable_period_id }, args, { loaders }) => {
      return receivable_period_id
        ? await loaders.collectionPeriods.load(receivable_period_id)
        : null;
    },
    collectionPeriod: async ({ receivable_period_id }, args, { loaders }) => {
      return receivable_period_id
        ? await loaders.collectionPeriods.load(receivable_period_id)
        : null;
    },
    contact: async ({ contact_id }, args, { loaders }) => {
      return contact_id ? await loaders.contacts.load(contact_id) : null;
    },
    //deprecated
    contact_pic: async ({ pic_id }, args, { loaders }) => {
      return pic_id ? await loaders.contactPics.load(pic_id) : null;
    },
    contactPic: async ({ pic_id }, args, { loaders }) => {
      return pic_id ? await loaders.contactPics.load(pic_id) : null;
    },
    //deprecated
    company_member: async ({ member_id }, args, { loaders }) => {
      return member_id ? await loaders.companyMembers.load(member_id) : null;
    },
    companyMember: async ({ member_id }, args, { loaders }) => {
      return member_id ? await loaders.companyMembers.load(member_id) : null;
    },
    //deprecated
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },

    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    deleted_by: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    deletedBy: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
  },
  CollectionRemindOnDays: {
    id: ({ id_text }) => id_text,
    collection: async ({ receivable_id }, args, { loaders }) => {
      return receivable_id
        ? await loaders.collections.load(receivable_id)
        : null;
    },
  },
  CollectionMessageLog: {
    id: ({ id_text }) => id_text,
    collection: async ({ receivable_id }, args, { loaders }) => {
      return receivable_id
        ? await loaders.collections.load(receivable_id)
        : null;
    },
  },
  CollectionActivityLog: {
    actionType: ({ actionType }) => (actionType ? actionType : null),
    collection: async ({ collectionId }, args, { loaders }) => {
      return collectionId ? await loaders.collections.load(collectionId) : null;
    },
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    createdAt: ({ createdAt }) => createdAt,
  },
  CollectionActionType: {
    COLLECTION_CREATED: 'COLLECTION_CREATED',
    COLLECTION_REMOVED: 'COLLECTION_REMOVED',
    COLLECTION_UPDATED_DUE_DATE: 'COLLECTION_UPDATED_DUE_DATE',
    COLLECTION_UPDATED_TITLE: 'COLLECTION_UPDATED_TITLE',
    COLLECTION_UPDATED_REF_NO: 'COLLECTION_UPDATED_REF_NO',
    COLLECTION_MARKED_PAID: 'COLLECTION_MARKED_PAID',
    COLLECTION_MARKED_UNPAID: 'COLLECTION_MARKED_UNPAID',
    COLLECTION_UPLOADED_PAYMENT: 'COLLECTION_UPLOADED_PAYMENT',
    COLLECTION_UPLOADED_RECEIPT: 'COLLECTION_UPLOADED_RECEIPT',
    COLLECTION_PAYMENT_REJECTED: 'COLLECTION_PAYMENT_REJECTED',
    COLLECTION_PAYMENT_APPROVED: 'COLLECTION_PAYMENT_APPROVED',
    COLLECTION_REMOVED_MEMBER: 'COLLECTION_REMOVED_MEMBER',
    COLLECTION_ADDED_MEMBER: 'COLLECTION_ADDED_MEMBER',
    COLLECTION_UPDATED_NAME: 'COLLECTION_UPDATED_NAME',
    COLLECTION_UPDATED_REMINDER: 'COLLECTION_UPDATED_REMINDER',
    COLLECTION_REMINDER_OPTION_UPDATED: 'COLLECTION_REMINDER_OPTION_UPDATED',
    COLLECTION_MANUAL_RESEND: 'COLLECTION_MANUAL_RESEND',
    COLLECTION_ARCHIVED: 'COLLECTION_ARCHIVED',
    COLLECTION_UNARCHIVED: 'COLLECTION_UNARCHIVED',
    COLLECTION_PIC_UPDATED: 'COLLECTION_PIC_UPDATED',
  },
};
