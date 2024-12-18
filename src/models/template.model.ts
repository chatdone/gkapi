import { UserId } from './user.model';

export type TemplateId = number;
export type TemplatePublicId = string;
export type TaskTemplateId = number;
export type TaskTemplateAttachmentId = number;

export interface TemplateModel {
  id: TemplateId;
  idText: TemplatePublicId;
  name: string;
  type: number;
  created_by: UserId;
  created_at: string;
  updated_at: string;
}

export interface TaskTemplateModel extends TemplateModel {
  copySubtasks: boolean;
  copyAttachments: boolean;
  description: string | undefined | null;
}

export type TemplateOptionsModel = {
  copySubtasks: boolean;
  copyAttachments: boolean;
  description: string | undefined | null;
  isRecurring: boolean;
  cronString: string;
  nextCreate: string;
};

export type TaskTemplateItemModel = {
  id: TaskTemplateId;
  templateId: TemplateId;
  parentId: TaskTemplateId | null;
  name: string;
  description: string;
  sequence: number;
  created_at: string;
  updated_at: string;
};

export type TaskTemplateAttachmentModel = {
  id: TaskTemplateAttachmentId;
  templateId: TemplateId;
  name: string;
  type: string;
  filesize: number;
  url: string;
  path: string;
  bucket: string;
  created_at: string;
  updated_at: string;
};

export type TaskTemplateRecurringSettingModel = {
  intervalType: string;
  day: number;
  month: number;
  skipWeekend: boolean;
};
