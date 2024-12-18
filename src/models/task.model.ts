import {
  CompanyId,
  CompanyMemberId,
  CompanyModel,
  CompanyTeamModel,
  CompanyMemberModel,
} from './company.model';
import { ContactId, ContactModel, ContactPicId } from '@models/contact.model';
import { UserId, UserModel, UserPublicId } from './user.model';
import { ReadStream } from 'fs-capacitor';

import { TeamId } from './team.model';
import { GraphQLScalarType } from 'graphql';
import { TemplateId } from './template.model';
import { TagId } from './tag.model';
import { PaginationFilter } from './filter.model';

export type TaskId = number;
export type TaskBoardId = number;

export type ProjectId = number;

export type TaskBoardTeamId = number;
export type TaskCommentId = number;
export type TaskStatusId = number;
export type TaskAttachmentId = number;
export type SubtaskId = number;
export type TaskActivityId = number;
export type TaskTimerEntryId = number;
export type TaskBoardFolderId = number;

export type TaskPublicId = string;
export type TaskBoardPublicId = string;
export type TaskBoardTeamPublicId = string;
export type TaskStatusPublicId = string;
export type TaskMemberPublicId = string;
export type TaskPicPublicId = string;
export type TaskCommentPublicId = string;
export type TaskAttachmentPublicId = string;
export type SubtaskPublicId = string;
export type TaskActivityPublicId = string;

export type ProjectClaimId = number;
export type ProjectClaimPublicId = string;

export type ProjectTimeCostId = number;
export type ProjectTimeCostPublicId = number;

export type AffectedRowsResult = number;

export type ProjectBillingAuditLogPublicId = string;
export type ProjectBillingAuditLogId = number;
export type ProjectTemplateId = number;
export type ProjectTemplatePublicId = string;
export type ProjectStatusId = number;
export type ProjectStatusPublicId = string;
export type ProjectTemplateStatusId = number;
export type ProjectTemplateStatusPublicId = string;

export type ProjectGroupId = number;
export type ProjectGroupPublicId = number;

export type TaskBoardModel = {
  id: TaskBoardId;
  company: CompanyModel;
  tasks: TaskModel[];
  contact: ContactModel;
  companyId: CompanyId;

  type: string;
  category: number;
  name: string;
  description: string;
  comment: string;
  color: string;
  status: number;
  slug: string;
  archived: number;
  visibility: number;
  pinned: number;

  timeline: { start: null | Date; end: null | Date };

  createdBy: number;
  updatedBy: number;
  deletedBy: number;
  published: number;

  // --------------------------------------
  // TODO: Deprecate the underscored fields below
  company_id: CompanyId;
  contact_id: ContactId;
  id_text: TaskBoardPublicId;

  // team: Team;
  team_id: TeamId;

  created_at: string; // deprecated
  updated_at: string; // deprecated
  deleted_at: string; // deprecated

  associate_by: number;
  created_by: number;
  updated_by: number;
  deleted_by: number;
};

export type ProjectModel = TaskBoardModel;

export type TaskModelRefactor = {
  id: TaskId;
  jobId: ProjectId;
  parentId: TaskId;
  idText: TaskPublicId;
  name: string;
  description: string;
  value: number;
  dueDate: string;
  dueReminder: number;
  lastRemindOn: string;
  startDate: string;
  endDate: string;
  plannedEffort: number;
  projectedCost: number;
  actualCost: number;
  actualStart: string;
  actualEnd: string;
  fileType: string;
  status: number;
  sequence: number;
  subStatusId: number;
  completed: number;
  archived: number;
  boardType?: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string;

  createdBy: number;
  type: number;
  teamId: TeamId;
  templateId: TemplateId;
  priority: number;
  visibility: number;
  pinned: number;
  published: number;
  statusId: number;
  groupId: ProjectGroupId;

  posY?: number | undefined | null; // NOTE: Not always available, needs to be a table join
};

