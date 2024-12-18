import { UpdateCompanyTeamInfoInput } from '@generated/graphql-types';
import { CollectionId } from './collection.model';
import { CrudPayload } from './common.model';
import { TeamId } from './team.model';
import { UserId } from './user.model';

export type CompanyPublicId = string;
export type CompanyId = number;
export type CompanyMemberId = number;
export type CompanyMemberPublicId = string;
export type CompanyTeamId = number;
export type CompanyTeamStatusId = number;
export type CompanyTeamStatusPublicId = string;
export type CompanyServiceHistoryId = number;

export type CompanyPaymentMethodId = number;

export type EmployeeTypeId = number;

export type CompanyModel = {
  id: number;
  name: string;
  logoUrl: string;
  slug: string;

  id_text: string;
  user_id: UserId;
  logo_url: string;

  idText: string;
  userId: UserId;

  createdBy: number;
  updatedBy: number;
  deletedBy: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;

  created_by: number;
  updated_by: number;
  deleted_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type CompanyMemberModel = {
  id: CompanyMemberId;
  id_text: string;

  active: number;

  companyId: CompanyId;

  userId: UserId;
  userName: string; // comes from join with user table
  userEmail: string; // comes from join with user table

  /* to be deprecated once we have camel case */

  company_id: number;
  user_id: UserId;
  report_to: number;
  type: number;
  position: string;
  invitation_code: string;
  setting: CompanyMemberSettings;
  hourly_rate: number;

  created_at: string;
  updated_at: string;
  deleted_at: string;
  employee_type: EmployeeTypeId;
  permission: string;
};

export type CompanyMemberSettings = {
  senang_pay: number;
};

export type CompanyTeamModel = {
  id: number;

  idText: string;
  companyId: CompanyId;

  title: string;

  company_id: number;
  id_text: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type CompanyTeamStatusModel = {
  id: CompanyTeamStatusId;
  id_text: CompanyTeamStatusPublicId;
  team_id: number;
  parent_status: number;
  stage: number;
  sequence: number;
  color: string;
  label: string;
  percentage: number;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  created_at: string;
  updated_at: string;
};

export type CompanyMemberPermissionScopeModel = {
  scope: string;
  enabled: boolean;
};

export type CompanyQuotaUsageModel = {
  company_id: CompanyId;
  whatsapp_quota_usage: number;
  email_quota_usage: number;
  timestamp: string;
  last_remind_exceeded: string;

  companyId: CompanyId;
  whatsappQuotaUsage: number;
  emailQuotaUsage: number;
  lastRemindExceeded: string;
};

export type CompanyProfileModel = {
  profile: string;
  invoicePrefix: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  registrationCode: string;
  invoiceStart: number;
  invoiceStartString: string;
  company_id: CompanyId;
  default_timezone: string;
};

export interface CompanyTeamStatusPayload {
  stage?: number; // this should be the only input once v3 is up
  parent_status?: number; //deprecated
  label: string;
  percentage: number;
  team_id: TeamId;
  color: string;
}

export interface UpdateCompanyTeamInfoPayload
  extends UpdateCompanyTeamInfoInput {}

export interface CompanyTeamStatusSequenceUpdatePayload {
  company_team_status_id: CompanyTeamStatusId;
  sequence: number;
}

export interface CompanyServiceHistoryModel {
  id: CompanyServiceHistoryId;
  company_id: CompanyId;
  type: string;
  message_id: string;
  receivable_id: CollectionId;
  count: number;
  from: string;
  to: string;
  data: string | unknown;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  id_text: string;
}

export interface CompanyMemberReferenceImageModel {
  company_member_id: CompanyMemberId;
  image_url: string;
  s3_bucket: string;
  s3_key: string;
  status: number;
  action_by: UserId;
  remark: string;
}

export type EmployeeTypeModel = {
  id: EmployeeTypeId;
  company_id: CompanyId;
  employee_type_id: EmployeeTypeId;
  name: string;
  archived: boolean;
  has_overtime: boolean;
};

export type CompanyWorkDaySettingModel = {
  company_id: CompanyId;
  day: number;
  open: number;
  employee_type_id: EmployeeTypeId;
  start_hour: string;
  end_hour: string;
  timezone: string;
  created_by: UserId;
  updated_by: UserId;
  created_at: string;
  updated_at: string;
};

export type UpdateCompanyWorkDayPayload = {
  open: boolean;
  start_hour: string;
  end_hour: string;
};

export type AddMemberToCompanyPayload = {
  email: string;
  type: number | string;
  position: string;
  hourly_rate: number;
  employee_type: EmployeeTypeId | null | undefined;
};

export type UpdateCompanyMemberInfoPayload = {
  type: number;
  position: string;
  hourly_rate: number;
  employee_type: EmployeeTypeId | null | undefined;
};

export type CompanyPermissionModel = {
  company_id: CompanyId;
  grants: string;
};

export type GrantModel = {
  member?: { member?: CrudPayload };
  manager?: { member?: CrudPayload };
};

export type ResourcePermissionModel = {
  resource_id: string;
  company_member_ids: string;
  team_ids: string;
};

export type CompanyTeamMemberModel = {
  team_id: CompanyTeamId;
  member_id: CompanyMemberId;
};

export interface ResourcePermissionInput {
  company_member_ids?: string[];
  team_ids?: string[];
}

export interface ResourcePermissionPayload {
  companyMemberIds?: string;
  teamIds?: string;
}

export interface CompanyPermissionPayload {
  companyId: CompanyId;
  grantsObj: GrantModel;
}

export type ParseMembersResultCsvModel = {
  email: string;
  position: string;
  type: number;
};

export type UpdateCompanyInfoPayload = {
  name?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  accountCode?: string | null;
  invoicePrefix?: string | null;
  //deprecated
  logo_url?: string | null;
  logo_size?: number | null;

  address?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  registrationCode?: string | null;
  invoiceStart?: string | null;
};

export type CompanyStorageListModel = {
  type: string;
  fileSize: number;
};

export type CompanyStorageDetailsModel = {
  summary: CompanyStorageListModel[];
  totalUsageInKB: number;
  totalUsageInMB: number;
};

export type CompanyPaymentMethodModel = {
  id: CompanyPaymentMethodId;
  companyId: CompanyId;
  userId: UserId;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: UserId;
  updatedBy: UserId;
};
