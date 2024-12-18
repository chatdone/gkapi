import { CompanyId } from './company.model';
import { ContactId } from './contact.model';
import { ProjectGroupId } from './task.model';
import { TeamId } from './team.model';
import { UserId } from './user.model';

export type WorkspaceId = number;
export type WorkspacePublicId = string;
export type ProjectId = number;
export type ProjectPublicId = string;

export type WorkspaceModel = {
  id: WorkspaceId;
  idText: WorkspacePublicId;
  name: string;
  bgColor: string;
  companyId: CompanyId;
  createdAt: string;
  updatedAt: string;
  createdBy: UserId;
  updatedBy: UserId;
  visibility: number;
};

export type ProjectModel = {
  id: ProjectId;
  idText: ProjectPublicId;

  companyId: CompanyId;
  contactId: ContactId;
  teamId: TeamId;
  type: string;
  category: number;
  name: string;
  description: string;
  comment: string;
  color: string;
  associateBy: UserId;
  status: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  slug: string;
  archived: number;
  visibility: number;
};

export type ProjectGroupCustomAttributeModel = {
  id: number;
  name: string;
  type: number;
};

export type ProjectGroupCustomColumnModel = {
  groupId: ProjectGroupId;
  attributeId: number;
  enabled: boolean;
};

export type TaskCustomValueModel = {
  groupId: ProjectGroupId;
  taskId: number;
  attributeId: number;
  value: string;
};

export enum CustomColumnType {
  TEXT = 1,
  FLOAT = 2,
}

export type ProjectTemplateGalleryModel = {
  gallery_templates: string;
};