export type TaskModel = {
  id: TaskId;
  jobId: ProjectId;
  parentId: TaskId;

  // FIXME: Deprecate all these underscore thangs
  id_text: TaskPublicId;
  id_bin: string;
  name: string;
  description: string;
  value: number;
  due_date: string;
  due_reminder: number;
  last_remind_on: string;
  start_date: string;
  end_date: string;
  planned_effort: number;
  projected_cost: number;
  actual_cost: number;
  actual_start: string;
  actual_end: string;
  file_type: string;
  status: number;
  sequence: number;
  sub_status_id: number;
  completed: number;
  job_id: number;
  archived: number;
  board_type?: string;

  created_at: string;
  updated_at: string;
  deleted_at: string;

  created_by: number;
  createdBy: number;
  type: number;
  team: CompanyTeamModel;
  team_id: TeamId;
  template_id: TemplateId;
  priority: number;
  visibility: number;
  pinned: number;
  published: number;
  status_id: number;
  parent_id: TaskId;
  groupId: ProjectGroupId;
  group_id: ProjectGroupId;
};

export type TaskFilter = {
  ids?: TaskId[];
  boardType?: string | null;
  stage?: string | null;
  subStatusId?: number;
  contactIds?: ContactId[];
  priority?: string | null;
  dueDateRange?: [string, string];
  memberOwnerIds?: CompanyMemberId[];
  memberAssigneeIds?: CompanyMemberId[];
  startDateRange?: [string, string];
  picIds?: ContactPicId[];
  tagIds?: TagId[];
  isRecurring?: boolean;
  isOverdue?: boolean;
  category?: string;
  userId?: UserId;
} & PaginationFilter;

export type TaskBoardFilter = {
  boardType?: string | null;
  category?: string;
  userId?: UserId;
  memberOwnerIds?: CompanyMemberId[];
  memberAssigneeIds?: CompanyMemberId[];
  tagIds?: TagId[];
  isOverdue?: boolean;
  dueDateRange?: [string, string];
  startDateRange?: [string, string];
} & PaginationFilter;

export type TaskSort = {
  direction?: 'asc' | 'desc';
  type?: string;
};

export type TaskBoardSort = {
  direction?: 'asc' | 'desc';
  type?: string;
};

export type TaskStatusModelRefactor = {
  id: TaskStatusId;
  idText: TaskStatusPublicId;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  createdBy: UserId;
  updatedBy: UserId;
  deletedBy: UserId;
  teamId: TeamId;
  parentStatus: TaskStatusId;
  stage: number;
  label: string;
  percentage: number;
  sequence: number;
  color: string;
};

