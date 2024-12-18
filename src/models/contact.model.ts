import {
  CreateContactGroupInput,
  CreateContactInput,
  UpdateContactGroupInput,
} from '@generated/graphql-types';
import { CompanyId, CompanyMemberModel } from './company.model';
import { TaskAttachmentModel, TaskModel } from './task.model';
import { UserId, UserModel } from './user.model';

export type ContactPublicId = string;
export type ContactId = number;
export type ContactGroupPublicId = string;
export type ContactGroupId = number;
export type ContactPicPublicId = string;
export type ContactPicId = number;
export type LogId = number;
export type ContactNoteId = number;
export type ContactNotePublicId = string;
export type ContactModel = {
  id: number;
  id_text: string;
  company_id: CompanyId;
  name: string;
  address: string;
  remarks: string;
  deal_value: number;
  deal_creator: UserId;
  type: number;

  created_at: string;
  updated_at: string;
  deleted_at: string;

  created_by: number;
  updated_by: number;
  deleted_by: number;
  account_code: string;
};

export type ContactGroupModel = {
  id: number;
  id_text: string;
  name: string;
  company_id: CompanyId;

  created_at: string;
  modified_at: string;
  type: ContactGroupType;
};

export type ContactGroupType = { [key: string]: number };

export type ContactPicModel = {
  id: number;
  id_text: string;
  name: string;
  contact_no: string;
  national_format: string;
  remarks: string;

  contact_id: ContactId;
  contactId: ContactId;
  user_id: UserId;
  deleted_at: string;
};

export type ContactTaskModel = {
  id: number;
  id_text: string;

  name: string;
  due_date: string;
  status: ContactTaskStatusType;
};

export type ContactNoteModel = {
  id: ContactNoteId;
  id_text: ContactNotePublicId;
  content: string;
  noteContent: string;
  contact_id: ContactId;
};

export type ContactTaskStatusType = { [key: string]: string };

export type ParseResultCsvModel = {
  company_name: string;
  pic_name: string;
  contact_person?: string;
  email: string;
  contact_no: string;
};

export interface CreateContactPayload extends CreateContactInput {
  company_id: CompanyId;
  accountCode?: string | null;
}

export interface CreateContactPicPayload {
  contact_id: ContactId;
  contact_no?: string;
  email?: string;
  name: string;
  remarks?: string;
}
export interface CreateContactGroupPayload extends CreateContactGroupInput {
  company_id: CompanyId;
}

export interface UpdateContactGroupPayload extends UpdateContactGroupInput {}

export type CreateContactResponse = {
  contact: ContactModel;
  group: ContactGroupModel;
};

export type UpdateContactResponse = {
  contact: ContactModel;
  group: ContactGroupModel;
};

export interface ContactActivityPayload {
  activity_type: string;
  assignee: CompanyMemberModel;
  attachment: TaskAttachmentModel;
  pic: ContactPicModel;
  to_date: string;
  from_date: string;
  date: string;
  task: TaskModel;
  created_by: UserModel;
}

export type AuditLogModel = {
  id: LogId;
  action: string;
  source_type: string;
  source_id: UserId;
  table_name: string;
  table_row_id: number;
  previous_values: string;
  current_values: string;
  changed_values: string;
  timestamp: string;
};

export interface AuditLogPayload {
  action: string;
  source_type: string;
  source_id?: UserId;
  table_name: string;
  table_row_id: number | null | undefined;
  previous_values?: string;
  current_values?: string;
  changed_values?: string;
}

//These are carry over from techies
export type ContactActivitiesModel = {
  id: number;
  action: string;
  table_name: string;
  table_row_id: number;
  previous_values: string;
  current_values: string | Record<string, unknown>;
  changed_values: string;
  timestamp: string;
  source_type: string;
  source_id: number;
};

export type AuditLogValuesModel = {
  title: string;
  ref_no: string;
  due_date: string;
  archive: number;
  status: number;
  contact_pic_name: string;
  team_name: string;
  member_name: string;
};

export type AuditLogChangedValuesModel = {
  is_create: boolean;
  marked_paid: boolean;
  collector_member: boolean;
  company_team: boolean;
  notify_pics: boolean;
  uploaded_payment: boolean;
  uploaded_receipt: boolean;
  rejected_payment: boolean;
};

export interface ContactExpandedModel extends ContactModel {
  contact_group_id: number;
  contact_group_name: string;
  pic_name: string;
  pic_phone: string;
  pic_remarks: string;
  pic_created: string;
  pic_updated: string;
  pic_email: string;
}
