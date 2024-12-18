import { createLoaders } from '@data-access';
import { CollectionModel } from '@models/collection.model';
import { CompanyMemberModel, CompanyTeamModel } from '@models/company.model';
import { ContactPicModel } from '@models/contact.model';
import { EventCollectionPayload } from '@models/event-manager.model';
import {
  NotificationConstant,
  TaskNotificationReminderModel,
  TaskReminderConstantModel,
} from '@models/notification.model';
import { UserModel } from '@models/user.model';
import * as TEMPLATE from '@tools/email-templates';
import { getDateDuration } from '@tools/utils';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

import _ from 'lodash';

const memberName = async (member: CompanyMemberModel) => {
  const loaders = createLoaders();
  const user = (await loaders.users.load(
    member?.user_id as number,
  )) as UserModel;

  return user.name;
};

export const NOTIFICATION_USER_TYPES = {
  MEMBER: 'Member',
  PIC: 'PIC',
};

const memberType = (member: CompanyMemberModel) => {
  const type = member.type as number;
  let memberType = 'Member';

  if (type == 1) {
    memberType = 'Admin';
  } else if (type == 2) {
    memberType = 'Manager';
  } else if (type == 3) {
    memberType = 'Member';
  }

  return memberType;
};

export const parseDate = (d: string | undefined): string =>
  dayjs(d).format('DD/MM/YYYY');

