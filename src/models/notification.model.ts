import { CollectionId, CollectionPeriodId } from './collection.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
} from './company.model';
import { ContactId, ContactPicId, ContactPicModel } from './contact.model';
import { EventCollectionPayload } from './event-manager.model';
import {
  TaskBoardId,
  TaskBoardPublicId,
  TaskCommentId,
  TaskId,
  TaskPublicId,
} from './task.model';
import { TeamId } from './team.model';
import { UserId } from './user.model';

export type NotificationPublicId = string;
export type NotificationId = number;
export type NotificationModel = {
  id: number;
  id_text: string;

  type: string;
  title: string;
  message: string;
  description: string;
  data: string;
  user_id?: UserId;
  // TODO: update types when the rest are done up
  member_id?: number;
  pic_id?: number;
  contact_id?: number;
  memberType?: number;
  card_id?: number;
  comment_id?: number;
  job_id?: number;
  team_id?: number;
  company_id?: number;
  receivable_id?: number;
  receivable_period_id?: number;
  card_status: number;

  due_date: string;

  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type UserNotificationModel = {
  notification_id: NotificationId;
  user_id: UserId;
  username: string;
  is_read: number;
  user_type: string;
  created_at: string;
  id_text: string;
};

export interface NotificationPayload {
  limit: number;
  offset: number;
  companyId: CompanyId;
  userId: UserId;
  type: string;
}

export interface NotificationCountPayload {
  companyId: CompanyId;
  userId: UserId;
  type: string;
}

export interface CreateNotificationPayload {
  type: string;
  title: string;
  message?: string;
  description?: string;
  data?: string;
  user_id?: UserId;
  member_id?: CompanyMemberId;
  pic_id?: ContactPicId;
  contact_id?: ContactId;
  memberType?: number;
  card_id?: TaskId;
  comment_id?: TaskCommentId;
  job_id?: TaskBoardId;
  team_id?: TeamId;
  company_id?: CompanyId;
  receivable_id?: CollectionId;
  receivable_period_id?: CollectionPeriodId;
  card_status?: number;
  due_date?: string;
}

export interface CreateAssignNotification extends CreateNotificationPayload {
  title: string;
  message: string;
  data: string;
  user_id: UserId;
  member_id: CompanyMemberId;
  company_id: CompanyId;
}

export interface AssignNotificationPayload {
  notification_id: NotificationId;
  user_id: UserId;
  username: string | null;
  user_type: string;
}

export interface AssignTeamNotificationPayload {
  title: string;
  message: string;
  user_id: UserId;
  member_id: CompanyMemberId;
  company_id: CompanyId;
  data: string;
}

export type NotificationType = { [key: string]: number };

export interface NotificationConstant extends EventCollectionPayload {
  company?: CompanyModel;
  member?: CompanyMemberModel;
  pic?: ContactPicModel;
}

export type MessageServiceModel = {
  whatsApp: {
    notify: any;
    quota: number;
  };
  email: {
    notify: any;
    quota: number;
  };
  subscriptionId: number;
};

export type MessageServicesStatus = {
  whatsApp: boolean;
  sms: boolean;
  email: boolean;
};

export type TaskNotificationReminderModel = {
  id: TaskId;
  id_text: TaskPublicId;
  name: string;
  status: number;
  taskBoardId: TaskBoardId;
  taskBoardPublicId: TaskBoardPublicId;
  taskBoardType: string;
  companyId: CompanyId;
  companyName: string;
  companyLogoUrl: string;
  dueDate: string;
  dueReminder: number | null;
  notificationId: NotificationId | null;
  remindAt?: string;
  isOverdue?: number;
  isOnDue?: number;
  category?: number;
  companySlug: string;
  taskBoardName: string;
  defaultTimezone: string;
};

export type NotificationConstantModel = {
  PROJECT_REMINDER?: TaskReminderConstantModel;
  PROJECT_ON_DUE?: TaskReminderConstantModel;
  PROJECT_OVERDUE?: TaskReminderConstantModel;
  TASK_REMINDER?: TaskReminderConstantModel;
  TASK_ON_DUE?: TaskReminderConstantModel;
  TASK_OVERDUE?: TaskReminderConstantModel;
};

export type TaskReminderConstantModel = {
  value: string;
  toMessage: (n: { eventTask: TaskNotificationReminderModel }) => string;
  PIC?: { template: string };
  MEMBER?: { template: string };
};
