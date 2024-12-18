import { AttendanceId } from './attendance.model';
import { CollectionId } from './collection.model';
import { CompanyId } from './company.model';
import { ContactId } from './contact.model';
import { TaskId } from './task.model';
import { UserId } from './user.model';

export type TagId = number;
export type TagPublicId = string;
export type TagGroupId = number;
export type TagGroupPublicId = string;

export interface TagGroupModel {
  id: TagId;
  idText: TagPublicId;
  name: string;
  description: string;
  companyId: CompanyId;
  createdBy: UserId;
  createdAt: string;
  updatedAt: string;
}

export interface TagModel {
  id: TagId;
  idText: TagPublicId;
  name: string;
  color: string;
  companyId: CompanyId;
  groupId: TagGroupId;
  createdBy: UserId;
  createdAt: string;
  updatedAt: string;
}

export type CreateTagPayload = {
  name: string;
  color: string;
  companyId: CompanyId;
  groupId?: TagGroupId;
  userId: UserId;
};

export type CreateTagGroupPayload = {
  name: string;
  companyId: CompanyId;
  userId: UserId;
  description?: string;
};

export type UpdateTagPayload = {
  id: TagId;
  name?: string;
  color?: string;
  groupId?: TagGroupId;
};

export type UpdateTagDbPayload = {
  name?: string;
  color?: string;
  group_id?: TagGroupId;
};

export type UpdateTagGroupPayload = {
  id: TagGroupId;
  name?: string;
  description?: string;
};

export type ContactTagModel = {
  tagId: TagId;
  contactId: ContactId;
};

export type TaskTagModel = {
  tagId: TagId;
  taskId: TaskId;
};

export type CollectionTagModel = {
  tagId: TagId;
  collectionId: CollectionId;
};

export type AttendanceTagModel = {
  tagId: TagId;
  attendanceId: AttendanceId;
};