export const NOTIFICATION_TYPES = {
  INVITED_TO_COMPANY: {
    value: 'InvitedToCompany',
    toMessage: (n: {
      memberName: string;
      companyName: string;
      memberType: string;
    }): string =>
      `${n.memberName} invited you to ${n.companyName} as ${n.memberType}`,
    template: TEMPLATE.ASSIGN_MEMBER_TO_COMPANY,
  },
  REMOVED_FROM_COMPANY: {
    value: 'RemovedFromCompany',
    template: TEMPLATE.REMOVE_MEMBER_FROM_COMPANY,
  },
  ASSIGNED_MEMBER_TYPE: {
    value: 'AssignedToMemberType',
    toMessage: (n: NotificationConstant): string =>
      `${memberName(
        n.member as CompanyMemberModel,
      )} assigned you as ${memberType(n.member as CompanyMemberModel)}`,
  },
  ASSIGNED_TO_TEAM: {
    value: 'AssignedToTeam',
    toMessage: (n: { memberName: string; teamName: string }): string =>
      `${n.memberName} assigned you to team ${n.teamName}`,
    template: TEMPLATE.ASSIGN_MEMBER_TO_TEAM,
  },
  REMOVED_FROM_TEAM: {
    value: 'RemovedFromTeam',
    toMessage: (n: { team: CompanyTeamModel }): string =>
      `You have been unassigned from team ${n.team.title}`,
    template: TEMPLATE.REMOVE_MEMBER_FROM_TEAM,
  },

  MEMBER_ASSIGNED_TO_TASK: {
    value: 'MemberAssignedToTask',

    toMessage: (n: { assignedBy: string; taskName: string }): string =>
      `${n.assignedBy} assigned you to ${n.taskName}`,
    template: TEMPLATE.ASSIGN_MEMBER_TO_TASK,
  },
  PIC_ASSIGNED_TO_TASK: {
    value: 'PicAssignedToTask',

    toMessage: (n: { assignedBy: string; taskName: string }): string =>
      `${n.assignedBy} assigned you to ${n.taskName}`,
    template: TEMPLATE.ASSIGN_PIC_TO_TASK,
  },

  COMMENT_ON_TASK: {
    value: 'CommentOnTask',

    toMessage: (n: { username: string; taskName: string }): string =>
      `${n.username} mentioned you in a comment in ${n.taskName}`,
    toDescription: (taskDesc: string): string => taskDesc,
    template: TEMPLATE.NOTIFY_ON_TASK_COMMENT,
  },
  COMMENT_ON_TASK_COLLAB: {
    value: 'CommentOnTask',
    toMessage: (n: { username: string; taskName: string }): string =>
      `${n.username} mentioned you in a comment in ${n.taskName}`,
    toDescription: (taskDesc: string): string => taskDesc,
    template: TEMPLATE.NOTIFY_ON_TASK_COMMENT_COLLAB,
  },
  COMMENT_ON_TASK_SHARED: {
    value: 'CommentOnTask',
    toMessage: (n: { username: string; taskName: string }): string =>
      `${n.username} mentioned you in a comment in ${n.taskName}`,
    toDescription: (taskDesc: string): string => taskDesc,
    template: TEMPLATE.NOTIFY_ON_TASK_COMMENT_SHARED,
  },
  UPLOAD_TO_TASK: {
    value: 'UploadToTask',
    toMessage: (n: { picName: string; taskName: string }): string =>
      `${n.picName} has uploaded a file to ${n.taskName}`,
    template: TEMPLATE.PIC_UPLOAD_DOCUMENT,
  },
  TASK_REMINDER: <TaskReminderConstantModel>{
    value: 'TaskReminder',
    toMessage: (n: { eventTask: TaskNotificationReminderModel }): string =>
      `${n.eventTask.name} is due on ${dayjs(n.eventTask.dueDate)
        .add(8, 'hour') //FIXME: Fix before going global
        .format('LLL')} and it requires your attention.`,
    PIC: {
      template: TEMPLATE.TASK_REMINDER_PIC,
    },
    MEMBER: {
      template: TEMPLATE.TASK_REMINDER_MEMBER,
    },
  },
  TASK_ON_DUE: <TaskReminderConstantModel>{
    value: 'TaskOnDue',
    toMessage: (n: { eventTask: TaskNotificationReminderModel }): string =>
      `${n.eventTask.name} is due on ${dayjs(n.eventTask.dueDate)
        .add(8, 'hour')
        .format('LLL')} and it requires your attention.`,
    PIC: {
      template: TEMPLATE.TASK_ON_DUE_PIC,
    },
    MEMBER: {
      template: TEMPLATE.TASK_ON_DUE_MEMBER,
    },
  },
  TASK_OVERDUE: <TaskReminderConstantModel>{
    value: 'TaskOverdue',
    toMessage: (n: { eventTask: TaskNotificationReminderModel }): string =>
      `${n.eventTask.name} is overdue on ${dayjs(n.eventTask.dueDate)
        .add(8, 'hour')
        .format('LLL')} and it requires your attention.`,
    PIC: {
      template: TEMPLATE.TASK_OVERDUE_PIC,
    },
    MEMBER: {
      template: TEMPLATE.TASK_OVERDUE_MEMBER,
    },
  },
  PROJECT_REMINDER: <TaskReminderConstantModel>{
    value: 'ProjectTaskReminder',
    toMessage: (n: { eventTask: TaskNotificationReminderModel }): string =>
      `${n.eventTask.name} is starting in ${dayjs(n?.eventTask?.dueDate)
        .add(8, 'hour')
        .add(n?.eventTask?.dueReminder || 0, 'minute')
        .diff(dayjs(), 'day')} days and it requires your attention.`,
    PIC: {
      template: TEMPLATE.TASK_REMINDER_PIC,
    },
    MEMBER: {
      template: TEMPLATE.TASK_REMINDER_MEMBER,
    },
  },
  PROJECT_ON_DUE: <TaskReminderConstantModel>{
    value: 'ProjectTaskOnDue',
    toMessage: (n: { eventTask: TaskNotificationReminderModel }): string =>
      `${n.eventTask.name} is starting today and it requires your attention.`,
    PIC: {
      template: TEMPLATE.TASK_ON_DUE_PIC,
    },
    MEMBER: {
      template: TEMPLATE.TASK_ON_DUE_MEMBER,
    },
  },
  PROJECT_OVERDUE: <TaskReminderConstantModel>{
    value: 'ProjectTaskOverdue',
    toMessage: (n: { eventTask: TaskNotificationReminderModel }): string =>
      `${n.eventTask.name} is overdue on ${dayjs(n.eventTask.dueDate).format(
        'LL',
      )} and it requires your attention.`,
    PIC: {
      template: TEMPLATE.TASK_OVERDUE_PIC,
    },
    MEMBER: {
      template: TEMPLATE.TASK_OVERDUE_MEMBER,
    },
  },
  SUBTASK_DONE: {
    value: 'SUBTASK_DONE',
    toMessage: (n: { picName: string; taskName: string }): string =>
      `${n.picName} has marked the checklist in ${n.taskName}.`,
  },
  COLLECTION_CREATED: {
    value: 'CollectionCreated',
    toMessage: (n: {
      companyName: string;
      collection: { title: string; payable_amount: number };
    }): string =>
      `${n.companyName} has created a receivable reminder "${n.collection?.title}" with amount RM${n.collection?.payable_amount}.`,
    template: TEMPLATE.COLLECTION_CREATED,
  },
  COLLECTION_DUE: {
    value: 'CollectionDue',
    toMessage: (
      data?: EventCollectionPayload,
      collection?: CollectionModel,
    ): string => {
      return `This is a reminder that ${
        data ? data.title : collection?.title
      } for RM${_.get(
        data,
        'total_due',
        collection?.payable_amount,
      )} is due on ${parseDate(
        _.get(data, 'due_date', collection?.due_date),
      )}. Please upload payment proof if the payment was made.`;
    },
    template: TEMPLATE.COLLECTION_ON_DUE,
  },
  COLLECTION_DUE_SP: {
    value: 'CollectionDueSp',
    toMessage: (
      data?: EventCollectionPayload,
      collection?: CollectionModel,
    ): string => {
      return `This is a reminder that SP for ${
        data ? data.title : collection?.title
      } for RM${_.get(
        data,
        'total_due',
        collection?.payable_amount,
      )} is due on ${parseDate(
        _.get(data, 'due_date', collection?.due_date),
      )}. Kindly make the payment or ignore if the payment has been made.`;
    },
    template: TEMPLATE.COLLECTION_ON_DUE,
  },
  COLLECTION_OVERDUE: {
    value: 'CollectionOverdue',
    toMessage: (data: EventCollectionPayload): string => {
      const duration = getDateDuration(dayjs(), _.get(data, 'due_date'));
      return `${_.get(data, 'title', '')} for RM${_.get(
        data,
        'total_due',
        0,
      )} is overdue by ${
        duration.days
      } days. If the payment has already made, please upload payment proof.`;
    },
    template: TEMPLATE.COLLECTION_OVERDUE,
  },
  COLLECTION_OVERDUE_SP: {
    value: 'CollectionOverdue',
    toMessage: (data: EventCollectionPayload): string => {
      const duration = getDateDuration(dayjs(), _.get(data, 'due_date'));
      return `${_.get(data, 'title', '')} for RM${_.get(
        data,
        'total_due',
        0,
      )} is overdue by ${
        duration.days
      } days. If payment has been made, please ignore this message.`;
    },
    template: TEMPLATE.COLLECTION_OVERDUE,
  },
  COLLECTION_PAYMENT_REJECTED: {
    value: 'CollectionPaymentRejected',
    toMessage: (n: {
      memberName: string;
      companyName: string;
      collectionName: string;
    }): string =>
      `${n.memberName} from ${n.companyName} has rejected the proof of payment for ${n.collectionName}`,
    template: TEMPLATE.COLLECTION_PAYMENT_REJECTED,
    toData: JSON.stringify,
  },
  COLLECTION_MARKED_AS_PAID: {
    value: 'CollectionMarkedAsPaid',
    toMessage: (n: {
      memberName: string;
      companyName: string;
      collectionName: string;
    }): string =>
      `${n.memberName} from ${n.companyName} has marked payment proof as paid for ${n.collectionName}`,
    toData: JSON.stringify,
  },
  COLLECTION_PAYMENT_PROOF: {
    value: 'CollectionPaymentProof',
    toMessage: (n: {
      picName: string;
      contactName: string;
      collectionName: string;
    }): string =>
      `${n.picName} from ${n.contactName} has uploaded a proof of payment for ${n.collectionName}`,
    template: TEMPLATE.PAYMENT_PROOF_UPLOADED,
  },
  COLLECTION_RECEIPT: {
    value: 'CollectionReceipt',
    toMessage: (n: {
      memberName: string;
      companyName: string;
      collectionName: string;
    }): string =>
      `${n.memberName} from ${n.companyName} has uploaded a receipt for ${n.collectionName}`,
  },
  COLLECTION_PAYMENT_RECEIVED: {
    value: 'CollectionPaymentReceived',
    toMessage: (n: {
      memberName: string;
      companyName: string;
      collectionName: string;
    }): string =>
      `${n.memberName} from ${n.companyName} has accepted the proof of payment for ${n.collectionName}`,
    template: TEMPLATE.COLLECTION_PAYMENT_ACCEPT,
  },
  COLLECTION_PAYMENT_RECEIVED_SP: {
    value: 'CollectionPaymentReceivedSp',
    toMessage: (n: { contactName: string; collectionName: string }): string =>
      `A person in charge from ${n.contactName} has paid for ${n.collectionName}`,
    template: TEMPLATE.COLLECTION_PAYMENT_ACCEPT,
  },
  QUOTA_EXCEED: {
    value: 'QuotaExceed',
    title: 'Quota Exceeded',
    toMessage: (n: { services: string[]; companyName: string }): string => {
      return `Your have exceeded quota limit for ${_.join(
        n.services,
        ', ',
      )} under ${n.companyName}.`;
    },
    template: TEMPLATE.QUOTA_EXCEEDED,
  },
  SENANGPAY_ACTIVATION: {
    value: 'SenangPayActivation',
    template: TEMPLATE.SENANGPAY_ACTIVATION,
  },
  SENANGPAY_TRANSACTION_FULL: {
    value: 'SenangPayTransactionFull',
    template: TEMPLATE.SENANGPAY_TRANSACTION_FULL,
  },
  SENANGPAY_TRANSACTION_RECURRING: {
    value: 'SenangPayTransactionRecurring',
    template: TEMPLATE.SENANGPAY_TRANSACTION_RECURRING,
  },
  FPX_TRANSACTION_STATUS: {
    value: 'FpxTransactionStatus',
    template: TEMPLATE.FPX_TRANSACTION_STATUS,
  },
  DEDOCO_REQUEST_SIGN: {
    value: 'DedocoRequestSign',
    template: TEMPLATE.DEDOCO_REQUEST_SIGNATURE,
  },
  CLOCK_IN_BEFORE_TEN_MINUTES: {
    value: 'ClockInBeforeTenMinutes',
    title: 'Clock In Reminder',
    toMessage: (): string =>
      'Just to remind you to clock in for work today. Click here to clock in.',
  },
  CLOCK_IN_AFTER_TEN_MINUTES: {
    value: 'ClockInAfterTenMinutes',
    title: 'Clock In Reminder',
    toMessage: (): string =>
      'It looks like you have not clock in for today. Click here to clock in.',
  },
  CLOCK_OUT_AFTER_TWO_HOURS: {
    value: 'ClockOutAfterTwoHours',
    title: 'Clock Out Reminder',
    toMessage: (): string =>
      'It looks like you have not clock out for today. Click here to clock out.',
  },
  LOW_QUOTA: {
    value: 'LowQuota',
    title: 'Low Quota',

    toMessage: (n: {
      lowQuotaServicesString: string;
      companyName: string;
    }): string => {
      return `Your quota for ${n.lowQuotaServicesString} under ${n.companyName} is almost running out.`;
    },

    template: TEMPLATE.LOW_QUOTA,
  },
};