export type TaskStatusModel = {
  id: TaskStatusId;
  idText: TaskStatusPublicId;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  createdBy: UserId;
  updatedBy: UserId;
  deletedBy: UserId;
  teamId: TeamId;
  parentStatus: TaskStatusId;
  stage: number;
  label: string;
  percentage: number;
  sequence: number;
  color: string;

  // TODO: DEPRECATE

  id_text: TaskStatusPublicId;
  team_id: TeamId;
  parent_status: number;
  created_by: UserId;
  updated_by: UserId;
  deleted_by: UserId;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type TaskCommentModel = {
  id: TaskCommentId;
  id_text: TaskCommentPublicId;
  parent_id: TaskCommentId;
  message: string;
  message_content: string;
  user_id: UserId;
  card_id: TaskId;
  created_by: UserId;

  attachments: TaskAttachmentModel[];
};

export type TaskBoardTeamModel = {
  id: number;
  job_id: number;
  team_id: number;
  id_text: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type TaskMemberModel = {
  id_text: TaskMemberPublicId;
  card_id: TaskId;
  member_id: number;
  user_id: UserId;
};

export type TaskPicModel = {
  idText: TaskPicPublicId;
  cardId: TaskId;
  contactId: ContactId;
  picId: number;
  userId: number;

  id_text: TaskPicPublicId;
  card_id: TaskId;
  contact_id: ContactId;
  pic_id: number;
  user_id: number;
};

export type TaskAttachmentModel = {
  id: TaskAttachmentId;
  id_text: TaskAttachmentPublicId;
  card_id: TaskId;
  name: string;
  type: string;
  file_size: number;
  path: string;
  url: string;
  document_hash: string;

  created_by: UserId;
  updated_by: UserId;
  deleted_by: UserId;

  created_at: string;
  updated_at: string;
  deleted_at: string;

  deletedAt: string;
  commentId?: TaskCommentId;
};

export type TaskActivityModel = {
  id: TaskActivityId;
  id_text: TaskActivityPublicId;
  card_id: TaskId;
  action_type: string;
  field_name: string;
  from_value_to: string;
  to_value: string;
  from_date: string;
  to_date: string;
  from_label: string;
  to_label: string;
  target_pic_id: ContactPicId;
  target_member_id: CompanyMemberId;
  attachment_id: TaskAttachmentId;
  from_card_status_id: TaskStatusId;
  to_card_status_id: TaskStatusId;
  created_by: UserId;
  created_at: string;
};

// TODO: Deprecate this. It's now called checklist and the actual subtask is just another task
export type SubtaskModel = {
  id: SubtaskId;
  checked: number;
  card_id: TaskId;
  sequence: number;
  title: string;
  created_by: UserId;
  updated_by: UserId;
  deleted_by: UserId;
  created_at: string;
  updated_at: string;
};

export type ChecklistModel = {
  id: SubtaskId;
  checked: number;
  card_id: TaskId;
  sequence: number;
  title: string;
  created_by: UserId;
  updated_by: UserId;
  deleted_by: UserId;
  created_at: string;
  updated_at: string;
};

export type TaskActivityItemModel = {
  id: TaskActivityId;
  action_type: number;
};

export type TaskBoardOwnerModel = {
  jobId: number;
  companyMemberId: number;
};

export type MemberIdAndUserId = {
  user_id: UserId;
  id: CompanyMemberId;
};

export type ContactPicIdAndUserId = {
  pic_id: ContactPicId;
  user_id: UserId;
  contact_id: ContactId;
};

export type MessageObjModel = {
  message: string | null;
  mentionedUsers:
    | {
        mentionedUser: UserModel;
        isMember: boolean;
      }[]
    | null;
};

export interface TaskCreateMemberPayload {
  members: MemberIdAndUserId[];
}

export interface TaskMemberDeletePayload {
  members: CompanyMemberModel[];
}

export interface TaskCreatePicPayload {
  pics: ContactPicIdAndUserId[];
}

export interface SubtaskPayload extends SubtaskInitialPayload {
  sequence: number;
}

export interface SubtaskInitialPayload {
  title: string;
  card_id: TaskId;
  created_by: UserId;
}

export interface TaskCommentPayload {
  taskId: TaskId;
  userId: UserId;
  parentId?: TaskCommentId;
  messageContent?: string;
  message: string | null;
}

export interface TaskCreateInitialPayload {
  name: string;
  description?: string;
  createdBy: UserId;
  jobId: TaskBoardId;
  teamId?: TeamId;
  subStatusId?: string | number | null;
  dueDate?: string;
  status?: number;
  value?: number;
  startDate?: string;
  endDate?: string;
  plannedEffort?: number;
  projectedCost?: number;
  priority?: number;
  visibility?: number;
  published?: boolean;
}

export interface TaskCreatePayload extends TaskCreateInitialPayload {
  sequence: number;
  status: number;
  actualStart?: string;
  actualEnd?: string;
}

export interface TaskAttachmentPayload extends GraphQLScalarType {
  createReadStream(): ReadStream;
  filename: string;
  mimetype: string;
  encoding: string;
}

export interface AttachmentPayload {
  name: string;
  type: string;
  file_size: number;
  url: string;
  card_id: TaskId;
  document_hash: string;
  created_by: UserId;
  updated_by: UserId;
  path: string;
}
export interface TaskBoardPayload {
  name?: string;
  description?: string;
  company_id: CompanyId;
  type: string;
  category?: number;
  associate_by: number;
  created_by: UserId;
  status: number;
  contact_id?: ContactId;
  color?: string;
}

export interface TaskUpdatePayload {
  name?: string;
  dueDate?: string;
  sequence?: number;
  description?: string;
  subStatusId?: number;
  updatedBy: UserId | UserPublicId;
  dueReminder?: number;
  status?: number;
  dueDateUpdatedAt?: string;
  value?: number;
  startDate?: string;
  endDate?: string;
  actualStart?: string | null;
  actualEnd?: string | null;
  actualValue?: number | null;
  actualEffort?: number | null;
  priority?: number;
  plannedEffort?: number;
  projectedCost?: number;
  teamId?: number;
  visibility?: number;
  published?: boolean;
  statusId?: ProjectStatusId;
}

export interface SubtaskUpdatePayload {
  title?: string;
  updated_by: UserId;
  checked?: number;
}

export interface TaskCommentUpdatePayload {
  message?: string;
  messageContent?: string;
  updatedBy: UserId;
}

export interface TaskBoardUpdatePayload {
  name?: string;
  description?: string;
  type?: string;
  published?: boolean;
}

export interface TaskBoardTeamPayload {
  job_id: TaskBoardId;
  team_id: TeamId;
  created_by: UserId;
}

export interface TasksSequenceUpdatePayload {
  taskId: TaskId;
  sequence: number;
}

export interface TaskActivityPayload {
  card_id: TaskId;
  action_type: string;
  created_by: UserId;

  field_name?: string;
  from_value_to?: string;
  to_value?: string;
  from_date?: string;
  to_date?: string;
  from_label?: string;
  to_label?: string;
  target_pic_id?: ContactPicId;
  target_member_id?: CompanyMemberId;
  attachment_id?: TaskAttachmentId;
  from_card_status_id?: TaskStatusId;
  to_card_status_id?: TaskStatusId;
  from_start_date?: string;
  to_start_date?: string;
  from_end_date?: string;
  to_end_date?: string;
  // created_at: string;
}
export interface TaskTimerEntryModel {
  id: TaskTimerEntryId;
  company_member_id: CompanyMemberId;
  task_id: TaskId;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  time_total: number;
}

export type TaskTimerTotalModel = {
  company_member_id: CompanyMemberId;
  member_total: number;
};

export type TaskBoardVisibilityModel = {
  boardId: TaskBoardId;
  teamId?: TaskBoardTeamId;
  memberId?: CompanyMemberId;
};

export type TaskBoardFolderModel = {
  id: TaskBoardFolderId;
  name: string;
  type: number;
  companyId: CompanyId;
  createdAt: string;
  createdBy: UserId;
  updatedAt: string;
  updatedBy: UserId;
};

export type TaskBoardFolderType = number;

export type ExternalAttachmentModel = {
  name: string;
  type: string;
  url: string;
  source: string;
};

export type TaskWatcherModel = {
  taskId: TaskId;
  memberId: CompanyMemberId;
};

export type ProjectInvoiceModel = {
  id: ProjectClaimId;
  name: string;
  invoiceNo: string;
  quantity: number;
  price: string;
  amount: string;
  actualCost: string;
  variance: string;
  projectId: TaskBoardId;
  createdAt: string;
  createdBy: UserId;
  updatedAt: string;
  updatedBy: UserId;
  idText: ProjectClaimPublicId;
};

export type ProjectClaimModel = {
  id: number;
  name: string;
  description: string;
  note: string;
  memberId: CompanyMemberId;
  amount: number;
  attachmentUrl: string;
  status: number;
  projectId: TaskBoardId;
  createdAt: string;
  createdBy: UserId;
  updatedAt: string;
  updatedBy: UserId;
};

export type ProjectTimeCostModel = {
  id: ProjectTimeCostId;
  projectId: TaskBoardId;
  date: string;
  timeIn: string;
  timeOut: string;
  taskId: TaskId;
  memberId: CompanyMemberId;
  duration: number;
  amount: number;
  createdAt: string;
  createdBy: UserId;
  updatedAt: string;
  updatedBy: UserId;
  note: string;
  idText: ProjectTimeCostPublicId;
};

export type ProjectBillingAuditLogModel = {
  id: ProjectBillingAuditLogId;
  actionType: number;
  billingType: number;
  note: string;
  memberId: CompanyMemberId;
  data: string;
  createdAt: string;
  createdBy: UserId;
  updatedAt: string;
  updatedBy: UserId;
  idText: ProjectBillingAuditLogPublicId;
};

export type ProjectTemplateModel = {
  id: ProjectTemplateId;
  name: string;
  companyId: CompanyId;
  columns: string;
  idText: ProjectTemplatePublicId;
};

export type ProjectSettingsModel = {
  projectId: TaskBoardId;
  columns: string;
};

export type ProjectStatusModel = {
  id: ProjectStatusId;
  projectId: TaskBoardId;
  color: string;
  name: string;
  sequence: number;
  notify: number;
  idText: ProjectStatusPublicId;
};

export type ProjectTemplateStatusModel = {
  id: ProjectTemplateStatusId;
  templateId: ProjectTemplateId;
  color: string;
  name: string;
  notify: number;
  idText: ProjectTemplateStatusPublicId;
};

export type TaskKanbanPosition = {
  taskId: TaskId;
  posY: number;
};

export type ProjectGroupModel = {
  id: ProjectGroupId;
  name: string;
  projectId: TaskBoardId;
  ordering: number;
  idText: string;
};
