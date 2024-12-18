import { Resolvers } from '@generated/graphql-types';
import { CompanyModel } from '@models/company.model';
import {
  CollectionService,
  EventManagerService,
  NotificationService,
  SubscriptionService,
} from '@services';
import { withAuth } from '@graphql/wrappers';
import {
  CollectionModel,
  CollectionPeriodModel,
} from '@models/collection.model';
import { EventCollectionPayload } from '@models/event-manager.model';
import { NotificationModel } from '@models/notification.model';
import { UserModel } from '@models/user.model';
import _ from 'lodash';
import { TaskCommentModel } from '@models/task.model';
import { ContactModel } from '@models/contact.model';

export const resolvers: Resolvers = {
  Mutation: {
    resendCollectionNotification: withAuth(
      async (_, { collectionId }, { loaders, auth: { user } }) => {
        const collection = (await loaders.collections.load(
          collectionId,
        )) as CollectionModel;

        const contact = (await loaders.contacts.load(
          collection.contact_id,
        )) as ContactModel;
        const company = (await loaders.companies.load(
          contact.company_id,
        )) as CompanyModel;

        const collectionPeriods = (await CollectionService.getCollectionPeriods(
          {
            collectionId: collection.id,
          },
        )) as CollectionPeriodModel[];

        const evtCollection =
          (await EventManagerService.getEventManagerCollection({
            collection,
            periodIds: collectionPeriods.map((cp) => cp.id),
            company,
          })) as EventCollectionPayload;

        //-------------Check quota if okay -------------------
        const isPaidCompany = await SubscriptionService.isPaidCompany(
          contact.company_id,
        );

        if (isPaidCompany) {
          await NotificationService.checkQuotaBeforeCreateCollection({
            companyId: contact.company_id,
            serviceNotify: {
              emailNotify: collection.email_notify ? true : false,
              whatsAppNotify: collection.whatsapp_notify ? true : false,
            },
            contactId: contact.id,
            loaders,
          });
        }
        //------------------end check quota-----------------------------------

        await EventManagerService.handleCollectionReminderEvent({
          data: evtCollection,
          overdue: false,
          isResend: true,
          isCreate: false,
        });

        return collection;
      },
    ),
  },
  Notification: {
    id: ({ id_text }) => id_text,
    task: async ({ card_id }, args, { loaders, auth: { user } }) => {
      if (card_id) {
        return await loaders.tasks.load(card_id);
      } else {
        return null;
      }
    },
    collection: async ({ receivable_id }, args, { loaders }) => {
      if (receivable_id)
        return (await loaders.collections.load(
          receivable_id,
        )) as CollectionModel;
      return null;
    },
    comment: async ({ comment_id }, args, { loaders }) => {
      if (comment_id)
        return (await loaders.taskComments.load(
          comment_id,
        )) as TaskCommentModel;
      return null;
    },
  },
  UserNotification: {
    id: ({ id_text }) => id_text,
    notification: async ({ notification_id }, args, { loaders }) => {
      if (notification_id)
        return (await loaders.notifications.load(
          notification_id,
        )) as NotificationModel;
      return null;
    },
    user: async ({ user_id }, args, { loaders }) => {
      return (await loaders.users.load(user_id)) as UserModel;
    },
    is_read: async ({ is_read, notification_id }, args, { loaders }) => {
      if (is_read) return true;

      return false;
    },
  },
  UserNotificationType: {
    MEMBER: 'Member',
    PIC: 'PIC',
  },
  NotificationType: {
    GENERIC: 'GENERIC',
    ASSIGNED_AS_CREATOR: 'ASSIGNED_AS_CREATOR',
    INVITED_TO_COMPANY: 'INVITED_TO_COMPANY',
    JOIN_COMPANY_BY_CODE: 'JOIN_COMPANY_BY_CODE',
    REMOVED_FROM_COMPANY: 'REMOVED_FROM_COMPANY',
    ASSIGNED_MEMBER_TYPE: 'ASSIGNED_MEMBER_TYPE',
    ASSIGNED_TO_TEAM: 'ASSIGNED_TO_TEAM',
    REMOVED_FROM_TEAM: 'REMOVED_FROM_TEAM',
    MEMBER_ASSIGNED_TO_TASKBOARD: 'MEMBER_ASSIGNED_TO_TASKBOARD',
    MEMBER_REMOVED_FROM_TASKBOARD: 'MEMBER_REMOVED_FROM_TASKBOARD',
    PIC_ASSIGNED_TO_TASKBOARD: 'PIC_ASSIGNED_TO_TASKBOARD',
    PIC_REMOVED_FROM_TASKBOARD: 'PIC_REMOVED_FROM_TASKBOARD',
    MEMBER_ASSIGNED_TO_TASK: 'MEMBER_ASSIGNED_TO_TASK',
    MEMBER_REMOVED_FROM_TASK: 'MEMBER_REMOVED_FROM_TASK',
    PIC_ASSIGNED_TO_TASK: 'PIC_ASSIGNED_TO_TASK',
    PIC_REMOVED_FROM_TASK: 'PIC_REMOVED_FROM_TASK',
    COMMENT_ON_TASK: 'COMMENT_ON_TASK',
    UPLOAD_TO_TASK: 'UPLOAD_TO_TASK',
    TASK_DUE_MEMBER: 'TASK_DUE_MEMBER',
    TASK_DUE_PIC: 'TASK_DUE_PIC',
    TASK_OVERDUE_MEMBER: 'TASK_OVERDUE_PIC',
    TASK_OVERDUE_PIC: 'TASK_OVERDUE_PIC',
    TASK_REJECTED: 'TASK_REJECTED',
    TASK_DONE: 'TASK_DONE',
    COLLECTION_CREATED: 'COLLECTION_CREATED',
    COLLECTION_DUE: 'COLLECTION_DUE',
    COLLECTION_OVERDUE: 'COLLECTION_OVERDUE',
    COLLECTION_PAYMENT_RECEIVED: 'COLLECTION_PAYMENT_RECEIVED',
    COLLECTION_PAYMENT_REJECTED: 'COLLECTION_PAYMENT_REJECTED',
    COLLECTION_CANCELLED: 'COLLECTION_CANCELLED',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    SENANGPAY_ACTIVATION: 'SENANGPAY_ACTIVATION',
    SENANGPAY_TRANSACTION_FULL: 'SENANGPAY_TRANSACTION_FULL',
    SENANGPAY_TRANSACTION_RECURRING: 'SENANGPAY_TRANSACTION_RECURRING',
    FPX_TRANSACTION_STATUS: 'FPX_TRANSACTION_STATUS',
    DEDOCO_SIGN_REQUEST: 'DEDOCO_SIGN_REQUEST',
    PROJECT_REMINDER: 'PROJECT_REMINDER',
    PROJECT_ON_DUE: 'PROJECT_ON_DUE',
    PROJECT_OVERDUE: 'PROJECT_OVERDUE',
    CLOCK_IN_BEFORE_TEN_MINUTES: 'CLOCK_IN_BEFORE_TEN_MINUTES',
    CLOCK_IN_AFTER_TEN_MINUTES: 'CLOCK_IN_AFTER_TEN_MINUTES',
    CLOCK_OUT_AFTER_TWO_HOURS: 'CLOCK_OUT_AFTER_TWO_HOURS',
  },
};