export const NOTIFICATION_TEMPLATE_TYPES = {
  ASSIGNED_TO_TASK: 1,
  COMMENT_ON_TASK: 2,
  UPLOAD_TO_TASK: 3,
  TASK_REMINDER: 4,
  TASK_ON_DUE: 5,
  TASK_OVERDUE: 6,
  PROJECT_REMINDER: 7,
  PROJECT_ON_DUE: 8,
  PROJECT_OVERDUE: 9,
  SUBTASK_DONE: 10,
  COLLECTION_CREATED: 11,
  COLLECTION_DUE: 12,
  COLLECTION_DUE_SP: 13,
  COLLECTION_OVERDUE: 14,
  COLLECTION_PAYMENT_REJECTED: 15,
  COLLECTION_MARKED_AS_PAID: 16,
  COLLECTION_PAYMENT_PROOF: 17,
  COLLECTION_RECEIPT: 18,
  COLLECTION_PAYMENT_RECEIVED_SP: 19,
  QUOTA_EXCEED: 20,
  CLOCK_IN_BEFORE_TEN_MINUTES: 21,
  CLOCK_IN_AFTER_TEN_MINUTES: 22,
  CLOCK_OUT_AFTER_TWO_HOURS: 23,
  INVITED_TO_COMPANY: 24,
  ASSIGNED_MEMBER_TYPE: 25,
  ASSIGNED_TO_TEAM: 26,
  REMOVED_FROM_TEAM: 27,
  COLLECTION_OVERDUE_SP: 28,
  LOW_QUOTA: 29,
  STAGE_CHANGED: 30,
  TASK_DELETED: 31,
  BOARD_DELETED: 32,
  STATUS_CHANGED: 33,
  WATCHER_ASSIGNED_TO_TASK: 34,
};

export default {
  NOTIFICATION_TYPES,
  NOTIFICATION_TEMPLATE_TYPES,
};
