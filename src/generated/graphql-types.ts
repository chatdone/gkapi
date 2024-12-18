/* NOTE: THIS IS AN AUTO-GENERATED FILE. DO NOT MODIFY IT DIRECTLY. */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { ContactType } from '../graphql/models/contact.model';
import { EnumStringToNumberType } from '../graphql/models/common.model';
import CompanyMemberType = EnumStringToNumberType;
import { ContactTaskStatusType } from '../graphql/models/contact.model';
import { NotificationType } from '../graphql/models/notification.model';
import { TaskBoardVisibility } from '../graphql/models/task.model';
import { TaskBoardFolderType } from '../graphql/models/task.model';
import { TaskPriorityType } from '../graphql/models/task.model';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ContactModel, ContactGroupModel, ContactPicModel, ContactTaskModel, ContactActivitiesModel, ContactNoteModel, CreateContactResponse, UpdateContactResponse } from '../graphql/models/contact.model';
import { CompanyModel, CompanyMemberModel, CompanyTeamModel, CompanyTeamStatusModel, CompanyMemberReferenceImageModel, CompanyWorkDaySettingModel, CompanyServiceHistoryModel, EmployeeTypeModel, CompanyPermissionModel, ResourcePermissionModel, CompanyPaymentMethodModel } from '../graphql/models/company.model';
import { UserModel, RequestAccountDeletionResponse } from '../graphql/models/user.model';
import { TaskModel, TaskBoardModel, TaskBoardOwnerModel, TaskBoardFolderModel, TaskBoardVisibilityModel, TaskCommentModel, TaskMemberModel, TaskPicModel, TaskWatcherModel, TaskAttachmentModel, TaskBoardTeamModel, SubtaskModel, ChecklistModel, TaskActivityItemModel, TaskActivityModel, TaskTimerEntryModel, TaskTimerTotalModel, ProjectInvoiceModel, ProjectClaimModel, ProjectTimeCostModel, ProjectTemplateModel, ProjectSettingsModel, ProjectTemplateStatusModel, ProjectStatusModel, ProjectGroupModel, TaskFilter, TaskBoardFilter, TaskSort, TaskBoardSort } from '../graphql/models/task.model';
import { WorkspaceModel, ProjectGroupCustomAttributeModel, ProjectGroupCustomColumnModel, TaskCustomValueModel, ProjectTemplateGalleryModel } from '../graphql/models/workspace.model';
import { NotificationModel, UserNotificationModel } from '../graphql/models/notification.model';
import { CollectorModel, CollectorMemberModel } from '../graphql/models/collector.model';
import { CollectionModel, CollectionReminderReadModel, CollectionPeriodModel, CollectionPaymentModel, CollectionRemindOnDaysModel, CollectionMessageLogModel, CollectionActivityLogModel } from '../graphql/models/collection.model';
import { CompanySubscriptionModel, CompanyMemberPermissionScopeModel, SubscriptionPackageModel, SubscriptionPackagePriceModel, StripeInvoice, StripePromoCodeModel, StripeCouponModel, SubscriptionPromoCodeModel, SubscriptionModel, SubscriptionProductModel, SubscriptionPriceModel, SubscriptionChangeModel } from '../graphql/models/subscription.model';
import { ShortUrlModel, BreadcrumbInfoModel } from '../graphql/models/url.model';
import { LocationModel } from '../graphql/models/location.model';
import { HolidayModel, CompanyHolidayModel, PublicHolidayModel } from '../graphql/models/holiday.model';
import { FilterOptionsModel, PaginationFilter } from '../graphql/models/filter.model';
import { TimesheetModel, TimesheetActivityModel, ActivityTrackerWeeklyModel, ActivityTrackerMonthlyModel, ActivityTrackerActualMonthlyModel, ActivityTrackerDailyModel, TimesheetDayApprovalModel, TimesheetDayCustomApprovalModel } from '../graphql/models/timesheet.model';
import { AttendanceModel, AttendanceVerificationS3ObjectModel, AttendanceLabelModel, AttendanceDailySummaryModel, AttendanceWeeklySummaryModel, AttendanceMonthlySummaryModel, AttendanceSettingsModel } from '../graphql/models/attendance.model';
import { TemplateModel, TaskTemplateModel, TaskTemplateItemModel, TaskTemplateAttachmentModel, TaskTemplateRecurringSettingModel } from '../graphql/models/template.model';
import { TagModel, TagGroupModel, ContactTagModel, TaskTagModel, CollectionTagModel } from '../graphql/models/tag.model';
import { ImageGroupModel } from '../graphql/models/common.model';
import { BillingInvoiceModel, BillingInvoiceItemModel } from '../graphql/models/billing.model';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: string;
  DateTime: string;
  JSON: any;
  Latitude: any;
  Longitude: any;
  Upload: GraphQLUpload;
};

export type ActivityDaySummary = {
  __typename?: 'ActivityDaySummary';
  company_member?: Maybe<CompanyMember>;
  day?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  task?: Maybe<Task>;
  total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

/** Not directly from the db, it is a combination all the week numbers sent */
export type ActivityMonthSummary = {
  __typename?: 'ActivityMonthSummary';
  company_member?: Maybe<CompanyMember>;
  task?: Maybe<Task>;
  total?: Maybe<Scalars['Int']>;
  week_number?: Maybe<Scalars['Int']>;
  week_total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type ActivityWeekSummary = {
  __typename?: 'ActivityWeekSummary';
  company_member?: Maybe<CompanyMember>;
  created_at?: Maybe<Scalars['DateTime']>;
  friday?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  monday?: Maybe<Scalars['Int']>;
  saturday?: Maybe<Scalars['Int']>;
  sunday?: Maybe<Scalars['Int']>;
  task?: Maybe<Task>;
  thursday?: Maybe<Scalars['Int']>;
  total_weekly?: Maybe<Scalars['Int']>;
  tuesday?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  wednesday?: Maybe<Scalars['Int']>;
  week_number?: Maybe<Scalars['Int']>;
};

export type AddCompanyTeamStatusInput = {
  color: Scalars['String'];
  label: Scalars['String'];
  parentStatus?: Maybe<CompanyTeamStatusType>;
  parent_status: CompanyTeamStatusType;
  percentage: Scalars['Int'];
  stage?: Maybe<StageType>;
};

export type AddCustomValueToTaskInput = {
  attributeId: Scalars['ID'];
  groupId: Scalars['ID'];
  taskId: Scalars['ID'];
  value: Scalars['String'];
};

export type AddMemberToCompanyInput = {
  email: Scalars['String'];
  employeeTypeId?: Maybe<Scalars['ID']>;
  employee_type_id?: Maybe<Scalars['ID']>;
  hourlyRate?: Maybe<Scalars['Float']>;
  hourly_rate?: Maybe<Scalars['Float']>;
  position?: Maybe<Scalars['String']>;
  type?: Maybe<CompanyMemberType>;
};

export type AddMembersToContactGroupInput = {
  contactIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  contact_ids: Array<Maybe<Scalars['ID']>>;
};

export type AddPackageInput = {
  packagePriceId?: Maybe<Scalars['ID']>;
  package_price_id: Scalars['ID'];
  quantity?: Maybe<Scalars['Int']>;
};

export type AddTaskWatchersInput = {
  memberIds: Array<Scalars['ID']>;
  taskId: Scalars['ID'];
};

export type AddToProjectVisibilityWhitelistInput = {
  memberIds?: Maybe<Array<Scalars['ID']>>;
  projectId: Scalars['ID'];
  teamIds?: Maybe<Array<Scalars['ID']>>;
};

export type AddToTaskVisibilityWhitelistInput = {
  memberIds?: Maybe<Array<Scalars['ID']>>;
  taskId: Scalars['ID'];
  teamIds?: Maybe<Array<Scalars['ID']>>;
};

export type AddToVisibilityWhitelistInput = {
  boardId: Scalars['ID'];
  memberIds?: Maybe<Array<Scalars['ID']>>;
  teamIds?: Maybe<Array<Scalars['ID']>>;
};

export type AddToWorkspaceVisibilityWhitelistInput = {
  memberIds?: Maybe<Array<Scalars['ID']>>;
  teamIds?: Maybe<Array<Scalars['ID']>>;
  workspaceId: Scalars['ID'];
};

export type ApplyTaskTemplateInput = {
  companyId: Scalars['ID'];
  companyTeamId?: Maybe<Scalars['ID']>;
  taskBoardId: Scalars['ID'];
  templateId: Scalars['ID'];
};

export type ArchiveTaskInput = {
  task_ids: Array<Maybe<Scalars['ID']>>;
};

export type ArchivedStatus = {
  status?: Maybe<TimesheetArchiveStatus>;
};

export type AssignMembersToCollectionInput = {
  collectionId: Scalars['ID'];
  memberIds: Array<Scalars['ID']>;
};

export type AssignProjectsToWorkspaceInput = {
  projectIds: Array<Scalars['ID']>;
  workspaceId: Scalars['ID'];
};

export type AssignTaskBoardsToFolderInput = {
  boardIds: Array<Scalars['ID']>;
  folderId: Scalars['ID'];
};

export type Attendance = {
  __typename?: 'Attendance';
  address?: Maybe<Scalars['String']>;
  comments?: Maybe<Scalars['String']>;
  commentsOut?: Maybe<Scalars['String']>;
  comments_out?: Maybe<Scalars['String']>;
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  contact?: Maybe<Contact>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  imageUrl?: Maybe<Scalars['String']>;
  image_url?: Maybe<Scalars['String']>;
  isLastOut?: Maybe<Scalars['Boolean']>;
  is_last_out?: Maybe<Scalars['Boolean']>;
  label?: Maybe<AttendanceLabel>;
  lat?: Maybe<Scalars['Latitude']>;
  lng?: Maybe<Scalars['Longitude']>;
  location?: Maybe<Location>;
  overtime?: Maybe<Scalars['Int']>;
  s3Bucket?: Maybe<Scalars['String']>;
  s3Key?: Maybe<Scalars['String']>;
  s3_bucket?: Maybe<Scalars['String']>;
  s3_key?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  submittedDate?: Maybe<Scalars['DateTime']>;
  submitted_date?: Maybe<Scalars['DateTime']>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  timeTotal?: Maybe<Scalars['Int']>;
  time_total?: Maybe<Scalars['Int']>;
  type?: Maybe<AttendanceType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  verificationType?: Maybe<AttendanceVerificationType>;
  verification_type?: Maybe<AttendanceVerificationType>;
  worked?: Maybe<Scalars['Int']>;
};

export type AttendanceDaySummary = {
  __typename?: 'AttendanceDaySummary';
  attendances?: Maybe<Array<Maybe<Attendance>>>;
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  day?: Maybe<Scalars['Int']>;
  firstAttendance?: Maybe<Attendance>;
  /** Deprecated */
  firstIn?: Maybe<Scalars['DateTime']>;
  generatedAt?: Maybe<Scalars['DateTime']>;
  generated_at?: Maybe<Scalars['DateTime']>;
  lastAttendance?: Maybe<Attendance>;
  month?: Maybe<Scalars['Int']>;
  overtime?: Maybe<Scalars['Int']>;
  regular?: Maybe<Scalars['Int']>;
  tracked?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  worked?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type AttendanceDaySummaryInput = {
  companyMemberId?: Maybe<Scalars['ID']>;
  day: Scalars['Int'];
  month: Scalars['Int'];
  year: Scalars['Int'];
};

export type AttendanceLabel = {
  __typename?: 'AttendanceLabel';
  archived?: Maybe<Scalars['Boolean']>;
  color?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export type AttendanceLabelInput = {
  color?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type AttendanceMemberStats = {
  __typename?: 'AttendanceMemberStats';
  break?: Maybe<Scalars['Int']>;
  overtime?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  worked?: Maybe<Scalars['Int']>;
};

export type AttendanceMonthSummary = {
  __typename?: 'AttendanceMonthSummary';
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  month?: Maybe<Scalars['Int']>;
  overtimeTotal?: Maybe<Scalars['Int']>;
  overtime_total?: Maybe<Scalars['Int']>;
  regularTotal?: Maybe<Scalars['Int']>;
  regular_total?: Maybe<Scalars['Int']>;
  trackedTotal?: Maybe<Scalars['Int']>;
  tracked_total?: Maybe<Scalars['Int']>;
  workedTotal?: Maybe<Scalars['Int']>;
  worked_total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type AttendanceMonthSummaryInput = {
  companyMemberId?: Maybe<Scalars['ID']>;
  month: Scalars['Int'];
  week: Array<Maybe<Scalars['Int']>>;
  year: Scalars['Int'];
};

export type AttendanceSettings = {
  __typename?: 'AttendanceSettings';
  allowMobile?: Maybe<Scalars['Boolean']>;
  allowWeb?: Maybe<Scalars['Boolean']>;
  allow_mobile?: Maybe<Scalars['Boolean']>;
  allow_web?: Maybe<Scalars['Boolean']>;
  enable2d?: Maybe<Scalars['Boolean']>;
  enableBiometric?: Maybe<Scalars['Boolean']>;
  enable_2d?: Maybe<Scalars['Boolean']>;
  enable_biometric?: Maybe<Scalars['Boolean']>;
  requireLocation?: Maybe<Scalars['Boolean']>;
  requireVerification?: Maybe<Scalars['Boolean']>;
  require_location?: Maybe<Scalars['Boolean']>;
  require_verification?: Maybe<Scalars['Boolean']>;
};

export enum AttendanceType {
  Break = 'BREAK',
  Clock = 'CLOCK'
}

export type AttendanceVerificationS3Object = {
  bucket: Scalars['String'];
  key: Scalars['String'];
};

export enum AttendanceVerificationType {
  Biometric = 'BIOMETRIC',
  DevicePasscode = 'DEVICE_PASSCODE',
  ImageCompare = 'IMAGE_COMPARE'
}

export type AttendanceWeekSummary = {
  __typename?: 'AttendanceWeekSummary';
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  friday?: Maybe<Scalars['Int']>;
  generatedAt?: Maybe<Scalars['DateTime']>;
  generated_at?: Maybe<Scalars['DateTime']>;
  monday?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  overtimeTotal?: Maybe<Scalars['Int']>;
  overtime_total?: Maybe<Scalars['Int']>;
  regularTotal?: Maybe<Scalars['Int']>;
  regular_total?: Maybe<Scalars['Int']>;
  saturday?: Maybe<Scalars['Int']>;
  sunday?: Maybe<Scalars['Int']>;
  thursday?: Maybe<Scalars['Int']>;
  trackedTotal?: Maybe<Scalars['Int']>;
  tracked_total?: Maybe<Scalars['Int']>;
  tuesday?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  wednesday?: Maybe<Scalars['Int']>;
  week?: Maybe<Scalars['Int']>;
  workedTotal?: Maybe<Scalars['Int']>;
  worked_total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type AttendanceWeekSummaryInput = {
  companyMemberId?: Maybe<Scalars['ID']>;
  month: Scalars['Int'];
  week: Scalars['Int'];
  year: Scalars['Int'];
};

export type AuditLogChangedValues = {
  __typename?: 'AuditLogChangedValues';
  archive?: Maybe<Scalars['Boolean']>;
  collectionPayment?: Maybe<Scalars['Boolean']>;
  collection_payment?: Maybe<Scalars['Boolean']>;
  collectorMember?: Maybe<Scalars['Boolean']>;
  collector_member?: Maybe<Scalars['Boolean']>;
  companyMember?: Maybe<Scalars['Boolean']>;
  companyTeam?: Maybe<Scalars['Boolean']>;
  company_member?: Maybe<Scalars['Boolean']>;
  company_team?: Maybe<Scalars['Boolean']>;
  contactAddress?: Maybe<Scalars['Boolean']>;
  contactGroup?: Maybe<Scalars['Boolean']>;
  contactName?: Maybe<Scalars['Boolean']>;
  contactNo?: Maybe<Scalars['Boolean']>;
  contactPicName?: Maybe<Scalars['Boolean']>;
  contactType?: Maybe<Scalars['Boolean']>;
  contact_address?: Maybe<Scalars['Boolean']>;
  contact_group?: Maybe<Scalars['Boolean']>;
  contact_name?: Maybe<Scalars['Boolean']>;
  contact_no?: Maybe<Scalars['Boolean']>;
  contact_pic_name?: Maybe<Scalars['Boolean']>;
  contact_type?: Maybe<Scalars['Boolean']>;
  dueDate?: Maybe<Scalars['Boolean']>;
  due_date?: Maybe<Scalars['Boolean']>;
  invoice?: Maybe<Scalars['Boolean']>;
  isCreate?: Maybe<Scalars['Boolean']>;
  is_create?: Maybe<Scalars['Boolean']>;
  markedPaid?: Maybe<Scalars['Boolean']>;
  marked_paid?: Maybe<Scalars['Boolean']>;
  notifyPics?: Maybe<Scalars['Boolean']>;
  notify_pics?: Maybe<Scalars['Boolean']>;
  refNo?: Maybe<Scalars['Boolean']>;
  ref_no?: Maybe<Scalars['Boolean']>;
  rejectedPayment?: Maybe<Scalars['Boolean']>;
  rejected_payment?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['Boolean']>;
  uploadedPayment?: Maybe<Scalars['Boolean']>;
  uploadedReceipt?: Maybe<Scalars['Boolean']>;
  uploaded_payment?: Maybe<Scalars['Boolean']>;
  uploaded_receipt?: Maybe<Scalars['Boolean']>;
};

export type AuditLogValues = {
  __typename?: 'AuditLogValues';
  archive?: Maybe<Scalars['Int']>;
  attachmentName?: Maybe<Scalars['String']>;
  attachment_name?: Maybe<Scalars['String']>;
  contactAddress?: Maybe<Scalars['String']>;
  contactGroupName?: Maybe<Scalars['String']>;
  contactName?: Maybe<Scalars['String']>;
  contactNo?: Maybe<Scalars['String']>;
  contactPicName?: Maybe<Scalars['String']>;
  contactType?: Maybe<Scalars['String']>;
  contact_address?: Maybe<Scalars['String']>;
  contact_group_name?: Maybe<Scalars['String']>;
  contact_name?: Maybe<Scalars['String']>;
  contact_no?: Maybe<Scalars['String']>;
  contact_pic_name?: Maybe<Scalars['String']>;
  contact_type?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['String']>;
  due_date?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  memberName?: Maybe<Scalars['String']>;
  member_name?: Maybe<Scalars['String']>;
  refNo?: Maybe<Scalars['String']>;
  ref_no?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['Int']>;
  teamName?: Maybe<Scalars['String']>;
  team_name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type BillingInvoice = {
  __typename?: 'BillingInvoice';
  contactPic?: Maybe<ContactPic>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  docDate?: Maybe<Scalars['DateTime']>;
  docNo?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  items?: Maybe<Array<Maybe<BillingInvoiceItem>>>;
  project?: Maybe<TaskBoard>;
  remarks?: Maybe<Scalars['String']>;
  terms?: Maybe<Scalars['Int']>;
  /** Total discounted is calculated first before tax is applied. */
  totalDiscounted?: Maybe<Scalars['Float']>;
  totalReceived?: Maybe<Scalars['Float']>;
  /** Total taxed is calculated after discount */
  totalTaxed?: Maybe<Scalars['Float']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  void?: Maybe<Scalars['Boolean']>;
  voidedAt?: Maybe<Scalars['DateTime']>;
  voidedBy?: Maybe<User>;
};

export type BillingInvoiceItem = {
  __typename?: 'BillingInvoiceItem';
  /** aka amount */
  billed?: Maybe<Scalars['Float']>;
  billingInvoice?: Maybe<BillingInvoice>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  descriptionHdr?: Maybe<Scalars['String']>;
  discountPercentage?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['ID']>;
  /** Either task name or the custom name, aka descriptionDtl */
  itemName?: Maybe<Scalars['String']>;
  qty?: Maybe<Scalars['Int']>;
  sequence?: Maybe<Scalars['Int']>;
  task?: Maybe<Task>;
  tax?: Maybe<Scalars['String']>;
  taxAmount?: Maybe<Scalars['Float']>;
  taxInclusive?: Maybe<Scalars['Boolean']>;
  taxPercentage?: Maybe<Scalars['Float']>;
  unitPrice?: Maybe<Scalars['Float']>;
  uom?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
};

export type BreadcrumbInfo = {
  __typename?: 'BreadcrumbInfo';
  name?: Maybe<Scalars['String']>;
};

export enum BreadcrumbType {
  Client = 'CLIENT',
  Collection = 'COLLECTION',
  CompanySlug = 'COMPANY_SLUG',
  Crm = 'CRM',
  Payments = 'PAYMENTS',
  ProjectBoard = 'PROJECT_BOARD',
  TaskBoard = 'TASK_BOARD',
  Timesheet = 'TIMESHEET'
}

export type BulkUploadContactsResponse = {
  __typename?: 'BulkUploadContactsResponse';
  contacts?: Maybe<Array<Maybe<Contact>>>;
};

export type BulkUploadMembersResponse = {
  __typename?: 'BulkUploadMembersResponse';
  companyMembers?: Maybe<Array<Maybe<CompanyMember>>>;
  duplicateEmails?: Maybe<Scalars['Int']>;
};

export type CancelSubscriptionInput = {
  companyId: Scalars['ID'];
  reason?: Maybe<Scalars['String']>;
  subscriptionId: Scalars['ID'];
};

export type ChangeGroupTaskInput = {
  groupId: Scalars['ID'];
  taskIds: Array<Scalars['ID']>;
};

export type ChangeTaskPositionInput = {
  posY: Scalars['Float'];
  projectStatusId?: Maybe<Scalars['ID']>;
  taskId: Scalars['ID'];
};

export type Checklist = {
  __typename?: 'Checklist';
  checked?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  sequence?: Maybe<Scalars['Int']>;
  task?: Maybe<Task>;
  title?: Maybe<Scalars['String']>;
};

export type ChecklistInput = {
  title: Scalars['String'];
};

export type ChecklistSequencesInput = {
  checklistId: Scalars['ID'];
  sequence?: Maybe<Scalars['Int']>;
};

export type ChecklistUpdateInput = {
  checked?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['String']>;
};

export type CollaborationBoardInput = {
  category?: Maybe<TaskBoardCategory>;
  color?: Maybe<Scalars['String']>;
  companyId?: Maybe<Scalars['ID']>;
  company_id: Scalars['ID'];
  contactId?: Maybe<Scalars['ID']>;
  contact_id: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  owners?: Maybe<Array<Scalars['String']>>;
  status: Scalars['Int'];
  type: TaskBoardType;
};

export type Collection = {
  __typename?: 'Collection';
  active?: Maybe<Scalars['Boolean']>;
  activityLogs?: Maybe<Array<Maybe<CollectionActivityLog>>>;
  archive?: Maybe<Scalars['Boolean']>;
  archiveAt?: Maybe<Scalars['DateTime']>;
  archive_at?: Maybe<Scalars['DateTime']>;
  assignees?: Maybe<Array<Maybe<CompanyMember>>>;
  collectionPeriods?: Maybe<Array<Maybe<CollectionPeriod>>>;
  collection_periods?: Maybe<Array<Maybe<CollectionPeriod>>>;
  collector?: Maybe<Collector>;
  contact?: Maybe<Contact>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  emailNotify?: Maybe<Scalars['Boolean']>;
  email_notify?: Maybe<Scalars['Boolean']>;
  endMonth?: Maybe<Scalars['DateTime']>;
  end_month?: Maybe<Scalars['DateTime']>;
  fileName?: Maybe<Scalars['String']>;
  file_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  invoice?: Maybe<Scalars['String']>;
  invoiceFileSize?: Maybe<Scalars['Int']>;
  invoice_file_size?: Maybe<Scalars['Int']>;
  isDraft?: Maybe<Scalars['Boolean']>;
  is_draft?: Maybe<Scalars['Boolean']>;
  messageLogs?: Maybe<Array<Maybe<CollectionMessageLog>>>;
  message_logs?: Maybe<Array<Maybe<CollectionMessageLog>>>;
  notifyPics?: Maybe<Array<Maybe<ContactPic>>>;
  notify_pics?: Maybe<Array<Maybe<ContactPic>>>;
  payableAmount?: Maybe<Scalars['Float']>;
  payable_amount?: Maybe<Scalars['Float']>;
  paymentType?: Maybe<CollectionPaymentTypes>;
  payment_type?: Maybe<CollectionPaymentTypes>;
  periods?: Maybe<Scalars['Int']>;
  refNo?: Maybe<Scalars['String']>;
  ref_no?: Maybe<Scalars['String']>;
  remindEndOn?: Maybe<Scalars['DateTime']>;
  remindInterval?: Maybe<CollectionRemindIntervalTypes>;
  remindOnDate?: Maybe<Scalars['Int']>;
  remindOnDays?: Maybe<Array<Maybe<CollectionRemindOnDays>>>;
  remindOnMonth?: Maybe<Scalars['Int']>;
  remindType?: Maybe<CollectionRemindTypes>;
  remind_end_on?: Maybe<Scalars['DateTime']>;
  remind_interval?: Maybe<CollectionRemindIntervalTypes>;
  remind_on_date?: Maybe<Scalars['Int']>;
  remind_on_days?: Maybe<Array<Maybe<CollectionRemindOnDays>>>;
  remind_on_month?: Maybe<Scalars['Int']>;
  remind_type?: Maybe<CollectionRemindTypes>;
  /** Not from receivable_reminders DB */
  reminderStatus?: Maybe<ReminderStatus>;
  reminder_status?: Maybe<ReminderStatus>;
  shortLink?: Maybe<Scalars['String']>;
  short_link?: Maybe<Scalars['String']>;
  smsNotify?: Maybe<Scalars['Boolean']>;
  sms_notify?: Maybe<Scalars['Boolean']>;
  spRecurringId?: Maybe<Scalars['String']>;
  sp_recurring_id?: Maybe<Scalars['String']>;
  startMonth?: Maybe<Scalars['DateTime']>;
  start_month?: Maybe<Scalars['DateTime']>;
  status?: Maybe<CollectionStatusTypes>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  voiceNotify?: Maybe<Scalars['Boolean']>;
  voice_notify?: Maybe<Scalars['Boolean']>;
  whatsappNotify?: Maybe<Scalars['Boolean']>;
  whatsapp_notify?: Maybe<Scalars['Boolean']>;
};

export enum CollectionActionType {
  CollectionAddedMember = 'COLLECTION_ADDED_MEMBER',
  CollectionArchived = 'COLLECTION_ARCHIVED',
  CollectionCreated = 'COLLECTION_CREATED',
  CollectionManualResend = 'COLLECTION_MANUAL_RESEND',
  CollectionMarkedPaid = 'COLLECTION_MARKED_PAID',
  CollectionMarkedUnpaid = 'COLLECTION_MARKED_UNPAID',
  CollectionPaymentApproved = 'COLLECTION_PAYMENT_APPROVED',
  CollectionPaymentRejected = 'COLLECTION_PAYMENT_REJECTED',
  CollectionPicUpdated = 'COLLECTION_PIC_UPDATED',
  CollectionReminderOptionUpdated = 'COLLECTION_REMINDER_OPTION_UPDATED',
  CollectionRemoved = 'COLLECTION_REMOVED',
  CollectionRemovedMember = 'COLLECTION_REMOVED_MEMBER',
  CollectionUnarchived = 'COLLECTION_UNARCHIVED',
  CollectionUpdatedDueDate = 'COLLECTION_UPDATED_DUE_DATE',
  CollectionUpdatedName = 'COLLECTION_UPDATED_NAME',
  CollectionUpdatedRefNo = 'COLLECTION_UPDATED_REF_NO',
  CollectionUpdatedReminder = 'COLLECTION_UPDATED_REMINDER',
  CollectionUpdatedTitle = 'COLLECTION_UPDATED_TITLE',
  CollectionUploadedPayment = 'COLLECTION_UPLOADED_PAYMENT',
  CollectionUploadedReceipt = 'COLLECTION_UPLOADED_RECEIPT'
}

export enum CollectionActiveTypes {
  False = 'FALSE',
  True = 'TRUE'
}

export type CollectionActivityLog = {
  __typename?: 'CollectionActivityLog';
  actionType?: Maybe<CollectionActionType>;
  changedValues?: Maybe<Scalars['JSON']>;
  collection?: Maybe<Collection>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  currentValues?: Maybe<Scalars['JSON']>;
  previousValues?: Maybe<Scalars['JSON']>;
};

export enum CollectionArchiveType {
  False = 'FALSE',
  True = 'TRUE'
}

export enum CollectionDraftType {
  False = 'FALSE',
  True = 'TRUE'
}

export type CollectionMessageLog = {
  __typename?: 'CollectionMessageLog';
  collection?: Maybe<Collection>;
  emailAddress?: Maybe<Scalars['String']>;
  email_address?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  phone?: Maybe<Scalars['String']>;
  status?: Maybe<CollectionMessageLogStatusTypes>;
  timestamp?: Maybe<Scalars['DateTime']>;
  type?: Maybe<Scalars['String']>;
};

export enum CollectionMessageLogStatusTypes {
  Failed = 'FAILED',
  Sent = 'SENT'
}

export type CollectionPayment = {
  __typename?: 'CollectionPayment';
  collection?: Maybe<Collection>;
  collectionPeriod?: Maybe<CollectionPeriod>;
  collection_period?: Maybe<CollectionPeriod>;
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  contact?: Maybe<Contact>;
  contactPic?: Maybe<ContactPic>;
  contact_pic?: Maybe<ContactPic>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  id?: Maybe<Scalars['ID']>;
  paymentProof?: Maybe<Scalars['String']>;
  paymentProofFileName?: Maybe<Scalars['String']>;
  paymentProofFileSize?: Maybe<Scalars['String']>;
  payment_proof?: Maybe<Scalars['String']>;
  payment_proof_file_name?: Maybe<Scalars['String']>;
  payment_proof_file_size?: Maybe<Scalars['String']>;
  receipt?: Maybe<Scalars['String']>;
  receiptFileName?: Maybe<Scalars['String']>;
  receiptFileSize?: Maybe<Scalars['Int']>;
  receipt_file_name?: Maybe<Scalars['String']>;
  receipt_file_size?: Maybe<Scalars['Int']>;
  remarks?: Maybe<Scalars['String']>;
  status?: Maybe<CollectionPaymentStatusTypes>;
  transactionId?: Maybe<Scalars['String']>;
  transaction_id?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

export enum CollectionPaymentStatusTypes {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum CollectionPaymentTypes {
  Manual = 'MANUAL',
  Senangpay = 'SENANGPAY'
}

export type CollectionPeriod = {
  __typename?: 'CollectionPeriod';
  amount?: Maybe<Scalars['Float']>;
  collection?: Maybe<Collection>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  lastRemindOn?: Maybe<Scalars['DateTime']>;
  last_remind_on?: Maybe<Scalars['DateTime']>;
  month?: Maybe<Scalars['DateTime']>;
  paymentAcceptAt?: Maybe<Scalars['DateTime']>;
  payment_accept_at?: Maybe<Scalars['DateTime']>;
  payments?: Maybe<Array<Maybe<CollectionPayment>>>;
  period?: Maybe<Scalars['Int']>;
  status?: Maybe<CollectionStatusTypes>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  webhookData?: Maybe<Scalars['String']>;
  webhook_data?: Maybe<Scalars['String']>;
};

export enum CollectionPeriodStatusTypes {
  Paid = 'PAID',
  Pending = 'PENDING'
}

export enum CollectionRemindIntervalTypes {
  Day = 'Day',
  Month = 'Month',
  Week = 'Week',
  Year = 'Year'
}

export type CollectionRemindOnDays = {
  __typename?: 'CollectionRemindOnDays';
  collection?: Maybe<Collection>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  day?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export enum CollectionRemindTypes {
  Full = 'FULL',
  Instalment = 'INSTALMENT'
}

export type CollectionReminderRead = {
  __typename?: 'CollectionReminderRead';
  collection?: Maybe<Collection>;
  createdAt?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  user?: Maybe<User>;
};

export enum CollectionStatusTypes {
  Paid = 'PAID',
  Pending = 'PENDING'
}

export type CollectionTag = {
  __typename?: 'CollectionTag';
  collection?: Maybe<Collection>;
  tag?: Maybe<Tag>;
};

export type CollectionTagOptions = {
  collectionId: Scalars['ID'];
  tagIds: Array<Scalars['ID']>;
};

export type Collector = {
  __typename?: 'Collector';
  assignees?: Maybe<Array<Maybe<CompanyMember>>>;
  collections?: Maybe<Array<Maybe<Collection>>>;
  collectorMembers?: Maybe<Array<Maybe<CollectorMember>>>;
  collector_members?: Maybe<Array<Maybe<CollectorMember>>>;
  company?: Maybe<Company>;
  contact?: Maybe<Contact>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  id?: Maybe<Scalars['ID']>;
  team?: Maybe<CompanyTeam>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};


export type CollectorCollectionsArgs = {
  filters?: Maybe<FilterOptions>;
};

export type CollectorMember = {
  __typename?: 'CollectorMember';
  id?: Maybe<Scalars['ID']>;
  member?: Maybe<CompanyMember>;
};

export type CommonCrud = {
  create?: Maybe<Scalars['Boolean']>;
  delete?: Maybe<Scalars['Boolean']>;
  read?: Maybe<Scalars['Boolean']>;
  update?: Maybe<Scalars['Boolean']>;
};

export enum CommonVisibility {
  Assigned = 'ASSIGNED',
  Hidden = 'HIDDEN',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Specific = 'SPECIFIC'
}

export type CommonVisibilityWhitelist = {
  __typename?: 'CommonVisibilityWhitelist';
  members?: Maybe<Array<Maybe<CompanyMember>>>;
  teams?: Maybe<Array<Maybe<CompanyTeam>>>;
};

export type Company = {
  __typename?: 'Company';
  /** Only for invoice generation */
  accountCode?: Maybe<Scalars['String']>;
  activeSubscription?: Maybe<Array<Maybe<CompanySubscription>>>;
  active_subscription?: Maybe<Array<Maybe<CompanySubscription>>>;
  address?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  currentSubscription?: Maybe<Subscription>;
  defaultTimezone?: Maybe<Scalars['String']>;
  default_timezone?: Maybe<Scalars['String']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  emailEnabled?: Maybe<Scalars['Boolean']>;
  email_enabled?: Maybe<Scalars['Boolean']>;
  employeeTypes?: Maybe<Array<Maybe<EmployeeType>>>;
  employee_types?: Maybe<Array<Maybe<EmployeeType>>>;
  expiredSubscription?: Maybe<Array<Maybe<CompanySubscription>>>;
  id?: Maybe<Scalars['ID']>;
  id_num?: Maybe<Scalars['Int']>;
  idleTiming?: Maybe<Scalars['Int']>;
  idle_timing?: Maybe<Scalars['Int']>;
  invitationCode?: Maybe<Scalars['String']>;
  invitationValidity?: Maybe<Scalars['DateTime']>;
  invitation_code?: Maybe<Scalars['String']>;
  invitation_validity?: Maybe<Scalars['DateTime']>;
  /** Only for invoice generation */
  invoicePrefix?: Maybe<Scalars['String']>;
  invoiceStart?: Maybe<Scalars['String']>;
  logoUrl?: Maybe<Scalars['String']>;
  logo_url?: Maybe<Scalars['String']>;
  members?: Maybe<Array<Maybe<CompanyMember>>>;
  name?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  phoneCallEnabled?: Maybe<Scalars['Boolean']>;
  phone_call_enabled?: Maybe<Scalars['Boolean']>;
  registrationCode?: Maybe<Scalars['String']>;
  settings?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  smsEnabled?: Maybe<Scalars['Boolean']>;
  sms_enabled?: Maybe<Scalars['Boolean']>;
  subscriptions?: Maybe<Array<Maybe<CompanySubscription>>>;
  teams?: Maybe<Array<Maybe<CompanyTeam>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  user?: Maybe<User>;
  website?: Maybe<Scalars['String']>;
  whatsappEnabled?: Maybe<Scalars['Boolean']>;
  whatsapp_enabled?: Maybe<Scalars['Boolean']>;
};

export enum CompanyArchivedUpdate {
  Archived = 'ARCHIVED',
  Unarchived = 'UNARCHIVED'
}

export type CompanyHoliday = {
  __typename?: 'CompanyHoliday';
  active?: Maybe<Scalars['Boolean']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  publicHolidayId?: Maybe<PublicHoliday>;
  public_holiday_id?: Maybe<PublicHoliday>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

export enum CompanyHolidayStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export type CompanyMember = {
  __typename?: 'CompanyMember';
  active?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  employeeType?: Maybe<EmployeeType>;
  employee_type?: Maybe<EmployeeType>;
  hourlyRate?: Maybe<Scalars['Float']>;
  hourly_rate?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  permissions?: Maybe<Array<Maybe<CompanyMemberPermissionScope>>>;
  position?: Maybe<Scalars['String']>;
  referenceImage?: Maybe<CompanyMemberReferenceImage>;
  reference_image?: Maybe<CompanyMemberReferenceImage>;
  setting?: Maybe<CompanyMemberSettings>;
  teams?: Maybe<Array<Maybe<CompanyTeam>>>;
  type?: Maybe<CompanyMemberType>;
  user?: Maybe<User>;
};

export type CompanyMemberPermissionScope = {
  __typename?: 'CompanyMemberPermissionScope';
  enabled?: Maybe<Scalars['Boolean']>;
  scope?: Maybe<Scalars['String']>;
};

/** Describes the reference image of the member for face verification */
export type CompanyMemberReferenceImage = {
  __typename?: 'CompanyMemberReferenceImage';
  actionBy?: Maybe<User>;
  action_by?: Maybe<User>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  imageUrl?: Maybe<Scalars['String']>;
  image_url?: Maybe<Scalars['String']>;
  remark?: Maybe<Scalars['String']>;
  s3Bucket?: Maybe<Scalars['String']>;
  s3Key?: Maybe<Scalars['String']>;
  s3_bucket?: Maybe<Scalars['String']>;
  s3_key?: Maybe<Scalars['String']>;
  status?: Maybe<CompanyMemberReferenceImageStatus>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export type CompanyMemberReferenceImageResponse = {
  __typename?: 'CompanyMemberReferenceImageResponse';
  s3Bucket?: Maybe<Scalars['String']>;
  s3Key?: Maybe<Scalars['String']>;
  s3_bucket?: Maybe<Scalars['String']>;
  s3_key?: Maybe<Scalars['String']>;
  uploadUrl?: Maybe<Scalars['String']>;
  upload_url?: Maybe<Scalars['String']>;
};

export enum CompanyMemberReferenceImageStatus {
  Approved = 'APPROVED',
  PendingApproval = 'PENDING_APPROVAL',
  Rejected = 'REJECTED'
}

export type CompanyMemberSettings = {
  __typename?: 'CompanyMemberSettings';
  senangPay?: Maybe<Scalars['Int']>;
  senang_pay?: Maybe<Scalars['Int']>;
};

export { CompanyMemberType };

export type CompanyPaymentMethod = {
  __typename?: 'CompanyPaymentMethod';
  brand?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  expMonth?: Maybe<Scalars['String']>;
  expYear?: Maybe<Scalars['String']>;
  isDefault?: Maybe<Scalars['Boolean']>;
  last4?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  stripePaymentMethodId?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  user?: Maybe<User>;
};

export type CompanyPermission = {
  __typename?: 'CompanyPermission';
  company?: Maybe<Company>;
  grants?: Maybe<Scalars['String']>;
};

export type CompanyStorageDetails = {
  __typename?: 'CompanyStorageDetails';
  summary?: Maybe<Array<Maybe<CompanyStorageList>>>;
  totalUsageInKB?: Maybe<Scalars['Float']>;
  totalUsageInMB?: Maybe<Scalars['Float']>;
};

export type CompanyStorageList = {
  __typename?: 'CompanyStorageList';
  fileSize?: Maybe<Scalars['Float']>;
  type?: Maybe<Scalars['String']>;
};

export type CompanySubscription = {
  __typename?: 'CompanySubscription';
  active?: Maybe<Scalars['Boolean']>;
  cancelDate?: Maybe<Scalars['DateTime']>;
  cancel_date?: Maybe<Scalars['DateTime']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  discount?: Maybe<SubscriptionDiscount>;
  emailQuota?: Maybe<Scalars['Int']>;
  email_quota?: Maybe<Scalars['Int']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  interval?: Maybe<Scalars['String']>;
  intervalCount?: Maybe<Scalars['Int']>;
  interval_count?: Maybe<Scalars['Int']>;
  package?: Maybe<SubscriptionPackage>;
  packageDescription?: Maybe<Scalars['String']>;
  packageTitle?: Maybe<Scalars['String']>;
  package_description?: Maybe<Scalars['String']>;
  package_title?: Maybe<Scalars['String']>;
  phoneCallQuota?: Maybe<Scalars['Int']>;
  phone_call_quota?: Maybe<Scalars['Int']>;
  price?: Maybe<Scalars['Float']>;
  productId?: Maybe<Scalars['String']>;
  product_id?: Maybe<Scalars['String']>;
  quantity?: Maybe<Scalars['Int']>;
  signatureQuota?: Maybe<Scalars['Int']>;
  signature_quota?: Maybe<Scalars['Int']>;
  smsQuota?: Maybe<Scalars['Int']>;
  sms_quota?: Maybe<Scalars['Int']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  status?: Maybe<SubscriptionStatuses>;
  stripeSubscriptionId?: Maybe<Scalars['String']>;
  stripe_subscription_id?: Maybe<Scalars['String']>;
  subscriptionPackagePrice?: Maybe<SubscriptionPackagePrice>;
  type?: Maybe<PackageTypes>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  whatsappQuota?: Maybe<Scalars['Int']>;
  whatsapp_quota?: Maybe<Scalars['Int']>;
  whiteListedMembers?: Maybe<SubscriptionQuantityResult>;
};

export type CompanyTeam = {
  __typename?: 'CompanyTeam';
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  id: Scalars['ID'];
  members?: Maybe<Array<Maybe<CompanyMember>>>;
  statuses?: Maybe<Array<Maybe<CompanyTeamStatus>>>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

/** Also referred to as "dynamic statuses". Refers to table card_statuses */
export type CompanyTeamStatus = {
  __typename?: 'CompanyTeamStatus';
  color?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['String']>;
  parentStatus?: Maybe<CompanyTeamStatusType>;
  parent_status?: Maybe<CompanyTeamStatusType>;
  percentage?: Maybe<Scalars['Int']>;
  sequence?: Maybe<Scalars['Int']>;
  stage?: Maybe<StageType>;
  team?: Maybe<CompanyTeam>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

export type CompanyTeamStatusSequenceInput = {
  companyTeamStatusId?: Maybe<Scalars['ID']>;
  company_team_status_id: Scalars['ID'];
  sequence: Scalars['Int'];
};

export enum CompanyTeamStatusType {
  Done = 'DONE',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type CompanyWorkDaySetting = {
  __typename?: 'CompanyWorkDaySetting';
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  day?: Maybe<WorkDay>;
  endHour?: Maybe<Scalars['String']>;
  end_hour?: Maybe<Scalars['String']>;
  open?: Maybe<Scalars['Boolean']>;
  startHour?: Maybe<Scalars['String']>;
  start_hour?: Maybe<Scalars['String']>;
  timezone?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

export type Contact = {
  __typename?: 'Contact';
  /** Only for invoice generation */
  accountCode?: Maybe<Scalars['String']>;
  activities?: Maybe<Array<Maybe<ContactActivityRaw>>>;
  address?: Maybe<Scalars['String']>;
  attendances?: Maybe<Array<Maybe<Attendance>>>;
  collections?: Maybe<Array<Maybe<Collection>>>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  dealCreator?: Maybe<User>;
  dealValue?: Maybe<Scalars['Float']>;
  deal_creator?: Maybe<User>;
  deal_value?: Maybe<Scalars['Float']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  edited?: Maybe<Scalars['Boolean']>;
  groups?: Maybe<Array<Maybe<ContactGroup>>>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  notes?: Maybe<Array<Maybe<ContactNote>>>;
  pics?: Maybe<Array<Maybe<ContactPic>>>;
  remarks?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  taskBoards?: Maybe<Array<Maybe<TaskBoard>>>;
  task_boards?: Maybe<Array<Maybe<TaskBoard>>>;
  type?: Maybe<ContactType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};


export type ContactActivitiesArgs = {
  isCount: Scalars['Boolean'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  tableType: ContactActivityTableType;
};

export type ContactActivity = {
  __typename?: 'ContactActivity';
  activityType?: Maybe<Scalars['String']>;
  activity_type?: Maybe<Scalars['String']>;
  assignee?: Maybe<CompanyMember>;
  attachment?: Maybe<TaskAttachment>;
  createdBy?: Maybe<User>;
  created_by?: Maybe<User>;
  date?: Maybe<Scalars['DateTime']>;
  fromDate?: Maybe<Scalars['DateTime']>;
  from_date?: Maybe<Scalars['DateTime']>;
  pic?: Maybe<ContactPic>;
  task?: Maybe<Task>;
  toDate?: Maybe<Scalars['DateTime']>;
  to_date?: Maybe<Scalars['DateTime']>;
};

export type ContactActivityRaw = {
  __typename?: 'ContactActivityRaw';
  action?: Maybe<Scalars['String']>;
  changedValues?: Maybe<Scalars['String']>;
  changed_values?: Maybe<Scalars['String']>;
  currentValues?: Maybe<Scalars['String']>;
  current_values?: Maybe<Scalars['String']>;
  previousValues?: Maybe<Scalars['String']>;
  previous_values?: Maybe<Scalars['String']>;
  tableName?: Maybe<Scalars['String']>;
  table_name?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['DateTime']>;
};

export enum ContactActivityTableType {
  All = 'ALL',
  Collections = 'COLLECTIONS',
  Contacts = 'CONTACTS',
  Tasks = 'TASKS'
}

export enum ContactActivityType {
  AssigneeAdded = 'ASSIGNEE_ADDED',
  AssigneeRemoved = 'ASSIGNEE_REMOVED',
  AttachmentRemoved = 'ATTACHMENT_REMOVED',
  AttachmentUploaded = 'ATTACHMENT_UPLOADED',
  PicAdded = 'PIC_ADDED',
  PicRemoved = 'PIC_REMOVED',
  TaskArchived = 'TASK_ARCHIVED',
  TaskCreated = 'TASK_CREATED',
  TaskRemoved = 'TASK_REMOVED',
  TaskUnarchived = 'TASK_UNARCHIVED',
  UpdatedDueDate = 'UPDATED_DUE_DATE',
  UpdatedTeamStatus = 'UPDATED_TEAM_STATUS'
}

export type ContactGroup = {
  __typename?: 'ContactGroup';
  color?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  contacts?: Maybe<Array<Maybe<Contact>>>;
  count?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  type?: Maybe<ContactGroupType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export enum ContactGroupType {
  Company = 'COMPANY',
  Individual = 'INDIVIDUAL',
  Unassigned = 'UNASSIGNED'
}

export type ContactNote = {
  __typename?: 'ContactNote';
  contact?: Maybe<Contact>;
  content?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  noteContent?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type ContactNoteInput = {
  content?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['DateTime']>;
  noteContent?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['ID']>;
  user_id?: Maybe<Scalars['ID']>;
};

export type ContactPic = {
  __typename?: 'ContactPic';
  contact?: Maybe<Contact>;
  contactNo?: Maybe<Scalars['String']>;
  contact_no?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  nationalFormat?: Maybe<Scalars['String']>;
  national_format?: Maybe<Scalars['String']>;
  remarks?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  user?: Maybe<User>;
};

export type ContactTag = {
  __typename?: 'ContactTag';
  contact?: Maybe<Contact>;
  tag?: Maybe<Tag>;
};

export type ContactTagOptions = {
  contactId: Scalars['ID'];
  tagIds: Array<Scalars['ID']>;
};

export type ContactTask = {
  __typename?: 'ContactTask';
  dueDate?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  status?: Maybe<ContactTaskStatusType>;
};

export { ContactTaskStatusType };

export { ContactType };

export type CopyProjectInput = {
  projectId: Scalars['ID'];
  targetWorkspaceId: Scalars['ID'];
};

export type CopyTaskInput = {
  companyId: Scalars['ID'];
  companyTeamId?: Maybe<Scalars['ID']>;
  copyAttachments: Scalars['Boolean'];
  copySubtasks: Scalars['Boolean'];
  taskBoardId: Scalars['ID'];
  taskId: Scalars['ID'];
};

export type CopyTasksInput = {
  companyId: Scalars['ID'];
  companyTeamId?: Maybe<Scalars['ID']>;
  copyAttachments: Scalars['Boolean'];
  copySubtasks: Scalars['Boolean'];
  taskBoardId: Scalars['ID'];
  taskIds: Array<Scalars['ID']>;
};

export type CreateBillingInvoiceInput = {
  docDate: Scalars['DateTime'];
  /** Get companyName from contactId */
  picId: Scalars['ID'];
  projectId: Scalars['ID'];
  /** Maximum 200 characters */
  remarks?: Maybe<Scalars['String']>;
  terms?: Maybe<Scalars['Int']>;
};

export type CreateBillingInvoiceItemInput = {
  customName?: Maybe<Scalars['String']>;
  discountPercentage?: Maybe<Scalars['Float']>;
  invoiceId: Scalars['ID'];
  taskId?: Maybe<Scalars['ID']>;
  taxPercentage?: Maybe<Scalars['Float']>;
  unitPrice?: Maybe<Scalars['Float']>;
};

export type CreateCollectionInput = {
  contactId?: Maybe<Scalars['ID']>;
  contact_id: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  emailNotify?: Maybe<Scalars['Boolean']>;
  email_notify?: Maybe<Scalars['Boolean']>;
  endMonth?: Maybe<Scalars['DateTime']>;
  end_month?: Maybe<Scalars['DateTime']>;
  isDraft?: Maybe<Scalars['Boolean']>;
  is_draft: Scalars['Boolean'];
  notifyPics?: Maybe<Array<Scalars['ID']>>;
  notifyTypes?: Maybe<Array<Maybe<Scalars['String']>>>;
  notify_pics?: Maybe<Array<Scalars['ID']>>;
  notify_types?: Maybe<Array<Maybe<Scalars['String']>>>;
  payableAmount?: Maybe<Scalars['Float']>;
  payable_amount: Scalars['Float'];
  paymentType?: Maybe<CollectionPaymentTypes>;
  payment_type?: Maybe<CollectionPaymentTypes>;
  periods?: Maybe<Scalars['Int']>;
  refNo?: Maybe<Scalars['String']>;
  ref_no: Scalars['String'];
  remindEndOn?: Maybe<Scalars['DateTime']>;
  remindInterval?: Maybe<CollectionRemindIntervalTypes>;
  remindOnDate?: Maybe<Scalars['Int']>;
  remindOnMonth?: Maybe<Scalars['Int']>;
  remindType?: Maybe<CollectionRemindTypes>;
  remind_end_on?: Maybe<Scalars['DateTime']>;
  remind_interval?: Maybe<CollectionRemindIntervalTypes>;
  remind_on_date?: Maybe<Scalars['Int']>;
  remind_on_month?: Maybe<Scalars['Int']>;
  remind_type?: Maybe<CollectionRemindTypes>;
  smsNotify?: Maybe<Scalars['Boolean']>;
  sms_notify?: Maybe<Scalars['Boolean']>;
  startMonth?: Maybe<Scalars['DateTime']>;
  start_month?: Maybe<Scalars['DateTime']>;
  tagIds?: Maybe<Array<Scalars['ID']>>;
  title: Scalars['String'];
  voiceNotify?: Maybe<Scalars['Boolean']>;
  voice_notify?: Maybe<Scalars['Boolean']>;
  whatsappNotify?: Maybe<Scalars['Boolean']>;
  whatsapp_notify?: Maybe<Scalars['Boolean']>;
};

export type CreateCollectionPaymentInput = {
  collectionId?: Maybe<Scalars['ID']>;
  collectionPeriodId?: Maybe<Scalars['ID']>;
  collection_id: Scalars['ID'];
  collection_period_id: Scalars['ID'];
};

export type CreateCollectorInput = {
  contactId?: Maybe<Scalars['ID']>;
  contact_id: Scalars['ID'];
  memberIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  member_ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
  teamId?: Maybe<Scalars['ID']>;
  team_id?: Maybe<Scalars['ID']>;
};

export type CreateCompanyHolidayInput = {
  endDate?: Maybe<Scalars['DateTime']>;
  end_date: Scalars['DateTime'];
  name: Scalars['String'];
  startDate?: Maybe<Scalars['DateTime']>;
  start_date: Scalars['DateTime'];
};

export type CreateCompanyInput = {
  /** Only for invoice generation */
  accountCode?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateCompanyPaymentMethodInput = {
  companyId: Scalars['ID'];
  stripePaymentMethodId: Scalars['String'];
};

export type CreateCompanyTeamInput = {
  memberIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  member_ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
  title: Scalars['String'];
};

export type CreateContactGroupInput = {
  name: Scalars['String'];
};

export type CreateContactInput = {
  /** Only for invoice generation */
  accountCode?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  dealValue?: Maybe<Scalars['Float']>;
  deal_value?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  remarks?: Maybe<Scalars['String']>;
  tagIds?: Maybe<Array<Scalars['ID']>>;
  type: ContactType;
};

export type CreateContactPicInput = {
  contactNo?: Maybe<Scalars['String']>;
  contact_no?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  remarks?: Maybe<Scalars['String']>;
};

export type CreateCustomColumnForGroupInput = {
  groupId: Scalars['ID'];
  name: Scalars['String'];
  type: ProjectGroupCustomAttributeType;
};

export type CreateCustomTimesheetApprovalInput = {
  customName: Scalars['String'];
  daysInput: TimesheetDaysInput;
};

export type CreateCustomTimesheetApprovalsInput = {
  companyMemberId: Scalars['ID'];
  customInput: Array<CreateCustomTimesheetApprovalInput>;
};

export type CreateLocationInput = {
  address?: Maybe<Scalars['String']>;
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
  metadata?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  radius?: Maybe<Scalars['Float']>;
};

export type CreateProjectGroupInput = {
  name: Scalars['String'];
  projectId: Scalars['ID'];
};

export type CreateProjectInput = {
  companyId: Scalars['ID'];
  name: Scalars['String'];
  ownerIds?: Maybe<Array<Scalars['ID']>>;
  projectTemplateId?: Maybe<Scalars['ID']>;
  visibility?: Maybe<ProjectVisibility>;
  workspaceId: Scalars['ID'];
};

export type CreateProjectStatusInput = {
  color: Scalars['String'];
  name: Scalars['String'];
  notify?: Maybe<Scalars['Boolean']>;
  projectId: Scalars['ID'];
};

export type CreateProjectTemplateStatusInput = {
  color: Scalars['String'];
  name: Scalars['String'];
  notify: Scalars['Boolean'];
  projectTemplateId: Scalars['ID'];
};

export type CreateSubscriptionInput = {
  packagePriceId?: Maybe<Scalars['ID']>;
  package_price_id: Scalars['ID'];
  quantity?: Maybe<Scalars['Int']>;
};

export type CreateSubscriptionPackageInput = {
  invoiceQuota?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  reportQuota?: Maybe<Scalars['Int']>;
  storageQuota?: Maybe<Scalars['Int']>;
  taskQuota?: Maybe<Scalars['Int']>;
  teamQuota?: Maybe<Scalars['Int']>;
  userQuota?: Maybe<Scalars['Int']>;
};

export type CreateSubscriptionPriceInput = {
  amount: Scalars['Float'];
  interval?: Maybe<SubscriptionPriceInterval>;
  productId: Scalars['String'];
};

export type CreateSubscriptionProductInput = {
  name: Scalars['String'];
};

export type CreateTagGroupInput = {
  companyId: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateTagInput = {
  color: Scalars['String'];
  companyId: Scalars['ID'];
  groupId?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
};

export type CreateTaskBoardFolderInput = {
  name: Scalars['String'];
  type: TaskBoardFolderType;
};

export type CreateTaskTemplateInput = {
  companyId: Scalars['ID'];
  copyAttachments: Scalars['Boolean'];
  copySubtasks: Scalars['Boolean'];
  /** Sending a cronString means it will be classified as recurring and no longer should be listed as a template */
  cronString?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  /** Deprecated, sending a cronString will automatically mark it as recurring */
  isRecurring?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  sourceTaskId: Scalars['ID'];
};

export type CreateTimesheetApprovalInput = {
  daysInput: TimesheetDaysInput;
  taskId: Scalars['ID'];
};

export type CreateTimesheetApprovalsInput = {
  companyMemberId: Scalars['ID'];
  tasksInput: Array<CreateTimesheetApprovalInput>;
};

export type CreateWorkspaceInput = {
  bgColor: Scalars['String'];
  companyId: Scalars['ID'];
  name: Scalars['String'];
};

export type CustomTimesheetApprovalInput = {
  companyMemberId?: Maybe<Scalars['ID']>;
  customName: Scalars['String'];
};

export type CustomTimesheetDayApproval = {
  __typename?: 'CustomTimesheetDayApproval';
  billable?: Maybe<Scalars['Boolean']>;
  companyMember?: Maybe<CompanyMember>;
  customName?: Maybe<Scalars['String']>;
  day?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  status?: Maybe<TimesheetApprovalStatus>;
  total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type DateRangeFilter = {
  end_date?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
};

export type DayTimesheetFilterOptions = {
  companyMemberId?: Maybe<Scalars['ID']>;
  day: Scalars['Int'];
  month: Scalars['Int'];
  taskId?: Maybe<Scalars['ID']>;
  year: Scalars['Int'];
};

export type DeleteCollectorInput = {
  collectorIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  collector_ids: Array<Maybe<Scalars['ID']>>;
  companyId?: Maybe<Scalars['ID']>;
  company_id: Scalars['ID'];
};

export type DeleteCompanyPaymentMethodInput = {
  companyId: Scalars['ID'];
  stripePaymentMethodId: Scalars['String'];
};

export type DeleteCompanyPaymentMethodResponse = {
  __typename?: 'DeleteCompanyPaymentMethodResponse';
  affectedNum?: Maybe<Scalars['Int']>;
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteContactPicResponse = {
  __typename?: 'DeleteContactPicResponse';
  contact?: Maybe<Contact>;
};

export type DeleteCustomColumnForGroupInput = {
  attributeId: Scalars['ID'];
  groupId: Scalars['ID'];
};

export type DeleteCustomTimesheetApprovalInput = {
  customName: Scalars['String'];
  daysInput: DeleteTimesheetDaysInput;
};

export type DeleteCustomTimesheetApprovalsInput = {
  companyMemberId: Scalars['ID'];
  customInput: Array<DeleteCustomTimesheetApprovalInput>;
};

export type DeleteCustomValueFromTaskInput = {
  attributeId: Scalars['ID'];
  groupId: Scalars['ID'];
  taskId: Scalars['ID'];
};

export type DeletePaymentProofInput = {
  collectionId?: Maybe<Scalars['ID']>;
  collectionPaymentId?: Maybe<Scalars['ID']>;
  collectionPeriodId?: Maybe<Scalars['ID']>;
  collection_id: Scalars['ID'];
  collection_payment_id: Scalars['ID'];
  collection_period_id: Scalars['ID'];
};

export type DeleteProjectGroupInput = {
  projectGroupIds: Array<Scalars['ID']>;
};

export type DeleteProjectStatusInput = {
  projectStatusIds: Array<Scalars['ID']>;
};

export type DeleteProjectTemplateIdsInput = {
  projectTemplateIds: Array<Scalars['ID']>;
};

export type DeleteProjectsInput = {
  projectIds: Array<Scalars['ID']>;
};

export type DeleteTemplateInput = {
  companyId: Scalars['ID'];
  templateId: Scalars['ID'];
};

export type DeleteTimesheetDaysInput = {
  day: Scalars['Int'];
  month: Scalars['Int'];
  year: Scalars['Int'];
};

export type DeleteWorkspacesInput = {
  workspaceIds: Array<Scalars['ID']>;
};

export type DiscountedPrice = {
  __typename?: 'DiscountedPrice';
  active?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  discountedPrice?: Maybe<Scalars['Float']>;
  discounted_price?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Int']>;
  interval?: Maybe<Scalars['String']>;
  intervalCount?: Maybe<Scalars['Int']>;
  interval_count?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  package?: Maybe<SubscriptionPackage>;
  price?: Maybe<Scalars['Float']>;
  pricePerUnit?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
  quantity?: Maybe<Scalars['Int']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripe_price_id?: Maybe<Scalars['String']>;
};

export type DowngradeSubscriptionInput = {
  companyId: Scalars['ID'];
  interval: SubscriptionPriceInterval;
  packageId: Scalars['ID'];
  subscriptionId: Scalars['ID'];
};

export type DowngradeSubscriptionPackageProductsInput = {
  packageId: Scalars['ID'];
  productId: Scalars['ID'];
};

export type DuplicateTasksInput = {
  parentId?: Maybe<Scalars['ID']>;
  projectGroupId?: Maybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  taskIds: Array<Scalars['ID']>;
};

export type EditCustomColumnForGroupInput = {
  attributeId: Scalars['ID'];
  groupId: Scalars['ID'];
  name: Scalars['String'];
};

export type EditProjectGroupInput = {
  name: Scalars['String'];
  projectGroupId: Scalars['ID'];
};

/** Only works with new comment system */
export type EditTaskCommentInput = {
  commentId: Scalars['ID'];
  /** New and old mentions */
  mentionIds?: Maybe<Array<Scalars['ID']>>;
  messageContent: Scalars['ID'];
};

export type EmployeeType = {
  __typename?: 'EmployeeType';
  archived?: Maybe<Scalars['Boolean']>;
  hasOvertime?: Maybe<Scalars['Boolean']>;
  has_overtime?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  /** Work schedule */
  workDaySettings?: Maybe<Array<Maybe<CompanyWorkDaySetting>>>;
};

export type ExternalAttachmentInput = {
  name: Scalars['String'];
  source: ExternalFileSource;
  type: Scalars['String'];
  url: Scalars['String'];
};

export enum ExternalFileSource {
  Dropbox = 'DROPBOX',
  GoogleDrive = 'GOOGLE_DRIVE',
  OneDrive = 'ONE_DRIVE'
}

export type FilterOptions = {
  archived?: Maybe<ArchivedStatus>;
  category?: Maybe<TaskFilterOptions>;
  date?: Maybe<DateRangeFilter>;
  project_type?: Maybe<TaskBoardType>;
  taskMember?: Maybe<TaskMemberFilter>;
  task_member?: Maybe<TaskMemberFilter>;
  team_status?: Maybe<TeamStatusFilter>;
};

export type GetAttendancesInput = {
  companyId?: Maybe<Scalars['ID']>;
  companyMemberId?: Maybe<Scalars['ID']>;
  company_id: Scalars['ID'];
  company_member_id?: Maybe<Scalars['ID']>;
  contactId?: Maybe<Scalars['ID']>;
  fromDate?: Maybe<Scalars['DateTime']>;
  from_date: Scalars['DateTime'];
  toDate?: Maybe<Scalars['DateTime']>;
  to_date: Scalars['DateTime'];
};

export type GroupQuery = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  taskQuery?: Maybe<Array<Maybe<GroupTaskQuery>>>;
};

export type GroupTaskQuery = {
  groupId?: Maybe<Scalars['ID']>;
  limitTasks?: Maybe<Scalars['Int']>;
  offsetTask?: Maybe<Scalars['Int']>;
};

export type Holiday = {
  __typename?: 'Holiday';
  active?: Maybe<Scalars['Boolean']>;
  company?: Maybe<Company>;
  countryCode?: Maybe<Scalars['String']>;
  country_code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  date?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  year?: Maybe<Scalars['Int']>;
};

export type ImageGroup = {
  __typename?: 'ImageGroup';
  large?: Maybe<Scalars['String']>;
  medium?: Maybe<Scalars['String']>;
  original?: Maybe<Scalars['String']>;
  small?: Maybe<Scalars['String']>;
};

export type ImportTasksInput = {
  attachment: Scalars['Upload'];
  groupId?: Maybe<Scalars['ID']>;
  projectId: Scalars['ID'];
};

export type ImportTasksResponse = {
  __typename?: 'ImportTasksResponse';
  failed?: Maybe<Scalars['Int']>;
  imported?: Maybe<Scalars['Int']>;
  tasks?: Maybe<Array<Task>>;
};

export type LinkAttachmentToCommentInput = {
  attachmentId: Scalars['ID'];
  commentId: Scalars['ID'];
};

export type LinkExternalAttachmentsInput = {
  externalAttachments: Array<ExternalAttachmentInput>;
  taskId: Scalars['ID'];
};

export type Location = {
  __typename?: 'Location';
  address?: Maybe<Scalars['String']>;
  archived?: Maybe<Scalars['Boolean']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  id: Scalars['ID'];
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
  metadata?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  radius?: Maybe<Scalars['Float']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

/** Refer to activity_tracker_monthly_mv */
export type MonthlyActivityTracking = {
  __typename?: 'MonthlyActivityTracking';
  company_member?: Maybe<CompanyMember>;
  created_at?: Maybe<Scalars['DateTime']>;
  task?: Maybe<Task>;
  updated_at?: Maybe<Scalars['DateTime']>;
  week_number?: Maybe<Scalars['Int']>;
  week_total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type MonthlyTimesheetFilterOptions = {
  companyMemberId?: Maybe<Scalars['ID']>;
  taskId?: Maybe<Scalars['ID']>;
  weekNumbers?: Maybe<Array<Maybe<Scalars['Int']>>>;
  year?: Maybe<Scalars['Int']>;
};

export type MoveProjectsToWorkspaceInput = {
  destinationWorkspaceId: Scalars['ID'];
  projectIds: Array<Scalars['ID']>;
  sourceWorkspaceId: Scalars['ID'];
};

export type MoveTaskToMemberInput = {
  destinationMemberId: Scalars['ID'];
  sourceMemberId: Scalars['ID'];
  taskId: Scalars['ID'];
};

export type MoveTasksInput = {
  projectGroupId: Scalars['ID'];
  projectId: Scalars['ID'];
  taskIds: Array<Scalars['ID']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateCollections?: Maybe<Array<Maybe<Collection>>>;
  activatePublicHoliday?: Maybe<CompanyHoliday>;
  addCompanyTeamStatus?: Maybe<CompanyTeamStatus>;
  addCustomValueToTask?: Maybe<TaskCustomValue>;
  addExpoPushToken?: Maybe<User>;
  addMemberToCompany?: Maybe<Company>;
  addMembersToContactGroup?: Maybe<Array<Maybe<Contact>>>;
  addPackageToSubscription?: Maybe<Array<Maybe<CompanySubscription>>>;
  addSenangPayUsers?: Maybe<Array<Maybe<CompanyMember>>>;
  addSubscriptionProductToPackage?: Maybe<SubscriptionPackage>;
  addTaskWatchers?: Maybe<Array<Maybe<TaskWatcher>>>;
  addToTaskVisibilityWhitelist?: Maybe<Task>;
  addToVisibilityWhitelist?: Maybe<TaskBoard>;
  addToVisibilityWhitelistProject?: Maybe<TaskBoard>;
  addToWorkspaceVisibilityWhitelist?: Maybe<Workspace>;
  applyTaskTemplate?: Maybe<TaskTemplate>;
  archiveAttendanceLabel?: Maybe<AttendanceLabel>;
  archiveCollections?: Maybe<Array<Maybe<Collection>>>;
  archiveEmployeeType?: Maybe<EmployeeType>;
  archiveTasks?: Maybe<Array<Maybe<Task>>>;
  assignCollectionTags?: Maybe<Array<Maybe<CollectionTag>>>;
  assignContactTags?: Maybe<Array<Maybe<ContactTag>>>;
  assignMembersToCollection?: Maybe<Collection>;
  assignProjectsToWorkspace?: Maybe<Workspace>;
  assignSubscriptionQuantityToMember?: Maybe<Array<Maybe<CompanyMember>>>;
  assignTaskBoardsToFolder?: Maybe<TaskBoardFolder>;
  assignTaskMembers?: Maybe<Array<Maybe<TaskMember>>>;
  assignTaskPics?: Maybe<Array<Maybe<TaskPic>>>;
  assignTaskTags?: Maybe<Array<Maybe<TaskTag>>>;
  attachPaymentMethod?: Maybe<User>;
  bulkUploadContacts?: Maybe<BulkUploadContactsResponse>;
  bulkUploadMembers?: Maybe<BulkUploadMembersResponse>;
  cancelAllSubscriptions?: Maybe<Array<Maybe<CompanySubscription>>>;
  cancelOmniTrialSubscription?: Maybe<CompanySubscription>;
  cancelSubscription?: Maybe<CompanySubscription>;
  /**
   * Cancel subscription in this case means switching to a free plan package but there will still be a subscription
   * object available
   */
  cancelSubscriptionV2?: Maybe<Subscription>;
  changeGroupTasks?: Maybe<Array<Maybe<Task>>>;
  changeTaskPosition?: Maybe<Task>;
  /** Clock out without starting a new entry */
  closeAttendance?: Maybe<Attendance>;
  closeAttendanceForUser?: Maybe<Attendance>;
  collectionReminderRead?: Maybe<CollectionReminderRead>;
  copyProject?: Maybe<TaskBoard>;
  copyTask?: Maybe<Task>;
  copyTasks?: Maybe<Array<Maybe<Task>>>;
  createAttendanceLabel?: Maybe<AttendanceLabel>;
  createBillingInvoice?: Maybe<BillingInvoice>;
  createBillingInvoiceItem?: Maybe<BillingInvoiceItem>;
  createChecklist?: Maybe<Checklist>;
  createCollaborationBoard?: Maybe<TaskBoard>;
  createCollection?: Maybe<Collection>;
  createCollector?: Maybe<Collector>;
  createCompany?: Maybe<Company>;
  createCompanyPaymentMethod?: Maybe<CompanyPaymentMethod>;
  createCompanyTeam?: Maybe<CompanyTeam>;
  createContact?: Maybe<Contact>;
  createContactGroup?: Maybe<ContactGroup>;
  createContactNote?: Maybe<ContactNote>;
  createContactPic?: Maybe<ContactPic>;
  createCustomColumnForGroup?: Maybe<ProjectGroupCustomColumn>;
  createCustomTimesheetApprovals?: Maybe<Array<Maybe<CustomTimesheetDayApproval>>>;
  createEmployeeType?: Maybe<EmployeeType>;
  createHoliday?: Maybe<Array<Maybe<Holiday>>>;
  createLocation?: Maybe<Location>;
  createPersonalTask?: Maybe<Task>;
  createProject?: Maybe<TaskBoard>;
  createProjectClaim?: Maybe<ProjectClaim>;
  createProjectGroup?: Maybe<ProjectGroup>;
  createProjectInvoice?: Maybe<ProjectInvoice>;
  createProjectStatus?: Maybe<ProjectStatus>;
  createProjectTemplate?: Maybe<ProjectTemplate>;
  createProjectTemplateStatus?: Maybe<ProjectTemplateStatus>;
  createProjectTimeCost?: Maybe<ProjectTimeCost>;
  createShortUrl?: Maybe<ShortUrl>;
  /** Create a product first before creating a package */
  createSubscriptionPackage?: Maybe<SubscriptionPackage>;
  /**
   * After creating a new price, it takes a few seconds to be available in Stripe, so
   * it will not be available in SubscriptionProduct until it's available in Stripe
   */
  createSubscriptionPrice?: Maybe<SubscriptionProduct>;
  createSubscriptionProduct?: Maybe<SubscriptionProduct>;
  createSubtask?: Maybe<Subtask>;
  createTag?: Maybe<Tag>;
  createTagGroup?: Maybe<TagGroup>;
  createTask?: Maybe<Task>;
  createTaskBoard?: Maybe<TaskBoard>;
  createTaskBoardFolder?: Maybe<TaskBoardFolder>;
  createTaskBoardTeam?: Maybe<TaskBoardTeam>;
  createTaskTemplate?: Maybe<TaskTemplate>;
  createTimesheetApprovals?: Maybe<Array<Maybe<TimesheetDayApproval>>>;
  createTimesheetEntry?: Maybe<Timesheet>;
  createWorkspace?: Maybe<Workspace>;
  deactivateCollections?: Maybe<Array<Maybe<Collection>>>;
  deactivatePublicHoliday?: Maybe<CompanyHoliday>;
  deleteBillingInvoiceItems?: Maybe<BillingInvoiceItem>;
  deleteBillingInvoices?: Maybe<Array<Maybe<BillingInvoice>>>;
  deleteChecklists?: Maybe<Array<Maybe<Checklist>>>;
  deleteCollectionTags?: Maybe<Array<Maybe<CollectionTag>>>;
  deleteCollections?: Maybe<Array<Maybe<Collection>>>;
  deleteCollectors?: Maybe<Array<Maybe<Collector>>>;
  deleteCompany?: Maybe<Company>;
  deleteCompanyHoliday?: Maybe<CompanyHoliday>;
  deleteCompanyPaymentMethod?: Maybe<DeleteCompanyPaymentMethodResponse>;
  deleteCompanyTeam?: Maybe<CompanyTeam>;
  deleteCompanyTeamStatus?: Maybe<CompanyTeamStatus>;
  deleteContactGroup?: Maybe<ContactGroup>;
  /** Ignores ids that does not exist and deletes the ones that do. */
  deleteContactNotes?: Maybe<Array<Maybe<ContactNote>>>;
  deleteContactPic?: Maybe<DeleteContactPicResponse>;
  deleteContactTags?: Maybe<Array<Maybe<ContactTag>>>;
  deleteContacts?: Maybe<Array<Maybe<Contact>>>;
  deleteCustomColumnForGroup?: Maybe<ProjectGroupCustomColumn>;
  deleteCustomTimesheetApprovals?: Maybe<Array<Maybe<CustomTimesheetDayApproval>>>;
  deleteCustomValueFromTask?: Maybe<TaskCustomValue>;
  deleteLocations?: Maybe<Array<Maybe<Location>>>;
  deletePaymentProof?: Maybe<CollectionPayment>;
  deleteProjectClaims?: Maybe<Array<Maybe<ProjectClaim>>>;
  deleteProjectGroups?: Maybe<Array<Maybe<ProjectGroup>>>;
  deleteProjectInvoices?: Maybe<Array<Maybe<ProjectInvoice>>>;
  deleteProjectStatuses?: Maybe<Array<Maybe<ProjectStatus>>>;
  deleteProjectTemplateStatuses?: Maybe<Array<Maybe<ProjectTemplateStatus>>>;
  deleteProjectTemplates?: Maybe<Array<Maybe<ProjectTemplate>>>;
  deleteProjectTimeCosts?: Maybe<Array<Maybe<ProjectTimeCost>>>;
  deleteProjects?: Maybe<Array<Maybe<TaskBoard>>>;
  deleteSubscriptionProduct?: Maybe<SubscriptionProduct>;
  deleteSubtasks?: Maybe<Array<Maybe<Subtask>>>;
  deleteTag?: Maybe<Tag>;
  deleteTagGroup?: Maybe<TagGroup>;
  deleteTaskAttachments?: Maybe<Array<Maybe<TaskAttachment>>>;
  deleteTaskBoardFolder?: Maybe<TaskBoardFolder>;
  deleteTaskBoardTeams?: Maybe<Array<Maybe<TaskBoardTeam>>>;
  deleteTaskBoards?: Maybe<Array<Maybe<TaskBoard>>>;
  deleteTaskComment?: Maybe<TaskComment>;
  deleteTaskMembers?: Maybe<Array<Maybe<TaskMember>>>;
  deleteTaskPics?: Maybe<Array<Maybe<TaskPic>>>;
  deleteTaskTags?: Maybe<Array<Maybe<TaskTag>>>;
  deleteTaskTemplate?: Maybe<TaskTemplate>;
  deleteTasks?: Maybe<Array<Maybe<Task>>>;
  deleteWorkspaces?: Maybe<Array<Maybe<Workspace>>>;
  detachPaymentMethod?: Maybe<User>;
  /** Only for downgrading to a lower subscription plan. If moving to free plan use cancelSubscription. */
  downgradeSubscription?: Maybe<Subscription>;
  /** Include x-company-id in headers */
  duplicateTasks?: Maybe<Array<Maybe<Task>>>;
  editCustomColumnForGroup?: Maybe<ProjectGroupCustomColumn>;
  editPackageQuantity?: Maybe<CompanySubscription>;
  editProjectClaim?: Maybe<ProjectClaim>;
  editProjectGroup?: Maybe<ProjectGroup>;
  editProjectInvoice?: Maybe<ProjectInvoice>;
  editProjectSettings?: Maybe<ProjectSettings>;
  editProjectStatus?: Maybe<ProjectStatus>;
  editProjectTemplate?: Maybe<ProjectTemplate>;
  editProjectTemplateStatus?: Maybe<ProjectTemplateStatus>;
  editProjectTimeCost?: Maybe<ProjectTimeCost>;
  editTaskComment?: Maybe<TaskComment>;
  importTasks?: Maybe<ImportTasksResponse>;
  linkAttachmentToComment?: Maybe<TaskComment>;
  linkExternalAttachments?: Maybe<Task>;
  loginUser?: Maybe<User>;
  moveProjectsToWorkspace?: Maybe<Array<Maybe<Workspace>>>;
  moveTaskToMember?: Maybe<Task>;
  moveTasks?: Maybe<Array<Maybe<Task>>>;
  postTaskComment?: Maybe<TaskComment>;
  receivePaymentInvoice?: Maybe<BillingInvoice>;
  removeExpoPushToken?: Maybe<User>;
  removeFromTaskVisibilityWhitelist?: Maybe<Task>;
  removeFromVisibilityWhitelist?: Maybe<TaskBoard>;
  removeFromVisibilityWhitelistProject?: Maybe<TaskBoard>;
  removeFromWorkspaceVisibilityWhitelist?: Maybe<Workspace>;
  removeMemberFromCompany?: Maybe<Company>;
  removeMemberFromCompanyTeam?: Maybe<CompanyTeam>;
  removeMemberFromContactGroup?: Maybe<ContactGroup>;
  removeMembersFromCollection?: Maybe<Collection>;
  removePackagesFromSubscription?: Maybe<Array<Maybe<CompanySubscription>>>;
  removeProjectsFromWorkspace?: Maybe<Workspace>;
  removeSenangPayUsers?: Maybe<Array<Maybe<CompanyMember>>>;
  removeSubscriptionProductFromPackage?: Maybe<SubscriptionPackage>;
  removeSubscriptionQuantityFromMember?: Maybe<Array<Maybe<CompanyMember>>>;
  removeTaskBoardsFromFolder?: Maybe<Array<Maybe<TaskBoard>>>;
  removeTaskPics?: Maybe<Array<Maybe<TaskPic>>>;
  removeTaskWatchers?: Maybe<Array<Maybe<TaskWatcher>>>;
  reorderGroups?: Maybe<Array<Maybe<ProjectGroup>>>;
  requestAccountDeletion?: Maybe<RequestAccountDeletionResponse>;
  requestDedocoSubscription?: Maybe<CompanySubscription>;
  requestOmniSubscription?: Maybe<Array<Maybe<CompanySubscription>>>;
  requestSubscription?: Maybe<CompanySubscription>;
  requestTrialOmniSubscription?: Maybe<Array<Maybe<CompanySubscription>>>;
  resendCollectionNotification?: Maybe<Notification>;
  sendInvoice?: Maybe<BillingInvoice>;
  setAttendanceVerificationImage?: Maybe<Attendance>;
  setCompanyMemberReferenceImage?: Maybe<CompanyMember>;
  setCompanyMemberReferenceImageStatus?: Maybe<Array<Maybe<CompanyMember>>>;
  setDefaultCompany?: Maybe<User>;
  /**
   * The default payment option here refers to the card which will be used for creating GK transactions but
   * it may not be the default card on the customer's Stripe object because the same customer may have different cards
   * set as default across different companies
   */
  setDefaultCompanyPaymentMethod?: Maybe<CompanyPaymentMethod>;
  setDefaultUserTimezone?: Maybe<User>;
  setProjectVisibility?: Maybe<TaskBoard>;
  setTaskBoardVisibility?: Maybe<TaskBoard>;
  setTaskVisibility?: Maybe<Task>;
  setWorkspaceVisibility?: Maybe<Workspace>;
  /**
   * Starts an attendance for either CLOCK or BREAK. If there is an open entry it will
   * close it first.
   */
  startAttendanceEntry?: Maybe<Attendance>;
  /** This is the new implementation of creating subscriptions */
  startSubscription?: Maybe<Subscription>;
  startTaskTimer?: Maybe<TaskTimerEntry>;
  stopMemberActivityTracker?: Maybe<Timesheet>;
  stopTaskTimer?: Maybe<TaskTimerEntry>;
  switchSubscriptionPackage?: Maybe<CompanySubscription>;
  toggleEnabledCustomColumn?: Maybe<ProjectGroupCustomColumn>;
  toggleTaskBoardPinned?: Maybe<TaskBoard>;
  toggleTaskBoardsPinned?: Maybe<Array<Maybe<TaskBoard>>>;
  toggleTasksPinned?: Maybe<Array<Maybe<Task>>>;
  toggleTasksPublishStatus?: Maybe<Array<Maybe<Task>>>;
  unarchiveCollections?: Maybe<Array<Maybe<Collection>>>;
  unarchiveTasks?: Maybe<Array<Maybe<Task>>>;
  unlinkAttachmentFromComment?: Maybe<TaskComment>;
  updateAllRead?: Maybe<Array<Maybe<UserNotification>>>;
  updateAttendanceLabel?: Maybe<AttendanceLabel>;
  updateAttendanceSettings?: Maybe<AttendanceSettings>;
  updateBillingInvoice?: Maybe<BillingInvoice>;
  updateBillingInvoiceItem?: Maybe<BillingInvoiceItem>;
  updateChecklist?: Maybe<Checklist>;
  updateChecklistSequences?: Maybe<Array<Maybe<Checklist>>>;
  updateCollection?: Maybe<Collection>;
  updateCollectionPaymentType?: Maybe<Collection>;
  updateCollectionPeriodStatus?: Maybe<CollectionPeriod>;
  updateCollector?: Maybe<Collector>;
  updateCompanyHoliday?: Maybe<CompanyHoliday>;
  updateCompanyInfo?: Maybe<Company>;
  updateCompanyMemberActiveStatus?: Maybe<CompanyMember>;
  updateCompanyMemberInfo?: Maybe<CompanyMember>;
  updateCompanyProfile?: Maybe<Scalars['String']>;
  updateCompanyTeamInfo?: Maybe<CompanyTeam>;
  updateCompanyTeamStatus?: Maybe<CompanyTeamStatus>;
  updateCompanyTeamStatusSequences?: Maybe<Array<Maybe<CompanyTeamStatus>>>;
  updateCompanyTimezone?: Maybe<Scalars['String']>;
  updateCompanyWorkDaySetting?: Maybe<CompanyWorkDaySetting>;
  updateContact?: Maybe<Contact>;
  updateContactGroup?: Maybe<ContactGroup>;
  updateContactNote?: Maybe<ContactNote>;
  updateContactPic?: Maybe<ContactPic>;
  updateCustomTimesheetApprovals?: Maybe<Array<Maybe<CustomTimesheetDayApproval>>>;
  updateEmployeeType?: Maybe<EmployeeType>;
  updateIsRead?: Maybe<UserNotification>;
  updateLocation?: Maybe<Location>;
  updateLocationArchivedStatus?: Maybe<Array<Maybe<Location>>>;
  updatePaymentMethodId?: Maybe<User>;
  updatePaymentStatus?: Maybe<CollectionPayment>;
  updatePersonalTask?: Maybe<Task>;
  updateProfile?: Maybe<User>;
  updateProject?: Maybe<TaskBoard>;
  updateProjectsArchivedState?: Maybe<Array<Maybe<TaskBoard>>>;
  updateSenangPayOptions?: Maybe<Company>;
  updateSubscriptionProduct?: Maybe<SubscriptionProduct>;
  updateSubtask?: Maybe<Subtask>;
  updateSubtaskSequences?: Maybe<Array<Maybe<Subtask>>>;
  updateTag?: Maybe<Tag>;
  updateTagGroup?: Maybe<TagGroup>;
  updateTask?: Maybe<Task>;
  updateTaskBoard?: Maybe<TaskBoard>;
  updateTaskBoardFolder?: Maybe<TaskBoardFolder>;
  updateTaskBoardsArchivedState?: Maybe<Array<Maybe<TaskBoard>>>;
  updateTaskComment?: Maybe<TaskComment>;
  updateTaskParent?: Maybe<UpdateTaskParentResponse>;
  updateTaskTemplate?: Maybe<TaskTemplate>;
  updateTasksSequence?: Maybe<Array<Maybe<Task>>>;
  updateTimeSheetArchivedStatus?: Maybe<Array<Maybe<Timesheet>>>;
  updateTimesheet?: Maybe<Timesheet>;
  updateTimesheetApprovals?: Maybe<Array<Maybe<TimesheetDayApproval>>>;
  updateToolTipsStatus?: Maybe<User>;
  updateUserOnboarding?: Maybe<User>;
  updateUserViewOptions?: Maybe<User>;
  updateWorkspace?: Maybe<Workspace>;
  /** This is for changing to a higher subscription plan only. Downgrading is done with the downgradeSubscription mutation. */
  upgradeSubscription?: Maybe<Subscription>;
  uploadCompanyProfileImage?: Maybe<Company>;
  uploadPaymentProof?: Maybe<CollectionPayment>;
  uploadPaymentReceipt?: Maybe<CollectionPayment>;
  uploadProfileImage?: Maybe<User>;
  uploadTaskAttachment?: Maybe<TaskAttachment>;
  /** Once voided, cannot be unvoided */
  voidInvoice?: Maybe<BillingInvoice>;
};


export type MutationActivateCollectionsArgs = {
  collectionIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationActivatePublicHolidayArgs = {
  companyId: Scalars['ID'];
  holidayId: Scalars['ID'];
};


export type MutationAddCompanyTeamStatusArgs = {
  input: AddCompanyTeamStatusInput;
  teamId: Scalars['ID'];
};


export type MutationAddCustomValueToTaskArgs = {
  input: AddCustomValueToTaskInput;
};


export type MutationAddExpoPushTokenArgs = {
  token: Scalars['String'];
};


export type MutationAddMemberToCompanyArgs = {
  companyId: Scalars['ID'];
  input: AddMemberToCompanyInput;
};


export type MutationAddMembersToContactGroupArgs = {
  groupId?: Maybe<Scalars['ID']>;
  input: AddMembersToContactGroupInput;
};


export type MutationAddPackageToSubscriptionArgs = {
  addPackageInput: Array<Maybe<AddPackageInput>>;
  companyId: Scalars['ID'];
};


export type MutationAddSenangPayUsersArgs = {
  companyId: Scalars['ID'];
  userIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationAddSubscriptionProductToPackageArgs = {
  input: UpdateSubscriptionPackageProductsInput;
};


export type MutationAddTaskWatchersArgs = {
  input: AddTaskWatchersInput;
};


export type MutationAddToTaskVisibilityWhitelistArgs = {
  input: AddToTaskVisibilityWhitelistInput;
};


export type MutationAddToVisibilityWhitelistArgs = {
  input: AddToVisibilityWhitelistInput;
};


export type MutationAddToVisibilityWhitelistProjectArgs = {
  input: AddToProjectVisibilityWhitelistInput;
};


export type MutationAddToWorkspaceVisibilityWhitelistArgs = {
  input: AddToWorkspaceVisibilityWhitelistInput;
};


export type MutationApplyTaskTemplateArgs = {
  input: ApplyTaskTemplateInput;
};


export type MutationArchiveAttendanceLabelArgs = {
  archived: Scalars['Boolean'];
  labelId: Scalars['ID'];
};


export type MutationArchiveCollectionsArgs = {
  collectionIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationArchiveEmployeeTypeArgs = {
  archived: Scalars['Boolean'];
  typeId: Scalars['ID'];
};


export type MutationArchiveTasksArgs = {
  input: ArchiveTaskInput;
};


export type MutationAssignCollectionTagsArgs = {
  input: CollectionTagOptions;
};


export type MutationAssignContactTagsArgs = {
  input: ContactTagOptions;
};


export type MutationAssignMembersToCollectionArgs = {
  input: AssignMembersToCollectionInput;
};


export type MutationAssignProjectsToWorkspaceArgs = {
  input: AssignProjectsToWorkspaceInput;
};


export type MutationAssignSubscriptionQuantityToMemberArgs = {
  companyMemberId: Scalars['ID'];
  stripeProductId: Scalars['String'];
};


export type MutationAssignTaskBoardsToFolderArgs = {
  input: AssignTaskBoardsToFolderInput;
};


export type MutationAssignTaskMembersArgs = {
  input: TaskMemberInput;
  taskId: Scalars['ID'];
};


export type MutationAssignTaskPicsArgs = {
  input: TaskPicInput;
  taskId: Scalars['ID'];
};


export type MutationAssignTaskTagsArgs = {
  input: TaskTagOptions;
};


export type MutationAttachPaymentMethodArgs = {
  paymentMethodId: Scalars['String'];
};


export type MutationBulkUploadContactsArgs = {
  attachment: Scalars['Upload'];
  companyId: Scalars['ID'];
  groupId?: Maybe<Scalars['ID']>;
};


export type MutationBulkUploadMembersArgs = {
  attachment: Scalars['Upload'];
  companyId: Scalars['ID'];
};


export type MutationCancelAllSubscriptionsArgs = {
  companyId: Scalars['ID'];
};


export type MutationCancelOmniTrialSubscriptionArgs = {
  companyId: Scalars['ID'];
  companySubscriptionId: Scalars['ID'];
};


export type MutationCancelSubscriptionArgs = {
  companyId: Scalars['ID'];
  companySubscriptionId: Scalars['ID'];
};


export type MutationCancelSubscriptionV2Args = {
  input: CancelSubscriptionInput;
};


export type MutationChangeGroupTasksArgs = {
  input: ChangeGroupTaskInput;
};


export type MutationChangeTaskPositionArgs = {
  input: ChangeTaskPositionInput;
};


export type MutationCloseAttendanceArgs = {
  commentsOut?: Maybe<Scalars['String']>;
  companyMemberId: Scalars['ID'];
};


export type MutationCloseAttendanceForUserArgs = {
  commentsOut?: Maybe<Scalars['String']>;
  companyMemberId: Scalars['ID'];
};


export type MutationCollectionReminderReadArgs = {
  collectionId: Scalars['ID'];
};


export type MutationCopyProjectArgs = {
  input: CopyProjectInput;
};


export type MutationCopyTaskArgs = {
  input: CopyTaskInput;
};


export type MutationCopyTasksArgs = {
  input: CopyTasksInput;
};


export type MutationCreateAttendanceLabelArgs = {
  companyId: Scalars['ID'];
  input: AttendanceLabelInput;
};


export type MutationCreateBillingInvoiceArgs = {
  input: CreateBillingInvoiceInput;
};


export type MutationCreateBillingInvoiceItemArgs = {
  input: CreateBillingInvoiceItemInput;
};


export type MutationCreateChecklistArgs = {
  input: ChecklistInput;
  taskId: Scalars['ID'];
};


export type MutationCreateCollaborationBoardArgs = {
  input: CollaborationBoardInput;
};


export type MutationCreateCollectionArgs = {
  attachment: Scalars['Upload'];
  input: CreateCollectionInput;
  remindOnDays?: Maybe<Array<Scalars['Int']>>;
};


export type MutationCreateCollectorArgs = {
  input: CreateCollectorInput;
};


export type MutationCreateCompanyArgs = {
  input: CreateCompanyInput;
};


export type MutationCreateCompanyPaymentMethodArgs = {
  input: CreateCompanyPaymentMethodInput;
};


export type MutationCreateCompanyTeamArgs = {
  companyId: Scalars['ID'];
  input: CreateCompanyTeamInput;
};


export type MutationCreateContactArgs = {
  companyId: Scalars['ID'];
  contactGroupId?: Maybe<Scalars['ID']>;
  dealCreator?: Maybe<Scalars['ID']>;
  input: CreateContactInput;
};


export type MutationCreateContactGroupArgs = {
  companyId: Scalars['ID'];
  input: CreateContactGroupInput;
};


export type MutationCreateContactNoteArgs = {
  contactId: Scalars['ID'];
  input: ContactNoteInput;
};


export type MutationCreateContactPicArgs = {
  companyId: Scalars['ID'];
  contactId: Scalars['ID'];
  input: CreateContactPicInput;
};


export type MutationCreateCustomColumnForGroupArgs = {
  input: CreateCustomColumnForGroupInput;
};


export type MutationCreateCustomTimesheetApprovalsArgs = {
  input: CreateCustomTimesheetApprovalsInput;
};


export type MutationCreateEmployeeTypeArgs = {
  companyId: Scalars['ID'];
  name: Scalars['String'];
  overtime: Scalars['Boolean'];
  timezone?: Maybe<Scalars['String']>;
};


export type MutationCreateHolidayArgs = {
  companyId: Scalars['ID'];
  input: CreateCompanyHolidayInput;
};


export type MutationCreateLocationArgs = {
  companyId: Scalars['ID'];
  input: CreateLocationInput;
};


export type MutationCreatePersonalTaskArgs = {
  creatorMemberId?: Maybe<Scalars['ID']>;
  input: TaskPersonalInput;
  memberIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateProjectClaimArgs = {
  input: ProjectClaimInput;
};


export type MutationCreateProjectGroupArgs = {
  input: CreateProjectGroupInput;
};


export type MutationCreateProjectInvoiceArgs = {
  input: ProjectInvoiceInput;
};


export type MutationCreateProjectStatusArgs = {
  input: CreateProjectStatusInput;
};


export type MutationCreateProjectTemplateArgs = {
  input: ProjectTemplateInput;
};


export type MutationCreateProjectTemplateStatusArgs = {
  input: CreateProjectTemplateStatusInput;
};


export type MutationCreateProjectTimeCostArgs = {
  input: ProjectTimeCostInput;
};


export type MutationCreateShortUrlArgs = {
  url: Scalars['String'];
};


export type MutationCreateSubscriptionPackageArgs = {
  input: CreateSubscriptionPackageInput;
};


export type MutationCreateSubscriptionPriceArgs = {
  input: CreateSubscriptionPriceInput;
};


export type MutationCreateSubscriptionProductArgs = {
  input: CreateSubscriptionProductInput;
};


export type MutationCreateSubtaskArgs = {
  input: SubtaskInput;
  taskId: Scalars['ID'];
};


export type MutationCreateTagArgs = {
  input: CreateTagInput;
};


export type MutationCreateTagGroupArgs = {
  input: CreateTagGroupInput;
};


export type MutationCreateTaskArgs = {
  input: TaskInput;
  memberIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  picIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


export type MutationCreateTaskBoardArgs = {
  input: TaskBoardInput;
};


export type MutationCreateTaskBoardFolderArgs = {
  input: CreateTaskBoardFolderInput;
};


export type MutationCreateTaskBoardTeamArgs = {
  input: TaskBoardTeamInput;
};


export type MutationCreateTaskTemplateArgs = {
  input: CreateTaskTemplateInput;
};


export type MutationCreateTimesheetApprovalsArgs = {
  input: CreateTimesheetApprovalsInput;
};


export type MutationCreateTimesheetEntryArgs = {
  input: TimesheetEntryInput;
  locationId?: Maybe<Scalars['ID']>;
  memberId: Scalars['ID'];
  taskId: Scalars['ID'];
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeactivateCollectionsArgs = {
  collectionIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeactivatePublicHolidayArgs = {
  companyId: Scalars['ID'];
  publicHolidayId: Scalars['ID'];
};


export type MutationDeleteBillingInvoiceItemsArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteBillingInvoicesArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteChecklistsArgs = {
  checklistIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteCollectionTagsArgs = {
  input: CollectionTagOptions;
};


export type MutationDeleteCollectionsArgs = {
  collectionIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteCollectorsArgs = {
  input: DeleteCollectorInput;
};


export type MutationDeleteCompanyArgs = {
  companyId: Scalars['ID'];
};


export type MutationDeleteCompanyHolidayArgs = {
  companyHolidayId: Scalars['ID'];
  companyId: Scalars['ID'];
};


export type MutationDeleteCompanyPaymentMethodArgs = {
  input: DeleteCompanyPaymentMethodInput;
};


export type MutationDeleteCompanyTeamArgs = {
  teamId: Scalars['ID'];
};


export type MutationDeleteCompanyTeamStatusArgs = {
  companyTeamStatusId: Scalars['ID'];
};


export type MutationDeleteContactGroupArgs = {
  groupId: Scalars['ID'];
};


export type MutationDeleteContactNotesArgs = {
  contactNoteIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteContactPicArgs = {
  companyId: Scalars['ID'];
  picId: Scalars['ID'];
};


export type MutationDeleteContactTagsArgs = {
  input: ContactTagOptions;
};


export type MutationDeleteContactsArgs = {
  companyId: Scalars['ID'];
  contactIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteCustomColumnForGroupArgs = {
  input: DeleteCustomColumnForGroupInput;
};


export type MutationDeleteCustomTimesheetApprovalsArgs = {
  input: DeleteCustomTimesheetApprovalsInput;
};


export type MutationDeleteCustomValueFromTaskArgs = {
  input: DeleteCustomValueFromTaskInput;
};


export type MutationDeleteLocationsArgs = {
  locationIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeletePaymentProofArgs = {
  input: DeletePaymentProofInput;
};


export type MutationDeleteProjectClaimsArgs = {
  input: ProjectClaimDeleteInput;
};


export type MutationDeleteProjectGroupsArgs = {
  input: DeleteProjectGroupInput;
};


export type MutationDeleteProjectInvoicesArgs = {
  input: ProjectInvoiceDeleteInput;
};


export type MutationDeleteProjectStatusesArgs = {
  input: DeleteProjectStatusInput;
};


export type MutationDeleteProjectTemplateStatusesArgs = {
  input: ProjectTemplateStatusIdsInput;
};


export type MutationDeleteProjectTemplatesArgs = {
  input: DeleteProjectTemplateIdsInput;
};


export type MutationDeleteProjectTimeCostsArgs = {
  input: ProjectTimeCostDeleteInput;
};


export type MutationDeleteProjectsArgs = {
  input: DeleteProjectsInput;
};


export type MutationDeleteSubscriptionProductArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteSubtasksArgs = {
  subtaskIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteTagArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteTagGroupArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteTaskAttachmentsArgs = {
  taskAttachmentIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteTaskBoardFolderArgs = {
  folderId: Scalars['ID'];
};


export type MutationDeleteTaskBoardTeamsArgs = {
  ids: Array<Maybe<Scalars['ID']>>;
  isV3?: Maybe<Scalars['Boolean']>;
};


export type MutationDeleteTaskBoardsArgs = {
  ids: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteTaskCommentArgs = {
  taskCommentId: Scalars['ID'];
};


export type MutationDeleteTaskMembersArgs = {
  input: TaskMemberInput;
  taskId: Scalars['ID'];
};


export type MutationDeleteTaskPicsArgs = {
  input: TaskPicInput;
  taskId: Scalars['ID'];
};


export type MutationDeleteTaskTagsArgs = {
  input: TaskTagOptions;
};


export type MutationDeleteTaskTemplateArgs = {
  input: DeleteTemplateInput;
};


export type MutationDeleteTasksArgs = {
  taskIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationDeleteWorkspacesArgs = {
  input: DeleteWorkspacesInput;
};


export type MutationDetachPaymentMethodArgs = {
  companyId: Scalars['String'];
  paymentMethodId: Scalars['String'];
};


export type MutationDowngradeSubscriptionArgs = {
  input: DowngradeSubscriptionInput;
};


export type MutationDuplicateTasksArgs = {
  input: DuplicateTasksInput;
};


export type MutationEditCustomColumnForGroupArgs = {
  input: EditCustomColumnForGroupInput;
};


export type MutationEditPackageQuantityArgs = {
  companyId: Scalars['ID'];
  companySubscriptionId: Scalars['ID'];
  quantity: Scalars['Int'];
};


export type MutationEditProjectClaimArgs = {
  input: ProjectClaimEditInput;
};


export type MutationEditProjectGroupArgs = {
  input: EditProjectGroupInput;
};


export type MutationEditProjectInvoiceArgs = {
  input: ProjectInvoiceEditInput;
};


export type MutationEditProjectSettingsArgs = {
  input: ProjectSettingsEditInput;
};


export type MutationEditProjectStatusArgs = {
  input: ProjectStatusEditInput;
};


export type MutationEditProjectTemplateArgs = {
  input: ProjectTemplateEditInput;
};


export type MutationEditProjectTemplateStatusArgs = {
  input: ProjectTemplateStatusEditInput;
};


export type MutationEditProjectTimeCostArgs = {
  input: ProjectTimeCostEditInput;
};


export type MutationEditTaskCommentArgs = {
  input: EditTaskCommentInput;
};


export type MutationImportTasksArgs = {
  input: ImportTasksInput;
};


export type MutationLinkAttachmentToCommentArgs = {
  input: LinkAttachmentToCommentInput;
};


export type MutationLinkExternalAttachmentsArgs = {
  input: LinkExternalAttachmentsInput;
};


export type MutationMoveProjectsToWorkspaceArgs = {
  input: MoveProjectsToWorkspaceInput;
};


export type MutationMoveTaskToMemberArgs = {
  input: MoveTaskToMemberInput;
};


export type MutationMoveTasksArgs = {
  input: MoveTasksInput;
};


export type MutationPostTaskCommentArgs = {
  input: PostCommentInput;
};


export type MutationReceivePaymentInvoiceArgs = {
  input: ReceivePaymentInvoiceInput;
};


export type MutationRemoveExpoPushTokenArgs = {
  token: Scalars['String'];
};


export type MutationRemoveFromTaskVisibilityWhitelistArgs = {
  input: RemoveFromTaskVisibilityWhitelistInput;
};


export type MutationRemoveFromVisibilityWhitelistArgs = {
  input: RemoveFromVisibilityWhitelistInput;
};


export type MutationRemoveFromVisibilityWhitelistProjectArgs = {
  input: RemoveFromProjectVisibilityWhitelistInput;
};


export type MutationRemoveFromWorkspaceVisibilityWhitelistArgs = {
  input: RemoveFromWorkspaceVisibilityWhitelistInput;
};


export type MutationRemoveMemberFromCompanyArgs = {
  companyId: Scalars['ID'];
  companyMemberId: Scalars['ID'];
};


export type MutationRemoveMemberFromCompanyTeamArgs = {
  companyTeamId: Scalars['ID'];
  teamMemberId: Scalars['ID'];
};


export type MutationRemoveMemberFromContactGroupArgs = {
  contactId: Scalars['ID'];
  groupId: Scalars['ID'];
};


export type MutationRemoveMembersFromCollectionArgs = {
  input: RemoveMembersFromCollectionInput;
};


export type MutationRemovePackagesFromSubscriptionArgs = {
  companyId: Scalars['ID'];
  companySubscriptionIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationRemoveProjectsFromWorkspaceArgs = {
  input: RemoveProjectsFromWorkspaceInput;
};


export type MutationRemoveSenangPayUsersArgs = {
  companyId: Scalars['ID'];
  userIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationRemoveSubscriptionProductFromPackageArgs = {
  input: UpdateSubscriptionPackageProductsInput;
};


export type MutationRemoveSubscriptionQuantityFromMemberArgs = {
  companyMemberId: Scalars['ID'];
  stripeProductId: Scalars['String'];
};


export type MutationRemoveTaskBoardsFromFolderArgs = {
  input: RemoveTaskBoardsFromFolderInput;
};


export type MutationRemoveTaskPicsArgs = {
  input: TaskPicsInput;
};


export type MutationRemoveTaskWatchersArgs = {
  input: RemoveTaskWatchersInput;
};


export type MutationReorderGroupsArgs = {
  input: ReorderGroupInput;
};


export type MutationRequestAccountDeletionArgs = {
  input: RequestAccountDeletionInput;
};


export type MutationRequestDedocoSubscriptionArgs = {
  companyId: Scalars['ID'];
  packagePriceId: Scalars['ID'];
};


export type MutationRequestOmniSubscriptionArgs = {
  companyId: Scalars['ID'];
  createSubscriptionInput: Array<Maybe<CreateSubscriptionInput>>;
  promoCode?: Maybe<Scalars['String']>;
};


export type MutationRequestSubscriptionArgs = {
  companyId: Scalars['ID'];
  packagePriceId: Scalars['ID'];
  promoCode?: Maybe<Scalars['String']>;
};


export type MutationRequestTrialOmniSubscriptionArgs = {
  companyId: Scalars['ID'];
  createSubscriptionInput: Array<Maybe<CreateSubscriptionInput>>;
  trialDays: Scalars['Int'];
};


export type MutationResendCollectionNotificationArgs = {
  collectionId: Scalars['ID'];
};


export type MutationSendInvoiceArgs = {
  input: SendInvoiceInput;
};


export type MutationSetAttendanceVerificationImageArgs = {
  attendanceId: Scalars['ID'];
  companyMemberId: Scalars['ID'];
  input: SetAttendanceVerificationImageInput;
};


export type MutationSetCompanyMemberReferenceImageArgs = {
  companyMemberId: Scalars['ID'];
  input: UploadMemberReferenceImageInput;
};


export type MutationSetCompanyMemberReferenceImageStatusArgs = {
  companyId: Scalars['ID'];
  companyMemberIds: Array<Maybe<Scalars['ID']>>;
  remark?: Maybe<Scalars['String']>;
  status: CompanyMemberReferenceImageStatus;
};


export type MutationSetDefaultCompanyArgs = {
  companyId?: Maybe<Scalars['ID']>;
};


export type MutationSetDefaultCompanyPaymentMethodArgs = {
  input: SetDefaultCompanyPaymentMethodInput;
};


export type MutationSetDefaultUserTimezoneArgs = {
  timezone: Scalars['String'];
};


export type MutationSetProjectVisibilityArgs = {
  input: SetProjectVisibilityInput;
};


export type MutationSetTaskBoardVisibilityArgs = {
  input: SetTaskBoardVisibilityInput;
};


export type MutationSetTaskVisibilityArgs = {
  input: SetTaskVisibilityInput;
};


export type MutationSetWorkspaceVisibilityArgs = {
  input: SetWorkspaceVisibilityInput;
};


export type MutationStartAttendanceEntryArgs = {
  companyMemberId: Scalars['ID'];
  contactId?: Maybe<Scalars['ID']>;
  input: StartAttendanceEntryInput;
  labelId?: Maybe<Scalars['ID']>;
  locationId?: Maybe<Scalars['ID']>;
};


export type MutationStartSubscriptionArgs = {
  input: StartSubscriptionInput;
};


export type MutationStartTaskTimerArgs = {
  companyMemberId: Scalars['ID'];
  taskId: Scalars['ID'];
};


export type MutationStopMemberActivityTrackerArgs = {
  memberId: Scalars['ID'];
};


export type MutationStopTaskTimerArgs = {
  companyMemberId: Scalars['ID'];
  taskId: Scalars['ID'];
};


export type MutationSwitchSubscriptionPackageArgs = {
  companyId: Scalars['ID'];
  companySubscriptionId: Scalars['ID'];
  switchSubscriptionPackageInput: SwitchSubscriptionPackageInput;
};


export type MutationToggleEnabledCustomColumnArgs = {
  input: ToggleEnabledCustomColumnInput;
};


export type MutationToggleTaskBoardPinnedArgs = {
  boardId: Scalars['ID'];
};


export type MutationToggleTaskBoardsPinnedArgs = {
  boardIds: Array<Scalars['ID']>;
};


export type MutationToggleTasksPinnedArgs = {
  taskIds: Array<Scalars['ID']>;
};


export type MutationToggleTasksPublishStatusArgs = {
  taskIds: Array<Scalars['ID']>;
};


export type MutationUnarchiveCollectionsArgs = {
  collectionIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationUnarchiveTasksArgs = {
  input: UnarchiveTaskInput;
};


export type MutationUnlinkAttachmentFromCommentArgs = {
  input: LinkAttachmentToCommentInput;
};


export type MutationUpdateAllReadArgs = {
  companyId?: Maybe<Scalars['ID']>;
};


export type MutationUpdateAttendanceLabelArgs = {
  input: AttendanceLabelInput;
  labelId: Scalars['ID'];
};


export type MutationUpdateAttendanceSettingsArgs = {
  companyId: Scalars['ID'];
  input: UpdateAttendanceSettingsInput;
};


export type MutationUpdateBillingInvoiceArgs = {
  input: UpdateBillingInvoiceInput;
};


export type MutationUpdateBillingInvoiceItemArgs = {
  input: UpdateBillingInvoiceItemInput;
};


export type MutationUpdateChecklistArgs = {
  checklistId: Scalars['ID'];
  input: ChecklistUpdateInput;
};


export type MutationUpdateChecklistSequencesArgs = {
  input?: Maybe<Array<Maybe<ChecklistSequencesInput>>>;
};


export type MutationUpdateCollectionArgs = {
  attachment?: Maybe<Scalars['Upload']>;
  collectionId: Scalars['ID'];
  input: UpdateCollectionInput;
  remindOnDays?: Maybe<Array<Scalars['Int']>>;
};


export type MutationUpdateCollectionPaymentTypeArgs = {
  collectionId: Scalars['ID'];
  input: UpdateCollectionPaymentTypeInput;
};


export type MutationUpdateCollectionPeriodStatusArgs = {
  collectionId: Scalars['ID'];
  collectionPeriodId: Scalars['ID'];
  status: CollectionPeriodStatusTypes;
};


export type MutationUpdateCollectorArgs = {
  input: UpdateCollectorInput;
};


export type MutationUpdateCompanyHolidayArgs = {
  companyHolidayId: Scalars['ID'];
  companyId: Scalars['ID'];
  input: UpdateCompanyHolidayInput;
};


export type MutationUpdateCompanyInfoArgs = {
  companyId: Scalars['ID'];
  input: UpdateCompanyInfoInput;
};


export type MutationUpdateCompanyMemberActiveStatusArgs = {
  active: Scalars['Boolean'];
  companyMemberId: Scalars['ID'];
};


export type MutationUpdateCompanyMemberInfoArgs = {
  companyMemberId: Scalars['ID'];
  input: UpdateCompanyMemberInfoInput;
};


export type MutationUpdateCompanyProfileArgs = {
  companyId: Scalars['ID'];
  key: Scalars['String'];
  value: Scalars['String'];
};


export type MutationUpdateCompanyTeamInfoArgs = {
  companyTeamId: Scalars['ID'];
  input: UpdateCompanyTeamInfoInput;
};


export type MutationUpdateCompanyTeamStatusArgs = {
  input: UpdateCompanyTeamStatusInput;
  statusId: Scalars['ID'];
  teamId: Scalars['ID'];
};


export type MutationUpdateCompanyTeamStatusSequencesArgs = {
  input: Array<Maybe<CompanyTeamStatusSequenceInput>>;
};


export type MutationUpdateCompanyTimezoneArgs = {
  companyId: Scalars['ID'];
  timezone: Scalars['String'];
};


export type MutationUpdateCompanyWorkDaySettingArgs = {
  companyId: Scalars['ID'];
  day: WorkDay;
  employeeTypeId: Scalars['ID'];
  input: UpdateCompanyWorkDayInput;
};


export type MutationUpdateContactArgs = {
  companyId: Scalars['ID'];
  contactGroupId?: Maybe<Scalars['ID']>;
  contactId: Scalars['ID'];
  dealCreator?: Maybe<Scalars['ID']>;
  input: UpdateContactInput;
};


export type MutationUpdateContactGroupArgs = {
  groupId: Scalars['ID'];
  input: UpdateContactGroupInput;
};


export type MutationUpdateContactNoteArgs = {
  contactNoteId: Scalars['ID'];
  input: ContactNoteInput;
};


export type MutationUpdateContactPicArgs = {
  companyId: Scalars['ID'];
  input: UpdateContactPicInput;
  picId: Scalars['ID'];
};


export type MutationUpdateCustomTimesheetApprovalsArgs = {
  input: UpdateCustomTimesheetApprovalInput;
};


export type MutationUpdateEmployeeTypeArgs = {
  archived?: Maybe<CompanyArchivedUpdate>;
  name: Scalars['String'];
  overtime: Scalars['Boolean'];
  typeId: Scalars['ID'];
};


export type MutationUpdateIsReadArgs = {
  notificationIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationUpdateLocationArgs = {
  input: UpdateLocationInput;
  locationId: Scalars['ID'];
};


export type MutationUpdateLocationArchivedStatusArgs = {
  archived: Scalars['Boolean'];
  locationIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationUpdatePaymentMethodIdArgs = {
  paymentMethodId: Scalars['String'];
};


export type MutationUpdatePaymentStatusArgs = {
  input: UpdatePaymentStatusInput;
};


export type MutationUpdatePersonalTaskArgs = {
  input: PersonalTaskUpdateInput;
  taskId: Scalars['ID'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateProjectArgs = {
  input: ProjectUpdateInput;
};


export type MutationUpdateProjectsArchivedStateArgs = {
  input: UpdateProjectsArchivedStateInput;
};


export type MutationUpdateSenangPayOptionsArgs = {
  companyId: Scalars['ID'];
  defaultPayment?: Maybe<Scalars['Boolean']>;
  enabled?: Maybe<Scalars['Boolean']>;
  fullOption?: Maybe<Scalars['Boolean']>;
  instalmentOption?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateSubscriptionProductArgs = {
  id: Scalars['ID'];
  input: UpdateSubscriptionProductInput;
};


export type MutationUpdateSubtaskArgs = {
  input: SubtaskUpdateInput;
  subtaskId: Scalars['ID'];
};


export type MutationUpdateSubtaskSequencesArgs = {
  input?: Maybe<Array<Maybe<SubtaskSequencesInput>>>;
};


export type MutationUpdateTagArgs = {
  input: UpdateTagInput;
};


export type MutationUpdateTagGroupArgs = {
  input: UpdateTagGroupInput;
};


export type MutationUpdateTaskArgs = {
  input: TaskUpdateInput;
  taskId: Scalars['ID'];
};


export type MutationUpdateTaskBoardArgs = {
  id: Scalars['ID'];
  input: TaskBoardUpdateInput;
};


export type MutationUpdateTaskBoardFolderArgs = {
  input: UpdateTaskBoardFolderInput;
};


export type MutationUpdateTaskBoardsArchivedStateArgs = {
  input: UpdateTaskBoardsArchivedStateInput;
};


export type MutationUpdateTaskCommentArgs = {
  input: TaskCommentUpdateInput;
  taskCommentId: Scalars['ID'];
};


export type MutationUpdateTaskParentArgs = {
  input: UpdateTaskParentInput;
};


export type MutationUpdateTaskTemplateArgs = {
  input: UpdateTaskTemplateInput;
};


export type MutationUpdateTasksSequenceArgs = {
  input: Array<Maybe<TaskSequenceInput>>;
};


export type MutationUpdateTimeSheetArchivedStatusArgs = {
  archived: TimesheetArchiveStatus;
  timesheetIds: Array<Scalars['ID']>;
};


export type MutationUpdateTimesheetArgs = {
  input: UpdateTimesheetInput;
  locationId?: Maybe<Scalars['ID']>;
  timesheetId: Scalars['ID'];
};


export type MutationUpdateTimesheetApprovalsArgs = {
  input: UpdateTimesheetApprovalInput;
};


export type MutationUpdateToolTipsStatusArgs = {
  input: UpdateToolTipsStatusInput;
};


export type MutationUpdateUserOnboardingArgs = {
  payload?: Maybe<Scalars['JSON']>;
};


export type MutationUpdateUserViewOptionsArgs = {
  payload?: Maybe<Scalars['JSON']>;
};


export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};


export type MutationUpgradeSubscriptionArgs = {
  input: UpgradeSubscriptionInput;
};


export type MutationUploadCompanyProfileImageArgs = {
  attachment: Scalars['Upload'];
  companyId: Scalars['ID'];
};


export type MutationUploadPaymentProofArgs = {
  attachment: Scalars['Upload'];
  input: CreateCollectionPaymentInput;
};


export type MutationUploadPaymentReceiptArgs = {
  attachment: Scalars['Upload'];
  input: UploadPaymentReceiptInput;
};


export type MutationUploadProfileImageArgs = {
  attachment: Scalars['Upload'];
};


export type MutationUploadTaskAttachmentArgs = {
  attachment: Scalars['Upload'];
  commentId?: Maybe<Scalars['ID']>;
  taskId: Scalars['ID'];
};


export type MutationVoidInvoiceArgs = {
  input: VoidInvoiceInput;
};

export type Notification = {
  __typename?: 'Notification';
  collection?: Maybe<Collection>;
  comment?: Maybe<TaskComment>;
  company?: Maybe<Company>;
  contact?: Maybe<Contact>;
  created_at?: Maybe<Scalars['DateTime']>;
  data?: Maybe<Scalars['String']>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  due_date?: Maybe<Scalars['DateTime']>;
  group?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  member?: Maybe<CompanyMember>;
  message?: Maybe<Scalars['String']>;
  pic?: Maybe<ContactPic>;
  task?: Maybe<Task>;
  taskBoard?: Maybe<TaskBoard>;
  team?: Maybe<CompanyTeam>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export enum NotificationGroups {
  Collection = 'COLLECTION',
  Crm = 'CRM',
  Misc = 'MISC',
  Payment = 'PAYMENT',
  Task = 'TASK'
}

export { NotificationType };

export type NotificationTypeInput = {
  isAssigned?: Maybe<Scalars['Boolean']>;
  isMentioned?: Maybe<Scalars['Boolean']>;
  isUnread?: Maybe<Scalars['Boolean']>;
};

export enum PackageTypes {
  Basic = 'BASIC',
  Dedoco = 'DEDOCO',
  Legacy = 'LEGACY',
  PaymentCollectionReminder = 'PAYMENT_COLLECTION_REMINDER',
  ProjectManagementTool = 'PROJECT_MANAGEMENT_TOOL',
  TimeAttendance = 'TIME_ATTENDANCE'
}

export type PaginatedProjectClaims = {
  __typename?: 'PaginatedProjectClaims';
  projectClaims?: Maybe<Array<Maybe<ProjectClaim>>>;
  total?: Maybe<Scalars['Int']>;
};

export type PaginatedProjectInvoices = {
  __typename?: 'PaginatedProjectInvoices';
  projectInvoices?: Maybe<Array<Maybe<ProjectInvoice>>>;
  total?: Maybe<Scalars['Int']>;
};

export type PaginatedProjectTimeCosts = {
  __typename?: 'PaginatedProjectTimeCosts';
  projectTimeCosts?: Maybe<Array<Maybe<ProjectTimeCost>>>;
  total?: Maybe<Scalars['Int']>;
};

export type PaginatedSharedWithMeTasks = {
  __typename?: 'PaginatedSharedWithMeTasks';
  tasks?: Maybe<Array<Maybe<Task>>>;
  total?: Maybe<Scalars['Int']>;
};

export type PaginatedTaskBoards = {
  __typename?: 'PaginatedTaskBoards';
  taskBoards?: Maybe<Array<Maybe<TaskBoard>>>;
  total?: Maybe<Scalars['Int']>;
};

export type PaginatedTasks = {
  __typename?: 'PaginatedTasks';
  tasks?: Maybe<Array<Maybe<Task>>>;
  total?: Maybe<Scalars['Int']>;
};

export type Pagination = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  sortDirection?: Maybe<SortDirection>;
};

export type PaginationFilter = {
  ids?: Maybe<Array<Scalars['ID']>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  card?: Maybe<PaymentMethodCard>;
  created?: Maybe<Scalars['Int']>;
  customer?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  type?: Maybe<Scalars['String']>;
};

export type PaymentMethodCard = {
  __typename?: 'PaymentMethodCard';
  brand?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  expMonth?: Maybe<Scalars['Int']>;
  expYear?: Maybe<Scalars['Int']>;
  exp_month?: Maybe<Scalars['Int']>;
  exp_year?: Maybe<Scalars['Int']>;
  last4?: Maybe<Scalars['String']>;
};

export enum PersonalStatusType {
  Closed = 'CLOSED',
  Fail = 'FAIL',
  Pass = 'PASS',
  Pending = 'PENDING'
}

export type PersonalTaskUpdateInput = {
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  dueReminder?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  due_reminder?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  sequence?: Maybe<Scalars['Int']>;
  stageStatus?: Maybe<StageType>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  status?: Maybe<PersonalStatusType>;
  teamId?: Maybe<Scalars['ID']>;
  team_id?: Maybe<Scalars['ID']>;
  value?: Maybe<Scalars['Float']>;
};

export type PostCommentInput = {
  messageContent: Scalars['String'];
  /** In JSON Format */
  parentId?: Maybe<Scalars['String']>;
  taskId: Scalars['ID'];
};

export type ProductInCoupon = {
  __typename?: 'ProductInCoupon';
  products?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ProjectClaim = {
  __typename?: 'ProjectClaim';
  amount?: Maybe<Scalars['Float']>;
  attachmentUrl?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  member?: Maybe<CompanyMember>;
  name?: Maybe<Scalars['String']>;
  note?: Maybe<Scalars['String']>;
  project?: Maybe<TaskBoard>;
  status?: Maybe<ProjectClaimType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
};

export type ProjectClaimDeleteInput = {
  ids: Array<Scalars['ID']>;
};

export type ProjectClaimEditInput = {
  amount?: Maybe<Scalars['Float']>;
  attachmentUrl?: Maybe<Scalars['String']>;
  claimId: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  memberId?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  note?: Maybe<Scalars['String']>;
  status?: Maybe<ProjectClaimType>;
};

export type ProjectClaimFilter = {
  projectId?: Maybe<Scalars['ID']>;
};

export type ProjectClaimInput = {
  amount: Scalars['Float'];
  attachmentUrl?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  memberId?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  note?: Maybe<Scalars['String']>;
  projectId: Scalars['ID'];
  status?: Maybe<ProjectClaimType>;
};

export type ProjectClaimSort = {
  direction?: Maybe<SortDirection>;
  type?: Maybe<ProjectClaimSortType>;
};

export enum ProjectClaimSortType {
  CreatedAt = 'CREATED_AT',
  Name = 'NAME'
}

export enum ProjectClaimType {
  Approved = 'APPROVED',
  New = 'NEW',
  Rejected = 'REJECTED'
}

export type ProjectGroup = {
  __typename?: 'ProjectGroup';
  customColumns?: Maybe<Array<Maybe<ProjectGroupCustomColumn>>>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  ordering?: Maybe<Scalars['Int']>;
  project?: Maybe<TaskBoard>;
  tasks?: Maybe<Array<Maybe<Task>>>;
  totalTasks?: Maybe<Scalars['Int']>;
};


export type ProjectGroupTasksArgs = {
  filters?: Maybe<FilterOptions>;
};

export type ProjectGroupCustomAttribute = {
  __typename?: 'ProjectGroupCustomAttribute';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<ProjectGroupCustomAttributeType>;
};

export enum ProjectGroupCustomAttributeType {
  Number = 'NUMBER',
  Text = 'TEXT'
}

export type ProjectGroupCustomColumn = {
  __typename?: 'ProjectGroupCustomColumn';
  attribute?: Maybe<ProjectGroupCustomAttribute>;
  enabled?: Maybe<Scalars['Boolean']>;
  group?: Maybe<ProjectGroup>;
};

export type ProjectInvoice = {
  __typename?: 'ProjectInvoice';
  actualCost?: Maybe<Scalars['Float']>;
  amount?: Maybe<Scalars['Float']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  id?: Maybe<Scalars['ID']>;
  invoiceNo?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  project?: Maybe<TaskBoard>;
  quantity?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  variance?: Maybe<Scalars['Float']>;
};

export type ProjectInvoiceDeleteInput = {
  ids: Array<Scalars['ID']>;
};

export type ProjectInvoiceEditInput = {
  actualCost?: Maybe<Scalars['Float']>;
  invoiceId: Scalars['ID'];
  invoiceNo?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  quantity?: Maybe<Scalars['Int']>;
};

export type ProjectInvoiceFilter = {
  projectId?: Maybe<Scalars['ID']>;
};

export type ProjectInvoiceInput = {
  actualCost?: Maybe<Scalars['Float']>;
  invoiceNo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  price: Scalars['Float'];
  projectId: Scalars['ID'];
  quantity: Scalars['Int'];
};

export type ProjectInvoiceSort = {
  direction?: Maybe<SortDirection>;
  type?: Maybe<ProjectInvoiceSortType>;
};

export enum ProjectInvoiceSortType {
  CreatedAt = 'CREATED_AT',
  Name = 'NAME'
}

export type ProjectSettings = {
  __typename?: 'ProjectSettings';
  columns?: Maybe<Scalars['JSON']>;
  project?: Maybe<TaskBoard>;
};

export type ProjectSettingsEditInput = {
  columns: ProjectTemplateOptions;
  projectId: Scalars['ID'];
};

export type ProjectStatus = {
  __typename?: 'ProjectStatus';
  color?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  notify?: Maybe<Scalars['Boolean']>;
  project?: Maybe<TaskBoard>;
  sequence?: Maybe<Scalars['Int']>;
};

export type ProjectStatusEditInput = {
  color?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  notify?: Maybe<Scalars['Boolean']>;
  projectStatusId: Scalars['ID'];
  sequence?: Maybe<Scalars['Int']>;
};

export type ProjectTemplate = {
  __typename?: 'ProjectTemplate';
  columns?: Maybe<Scalars['JSON']>;
  company?: Maybe<Company>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  statuses?: Maybe<Array<Maybe<ProjectTemplateStatus>>>;
};

export type ProjectTemplateEditInput = {
  columns?: Maybe<ProjectTemplateOptions>;
  name?: Maybe<Scalars['String']>;
  projectTemplateId: Scalars['ID'];
};

export type ProjectTemplateGallery = {
  __typename?: 'ProjectTemplateGallery';
  galleryTemplates?: Maybe<Scalars['JSON']>;
};

export type ProjectTemplateInput = {
  columns?: Maybe<ProjectTemplateOptions>;
  companyId: Scalars['ID'];
  name: Scalars['String'];
  statuses?: Maybe<Array<Maybe<ProjectTemplateStatusInput>>>;
};

export type ProjectTemplateOptions = {
  activity?: Maybe<Scalars['Boolean']>;
  assignee?: Maybe<Scalars['Boolean']>;
  contacts?: Maybe<Scalars['Boolean']>;
  effort?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['Boolean']>;
  priority?: Maybe<Scalars['Boolean']>;
  recurrence?: Maybe<Scalars['Boolean']>;
  reminder?: Maybe<Scalars['Boolean']>;
  status?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['Boolean']>;
  timeline?: Maybe<Scalars['Boolean']>;
  tracking?: Maybe<Scalars['Boolean']>;
  value?: Maybe<Scalars['Boolean']>;
  watchers?: Maybe<Scalars['Boolean']>;
};

export type ProjectTemplateStatus = {
  __typename?: 'ProjectTemplateStatus';
  color?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  notify?: Maybe<Scalars['Boolean']>;
  projectTemplate?: Maybe<ProjectTemplate>;
};

export type ProjectTemplateStatusEditInput = {
  color?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  notify?: Maybe<Scalars['Boolean']>;
  projectTemplateStatusId: Scalars['ID'];
};

export type ProjectTemplateStatusIdsInput = {
  projectTemplateStatusIds: Array<Scalars['ID']>;
};

export type ProjectTemplateStatusInput = {
  color: Scalars['String'];
  name: Scalars['String'];
  notify?: Maybe<Scalars['Boolean']>;
};

export type ProjectTimeCost = {
  __typename?: 'ProjectTimeCost';
  amount?: Maybe<Scalars['Float']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  date?: Maybe<Scalars['DateTime']>;
  duration?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  member?: Maybe<CompanyMember>;
  project?: Maybe<TaskBoard>;
  task?: Maybe<Task>;
  timeIn?: Maybe<Scalars['DateTime']>;
  timeOut?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
};

export type ProjectTimeCostDeleteInput = {
  ids: Array<Scalars['ID']>;
};

export type ProjectTimeCostEditInput = {
  amount?: Maybe<Scalars['Float']>;
  date?: Maybe<Scalars['DateTime']>;
  memberId?: Maybe<Scalars['ID']>;
  note?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['ID']>;
  taskId?: Maybe<Scalars['ID']>;
  timeCostId: Scalars['ID'];
  timeIn?: Maybe<Scalars['DateTime']>;
  timeOut?: Maybe<Scalars['DateTime']>;
};

export type ProjectTimeCostFilter = {
  projectId?: Maybe<Scalars['ID']>;
};

export type ProjectTimeCostInput = {
  amount: Scalars['Float'];
  date: Scalars['DateTime'];
  memberId: Scalars['ID'];
  note?: Maybe<Scalars['String']>;
  projectId: Scalars['ID'];
  taskId: Scalars['ID'];
  timeIn?: Maybe<Scalars['DateTime']>;
  timeOut?: Maybe<Scalars['DateTime']>;
};

export type ProjectTimeCostSort = {
  direction?: Maybe<SortDirection>;
  type?: Maybe<ProjectTimeCostSortType>;
};

export enum ProjectTimeCostSortType {
  CreatedAt = 'CREATED_AT'
}

export type ProjectUpdateInput = {
  color?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  /** "owners" are company member IDs */
  ownerIds?: Maybe<Array<Scalars['ID']>>;
  projectId: Scalars['ID'];
  published?: Maybe<Scalars['Boolean']>;
};

export enum ProjectVisibility {
  Assigned = 'ASSIGNED',
  Hidden = 'HIDDEN',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Specific = 'SPECIFIC'
}

export type PublicHoliday = {
  __typename?: 'PublicHoliday';
  countryCode?: Maybe<Scalars['String']>;
  country_code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  date?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  year?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  /** selectedDate limit will only for one month */
  attendanceDaySummaries?: Maybe<Array<Maybe<AttendanceDaySummary>>>;
  attendanceDaySummary?: Maybe<Array<Maybe<AttendanceDaySummary>>>;
  attendanceLabels?: Maybe<Array<Maybe<AttendanceLabel>>>;
  attendanceMemberStats?: Maybe<AttendanceMemberStats>;
  attendanceMonthSummary?: Maybe<Array<Maybe<AttendanceMonthSummary>>>;
  attendanceSettings?: Maybe<AttendanceSettings>;
  attendanceWeekSummary?: Maybe<Array<Maybe<AttendanceWeekSummary>>>;
  attendanceWeeklyForMonthSummary?: Maybe<Array<Maybe<AttendanceWeekSummary>>>;
  attendances?: Maybe<Array<Maybe<Attendance>>>;
  billingInvoice?: Maybe<BillingInvoice>;
  billingInvoiceItem?: Maybe<BillingInvoiceItem>;
  billingInvoiceItems?: Maybe<Array<Maybe<BillingInvoiceItem>>>;
  billingInvoices?: Maybe<Array<Maybe<BillingInvoice>>>;
  breadcrumbInfo?: Maybe<BreadcrumbInfo>;
  collection?: Maybe<Collection>;
  collectionPeriod?: Maybe<CollectionPeriod>;
  collectionPeriods?: Maybe<Array<Maybe<CollectionPeriod>>>;
  collector?: Maybe<Collector>;
  collectorActivities?: Maybe<Array<Maybe<CollectionActivityLog>>>;
  collectors?: Maybe<Array<Maybe<Collector>>>;
  companies?: Maybe<Array<Maybe<Company>>>;
  company?: Maybe<Company>;
  companyMember?: Maybe<CompanyMember>;
  companyPaymentMethods?: Maybe<Array<Maybe<CompanyPaymentMethod>>>;
  companyProfileJson?: Maybe<Scalars['String']>;
  companySlug?: Maybe<Company>;
  companyStorage?: Maybe<CompanyStorageDetails>;
  /** This query is deprecated. Please use the new query 'subscription' instead. */
  companySubscription?: Maybe<CompanySubscription>;
  companySubscriptions?: Maybe<Array<Maybe<CompanySubscription>>>;
  companyTeam?: Maybe<CompanyTeam>;
  companyTeams?: Maybe<Array<Maybe<CompanyTeam>>>;
  companyWorkDaySettings?: Maybe<Array<Maybe<CompanyWorkDaySetting>>>;
  contact?: Maybe<Contact>;
  contactActivities?: Maybe<Array<Maybe<ContactActivityRaw>>>;
  contactGroup?: Maybe<ContactGroup>;
  contactGroups?: Maybe<Array<Maybe<ContactGroup>>>;
  contacts?: Maybe<Array<Maybe<Contact>>>;
  currentAttendance?: Maybe<Attendance>;
  currentUser?: Maybe<User>;
  customTimesheetApprovals?: Maybe<Array<Maybe<CustomTimesheetDayApproval>>>;
  dedocoPackages?: Maybe<Array<Maybe<SubscriptionPackage>>>;
  employeeType?: Maybe<EmployeeType>;
  filterTimesheet?: Maybe<Array<Maybe<Timesheet>>>;
  getActivityTimeSummaryByDay?: Maybe<Array<Maybe<ActivityDaySummary>>>;
  getActivityTimeSummaryByMonth?: Maybe<Array<Maybe<ActivityMonthSummary>>>;
  getActivityTimeSummaryByWeek?: Maybe<Array<Maybe<ActivityWeekSummary>>>;
  getCollaboratedCollectors?: Maybe<Array<Maybe<Collector>>>;
  getCollector?: Maybe<Collector>;
  getMonthlyActivityTrackingByMonth?: Maybe<Array<Maybe<ActivityWeekSummary>>>;
  getReferenceImageUploadUrl?: Maybe<CompanyMemberReferenceImageResponse>;
  getServerTime?: Maybe<Scalars['DateTime']>;
  /** To be deprecated */
  getTaskPics?: Maybe<Array<Maybe<TaskPic>>>;
  getTimesheetsByCompanyMember?: Maybe<Array<Maybe<Timesheet>>>;
  getVerificationImageUploadUrl?: Maybe<VerificationImageUploadUrlResponse>;
  globalProjectTemplateGallery?: Maybe<ProjectTemplateGallery>;
  holidays?: Maybe<Array<Maybe<Holiday>>>;
  listCollectors?: Maybe<Array<Maybe<Collector>>>;
  location?: Maybe<Location>;
  locations?: Maybe<Array<Maybe<Location>>>;
  me?: Maybe<User>;
  memberLastOut?: Maybe<Attendance>;
  project?: Maybe<TaskBoard>;
  projectClaim?: Maybe<ProjectClaim>;
  projectClaims?: Maybe<PaginatedProjectClaims>;
  projectInvoice?: Maybe<ProjectInvoice>;
  projectInvoices?: Maybe<PaginatedProjectInvoices>;
  projectTemplates?: Maybe<Array<Maybe<ProjectTemplate>>>;
  projectTimeCost?: Maybe<ProjectTimeCost>;
  projectTimeCosts?: Maybe<PaginatedProjectTimeCosts>;
  projects?: Maybe<Array<Maybe<TaskBoard>>>;
  promoCodeInfo?: Maybe<Array<Maybe<DiscountedPrice>>>;
  redisTest?: Maybe<Array<Maybe<Scalars['String']>>>;
  senangPayUsers?: Maybe<Array<Maybe<CompanyMember>>>;
  sharedWithMeTasks?: Maybe<PaginatedSharedWithMeTasks>;
  shortUrl?: Maybe<ShortUrl>;
  /**
   * If you specify an id then it will only return if you are an admin. Otherwise it will return the subscription
   * for the currently active company
   */
  subscription?: Maybe<Subscription>;
  subscriptionPackageV2?: Maybe<SubscriptionPackage>;
  subscriptionPackages?: Maybe<Array<Maybe<SubscriptionPackage>>>;
  subscriptionPackagesV2?: Maybe<Array<Maybe<SubscriptionPackage>>>;
  subscriptionProduct?: Maybe<SubscriptionProduct>;
  subscriptionProducts?: Maybe<Array<Maybe<SubscriptionProduct>>>;
  subscriptionQuantitiesAssigned?: Maybe<SubscriptionQuantityResult>;
  /** This is not implemented yet */
  subscriptions?: Maybe<Array<Maybe<Subscription>>>;
  tag?: Maybe<Tag>;
  tagGroup?: Maybe<TagGroup>;
  tagGroups?: Maybe<Array<Maybe<TagGroup>>>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  task?: Maybe<Task>;
  taskBoard?: Maybe<TaskBoard>;
  taskBoardFolders?: Maybe<Array<Maybe<TaskBoardFolder>>>;
  taskBoardTeams?: Maybe<Array<Maybe<TaskBoardTeam>>>;
  taskBoards?: Maybe<Array<Maybe<TaskBoard>>>;
  taskBoardsV3?: Maybe<PaginatedTaskBoards>;
  taskPics?: Maybe<Array<Maybe<TaskPic>>>;
  taskTemplate?: Maybe<TaskTemplate>;
  taskTemplates?: Maybe<Array<Maybe<TaskTemplate>>>;
  tasks?: Maybe<Array<Maybe<Task>>>;
  tasksV3?: Maybe<PaginatedTasks>;
  teamStatuses?: Maybe<Array<Maybe<CompanyTeamStatus>>>;
  timesheet?: Maybe<Timesheet>;
  timesheetApprovals?: Maybe<Array<Maybe<TimesheetDayApproval>>>;
  timesheets?: Maybe<Array<Maybe<Timesheet>>>;
  user?: Maybe<User>;
  userInvoices?: Maybe<Array<Maybe<StripeInvoice>>>;
  userSubscriptions?: Maybe<Array<Maybe<CompanySubscription>>>;
  workspace?: Maybe<Workspace>;
  workspaces?: Maybe<Array<Maybe<Workspace>>>;
};


export type QueryAttendanceDaySummariesArgs = {
  companyId: Scalars['ID'];
  companyMemberId?: Maybe<Scalars['ID']>;
  selectedDate: Scalars['DateTime'];
};


export type QueryAttendanceDaySummaryArgs = {
  companyId: Scalars['ID'];
  input: AttendanceDaySummaryInput;
};


export type QueryAttendanceLabelsArgs = {
  companyId: Scalars['ID'];
};


export type QueryAttendanceMemberStatsArgs = {
  memberId: Scalars['ID'];
};


export type QueryAttendanceMonthSummaryArgs = {
  companyId: Scalars['ID'];
  input: AttendanceMonthSummaryInput;
};


export type QueryAttendanceSettingsArgs = {
  companyId: Scalars['ID'];
};


export type QueryAttendanceWeekSummaryArgs = {
  companyId: Scalars['ID'];
  input: AttendanceWeekSummaryInput;
};


export type QueryAttendanceWeeklyForMonthSummaryArgs = {
  companyId: Scalars['ID'];
  input: AttendanceMonthSummaryInput;
};


export type QueryAttendancesArgs = {
  input: GetAttendancesInput;
};


export type QueryBillingInvoiceArgs = {
  id: Scalars['ID'];
};


export type QueryBillingInvoiceItemArgs = {
  id: Scalars['ID'];
};


export type QueryBillingInvoiceItemsArgs = {
  invoiceId: Scalars['ID'];
};


export type QueryBillingInvoicesArgs = {
  projectId: Scalars['ID'];
};


export type QueryBreadcrumbInfoArgs = {
  id: Scalars['ID'];
  type: BreadcrumbType;
};


export type QueryCollectionArgs = {
  collectionId: Scalars['ID'];
  isForMember?: Maybe<Scalars['Boolean']>;
};


export type QueryCollectionPeriodArgs = {
  collectionPeriodId: Scalars['ID'];
};


export type QueryCollectionPeriodsArgs = {
  collectionId: Scalars['ID'];
};


export type QueryCollectorArgs = {
  collectorId: Scalars['ID'];
};


export type QueryCollectorActivitiesArgs = {
  companyId: Scalars['ID'];
};


export type QueryCollectorsArgs = {
  companyId: Scalars['ID'];
};


export type QueryCompaniesArgs = {
  pagination?: Maybe<Pagination>;
};


export type QueryCompanyArgs = {
  id: Scalars['ID'];
};


export type QueryCompanyMemberArgs = {
  companyMemberId: Scalars['ID'];
};


export type QueryCompanyPaymentMethodsArgs = {
  companyId: Scalars['ID'];
};


export type QueryCompanyProfileJsonArgs = {
  companyId: Scalars['ID'];
};


export type QueryCompanySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryCompanyStorageArgs = {
  companyId: Scalars['ID'];
};


export type QueryCompanySubscriptionArgs = {
  subscriptionId: Scalars['ID'];
};


export type QueryCompanySubscriptionsArgs = {
  companyId: Scalars['ID'];
};


export type QueryCompanyTeamArgs = {
  id: Scalars['ID'];
};


export type QueryCompanyTeamsArgs = {
  companyId: Scalars['ID'];
};


export type QueryCompanyWorkDaySettingsArgs = {
  companyId: Scalars['ID'];
  employeeTypeId: Scalars['ID'];
};


export type QueryContactArgs = {
  id: Scalars['ID'];
};


export type QueryContactActivitiesArgs = {
  contactId: Scalars['ID'];
  isCount: Scalars['Boolean'];
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  tableType: ContactActivityTableType;
};


export type QueryContactGroupArgs = {
  companyId: Scalars['ID'];
  groupId: Scalars['ID'];
};


export type QueryContactGroupsArgs = {
  companyId: Scalars['ID'];
};


export type QueryContactsArgs = {
  companyId: Scalars['ID'];
};


export type QueryCurrentAttendanceArgs = {
  memberId: Scalars['ID'];
};


export type QueryCustomTimesheetApprovalsArgs = {
  companyId: Scalars['ID'];
  memberId?: Maybe<Scalars['ID']>;
};


export type QueryEmployeeTypeArgs = {
  employeeTypeId: Scalars['ID'];
};


export type QueryFilterTimesheetArgs = {
  companyMemberId?: Maybe<Scalars['ID']>;
  teamId?: Maybe<Scalars['ID']>;
};


export type QueryGetActivityTimeSummaryByDayArgs = {
  companyId: Scalars['ID'];
  filters: DayTimesheetFilterOptions;
};


export type QueryGetActivityTimeSummaryByMonthArgs = {
  companyId: Scalars['ID'];
  filters: MonthlyTimesheetFilterOptions;
};


export type QueryGetActivityTimeSummaryByWeekArgs = {
  companyId: Scalars['ID'];
  filters: WeeklyTimesheetFilterOptions;
};


export type QueryGetCollectorArgs = {
  collectorId: Scalars['ID'];
};


export type QueryGetMonthlyActivityTrackingByMonthArgs = {
  companyId: Scalars['ID'];
  filters: MonthlyTimesheetFilterOptions;
};


export type QueryGetReferenceImageUploadUrlArgs = {
  companyId: Scalars['ID'];
};


export type QueryGetServerTimeArgs = {
  companyId: Scalars['ID'];
};


export type QueryGetTimesheetsByCompanyMemberArgs = {
  companyMemberId: Scalars['ID'];
};


export type QueryGetVerificationImageUploadUrlArgs = {
  companyId: Scalars['ID'];
};


export type QueryHolidaysArgs = {
  companyId: Scalars['ID'];
  year: Scalars['Int'];
};


export type QueryListCollectorsArgs = {
  companyId: Scalars['ID'];
};


export type QueryLocationArgs = {
  id: Scalars['ID'];
};


export type QueryLocationsArgs = {
  companyId: Scalars['ID'];
};


export type QueryMemberLastOutArgs = {
  companyMemberId: Scalars['ID'];
};


export type QueryProjectArgs = {
  id: Scalars['ID'];
};


export type QueryProjectClaimArgs = {
  claimId: Scalars['ID'];
};


export type QueryProjectClaimsArgs = {
  filter?: Maybe<ProjectClaimFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<ProjectClaimSort>;
};


export type QueryProjectInvoiceArgs = {
  invoiceId: Scalars['ID'];
};


export type QueryProjectInvoicesArgs = {
  filter?: Maybe<ProjectInvoiceFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<ProjectInvoiceSort>;
};


export type QueryProjectTemplatesArgs = {
  companyId: Scalars['ID'];
};


export type QueryProjectTimeCostArgs = {
  timeCostId: Scalars['ID'];
};


export type QueryProjectTimeCostsArgs = {
  filter?: Maybe<ProjectClaimFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<ProjectTimeCostSort>;
};


export type QueryProjectsArgs = {
  memberId: Scalars['ID'];
};


export type QueryPromoCodeInfoArgs = {
  code: Scalars['String'];
  createSubscriptionInput: Array<Maybe<CreateSubscriptionInput>>;
};


export type QuerySenangPayUsersArgs = {
  companyId: Scalars['ID'];
};


export type QuerySharedWithMeTasksArgs = {
  filter?: Maybe<TaskFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<TaskSort>;
};


export type QueryShortUrlArgs = {
  shortId: Scalars['String'];
};


export type QuerySubscriptionArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QuerySubscriptionPackageV2Args = {
  packageId: Scalars['ID'];
};


export type QuerySubscriptionPackagesV2Args = {
  listAll?: Maybe<Scalars['Boolean']>;
};


export type QuerySubscriptionProductArgs = {
  productId: Scalars['ID'];
};


export type QuerySubscriptionQuantitiesAssignedArgs = {
  companyId: Scalars['ID'];
  stripeProductId: Scalars['String'];
};


export type QuerySubscriptionsArgs = {
  companyId?: Maybe<Scalars['ID']>;
};


export type QueryTagArgs = {
  id: Scalars['ID'];
};


export type QueryTagGroupArgs = {
  id: Scalars['ID'];
};


export type QueryTagGroupsArgs = {
  companyId: Scalars['ID'];
};


export type QueryTagsArgs = {
  companyId: Scalars['ID'];
};


export type QueryTaskArgs = {
  taskId: Scalars['ID'];
};


export type QueryTaskBoardArgs = {
  id: Scalars['ID'];
};


export type QueryTaskBoardFoldersArgs = {
  type: TaskBoardFolderType;
};


export type QueryTaskBoardTeamsArgs = {
  category?: Maybe<TaskBoardCategory>;
  companyId: Scalars['ID'];
  type: TaskBoardType;
};


export type QueryTaskBoardsArgs = {
  category?: Maybe<TaskBoardCategory>;
  companyId: Scalars['ID'];
  filters?: Maybe<TaskBoardFiltersOptions>;
  limit?: Maybe<Scalars['Int']>;
  type: TaskBoardType;
};


export type QueryTaskBoardsV3Args = {
  filter?: Maybe<TaskBoardFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<TaskBoardSort>;
};


export type QueryTaskTemplateArgs = {
  companyId: Scalars['ID'];
  id: Scalars['ID'];
};


export type QueryTaskTemplatesArgs = {
  companyId: Scalars['ID'];
};


export type QueryTasksArgs = {
  category?: Maybe<TaskBoardCategory>;
  companyId: Scalars['ID'];
  filters?: Maybe<FilterOptions>;
};


export type QueryTasksV3Args = {
  filter?: Maybe<TaskFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<TaskSort>;
};


export type QueryTeamStatusesArgs = {
  companyTeamId: Scalars['ID'];
};


export type QueryTimesheetArgs = {
  timesheetId: Scalars['ID'];
};


export type QueryTimesheetApprovalsArgs = {
  companyId: Scalars['ID'];
  memberId?: Maybe<Scalars['ID']>;
};


export type QueryTimesheetsArgs = {
  companyId: Scalars['ID'];
  filters?: Maybe<TimesheetFilterOptions>;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryWorkspaceArgs = {
  id: Scalars['ID'];
};


export type QueryWorkspacesArgs = {
  companyId: Scalars['ID'];
  ids?: Maybe<Array<Scalars['ID']>>;
};

export type ReceivePaymentInvoiceInput = {
  date?: Maybe<Scalars['DateTime']>;
  invoiceId: Scalars['ID'];
  received: Scalars['Float'];
};

export type ReminderStatus = {
  __typename?: 'ReminderStatus';
  email?: Maybe<ServiceHistory>;
  whatsapp?: Maybe<ServiceHistory>;
};

export enum ReminderStatusTypes {
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS',
  Sent = 'SENT'
}

export type RemoveFromProjectVisibilityWhitelistInput = {
  memberIds?: Maybe<Array<Scalars['ID']>>;
  projectId: Scalars['ID'];
  teamIds?: Maybe<Array<Scalars['ID']>>;
};

export type RemoveFromTaskVisibilityWhitelistInput = {
  memberIds?: Maybe<Array<Scalars['ID']>>;
  taskId: Scalars['ID'];
  teamIds?: Maybe<Array<Scalars['ID']>>;
};

export type RemoveFromVisibilityWhitelistInput = {
  boardId: Scalars['ID'];
  memberIds?: Maybe<Array<Scalars['ID']>>;
  teamIds?: Maybe<Array<Scalars['ID']>>;
};

export type RemoveFromWorkspaceVisibilityWhitelistInput = {
  memberIds?: Maybe<Array<Scalars['ID']>>;
  teamIds?: Maybe<Array<Scalars['ID']>>;
  workspaceId: Scalars['ID'];
};

export type RemoveMembersFromCollectionInput = {
  collectionId: Scalars['ID'];
  memberIds: Array<Scalars['ID']>;
};

export type RemoveProjectsFromWorkspaceInput = {
  projectIds: Array<Scalars['ID']>;
  workspaceId: Scalars['ID'];
};

export type RemoveTaskBoardsFromFolderInput = {
  boardIds: Array<Scalars['ID']>;
};

export type RemoveTaskWatchersInput = {
  memberIds: Array<Scalars['ID']>;
  taskId: Scalars['ID'];
};

export type ReorderGroupInput = {
  projectId: Scalars['ID'];
  reorderedGroups: Array<ReorderedGroup>;
};

export type ReorderedGroup = {
  groupId: Scalars['ID'];
  ordering: Scalars['Int'];
};

export type RequestAccountDeletionInput = {
  alternateEmail?: Maybe<Scalars['String']>;
  reason: Scalars['String'];
};

export type RequestAccountDeletionResponse = {
  __typename?: 'RequestAccountDeletionResponse';
  message?: Maybe<Scalars['String']>;
  success?: Maybe<Scalars['Boolean']>;
};

export type ResourcePermission = {
  __typename?: 'ResourcePermission';
  companyMembers?: Maybe<Array<Maybe<CompanyMember>>>;
  company_members?: Maybe<Array<Maybe<CompanyMember>>>;
  teams?: Maybe<Array<Maybe<CompanyTeam>>>;
};

export type ResourcePermissionInput = {
  companyMemberIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  company_member_ids?: Maybe<Array<Maybe<Scalars['String']>>>;
  teamIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  team_ids?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** Add more resources as necessary, it will be combined with its own id, eg. task_26 */
export enum ResourceType {
  Collection = 'COLLECTION',
  Task = 'TASK'
}

export type SendInvoiceInput = {
  emails?: Maybe<Array<Scalars['String']>>;
  invoiceId: Scalars['ID'];
};

export type ServiceHistory = {
  __typename?: 'ServiceHistory';
  collection?: Maybe<Collection>;
  id?: Maybe<Scalars['ID']>;
  status?: Maybe<ReminderStatusTypes>;
  to?: Maybe<Scalars['String']>;
  type?: Maybe<ServiceHistoryTypes>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export enum ServiceHistoryTypes {
  Email = 'EMAIL',
  Whatsapp = 'WHATSAPP'
}

export type SetAttendanceVerificationImageInput = {
  imageUrl: Scalars['String'];
  s3Bucket: Scalars['String'];
  s3Key: Scalars['String'];
};

export type SetDefaultCompanyPaymentMethodInput = {
  companyId: Scalars['ID'];
  stripePaymentMethodId: Scalars['ID'];
};

export type SetProjectVisibilityInput = {
  projectId: Scalars['ID'];
  visibility: ProjectVisibility;
};

export type SetTaskBoardVisibilityInput = {
  boardId: Scalars['ID'];
  visibility: TaskBoardVisibility;
};

export type SetTaskVisibilityInput = {
  taskId: Scalars['ID'];
  visibility: CommonVisibility;
};

export type SetWorkspaceVisibilityInput = {
  visibility: CommonVisibility;
  workspaceId: Scalars['ID'];
};

export type ShortUrl = {
  __typename?: 'ShortUrl';
  active?: Maybe<Scalars['Boolean']>;
  created_at?: Maybe<Scalars['DateTime']>;
  full_url?: Maybe<Scalars['String']>;
  short_id?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum StageType {
  Closed = 'CLOSED',
  Fail = 'FAIL',
  Pass = 'PASS',
  Pending = 'PENDING'
}

export type StartAttendanceEntryInput = {
  address?: Maybe<Scalars['String']>;
  comments?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  image_url?: Maybe<Scalars['String']>;
  lat?: Maybe<Scalars['Latitude']>;
  lng?: Maybe<Scalars['Longitude']>;
  s3Bucket?: Maybe<Scalars['String']>;
  s3Key?: Maybe<Scalars['String']>;
  s3_bucket?: Maybe<Scalars['String']>;
  s3_key?: Maybe<Scalars['String']>;
  tagIds?: Maybe<Array<Scalars['ID']>>;
  type: AttendanceType;
  verificationType?: Maybe<AttendanceVerificationType>;
  verification_type?: Maybe<AttendanceVerificationType>;
};

export type StartSubscriptionInput = {
  companyId: Scalars['ID'];
  interval: SubscriptionPriceInterval;
  packageId: Scalars['ID'];
};

export type StripeCoupon = {
  __typename?: 'StripeCoupon';
  amountOff?: Maybe<Scalars['Float']>;
  amount_off?: Maybe<Scalars['Float']>;
  appliesTo?: Maybe<ProductInCoupon>;
  applies_to?: Maybe<ProductInCoupon>;
  created?: Maybe<Scalars['Int']>;
  currency?: Maybe<Scalars['String']>;
  duration?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  maxRedemptions?: Maybe<Scalars['Int']>;
  max_redemptions?: Maybe<Scalars['Int']>;
  metadata?: Maybe<StripeCouponMetaData>;
  name?: Maybe<Scalars['String']>;
  object?: Maybe<Scalars['String']>;
  percentOff?: Maybe<Scalars['Float']>;
  percent_off?: Maybe<Scalars['Float']>;
  redeemBy?: Maybe<Scalars['Int']>;
  redeem_by?: Maybe<Scalars['Int']>;
  timesRedeemed?: Maybe<Scalars['Int']>;
  times_redeemed?: Maybe<Scalars['Int']>;
  valid?: Maybe<Scalars['Boolean']>;
};

export type StripeCouponMetaData = {
  __typename?: 'StripeCouponMetaData';
  applicableProducts?: Maybe<Array<Maybe<Scalars['ID']>>>;
  applicable_products?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type StripeCustomerDetails = {
  __typename?: 'StripeCustomerDetails';
  default_currency?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
};

export type StripeInvoice = {
  __typename?: 'StripeInvoice';
  accountCountry?: Maybe<Scalars['String']>;
  accountName?: Maybe<Scalars['String']>;
  account_country?: Maybe<Scalars['String']>;
  account_name?: Maybe<Scalars['String']>;
  amountDue?: Maybe<Scalars['Int']>;
  amountPaid?: Maybe<Scalars['Int']>;
  amountRemaining?: Maybe<Scalars['Int']>;
  amount_due?: Maybe<Scalars['Int']>;
  amount_paid?: Maybe<Scalars['Int']>;
  amount_remaining?: Maybe<Scalars['Int']>;
  attemptCount?: Maybe<Scalars['Int']>;
  attempt_count?: Maybe<Scalars['Int']>;
  attempted?: Maybe<Scalars['Boolean']>;
  billingReason?: Maybe<Scalars['String']>;
  billing_reason?: Maybe<Scalars['String']>;
  charge?: Maybe<Scalars['String']>;
  collection_method?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['Int']>;
  currency?: Maybe<Scalars['String']>;
  customer?: Maybe<Scalars['String']>;
  customerAddress?: Maybe<Scalars['String']>;
  customerEmail?: Maybe<Scalars['String']>;
  customerName?: Maybe<Scalars['String']>;
  customerPhone?: Maybe<Scalars['String']>;
  customerShipping?: Maybe<Scalars['String']>;
  customerTaxExempt?: Maybe<Scalars['String']>;
  customer_address?: Maybe<Scalars['String']>;
  customer_email?: Maybe<Scalars['String']>;
  customer_name?: Maybe<Scalars['String']>;
  customer_phone?: Maybe<Scalars['String']>;
  customer_shipping?: Maybe<Scalars['String']>;
  customer_tax_exempt?: Maybe<Scalars['String']>;
  defaultPaymentMethod?: Maybe<Scalars['String']>;
  default_payment_method?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['String']>;
  due_date?: Maybe<Scalars['String']>;
  endingBalance?: Maybe<Scalars['Int']>;
  ending_balance?: Maybe<Scalars['Int']>;
  hostedInvoiceUrl?: Maybe<Scalars['String']>;
  hosted_invoice_url?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  invoicePdf?: Maybe<Scalars['String']>;
  invoice_pdf?: Maybe<Scalars['String']>;
  nextPaymentAttempt?: Maybe<Scalars['Int']>;
  next_payment_attempt?: Maybe<Scalars['Int']>;
  number?: Maybe<Scalars['String']>;
  object?: Maybe<Scalars['String']>;
  paid?: Maybe<Scalars['Boolean']>;
  paymentIntent?: Maybe<Scalars['String']>;
  payment_intent?: Maybe<Scalars['String']>;
  periodEnd?: Maybe<Scalars['Int']>;
  periodStart?: Maybe<Scalars['Int']>;
  period_end?: Maybe<Scalars['Int']>;
  period_start?: Maybe<Scalars['Int']>;
  receiptNumber?: Maybe<Scalars['String']>;
  receipt_number?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  subscription?: Maybe<Scalars['String']>;
  subtotal?: Maybe<Scalars['Int']>;
  tax?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  webhooksDeliveredAt?: Maybe<Scalars['Int']>;
  webhooks_delivered_at?: Maybe<Scalars['Int']>;
};

export type StripePromoCode = {
  __typename?: 'StripePromoCode';
  active?: Maybe<Scalars['Boolean']>;
  code?: Maybe<Scalars['String']>;
  coupon?: Maybe<StripeCoupon>;
  created?: Maybe<Scalars['Int']>;
  customer?: Maybe<Scalars['String']>;
  expiresAt?: Maybe<Scalars['Int']>;
  expires_at?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  maxRedemptions?: Maybe<Scalars['Int']>;
  max_redemptions?: Maybe<Scalars['Int']>;
  timesRedeemed?: Maybe<Scalars['Int']>;
  times_redeemed?: Maybe<Scalars['Int']>;
};

/** New subscription type for the new subscription model */
export type Subscription = {
  __typename?: 'Subscription';
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  intervalType?: Maybe<SubscriptionPriceInterval>;
  invoiceQuota?: Maybe<Scalars['Int']>;
  package?: Maybe<SubscriptionPackage>;
  reportQuota?: Maybe<Scalars['Int']>;
  /** In bytes */
  storageQuota?: Maybe<Scalars['Float']>;
  stripeSubscriptionId?: Maybe<Scalars['String']>;
  taskQuota?: Maybe<Scalars['Int']>;
  teamQuota?: Maybe<Scalars['Int']>;
  upcomingChanges?: Maybe<Array<Maybe<SubscriptionChange>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  userQuota?: Maybe<Scalars['Int']>;
};

export type SubscriptionChange = {
  __typename?: 'SubscriptionChange';
  action?: Maybe<Scalars['String']>;
  actionData?: Maybe<Scalars['JSON']>;
  runAt?: Maybe<Scalars['DateTime']>;
};

export type SubscriptionDiscount = {
  __typename?: 'SubscriptionDiscount';
  coupon?: Maybe<StripeCoupon>;
  customer?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  promotionCode?: Maybe<Scalars['String']>;
  promotion_code?: Maybe<Scalars['String']>;
  start?: Maybe<Scalars['Int']>;
  subscription?: Maybe<Scalars['String']>;
};

/**
 * Covers new and legacy subscription types. The legacy one goes to 'packages' table while
 * the new one goes to the 'subscription_packages' table.
 */
export type SubscriptionPackage = {
  __typename?: 'SubscriptionPackage';
  /**
   * Deactivated packages should not be renewed automatically [not implemented yet] and
   * cannot be activated on a user's account
   */
  active?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  emailQuota?: Maybe<Scalars['Int']>;
  email_quota?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  invoiceQuota?: Maybe<Scalars['Int']>;
  /** This indicates whether it's a custom package created by admin */
  isCustom?: Maybe<Scalars['Boolean']>;
  /**
   * This indicates which is the free tier package, for the system to know which package to assign to a new company.
   * There's no error checking on this, it's up to the admin to make sure there's only one default package.
   */
  isDefault?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  packagePrices?: Maybe<Array<Maybe<SubscriptionPackagePrice>>>;
  package_prices?: Maybe<Array<Maybe<SubscriptionPackagePrice>>>;
  phoneCallQuota?: Maybe<Scalars['Int']>;
  phone_call_quota?: Maybe<Scalars['Int']>;
  productId?: Maybe<Scalars['String']>;
  product_id?: Maybe<Scalars['String']>;
  products?: Maybe<Array<Maybe<SubscriptionProduct>>>;
  /** Published would be shown on the frontend, unpublished covers custom packages or internal use ones */
  published?: Maybe<Scalars['Boolean']>;
  reportQuota?: Maybe<Scalars['Int']>;
  sequence?: Maybe<Scalars['Int']>;
  signatureQuota?: Maybe<Scalars['Int']>;
  signature_quota?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  smsQuota?: Maybe<Scalars['Int']>;
  sms_quota?: Maybe<Scalars['Int']>;
  storage?: Maybe<Scalars['Float']>;
  /** In bytes */
  storageQuota?: Maybe<Scalars['Float']>;
  taskQuota?: Maybe<Scalars['Int']>;
  teamQuota?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<PackageTypes>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  userQuota?: Maybe<Scalars['Int']>;
  whatsappQuota?: Maybe<Scalars['Int']>;
  whatsapp_quota?: Maybe<Scalars['Int']>;
};

export type SubscriptionPackagePrice = {
  __typename?: 'SubscriptionPackagePrice';
  active?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  currency?: Maybe<Scalars['String']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  interval?: Maybe<Scalars['String']>;
  intervalCount?: Maybe<Scalars['Int']>;
  interval_count?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  package?: Maybe<SubscriptionPackage>;
  price?: Maybe<Scalars['Float']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripe_price_id?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

/** This data comes from Stripe and is not stored in DB */
export type SubscriptionPrice = {
  __typename?: 'SubscriptionPrice';
  amount?: Maybe<Scalars['Float']>;
  currency?: Maybe<Scalars['String']>;
  interval?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export enum SubscriptionPriceInterval {
  Month = 'MONTH',
  Year = 'YEAR'
}

/** Each product is a module/feature and can be enabled/disabled for a subscription package */
export type SubscriptionProduct = {
  __typename?: 'SubscriptionProduct';
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  /**
   * After creating a new price, it takes a few seconds to be available in Stripe, so
   * it will not be available in the API until it's available in Stripe
   */
  prices?: Maybe<Array<Maybe<SubscriptionPrice>>>;
  stripeProductId?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
};

export type SubscriptionPromoCode = {
  __typename?: 'SubscriptionPromoCode';
  amountOff?: Maybe<Scalars['Float']>;
  amount_off?: Maybe<Scalars['Float']>;
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  percentOff?: Maybe<Scalars['Int']>;
  percent_off?: Maybe<Scalars['Int']>;
  promoCodeId?: Maybe<Scalars['String']>;
  promo_code_id?: Maybe<Scalars['String']>;
  subscription?: Maybe<CompanySubscription>;
};

export type SubscriptionQuantityResult = {
  __typename?: 'SubscriptionQuantityResult';
  assigned?: Maybe<Scalars['Int']>;
  companyMembers?: Maybe<Array<Maybe<CompanyMember>>>;
  company_members?: Maybe<Array<Maybe<CompanyMember>>>;
  total?: Maybe<Scalars['Int']>;
};

export enum SubscriptionStatuses {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Incomplete = 'INCOMPLETE',
  Overdue = 'OVERDUE',
  Trial = 'TRIAL'
}

export type Subtask = {
  __typename?: 'Subtask';
  checked?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  sequence?: Maybe<Scalars['Int']>;
  task?: Maybe<Task>;
  title?: Maybe<Scalars['String']>;
};

export type SubtaskInput = {
  title: Scalars['String'];
};

export type SubtaskSequencesInput = {
  sequence?: Maybe<Scalars['Int']>;
  subtaskId: Scalars['ID'];
};

export type SubtaskUpdateInput = {
  checked?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['String']>;
};

export type SwitchSubscriptionPackageInput = {
  packagePriceId?: Maybe<Scalars['ID']>;
  package_price_id: Scalars['ID'];
  quantity?: Maybe<Scalars['Int']>;
};

export type Tag = {
  __typename?: 'Tag';
  color?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  group?: Maybe<TagGroup>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type TagGroup = {
  __typename?: 'TagGroup';
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** Task refers to "card" in DB */
export type Task = {
  __typename?: 'Task';
  actualCost?: Maybe<Scalars['Float']>;
  actualEffort?: Maybe<Scalars['Float']>;
  actualEnd?: Maybe<Scalars['DateTime']>;
  actualStart?: Maybe<Scalars['DateTime']>;
  actualValue?: Maybe<Scalars['Float']>;
  actual_cost?: Maybe<Scalars['Float']>;
  actual_end?: Maybe<Scalars['DateTime']>;
  actual_start?: Maybe<Scalars['DateTime']>;
  approvedCost?: Maybe<Scalars['Float']>;
  archived?: Maybe<Scalars['Boolean']>;
  archivedAt?: Maybe<Scalars['DateTime']>;
  archivedBy?: Maybe<User>;
  attachments?: Maybe<Array<Maybe<TaskAttachment>>>;
  checklists?: Maybe<Array<Maybe<Checklist>>>;
  childTasks?: Maybe<Array<Maybe<Task>>>;
  comments?: Maybe<Array<Maybe<TaskComment>>>;
  company?: Maybe<Company>;
  companyTeam?: Maybe<CompanyTeam>;
  /** if a card has a sub_status_id = 50 and status = 2, in card_statuses it will be id = 50 and parent_status = 2 */
  companyTeamStatus?: Maybe<CompanyTeamStatus>;
  company_team?: Maybe<CompanyTeam>;
  company_team_status?: Maybe<CompanyTeamStatus>;
  completed?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  customValues?: Maybe<Array<Maybe<TaskCustomValue>>>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  dueReminder?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  due_reminder?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  fileType?: Maybe<Scalars['String']>;
  file_type?: Maybe<Scalars['String']>;
  group?: Maybe<ProjectGroup>;
  id: Scalars['ID'];
  members?: Maybe<Array<Maybe<TaskMember>>>;
  name?: Maybe<Scalars['String']>;
  parentTask?: Maybe<Task>;
  pics?: Maybe<Array<Maybe<TaskPic>>>;
  pinned?: Maybe<Scalars['Boolean']>;
  plannedEffort?: Maybe<Scalars['Int']>;
  planned_effort?: Maybe<Scalars['Int']>;
  posY?: Maybe<Scalars['Int']>;
  /** 2022/01/12 - Specifically for task activity tracker, but may be available to normal task in the future */
  priority?: Maybe<TaskPriorityType>;
  project?: Maybe<TaskBoard>;
  projectStatus?: Maybe<ProjectStatus>;
  projectedCost?: Maybe<Scalars['Float']>;
  projectedValue?: Maybe<Scalars['Float']>;
  projected_cost?: Maybe<Scalars['Float']>;
  published?: Maybe<Scalars['Boolean']>;
  spentEffort?: Maybe<Scalars['Int']>;
  spent_effort?: Maybe<Scalars['Int']>;
  stageStatus?: Maybe<StageType>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  /** To be deprecated and replace by stageStatus */
  status?: Maybe<CompanyTeamStatusType>;
  subtasks?: Maybe<Array<Maybe<Subtask>>>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** To get sub_status_id */
  taskActivities?: Maybe<Array<Maybe<TaskActivity>>>;
  taskBoard?: Maybe<TaskBoard>;
  taskBoardTeam?: Maybe<TaskBoardTeam>;
  task_activities?: Maybe<Array<Maybe<TaskActivity>>>;
  task_board?: Maybe<TaskBoard>;
  task_board_team?: Maybe<TaskBoardTeam>;
  templateTask?: Maybe<TaskTemplate>;
  timeSpent?: Maybe<Scalars['Int']>;
  timeSpentMember?: Maybe<Scalars['Int']>;
  time_spent?: Maybe<Scalars['Int']>;
  timerTotals?: Maybe<Array<Maybe<TaskTimerTotal>>>;
  timer_totals?: Maybe<Array<Maybe<TaskTimerTotal>>>;
  timesheets?: Maybe<Array<Maybe<Timesheet>>>;
  /** Total of hourly rate * timesheet approval hour of all members under that task(see Time Approval page on FE) */
  totalRate?: Maybe<Scalars['Float']>;
  /** Type is deprecated as of 2021/10/13, will always be "Task" */
  type?: Maybe<TaskType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
  value?: Maybe<Scalars['Float']>;
  visibility?: Maybe<CommonVisibility>;
  visibilityWhitelist?: Maybe<CommonVisibilityWhitelist>;
  watchers?: Maybe<Array<Maybe<TaskWatcher>>>;
};


/** Task refers to "card" in DB */
export type TaskChecklistsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


/** Task refers to "card" in DB */
export type TaskCommentsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


/** Task refers to "card" in DB */
export type TaskSubtasksArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


/** Task refers to "card" in DB */
export type TaskTotalRateArgs = {
  dates: Array<TaskQueryTotalRate>;
};

export enum TaskActionType {
  AssigneeAdded = 'ASSIGNEE_ADDED',
  AssigneeRemoved = 'ASSIGNEE_REMOVED',
  AttachmentRemoved = 'ATTACHMENT_REMOVED',
  AttachmentUploaded = 'ATTACHMENT_UPLOADED',
  PicAdded = 'PIC_ADDED',
  PicRemoved = 'PIC_REMOVED',
  TaskArchived = 'TASK_ARCHIVED',
  TaskCreated = 'TASK_CREATED',
  TaskRemoved = 'TASK_REMOVED',
  TaskUnarchived = 'TASK_UNARCHIVED',
  UpdatedDueDate = 'UPDATED_DUE_DATE',
  UpdatedEndDate = 'UPDATED_END_DATE',
  UpdatedStartDate = 'UPDATED_START_DATE',
  UpdatedTeamStatus = 'UPDATED_TEAM_STATUS'
}

export type TaskActivity = {
  __typename?: 'TaskActivity';
  actionType?: Maybe<Scalars['String']>;
  action_type?: Maybe<Scalars['String']>;
  attachment?: Maybe<TaskAttachment>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  fieldName?: Maybe<Scalars['String']>;
  field_name?: Maybe<Scalars['String']>;
  fromCardStatus?: Maybe<CompanyTeamStatus>;
  fromDate?: Maybe<Scalars['DateTime']>;
  fromLabel?: Maybe<Scalars['String']>;
  fromValueTo?: Maybe<Scalars['String']>;
  from_card_status?: Maybe<CompanyTeamStatus>;
  from_date?: Maybe<Scalars['DateTime']>;
  from_label?: Maybe<Scalars['String']>;
  from_value_to?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  targetMember?: Maybe<CompanyMember>;
  targetPic?: Maybe<ContactPic>;
  target_member?: Maybe<CompanyMember>;
  target_pic?: Maybe<ContactPic>;
  task?: Maybe<Task>;
  toCardStatus?: Maybe<CompanyTeamStatus>;
  toDate?: Maybe<Scalars['DateTime']>;
  toLabel?: Maybe<Scalars['String']>;
  toValue?: Maybe<Scalars['String']>;
  to_card_status?: Maybe<CompanyTeamStatus>;
  to_date?: Maybe<Scalars['DateTime']>;
  to_label?: Maybe<Scalars['String']>;
  to_value?: Maybe<Scalars['String']>;
};

export type TaskAttachment = {
  __typename?: 'TaskAttachment';
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  documentHash?: Maybe<Scalars['String']>;
  document_hash?: Maybe<Scalars['String']>;
  encoding?: Maybe<Scalars['String']>;
  externalSource?: Maybe<ExternalFileSource>;
  fileSize?: Maybe<Scalars['Int']>;
  file_size?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  isDeleted?: Maybe<Scalars['Boolean']>;
  isExternal?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

/** Task Board refers to job in DB */
export type TaskBoard = {
  __typename?: 'TaskBoard';
  archived?: Maybe<Scalars['Boolean']>;
  archivedAt?: Maybe<Scalars['DateTime']>;
  archivedBy?: Maybe<User>;
  associateBy?: Maybe<User>;
  associate_by?: Maybe<User>;
  category?: Maybe<TaskBoardCategory>;
  color?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  contact?: Maybe<Contact>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  folder?: Maybe<TaskBoardFolder>;
  groups?: Maybe<Array<Maybe<ProjectGroup>>>;
  id?: Maybe<Scalars['ID']>;
  members?: Maybe<Array<Maybe<TaskMember>>>;
  name?: Maybe<Scalars['String']>;
  owners?: Maybe<Array<Maybe<TaskBoardOwner>>>;
  pinned?: Maybe<Scalars['Boolean']>;
  projectSettings?: Maybe<ProjectSettings>;
  projectStatuses?: Maybe<Array<Maybe<ProjectStatus>>>;
  published?: Maybe<Scalars['Boolean']>;
  slug?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  /** Not the same kind of status in Task */
  status?: Maybe<TaskBoardStatusType>;
  taskBoardTeams?: Maybe<Array<Maybe<TaskBoardTeam>>>;
  task_board_teams?: Maybe<Array<Maybe<TaskBoardTeam>>>;
  tasks?: Maybe<Array<Maybe<Task>>>;
  timeSpent?: Maybe<Scalars['Int']>;
  time_spent?: Maybe<Scalars['Int']>;
  type?: Maybe<TaskBoardType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  value?: Maybe<Scalars['Int']>;
  visibility?: Maybe<CommonVisibility>;
  visibilityWhitelist?: Maybe<CommonVisibilityWhitelist>;
  workspace?: Maybe<Workspace>;
};


/** Task Board refers to job in DB */
export type TaskBoardGroupsArgs = {
  groupQuery?: Maybe<GroupQuery>;
};


/** Task Board refers to job in DB */
export type TaskBoardTasksArgs = {
  filters?: Maybe<FilterOptions>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export enum TaskBoardCategory {
  Default = 'DEFAULT',
  Project = 'PROJECT'
}

export type TaskBoardFilter = {
  boardType?: Maybe<TaskBoardType>;
  category?: Maybe<TaskBoardCategory>;
  dueDateRange?: Maybe<Array<Scalars['DateTime']>>;
  isOverdue?: Maybe<Scalars['Boolean']>;
  memberAssigneeIds?: Maybe<Array<Scalars['ID']>>;
  memberOwnerIds?: Maybe<Array<Scalars['ID']>>;
  tagIds?: Maybe<Array<Scalars['ID']>>;
};

export type TaskBoardFiltersOptions = {
  memberId?: Maybe<Scalars['ID']>;
};

export type TaskBoardFolder = {
  __typename?: 'TaskBoardFolder';
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  taskBoards?: Maybe<Array<Maybe<TaskBoard>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
};

export { TaskBoardFolderType };

export type TaskBoardInput = {
  category?: Maybe<TaskBoardCategory>;
  color?: Maybe<Scalars['String']>;
  companyId?: Maybe<Scalars['ID']>;
  company_id: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  owners?: Maybe<Array<Scalars['String']>>;
  status: Scalars['Int'];
  type: TaskBoardType;
};

export type TaskBoardOwner = {
  __typename?: 'TaskBoardOwner';
  board?: Maybe<TaskBoard>;
  companyMember?: Maybe<CompanyMember>;
};

export type TaskBoardSort = {
  direction?: Maybe<SortDirection>;
  type?: Maybe<TaskBoardSortType>;
};

export enum TaskBoardSortType {
  CreatedAt = 'CREATED_AT',
  Name = 'NAME'
}

export enum TaskBoardStatusType {
  Cancelled = 'CANCELLED',
  Done = 'DONE',
  Progress = 'PROGRESS'
}

export type TaskBoardTeam = {
  __typename?: 'TaskBoardTeam';
  companyTeam?: Maybe<CompanyTeam>;
  company_team?: Maybe<CompanyTeam>;
  id: Scalars['ID'];
  tasks?: Maybe<Array<Maybe<Task>>>;
};

export type TaskBoardTeamDeleteInput = {
  task_board_team_ids: Array<Maybe<Scalars['ID']>>;
};

export type TaskBoardTeamInput = {
  job_id: Scalars['ID'];
  team_id: Scalars['ID'];
};

export enum TaskBoardType {
  All = 'ALL',
  Collaboration = 'COLLABORATION',
  Company = 'COMPANY',
  Internal = 'INTERNAL',
  Personal = 'PERSONAL'
}

export type TaskBoardUpdateInput = {
  category?: Maybe<TaskBoardCategory>;
  color?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  /** "owners" are company member IDs */
  owners?: Maybe<Array<Scalars['String']>>;
  published?: Maybe<Scalars['Boolean']>;
  type: TaskBoardType;
};

export { TaskBoardVisibility };

export type TaskBoardVisibilityWhitelist = {
  __typename?: 'TaskBoardVisibilityWhitelist';
  members?: Maybe<Array<Maybe<CompanyMember>>>;
  teams?: Maybe<Array<Maybe<CompanyTeam>>>;
};

export type TaskComment = {
  __typename?: 'TaskComment';
  attachments?: Maybe<Array<Maybe<TaskAttachment>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  id: Scalars['ID'];
  message?: Maybe<Scalars['String']>;
  messageContent?: Maybe<Scalars['String']>;
  parentTaskComment?: Maybe<TaskComment>;
  task?: Maybe<Task>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
};

export type TaskCommentInput = {
  /** Either in PIC or Member UUID */
  mentionIds?: Maybe<Array<Scalars['ID']>>;
  /** Old mention system pattern: @[member-or-pic-uuid] */
  message?: Maybe<Scalars['String']>;
  /** Must be in JSON file */
  messageContent?: Maybe<Scalars['String']>;
  /** If have parentId, means it is a reply or children, no parentId is a parent comment. */
  parentId?: Maybe<Scalars['ID']>;
};

export type TaskCommentUpdateInput = {
  message?: Maybe<Scalars['String']>;
  messageContent?: Maybe<Scalars['String']>;
};

export type TaskCustomValue = {
  __typename?: 'TaskCustomValue';
  attribute?: Maybe<ProjectGroupCustomAttribute>;
  group?: Maybe<ProjectGroup>;
  task?: Maybe<Task>;
  value?: Maybe<Scalars['String']>;
};

export type TaskDeleteInput = {
  task_ids: Array<Maybe<Scalars['ID']>>;
};

export enum TaskDueRemindersType {
  FifteenM = 'FIFTEEN_M',
  FiveM = 'FIVE_M',
  OneDay = 'ONE_DAY',
  OneHour = 'ONE_HOUR',
  OnDue = 'ON_DUE',
  TenM = 'TEN_M',
  TwoDay = 'TWO_DAY',
  TwoHour = 'TWO_HOUR'
}

export type TaskFilter = {
  boardType?: Maybe<TaskBoardType>;
  category?: Maybe<TaskBoardCategory>;
  contactIds?: Maybe<Array<Scalars['ID']>>;
  dueDateRange?: Maybe<Array<Scalars['DateTime']>>;
  ids?: Maybe<Array<Scalars['ID']>>;
  isOverdue?: Maybe<Scalars['Boolean']>;
  isRecurring?: Maybe<Scalars['Boolean']>;
  memberAssigneeIds?: Maybe<Array<Scalars['ID']>>;
  memberOwnerIds?: Maybe<Array<Scalars['ID']>>;
  picIds?: Maybe<Array<Scalars['ID']>>;
  priority?: Maybe<TaskPriorityType>;
  search?: Maybe<Scalars['String']>;
  stage?: Maybe<StageType>;
  startDateRange?: Maybe<Array<Scalars['DateTime']>>;
  subStatusId?: Maybe<Scalars['ID']>;
  tagIds?: Maybe<Array<Scalars['ID']>>;
};

export type TaskFilterOptions = {
  is_project?: Maybe<Scalars['Boolean']>;
};

export type TaskInput = {
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  groupId?: Maybe<Scalars['ID']>;
  jobId?: Maybe<Scalars['ID']>;
  job_id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  parentId?: Maybe<Scalars['ID']>;
  plannedEffort?: Maybe<Scalars['Float']>;
  planned_effort?: Maybe<Scalars['Float']>;
  posY?: Maybe<Scalars['Int']>;
  priority?: Maybe<TaskPriorityType>;
  projectId?: Maybe<Scalars['ID']>;
  projectStatusId?: Maybe<Scalars['ID']>;
  projectedCost?: Maybe<Scalars['Float']>;
  projected_cost?: Maybe<Scalars['Float']>;
  published?: Maybe<Scalars['Boolean']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  subStatusId?: Maybe<Scalars['ID']>;
  sub_status_id?: Maybe<Scalars['ID']>;
  tagIds?: Maybe<Array<Scalars['ID']>>;
  teamId?: Maybe<Scalars['ID']>;
  team_id?: Maybe<Scalars['ID']>;
  value?: Maybe<Scalars['Float']>;
  visibility?: Maybe<TaskVisibilityType>;
  workspaceId?: Maybe<Scalars['ID']>;
};

export type TaskMember = {
  __typename?: 'TaskMember';
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  id: Scalars['ID'];
  task?: Maybe<Task>;
  user?: Maybe<User>;
};

export type TaskMemberFilter = {
  memberId?: Maybe<Scalars['ID']>;
  member_id?: Maybe<Scalars['ID']>;
};

export type TaskMemberInput = {
  companyMemberIds?: Maybe<Array<Scalars['ID']>>;
  company_member_ids: Array<Maybe<Scalars['ID']>>;
};

export type TaskPersonalInput = {
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  jobId?: Maybe<Scalars['ID']>;
  job_id: Scalars['ID'];
  name: Scalars['String'];
  priority?: Maybe<TaskPriorityType>;
  published?: Maybe<Scalars['Boolean']>;
  stageStatus?: Maybe<StageType>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  status?: Maybe<PersonalStatusType>;
  value?: Maybe<Scalars['Float']>;
};

export type TaskPic = {
  __typename?: 'TaskPic';
  contact?: Maybe<Contact>;
  id: Scalars['ID'];
  pic?: Maybe<ContactPic>;
  task?: Maybe<Task>;
  user?: Maybe<User>;
};


export type TaskPicTaskArgs = {
  isProject?: Maybe<Scalars['Boolean']>;
};

export type TaskPicInput = {
  picIds?: Maybe<Array<Scalars['ID']>>;
  pic_ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type TaskPicsInput = {
  picIds: Array<Scalars['ID']>;
  taskId: Scalars['ID'];
};

export { TaskPriorityType };

export type TaskQueryTotalRate = {
  day: Scalars['Int'];
  month: Scalars['Int'];
  year: Scalars['Int'];
};

export type TaskSequenceInput = {
  sequence?: Maybe<Scalars['Int']>;
  task_id?: Maybe<Scalars['ID']>;
};

export type TaskSort = {
  direction?: Maybe<SortDirection>;
  type?: Maybe<TaskSortType>;
};

export enum TaskSortType {
  CreatedAt = 'CREATED_AT',
  DueDate = 'DUE_DATE',
  Name = 'NAME',
  Priority = 'PRIORITY',
  Stage = 'STAGE'
}

export type TaskTag = {
  __typename?: 'TaskTag';
  tag?: Maybe<Tag>;
  task?: Maybe<Task>;
};

export type TaskTagOptions = {
  tagIds: Array<Scalars['ID']>;
  taskId: Scalars['ID'];
};

export type TaskTemplate = Template & {
  __typename?: 'TaskTemplate';
  attachments?: Maybe<Array<Maybe<TaskTemplateAttachment>>>;
  company?: Maybe<Company>;
  copyAttachments?: Maybe<Scalars['Boolean']>;
  copySubtasks?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  isRecurring?: Maybe<Scalars['Boolean']>;
  items?: Maybe<Array<Maybe<TaskTemplateItem>>>;
  name?: Maybe<Scalars['String']>;
  recurringSetting?: Maybe<TaskTemplateRecurringSetting>;
  templateId?: Maybe<Scalars['ID']>;
  type?: Maybe<TemplateType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type TaskTemplateAttachment = {
  __typename?: 'TaskTemplateAttachment';
  bucket?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
  filesize?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type TaskTemplateItem = {
  __typename?: 'TaskTemplateItem';
  description?: Maybe<Scalars['String']>;
  isSubtask?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  sequence?: Maybe<Scalars['Int']>;
};

/** Translated from cron string */
export type TaskTemplateRecurringSetting = {
  __typename?: 'TaskTemplateRecurringSetting';
  day?: Maybe<Scalars['Int']>;
  intervalType?: Maybe<Scalars['String']>;
  month?: Maybe<Scalars['Int']>;
  skipWeekend?: Maybe<Scalars['Boolean']>;
};

export type TaskTimerEntry = {
  __typename?: 'TaskTimerEntry';
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  createdAt?: Maybe<Scalars['DateTime']>;
  created_at?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  task?: Maybe<Task>;
  timeTotal?: Maybe<Scalars['Int']>;
  time_total?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export type TaskTimerTotal = {
  __typename?: 'TaskTimerTotal';
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  memberTotal?: Maybe<Scalars['Int']>;
  member_total?: Maybe<Scalars['Int']>;
};

export enum TaskType {
  Document = 'DOCUMENT',
  Task = 'TASK'
}

export type TaskUpdateInput = {
  actualEffort?: Maybe<Scalars['Float']>;
  actualEnd?: Maybe<Scalars['DateTime']>;
  actualStart?: Maybe<Scalars['DateTime']>;
  actualValue?: Maybe<Scalars['Float']>;
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  dueReminder?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  due_reminder?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  plannedEffort?: Maybe<Scalars['Float']>;
  planned_effort?: Maybe<Scalars['Float']>;
  priority?: Maybe<TaskPriorityType>;
  projectStatusId?: Maybe<Scalars['ID']>;
  projectedCost?: Maybe<Scalars['Float']>;
  projected_cost?: Maybe<Scalars['Float']>;
  published?: Maybe<Scalars['Boolean']>;
  sequence?: Maybe<Scalars['Int']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  subStatusId?: Maybe<Scalars['ID']>;
  sub_status_id?: Maybe<Scalars['ID']>;
  teamId?: Maybe<Scalars['ID']>;
  team_id?: Maybe<Scalars['ID']>;
  visibility?: Maybe<TaskVisibilityType>;
};

export enum TaskVisibilityType {
  Default = 'DEFAULT',
  /** And creator */
  Owners = 'OWNERS'
}

export type TaskWatcher = {
  __typename?: 'TaskWatcher';
  companyMember?: Maybe<CompanyMember>;
  task?: Maybe<Task>;
};

export type TeamStatusFilter = {
  sub_status_id?: Maybe<Scalars['ID']>;
};

export type Template = {
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<TemplateType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export enum TemplateType {
  ProjectTask = 'PROJECT_TASK',
  Task = 'TASK'
}

export type Timesheet = {
  __typename?: 'Timesheet';
  activity?: Maybe<TimesheetActivity>;
  archived?: Maybe<TimesheetArchiveStatus>;
  comments?: Maybe<Scalars['String']>;
  companyMember?: Maybe<CompanyMember>;
  company_member?: Maybe<CompanyMember>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  location?: Maybe<Location>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
  submitted_date?: Maybe<Scalars['DateTime']>;
  timeTotal?: Maybe<Scalars['Int']>;
  time_total?: Maybe<Scalars['Int']>;
};

export type TimesheetActivity = {
  __typename?: 'TimesheetActivity';
  active?: Maybe<Scalars['Boolean']>;
  created_at?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  task?: Maybe<Task>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export type TimesheetApprovalInput = {
  companyMemberId?: Maybe<Scalars['ID']>;
  taskId: Scalars['ID'];
};

export enum TimesheetApprovalStatus {
  Approved = 'APPROVED',
  Rejected = 'REJECTED'
}

export enum TimesheetArchiveStatus {
  False = 'FALSE',
  True = 'TRUE'
}

export type TimesheetDayApproval = {
  __typename?: 'TimesheetDayApproval';
  billable?: Maybe<Scalars['Boolean']>;
  companyMember?: Maybe<CompanyMember>;
  day?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  status?: Maybe<TimesheetApprovalStatus>;
  task?: Maybe<Task>;
  total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type TimesheetDaysInput = {
  day: Scalars['Int'];
  month: Scalars['Int'];
  total: Scalars['Int'];
  year: Scalars['Int'];
};

export type TimesheetEntryInput = {
  comments?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date: Scalars['DateTime'];
  submittedDate?: Maybe<Scalars['DateTime']>;
  submitted_date?: Maybe<Scalars['DateTime']>;
  timeTotal?: Maybe<Scalars['Int']>;
  time_total?: Maybe<Scalars['Int']>;
};

export type TimesheetFilterOptions = {
  archived?: Maybe<ArchivedStatus>;
  selectedDate?: Maybe<Scalars['DateTime']>;
};

export type ToggleEnabledCustomColumnInput = {
  attributeId: Scalars['ID'];
  projectId: Scalars['ID'];
};

export type ToolTipsStatus = {
  __typename?: 'ToolTipsStatus';
  ADD_CLIENT_COLLECTOR?: Maybe<Scalars['Boolean']>;
  ADD_COMPANY_MEMBERS?: Maybe<Scalars['Boolean']>;
  ADD_COMPANY_TEAM?: Maybe<Scalars['Boolean']>;
  ADD_CONTACT?: Maybe<Scalars['Boolean']>;
  ADD_CONTACT_GROUP?: Maybe<Scalars['Boolean']>;
  ADD_INTERNAL_TASK_BOARD?: Maybe<Scalars['Boolean']>;
  ADD_TASK?: Maybe<Scalars['Boolean']>;
  ADD_TASK_BOARD_TEAM?: Maybe<Scalars['Boolean']>;
  ASSIGN_CONTACT_GROUP_FOR_CONTACT?: Maybe<Scalars['Boolean']>;
  COLLECTION_LIST_VIEW_TYPE_AND_STATUS_SORTING?: Maybe<Scalars['Boolean']>;
  CREATE_COLLECTION?: Maybe<Scalars['Boolean']>;
  CREATE_COMPANY?: Maybe<Scalars['Boolean']>;
  EDIT_COMPANY?: Maybe<Scalars['Boolean']>;
  EDIT_COMPANY_TEAM?: Maybe<Scalars['Boolean']>;
  EDIT_TASK?: Maybe<Scalars['Boolean']>;
  INITIAL?: Maybe<Scalars['Boolean']>;
  PAYMENTS_PAGE?: Maybe<Scalars['Boolean']>;
  SETUP_PAYMENT_DETAILS?: Maybe<Scalars['Boolean']>;
  SUBSCRIBE_PACKAGE?: Maybe<Scalars['Boolean']>;
  SWITCH_CONTACT_GROUP_TAB?: Maybe<Scalars['Boolean']>;
  TASK_SHARED_WITH_ME?: Maybe<Scalars['Boolean']>;
  TASK_VIEW_MODE?: Maybe<Scalars['Boolean']>;
  VIEW_COLLECTION?: Maybe<Scalars['Boolean']>;
  VIEW_CONTACT_DETAIL?: Maybe<Scalars['Boolean']>;
};

export type TotalNotificationCount = {
  __typename?: 'TotalNotificationCount';
  total?: Maybe<Scalars['Int']>;
};

export type TotalTimesheetApproval = {
  __typename?: 'TotalTimesheetApproval';
  day?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type UnarchiveTaskInput = {
  task_ids: Array<Maybe<Scalars['ID']>>;
};

export type UnreadCount = {
  __typename?: 'UnreadCount';
  unread?: Maybe<Scalars['Int']>;
};

export type UpdateAttendanceSettingsInput = {
  allowMobile?: Maybe<Scalars['Boolean']>;
  allowWeb?: Maybe<Scalars['Boolean']>;
  allow_mobile?: Maybe<Scalars['Boolean']>;
  allow_web?: Maybe<Scalars['Boolean']>;
  enable2d?: Maybe<Scalars['Boolean']>;
  enableBiometric?: Maybe<Scalars['Boolean']>;
  enable_2d?: Maybe<Scalars['Boolean']>;
  enable_biometric?: Maybe<Scalars['Boolean']>;
  requireLocation?: Maybe<Scalars['Boolean']>;
  requireVerification?: Maybe<Scalars['Boolean']>;
  require_location?: Maybe<Scalars['Boolean']>;
  require_verification?: Maybe<Scalars['Boolean']>;
};

export type UpdateBillingInvoiceInput = {
  billingInvoiceId: Scalars['ID'];
  docDate?: Maybe<Scalars['DateTime']>;
  /** Maximum 20 characters */
  docNo?: Maybe<Scalars['String']>;
  /** Get companyName from contactId */
  picId?: Maybe<Scalars['ID']>;
  /** Maximum 200 characters */
  remarks?: Maybe<Scalars['String']>;
  terms?: Maybe<Scalars['Int']>;
};

export type UpdateBillingInvoiceItemInput = {
  descriptionHdr?: Maybe<Scalars['String']>;
  discountPercentage?: Maybe<Scalars['Float']>;
  invoiceItemId: Scalars['ID'];
  /** aka Description_DTL, either update taskId to change name or change the itemName */
  itemName?: Maybe<Scalars['String']>;
  sequence?: Maybe<Scalars['Int']>;
  /** Either update taskId to change name or change the itemName */
  taskId?: Maybe<Scalars['ID']>;
  taxPercentage?: Maybe<Scalars['Float']>;
  unitPrice?: Maybe<Scalars['Float']>;
};

export type UpdateCollectionInput = {
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['DateTime']>;
  due_date?: Maybe<Scalars['DateTime']>;
  emailNotify?: Maybe<Scalars['Boolean']>;
  email_notify?: Maybe<Scalars['Boolean']>;
  isDraft?: Maybe<Scalars['Boolean']>;
  is_draft?: Maybe<Scalars['Boolean']>;
  notifyPics?: Maybe<Array<Scalars['ID']>>;
  notify_pics?: Maybe<Array<Scalars['ID']>>;
  refNo?: Maybe<Scalars['String']>;
  ref_no?: Maybe<Scalars['String']>;
  remindEnd_on?: Maybe<Scalars['DateTime']>;
  remindInterval?: Maybe<CollectionRemindIntervalTypes>;
  remindOnDate?: Maybe<Scalars['Int']>;
  remindOnMonth?: Maybe<Scalars['Int']>;
  remind_end_on?: Maybe<Scalars['DateTime']>;
  remind_interval?: Maybe<CollectionRemindIntervalTypes>;
  remind_on_date?: Maybe<Scalars['Int']>;
  remind_on_month?: Maybe<Scalars['Int']>;
  smsNotify?: Maybe<Scalars['Boolean']>;
  sms_notify?: Maybe<Scalars['Boolean']>;
  startMonth?: Maybe<Scalars['DateTime']>;
  start_month?: Maybe<Scalars['DateTime']>;
  title?: Maybe<Scalars['String']>;
  voiceNotify?: Maybe<Scalars['Boolean']>;
  voice_notify?: Maybe<Scalars['Boolean']>;
  whatsappNotify?: Maybe<Scalars['Boolean']>;
  whatsapp_notify?: Maybe<Scalars['Boolean']>;
};

export type UpdateCollectionPaymentTypeInput = {
  payment_type?: Maybe<CollectionPaymentTypes>;
};

export type UpdateCollectorInput = {
  id: Scalars['ID'];
  memberIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  member_ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
  teamId?: Maybe<Scalars['ID']>;
  team_id?: Maybe<Scalars['ID']>;
};

export type UpdateCompanyHolidayInput = {
  active?: Maybe<CompanyHolidayStatus>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['DateTime']>;
  start_date?: Maybe<Scalars['DateTime']>;
};

export type UpdateCompanyInfoInput = {
  /** Only for invoice generation */
  accountCode?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  /** Only for invoice generation */
  invoicePrefix?: Maybe<Scalars['String']>;
  invoiceStart?: Maybe<Scalars['String']>;
  logoUrl?: Maybe<Scalars['String']>;
  logo_url?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  registrationCode?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type UpdateCompanyMemberInfoInput = {
  employeeTypeId?: Maybe<Scalars['ID']>;
  employee_type_id?: Maybe<Scalars['ID']>;
  hourlyRate?: Maybe<Scalars['Float']>;
  hourly_rate?: Maybe<Scalars['Float']>;
  position?: Maybe<Scalars['String']>;
  type?: Maybe<CompanyMemberType>;
};

export type UpdateCompanyPermissionsInput = {
  manager?: Maybe<UpdateCrudInput>;
  member?: Maybe<UpdateCrudInput>;
};

export type UpdateCompanyTeamInfoInput = {
  memberIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  member_ids?: Maybe<Array<Maybe<Scalars['ID']>>>;
  title?: Maybe<Scalars['String']>;
};

export type UpdateCompanyTeamStatusInput = {
  color: Scalars['String'];
  label: Scalars['String'];
  parentStatus?: Maybe<CompanyTeamStatusType>;
  parent_status: CompanyTeamStatusType;
  percentage: Scalars['Int'];
  stage?: Maybe<StageType>;
};

export type UpdateCompanyWorkDayInput = {
  endHour?: Maybe<Scalars['String']>;
  end_hour: Scalars['String'];
  open: Scalars['Boolean'];
  startHour?: Maybe<Scalars['String']>;
  start_hour: Scalars['String'];
};

export type UpdateContactGroupInput = {
  name?: Maybe<Scalars['String']>;
};

export type UpdateContactInput = {
  /** Only for invoice generation */
  accountCode?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  dealValue?: Maybe<Scalars['Float']>;
  deal_value?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  remarks?: Maybe<Scalars['String']>;
  type: ContactType;
};

export type UpdateContactPicInput = {
  contactNo?: Maybe<Scalars['String']>;
  contact_no?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  remarks?: Maybe<Scalars['String']>;
};

export type UpdateCrudInput = {
  member?: Maybe<CommonCrud>;
};

export type UpdateCustomTimesheetApprovalInput = {
  billable?: Maybe<Scalars['Boolean']>;
  date: Scalars['DateTime'];
  sheets: Array<CustomTimesheetApprovalInput>;
  status?: Maybe<TimesheetApprovalStatus>;
};

export type UpdateLocationInput = {
  address?: Maybe<Scalars['String']>;
  archived?: Maybe<Scalars['Boolean']>;
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
  metadata?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  radius?: Maybe<Scalars['Float']>;
};

export type UpdatePaymentStatusInput = {
  collectionId?: Maybe<Scalars['ID']>;
  collectionPaymentId?: Maybe<Scalars['ID']>;
  collectionPeriodId?: Maybe<Scalars['ID']>;
  collection_id: Scalars['ID'];
  collection_payment_id: Scalars['ID'];
  collection_period_id: Scalars['ID'];
  remarks?: Maybe<Scalars['String']>;
  status: CollectionPaymentStatusTypes;
};

export type UpdateProfileInput = {
  contactNo?: Maybe<Scalars['String']>;
  contact_no?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  profileImage?: Maybe<Scalars['String']>;
  profile_image?: Maybe<Scalars['String']>;
};

export type UpdateProjectsArchivedStateInput = {
  archived: Scalars['Boolean'];
  projectIds: Array<Scalars['ID']>;
};

export type UpdateSubscriptionPackageProductsInput = {
  packageId: Scalars['ID'];
  productId: Scalars['ID'];
};

export type UpdateSubscriptionProductInput = {
  name: Scalars['String'];
};

export type UpdateTagGroupInput = {
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type UpdateTagInput = {
  color?: Maybe<Scalars['String']>;
  groupId?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};

export type UpdateTaskBoardFolderInput = {
  folderId: Scalars['ID'];
  name: Scalars['String'];
};

export type UpdateTaskBoardsArchivedStateInput = {
  archived: Scalars['Boolean'];
  boardIds: Array<Maybe<Scalars['String']>>;
};

export type UpdateTaskParentInput = {
  childTaskId: Scalars['ID'];
  destinationParentId: Scalars['ID'];
};

export type UpdateTaskParentResponse = {
  __typename?: 'UpdateTaskParentResponse';
  destinationTask: Task;
  sourceTask: Task;
};

export type UpdateTaskTemplateInput = {
  companyId: Scalars['ID'];
  cronString?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isCopyAttachments?: Maybe<Scalars['Boolean']>;
  isCopySubtasks?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  templateId: Scalars['ID'];
};

export type UpdateTimesheetApprovalInput = {
  billable?: Maybe<Scalars['Boolean']>;
  date: Scalars['DateTime'];
  sheets: Array<TimesheetApprovalInput>;
  status?: Maybe<TimesheetApprovalStatus>;
};

export type UpdateTimesheetInput = {
  comments?: Maybe<Scalars['String']>;
  endDate?: Maybe<Scalars['DateTime']>;
  end_date?: Maybe<Scalars['DateTime']>;
};

export type UpdateToolTipsStatusInput = {
  ADD_CLIENT_COLLECTOR?: Maybe<Scalars['Boolean']>;
  ADD_COMPANY_MEMBERS?: Maybe<Scalars['Boolean']>;
  ADD_COMPANY_TEAM?: Maybe<Scalars['Boolean']>;
  ADD_CONTACT?: Maybe<Scalars['Boolean']>;
  ADD_CONTACT_GROUP?: Maybe<Scalars['Boolean']>;
  ADD_INTERNAL_TASK_BOARD?: Maybe<Scalars['Boolean']>;
  ADD_TASK?: Maybe<Scalars['Boolean']>;
  ADD_TASK_BOARD_TEAM?: Maybe<Scalars['Boolean']>;
  ASSIGN_CONTACT_GROUP_FOR_CONTACT?: Maybe<Scalars['Boolean']>;
  COLLECTION_LIST_VIEW_TYPE_AND_STATUS_SORTING?: Maybe<Scalars['Boolean']>;
  CREATE_COLLECTION?: Maybe<Scalars['Boolean']>;
  CREATE_COMPANY?: Maybe<Scalars['Boolean']>;
  EDIT_COMPANY?: Maybe<Scalars['Boolean']>;
  EDIT_COMPANY_TEAM?: Maybe<Scalars['Boolean']>;
  EDIT_TASK?: Maybe<Scalars['Boolean']>;
  INITIAL?: Maybe<Scalars['Boolean']>;
  PAYMENTS_PAGE?: Maybe<Scalars['Boolean']>;
  SETUP_PAYMENT_DETAILS?: Maybe<Scalars['Boolean']>;
  SUBSCRIBE_PACKAGE?: Maybe<Scalars['Boolean']>;
  SWITCH_CONTACT_GROUP_TAB?: Maybe<Scalars['Boolean']>;
  TASK_SHARED_WITH_ME?: Maybe<Scalars['Boolean']>;
  TASK_VIEW_MODE?: Maybe<Scalars['Boolean']>;
  VIEW_COLLECTION?: Maybe<Scalars['Boolean']>;
  VIEW_CONTACT_DETAIL?: Maybe<Scalars['Boolean']>;
};

export type UpdateUserNameInput = {
  name: Scalars['String'];
};

export type UpdateWorkspaceInput = {
  bgColor?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  workspaceId: Scalars['ID'];
};

export type UpgradeSubscriptionInput = {
  companyId: Scalars['ID'];
  interval: SubscriptionPriceInterval;
  packageId: Scalars['ID'];
  subscriptionId: Scalars['ID'];
};

export type UploadMemberReferenceImageInput = {
  imageUrl?: Maybe<Scalars['String']>;
  image_url: Scalars['String'];
  s3Bucket?: Maybe<Scalars['String']>;
  s3Key?: Maybe<Scalars['String']>;
  s3_bucket: Scalars['String'];
  s3_key: Scalars['String'];
};

export type UploadPaymentReceiptInput = {
  collectionId?: Maybe<Scalars['ID']>;
  collectionPaymentId?: Maybe<Scalars['ID']>;
  collectionPeriodId?: Maybe<Scalars['ID']>;
  collection_id: Scalars['ID'];
  collection_payment_id: Scalars['ID'];
  collection_period_id: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  active?: Maybe<Scalars['Boolean']>;
  auth0Id?: Maybe<Scalars['String']>;
  auth0_id?: Maybe<Scalars['String']>;
  companies?: Maybe<Array<Maybe<Company>>>;
  contactNo?: Maybe<Scalars['String']>;
  contact_no?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  created_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<User>;
  customerId?: Maybe<Scalars['String']>;
  customer_id?: Maybe<Scalars['String']>;
  defaultCompany?: Maybe<Company>;
  defaultTimezone?: Maybe<Scalars['String']>;
  default_company?: Maybe<Company>;
  default_timezone?: Maybe<Scalars['String']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedBy?: Maybe<User>;
  deleted_at?: Maybe<Scalars['DateTime']>;
  deleted_by?: Maybe<User>;
  email?: Maybe<Scalars['String']>;
  emailAuth?: Maybe<Scalars['Boolean']>;
  emailVerificationCode?: Maybe<Scalars['String']>;
  emailVerified?: Maybe<Scalars['Boolean']>;
  email_auth?: Maybe<Scalars['Boolean']>;
  email_verification_code?: Maybe<Scalars['String']>;
  email_verified?: Maybe<Scalars['Boolean']>;
  facebookId?: Maybe<Scalars['String']>;
  facebook_id?: Maybe<Scalars['String']>;
  googleId?: Maybe<Scalars['String']>;
  google_id?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  lastActiveAt?: Maybe<Scalars['DateTime']>;
  lastLogin?: Maybe<Scalars['DateTime']>;
  last_active_at?: Maybe<Scalars['DateTime']>;
  last_login?: Maybe<Scalars['DateTime']>;
  linkedinId?: Maybe<Scalars['String']>;
  linkedin_id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  onboarding?: Maybe<Scalars['JSON']>;
  paymentMethodId?: Maybe<Scalars['String']>;
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  payment_method_id?: Maybe<Scalars['String']>;
  payment_methods?: Maybe<Array<Maybe<PaymentMethod>>>;
  profileImage?: Maybe<Scalars['String']>;
  profileImageSize?: Maybe<Scalars['Float']>;
  profileImages?: Maybe<ImageGroup>;
  profile_image?: Maybe<Scalars['String']>;
  refreshToken?: Maybe<Scalars['String']>;
  refresh_token?: Maybe<Scalars['String']>;
  registered?: Maybe<Scalars['Boolean']>;
  resetToken?: Maybe<Scalars['String']>;
  resetTokenValidity?: Maybe<Scalars['DateTime']>;
  reset_token?: Maybe<Scalars['String']>;
  reset_token_validity?: Maybe<Scalars['DateTime']>;
  signUpData?: Maybe<Scalars['JSON']>;
  stripeCustomerDetails?: Maybe<StripeCustomerDetails>;
  tooltipsStatus?: Maybe<ToolTipsStatus>;
  tooltips_status?: Maybe<ToolTipsStatus>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  updated_at?: Maybe<Scalars['DateTime']>;
  updated_by?: Maybe<User>;
  viewNotificationAt?: Maybe<Scalars['DateTime']>;
  viewOptions?: Maybe<Scalars['JSON']>;
  view_notification_at?: Maybe<Scalars['DateTime']>;
};

export type UserNotification = {
  __typename?: 'UserNotification';
  created_at?: Maybe<Scalars['DateTime']>;
  group?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  is_read?: Maybe<Scalars['Boolean']>;
  notification?: Maybe<Notification>;
  user?: Maybe<User>;
  user_type?: Maybe<UserNotificationType>;
  username?: Maybe<Scalars['String']>;
};

export enum UserNotificationType {
  Member = 'MEMBER',
  Pic = 'PIC'
}

export type VerificationImageUploadUrlResponse = {
  __typename?: 'VerificationImageUploadUrlResponse';
  s3Bucket?: Maybe<Scalars['String']>;
  s3Key?: Maybe<Scalars['String']>;
  s3_bucket?: Maybe<Scalars['String']>;
  s3_key?: Maybe<Scalars['String']>;
  uploadUrl?: Maybe<Scalars['String']>;
  upload_url?: Maybe<Scalars['String']>;
};

/** Once voided, cannot be unvoided */
export type VoidInvoiceInput = {
  invoiceId: Scalars['ID'];
};

export type WeeklyTimesheetFilterOptions = {
  companyMemberId?: Maybe<Scalars['ID']>;
  taskId?: Maybe<Scalars['ID']>;
  week: Scalars['Int'];
  year: Scalars['Int'];
};

export enum WorkDay {
  Friday = 'FRIDAY',
  Monday = 'MONDAY',
  Saturday = 'SATURDAY',
  Sunday = 'SUNDAY',
  Thursday = 'THURSDAY',
  Tuesday = 'TUESDAY',
  Wednesday = 'WEDNESDAY'
}

export type WorkHourTotals = {
  __typename?: 'WorkHourTotals';
  overtime?: Maybe<Scalars['Int']>;
  regular?: Maybe<Scalars['Int']>;
  tracked?: Maybe<Scalars['Int']>;
  worked?: Maybe<Scalars['Int']>;
};

export type Workspace = {
  __typename?: 'Workspace';
  bgColor?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<User>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  projects?: Maybe<Array<Maybe<TaskBoard>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedBy?: Maybe<User>;
  visibility?: Maybe<CommonVisibility>;
  visibilityWhitelist?: Maybe<CommonVisibilityWhitelist>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ActivityDaySummary: ResolverTypeWrapper<ActivityTrackerDailyModel>;
  ActivityMonthSummary: ResolverTypeWrapper<ActivityTrackerActualMonthlyModel>;
  ActivityWeekSummary: ResolverTypeWrapper<ActivityTrackerWeeklyModel>;
  AddCompanyTeamStatusInput: AddCompanyTeamStatusInput;
  AddCustomValueToTaskInput: AddCustomValueToTaskInput;
  AddMemberToCompanyInput: AddMemberToCompanyInput;
  AddMembersToContactGroupInput: AddMembersToContactGroupInput;
  AddPackageInput: AddPackageInput;
  AddTaskWatchersInput: AddTaskWatchersInput;
  AddToProjectVisibilityWhitelistInput: AddToProjectVisibilityWhitelistInput;
  AddToTaskVisibilityWhitelistInput: AddToTaskVisibilityWhitelistInput;
  AddToVisibilityWhitelistInput: AddToVisibilityWhitelistInput;
  AddToWorkspaceVisibilityWhitelistInput: AddToWorkspaceVisibilityWhitelistInput;
  ApplyTaskTemplateInput: ApplyTaskTemplateInput;
  ArchiveTaskInput: ArchiveTaskInput;
  ArchivedStatus: ArchivedStatus;
  AssignMembersToCollectionInput: AssignMembersToCollectionInput;
  AssignProjectsToWorkspaceInput: AssignProjectsToWorkspaceInput;
  AssignTaskBoardsToFolderInput: AssignTaskBoardsToFolderInput;
  Attendance: ResolverTypeWrapper<AttendanceModel>;
  AttendanceDaySummary: ResolverTypeWrapper<AttendanceDailySummaryModel>;
  AttendanceDaySummaryInput: AttendanceDaySummaryInput;
  AttendanceLabel: ResolverTypeWrapper<AttendanceLabelModel>;
  AttendanceLabelInput: AttendanceLabelInput;
  AttendanceMemberStats: ResolverTypeWrapper<AttendanceMemberStats>;
  AttendanceMonthSummary: ResolverTypeWrapper<AttendanceMonthlySummaryModel>;
  AttendanceMonthSummaryInput: AttendanceMonthSummaryInput;
  AttendanceSettings: ResolverTypeWrapper<AttendanceSettingsModel>;
  AttendanceType: AttendanceType;
  AttendanceVerificationS3Object: ResolverTypeWrapper<AttendanceVerificationS3ObjectModel>;
  AttendanceVerificationType: AttendanceVerificationType;
  AttendanceWeekSummary: ResolverTypeWrapper<AttendanceWeeklySummaryModel>;
  AttendanceWeekSummaryInput: AttendanceWeekSummaryInput;
  AuditLogChangedValues: ResolverTypeWrapper<AuditLogChangedValues>;
  AuditLogValues: ResolverTypeWrapper<AuditLogValues>;
  BillingInvoice: ResolverTypeWrapper<BillingInvoiceModel>;
  BillingInvoiceItem: ResolverTypeWrapper<BillingInvoiceItemModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BreadcrumbInfo: ResolverTypeWrapper<BreadcrumbInfoModel>;
  BreadcrumbType: BreadcrumbType;
  BulkUploadContactsResponse: ResolverTypeWrapper<Omit<BulkUploadContactsResponse, 'contacts'> & { contacts?: Maybe<Array<Maybe<ResolversTypes['Contact']>>> }>;
  BulkUploadMembersResponse: ResolverTypeWrapper<Omit<BulkUploadMembersResponse, 'companyMembers'> & { companyMembers?: Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>> }>;
  CancelSubscriptionInput: CancelSubscriptionInput;
  ChangeGroupTaskInput: ChangeGroupTaskInput;
  ChangeTaskPositionInput: ChangeTaskPositionInput;
  Checklist: ResolverTypeWrapper<ChecklistModel>;
  ChecklistInput: ChecklistInput;
  ChecklistSequencesInput: ChecklistSequencesInput;
  ChecklistUpdateInput: ChecklistUpdateInput;
  CollaborationBoardInput: CollaborationBoardInput;
  Collection: ResolverTypeWrapper<CollectionModel>;
  CollectionActionType: CollectionActionType;
  CollectionActiveTypes: CollectionActiveTypes;
  CollectionActivityLog: ResolverTypeWrapper<CollectionActivityLogModel>;
  CollectionArchiveType: CollectionArchiveType;
  CollectionDraftType: CollectionDraftType;
  CollectionMessageLog: ResolverTypeWrapper<CollectionMessageLogModel>;
  CollectionMessageLogStatusTypes: CollectionMessageLogStatusTypes;
  CollectionPayment: ResolverTypeWrapper<CollectionPaymentModel>;
  CollectionPaymentStatusTypes: CollectionPaymentStatusTypes;
  CollectionPaymentTypes: CollectionPaymentTypes;
  CollectionPeriod: ResolverTypeWrapper<CollectionPeriodModel>;
  CollectionPeriodStatusTypes: CollectionPeriodStatusTypes;
  CollectionRemindIntervalTypes: CollectionRemindIntervalTypes;
  CollectionRemindOnDays: ResolverTypeWrapper<CollectionRemindOnDaysModel>;
  CollectionRemindTypes: CollectionRemindTypes;
  CollectionReminderRead: ResolverTypeWrapper<CollectionReminderReadModel>;
  CollectionStatusTypes: CollectionStatusTypes;
  CollectionTag: ResolverTypeWrapper<CollectionTagModel>;
  CollectionTagOptions: CollectionTagOptions;
  Collector: ResolverTypeWrapper<CollectorModel>;
  CollectorMember: ResolverTypeWrapper<CollectorMemberModel>;
  CommonCrud: CommonCrud;
  CommonVisibility: CommonVisibility;
  CommonVisibilityWhitelist: ResolverTypeWrapper<Omit<CommonVisibilityWhitelist, 'members' | 'teams'> & { members?: Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, teams?: Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>> }>;
  Company: ResolverTypeWrapper<CompanyModel>;
  CompanyArchivedUpdate: CompanyArchivedUpdate;
  CompanyHoliday: ResolverTypeWrapper<CompanyHolidayModel>;
  CompanyHolidayStatus: CompanyHolidayStatus;
  CompanyMember: ResolverTypeWrapper<CompanyMemberModel>;
  CompanyMemberPermissionScope: ResolverTypeWrapper<CompanyMemberPermissionScope>;
  CompanyMemberReferenceImage: ResolverTypeWrapper<CompanyMemberReferenceImageModel>;
  CompanyMemberReferenceImageResponse: ResolverTypeWrapper<CompanyMemberReferenceImageResponse>;
  CompanyMemberReferenceImageStatus: CompanyMemberReferenceImageStatus;
  CompanyMemberSettings: ResolverTypeWrapper<CompanyMemberSettings>;
  CompanyMemberType: EnumStringToNumberType;
  CompanyPaymentMethod: ResolverTypeWrapper<CompanyPaymentMethodModel>;
  CompanyPermission: ResolverTypeWrapper<CompanyPermissionModel>;
  CompanyStorageDetails: ResolverTypeWrapper<CompanyStorageDetails>;
  CompanyStorageList: ResolverTypeWrapper<CompanyStorageList>;
  CompanySubscription: ResolverTypeWrapper<CompanySubscriptionModel>;
  CompanyTeam: ResolverTypeWrapper<CompanyTeamModel>;
  CompanyTeamStatus: ResolverTypeWrapper<CompanyTeamStatusModel>;
  CompanyTeamStatusSequenceInput: CompanyTeamStatusSequenceInput;
  CompanyTeamStatusType: CompanyTeamStatusType;
  CompanyWorkDaySetting: ResolverTypeWrapper<CompanyWorkDaySettingModel>;
  Contact: ResolverTypeWrapper<ContactModel>;
  ContactActivity: ResolverTypeWrapper<Omit<ContactActivity, 'assignee' | 'attachment' | 'createdBy' | 'created_by' | 'pic' | 'task'> & { assignee?: Maybe<ResolversTypes['CompanyMember']>, attachment?: Maybe<ResolversTypes['TaskAttachment']>, createdBy?: Maybe<ResolversTypes['User']>, created_by?: Maybe<ResolversTypes['User']>, pic?: Maybe<ResolversTypes['ContactPic']>, task?: Maybe<ResolversTypes['Task']> }>;
  ContactActivityRaw: ResolverTypeWrapper<ContactActivitiesModel>;
  ContactActivityTableType: ContactActivityTableType;
  ContactActivityType: ContactActivityType;
  ContactGroup: ResolverTypeWrapper<ContactGroupModel>;
  ContactGroupType: ContactGroupType;
  ContactNote: ResolverTypeWrapper<ContactNoteModel>;
  ContactNoteInput: ContactNoteInput;
  ContactPic: ResolverTypeWrapper<ContactPicModel>;
  ContactTag: ResolverTypeWrapper<ContactTagModel>;
  ContactTagOptions: ContactTagOptions;
  ContactTask: ResolverTypeWrapper<ContactTaskModel>;
  ContactTaskStatusType: ContactTaskStatusType;
  ContactType: ContactType;
  CopyProjectInput: CopyProjectInput;
  CopyTaskInput: CopyTaskInput;
  CopyTasksInput: CopyTasksInput;
  CreateBillingInvoiceInput: CreateBillingInvoiceInput;
  CreateBillingInvoiceItemInput: CreateBillingInvoiceItemInput;
  CreateCollectionInput: CreateCollectionInput;
  CreateCollectionPaymentInput: CreateCollectionPaymentInput;
  CreateCollectorInput: CreateCollectorInput;
  CreateCompanyHolidayInput: CreateCompanyHolidayInput;
  CreateCompanyInput: CreateCompanyInput;
  CreateCompanyPaymentMethodInput: CreateCompanyPaymentMethodInput;
  CreateCompanyTeamInput: CreateCompanyTeamInput;
  CreateContactGroupInput: CreateContactGroupInput;
  CreateContactInput: CreateContactInput;
  CreateContactPicInput: CreateContactPicInput;
  CreateCustomColumnForGroupInput: CreateCustomColumnForGroupInput;
  CreateCustomTimesheetApprovalInput: CreateCustomTimesheetApprovalInput;
  CreateCustomTimesheetApprovalsInput: CreateCustomTimesheetApprovalsInput;
  CreateLocationInput: CreateLocationInput;
  CreateProjectGroupInput: CreateProjectGroupInput;
  CreateProjectInput: CreateProjectInput;
  CreateProjectStatusInput: CreateProjectStatusInput;
  CreateProjectTemplateStatusInput: CreateProjectTemplateStatusInput;
  CreateSubscriptionInput: CreateSubscriptionInput;
  CreateSubscriptionPackageInput: CreateSubscriptionPackageInput;
  CreateSubscriptionPriceInput: CreateSubscriptionPriceInput;
  CreateSubscriptionProductInput: CreateSubscriptionProductInput;
  CreateTagGroupInput: CreateTagGroupInput;
  CreateTagInput: CreateTagInput;
  CreateTaskBoardFolderInput: CreateTaskBoardFolderInput;
  CreateTaskTemplateInput: CreateTaskTemplateInput;
  CreateTimesheetApprovalInput: CreateTimesheetApprovalInput;
  CreateTimesheetApprovalsInput: CreateTimesheetApprovalsInput;
  CreateWorkspaceInput: CreateWorkspaceInput;
  CustomTimesheetApprovalInput: CustomTimesheetApprovalInput;
  CustomTimesheetDayApproval: ResolverTypeWrapper<TimesheetDayCustomApprovalModel>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DateRangeFilter: DateRangeFilter;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DayTimesheetFilterOptions: DayTimesheetFilterOptions;
  DeleteCollectorInput: DeleteCollectorInput;
  DeleteCompanyPaymentMethodInput: DeleteCompanyPaymentMethodInput;
  DeleteCompanyPaymentMethodResponse: ResolverTypeWrapper<DeleteCompanyPaymentMethodResponse>;
  DeleteContactPicResponse: ResolverTypeWrapper<Omit<DeleteContactPicResponse, 'contact'> & { contact?: Maybe<ResolversTypes['Contact']> }>;
  DeleteCustomColumnForGroupInput: DeleteCustomColumnForGroupInput;
  DeleteCustomTimesheetApprovalInput: DeleteCustomTimesheetApprovalInput;
  DeleteCustomTimesheetApprovalsInput: DeleteCustomTimesheetApprovalsInput;
  DeleteCustomValueFromTaskInput: DeleteCustomValueFromTaskInput;
  DeletePaymentProofInput: DeletePaymentProofInput;
  DeleteProjectGroupInput: DeleteProjectGroupInput;
  DeleteProjectStatusInput: DeleteProjectStatusInput;
  DeleteProjectTemplateIdsInput: DeleteProjectTemplateIdsInput;
  DeleteProjectsInput: DeleteProjectsInput;
  DeleteTemplateInput: DeleteTemplateInput;
  DeleteTimesheetDaysInput: DeleteTimesheetDaysInput;
  DeleteWorkspacesInput: DeleteWorkspacesInput;
  DiscountedPrice: ResolverTypeWrapper<Omit<DiscountedPrice, 'package'> & { package?: Maybe<ResolversTypes['SubscriptionPackage']> }>;
  DowngradeSubscriptionInput: DowngradeSubscriptionInput;
  DowngradeSubscriptionPackageProductsInput: DowngradeSubscriptionPackageProductsInput;
  DuplicateTasksInput: DuplicateTasksInput;
  EditCustomColumnForGroupInput: EditCustomColumnForGroupInput;
  EditProjectGroupInput: EditProjectGroupInput;
  EditTaskCommentInput: EditTaskCommentInput;
  EmployeeType: ResolverTypeWrapper<EmployeeTypeModel>;
  ExternalAttachmentInput: ExternalAttachmentInput;
  ExternalFileSource: ExternalFileSource;
  FilterOptions: ResolverTypeWrapper<FilterOptionsModel>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  GetAttendancesInput: GetAttendancesInput;
  GroupQuery: GroupQuery;
  GroupTaskQuery: GroupTaskQuery;
  Holiday: ResolverTypeWrapper<HolidayModel>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ImageGroup: ResolverTypeWrapper<ImageGroupModel>;
  ImportTasksInput: ImportTasksInput;
  ImportTasksResponse: ResolverTypeWrapper<Omit<ImportTasksResponse, 'tasks'> & { tasks?: Maybe<Array<ResolversTypes['Task']>> }>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Latitude: ResolverTypeWrapper<Scalars['Latitude']>;
  LinkAttachmentToCommentInput: LinkAttachmentToCommentInput;
  LinkExternalAttachmentsInput: LinkExternalAttachmentsInput;
  Location: ResolverTypeWrapper<LocationModel>;
  Longitude: ResolverTypeWrapper<Scalars['Longitude']>;
  MonthlyActivityTracking: ResolverTypeWrapper<ActivityTrackerMonthlyModel>;
  MonthlyTimesheetFilterOptions: MonthlyTimesheetFilterOptions;
  MoveProjectsToWorkspaceInput: MoveProjectsToWorkspaceInput;
  MoveTaskToMemberInput: MoveTaskToMemberInput;
  MoveTasksInput: MoveTasksInput;
  Mutation: ResolverTypeWrapper<{}>;
  Notification: ResolverTypeWrapper<NotificationModel>;
  NotificationGroups: NotificationGroups;
  NotificationType: NotificationType;
  NotificationTypeInput: NotificationTypeInput;
  PackageTypes: PackageTypes;
  PaginatedProjectClaims: ResolverTypeWrapper<Omit<PaginatedProjectClaims, 'projectClaims'> & { projectClaims?: Maybe<Array<Maybe<ResolversTypes['ProjectClaim']>>> }>;
  PaginatedProjectInvoices: ResolverTypeWrapper<Omit<PaginatedProjectInvoices, 'projectInvoices'> & { projectInvoices?: Maybe<Array<Maybe<ResolversTypes['ProjectInvoice']>>> }>;
  PaginatedProjectTimeCosts: ResolverTypeWrapper<Omit<PaginatedProjectTimeCosts, 'projectTimeCosts'> & { projectTimeCosts?: Maybe<Array<Maybe<ResolversTypes['ProjectTimeCost']>>> }>;
  PaginatedSharedWithMeTasks: ResolverTypeWrapper<Omit<PaginatedSharedWithMeTasks, 'tasks'> & { tasks?: Maybe<Array<Maybe<ResolversTypes['Task']>>> }>;
  PaginatedTaskBoards: ResolverTypeWrapper<Omit<PaginatedTaskBoards, 'taskBoards'> & { taskBoards?: Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>> }>;
  PaginatedTasks: ResolverTypeWrapper<Omit<PaginatedTasks, 'tasks'> & { tasks?: Maybe<Array<Maybe<ResolversTypes['Task']>>> }>;
  Pagination: Pagination;
  PaginationFilter: ResolverTypeWrapper<PaginationFilter>;
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>;
  PaymentMethodCard: ResolverTypeWrapper<PaymentMethodCard>;
  PersonalStatusType: PersonalStatusType;
  PersonalTaskUpdateInput: PersonalTaskUpdateInput;
  PostCommentInput: PostCommentInput;
  ProductInCoupon: ResolverTypeWrapper<ProductInCoupon>;
  ProjectClaim: ResolverTypeWrapper<ProjectClaimModel>;
  ProjectClaimDeleteInput: ProjectClaimDeleteInput;
  ProjectClaimEditInput: ProjectClaimEditInput;
  ProjectClaimFilter: ProjectClaimFilter;
  ProjectClaimInput: ProjectClaimInput;
  ProjectClaimSort: ProjectClaimSort;
  ProjectClaimSortType: ProjectClaimSortType;
  ProjectClaimType: ProjectClaimType;
  ProjectGroup: ResolverTypeWrapper<ProjectGroupModel>;
  ProjectGroupCustomAttribute: ResolverTypeWrapper<ProjectGroupCustomAttributeModel>;
  ProjectGroupCustomAttributeType: ProjectGroupCustomAttributeType;
  ProjectGroupCustomColumn: ResolverTypeWrapper<ProjectGroupCustomColumnModel>;
  ProjectInvoice: ResolverTypeWrapper<ProjectInvoiceModel>;
  ProjectInvoiceDeleteInput: ProjectInvoiceDeleteInput;
  ProjectInvoiceEditInput: ProjectInvoiceEditInput;
  ProjectInvoiceFilter: ProjectInvoiceFilter;
  ProjectInvoiceInput: ProjectInvoiceInput;
  ProjectInvoiceSort: ProjectInvoiceSort;
  ProjectInvoiceSortType: ProjectInvoiceSortType;
  ProjectSettings: ResolverTypeWrapper<ProjectSettingsModel>;
  ProjectSettingsEditInput: ProjectSettingsEditInput;
  ProjectStatus: ResolverTypeWrapper<ProjectStatusModel>;
  ProjectStatusEditInput: ProjectStatusEditInput;
  ProjectTemplate: ResolverTypeWrapper<ProjectTemplateModel>;
  ProjectTemplateEditInput: ProjectTemplateEditInput;
  ProjectTemplateGallery: ResolverTypeWrapper<ProjectTemplateGalleryModel>;
  ProjectTemplateInput: ProjectTemplateInput;
  ProjectTemplateOptions: ProjectTemplateOptions;
  ProjectTemplateStatus: ResolverTypeWrapper<ProjectTemplateStatusModel>;
  ProjectTemplateStatusEditInput: ProjectTemplateStatusEditInput;
  ProjectTemplateStatusIdsInput: ProjectTemplateStatusIdsInput;
  ProjectTemplateStatusInput: ProjectTemplateStatusInput;
  ProjectTimeCost: ResolverTypeWrapper<ProjectTimeCostModel>;
  ProjectTimeCostDeleteInput: ProjectTimeCostDeleteInput;
  ProjectTimeCostEditInput: ProjectTimeCostEditInput;
  ProjectTimeCostFilter: ProjectTimeCostFilter;
  ProjectTimeCostInput: ProjectTimeCostInput;
  ProjectTimeCostSort: ProjectTimeCostSort;
  ProjectTimeCostSortType: ProjectTimeCostSortType;
  ProjectUpdateInput: ProjectUpdateInput;
  ProjectVisibility: ProjectVisibility;
  PublicHoliday: ResolverTypeWrapper<PublicHolidayModel>;
  Query: ResolverTypeWrapper<{}>;
  ReceivePaymentInvoiceInput: ReceivePaymentInvoiceInput;
  ReminderStatus: ResolverTypeWrapper<Omit<ReminderStatus, 'email' | 'whatsapp'> & { email?: Maybe<ResolversTypes['ServiceHistory']>, whatsapp?: Maybe<ResolversTypes['ServiceHistory']> }>;
  ReminderStatusTypes: ReminderStatusTypes;
  RemoveFromProjectVisibilityWhitelistInput: RemoveFromProjectVisibilityWhitelistInput;
  RemoveFromTaskVisibilityWhitelistInput: RemoveFromTaskVisibilityWhitelistInput;
  RemoveFromVisibilityWhitelistInput: RemoveFromVisibilityWhitelistInput;
  RemoveFromWorkspaceVisibilityWhitelistInput: RemoveFromWorkspaceVisibilityWhitelistInput;
  RemoveMembersFromCollectionInput: RemoveMembersFromCollectionInput;
  RemoveProjectsFromWorkspaceInput: RemoveProjectsFromWorkspaceInput;
  RemoveTaskBoardsFromFolderInput: RemoveTaskBoardsFromFolderInput;
  RemoveTaskWatchersInput: RemoveTaskWatchersInput;
  ReorderGroupInput: ReorderGroupInput;
  ReorderedGroup: ReorderedGroup;
  RequestAccountDeletionInput: RequestAccountDeletionInput;
  RequestAccountDeletionResponse: ResolverTypeWrapper<RequestAccountDeletionResponse>;
  ResourcePermission: ResolverTypeWrapper<ResourcePermissionModel>;
  ResourcePermissionInput: ResourcePermissionInput;
  ResourceType: ResourceType;
  SendInvoiceInput: SendInvoiceInput;
  ServiceHistory: ResolverTypeWrapper<CompanyServiceHistoryModel>;
  ServiceHistoryTypes: ServiceHistoryTypes;
  SetAttendanceVerificationImageInput: SetAttendanceVerificationImageInput;
  SetDefaultCompanyPaymentMethodInput: SetDefaultCompanyPaymentMethodInput;
  SetProjectVisibilityInput: SetProjectVisibilityInput;
  SetTaskBoardVisibilityInput: SetTaskBoardVisibilityInput;
  SetTaskVisibilityInput: SetTaskVisibilityInput;
  SetWorkspaceVisibilityInput: SetWorkspaceVisibilityInput;
  ShortUrl: ResolverTypeWrapper<ShortUrlModel>;
  SortDirection: SortDirection;
  StageType: StageType;
  StartAttendanceEntryInput: StartAttendanceEntryInput;
  StartSubscriptionInput: StartSubscriptionInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  StripeCoupon: ResolverTypeWrapper<StripeCouponModel>;
  StripeCouponMetaData: ResolverTypeWrapper<StripeCouponMetaData>;
  StripeCustomerDetails: ResolverTypeWrapper<StripeCustomerDetails>;
  StripeInvoice: ResolverTypeWrapper<StripeInvoice>;
  StripePromoCode: ResolverTypeWrapper<StripePromoCodeModel>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionChange: ResolverTypeWrapper<SubscriptionChangeModel>;
  SubscriptionDiscount: ResolverTypeWrapper<Omit<SubscriptionDiscount, 'coupon'> & { coupon?: Maybe<ResolversTypes['StripeCoupon']> }>;
  SubscriptionPackage: ResolverTypeWrapper<SubscriptionPackageModel>;
  SubscriptionPackagePrice: ResolverTypeWrapper<SubscriptionPackagePriceModel>;
  SubscriptionPrice: ResolverTypeWrapper<SubscriptionPriceModel>;
  SubscriptionPriceInterval: SubscriptionPriceInterval;
  SubscriptionProduct: ResolverTypeWrapper<SubscriptionProductModel>;
  SubscriptionPromoCode: ResolverTypeWrapper<SubscriptionPromoCodeModel>;
  SubscriptionQuantityResult: ResolverTypeWrapper<Omit<SubscriptionQuantityResult, 'companyMembers' | 'company_members'> & { companyMembers?: Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, company_members?: Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>> }>;
  SubscriptionStatuses: SubscriptionStatuses;
  Subtask: ResolverTypeWrapper<SubtaskModel>;
  SubtaskInput: SubtaskInput;
  SubtaskSequencesInput: SubtaskSequencesInput;
  SubtaskUpdateInput: SubtaskUpdateInput;
  SwitchSubscriptionPackageInput: SwitchSubscriptionPackageInput;
  Tag: ResolverTypeWrapper<TagModel>;
  TagGroup: ResolverTypeWrapper<TagGroupModel>;
  Task: ResolverTypeWrapper<TaskModel>;
  TaskActionType: TaskActionType;
  TaskActivity: ResolverTypeWrapper<TaskActivityModel>;
  TaskAttachment: ResolverTypeWrapper<TaskAttachmentModel>;
  TaskBoard: ResolverTypeWrapper<TaskBoardModel>;
  TaskBoardCategory: TaskBoardCategory;
  TaskBoardFilter: ResolverTypeWrapper<TaskBoardFilter>;
  TaskBoardFiltersOptions: TaskBoardFiltersOptions;
  TaskBoardFolder: ResolverTypeWrapper<TaskBoardFolderModel>;
  TaskBoardFolderType: TaskBoardFolderType;
  TaskBoardInput: TaskBoardInput;
  TaskBoardOwner: ResolverTypeWrapper<TaskBoardOwnerModel>;
  TaskBoardSort: ResolverTypeWrapper<TaskBoardSort>;
  TaskBoardSortType: TaskBoardSortType;
  TaskBoardStatusType: TaskBoardStatusType;
  TaskBoardTeam: ResolverTypeWrapper<TaskBoardTeamModel>;
  TaskBoardTeamDeleteInput: TaskBoardTeamDeleteInput;
  TaskBoardTeamInput: TaskBoardTeamInput;
  TaskBoardType: TaskBoardType;
  TaskBoardUpdateInput: TaskBoardUpdateInput;
  TaskBoardVisibility: ResolverTypeWrapper<TaskBoardVisibilityModel>;
  TaskBoardVisibilityWhitelist: ResolverTypeWrapper<Omit<TaskBoardVisibilityWhitelist, 'members' | 'teams'> & { members?: Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, teams?: Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>> }>;
  TaskComment: ResolverTypeWrapper<TaskCommentModel>;
  TaskCommentInput: TaskCommentInput;
  TaskCommentUpdateInput: TaskCommentUpdateInput;
  TaskCustomValue: ResolverTypeWrapper<TaskCustomValueModel>;
  TaskDeleteInput: TaskDeleteInput;
  TaskDueRemindersType: TaskDueRemindersType;
  TaskFilter: ResolverTypeWrapper<TaskFilter>;
  TaskFilterOptions: TaskFilterOptions;
  TaskInput: TaskInput;
  TaskMember: ResolverTypeWrapper<TaskMemberModel>;
  TaskMemberFilter: TaskMemberFilter;
  TaskMemberInput: TaskMemberInput;
  TaskPersonalInput: TaskPersonalInput;
  TaskPic: ResolverTypeWrapper<TaskPicModel>;
  TaskPicInput: TaskPicInput;
  TaskPicsInput: TaskPicsInput;
  TaskPriorityType: TaskPriorityType;
  TaskQueryTotalRate: TaskQueryTotalRate;
  TaskSequenceInput: TaskSequenceInput;
  TaskSort: ResolverTypeWrapper<TaskSort>;
  TaskSortType: TaskSortType;
  TaskTag: ResolverTypeWrapper<TaskTagModel>;
  TaskTagOptions: TaskTagOptions;
  TaskTemplate: ResolverTypeWrapper<TaskTemplateModel>;
  TaskTemplateAttachment: ResolverTypeWrapper<TaskTemplateAttachmentModel>;
  TaskTemplateItem: ResolverTypeWrapper<TaskTemplateItemModel>;
  TaskTemplateRecurringSetting: ResolverTypeWrapper<TaskTemplateRecurringSettingModel>;
  TaskTimerEntry: ResolverTypeWrapper<TaskTimerEntryModel>;
  TaskTimerTotal: ResolverTypeWrapper<TaskTimerTotalModel>;
  TaskType: TaskType;
  TaskUpdateInput: TaskUpdateInput;
  TaskVisibilityType: TaskVisibilityType;
  TaskWatcher: ResolverTypeWrapper<TaskWatcherModel>;
  TeamStatusFilter: TeamStatusFilter;
  Template: ResolverTypeWrapper<TemplateModel>;
  TemplateType: TemplateType;
  Timesheet: ResolverTypeWrapper<TimesheetModel>;
  TimesheetActivity: ResolverTypeWrapper<TimesheetActivityModel>;
  TimesheetApprovalInput: TimesheetApprovalInput;
  TimesheetApprovalStatus: TimesheetApprovalStatus;
  TimesheetArchiveStatus: TimesheetArchiveStatus;
  TimesheetDayApproval: ResolverTypeWrapper<TimesheetDayApprovalModel>;
  TimesheetDaysInput: TimesheetDaysInput;
  TimesheetEntryInput: TimesheetEntryInput;
  TimesheetFilterOptions: TimesheetFilterOptions;
  ToggleEnabledCustomColumnInput: ToggleEnabledCustomColumnInput;
  ToolTipsStatus: ResolverTypeWrapper<ToolTipsStatus>;
  TotalNotificationCount: ResolverTypeWrapper<TotalNotificationCount>;
  TotalTimesheetApproval: ResolverTypeWrapper<TotalTimesheetApproval>;
  UnarchiveTaskInput: UnarchiveTaskInput;
  UnreadCount: ResolverTypeWrapper<UnreadCount>;
  UpdateAttendanceSettingsInput: UpdateAttendanceSettingsInput;
  UpdateBillingInvoiceInput: UpdateBillingInvoiceInput;
  UpdateBillingInvoiceItemInput: UpdateBillingInvoiceItemInput;
  UpdateCollectionInput: UpdateCollectionInput;
  UpdateCollectionPaymentTypeInput: UpdateCollectionPaymentTypeInput;
  UpdateCollectorInput: UpdateCollectorInput;
  UpdateCompanyHolidayInput: UpdateCompanyHolidayInput;
  UpdateCompanyInfoInput: UpdateCompanyInfoInput;
  UpdateCompanyMemberInfoInput: UpdateCompanyMemberInfoInput;
  UpdateCompanyPermissionsInput: UpdateCompanyPermissionsInput;
  UpdateCompanyTeamInfoInput: UpdateCompanyTeamInfoInput;
  UpdateCompanyTeamStatusInput: UpdateCompanyTeamStatusInput;
  UpdateCompanyWorkDayInput: UpdateCompanyWorkDayInput;
  UpdateContactGroupInput: UpdateContactGroupInput;
  UpdateContactInput: UpdateContactInput;
  UpdateContactPicInput: UpdateContactPicInput;
  UpdateCrudInput: UpdateCrudInput;
  UpdateCustomTimesheetApprovalInput: UpdateCustomTimesheetApprovalInput;
  UpdateLocationInput: UpdateLocationInput;
  UpdatePaymentStatusInput: UpdatePaymentStatusInput;
  UpdateProfileInput: UpdateProfileInput;
  UpdateProjectsArchivedStateInput: UpdateProjectsArchivedStateInput;
  UpdateSubscriptionPackageProductsInput: UpdateSubscriptionPackageProductsInput;
  UpdateSubscriptionProductInput: UpdateSubscriptionProductInput;
  UpdateTagGroupInput: UpdateTagGroupInput;
  UpdateTagInput: UpdateTagInput;
  UpdateTaskBoardFolderInput: UpdateTaskBoardFolderInput;
  UpdateTaskBoardsArchivedStateInput: UpdateTaskBoardsArchivedStateInput;
  UpdateTaskParentInput: UpdateTaskParentInput;
  UpdateTaskParentResponse: ResolverTypeWrapper<Omit<UpdateTaskParentResponse, 'destinationTask' | 'sourceTask'> & { destinationTask: ResolversTypes['Task'], sourceTask: ResolversTypes['Task'] }>;
  UpdateTaskTemplateInput: UpdateTaskTemplateInput;
  UpdateTimesheetApprovalInput: UpdateTimesheetApprovalInput;
  UpdateTimesheetInput: UpdateTimesheetInput;
  UpdateToolTipsStatusInput: UpdateToolTipsStatusInput;
  UpdateUserNameInput: UpdateUserNameInput;
  UpdateWorkspaceInput: UpdateWorkspaceInput;
  UpgradeSubscriptionInput: UpgradeSubscriptionInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
  UploadMemberReferenceImageInput: UploadMemberReferenceImageInput;
  UploadPaymentReceiptInput: UploadPaymentReceiptInput;
  User: ResolverTypeWrapper<UserModel>;
  UserNotification: ResolverTypeWrapper<UserNotificationModel>;
  UserNotificationType: UserNotificationType;
  VerificationImageUploadUrlResponse: ResolverTypeWrapper<VerificationImageUploadUrlResponse>;
  VoidInvoiceInput: VoidInvoiceInput;
  WeeklyTimesheetFilterOptions: WeeklyTimesheetFilterOptions;
  WorkDay: WorkDay;
  WorkHourTotals: ResolverTypeWrapper<WorkHourTotals>;
  Workspace: ResolverTypeWrapper<WorkspaceModel>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ActivityDaySummary: ActivityTrackerDailyModel;
  ActivityMonthSummary: ActivityTrackerActualMonthlyModel;
  ActivityWeekSummary: ActivityTrackerWeeklyModel;
  AddCompanyTeamStatusInput: AddCompanyTeamStatusInput;
  AddCustomValueToTaskInput: AddCustomValueToTaskInput;
  AddMemberToCompanyInput: AddMemberToCompanyInput;
  AddMembersToContactGroupInput: AddMembersToContactGroupInput;
  AddPackageInput: AddPackageInput;
  AddTaskWatchersInput: AddTaskWatchersInput;
  AddToProjectVisibilityWhitelistInput: AddToProjectVisibilityWhitelistInput;
  AddToTaskVisibilityWhitelistInput: AddToTaskVisibilityWhitelistInput;
  AddToVisibilityWhitelistInput: AddToVisibilityWhitelistInput;
  AddToWorkspaceVisibilityWhitelistInput: AddToWorkspaceVisibilityWhitelistInput;
  ApplyTaskTemplateInput: ApplyTaskTemplateInput;
  ArchiveTaskInput: ArchiveTaskInput;
  ArchivedStatus: ArchivedStatus;
  AssignMembersToCollectionInput: AssignMembersToCollectionInput;
  AssignProjectsToWorkspaceInput: AssignProjectsToWorkspaceInput;
  AssignTaskBoardsToFolderInput: AssignTaskBoardsToFolderInput;
  Attendance: AttendanceModel;
  AttendanceDaySummary: AttendanceDailySummaryModel;
  AttendanceDaySummaryInput: AttendanceDaySummaryInput;
  AttendanceLabel: AttendanceLabelModel;
  AttendanceLabelInput: AttendanceLabelInput;
  AttendanceMemberStats: AttendanceMemberStats;
  AttendanceMonthSummary: AttendanceMonthlySummaryModel;
  AttendanceMonthSummaryInput: AttendanceMonthSummaryInput;
  AttendanceSettings: AttendanceSettingsModel;
  AttendanceVerificationS3Object: AttendanceVerificationS3ObjectModel;
  AttendanceWeekSummary: AttendanceWeeklySummaryModel;
  AttendanceWeekSummaryInput: AttendanceWeekSummaryInput;
  AuditLogChangedValues: AuditLogChangedValues;
  AuditLogValues: AuditLogValues;
  BillingInvoice: BillingInvoiceModel;
  BillingInvoiceItem: BillingInvoiceItemModel;
  Boolean: Scalars['Boolean'];
  BreadcrumbInfo: BreadcrumbInfoModel;
  BulkUploadContactsResponse: Omit<BulkUploadContactsResponse, 'contacts'> & { contacts?: Maybe<Array<Maybe<ResolversParentTypes['Contact']>>> };
  BulkUploadMembersResponse: Omit<BulkUploadMembersResponse, 'companyMembers'> & { companyMembers?: Maybe<Array<Maybe<ResolversParentTypes['CompanyMember']>>> };
  CancelSubscriptionInput: CancelSubscriptionInput;
  ChangeGroupTaskInput: ChangeGroupTaskInput;
  ChangeTaskPositionInput: ChangeTaskPositionInput;
  Checklist: ChecklistModel;
  ChecklistInput: ChecklistInput;
  ChecklistSequencesInput: ChecklistSequencesInput;
  ChecklistUpdateInput: ChecklistUpdateInput;
  CollaborationBoardInput: CollaborationBoardInput;
  Collection: CollectionModel;
  CollectionActivityLog: CollectionActivityLogModel;
  CollectionMessageLog: CollectionMessageLogModel;
  CollectionPayment: CollectionPaymentModel;
  CollectionPeriod: CollectionPeriodModel;
  CollectionRemindOnDays: CollectionRemindOnDaysModel;
  CollectionReminderRead: CollectionReminderReadModel;
  CollectionTag: CollectionTagModel;
  CollectionTagOptions: CollectionTagOptions;
  Collector: CollectorModel;
  CollectorMember: CollectorMemberModel;
  CommonCrud: CommonCrud;
  CommonVisibilityWhitelist: Omit<CommonVisibilityWhitelist, 'members' | 'teams'> & { members?: Maybe<Array<Maybe<ResolversParentTypes['CompanyMember']>>>, teams?: Maybe<Array<Maybe<ResolversParentTypes['CompanyTeam']>>> };
  Company: CompanyModel;
  CompanyHoliday: CompanyHolidayModel;
  CompanyMember: CompanyMemberModel;
  CompanyMemberPermissionScope: CompanyMemberPermissionScope;
  CompanyMemberReferenceImage: CompanyMemberReferenceImageModel;
  CompanyMemberReferenceImageResponse: CompanyMemberReferenceImageResponse;
  CompanyMemberSettings: CompanyMemberSettings;
  CompanyPaymentMethod: CompanyPaymentMethodModel;
  CompanyPermission: CompanyPermissionModel;
  CompanyStorageDetails: CompanyStorageDetails;
  CompanyStorageList: CompanyStorageList;
  CompanySubscription: CompanySubscriptionModel;
  CompanyTeam: CompanyTeamModel;
  CompanyTeamStatus: CompanyTeamStatusModel;
  CompanyTeamStatusSequenceInput: CompanyTeamStatusSequenceInput;
  CompanyWorkDaySetting: CompanyWorkDaySettingModel;
  Contact: ContactModel;
  ContactActivity: Omit<ContactActivity, 'assignee' | 'attachment' | 'createdBy' | 'created_by' | 'pic' | 'task'> & { assignee?: Maybe<ResolversParentTypes['CompanyMember']>, attachment?: Maybe<ResolversParentTypes['TaskAttachment']>, createdBy?: Maybe<ResolversParentTypes['User']>, created_by?: Maybe<ResolversParentTypes['User']>, pic?: Maybe<ResolversParentTypes['ContactPic']>, task?: Maybe<ResolversParentTypes['Task']> };
  ContactActivityRaw: ContactActivitiesModel;
  ContactGroup: ContactGroupModel;
  ContactNote: ContactNoteModel;
  ContactNoteInput: ContactNoteInput;
  ContactPic: ContactPicModel;
  ContactTag: ContactTagModel;
  ContactTagOptions: ContactTagOptions;
  ContactTask: ContactTaskModel;
  CopyProjectInput: CopyProjectInput;
  CopyTaskInput: CopyTaskInput;
  CopyTasksInput: CopyTasksInput;
  CreateBillingInvoiceInput: CreateBillingInvoiceInput;
  CreateBillingInvoiceItemInput: CreateBillingInvoiceItemInput;
  CreateCollectionInput: CreateCollectionInput;
  CreateCollectionPaymentInput: CreateCollectionPaymentInput;
  CreateCollectorInput: CreateCollectorInput;
  CreateCompanyHolidayInput: CreateCompanyHolidayInput;
  CreateCompanyInput: CreateCompanyInput;
  CreateCompanyPaymentMethodInput: CreateCompanyPaymentMethodInput;
  CreateCompanyTeamInput: CreateCompanyTeamInput;
  CreateContactGroupInput: CreateContactGroupInput;
  CreateContactInput: CreateContactInput;
  CreateContactPicInput: CreateContactPicInput;
  CreateCustomColumnForGroupInput: CreateCustomColumnForGroupInput;
  CreateCustomTimesheetApprovalInput: CreateCustomTimesheetApprovalInput;
  CreateCustomTimesheetApprovalsInput: CreateCustomTimesheetApprovalsInput;
  CreateLocationInput: CreateLocationInput;
  CreateProjectGroupInput: CreateProjectGroupInput;
  CreateProjectInput: CreateProjectInput;
  CreateProjectStatusInput: CreateProjectStatusInput;
  CreateProjectTemplateStatusInput: CreateProjectTemplateStatusInput;
  CreateSubscriptionInput: CreateSubscriptionInput;
  CreateSubscriptionPackageInput: CreateSubscriptionPackageInput;
  CreateSubscriptionPriceInput: CreateSubscriptionPriceInput;
  CreateSubscriptionProductInput: CreateSubscriptionProductInput;
  CreateTagGroupInput: CreateTagGroupInput;
  CreateTagInput: CreateTagInput;
  CreateTaskBoardFolderInput: CreateTaskBoardFolderInput;
  CreateTaskTemplateInput: CreateTaskTemplateInput;
  CreateTimesheetApprovalInput: CreateTimesheetApprovalInput;
  CreateTimesheetApprovalsInput: CreateTimesheetApprovalsInput;
  CreateWorkspaceInput: CreateWorkspaceInput;
  CustomTimesheetApprovalInput: CustomTimesheetApprovalInput;
  CustomTimesheetDayApproval: TimesheetDayCustomApprovalModel;
  Date: Scalars['Date'];
  DateRangeFilter: DateRangeFilter;
  DateTime: Scalars['DateTime'];
  DayTimesheetFilterOptions: DayTimesheetFilterOptions;
  DeleteCollectorInput: DeleteCollectorInput;
  DeleteCompanyPaymentMethodInput: DeleteCompanyPaymentMethodInput;
  DeleteCompanyPaymentMethodResponse: DeleteCompanyPaymentMethodResponse;
  DeleteContactPicResponse: Omit<DeleteContactPicResponse, 'contact'> & { contact?: Maybe<ResolversParentTypes['Contact']> };
  DeleteCustomColumnForGroupInput: DeleteCustomColumnForGroupInput;
  DeleteCustomTimesheetApprovalInput: DeleteCustomTimesheetApprovalInput;
  DeleteCustomTimesheetApprovalsInput: DeleteCustomTimesheetApprovalsInput;
  DeleteCustomValueFromTaskInput: DeleteCustomValueFromTaskInput;
  DeletePaymentProofInput: DeletePaymentProofInput;
  DeleteProjectGroupInput: DeleteProjectGroupInput;
  DeleteProjectStatusInput: DeleteProjectStatusInput;
  DeleteProjectTemplateIdsInput: DeleteProjectTemplateIdsInput;
  DeleteProjectsInput: DeleteProjectsInput;
  DeleteTemplateInput: DeleteTemplateInput;
  DeleteTimesheetDaysInput: DeleteTimesheetDaysInput;
  DeleteWorkspacesInput: DeleteWorkspacesInput;
  DiscountedPrice: Omit<DiscountedPrice, 'package'> & { package?: Maybe<ResolversParentTypes['SubscriptionPackage']> };
  DowngradeSubscriptionInput: DowngradeSubscriptionInput;
  DowngradeSubscriptionPackageProductsInput: DowngradeSubscriptionPackageProductsInput;
  DuplicateTasksInput: DuplicateTasksInput;
  EditCustomColumnForGroupInput: EditCustomColumnForGroupInput;
  EditProjectGroupInput: EditProjectGroupInput;
  EditTaskCommentInput: EditTaskCommentInput;
  EmployeeType: EmployeeTypeModel;
  ExternalAttachmentInput: ExternalAttachmentInput;
  FilterOptions: FilterOptionsModel;
  Float: Scalars['Float'];
  GetAttendancesInput: GetAttendancesInput;
  GroupQuery: GroupQuery;
  GroupTaskQuery: GroupTaskQuery;
  Holiday: HolidayModel;
  ID: Scalars['ID'];
  ImageGroup: ImageGroupModel;
  ImportTasksInput: ImportTasksInput;
  ImportTasksResponse: Omit<ImportTasksResponse, 'tasks'> & { tasks?: Maybe<Array<ResolversParentTypes['Task']>> };
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  Latitude: Scalars['Latitude'];
  LinkAttachmentToCommentInput: LinkAttachmentToCommentInput;
  LinkExternalAttachmentsInput: LinkExternalAttachmentsInput;
  Location: LocationModel;
  Longitude: Scalars['Longitude'];
  MonthlyActivityTracking: ActivityTrackerMonthlyModel;
  MonthlyTimesheetFilterOptions: MonthlyTimesheetFilterOptions;
  MoveProjectsToWorkspaceInput: MoveProjectsToWorkspaceInput;
  MoveTaskToMemberInput: MoveTaskToMemberInput;
  MoveTasksInput: MoveTasksInput;
  Mutation: {};
  Notification: NotificationModel;
  NotificationTypeInput: NotificationTypeInput;
  PaginatedProjectClaims: Omit<PaginatedProjectClaims, 'projectClaims'> & { projectClaims?: Maybe<Array<Maybe<ResolversParentTypes['ProjectClaim']>>> };
  PaginatedProjectInvoices: Omit<PaginatedProjectInvoices, 'projectInvoices'> & { projectInvoices?: Maybe<Array<Maybe<ResolversParentTypes['ProjectInvoice']>>> };
  PaginatedProjectTimeCosts: Omit<PaginatedProjectTimeCosts, 'projectTimeCosts'> & { projectTimeCosts?: Maybe<Array<Maybe<ResolversParentTypes['ProjectTimeCost']>>> };
  PaginatedSharedWithMeTasks: Omit<PaginatedSharedWithMeTasks, 'tasks'> & { tasks?: Maybe<Array<Maybe<ResolversParentTypes['Task']>>> };
  PaginatedTaskBoards: Omit<PaginatedTaskBoards, 'taskBoards'> & { taskBoards?: Maybe<Array<Maybe<ResolversParentTypes['TaskBoard']>>> };
  PaginatedTasks: Omit<PaginatedTasks, 'tasks'> & { tasks?: Maybe<Array<Maybe<ResolversParentTypes['Task']>>> };
  Pagination: Pagination;
  PaginationFilter: PaginationFilter;
  PaymentMethod: PaymentMethod;
  PaymentMethodCard: PaymentMethodCard;
  PersonalTaskUpdateInput: PersonalTaskUpdateInput;
  PostCommentInput: PostCommentInput;
  ProductInCoupon: ProductInCoupon;
  ProjectClaim: ProjectClaimModel;
  ProjectClaimDeleteInput: ProjectClaimDeleteInput;
  ProjectClaimEditInput: ProjectClaimEditInput;
  ProjectClaimFilter: ProjectClaimFilter;
  ProjectClaimInput: ProjectClaimInput;
  ProjectClaimSort: ProjectClaimSort;
  ProjectGroup: ProjectGroupModel;
  ProjectGroupCustomAttribute: ProjectGroupCustomAttributeModel;
  ProjectGroupCustomColumn: ProjectGroupCustomColumnModel;
  ProjectInvoice: ProjectInvoiceModel;
  ProjectInvoiceDeleteInput: ProjectInvoiceDeleteInput;
  ProjectInvoiceEditInput: ProjectInvoiceEditInput;
  ProjectInvoiceFilter: ProjectInvoiceFilter;
  ProjectInvoiceInput: ProjectInvoiceInput;
  ProjectInvoiceSort: ProjectInvoiceSort;
  ProjectSettings: ProjectSettingsModel;
  ProjectSettingsEditInput: ProjectSettingsEditInput;
  ProjectStatus: ProjectStatusModel;
  ProjectStatusEditInput: ProjectStatusEditInput;
  ProjectTemplate: ProjectTemplateModel;
  ProjectTemplateEditInput: ProjectTemplateEditInput;
  ProjectTemplateGallery: ProjectTemplateGalleryModel;
  ProjectTemplateInput: ProjectTemplateInput;
  ProjectTemplateOptions: ProjectTemplateOptions;
  ProjectTemplateStatus: ProjectTemplateStatusModel;
  ProjectTemplateStatusEditInput: ProjectTemplateStatusEditInput;
  ProjectTemplateStatusIdsInput: ProjectTemplateStatusIdsInput;
  ProjectTemplateStatusInput: ProjectTemplateStatusInput;
  ProjectTimeCost: ProjectTimeCostModel;
  ProjectTimeCostDeleteInput: ProjectTimeCostDeleteInput;
  ProjectTimeCostEditInput: ProjectTimeCostEditInput;
  ProjectTimeCostFilter: ProjectTimeCostFilter;
  ProjectTimeCostInput: ProjectTimeCostInput;
  ProjectTimeCostSort: ProjectTimeCostSort;
  ProjectUpdateInput: ProjectUpdateInput;
  PublicHoliday: PublicHolidayModel;
  Query: {};
  ReceivePaymentInvoiceInput: ReceivePaymentInvoiceInput;
  ReminderStatus: Omit<ReminderStatus, 'email' | 'whatsapp'> & { email?: Maybe<ResolversParentTypes['ServiceHistory']>, whatsapp?: Maybe<ResolversParentTypes['ServiceHistory']> };
  RemoveFromProjectVisibilityWhitelistInput: RemoveFromProjectVisibilityWhitelistInput;
  RemoveFromTaskVisibilityWhitelistInput: RemoveFromTaskVisibilityWhitelistInput;
  RemoveFromVisibilityWhitelistInput: RemoveFromVisibilityWhitelistInput;
  RemoveFromWorkspaceVisibilityWhitelistInput: RemoveFromWorkspaceVisibilityWhitelistInput;
  RemoveMembersFromCollectionInput: RemoveMembersFromCollectionInput;
  RemoveProjectsFromWorkspaceInput: RemoveProjectsFromWorkspaceInput;
  RemoveTaskBoardsFromFolderInput: RemoveTaskBoardsFromFolderInput;
  RemoveTaskWatchersInput: RemoveTaskWatchersInput;
  ReorderGroupInput: ReorderGroupInput;
  ReorderedGroup: ReorderedGroup;
  RequestAccountDeletionInput: RequestAccountDeletionInput;
  RequestAccountDeletionResponse: RequestAccountDeletionResponse;
  ResourcePermission: ResourcePermissionModel;
  ResourcePermissionInput: ResourcePermissionInput;
  SendInvoiceInput: SendInvoiceInput;
  ServiceHistory: CompanyServiceHistoryModel;
  SetAttendanceVerificationImageInput: SetAttendanceVerificationImageInput;
  SetDefaultCompanyPaymentMethodInput: SetDefaultCompanyPaymentMethodInput;
  SetProjectVisibilityInput: SetProjectVisibilityInput;
  SetTaskBoardVisibilityInput: SetTaskBoardVisibilityInput;
  SetTaskVisibilityInput: SetTaskVisibilityInput;
  SetWorkspaceVisibilityInput: SetWorkspaceVisibilityInput;
  ShortUrl: ShortUrlModel;
  StartAttendanceEntryInput: StartAttendanceEntryInput;
  StartSubscriptionInput: StartSubscriptionInput;
  String: Scalars['String'];
  StripeCoupon: StripeCouponModel;
  StripeCouponMetaData: StripeCouponMetaData;
  StripeCustomerDetails: StripeCustomerDetails;
  StripeInvoice: StripeInvoice;
  StripePromoCode: StripePromoCodeModel;
  Subscription: {};
  SubscriptionChange: SubscriptionChangeModel;
  SubscriptionDiscount: Omit<SubscriptionDiscount, 'coupon'> & { coupon?: Maybe<ResolversParentTypes['StripeCoupon']> };
  SubscriptionPackage: SubscriptionPackageModel;
  SubscriptionPackagePrice: SubscriptionPackagePriceModel;
  SubscriptionPrice: SubscriptionPriceModel;
  SubscriptionProduct: SubscriptionProductModel;
  SubscriptionPromoCode: SubscriptionPromoCodeModel;
  SubscriptionQuantityResult: Omit<SubscriptionQuantityResult, 'companyMembers' | 'company_members'> & { companyMembers?: Maybe<Array<Maybe<ResolversParentTypes['CompanyMember']>>>, company_members?: Maybe<Array<Maybe<ResolversParentTypes['CompanyMember']>>> };
  Subtask: SubtaskModel;
  SubtaskInput: SubtaskInput;
  SubtaskSequencesInput: SubtaskSequencesInput;
  SubtaskUpdateInput: SubtaskUpdateInput;
  SwitchSubscriptionPackageInput: SwitchSubscriptionPackageInput;
  Tag: TagModel;
  TagGroup: TagGroupModel;
  Task: TaskModel;
  TaskActivity: TaskActivityModel;
  TaskAttachment: TaskAttachmentModel;
  TaskBoard: TaskBoardModel;
  TaskBoardFilter: TaskBoardFilter;
  TaskBoardFiltersOptions: TaskBoardFiltersOptions;
  TaskBoardFolder: TaskBoardFolderModel;
  TaskBoardInput: TaskBoardInput;
  TaskBoardOwner: TaskBoardOwnerModel;
  TaskBoardSort: TaskBoardSort;
  TaskBoardTeam: TaskBoardTeamModel;
  TaskBoardTeamDeleteInput: TaskBoardTeamDeleteInput;
  TaskBoardTeamInput: TaskBoardTeamInput;
  TaskBoardUpdateInput: TaskBoardUpdateInput;
  TaskBoardVisibilityWhitelist: Omit<TaskBoardVisibilityWhitelist, 'members' | 'teams'> & { members?: Maybe<Array<Maybe<ResolversParentTypes['CompanyMember']>>>, teams?: Maybe<Array<Maybe<ResolversParentTypes['CompanyTeam']>>> };
  TaskComment: TaskCommentModel;
  TaskCommentInput: TaskCommentInput;
  TaskCommentUpdateInput: TaskCommentUpdateInput;
  TaskCustomValue: TaskCustomValueModel;
  TaskDeleteInput: TaskDeleteInput;
  TaskFilter: TaskFilter;
  TaskFilterOptions: TaskFilterOptions;
  TaskInput: TaskInput;
  TaskMember: TaskMemberModel;
  TaskMemberFilter: TaskMemberFilter;
  TaskMemberInput: TaskMemberInput;
  TaskPersonalInput: TaskPersonalInput;
  TaskPic: TaskPicModel;
  TaskPicInput: TaskPicInput;
  TaskPicsInput: TaskPicsInput;
  TaskQueryTotalRate: TaskQueryTotalRate;
  TaskSequenceInput: TaskSequenceInput;
  TaskSort: TaskSort;
  TaskTag: TaskTagModel;
  TaskTagOptions: TaskTagOptions;
  TaskTemplate: TaskTemplateModel;
  TaskTemplateAttachment: TaskTemplateAttachmentModel;
  TaskTemplateItem: TaskTemplateItemModel;
  TaskTemplateRecurringSetting: TaskTemplateRecurringSettingModel;
  TaskTimerEntry: TaskTimerEntryModel;
  TaskTimerTotal: TaskTimerTotalModel;
  TaskUpdateInput: TaskUpdateInput;
  TaskWatcher: TaskWatcherModel;
  TeamStatusFilter: TeamStatusFilter;
  Template: TemplateModel;
  Timesheet: TimesheetModel;
  TimesheetActivity: TimesheetActivityModel;
  TimesheetApprovalInput: TimesheetApprovalInput;
  TimesheetDayApproval: TimesheetDayApprovalModel;
  TimesheetDaysInput: TimesheetDaysInput;
  TimesheetEntryInput: TimesheetEntryInput;
  TimesheetFilterOptions: TimesheetFilterOptions;
  ToggleEnabledCustomColumnInput: ToggleEnabledCustomColumnInput;
  ToolTipsStatus: ToolTipsStatus;
  TotalNotificationCount: TotalNotificationCount;
  TotalTimesheetApproval: TotalTimesheetApproval;
  UnarchiveTaskInput: UnarchiveTaskInput;
  UnreadCount: UnreadCount;
  UpdateAttendanceSettingsInput: UpdateAttendanceSettingsInput;
  UpdateBillingInvoiceInput: UpdateBillingInvoiceInput;
  UpdateBillingInvoiceItemInput: UpdateBillingInvoiceItemInput;
  UpdateCollectionInput: UpdateCollectionInput;
  UpdateCollectionPaymentTypeInput: UpdateCollectionPaymentTypeInput;
  UpdateCollectorInput: UpdateCollectorInput;
  UpdateCompanyHolidayInput: UpdateCompanyHolidayInput;
  UpdateCompanyInfoInput: UpdateCompanyInfoInput;
  UpdateCompanyMemberInfoInput: UpdateCompanyMemberInfoInput;
  UpdateCompanyPermissionsInput: UpdateCompanyPermissionsInput;
  UpdateCompanyTeamInfoInput: UpdateCompanyTeamInfoInput;
  UpdateCompanyTeamStatusInput: UpdateCompanyTeamStatusInput;
  UpdateCompanyWorkDayInput: UpdateCompanyWorkDayInput;
  UpdateContactGroupInput: UpdateContactGroupInput;
  UpdateContactInput: UpdateContactInput;
  UpdateContactPicInput: UpdateContactPicInput;
  UpdateCrudInput: UpdateCrudInput;
  UpdateCustomTimesheetApprovalInput: UpdateCustomTimesheetApprovalInput;
  UpdateLocationInput: UpdateLocationInput;
  UpdatePaymentStatusInput: UpdatePaymentStatusInput;
  UpdateProfileInput: UpdateProfileInput;
  UpdateProjectsArchivedStateInput: UpdateProjectsArchivedStateInput;
  UpdateSubscriptionPackageProductsInput: UpdateSubscriptionPackageProductsInput;
  UpdateSubscriptionProductInput: UpdateSubscriptionProductInput;
  UpdateTagGroupInput: UpdateTagGroupInput;
  UpdateTagInput: UpdateTagInput;
  UpdateTaskBoardFolderInput: UpdateTaskBoardFolderInput;
  UpdateTaskBoardsArchivedStateInput: UpdateTaskBoardsArchivedStateInput;
  UpdateTaskParentInput: UpdateTaskParentInput;
  UpdateTaskParentResponse: Omit<UpdateTaskParentResponse, 'destinationTask' | 'sourceTask'> & { destinationTask: ResolversParentTypes['Task'], sourceTask: ResolversParentTypes['Task'] };
  UpdateTaskTemplateInput: UpdateTaskTemplateInput;
  UpdateTimesheetApprovalInput: UpdateTimesheetApprovalInput;
  UpdateTimesheetInput: UpdateTimesheetInput;
  UpdateToolTipsStatusInput: UpdateToolTipsStatusInput;
  UpdateUserNameInput: UpdateUserNameInput;
  UpdateWorkspaceInput: UpdateWorkspaceInput;
  UpgradeSubscriptionInput: UpgradeSubscriptionInput;
  Upload: Scalars['Upload'];
  UploadMemberReferenceImageInput: UploadMemberReferenceImageInput;
  UploadPaymentReceiptInput: UploadPaymentReceiptInput;
  User: UserModel;
  UserNotification: UserNotificationModel;
  VerificationImageUploadUrlResponse: VerificationImageUploadUrlResponse;
  VoidInvoiceInput: VoidInvoiceInput;
  WeeklyTimesheetFilterOptions: WeeklyTimesheetFilterOptions;
  WorkHourTotals: WorkHourTotals;
  Workspace: WorkspaceModel;
}>;

export type ActivityDaySummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActivityDaySummary'] = ResolversParentTypes['ActivityDaySummary']> = ResolversObject<{
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ActivityMonthSummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActivityMonthSummary'] = ResolversParentTypes['ActivityMonthSummary']> = ResolversObject<{
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  week_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  week_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ActivityWeekSummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActivityWeekSummary'] = ResolversParentTypes['ActivityWeekSummary']> = ResolversObject<{
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  friday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  monday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  saturday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sunday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  thursday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total_weekly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tuesday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  wednesday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  week_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Attendance'] = ResolversParentTypes['Attendance']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  commentsOut?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments_out?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isLastOut?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  is_last_out?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['AttendanceLabel']>, ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Latitude']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Longitude']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  overtime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  s3Bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3Key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  submittedDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  submitted_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  timeTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['AttendanceType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  verificationType?: Resolver<Maybe<ResolversTypes['AttendanceVerificationType']>, ParentType, ContextType>;
  verification_type?: Resolver<Maybe<ResolversTypes['AttendanceVerificationType']>, ParentType, ContextType>;
  worked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendanceDaySummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceDaySummary'] = ResolversParentTypes['AttendanceDaySummary']> = ResolversObject<{
  attendances?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attendance']>>>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  firstAttendance?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType>;
  firstIn?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  generatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  generated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastAttendance?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  overtime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regular?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tracked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  worked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendanceLabelResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceLabel'] = ResolversParentTypes['AttendanceLabel']> = ResolversObject<{
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendanceMemberStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceMemberStats'] = ResolversParentTypes['AttendanceMemberStats']> = ResolversObject<{
  break?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  overtime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  worked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendanceMonthSummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceMonthSummary'] = ResolversParentTypes['AttendanceMonthSummary']> = ResolversObject<{
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  overtimeTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  overtime_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regularTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regular_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  trackedTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tracked_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  workedTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  worked_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendanceSettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceSettings'] = ResolversParentTypes['AttendanceSettings']> = ResolversObject<{
  allowMobile?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  allowWeb?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  allow_mobile?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  allow_web?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  enable2d?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  enableBiometric?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  enable_2d?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  enable_biometric?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requireLocation?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requireVerification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  require_location?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  require_verification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendanceWeekSummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceWeekSummary'] = ResolversParentTypes['AttendanceWeekSummary']> = ResolversObject<{
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  friday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  generatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  generated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  monday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  overtimeTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  overtime_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regularTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regular_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  saturday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sunday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  thursday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  trackedTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tracked_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tuesday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  wednesday?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  week?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  workedTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  worked_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuditLogChangedValuesResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuditLogChangedValues'] = ResolversParentTypes['AuditLogChangedValues']> = ResolversObject<{
  archive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  collectionPayment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  collection_payment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  collectorMember?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  collector_member?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  companyTeam?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  company_team?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactAddress?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactGroup?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactNo?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactPicName?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactType?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact_address?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact_group?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact_name?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact_no?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact_pic_name?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact_type?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  invoice?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isCreate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  is_create?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  markedPaid?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  marked_paid?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notifyPics?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notify_pics?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  refNo?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ref_no?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  rejectedPayment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  rejected_payment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  uploadedPayment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  uploadedReceipt?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  uploaded_payment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  uploaded_receipt?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuditLogValuesResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuditLogValues'] = ResolversParentTypes['AuditLogValues']> = ResolversObject<{
  archive?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  attachmentName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachment_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactGroupName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactPicName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_group_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_no?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_pic_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  memberName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  member_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refNo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ref_no?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  teamName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  team_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BillingInvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['BillingInvoice'] = ResolversParentTypes['BillingInvoice']> = ResolversObject<{
  contactPic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  docDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  docNo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['BillingInvoiceItem']>>>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  remarks?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  terms?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  totalDiscounted?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalReceived?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalTaxed?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  void?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  voidedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  voidedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BillingInvoiceItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['BillingInvoiceItem'] = ResolversParentTypes['BillingInvoiceItem']> = ResolversObject<{
  billed?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  billingInvoice?: Resolver<Maybe<ResolversTypes['BillingInvoice']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  descriptionHdr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discountPercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  itemName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  qty?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sequence?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  tax?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taxAmount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taxInclusive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  taxPercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unitPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  uom?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BreadcrumbInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['BreadcrumbInfo'] = ResolversParentTypes['BreadcrumbInfo']> = ResolversObject<{
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BulkUploadContactsResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkUploadContactsResponse'] = ResolversParentTypes['BulkUploadContactsResponse']> = ResolversObject<{
  contacts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Contact']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BulkUploadMembersResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkUploadMembersResponse'] = ResolversParentTypes['BulkUploadMembersResponse']> = ResolversObject<{
  companyMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  duplicateEmails?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChecklistResolvers<ContextType = any, ParentType extends ResolversParentTypes['Checklist'] = ResolversParentTypes['Checklist']> = ResolversObject<{
  checked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sequence?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Collection'] = ResolversParentTypes['Collection']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  activityLogs?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionActivityLog']>>>, ParentType, ContextType>;
  archive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  archiveAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  archive_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  assignees?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  collectionPeriods?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionPeriod']>>>, ParentType, ContextType>;
  collection_periods?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionPeriod']>>>, ParentType, ContextType>;
  collector?: Resolver<Maybe<ResolversTypes['Collector']>, ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  emailNotify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email_notify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  endMonth?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_month?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  fileName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  invoice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceFileSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  invoice_file_size?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDraft?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  is_draft?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  messageLogs?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionMessageLog']>>>, ParentType, ContextType>;
  message_logs?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionMessageLog']>>>, ParentType, ContextType>;
  notifyPics?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactPic']>>>, ParentType, ContextType>;
  notify_pics?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactPic']>>>, ParentType, ContextType>;
  payableAmount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  payable_amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  paymentType?: Resolver<Maybe<ResolversTypes['CollectionPaymentTypes']>, ParentType, ContextType>;
  payment_type?: Resolver<Maybe<ResolversTypes['CollectionPaymentTypes']>, ParentType, ContextType>;
  periods?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  refNo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ref_no?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  remindEndOn?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  remindInterval?: Resolver<Maybe<ResolversTypes['CollectionRemindIntervalTypes']>, ParentType, ContextType>;
  remindOnDate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  remindOnDays?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionRemindOnDays']>>>, ParentType, ContextType>;
  remindOnMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  remindType?: Resolver<Maybe<ResolversTypes['CollectionRemindTypes']>, ParentType, ContextType>;
  remind_end_on?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  remind_interval?: Resolver<Maybe<ResolversTypes['CollectionRemindIntervalTypes']>, ParentType, ContextType>;
  remind_on_date?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  remind_on_days?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionRemindOnDays']>>>, ParentType, ContextType>;
  remind_on_month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  remind_type?: Resolver<Maybe<ResolversTypes['CollectionRemindTypes']>, ParentType, ContextType>;
  reminderStatus?: Resolver<Maybe<ResolversTypes['ReminderStatus']>, ParentType, ContextType>;
  reminder_status?: Resolver<Maybe<ResolversTypes['ReminderStatus']>, ParentType, ContextType>;
  shortLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  short_link?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  smsNotify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  sms_notify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  spRecurringId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sp_recurring_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startMonth?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_month?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['CollectionStatusTypes']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  voiceNotify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  voice_notify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  whatsappNotify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  whatsapp_notify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionActivityLogResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectionActivityLog'] = ResolversParentTypes['CollectionActivityLog']> = ResolversObject<{
  actionType?: Resolver<Maybe<ResolversTypes['CollectionActionType']>, ParentType, ContextType>;
  changedValues?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  currentValues?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  previousValues?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionMessageLogResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectionMessageLog'] = ResolversParentTypes['CollectionMessageLog']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['CollectionMessageLogStatusTypes']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionPaymentResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectionPayment'] = ResolversParentTypes['CollectionPayment']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  collectionPeriod?: Resolver<Maybe<ResolversTypes['CollectionPeriod']>, ParentType, ContextType>;
  collection_period?: Resolver<Maybe<ResolversTypes['CollectionPeriod']>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  contactPic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  contact_pic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  paymentProof?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentProofFileName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentProofFileSize?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payment_proof?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payment_proof_file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payment_proof_file_size?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receipt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receiptFileName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receiptFileSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  receipt_file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receipt_file_size?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  remarks?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['CollectionPaymentStatusTypes']>, ParentType, ContextType>;
  transactionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  transaction_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionPeriodResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectionPeriod'] = ResolversParentTypes['CollectionPeriod']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  lastRemindOn?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  last_remind_on?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  paymentAcceptAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  payment_accept_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  payments?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionPayment']>>>, ParentType, ContextType>;
  period?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['CollectionStatusTypes']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  webhookData?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webhook_data?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionRemindOnDaysResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectionRemindOnDays'] = ResolversParentTypes['CollectionRemindOnDays']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionReminderReadResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectionReminderRead'] = ResolversParentTypes['CollectionReminderRead']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectionTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectionTag'] = ResolversParentTypes['CollectionTag']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  tag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Collector'] = ResolversParentTypes['Collector']> = ResolversObject<{
  assignees?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  collections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collection']>>>, ParentType, ContextType, RequireFields<CollectorCollectionsArgs, never>>;
  collectorMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectorMember']>>>, ParentType, ContextType>;
  collector_members?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectorMember']>>>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CollectorMemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['CollectorMember'] = ResolversParentTypes['CollectorMember']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommonVisibilityWhitelistResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommonVisibilityWhitelist'] = ResolversParentTypes['CommonVisibilityWhitelist']> = ResolversObject<{
  members?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  teams?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyResolvers<ContextType = any, ParentType extends ResolversParentTypes['Company'] = ResolversParentTypes['Company']> = ResolversObject<{
  accountCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  activeSubscription?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType>;
  active_subscription?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  currentSubscription?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType>;
  defaultTimezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  default_timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email_enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  employeeTypes?: Resolver<Maybe<Array<Maybe<ResolversTypes['EmployeeType']>>>, ParentType, ContextType>;
  employee_types?: Resolver<Maybe<Array<Maybe<ResolversTypes['EmployeeType']>>>, ParentType, ContextType>;
  expiredSubscription?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id_num?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  idleTiming?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  idle_timing?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  invitationCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invitationValidity?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  invitation_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invitation_validity?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  invoicePrefix?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logo_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  members?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permission?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phoneCallEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  phone_call_enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  registrationCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  settings?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  smsEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  sms_enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  subscriptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType>;
  teams?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  whatsappEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  whatsapp_enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyHolidayResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyHoliday'] = ResolversParentTypes['CompanyHoliday']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publicHolidayId?: Resolver<Maybe<ResolversTypes['PublicHoliday']>, ParentType, ContextType>;
  public_holiday_id?: Resolver<Maybe<ResolversTypes['PublicHoliday']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyMemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyMember'] = ResolversParentTypes['CompanyMember']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  employeeType?: Resolver<Maybe<ResolversTypes['EmployeeType']>, ParentType, ContextType>;
  employee_type?: Resolver<Maybe<ResolversTypes['EmployeeType']>, ParentType, ContextType>;
  hourlyRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  hourly_rate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  permissions?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMemberPermissionScope']>>>, ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceImage?: Resolver<Maybe<ResolversTypes['CompanyMemberReferenceImage']>, ParentType, ContextType>;
  reference_image?: Resolver<Maybe<ResolversTypes['CompanyMemberReferenceImage']>, ParentType, ContextType>;
  setting?: Resolver<Maybe<ResolversTypes['CompanyMemberSettings']>, ParentType, ContextType>;
  teams?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['CompanyMemberType']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyMemberPermissionScopeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyMemberPermissionScope'] = ResolversParentTypes['CompanyMemberPermissionScope']> = ResolversObject<{
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  scope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyMemberReferenceImageResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyMemberReferenceImage'] = ResolversParentTypes['CompanyMemberReferenceImage']> = ResolversObject<{
  actionBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  action_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  remark?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3Bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3Key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['CompanyMemberReferenceImageStatus']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyMemberReferenceImageResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyMemberReferenceImageResponse'] = ResolversParentTypes['CompanyMemberReferenceImageResponse']> = ResolversObject<{
  s3Bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3Key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  upload_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyMemberSettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyMemberSettings'] = ResolversParentTypes['CompanyMemberSettings']> = ResolversObject<{
  senangPay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  senang_pay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyMemberTypeResolvers = EnumResolverSignature<{ ADMIN?: any, MANAGER?: any, MEMBER?: any }, ResolversTypes['CompanyMemberType']>;

export type CompanyPaymentMethodResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyPaymentMethod'] = ResolversParentTypes['CompanyPaymentMethod']> = ResolversObject<{
  brand?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  expMonth?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expYear?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  last4?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeCustomerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripePaymentMethodId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyPermissionResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyPermission'] = ResolversParentTypes['CompanyPermission']> = ResolversObject<{
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  grants?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyStorageDetailsResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyStorageDetails'] = ResolversParentTypes['CompanyStorageDetails']> = ResolversObject<{
  summary?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyStorageList']>>>, ParentType, ContextType>;
  totalUsageInKB?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalUsageInMB?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyStorageListResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyStorageList'] = ResolversParentTypes['CompanyStorageList']> = ResolversObject<{
  fileSize?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanySubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanySubscription'] = ResolversParentTypes['CompanySubscription']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  cancelDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  cancel_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  discount?: Resolver<Maybe<ResolversTypes['SubscriptionDiscount']>, ParentType, ContextType>;
  emailQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interval?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  intervalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  interval_count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  package?: Resolver<Maybe<ResolversTypes['SubscriptionPackage']>, ParentType, ContextType>;
  packageDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  packageTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  package_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  package_title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phoneCallQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  phone_call_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  productId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  product_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  signatureQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  signature_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  smsQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sms_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['SubscriptionStatuses']>, ParentType, ContextType>;
  stripeSubscriptionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripe_subscription_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscriptionPackagePrice?: Resolver<Maybe<ResolversTypes['SubscriptionPackagePrice']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['PackageTypes']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  whatsappQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  whatsapp_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  whiteListedMembers?: Resolver<Maybe<ResolversTypes['SubscriptionQuantityResult']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyTeamResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyTeam'] = ResolversParentTypes['CompanyTeam']> = ResolversObject<{
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  members?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  statuses?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeamStatus']>>>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyTeamStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyTeamStatus'] = ResolversParentTypes['CompanyTeamStatus']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentStatus?: Resolver<Maybe<ResolversTypes['CompanyTeamStatusType']>, ParentType, ContextType>;
  parent_status?: Resolver<Maybe<ResolversTypes['CompanyTeamStatusType']>, ParentType, ContextType>;
  percentage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sequence?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stage?: Resolver<Maybe<ResolversTypes['StageType']>, ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CompanyWorkDaySettingResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompanyWorkDaySetting'] = ResolversParentTypes['CompanyWorkDaySetting']> = ResolversObject<{
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  day?: Resolver<Maybe<ResolversTypes['WorkDay']>, ParentType, ContextType>;
  endHour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  end_hour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  open?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startHour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  start_hour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactResolvers<ContextType = any, ParentType extends ResolversParentTypes['Contact'] = ResolversParentTypes['Contact']> = ResolversObject<{
  accountCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  activities?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactActivityRaw']>>>, ParentType, ContextType, RequireFields<ContactActivitiesArgs, 'isCount' | 'limit' | 'offset' | 'tableType'>>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendances?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attendance']>>>, ParentType, ContextType>;
  collections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collection']>>>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  dealCreator?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  dealValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deal_creator?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deal_value?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  edited?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactGroup']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactNote']>>>, ParentType, ContextType>;
  pics?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactPic']>>>, ParentType, ContextType>;
  remarks?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  taskBoards?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType>;
  task_boards?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['ContactType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactActivityResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactActivity'] = ResolversParentTypes['ContactActivity']> = ResolversObject<{
  activityType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  activity_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assignee?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  attachment?: Resolver<Maybe<ResolversTypes['TaskAttachment']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  fromDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  from_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  pic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  toDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  to_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactActivityRawResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactActivityRaw'] = ResolversParentTypes['ContactActivityRaw']> = ResolversObject<{
  action?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  changedValues?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  changed_values?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentValues?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  current_values?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  previousValues?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  previous_values?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tableName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  table_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactGroup'] = ResolversParentTypes['ContactGroup']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  contacts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Contact']>>>, ParentType, ContextType>;
  count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['ContactGroupType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactNoteResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactNote'] = ResolversParentTypes['ContactNote']> = ResolversObject<{
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  noteContent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactPicResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactPic'] = ResolversParentTypes['ContactPic']> = ResolversObject<{
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  contactNo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_no?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nationalFormat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  national_format?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  remarks?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactTag'] = ResolversParentTypes['ContactTag']> = ResolversObject<{
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  tag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactTaskResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactTask'] = ResolversParentTypes['ContactTask']> = ResolversObject<{
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['ContactTaskStatusType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactTaskStatusTypeResolvers = EnumResolverSignature<{ DONE?: any, PENDING?: any, REJECTED?: any }, ResolversTypes['ContactTaskStatusType']>;

export type ContactTypeResolvers = EnumResolverSignature<{ COMPANY?: any, INDIVIDUAL?: any, NONE?: any }, ResolversTypes['ContactType']>;

export type CustomTimesheetDayApprovalResolvers<ContextType = any, ParentType extends ResolversParentTypes['CustomTimesheetDayApproval'] = ResolversParentTypes['CustomTimesheetDayApproval']> = ResolversObject<{
  billable?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  customName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TimesheetApprovalStatus']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteCompanyPaymentMethodResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteCompanyPaymentMethodResponse'] = ResolversParentTypes['DeleteCompanyPaymentMethodResponse']> = ResolversObject<{
  affectedNum?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  success?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteContactPicResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteContactPicResponse'] = ResolversParentTypes['DeleteContactPicResponse']> = ResolversObject<{
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DiscountedPriceResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscountedPrice'] = ResolversParentTypes['DiscountedPrice']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discountedPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  discounted_price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  interval?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  intervalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  interval_count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  package?: Resolver<Maybe<ResolversTypes['SubscriptionPackage']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  pricePerUnit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  price_per_unit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stripePriceId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripe_price_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EmployeeTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['EmployeeType'] = ResolversParentTypes['EmployeeType']> = ResolversObject<{
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasOvertime?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  has_overtime?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  workDaySettings?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyWorkDaySetting']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type HolidayResolvers<ContextType = any, ParentType extends ResolversParentTypes['Holiday'] = ResolversParentTypes['Holiday']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ImageGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImageGroup'] = ResolversParentTypes['ImageGroup']> = ResolversObject<{
  large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  original?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  small?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ImportTasksResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImportTasksResponse'] = ResolversParentTypes['ImportTasksResponse']> = ResolversObject<{
  failed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  imported?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tasks?: Resolver<Maybe<Array<ResolversTypes['Task']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface LatitudeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Latitude'], any> {
  name: 'Latitude';
}

export type LocationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  radius?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface LongitudeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Longitude'], any> {
  name: 'Longitude';
}

export type MonthlyActivityTrackingResolvers<ContextType = any, ParentType extends ResolversParentTypes['MonthlyActivityTracking'] = ResolversParentTypes['MonthlyActivityTracking']> = ResolversObject<{
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  week_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  week_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  activateCollections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collection']>>>, ParentType, ContextType, RequireFields<MutationActivateCollectionsArgs, 'collectionIds'>>;
  activatePublicHoliday?: Resolver<Maybe<ResolversTypes['CompanyHoliday']>, ParentType, ContextType, RequireFields<MutationActivatePublicHolidayArgs, 'companyId' | 'holidayId'>>;
  addCompanyTeamStatus?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType, RequireFields<MutationAddCompanyTeamStatusArgs, 'input' | 'teamId'>>;
  addCustomValueToTask?: Resolver<Maybe<ResolversTypes['TaskCustomValue']>, ParentType, ContextType, RequireFields<MutationAddCustomValueToTaskArgs, 'input'>>;
  addExpoPushToken?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAddExpoPushTokenArgs, 'token'>>;
  addMemberToCompany?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<MutationAddMemberToCompanyArgs, 'companyId' | 'input'>>;
  addMembersToContactGroup?: Resolver<Maybe<Array<Maybe<ResolversTypes['Contact']>>>, ParentType, ContextType, RequireFields<MutationAddMembersToContactGroupArgs, 'input'>>;
  addPackageToSubscription?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType, RequireFields<MutationAddPackageToSubscriptionArgs, 'addPackageInput' | 'companyId'>>;
  addSenangPayUsers?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType, RequireFields<MutationAddSenangPayUsersArgs, 'companyId' | 'userIds'>>;
  addSubscriptionProductToPackage?: Resolver<Maybe<ResolversTypes['SubscriptionPackage']>, ParentType, ContextType, RequireFields<MutationAddSubscriptionProductToPackageArgs, 'input'>>;
  addTaskWatchers?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskWatcher']>>>, ParentType, ContextType, RequireFields<MutationAddTaskWatchersArgs, 'input'>>;
  addToTaskVisibilityWhitelist?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationAddToTaskVisibilityWhitelistArgs, 'input'>>;
  addToVisibilityWhitelist?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationAddToVisibilityWhitelistArgs, 'input'>>;
  addToVisibilityWhitelistProject?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationAddToVisibilityWhitelistProjectArgs, 'input'>>;
  addToWorkspaceVisibilityWhitelist?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationAddToWorkspaceVisibilityWhitelistArgs, 'input'>>;
  applyTaskTemplate?: Resolver<Maybe<ResolversTypes['TaskTemplate']>, ParentType, ContextType, RequireFields<MutationApplyTaskTemplateArgs, 'input'>>;
  archiveAttendanceLabel?: Resolver<Maybe<ResolversTypes['AttendanceLabel']>, ParentType, ContextType, RequireFields<MutationArchiveAttendanceLabelArgs, 'archived' | 'labelId'>>;
  archiveCollections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collection']>>>, ParentType, ContextType, RequireFields<MutationArchiveCollectionsArgs, 'collectionIds'>>;
  archiveEmployeeType?: Resolver<Maybe<ResolversTypes['EmployeeType']>, ParentType, ContextType, RequireFields<MutationArchiveEmployeeTypeArgs, 'archived' | 'typeId'>>;
  archiveTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationArchiveTasksArgs, 'input'>>;
  assignCollectionTags?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionTag']>>>, ParentType, ContextType, RequireFields<MutationAssignCollectionTagsArgs, 'input'>>;
  assignContactTags?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactTag']>>>, ParentType, ContextType, RequireFields<MutationAssignContactTagsArgs, 'input'>>;
  assignMembersToCollection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<MutationAssignMembersToCollectionArgs, 'input'>>;
  assignProjectsToWorkspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationAssignProjectsToWorkspaceArgs, 'input'>>;
  assignSubscriptionQuantityToMember?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType, RequireFields<MutationAssignSubscriptionQuantityToMemberArgs, 'companyMemberId' | 'stripeProductId'>>;
  assignTaskBoardsToFolder?: Resolver<Maybe<ResolversTypes['TaskBoardFolder']>, ParentType, ContextType, RequireFields<MutationAssignTaskBoardsToFolderArgs, 'input'>>;
  assignTaskMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskMember']>>>, ParentType, ContextType, RequireFields<MutationAssignTaskMembersArgs, 'input' | 'taskId'>>;
  assignTaskPics?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskPic']>>>, ParentType, ContextType, RequireFields<MutationAssignTaskPicsArgs, 'input' | 'taskId'>>;
  assignTaskTags?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskTag']>>>, ParentType, ContextType, RequireFields<MutationAssignTaskTagsArgs, 'input'>>;
  attachPaymentMethod?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAttachPaymentMethodArgs, 'paymentMethodId'>>;
  bulkUploadContacts?: Resolver<Maybe<ResolversTypes['BulkUploadContactsResponse']>, ParentType, ContextType, RequireFields<MutationBulkUploadContactsArgs, 'attachment' | 'companyId'>>;
  bulkUploadMembers?: Resolver<Maybe<ResolversTypes['BulkUploadMembersResponse']>, ParentType, ContextType, RequireFields<MutationBulkUploadMembersArgs, 'attachment' | 'companyId'>>;
  cancelAllSubscriptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType, RequireFields<MutationCancelAllSubscriptionsArgs, 'companyId'>>;
  cancelOmniTrialSubscription?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType, RequireFields<MutationCancelOmniTrialSubscriptionArgs, 'companyId' | 'companySubscriptionId'>>;
  cancelSubscription?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType, RequireFields<MutationCancelSubscriptionArgs, 'companyId' | 'companySubscriptionId'>>;
  cancelSubscriptionV2?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, RequireFields<MutationCancelSubscriptionV2Args, 'input'>>;
  changeGroupTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationChangeGroupTasksArgs, 'input'>>;
  changeTaskPosition?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationChangeTaskPositionArgs, 'input'>>;
  closeAttendance?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType, RequireFields<MutationCloseAttendanceArgs, 'companyMemberId'>>;
  closeAttendanceForUser?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType, RequireFields<MutationCloseAttendanceForUserArgs, 'companyMemberId'>>;
  collectionReminderRead?: Resolver<Maybe<ResolversTypes['CollectionReminderRead']>, ParentType, ContextType, RequireFields<MutationCollectionReminderReadArgs, 'collectionId'>>;
  copyProject?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationCopyProjectArgs, 'input'>>;
  copyTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCopyTaskArgs, 'input'>>;
  copyTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationCopyTasksArgs, 'input'>>;
  createAttendanceLabel?: Resolver<Maybe<ResolversTypes['AttendanceLabel']>, ParentType, ContextType, RequireFields<MutationCreateAttendanceLabelArgs, 'companyId' | 'input'>>;
  createBillingInvoice?: Resolver<Maybe<ResolversTypes['BillingInvoice']>, ParentType, ContextType, RequireFields<MutationCreateBillingInvoiceArgs, 'input'>>;
  createBillingInvoiceItem?: Resolver<Maybe<ResolversTypes['BillingInvoiceItem']>, ParentType, ContextType, RequireFields<MutationCreateBillingInvoiceItemArgs, 'input'>>;
  createChecklist?: Resolver<Maybe<ResolversTypes['Checklist']>, ParentType, ContextType, RequireFields<MutationCreateChecklistArgs, 'input' | 'taskId'>>;
  createCollaborationBoard?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationCreateCollaborationBoardArgs, 'input'>>;
  createCollection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<MutationCreateCollectionArgs, 'attachment' | 'input'>>;
  createCollector?: Resolver<Maybe<ResolversTypes['Collector']>, ParentType, ContextType, RequireFields<MutationCreateCollectorArgs, 'input'>>;
  createCompany?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<MutationCreateCompanyArgs, 'input'>>;
  createCompanyPaymentMethod?: Resolver<Maybe<ResolversTypes['CompanyPaymentMethod']>, ParentType, ContextType, RequireFields<MutationCreateCompanyPaymentMethodArgs, 'input'>>;
  createCompanyTeam?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType, RequireFields<MutationCreateCompanyTeamArgs, 'companyId' | 'input'>>;
  createContact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType, RequireFields<MutationCreateContactArgs, 'companyId' | 'input'>>;
  createContactGroup?: Resolver<Maybe<ResolversTypes['ContactGroup']>, ParentType, ContextType, RequireFields<MutationCreateContactGroupArgs, 'companyId' | 'input'>>;
  createContactNote?: Resolver<Maybe<ResolversTypes['ContactNote']>, ParentType, ContextType, RequireFields<MutationCreateContactNoteArgs, 'contactId' | 'input'>>;
  createContactPic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType, RequireFields<MutationCreateContactPicArgs, 'companyId' | 'contactId' | 'input'>>;
  createCustomColumnForGroup?: Resolver<Maybe<ResolversTypes['ProjectGroupCustomColumn']>, ParentType, ContextType, RequireFields<MutationCreateCustomColumnForGroupArgs, 'input'>>;
  createCustomTimesheetApprovals?: Resolver<Maybe<Array<Maybe<ResolversTypes['CustomTimesheetDayApproval']>>>, ParentType, ContextType, RequireFields<MutationCreateCustomTimesheetApprovalsArgs, 'input'>>;
  createEmployeeType?: Resolver<Maybe<ResolversTypes['EmployeeType']>, ParentType, ContextType, RequireFields<MutationCreateEmployeeTypeArgs, 'companyId' | 'name' | 'overtime'>>;
  createHoliday?: Resolver<Maybe<Array<Maybe<ResolversTypes['Holiday']>>>, ParentType, ContextType, RequireFields<MutationCreateHolidayArgs, 'companyId' | 'input'>>;
  createLocation?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<MutationCreateLocationArgs, 'companyId' | 'input'>>;
  createPersonalTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCreatePersonalTaskArgs, 'input'>>;
  createProject?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  createProjectClaim?: Resolver<Maybe<ResolversTypes['ProjectClaim']>, ParentType, ContextType, RequireFields<MutationCreateProjectClaimArgs, 'input'>>;
  createProjectGroup?: Resolver<Maybe<ResolversTypes['ProjectGroup']>, ParentType, ContextType, RequireFields<MutationCreateProjectGroupArgs, 'input'>>;
  createProjectInvoice?: Resolver<Maybe<ResolversTypes['ProjectInvoice']>, ParentType, ContextType, RequireFields<MutationCreateProjectInvoiceArgs, 'input'>>;
  createProjectStatus?: Resolver<Maybe<ResolversTypes['ProjectStatus']>, ParentType, ContextType, RequireFields<MutationCreateProjectStatusArgs, 'input'>>;
  createProjectTemplate?: Resolver<Maybe<ResolversTypes['ProjectTemplate']>, ParentType, ContextType, RequireFields<MutationCreateProjectTemplateArgs, 'input'>>;
  createProjectTemplateStatus?: Resolver<Maybe<ResolversTypes['ProjectTemplateStatus']>, ParentType, ContextType, RequireFields<MutationCreateProjectTemplateStatusArgs, 'input'>>;
  createProjectTimeCost?: Resolver<Maybe<ResolversTypes['ProjectTimeCost']>, ParentType, ContextType, RequireFields<MutationCreateProjectTimeCostArgs, 'input'>>;
  createShortUrl?: Resolver<Maybe<ResolversTypes['ShortUrl']>, ParentType, ContextType, RequireFields<MutationCreateShortUrlArgs, 'url'>>;
  createSubscriptionPackage?: Resolver<Maybe<ResolversTypes['SubscriptionPackage']>, ParentType, ContextType, RequireFields<MutationCreateSubscriptionPackageArgs, 'input'>>;
  createSubscriptionPrice?: Resolver<Maybe<ResolversTypes['SubscriptionProduct']>, ParentType, ContextType, RequireFields<MutationCreateSubscriptionPriceArgs, 'input'>>;
  createSubscriptionProduct?: Resolver<Maybe<ResolversTypes['SubscriptionProduct']>, ParentType, ContextType, RequireFields<MutationCreateSubscriptionProductArgs, 'input'>>;
  createSubtask?: Resolver<Maybe<ResolversTypes['Subtask']>, ParentType, ContextType, RequireFields<MutationCreateSubtaskArgs, 'input' | 'taskId'>>;
  createTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationCreateTagArgs, 'input'>>;
  createTagGroup?: Resolver<Maybe<ResolversTypes['TagGroup']>, ParentType, ContextType, RequireFields<MutationCreateTagGroupArgs, 'input'>>;
  createTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCreateTaskArgs, 'input'>>;
  createTaskBoard?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationCreateTaskBoardArgs, 'input'>>;
  createTaskBoardFolder?: Resolver<Maybe<ResolversTypes['TaskBoardFolder']>, ParentType, ContextType, RequireFields<MutationCreateTaskBoardFolderArgs, 'input'>>;
  createTaskBoardTeam?: Resolver<Maybe<ResolversTypes['TaskBoardTeam']>, ParentType, ContextType, RequireFields<MutationCreateTaskBoardTeamArgs, 'input'>>;
  createTaskTemplate?: Resolver<Maybe<ResolversTypes['TaskTemplate']>, ParentType, ContextType, RequireFields<MutationCreateTaskTemplateArgs, 'input'>>;
  createTimesheetApprovals?: Resolver<Maybe<Array<Maybe<ResolversTypes['TimesheetDayApproval']>>>, ParentType, ContextType, RequireFields<MutationCreateTimesheetApprovalsArgs, 'input'>>;
  createTimesheetEntry?: Resolver<Maybe<ResolversTypes['Timesheet']>, ParentType, ContextType, RequireFields<MutationCreateTimesheetEntryArgs, 'input' | 'memberId' | 'taskId'>>;
  createWorkspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationCreateWorkspaceArgs, 'input'>>;
  deactivateCollections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collection']>>>, ParentType, ContextType, RequireFields<MutationDeactivateCollectionsArgs, 'collectionIds'>>;
  deactivatePublicHoliday?: Resolver<Maybe<ResolversTypes['CompanyHoliday']>, ParentType, ContextType, RequireFields<MutationDeactivatePublicHolidayArgs, 'companyId' | 'publicHolidayId'>>;
  deleteBillingInvoiceItems?: Resolver<Maybe<ResolversTypes['BillingInvoiceItem']>, ParentType, ContextType, RequireFields<MutationDeleteBillingInvoiceItemsArgs, 'ids'>>;
  deleteBillingInvoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['BillingInvoice']>>>, ParentType, ContextType, RequireFields<MutationDeleteBillingInvoicesArgs, 'ids'>>;
  deleteChecklists?: Resolver<Maybe<Array<Maybe<ResolversTypes['Checklist']>>>, ParentType, ContextType, RequireFields<MutationDeleteChecklistsArgs, 'checklistIds'>>;
  deleteCollectionTags?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionTag']>>>, ParentType, ContextType, RequireFields<MutationDeleteCollectionTagsArgs, 'input'>>;
  deleteCollections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collection']>>>, ParentType, ContextType, RequireFields<MutationDeleteCollectionsArgs, 'collectionIds'>>;
  deleteCollectors?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collector']>>>, ParentType, ContextType, RequireFields<MutationDeleteCollectorsArgs, 'input'>>;
  deleteCompany?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<MutationDeleteCompanyArgs, 'companyId'>>;
  deleteCompanyHoliday?: Resolver<Maybe<ResolversTypes['CompanyHoliday']>, ParentType, ContextType, RequireFields<MutationDeleteCompanyHolidayArgs, 'companyHolidayId' | 'companyId'>>;
  deleteCompanyPaymentMethod?: Resolver<Maybe<ResolversTypes['DeleteCompanyPaymentMethodResponse']>, ParentType, ContextType, RequireFields<MutationDeleteCompanyPaymentMethodArgs, 'input'>>;
  deleteCompanyTeam?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType, RequireFields<MutationDeleteCompanyTeamArgs, 'teamId'>>;
  deleteCompanyTeamStatus?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType, RequireFields<MutationDeleteCompanyTeamStatusArgs, 'companyTeamStatusId'>>;
  deleteContactGroup?: Resolver<Maybe<ResolversTypes['ContactGroup']>, ParentType, ContextType, RequireFields<MutationDeleteContactGroupArgs, 'groupId'>>;
  deleteContactNotes?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactNote']>>>, ParentType, ContextType, RequireFields<MutationDeleteContactNotesArgs, 'contactNoteIds'>>;
  deleteContactPic?: Resolver<Maybe<ResolversTypes['DeleteContactPicResponse']>, ParentType, ContextType, RequireFields<MutationDeleteContactPicArgs, 'companyId' | 'picId'>>;
  deleteContactTags?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactTag']>>>, ParentType, ContextType, RequireFields<MutationDeleteContactTagsArgs, 'input'>>;
  deleteContacts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Contact']>>>, ParentType, ContextType, RequireFields<MutationDeleteContactsArgs, 'companyId' | 'contactIds'>>;
  deleteCustomColumnForGroup?: Resolver<Maybe<ResolversTypes['ProjectGroupCustomColumn']>, ParentType, ContextType, RequireFields<MutationDeleteCustomColumnForGroupArgs, 'input'>>;
  deleteCustomTimesheetApprovals?: Resolver<Maybe<Array<Maybe<ResolversTypes['CustomTimesheetDayApproval']>>>, ParentType, ContextType, RequireFields<MutationDeleteCustomTimesheetApprovalsArgs, 'input'>>;
  deleteCustomValueFromTask?: Resolver<Maybe<ResolversTypes['TaskCustomValue']>, ParentType, ContextType, RequireFields<MutationDeleteCustomValueFromTaskArgs, 'input'>>;
  deleteLocations?: Resolver<Maybe<Array<Maybe<ResolversTypes['Location']>>>, ParentType, ContextType, RequireFields<MutationDeleteLocationsArgs, 'locationIds'>>;
  deletePaymentProof?: Resolver<Maybe<ResolversTypes['CollectionPayment']>, ParentType, ContextType, RequireFields<MutationDeletePaymentProofArgs, 'input'>>;
  deleteProjectClaims?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectClaim']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectClaimsArgs, 'input'>>;
  deleteProjectGroups?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectGroup']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectGroupsArgs, 'input'>>;
  deleteProjectInvoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectInvoice']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectInvoicesArgs, 'input'>>;
  deleteProjectStatuses?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectStatus']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectStatusesArgs, 'input'>>;
  deleteProjectTemplateStatuses?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectTemplateStatus']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectTemplateStatusesArgs, 'input'>>;
  deleteProjectTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectTemplate']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectTemplatesArgs, 'input'>>;
  deleteProjectTimeCosts?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectTimeCost']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectTimeCostsArgs, 'input'>>;
  deleteProjects?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<MutationDeleteProjectsArgs, 'input'>>;
  deleteSubscriptionProduct?: Resolver<Maybe<ResolversTypes['SubscriptionProduct']>, ParentType, ContextType, RequireFields<MutationDeleteSubscriptionProductArgs, 'id'>>;
  deleteSubtasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Subtask']>>>, ParentType, ContextType, RequireFields<MutationDeleteSubtasksArgs, 'subtaskIds'>>;
  deleteTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationDeleteTagArgs, 'id'>>;
  deleteTagGroup?: Resolver<Maybe<ResolversTypes['TagGroup']>, ParentType, ContextType, RequireFields<MutationDeleteTagGroupArgs, 'id'>>;
  deleteTaskAttachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskAttachment']>>>, ParentType, ContextType, RequireFields<MutationDeleteTaskAttachmentsArgs, 'taskAttachmentIds'>>;
  deleteTaskBoardFolder?: Resolver<Maybe<ResolversTypes['TaskBoardFolder']>, ParentType, ContextType, RequireFields<MutationDeleteTaskBoardFolderArgs, 'folderId'>>;
  deleteTaskBoardTeams?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoardTeam']>>>, ParentType, ContextType, RequireFields<MutationDeleteTaskBoardTeamsArgs, 'ids'>>;
  deleteTaskBoards?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<MutationDeleteTaskBoardsArgs, 'ids'>>;
  deleteTaskComment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType, RequireFields<MutationDeleteTaskCommentArgs, 'taskCommentId'>>;
  deleteTaskMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskMember']>>>, ParentType, ContextType, RequireFields<MutationDeleteTaskMembersArgs, 'input' | 'taskId'>>;
  deleteTaskPics?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskPic']>>>, ParentType, ContextType, RequireFields<MutationDeleteTaskPicsArgs, 'input' | 'taskId'>>;
  deleteTaskTags?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskTag']>>>, ParentType, ContextType, RequireFields<MutationDeleteTaskTagsArgs, 'input'>>;
  deleteTaskTemplate?: Resolver<Maybe<ResolversTypes['TaskTemplate']>, ParentType, ContextType, RequireFields<MutationDeleteTaskTemplateArgs, 'input'>>;
  deleteTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationDeleteTasksArgs, 'taskIds'>>;
  deleteWorkspaces?: Resolver<Maybe<Array<Maybe<ResolversTypes['Workspace']>>>, ParentType, ContextType, RequireFields<MutationDeleteWorkspacesArgs, 'input'>>;
  detachPaymentMethod?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDetachPaymentMethodArgs, 'companyId' | 'paymentMethodId'>>;
  downgradeSubscription?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, RequireFields<MutationDowngradeSubscriptionArgs, 'input'>>;
  duplicateTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationDuplicateTasksArgs, 'input'>>;
  editCustomColumnForGroup?: Resolver<Maybe<ResolversTypes['ProjectGroupCustomColumn']>, ParentType, ContextType, RequireFields<MutationEditCustomColumnForGroupArgs, 'input'>>;
  editPackageQuantity?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType, RequireFields<MutationEditPackageQuantityArgs, 'companyId' | 'companySubscriptionId' | 'quantity'>>;
  editProjectClaim?: Resolver<Maybe<ResolversTypes['ProjectClaim']>, ParentType, ContextType, RequireFields<MutationEditProjectClaimArgs, 'input'>>;
  editProjectGroup?: Resolver<Maybe<ResolversTypes['ProjectGroup']>, ParentType, ContextType, RequireFields<MutationEditProjectGroupArgs, 'input'>>;
  editProjectInvoice?: Resolver<Maybe<ResolversTypes['ProjectInvoice']>, ParentType, ContextType, RequireFields<MutationEditProjectInvoiceArgs, 'input'>>;
  editProjectSettings?: Resolver<Maybe<ResolversTypes['ProjectSettings']>, ParentType, ContextType, RequireFields<MutationEditProjectSettingsArgs, 'input'>>;
  editProjectStatus?: Resolver<Maybe<ResolversTypes['ProjectStatus']>, ParentType, ContextType, RequireFields<MutationEditProjectStatusArgs, 'input'>>;
  editProjectTemplate?: Resolver<Maybe<ResolversTypes['ProjectTemplate']>, ParentType, ContextType, RequireFields<MutationEditProjectTemplateArgs, 'input'>>;
  editProjectTemplateStatus?: Resolver<Maybe<ResolversTypes['ProjectTemplateStatus']>, ParentType, ContextType, RequireFields<MutationEditProjectTemplateStatusArgs, 'input'>>;
  editProjectTimeCost?: Resolver<Maybe<ResolversTypes['ProjectTimeCost']>, ParentType, ContextType, RequireFields<MutationEditProjectTimeCostArgs, 'input'>>;
  editTaskComment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType, RequireFields<MutationEditTaskCommentArgs, 'input'>>;
  importTasks?: Resolver<Maybe<ResolversTypes['ImportTasksResponse']>, ParentType, ContextType, RequireFields<MutationImportTasksArgs, 'input'>>;
  linkAttachmentToComment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType, RequireFields<MutationLinkAttachmentToCommentArgs, 'input'>>;
  linkExternalAttachments?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationLinkExternalAttachmentsArgs, 'input'>>;
  loginUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  moveProjectsToWorkspace?: Resolver<Maybe<Array<Maybe<ResolversTypes['Workspace']>>>, ParentType, ContextType, RequireFields<MutationMoveProjectsToWorkspaceArgs, 'input'>>;
  moveTaskToMember?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationMoveTaskToMemberArgs, 'input'>>;
  moveTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationMoveTasksArgs, 'input'>>;
  postTaskComment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType, RequireFields<MutationPostTaskCommentArgs, 'input'>>;
  receivePaymentInvoice?: Resolver<Maybe<ResolversTypes['BillingInvoice']>, ParentType, ContextType, RequireFields<MutationReceivePaymentInvoiceArgs, 'input'>>;
  removeExpoPushToken?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationRemoveExpoPushTokenArgs, 'token'>>;
  removeFromTaskVisibilityWhitelist?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationRemoveFromTaskVisibilityWhitelistArgs, 'input'>>;
  removeFromVisibilityWhitelist?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationRemoveFromVisibilityWhitelistArgs, 'input'>>;
  removeFromVisibilityWhitelistProject?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationRemoveFromVisibilityWhitelistProjectArgs, 'input'>>;
  removeFromWorkspaceVisibilityWhitelist?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationRemoveFromWorkspaceVisibilityWhitelistArgs, 'input'>>;
  removeMemberFromCompany?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<MutationRemoveMemberFromCompanyArgs, 'companyId' | 'companyMemberId'>>;
  removeMemberFromCompanyTeam?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType, RequireFields<MutationRemoveMemberFromCompanyTeamArgs, 'companyTeamId' | 'teamMemberId'>>;
  removeMemberFromContactGroup?: Resolver<Maybe<ResolversTypes['ContactGroup']>, ParentType, ContextType, RequireFields<MutationRemoveMemberFromContactGroupArgs, 'contactId' | 'groupId'>>;
  removeMembersFromCollection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<MutationRemoveMembersFromCollectionArgs, 'input'>>;
  removePackagesFromSubscription?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType, RequireFields<MutationRemovePackagesFromSubscriptionArgs, 'companyId' | 'companySubscriptionIds'>>;
  removeProjectsFromWorkspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationRemoveProjectsFromWorkspaceArgs, 'input'>>;
  removeSenangPayUsers?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType, RequireFields<MutationRemoveSenangPayUsersArgs, 'companyId' | 'userIds'>>;
  removeSubscriptionProductFromPackage?: Resolver<Maybe<ResolversTypes['SubscriptionPackage']>, ParentType, ContextType, RequireFields<MutationRemoveSubscriptionProductFromPackageArgs, 'input'>>;
  removeSubscriptionQuantityFromMember?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType, RequireFields<MutationRemoveSubscriptionQuantityFromMemberArgs, 'companyMemberId' | 'stripeProductId'>>;
  removeTaskBoardsFromFolder?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<MutationRemoveTaskBoardsFromFolderArgs, 'input'>>;
  removeTaskPics?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskPic']>>>, ParentType, ContextType, RequireFields<MutationRemoveTaskPicsArgs, 'input'>>;
  removeTaskWatchers?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskWatcher']>>>, ParentType, ContextType, RequireFields<MutationRemoveTaskWatchersArgs, 'input'>>;
  reorderGroups?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectGroup']>>>, ParentType, ContextType, RequireFields<MutationReorderGroupsArgs, 'input'>>;
  requestAccountDeletion?: Resolver<Maybe<ResolversTypes['RequestAccountDeletionResponse']>, ParentType, ContextType, RequireFields<MutationRequestAccountDeletionArgs, 'input'>>;
  requestDedocoSubscription?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType, RequireFields<MutationRequestDedocoSubscriptionArgs, 'companyId' | 'packagePriceId'>>;
  requestOmniSubscription?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType, RequireFields<MutationRequestOmniSubscriptionArgs, 'companyId' | 'createSubscriptionInput'>>;
  requestSubscription?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType, RequireFields<MutationRequestSubscriptionArgs, 'companyId' | 'packagePriceId'>>;
  requestTrialOmniSubscription?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType, RequireFields<MutationRequestTrialOmniSubscriptionArgs, 'companyId' | 'createSubscriptionInput' | 'trialDays'>>;
  resendCollectionNotification?: Resolver<Maybe<ResolversTypes['Notification']>, ParentType, ContextType, RequireFields<MutationResendCollectionNotificationArgs, 'collectionId'>>;
  sendInvoice?: Resolver<Maybe<ResolversTypes['BillingInvoice']>, ParentType, ContextType, RequireFields<MutationSendInvoiceArgs, 'input'>>;
  setAttendanceVerificationImage?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType, RequireFields<MutationSetAttendanceVerificationImageArgs, 'attendanceId' | 'companyMemberId' | 'input'>>;
  setCompanyMemberReferenceImage?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType, RequireFields<MutationSetCompanyMemberReferenceImageArgs, 'companyMemberId' | 'input'>>;
  setCompanyMemberReferenceImageStatus?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType, RequireFields<MutationSetCompanyMemberReferenceImageStatusArgs, 'companyId' | 'companyMemberIds' | 'status'>>;
  setDefaultCompany?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetDefaultCompanyArgs, never>>;
  setDefaultCompanyPaymentMethod?: Resolver<Maybe<ResolversTypes['CompanyPaymentMethod']>, ParentType, ContextType, RequireFields<MutationSetDefaultCompanyPaymentMethodArgs, 'input'>>;
  setDefaultUserTimezone?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetDefaultUserTimezoneArgs, 'timezone'>>;
  setProjectVisibility?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationSetProjectVisibilityArgs, 'input'>>;
  setTaskBoardVisibility?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationSetTaskBoardVisibilityArgs, 'input'>>;
  setTaskVisibility?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskVisibilityArgs, 'input'>>;
  setWorkspaceVisibility?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationSetWorkspaceVisibilityArgs, 'input'>>;
  startAttendanceEntry?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType, RequireFields<MutationStartAttendanceEntryArgs, 'companyMemberId' | 'input'>>;
  startSubscription?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, RequireFields<MutationStartSubscriptionArgs, 'input'>>;
  startTaskTimer?: Resolver<Maybe<ResolversTypes['TaskTimerEntry']>, ParentType, ContextType, RequireFields<MutationStartTaskTimerArgs, 'companyMemberId' | 'taskId'>>;
  stopMemberActivityTracker?: Resolver<Maybe<ResolversTypes['Timesheet']>, ParentType, ContextType, RequireFields<MutationStopMemberActivityTrackerArgs, 'memberId'>>;
  stopTaskTimer?: Resolver<Maybe<ResolversTypes['TaskTimerEntry']>, ParentType, ContextType, RequireFields<MutationStopTaskTimerArgs, 'companyMemberId' | 'taskId'>>;
  switchSubscriptionPackage?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType, RequireFields<MutationSwitchSubscriptionPackageArgs, 'companyId' | 'companySubscriptionId' | 'switchSubscriptionPackageInput'>>;
  toggleEnabledCustomColumn?: Resolver<Maybe<ResolversTypes['ProjectGroupCustomColumn']>, ParentType, ContextType, RequireFields<MutationToggleEnabledCustomColumnArgs, 'input'>>;
  toggleTaskBoardPinned?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationToggleTaskBoardPinnedArgs, 'boardId'>>;
  toggleTaskBoardsPinned?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<MutationToggleTaskBoardsPinnedArgs, 'boardIds'>>;
  toggleTasksPinned?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationToggleTasksPinnedArgs, 'taskIds'>>;
  toggleTasksPublishStatus?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationToggleTasksPublishStatusArgs, 'taskIds'>>;
  unarchiveCollections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collection']>>>, ParentType, ContextType, RequireFields<MutationUnarchiveCollectionsArgs, 'collectionIds'>>;
  unarchiveTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationUnarchiveTasksArgs, 'input'>>;
  unlinkAttachmentFromComment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType, RequireFields<MutationUnlinkAttachmentFromCommentArgs, 'input'>>;
  updateAllRead?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserNotification']>>>, ParentType, ContextType, RequireFields<MutationUpdateAllReadArgs, never>>;
  updateAttendanceLabel?: Resolver<Maybe<ResolversTypes['AttendanceLabel']>, ParentType, ContextType, RequireFields<MutationUpdateAttendanceLabelArgs, 'input' | 'labelId'>>;
  updateAttendanceSettings?: Resolver<Maybe<ResolversTypes['AttendanceSettings']>, ParentType, ContextType, RequireFields<MutationUpdateAttendanceSettingsArgs, 'companyId' | 'input'>>;
  updateBillingInvoice?: Resolver<Maybe<ResolversTypes['BillingInvoice']>, ParentType, ContextType, RequireFields<MutationUpdateBillingInvoiceArgs, 'input'>>;
  updateBillingInvoiceItem?: Resolver<Maybe<ResolversTypes['BillingInvoiceItem']>, ParentType, ContextType, RequireFields<MutationUpdateBillingInvoiceItemArgs, 'input'>>;
  updateChecklist?: Resolver<Maybe<ResolversTypes['Checklist']>, ParentType, ContextType, RequireFields<MutationUpdateChecklistArgs, 'checklistId' | 'input'>>;
  updateChecklistSequences?: Resolver<Maybe<Array<Maybe<ResolversTypes['Checklist']>>>, ParentType, ContextType, RequireFields<MutationUpdateChecklistSequencesArgs, never>>;
  updateCollection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<MutationUpdateCollectionArgs, 'collectionId' | 'input'>>;
  updateCollectionPaymentType?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<MutationUpdateCollectionPaymentTypeArgs, 'collectionId' | 'input'>>;
  updateCollectionPeriodStatus?: Resolver<Maybe<ResolversTypes['CollectionPeriod']>, ParentType, ContextType, RequireFields<MutationUpdateCollectionPeriodStatusArgs, 'collectionId' | 'collectionPeriodId' | 'status'>>;
  updateCollector?: Resolver<Maybe<ResolversTypes['Collector']>, ParentType, ContextType, RequireFields<MutationUpdateCollectorArgs, 'input'>>;
  updateCompanyHoliday?: Resolver<Maybe<ResolversTypes['CompanyHoliday']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyHolidayArgs, 'companyHolidayId' | 'companyId' | 'input'>>;
  updateCompanyInfo?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyInfoArgs, 'companyId' | 'input'>>;
  updateCompanyMemberActiveStatus?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyMemberActiveStatusArgs, 'active' | 'companyMemberId'>>;
  updateCompanyMemberInfo?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyMemberInfoArgs, 'companyMemberId' | 'input'>>;
  updateCompanyProfile?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyProfileArgs, 'companyId' | 'key' | 'value'>>;
  updateCompanyTeamInfo?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyTeamInfoArgs, 'companyTeamId' | 'input'>>;
  updateCompanyTeamStatus?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyTeamStatusArgs, 'input' | 'statusId' | 'teamId'>>;
  updateCompanyTeamStatusSequences?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeamStatus']>>>, ParentType, ContextType, RequireFields<MutationUpdateCompanyTeamStatusSequencesArgs, 'input'>>;
  updateCompanyTimezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyTimezoneArgs, 'companyId' | 'timezone'>>;
  updateCompanyWorkDaySetting?: Resolver<Maybe<ResolversTypes['CompanyWorkDaySetting']>, ParentType, ContextType, RequireFields<MutationUpdateCompanyWorkDaySettingArgs, 'companyId' | 'day' | 'employeeTypeId' | 'input'>>;
  updateContact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType, RequireFields<MutationUpdateContactArgs, 'companyId' | 'contactId' | 'input'>>;
  updateContactGroup?: Resolver<Maybe<ResolversTypes['ContactGroup']>, ParentType, ContextType, RequireFields<MutationUpdateContactGroupArgs, 'groupId' | 'input'>>;
  updateContactNote?: Resolver<Maybe<ResolversTypes['ContactNote']>, ParentType, ContextType, RequireFields<MutationUpdateContactNoteArgs, 'contactNoteId' | 'input'>>;
  updateContactPic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType, RequireFields<MutationUpdateContactPicArgs, 'companyId' | 'input' | 'picId'>>;
  updateCustomTimesheetApprovals?: Resolver<Maybe<Array<Maybe<ResolversTypes['CustomTimesheetDayApproval']>>>, ParentType, ContextType, RequireFields<MutationUpdateCustomTimesheetApprovalsArgs, 'input'>>;
  updateEmployeeType?: Resolver<Maybe<ResolversTypes['EmployeeType']>, ParentType, ContextType, RequireFields<MutationUpdateEmployeeTypeArgs, 'name' | 'overtime' | 'typeId'>>;
  updateIsRead?: Resolver<Maybe<ResolversTypes['UserNotification']>, ParentType, ContextType, RequireFields<MutationUpdateIsReadArgs, 'notificationIds'>>;
  updateLocation?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<MutationUpdateLocationArgs, 'input' | 'locationId'>>;
  updateLocationArchivedStatus?: Resolver<Maybe<Array<Maybe<ResolversTypes['Location']>>>, ParentType, ContextType, RequireFields<MutationUpdateLocationArchivedStatusArgs, 'archived' | 'locationIds'>>;
  updatePaymentMethodId?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdatePaymentMethodIdArgs, 'paymentMethodId'>>;
  updatePaymentStatus?: Resolver<Maybe<ResolversTypes['CollectionPayment']>, ParentType, ContextType, RequireFields<MutationUpdatePaymentStatusArgs, 'input'>>;
  updatePersonalTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationUpdatePersonalTaskArgs, 'input' | 'taskId'>>;
  updateProfile?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
  updateProject?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationUpdateProjectArgs, 'input'>>;
  updateProjectsArchivedState?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<MutationUpdateProjectsArchivedStateArgs, 'input'>>;
  updateSenangPayOptions?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<MutationUpdateSenangPayOptionsArgs, 'companyId'>>;
  updateSubscriptionProduct?: Resolver<Maybe<ResolversTypes['SubscriptionProduct']>, ParentType, ContextType, RequireFields<MutationUpdateSubscriptionProductArgs, 'id' | 'input'>>;
  updateSubtask?: Resolver<Maybe<ResolversTypes['Subtask']>, ParentType, ContextType, RequireFields<MutationUpdateSubtaskArgs, 'input' | 'subtaskId'>>;
  updateSubtaskSequences?: Resolver<Maybe<Array<Maybe<ResolversTypes['Subtask']>>>, ParentType, ContextType, RequireFields<MutationUpdateSubtaskSequencesArgs, never>>;
  updateTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationUpdateTagArgs, 'input'>>;
  updateTagGroup?: Resolver<Maybe<ResolversTypes['TagGroup']>, ParentType, ContextType, RequireFields<MutationUpdateTagGroupArgs, 'input'>>;
  updateTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationUpdateTaskArgs, 'input' | 'taskId'>>;
  updateTaskBoard?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<MutationUpdateTaskBoardArgs, 'id' | 'input'>>;
  updateTaskBoardFolder?: Resolver<Maybe<ResolversTypes['TaskBoardFolder']>, ParentType, ContextType, RequireFields<MutationUpdateTaskBoardFolderArgs, 'input'>>;
  updateTaskBoardsArchivedState?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<MutationUpdateTaskBoardsArchivedStateArgs, 'input'>>;
  updateTaskComment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType, RequireFields<MutationUpdateTaskCommentArgs, 'input' | 'taskCommentId'>>;
  updateTaskParent?: Resolver<Maybe<ResolversTypes['UpdateTaskParentResponse']>, ParentType, ContextType, RequireFields<MutationUpdateTaskParentArgs, 'input'>>;
  updateTaskTemplate?: Resolver<Maybe<ResolversTypes['TaskTemplate']>, ParentType, ContextType, RequireFields<MutationUpdateTaskTemplateArgs, 'input'>>;
  updateTasksSequence?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationUpdateTasksSequenceArgs, 'input'>>;
  updateTimeSheetArchivedStatus?: Resolver<Maybe<Array<Maybe<ResolversTypes['Timesheet']>>>, ParentType, ContextType, RequireFields<MutationUpdateTimeSheetArchivedStatusArgs, 'archived' | 'timesheetIds'>>;
  updateTimesheet?: Resolver<Maybe<ResolversTypes['Timesheet']>, ParentType, ContextType, RequireFields<MutationUpdateTimesheetArgs, 'input' | 'timesheetId'>>;
  updateTimesheetApprovals?: Resolver<Maybe<Array<Maybe<ResolversTypes['TimesheetDayApproval']>>>, ParentType, ContextType, RequireFields<MutationUpdateTimesheetApprovalsArgs, 'input'>>;
  updateToolTipsStatus?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateToolTipsStatusArgs, 'input'>>;
  updateUserOnboarding?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserOnboardingArgs, never>>;
  updateUserViewOptions?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserViewOptionsArgs, never>>;
  updateWorkspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationUpdateWorkspaceArgs, 'input'>>;
  upgradeSubscription?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, RequireFields<MutationUpgradeSubscriptionArgs, 'input'>>;
  uploadCompanyProfileImage?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<MutationUploadCompanyProfileImageArgs, 'attachment' | 'companyId'>>;
  uploadPaymentProof?: Resolver<Maybe<ResolversTypes['CollectionPayment']>, ParentType, ContextType, RequireFields<MutationUploadPaymentProofArgs, 'attachment' | 'input'>>;
  uploadPaymentReceipt?: Resolver<Maybe<ResolversTypes['CollectionPayment']>, ParentType, ContextType, RequireFields<MutationUploadPaymentReceiptArgs, 'attachment' | 'input'>>;
  uploadProfileImage?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUploadProfileImageArgs, 'attachment'>>;
  uploadTaskAttachment?: Resolver<Maybe<ResolversTypes['TaskAttachment']>, ParentType, ContextType, RequireFields<MutationUploadTaskAttachmentArgs, 'attachment' | 'taskId'>>;
  voidInvoice?: Resolver<Maybe<ResolversTypes['BillingInvoice']>, ParentType, ContextType, RequireFields<MutationVoidInvoiceArgs, 'input'>>;
}>;

export type NotificationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  taskBoard?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationTypeResolvers = EnumResolverSignature<{ ASSIGNED_AS_CREATOR?: any, ASSIGNED_MEMBER_TYPE?: any, ASSIGNED_TO_TEAM?: any, CLOCK_IN_AFTER_TEN_MINUTES?: any, CLOCK_IN_BEFORE_TEN_MINUTES?: any, CLOCK_OUT_AFTER_TWO_HOURS?: any, COLLECTION_CANCELLED?: any, COLLECTION_CREATED?: any, COLLECTION_DUE?: any, COLLECTION_OVERDUE?: any, COLLECTION_PAYMENT_RECEIVED?: any, COLLECTION_PAYMENT_REJECTED?: any, COMMENT_ON_TASK?: any, DEDOCO_SIGN_REQUEST?: any, FPX_TRANSACTION_STATUS?: any, GENERIC?: any, INVITED_TO_COMPANY?: any, JOIN_COMPANY_BY_CODE?: any, MEMBER_ASSIGNED_TO_TASK?: any, MEMBER_ASSIGNED_TO_TASKBOARD?: any, MEMBER_REMOVED_FROM_TASK?: any, MEMBER_REMOVED_FROM_TASKBOARD?: any, PIC_ASSIGNED_TO_TASK?: any, PIC_ASSIGNED_TO_TASKBOARD?: any, PIC_REMOVED_FROM_TASK?: any, PIC_REMOVED_FROM_TASKBOARD?: any, PROJECT_ON_DUE?: any, PROJECT_OVERDUE?: any, PROJECT_REMINDER?: any, QUOTA_EXCEEDED?: any, REMOVED_FROM_COMPANY?: any, REMOVED_FROM_TEAM?: any, SENANGPAY_ACTIVATION?: any, SENANGPAY_TRANSACTION_FULL?: any, SENANGPAY_TRANSACTION_RECURRING?: any, TASK_DONE?: any, TASK_DUE_MEMBER?: any, TASK_DUE_PIC?: any, TASK_OVERDUE_MEMBER?: any, TASK_OVERDUE_PIC?: any, TASK_REJECTED?: any, UPLOAD_TO_TASK?: any }, ResolversTypes['NotificationType']>;

export type PaginatedProjectClaimsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedProjectClaims'] = ResolversParentTypes['PaginatedProjectClaims']> = ResolversObject<{
  projectClaims?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectClaim']>>>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaginatedProjectInvoicesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedProjectInvoices'] = ResolversParentTypes['PaginatedProjectInvoices']> = ResolversObject<{
  projectInvoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectInvoice']>>>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaginatedProjectTimeCostsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedProjectTimeCosts'] = ResolversParentTypes['PaginatedProjectTimeCosts']> = ResolversObject<{
  projectTimeCosts?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectTimeCost']>>>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaginatedSharedWithMeTasksResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedSharedWithMeTasks'] = ResolversParentTypes['PaginatedSharedWithMeTasks']> = ResolversObject<{
  tasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaginatedTaskBoardsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedTaskBoards'] = ResolversParentTypes['PaginatedTaskBoards']> = ResolversObject<{
  taskBoards?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaginatedTasksResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedTasks'] = ResolversParentTypes['PaginatedTasks']> = ResolversObject<{
  tasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaymentMethodResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = ResolversObject<{
  card?: Resolver<Maybe<ResolversTypes['PaymentMethodCard']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  customer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaymentMethodCardResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaymentMethodCard'] = ResolversParentTypes['PaymentMethodCard']> = ResolversObject<{
  brand?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  expYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  exp_month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  exp_year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  last4?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductInCouponResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProductInCoupon'] = ResolversParentTypes['ProductInCoupon']> = ResolversObject<{
  products?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectClaimResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectClaim'] = ResolversParentTypes['ProjectClaim']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  attachmentUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['ProjectClaimType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectGroup'] = ResolversParentTypes['ProjectGroup']> = ResolversObject<{
  customColumns?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectGroupCustomColumn']>>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ordering?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  tasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<ProjectGroupTasksArgs, never>>;
  totalTasks?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectGroupCustomAttributeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectGroupCustomAttribute'] = ResolversParentTypes['ProjectGroupCustomAttribute']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['ProjectGroupCustomAttributeType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectGroupCustomColumnResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectGroupCustomColumn'] = ResolversParentTypes['ProjectGroupCustomColumn']> = ResolversObject<{
  attribute?: Resolver<Maybe<ResolversTypes['ProjectGroupCustomAttribute']>, ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['ProjectGroup']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectInvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectInvoice'] = ResolversParentTypes['ProjectInvoice']> = ResolversObject<{
  actualCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  invoiceNo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  variance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectSettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectSettings'] = ResolversParentTypes['ProjectSettings']> = ResolversObject<{
  columns?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectStatus'] = ResolversParentTypes['ProjectStatus']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  sequence?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectTemplateResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectTemplate'] = ResolversParentTypes['ProjectTemplate']> = ResolversObject<{
  columns?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  statuses?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectTemplateStatus']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectTemplateGalleryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectTemplateGallery'] = ResolversParentTypes['ProjectTemplateGallery']> = ResolversObject<{
  galleryTemplates?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectTemplateStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectTemplateStatus'] = ResolversParentTypes['ProjectTemplateStatus']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  projectTemplate?: Resolver<Maybe<ResolversTypes['ProjectTemplate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectTimeCostResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectTimeCost'] = ResolversParentTypes['ProjectTimeCost']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  timeIn?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  timeOut?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PublicHolidayResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicHoliday'] = ResolversParentTypes['PublicHoliday']> = ResolversObject<{
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  attendanceDaySummaries?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceDaySummary']>>>, ParentType, ContextType, RequireFields<QueryAttendanceDaySummariesArgs, 'companyId' | 'selectedDate'>>;
  attendanceDaySummary?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceDaySummary']>>>, ParentType, ContextType, RequireFields<QueryAttendanceDaySummaryArgs, 'companyId' | 'input'>>;
  attendanceLabels?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceLabel']>>>, ParentType, ContextType, RequireFields<QueryAttendanceLabelsArgs, 'companyId'>>;
  attendanceMemberStats?: Resolver<Maybe<ResolversTypes['AttendanceMemberStats']>, ParentType, ContextType, RequireFields<QueryAttendanceMemberStatsArgs, 'memberId'>>;
  attendanceMonthSummary?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceMonthSummary']>>>, ParentType, ContextType, RequireFields<QueryAttendanceMonthSummaryArgs, 'companyId' | 'input'>>;
  attendanceSettings?: Resolver<Maybe<ResolversTypes['AttendanceSettings']>, ParentType, ContextType, RequireFields<QueryAttendanceSettingsArgs, 'companyId'>>;
  attendanceWeekSummary?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceWeekSummary']>>>, ParentType, ContextType, RequireFields<QueryAttendanceWeekSummaryArgs, 'companyId' | 'input'>>;
  attendanceWeeklyForMonthSummary?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceWeekSummary']>>>, ParentType, ContextType, RequireFields<QueryAttendanceWeeklyForMonthSummaryArgs, 'companyId' | 'input'>>;
  attendances?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attendance']>>>, ParentType, ContextType, RequireFields<QueryAttendancesArgs, 'input'>>;
  billingInvoice?: Resolver<Maybe<ResolversTypes['BillingInvoice']>, ParentType, ContextType, RequireFields<QueryBillingInvoiceArgs, 'id'>>;
  billingInvoiceItem?: Resolver<Maybe<ResolversTypes['BillingInvoiceItem']>, ParentType, ContextType, RequireFields<QueryBillingInvoiceItemArgs, 'id'>>;
  billingInvoiceItems?: Resolver<Maybe<Array<Maybe<ResolversTypes['BillingInvoiceItem']>>>, ParentType, ContextType, RequireFields<QueryBillingInvoiceItemsArgs, 'invoiceId'>>;
  billingInvoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['BillingInvoice']>>>, ParentType, ContextType, RequireFields<QueryBillingInvoicesArgs, 'projectId'>>;
  breadcrumbInfo?: Resolver<Maybe<ResolversTypes['BreadcrumbInfo']>, ParentType, ContextType, RequireFields<QueryBreadcrumbInfoArgs, 'id' | 'type'>>;
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<QueryCollectionArgs, 'collectionId'>>;
  collectionPeriod?: Resolver<Maybe<ResolversTypes['CollectionPeriod']>, ParentType, ContextType, RequireFields<QueryCollectionPeriodArgs, 'collectionPeriodId'>>;
  collectionPeriods?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionPeriod']>>>, ParentType, ContextType, RequireFields<QueryCollectionPeriodsArgs, 'collectionId'>>;
  collector?: Resolver<Maybe<ResolversTypes['Collector']>, ParentType, ContextType, RequireFields<QueryCollectorArgs, 'collectorId'>>;
  collectorActivities?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollectionActivityLog']>>>, ParentType, ContextType, RequireFields<QueryCollectorActivitiesArgs, 'companyId'>>;
  collectors?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collector']>>>, ParentType, ContextType, RequireFields<QueryCollectorsArgs, 'companyId'>>;
  companies?: Resolver<Maybe<Array<Maybe<ResolversTypes['Company']>>>, ParentType, ContextType, RequireFields<QueryCompaniesArgs, never>>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<QueryCompanyArgs, 'id'>>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType, RequireFields<QueryCompanyMemberArgs, 'companyMemberId'>>;
  companyPaymentMethods?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyPaymentMethod']>>>, ParentType, ContextType, RequireFields<QueryCompanyPaymentMethodsArgs, 'companyId'>>;
  companyProfileJson?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryCompanyProfileJsonArgs, 'companyId'>>;
  companySlug?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, RequireFields<QueryCompanySlugArgs, never>>;
  companyStorage?: Resolver<Maybe<ResolversTypes['CompanyStorageDetails']>, ParentType, ContextType, RequireFields<QueryCompanyStorageArgs, 'companyId'>>;
  companySubscription?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType, RequireFields<QueryCompanySubscriptionArgs, 'subscriptionId'>>;
  companySubscriptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType, RequireFields<QueryCompanySubscriptionsArgs, 'companyId'>>;
  companyTeam?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType, RequireFields<QueryCompanyTeamArgs, 'id'>>;
  companyTeams?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>>, ParentType, ContextType, RequireFields<QueryCompanyTeamsArgs, 'companyId'>>;
  companyWorkDaySettings?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyWorkDaySetting']>>>, ParentType, ContextType, RequireFields<QueryCompanyWorkDaySettingsArgs, 'companyId' | 'employeeTypeId'>>;
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType, RequireFields<QueryContactArgs, 'id'>>;
  contactActivities?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactActivityRaw']>>>, ParentType, ContextType, RequireFields<QueryContactActivitiesArgs, 'contactId' | 'isCount' | 'limit' | 'offset' | 'tableType'>>;
  contactGroup?: Resolver<Maybe<ResolversTypes['ContactGroup']>, ParentType, ContextType, RequireFields<QueryContactGroupArgs, 'companyId' | 'groupId'>>;
  contactGroups?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContactGroup']>>>, ParentType, ContextType, RequireFields<QueryContactGroupsArgs, 'companyId'>>;
  contacts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Contact']>>>, ParentType, ContextType, RequireFields<QueryContactsArgs, 'companyId'>>;
  currentAttendance?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType, RequireFields<QueryCurrentAttendanceArgs, 'memberId'>>;
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  customTimesheetApprovals?: Resolver<Maybe<Array<Maybe<ResolversTypes['CustomTimesheetDayApproval']>>>, ParentType, ContextType, RequireFields<QueryCustomTimesheetApprovalsArgs, 'companyId'>>;
  dedocoPackages?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionPackage']>>>, ParentType, ContextType>;
  employeeType?: Resolver<Maybe<ResolversTypes['EmployeeType']>, ParentType, ContextType, RequireFields<QueryEmployeeTypeArgs, 'employeeTypeId'>>;
  filterTimesheet?: Resolver<Maybe<Array<Maybe<ResolversTypes['Timesheet']>>>, ParentType, ContextType, RequireFields<QueryFilterTimesheetArgs, never>>;
  getActivityTimeSummaryByDay?: Resolver<Maybe<Array<Maybe<ResolversTypes['ActivityDaySummary']>>>, ParentType, ContextType, RequireFields<QueryGetActivityTimeSummaryByDayArgs, 'companyId' | 'filters'>>;
  getActivityTimeSummaryByMonth?: Resolver<Maybe<Array<Maybe<ResolversTypes['ActivityMonthSummary']>>>, ParentType, ContextType, RequireFields<QueryGetActivityTimeSummaryByMonthArgs, 'companyId' | 'filters'>>;
  getActivityTimeSummaryByWeek?: Resolver<Maybe<Array<Maybe<ResolversTypes['ActivityWeekSummary']>>>, ParentType, ContextType, RequireFields<QueryGetActivityTimeSummaryByWeekArgs, 'companyId' | 'filters'>>;
  getCollaboratedCollectors?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collector']>>>, ParentType, ContextType>;
  getCollector?: Resolver<Maybe<ResolversTypes['Collector']>, ParentType, ContextType, RequireFields<QueryGetCollectorArgs, 'collectorId'>>;
  getMonthlyActivityTrackingByMonth?: Resolver<Maybe<Array<Maybe<ResolversTypes['ActivityWeekSummary']>>>, ParentType, ContextType, RequireFields<QueryGetMonthlyActivityTrackingByMonthArgs, 'companyId' | 'filters'>>;
  getReferenceImageUploadUrl?: Resolver<Maybe<ResolversTypes['CompanyMemberReferenceImageResponse']>, ParentType, ContextType, RequireFields<QueryGetReferenceImageUploadUrlArgs, 'companyId'>>;
  getServerTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType, RequireFields<QueryGetServerTimeArgs, 'companyId'>>;
  getTaskPics?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskPic']>>>, ParentType, ContextType>;
  getTimesheetsByCompanyMember?: Resolver<Maybe<Array<Maybe<ResolversTypes['Timesheet']>>>, ParentType, ContextType, RequireFields<QueryGetTimesheetsByCompanyMemberArgs, 'companyMemberId'>>;
  getVerificationImageUploadUrl?: Resolver<Maybe<ResolversTypes['VerificationImageUploadUrlResponse']>, ParentType, ContextType, RequireFields<QueryGetVerificationImageUploadUrlArgs, 'companyId'>>;
  globalProjectTemplateGallery?: Resolver<Maybe<ResolversTypes['ProjectTemplateGallery']>, ParentType, ContextType>;
  holidays?: Resolver<Maybe<Array<Maybe<ResolversTypes['Holiday']>>>, ParentType, ContextType, RequireFields<QueryHolidaysArgs, 'companyId' | 'year'>>;
  listCollectors?: Resolver<Maybe<Array<Maybe<ResolversTypes['Collector']>>>, ParentType, ContextType, RequireFields<QueryListCollectorsArgs, 'companyId'>>;
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<QueryLocationArgs, 'id'>>;
  locations?: Resolver<Maybe<Array<Maybe<ResolversTypes['Location']>>>, ParentType, ContextType, RequireFields<QueryLocationsArgs, 'companyId'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  memberLastOut?: Resolver<Maybe<ResolversTypes['Attendance']>, ParentType, ContextType, RequireFields<QueryMemberLastOutArgs, 'companyMemberId'>>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'id'>>;
  projectClaim?: Resolver<Maybe<ResolversTypes['ProjectClaim']>, ParentType, ContextType, RequireFields<QueryProjectClaimArgs, 'claimId'>>;
  projectClaims?: Resolver<Maybe<ResolversTypes['PaginatedProjectClaims']>, ParentType, ContextType, RequireFields<QueryProjectClaimsArgs, never>>;
  projectInvoice?: Resolver<Maybe<ResolversTypes['ProjectInvoice']>, ParentType, ContextType, RequireFields<QueryProjectInvoiceArgs, 'invoiceId'>>;
  projectInvoices?: Resolver<Maybe<ResolversTypes['PaginatedProjectInvoices']>, ParentType, ContextType, RequireFields<QueryProjectInvoicesArgs, never>>;
  projectTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectTemplate']>>>, ParentType, ContextType, RequireFields<QueryProjectTemplatesArgs, 'companyId'>>;
  projectTimeCost?: Resolver<Maybe<ResolversTypes['ProjectTimeCost']>, ParentType, ContextType, RequireFields<QueryProjectTimeCostArgs, 'timeCostId'>>;
  projectTimeCosts?: Resolver<Maybe<ResolversTypes['PaginatedProjectTimeCosts']>, ParentType, ContextType, RequireFields<QueryProjectTimeCostsArgs, never>>;
  projects?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<QueryProjectsArgs, 'memberId'>>;
  promoCodeInfo?: Resolver<Maybe<Array<Maybe<ResolversTypes['DiscountedPrice']>>>, ParentType, ContextType, RequireFields<QueryPromoCodeInfoArgs, 'code' | 'createSubscriptionInput'>>;
  redisTest?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  senangPayUsers?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType, RequireFields<QuerySenangPayUsersArgs, 'companyId'>>;
  sharedWithMeTasks?: Resolver<Maybe<ResolversTypes['PaginatedSharedWithMeTasks']>, ParentType, ContextType, RequireFields<QuerySharedWithMeTasksArgs, never>>;
  shortUrl?: Resolver<Maybe<ResolversTypes['ShortUrl']>, ParentType, ContextType, RequireFields<QueryShortUrlArgs, 'shortId'>>;
  subscription?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, RequireFields<QuerySubscriptionArgs, never>>;
  subscriptionPackageV2?: Resolver<Maybe<ResolversTypes['SubscriptionPackage']>, ParentType, ContextType, RequireFields<QuerySubscriptionPackageV2Args, 'packageId'>>;
  subscriptionPackages?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionPackage']>>>, ParentType, ContextType>;
  subscriptionPackagesV2?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionPackage']>>>, ParentType, ContextType, RequireFields<QuerySubscriptionPackagesV2Args, never>>;
  subscriptionProduct?: Resolver<Maybe<ResolversTypes['SubscriptionProduct']>, ParentType, ContextType, RequireFields<QuerySubscriptionProductArgs, 'productId'>>;
  subscriptionProducts?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionProduct']>>>, ParentType, ContextType>;
  subscriptionQuantitiesAssigned?: Resolver<Maybe<ResolversTypes['SubscriptionQuantityResult']>, ParentType, ContextType, RequireFields<QuerySubscriptionQuantitiesAssignedArgs, 'companyId' | 'stripeProductId'>>;
  subscriptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['Subscription']>>>, ParentType, ContextType, RequireFields<QuerySubscriptionsArgs, never>>;
  tag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<QueryTagArgs, 'id'>>;
  tagGroup?: Resolver<Maybe<ResolversTypes['TagGroup']>, ParentType, ContextType, RequireFields<QueryTagGroupArgs, 'id'>>;
  tagGroups?: Resolver<Maybe<Array<Maybe<ResolversTypes['TagGroup']>>>, ParentType, ContextType, RequireFields<QueryTagGroupsArgs, 'companyId'>>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType, RequireFields<QueryTagsArgs, 'companyId'>>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTaskArgs, 'taskId'>>;
  taskBoard?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType, RequireFields<QueryTaskBoardArgs, 'id'>>;
  taskBoardFolders?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoardFolder']>>>, ParentType, ContextType, RequireFields<QueryTaskBoardFoldersArgs, 'type'>>;
  taskBoardTeams?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoardTeam']>>>, ParentType, ContextType, RequireFields<QueryTaskBoardTeamsArgs, 'companyId' | 'type'>>;
  taskBoards?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType, RequireFields<QueryTaskBoardsArgs, 'companyId' | 'type'>>;
  taskBoardsV3?: Resolver<Maybe<ResolversTypes['PaginatedTaskBoards']>, ParentType, ContextType, RequireFields<QueryTaskBoardsV3Args, never>>;
  taskPics?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskPic']>>>, ParentType, ContextType>;
  taskTemplate?: Resolver<Maybe<ResolversTypes['TaskTemplate']>, ParentType, ContextType, RequireFields<QueryTaskTemplateArgs, 'companyId' | 'id'>>;
  taskTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskTemplate']>>>, ParentType, ContextType, RequireFields<QueryTaskTemplatesArgs, 'companyId'>>;
  tasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<QueryTasksArgs, 'companyId'>>;
  tasksV3?: Resolver<Maybe<ResolversTypes['PaginatedTasks']>, ParentType, ContextType, RequireFields<QueryTasksV3Args, never>>;
  teamStatuses?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeamStatus']>>>, ParentType, ContextType, RequireFields<QueryTeamStatusesArgs, 'companyTeamId'>>;
  timesheet?: Resolver<Maybe<ResolversTypes['Timesheet']>, ParentType, ContextType, RequireFields<QueryTimesheetArgs, 'timesheetId'>>;
  timesheetApprovals?: Resolver<Maybe<Array<Maybe<ResolversTypes['TimesheetDayApproval']>>>, ParentType, ContextType, RequireFields<QueryTimesheetApprovalsArgs, 'companyId'>>;
  timesheets?: Resolver<Maybe<Array<Maybe<ResolversTypes['Timesheet']>>>, ParentType, ContextType, RequireFields<QueryTimesheetsArgs, 'companyId'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  userInvoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['StripeInvoice']>>>, ParentType, ContextType>;
  userSubscriptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanySubscription']>>>, ParentType, ContextType>;
  workspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<QueryWorkspaceArgs, 'id'>>;
  workspaces?: Resolver<Maybe<Array<Maybe<ResolversTypes['Workspace']>>>, ParentType, ContextType, RequireFields<QueryWorkspacesArgs, 'companyId'>>;
}>;

export type ReminderStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReminderStatus'] = ResolversParentTypes['ReminderStatus']> = ResolversObject<{
  email?: Resolver<Maybe<ResolversTypes['ServiceHistory']>, ParentType, ContextType>;
  whatsapp?: Resolver<Maybe<ResolversTypes['ServiceHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RequestAccountDeletionResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['RequestAccountDeletionResponse'] = ResolversParentTypes['RequestAccountDeletionResponse']> = ResolversObject<{
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ResourcePermissionResolvers<ContextType = any, ParentType extends ResolversParentTypes['ResourcePermission'] = ResolversParentTypes['ResourcePermission']> = ResolversObject<{
  companyMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  company_members?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  teams?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceHistoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ServiceHistory'] = ResolversParentTypes['ServiceHistory']> = ResolversObject<{
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['ReminderStatusTypes']>, ParentType, ContextType>;
  to?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['ServiceHistoryTypes']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ShortUrlResolvers<ContextType = any, ParentType extends ResolversParentTypes['ShortUrl'] = ResolversParentTypes['ShortUrl']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  full_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  short_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StripeCouponResolvers<ContextType = any, ParentType extends ResolversParentTypes['StripeCoupon'] = ResolversParentTypes['StripeCoupon']> = ResolversObject<{
  amountOff?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  amount_off?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  appliesTo?: Resolver<Maybe<ResolversTypes['ProductInCoupon']>, ParentType, ContextType>;
  applies_to?: Resolver<Maybe<ResolversTypes['ProductInCoupon']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  maxRedemptions?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  max_redemptions?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['StripeCouponMetaData']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  object?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentOff?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  percent_off?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  redeemBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  redeem_by?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  timesRedeemed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  times_redeemed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  valid?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StripeCouponMetaDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['StripeCouponMetaData'] = ResolversParentTypes['StripeCouponMetaData']> = ResolversObject<{
  applicableProducts?: Resolver<Maybe<Array<Maybe<ResolversTypes['ID']>>>, ParentType, ContextType>;
  applicable_products?: Resolver<Maybe<Array<Maybe<ResolversTypes['ID']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StripeCustomerDetailsResolvers<ContextType = any, ParentType extends ResolversParentTypes['StripeCustomerDetails'] = ResolversParentTypes['StripeCustomerDetails']> = ResolversObject<{
  default_currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StripeInvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['StripeInvoice'] = ResolversParentTypes['StripeInvoice']> = ResolversObject<{
  accountCountry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  accountName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  account_country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  account_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  amountDue?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  amountPaid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  amountRemaining?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  amount_due?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  amount_paid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  amount_remaining?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  attemptCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  attempt_count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  attempted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  billingReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  billing_reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  charge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  collection_method?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerShipping?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerTaxExempt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer_email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer_phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer_shipping?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer_tax_exempt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultPaymentMethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  default_payment_method?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endingBalance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ending_balance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hostedInvoiceUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hosted_invoice_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoicePdf?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoice_pdf?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nextPaymentAttempt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  next_payment_attempt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  object?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paid?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  paymentIntent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payment_intent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  periodEnd?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  periodStart?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  period_end?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  period_start?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  receiptNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receipt_number?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subtotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tax?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  webhooksDeliveredAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  webhooks_delivered_at?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StripePromoCodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['StripePromoCode'] = ResolversParentTypes['StripePromoCode']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coupon?: Resolver<Maybe<ResolversTypes['StripeCoupon']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  customer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  expires_at?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  maxRedemptions?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  max_redemptions?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  timesRedeemed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  times_redeemed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  company?: SubscriptionResolver<Maybe<ResolversTypes['Company']>, "company", ParentType, ContextType>;
  createdAt?: SubscriptionResolver<Maybe<ResolversTypes['DateTime']>, "createdAt", ParentType, ContextType>;
  id?: SubscriptionResolver<ResolversTypes['ID'], "id", ParentType, ContextType>;
  intervalType?: SubscriptionResolver<Maybe<ResolversTypes['SubscriptionPriceInterval']>, "intervalType", ParentType, ContextType>;
  invoiceQuota?: SubscriptionResolver<Maybe<ResolversTypes['Int']>, "invoiceQuota", ParentType, ContextType>;
  package?: SubscriptionResolver<Maybe<ResolversTypes['SubscriptionPackage']>, "package", ParentType, ContextType>;
  reportQuota?: SubscriptionResolver<Maybe<ResolversTypes['Int']>, "reportQuota", ParentType, ContextType>;
  storageQuota?: SubscriptionResolver<Maybe<ResolversTypes['Float']>, "storageQuota", ParentType, ContextType>;
  stripeSubscriptionId?: SubscriptionResolver<Maybe<ResolversTypes['String']>, "stripeSubscriptionId", ParentType, ContextType>;
  taskQuota?: SubscriptionResolver<Maybe<ResolversTypes['Int']>, "taskQuota", ParentType, ContextType>;
  teamQuota?: SubscriptionResolver<Maybe<ResolversTypes['Int']>, "teamQuota", ParentType, ContextType>;
  upcomingChanges?: SubscriptionResolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionChange']>>>, "upcomingChanges", ParentType, ContextType>;
  updatedAt?: SubscriptionResolver<Maybe<ResolversTypes['DateTime']>, "updatedAt", ParentType, ContextType>;
  userQuota?: SubscriptionResolver<Maybe<ResolversTypes['Int']>, "userQuota", ParentType, ContextType>;
}>;

export type SubscriptionChangeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionChange'] = ResolversParentTypes['SubscriptionChange']> = ResolversObject<{
  action?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  actionData?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  runAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionDiscountResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionDiscount'] = ResolversParentTypes['SubscriptionDiscount']> = ResolversObject<{
  coupon?: Resolver<Maybe<ResolversTypes['StripeCoupon']>, ParentType, ContextType>;
  customer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  promotionCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  promotion_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  start?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionPackageResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionPackage'] = ResolversParentTypes['SubscriptionPackage']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invoiceQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isCustom?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  packagePrices?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionPackagePrice']>>>, ParentType, ContextType>;
  package_prices?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionPackagePrice']>>>, ParentType, ContextType>;
  phoneCallQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  phone_call_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  productId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  product_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  products?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionProduct']>>>, ParentType, ContextType>;
  published?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  reportQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sequence?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  signatureQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  signature_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  smsQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sms_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  storage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  storageQuota?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taskQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  teamQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['PackageTypes']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  whatsappQuota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  whatsapp_quota?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionPackagePriceResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionPackagePrice'] = ResolversParentTypes['SubscriptionPackagePrice']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interval?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  intervalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  interval_count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  package?: Resolver<Maybe<ResolversTypes['SubscriptionPackage']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stripePriceId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripe_price_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionPriceResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionPrice'] = ResolversParentTypes['SubscriptionPrice']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  interval?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripePriceId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeProductId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionProductResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionProduct'] = ResolversParentTypes['SubscriptionProduct']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  prices?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionPrice']>>>, ParentType, ContextType>;
  stripeProductId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionPromoCodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionPromoCode'] = ResolversParentTypes['SubscriptionPromoCode']> = ResolversObject<{
  amountOff?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  amount_off?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  percentOff?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  percent_off?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  promoCodeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  promo_code_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['CompanySubscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionQuantityResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionQuantityResult'] = ResolversParentTypes['SubscriptionQuantityResult']> = ResolversObject<{
  assigned?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  companyMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  company_members?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubtaskResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subtask'] = ResolversParentTypes['Subtask']> = ResolversObject<{
  checked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sequence?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TagResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['TagGroup']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TagGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['TagGroup'] = ResolversParentTypes['TagGroup']> = ResolversObject<{
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskResolvers<ContextType = any, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = ResolversObject<{
  actualCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  actualEffort?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  actualEnd?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  actualStart?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  actualValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  actual_cost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  actual_end?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  actual_start?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  approvedCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  archivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  archivedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskAttachment']>>>, ParentType, ContextType>;
  checklists?: Resolver<Maybe<Array<Maybe<ResolversTypes['Checklist']>>>, ParentType, ContextType, RequireFields<TaskChecklistsArgs, never>>;
  childTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType>;
  comments?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskComment']>>>, ParentType, ContextType, RequireFields<TaskCommentsArgs, never>>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  companyTeam?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType>;
  companyTeamStatus?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType>;
  company_team?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType>;
  company_team_status?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType>;
  completed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  customValues?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskCustomValue']>>>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  dueReminder?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  due_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  due_reminder?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  fileType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  file_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['ProjectGroup']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  members?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskMember']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  pics?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskPic']>>>, ParentType, ContextType>;
  pinned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  plannedEffort?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  planned_effort?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  posY?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['TaskPriorityType']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  projectStatus?: Resolver<Maybe<ResolversTypes['ProjectStatus']>, ParentType, ContextType>;
  projectedCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  projectedValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  projected_cost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  published?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  spentEffort?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  spent_effort?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stageStatus?: Resolver<Maybe<ResolversTypes['StageType']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['CompanyTeamStatusType']>, ParentType, ContextType>;
  subtasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Subtask']>>>, ParentType, ContextType, RequireFields<TaskSubtasksArgs, never>>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  taskActivities?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskActivity']>>>, ParentType, ContextType>;
  taskBoard?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  taskBoardTeam?: Resolver<Maybe<ResolversTypes['TaskBoardTeam']>, ParentType, ContextType>;
  task_activities?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskActivity']>>>, ParentType, ContextType>;
  task_board?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  task_board_team?: Resolver<Maybe<ResolversTypes['TaskBoardTeam']>, ParentType, ContextType>;
  templateTask?: Resolver<Maybe<ResolversTypes['TaskTemplate']>, ParentType, ContextType>;
  timeSpent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  timeSpentMember?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time_spent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  timerTotals?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskTimerTotal']>>>, ParentType, ContextType>;
  timer_totals?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskTimerTotal']>>>, ParentType, ContextType>;
  timesheets?: Resolver<Maybe<Array<Maybe<ResolversTypes['Timesheet']>>>, ParentType, ContextType>;
  totalRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType, RequireFields<TaskTotalRateArgs, 'dates'>>;
  type?: Resolver<Maybe<ResolversTypes['TaskType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['CommonVisibility']>, ParentType, ContextType>;
  visibilityWhitelist?: Resolver<Maybe<ResolversTypes['CommonVisibilityWhitelist']>, ParentType, ContextType>;
  watchers?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskWatcher']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskActivityResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskActivity'] = ResolversParentTypes['TaskActivity']> = ResolversObject<{
  actionType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  action_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachment?: Resolver<Maybe<ResolversTypes['TaskAttachment']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  fieldName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  field_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fromCardStatus?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType>;
  fromDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  fromLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fromValueTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  from_card_status?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType>;
  from_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  from_label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  from_value_to?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  targetMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  targetPic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  target_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  target_pic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  toCardStatus?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType>;
  toDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  toLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  to_card_status?: Resolver<Maybe<ResolversTypes['CompanyTeamStatus']>, ParentType, ContextType>;
  to_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  to_label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  to_value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskAttachmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskAttachment'] = ResolversParentTypes['TaskAttachment']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  documentHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  document_hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  encoding?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  externalSource?: Resolver<Maybe<ResolversTypes['ExternalFileSource']>, ParentType, ContextType>;
  fileSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_size?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDeleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isExternal?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  path?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskBoardResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskBoard'] = ResolversParentTypes['TaskBoard']> = ResolversObject<{
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  archivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  archivedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  associateBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  associate_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['TaskBoardCategory']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  folder?: Resolver<Maybe<ResolversTypes['TaskBoardFolder']>, ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectGroup']>>>, ParentType, ContextType, RequireFields<TaskBoardGroupsArgs, never>>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  members?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskMember']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owners?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoardOwner']>>>, ParentType, ContextType>;
  pinned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  projectSettings?: Resolver<Maybe<ResolversTypes['ProjectSettings']>, ParentType, ContextType>;
  projectStatuses?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectStatus']>>>, ParentType, ContextType>;
  published?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TaskBoardStatusType']>, ParentType, ContextType>;
  taskBoardTeams?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoardTeam']>>>, ParentType, ContextType>;
  task_board_teams?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoardTeam']>>>, ParentType, ContextType>;
  tasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<TaskBoardTasksArgs, never>>;
  timeSpent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time_spent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['TaskBoardType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['CommonVisibility']>, ParentType, ContextType>;
  visibilityWhitelist?: Resolver<Maybe<ResolversTypes['CommonVisibilityWhitelist']>, ParentType, ContextType>;
  workspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskBoardFolderResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskBoardFolder'] = ResolversParentTypes['TaskBoardFolder']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taskBoards?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskBoardFolderTypeResolvers = EnumResolverSignature<{ COLLABORATION?: any, INTERNAL?: any, PERSONAL?: any, PROJECT?: any }, ResolversTypes['TaskBoardFolderType']>;

export type TaskBoardOwnerResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskBoardOwner'] = ResolversParentTypes['TaskBoardOwner']> = ResolversObject<{
  board?: Resolver<Maybe<ResolversTypes['TaskBoard']>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskBoardTeamResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskBoardTeam'] = ResolversParentTypes['TaskBoardTeam']> = ResolversObject<{
  companyTeam?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType>;
  company_team?: Resolver<Maybe<ResolversTypes['CompanyTeam']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskBoardVisibilityResolvers = EnumResolverSignature<{ ASSIGNED?: any, HIDDEN?: any, PRIVATE?: any, PUBLIC?: any, SPECIFIC?: any }, ResolversTypes['TaskBoardVisibility']>;

export type TaskBoardVisibilityWhitelistResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskBoardVisibilityWhitelist'] = ResolversParentTypes['TaskBoardVisibilityWhitelist']> = ResolversObject<{
  members?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyMember']>>>, ParentType, ContextType>;
  teams?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompanyTeam']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskCommentResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskComment'] = ResolversParentTypes['TaskComment']> = ResolversObject<{
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskAttachment']>>>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  messageContent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentTaskComment?: Resolver<Maybe<ResolversTypes['TaskComment']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskCustomValueResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskCustomValue'] = ResolversParentTypes['TaskCustomValue']> = ResolversObject<{
  attribute?: Resolver<Maybe<ResolversTypes['ProjectGroupCustomAttribute']>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['ProjectGroup']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskMemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskMember'] = ResolversParentTypes['TaskMember']> = ResolversObject<{
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskPicResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskPic'] = ResolversParentTypes['TaskPic']> = ResolversObject<{
  contact?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pic?: Resolver<Maybe<ResolversTypes['ContactPic']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<TaskPicTaskArgs, never>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskPriorityTypeResolvers = EnumResolverSignature<{ HIGH?: any, LOW?: any, MEDIUM?: any }, ResolversTypes['TaskPriorityType']>;

export type TaskTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskTag'] = ResolversParentTypes['TaskTag']> = ResolversObject<{
  tag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskTemplateResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskTemplate'] = ResolversParentTypes['TaskTemplate']> = ResolversObject<{
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskTemplateAttachment']>>>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  copyAttachments?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  copySubtasks?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  isRecurring?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskTemplateItem']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recurringSetting?: Resolver<Maybe<ResolversTypes['TaskTemplateRecurringSetting']>, ParentType, ContextType>;
  templateId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['TemplateType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskTemplateAttachmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskTemplateAttachment'] = ResolversParentTypes['TaskTemplateAttachment']> = ResolversObject<{
  bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  filesize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  path?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskTemplateItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskTemplateItem'] = ResolversParentTypes['TaskTemplateItem']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isSubtask?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sequence?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskTemplateRecurringSettingResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskTemplateRecurringSetting'] = ResolversParentTypes['TaskTemplateRecurringSetting']> = ResolversObject<{
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  intervalType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  skipWeekend?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskTimerEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskTimerEntry'] = ResolversParentTypes['TaskTimerEntry']> = ResolversObject<{
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  timeTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskTimerTotalResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskTimerTotal'] = ResolversParentTypes['TaskTimerTotal']> = ResolversObject<{
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  memberTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  member_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskWatcherResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskWatcher'] = ResolversParentTypes['TaskWatcher']> = ResolversObject<{
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TemplateResolvers<ContextType = any, ParentType extends ResolversParentTypes['Template'] = ResolversParentTypes['Template']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TaskTemplate', ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['TemplateType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
}>;

export type TimesheetResolvers<ContextType = any, ParentType extends ResolversParentTypes['Timesheet'] = ResolversParentTypes['Timesheet']> = ResolversObject<{
  activity?: Resolver<Maybe<ResolversTypes['TimesheetActivity']>, ParentType, ContextType>;
  archived?: Resolver<Maybe<ResolversTypes['TimesheetArchiveStatus']>, ParentType, ContextType>;
  comments?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  company_member?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  submitted_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  timeTotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TimesheetActivityResolvers<ContextType = any, ParentType extends ResolversParentTypes['TimesheetActivity'] = ResolversParentTypes['TimesheetActivity']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TimesheetDayApprovalResolvers<ContextType = any, ParentType extends ResolversParentTypes['TimesheetDayApproval'] = ResolversParentTypes['TimesheetDayApproval']> = ResolversObject<{
  billable?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  companyMember?: Resolver<Maybe<ResolversTypes['CompanyMember']>, ParentType, ContextType>;
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TimesheetApprovalStatus']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ToolTipsStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['ToolTipsStatus'] = ResolversParentTypes['ToolTipsStatus']> = ResolversObject<{
  ADD_CLIENT_COLLECTOR?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ADD_COMPANY_MEMBERS?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ADD_COMPANY_TEAM?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ADD_CONTACT?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ADD_CONTACT_GROUP?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ADD_INTERNAL_TASK_BOARD?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ADD_TASK?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ADD_TASK_BOARD_TEAM?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ASSIGN_CONTACT_GROUP_FOR_CONTACT?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  COLLECTION_LIST_VIEW_TYPE_AND_STATUS_SORTING?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  CREATE_COLLECTION?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  CREATE_COMPANY?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  EDIT_COMPANY?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  EDIT_COMPANY_TEAM?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  EDIT_TASK?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  INITIAL?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  PAYMENTS_PAGE?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  SETUP_PAYMENT_DETAILS?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  SUBSCRIBE_PACKAGE?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  SWITCH_CONTACT_GROUP_TAB?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  TASK_SHARED_WITH_ME?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  TASK_VIEW_MODE?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  VIEW_COLLECTION?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  VIEW_CONTACT_DETAIL?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TotalNotificationCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['TotalNotificationCount'] = ResolversParentTypes['TotalNotificationCount']> = ResolversObject<{
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TotalTimesheetApprovalResolvers<ContextType = any, ParentType extends ResolversParentTypes['TotalTimesheetApproval'] = ResolversParentTypes['TotalTimesheetApproval']> = ResolversObject<{
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnreadCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['UnreadCount'] = ResolversParentTypes['UnreadCount']> = ResolversObject<{
  unread?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateTaskParentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateTaskParentResponse'] = ResolversParentTypes['UpdateTaskParentResponse']> = ResolversObject<{
  destinationTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType>;
  sourceTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  auth0Id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  auth0_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  companies?: Resolver<Maybe<Array<Maybe<ResolversTypes['Company']>>>, ParentType, ContextType>;
  contactNo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact_no?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  customerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultCompany?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  defaultTimezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  default_company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  default_timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailAuth?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  emailVerificationCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email_auth?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email_verification_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  facebookId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facebook_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  googleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  google_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastActiveAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastLogin?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  last_active_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  last_login?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  linkedinId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  linkedin_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  onboarding?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  paymentMethodId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethods?: Resolver<Maybe<Array<Maybe<ResolversTypes['PaymentMethod']>>>, ParentType, ContextType>;
  payment_method_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payment_methods?: Resolver<Maybe<Array<Maybe<ResolversTypes['PaymentMethod']>>>, ParentType, ContextType>;
  profileImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profileImageSize?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  profileImages?: Resolver<Maybe<ResolversTypes['ImageGroup']>, ParentType, ContextType>;
  profile_image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refreshToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refresh_token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registered?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  resetToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resetTokenValidity?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reset_token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reset_token_validity?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  signUpData?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  stripeCustomerDetails?: Resolver<Maybe<ResolversTypes['StripeCustomerDetails']>, ParentType, ContextType>;
  tooltipsStatus?: Resolver<Maybe<ResolversTypes['ToolTipsStatus']>, ParentType, ContextType>;
  tooltips_status?: Resolver<Maybe<ResolversTypes['ToolTipsStatus']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  viewNotificationAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewOptions?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  view_notification_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserNotificationResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserNotification'] = ResolversParentTypes['UserNotification']> = ResolversObject<{
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  is_read?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notification?: Resolver<Maybe<ResolversTypes['Notification']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user_type?: Resolver<Maybe<ResolversTypes['UserNotificationType']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationImageUploadUrlResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['VerificationImageUploadUrlResponse'] = ResolversParentTypes['VerificationImageUploadUrlResponse']> = ResolversObject<{
  s3Bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3Key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  s3_key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  upload_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkHourTotalsResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkHourTotals'] = ResolversParentTypes['WorkHourTotals']> = ResolversObject<{
  overtime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regular?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tracked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  worked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkspaceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Workspace'] = ResolversParentTypes['Workspace']> = ResolversObject<{
  bgColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projects?: Resolver<Maybe<Array<Maybe<ResolversTypes['TaskBoard']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['CommonVisibility']>, ParentType, ContextType>;
  visibilityWhitelist?: Resolver<Maybe<ResolversTypes['CommonVisibilityWhitelist']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  ActivityDaySummary?: ActivityDaySummaryResolvers<ContextType>;
  ActivityMonthSummary?: ActivityMonthSummaryResolvers<ContextType>;
  ActivityWeekSummary?: ActivityWeekSummaryResolvers<ContextType>;
  Attendance?: AttendanceResolvers<ContextType>;
  AttendanceDaySummary?: AttendanceDaySummaryResolvers<ContextType>;
  AttendanceLabel?: AttendanceLabelResolvers<ContextType>;
  AttendanceMemberStats?: AttendanceMemberStatsResolvers<ContextType>;
  AttendanceMonthSummary?: AttendanceMonthSummaryResolvers<ContextType>;
  AttendanceSettings?: AttendanceSettingsResolvers<ContextType>;
  AttendanceWeekSummary?: AttendanceWeekSummaryResolvers<ContextType>;
  AuditLogChangedValues?: AuditLogChangedValuesResolvers<ContextType>;
  AuditLogValues?: AuditLogValuesResolvers<ContextType>;
  BillingInvoice?: BillingInvoiceResolvers<ContextType>;
  BillingInvoiceItem?: BillingInvoiceItemResolvers<ContextType>;
  BreadcrumbInfo?: BreadcrumbInfoResolvers<ContextType>;
  BulkUploadContactsResponse?: BulkUploadContactsResponseResolvers<ContextType>;
  BulkUploadMembersResponse?: BulkUploadMembersResponseResolvers<ContextType>;
  Checklist?: ChecklistResolvers<ContextType>;
  Collection?: CollectionResolvers<ContextType>;
  CollectionActivityLog?: CollectionActivityLogResolvers<ContextType>;
  CollectionMessageLog?: CollectionMessageLogResolvers<ContextType>;
  CollectionPayment?: CollectionPaymentResolvers<ContextType>;
  CollectionPeriod?: CollectionPeriodResolvers<ContextType>;
  CollectionRemindOnDays?: CollectionRemindOnDaysResolvers<ContextType>;
  CollectionReminderRead?: CollectionReminderReadResolvers<ContextType>;
  CollectionTag?: CollectionTagResolvers<ContextType>;
  Collector?: CollectorResolvers<ContextType>;
  CollectorMember?: CollectorMemberResolvers<ContextType>;
  CommonVisibilityWhitelist?: CommonVisibilityWhitelistResolvers<ContextType>;
  Company?: CompanyResolvers<ContextType>;
  CompanyHoliday?: CompanyHolidayResolvers<ContextType>;
  CompanyMember?: CompanyMemberResolvers<ContextType>;
  CompanyMemberPermissionScope?: CompanyMemberPermissionScopeResolvers<ContextType>;
  CompanyMemberReferenceImage?: CompanyMemberReferenceImageResolvers<ContextType>;
  CompanyMemberReferenceImageResponse?: CompanyMemberReferenceImageResponseResolvers<ContextType>;
  CompanyMemberSettings?: CompanyMemberSettingsResolvers<ContextType>;
  CompanyMemberType?: CompanyMemberTypeResolvers;
  CompanyPaymentMethod?: CompanyPaymentMethodResolvers<ContextType>;
  CompanyPermission?: CompanyPermissionResolvers<ContextType>;
  CompanyStorageDetails?: CompanyStorageDetailsResolvers<ContextType>;
  CompanyStorageList?: CompanyStorageListResolvers<ContextType>;
  CompanySubscription?: CompanySubscriptionResolvers<ContextType>;
  CompanyTeam?: CompanyTeamResolvers<ContextType>;
  CompanyTeamStatus?: CompanyTeamStatusResolvers<ContextType>;
  CompanyWorkDaySetting?: CompanyWorkDaySettingResolvers<ContextType>;
  Contact?: ContactResolvers<ContextType>;
  ContactActivity?: ContactActivityResolvers<ContextType>;
  ContactActivityRaw?: ContactActivityRawResolvers<ContextType>;
  ContactGroup?: ContactGroupResolvers<ContextType>;
  ContactNote?: ContactNoteResolvers<ContextType>;
  ContactPic?: ContactPicResolvers<ContextType>;
  ContactTag?: ContactTagResolvers<ContextType>;
  ContactTask?: ContactTaskResolvers<ContextType>;
  ContactTaskStatusType?: ContactTaskStatusTypeResolvers;
  ContactType?: ContactTypeResolvers;
  CustomTimesheetDayApproval?: CustomTimesheetDayApprovalResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  DeleteCompanyPaymentMethodResponse?: DeleteCompanyPaymentMethodResponseResolvers<ContextType>;
  DeleteContactPicResponse?: DeleteContactPicResponseResolvers<ContextType>;
  DiscountedPrice?: DiscountedPriceResolvers<ContextType>;
  EmployeeType?: EmployeeTypeResolvers<ContextType>;
  Holiday?: HolidayResolvers<ContextType>;
  ImageGroup?: ImageGroupResolvers<ContextType>;
  ImportTasksResponse?: ImportTasksResponseResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Latitude?: GraphQLScalarType;
  Location?: LocationResolvers<ContextType>;
  Longitude?: GraphQLScalarType;
  MonthlyActivityTracking?: MonthlyActivityTrackingResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NotificationType?: NotificationTypeResolvers;
  PaginatedProjectClaims?: PaginatedProjectClaimsResolvers<ContextType>;
  PaginatedProjectInvoices?: PaginatedProjectInvoicesResolvers<ContextType>;
  PaginatedProjectTimeCosts?: PaginatedProjectTimeCostsResolvers<ContextType>;
  PaginatedSharedWithMeTasks?: PaginatedSharedWithMeTasksResolvers<ContextType>;
  PaginatedTaskBoards?: PaginatedTaskBoardsResolvers<ContextType>;
  PaginatedTasks?: PaginatedTasksResolvers<ContextType>;
  PaymentMethod?: PaymentMethodResolvers<ContextType>;
  PaymentMethodCard?: PaymentMethodCardResolvers<ContextType>;
  ProductInCoupon?: ProductInCouponResolvers<ContextType>;
  ProjectClaim?: ProjectClaimResolvers<ContextType>;
  ProjectGroup?: ProjectGroupResolvers<ContextType>;
  ProjectGroupCustomAttribute?: ProjectGroupCustomAttributeResolvers<ContextType>;
  ProjectGroupCustomColumn?: ProjectGroupCustomColumnResolvers<ContextType>;
  ProjectInvoice?: ProjectInvoiceResolvers<ContextType>;
  ProjectSettings?: ProjectSettingsResolvers<ContextType>;
  ProjectStatus?: ProjectStatusResolvers<ContextType>;
  ProjectTemplate?: ProjectTemplateResolvers<ContextType>;
  ProjectTemplateGallery?: ProjectTemplateGalleryResolvers<ContextType>;
  ProjectTemplateStatus?: ProjectTemplateStatusResolvers<ContextType>;
  ProjectTimeCost?: ProjectTimeCostResolvers<ContextType>;
  PublicHoliday?: PublicHolidayResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReminderStatus?: ReminderStatusResolvers<ContextType>;
  RequestAccountDeletionResponse?: RequestAccountDeletionResponseResolvers<ContextType>;
  ResourcePermission?: ResourcePermissionResolvers<ContextType>;
  ServiceHistory?: ServiceHistoryResolvers<ContextType>;
  ShortUrl?: ShortUrlResolvers<ContextType>;
  StripeCoupon?: StripeCouponResolvers<ContextType>;
  StripeCouponMetaData?: StripeCouponMetaDataResolvers<ContextType>;
  StripeCustomerDetails?: StripeCustomerDetailsResolvers<ContextType>;
  StripeInvoice?: StripeInvoiceResolvers<ContextType>;
  StripePromoCode?: StripePromoCodeResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SubscriptionChange?: SubscriptionChangeResolvers<ContextType>;
  SubscriptionDiscount?: SubscriptionDiscountResolvers<ContextType>;
  SubscriptionPackage?: SubscriptionPackageResolvers<ContextType>;
  SubscriptionPackagePrice?: SubscriptionPackagePriceResolvers<ContextType>;
  SubscriptionPrice?: SubscriptionPriceResolvers<ContextType>;
  SubscriptionProduct?: SubscriptionProductResolvers<ContextType>;
  SubscriptionPromoCode?: SubscriptionPromoCodeResolvers<ContextType>;
  SubscriptionQuantityResult?: SubscriptionQuantityResultResolvers<ContextType>;
  Subtask?: SubtaskResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  TagGroup?: TagGroupResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  TaskActivity?: TaskActivityResolvers<ContextType>;
  TaskAttachment?: TaskAttachmentResolvers<ContextType>;
  TaskBoard?: TaskBoardResolvers<ContextType>;
  TaskBoardFolder?: TaskBoardFolderResolvers<ContextType>;
  TaskBoardFolderType?: TaskBoardFolderTypeResolvers;
  TaskBoardOwner?: TaskBoardOwnerResolvers<ContextType>;
  TaskBoardTeam?: TaskBoardTeamResolvers<ContextType>;
  TaskBoardVisibility?: TaskBoardVisibilityResolvers;
  TaskBoardVisibilityWhitelist?: TaskBoardVisibilityWhitelistResolvers<ContextType>;
  TaskComment?: TaskCommentResolvers<ContextType>;
  TaskCustomValue?: TaskCustomValueResolvers<ContextType>;
  TaskMember?: TaskMemberResolvers<ContextType>;
  TaskPic?: TaskPicResolvers<ContextType>;
  TaskPriorityType?: TaskPriorityTypeResolvers;
  TaskTag?: TaskTagResolvers<ContextType>;
  TaskTemplate?: TaskTemplateResolvers<ContextType>;
  TaskTemplateAttachment?: TaskTemplateAttachmentResolvers<ContextType>;
  TaskTemplateItem?: TaskTemplateItemResolvers<ContextType>;
  TaskTemplateRecurringSetting?: TaskTemplateRecurringSettingResolvers<ContextType>;
  TaskTimerEntry?: TaskTimerEntryResolvers<ContextType>;
  TaskTimerTotal?: TaskTimerTotalResolvers<ContextType>;
  TaskWatcher?: TaskWatcherResolvers<ContextType>;
  Template?: TemplateResolvers<ContextType>;
  Timesheet?: TimesheetResolvers<ContextType>;
  TimesheetActivity?: TimesheetActivityResolvers<ContextType>;
  TimesheetDayApproval?: TimesheetDayApprovalResolvers<ContextType>;
  ToolTipsStatus?: ToolTipsStatusResolvers<ContextType>;
  TotalNotificationCount?: TotalNotificationCountResolvers<ContextType>;
  TotalTimesheetApproval?: TotalTimesheetApprovalResolvers<ContextType>;
  UnreadCount?: UnreadCountResolvers<ContextType>;
  UpdateTaskParentResponse?: UpdateTaskParentResponseResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UserNotification?: UserNotificationResolvers<ContextType>;
  VerificationImageUploadUrlResponse?: VerificationImageUploadUrlResponseResolvers<ContextType>;
  WorkHourTotals?: WorkHourTotalsResolvers<ContextType>;
  Workspace?: WorkspaceResolvers<ContextType>;
}>;

