import { createLoaders } from '@data-access';
import {
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamModel,
  CompanyTeamStatusModel,
  EmployeeTypeModel,
} from '@models/company.model';
import {
  ProjectClaimModel,
  ProjectGroupModel,
  ProjectInvoiceModel,
  ProjectTemplateModel,
  ProjectTemplateStatusModel,
  ProjectTimeCostModel,
  SubtaskModel,
  TaskAttachmentModel,
  TaskBoardFolderModel,
  TaskBoardModel,
  TaskCommentModel,
  TaskModel,
} from '@models/task.model';
import { TemplateModel } from '@models/template.model';
import { camelize } from './utils';
import knex from '@db/knex';
import _ from 'lodash';
import { TagGroupModel, TagModel, TaskTagModel } from '@models/tag.model';
import {
  ContactGroupModel,
  ContactModel,
  ContactNoteModel,
  ContactPicModel,
} from '@models/contact.model';
import {
  CollectionModel,
  CollectionPaymentModel,
  CollectionPeriodModel,
} from '@models/collection.model';
import { CollectorModel } from '@models/collector.model';
import { CompanyHolidayModel, PublicHolidayModel } from '@models/holiday.model';
import { LocationModel } from '@models/location.model';
import {
  CompanySubscriptionModel,
  SubscriptionPackagePriceModel,
  SubscriptionProductModel,
} from '@models/subscription.model';
import { UserModel } from '@models/user.model';
import { TableNames } from '@db-tables';
import {
  ProjectGroupCustomAttributeModel,
  WorkspaceModel,
} from '@models/workspace.model';
import {
  BillingInvoiceItemModel,
  BillingInvoiceModel,
} from '@models/billing.model';

const getCompany = (id: string) =>
  <Promise<CompanyModel>>get(id, TableNames.COMPANIES, 'company');
const getTemplate = (id: string) =>
  <Promise<TemplateModel>>get(id, TableNames.TEMPLATES, 'template');
const getTask = (id: string) =>
  <Promise<TaskModel>>get(id, TableNames.TASKS, 'task');
const getTaskBoardFolder = (id: string) =>
  <Promise<TaskBoardFolderModel>>(
    get(id, TableNames.TASK_BOARD_FOLDERS, 'task board folder')
  );

const getSubtask = (id: string) =>
  <Promise<SubtaskModel>>get(id, TableNames.SUBTASKS, 'subtask');
const getTaskBoard = (id: string) =>
  <Promise<TaskBoardModel>>get(id, TableNames.TASK_BOARDS, 'task board');
const getTaskBoards = (ids: string[]) =>
  <Promise<TaskBoardFolderModel[]>>(
    getMany(ids, TableNames.TASK_BOARDS, 'task board')
  );

const getProject = (id: string) =>
  <Promise<TaskBoardModel>>get(id, TableNames.PROJECTS, 'project');

const getProjects = (ids: string[]) =>
  <Promise<TaskBoardModel[]>>getMany(ids, TableNames.PROJECTS, 'project');

const getTasks = (ids: string[]) =>
  <Promise<TaskModel[]>>getMany(ids, TableNames.TASKS, 'task');

const getCompanyTeam = (id: string) =>
  <Promise<CompanyTeamModel>>get(id, TableNames.COMPANY_TEAMS, 'company team');

const getCompanyTeams = (ids: string[]) =>
  <Promise<CompanyTeamModel[]>>(
    getMany(ids, TableNames.COMPANY_TEAMS, 'company teams')
  );

const getTaskComment = (id: string) =>
  <Promise<TaskCommentModel>>get(id, TableNames.TASK_COMMENTS, 'task comment');
const getTaskAttachment = (id: string) =>
  <Promise<TaskAttachmentModel>>(
    get(id, TableNames.TASK_ATTACHMENTS, 'task attachment')
  );

const getTag = (id: string) =>
  <Promise<TagModel>>get(id, TableNames.TAGS, 'tag');

const getTags = (ids: string[]) =>
  <Promise<TagModel[]>>getMany(ids, TableNames.TAGS, 'tags');

const getTagGroup = (id: string) =>
  <Promise<TagGroupModel>>get(id, TableNames.TAG_GROUPS, 'tag group');

const getContact = (id: string) =>
  <Promise<ContactModel>>get(id, TableNames.CONTACTS, 'contact');

const getContacts = (ids: string[]) =>
  <Promise<ContactModel[]>>getMany(ids, TableNames.CONTACTS, 'contacts');

const getContactGroup = (id: string) =>
  <Promise<ContactGroupModel>>(
    get(id, TableNames.CONTACT_GROUPS, 'contact group')
  );

const getContactGroups = (ids: string[]) =>
  <Promise<ContactGroupModel[]>>(
    getMany(ids, TableNames.CONTACT_GROUPS, 'contact groups')
  );

const getContactNote = (id: string) =>
  <Promise<ContactNoteModel>>get(id, TableNames.CONTACT_NOTES, 'contact note');

const getContactNotes = (ids: string[]) =>
  <Promise<ContactNoteModel[]>>(
    getMany(ids, TableNames.CONTACT_NOTES, 'contact notes')
  );

const getContactPics = (ids: string[]) =>
  <Promise<ContactPicModel[]>>(
    getMany(ids, TableNames.CONTACT_PICS, 'contact pic')
  );

const getContactPic = (ids: string) =>
  <Promise<ContactPicModel>>get(ids, TableNames.CONTACT_PICS, 'contact pic');

const getCollection = (id: string) =>
  <Promise<CollectionModel>>(
    get(id, TableNames.COLLECTION_REMINDERS, 'collections')
  );

const getCollections = (ids: string[]) =>
  <Promise<CollectionModel[]>>(
    getMany(ids, TableNames.COLLECTION_REMINDERS, 'collections')
  );

const getCollectionPeriod = (id: string) =>
  <Promise<CollectionPeriodModel>>(
    get(id, 'receivable_periods', 'collection period')
  );

const getCollectionPeriods = (ids: string[]) =>
  <Promise<CollectionPeriodModel[]>>(
    getMany(ids, 'receivable_periods', 'collection periods')
  );

const getCollectionPayment = (id: string) =>
  <Promise<CollectionPaymentModel>>(
    get(id, 'receivable_payments', 'collection payment')
  );

const getCollectionPayments = (ids: string[]) =>
  <Promise<CollectionPaymentModel[]>>(
    getMany(ids, 'receivable_payments', 'collection payments')
  );

const getCollector = (id: string) =>
  <Promise<CollectorModel>>get(id, 'collectors', 'collector');

const getCollectors = (ids: string[]) =>
  <Promise<CollectorModel[]>>getMany(ids, 'collectors', 'collector');

const getCompanyMember = (id: string) =>
  <Promise<CompanyMemberModel>>get(id, 'company_members', 'company member');

const getCompanyMembers = (ids: string[]) =>
  <Promise<CompanyMemberModel[]>>(
    getMany(ids, 'company_members', 'company member')
  );

const getAttendance = (id: string) =>
  <Promise<CompanyMemberModel>>get(id, 'attendances', 'attendance');

const getAttendances = (ids: string[]) =>
  <Promise<CompanyMemberModel[]>>getMany(ids, 'attendances', 'attendances');

const getPublicHoliday = (id: string) =>
  <Promise<PublicHolidayModel>>get(id, 'public_holidays', 'public holiday');

const getPublicHolidays = (ids: string[]) =>
  <Promise<PublicHolidayModel[]>>(
    getMany(ids, 'public_holidays', 'public holidays')
  );

const getCompanyHoliday = (id: string) =>
  <Promise<CompanyHolidayModel>>get(id, 'company_holidays', 'company holiday');

const getCompanyHolidays = (ids: string[]) =>
  <Promise<CompanyHolidayModel[]>>(
    getMany(ids, 'company_holidays', 'company holidays')
  );

const getLocation = (id: string) =>
  <Promise<LocationModel>>get(id, 'locations', 'location');

const getLocations = (ids: string[]) =>
  <Promise<LocationModel[]>>getMany(ids, 'locations', 'locations');

const getSubscriptionPackagePrice = (id: string) =>
  <Promise<SubscriptionPackagePriceModel>>(
    get(id, 'package_prices', 'package prices')
  );

const getSubscriptionPackagePrices = (ids: string[]) =>
  <Promise<SubscriptionPackagePriceModel[]>>(
    getMany(ids, 'package_prices', 'package prices')
  );

const getCompanySubscription = (id: string) =>
  <Promise<CompanySubscriptionModel>>(
    get(id, 'company_subscriptions', 'company subscription')
  );

const getCompanySubscriptions = (ids: string[]) =>
  <Promise<CompanySubscriptionModel[]>>(
    getMany(ids, 'company_subscriptions', 'company subscriptions')
  );

const getEmployeeType = (id: string) =>
  <Promise<EmployeeTypeModel>>get(id, 'employee_types', 'employee type');

const getEmployeeTypes = (ids: string[]) =>
  <Promise<EmployeeTypeModel[]>>getMany(ids, 'employee_types', 'employee type');

const getCompanyTeamStatus = (id: string) =>
  <Promise<CompanyTeamStatusModel>>(
    get(id, 'card_statuses', 'company team status')
  );

const getCompanyTeamStatuses = (ids: string[]) =>
  <Promise<CompanyTeamStatusModel[]>>(
    getMany(ids, 'card_statuses', 'company team status')
  );

const getUser = (id: string) => <Promise<UserModel>>get(id, 'users', 'user');

const getUsers = (ids: string[]) =>
  <Promise<UserModel[]>>getMany(ids, 'users', 'users');

const getWorkspace = (id: string) =>
  <Promise<WorkspaceModel>>get(id, 'workspaces', 'workspace');

const getWorkspaces = (ids: string[]) =>
  <Promise<WorkspaceModel[]>>getMany(ids, 'workspaces', 'workspace');

const getProjectInvoice = (id: string) =>
  <Promise<ProjectInvoiceModel>>(
    get(id, TableNames.PROJECT_INVOICES, 'project_invoice')
  );

const getProjectInvoices = (ids: string[]) =>
  <Promise<ProjectInvoiceModel[]>>(
    getMany(ids, TableNames.PROJECT_INVOICES, 'project_invoices')
  );

const getProjectClaim = (id: string) =>
  <Promise<ProjectClaimModel>>(
    get(id, TableNames.PROJECT_CLAIMS, 'project_claim')
  );

const getProjectClaims = (ids: string[]) =>
  <Promise<ProjectClaimModel[]>>(
    getMany(ids, TableNames.PROJECT_CLAIMS, 'project_claims')
  );

const getProjectTimeCost = (id: string) =>
  <Promise<ProjectTimeCostModel>>(
    get(id, TableNames.PROJECT_TIME_COSTS, 'project_time_cost')
  );

const getProjectTimeCosts = (ids: string[]) =>
  <Promise<ProjectTimeCostModel[]>>(
    getMany(ids, TableNames.PROJECT_TIME_COSTS, 'project_time_costs')
  );

const getProjectTemplate = (id: string) =>
  <Promise<ProjectTemplateModel>>(
    get(id, TableNames.PROJECT_TEMPLATES, 'project_template')
  );

const getProjectTemplates = (ids: string[]) =>
  <Promise<ProjectTemplateModel[]>>(
    getMany(ids, TableNames.PROJECT_TEMPLATES, 'project_templates')
  );

const getProjectTemplateStatus = (id: string) =>
  <Promise<ProjectTemplateStatusModel>>(
    get(id, TableNames.PROJECT_TEMPLATE_STATUSES, 'project_template_status')
  );

const getProjectTemplateStatuses = (ids: string[]) =>
  <Promise<ProjectTemplateStatusModel[]>>(
    getMany(
      ids,
      TableNames.PROJECT_TEMPLATE_STATUSES,
      'project_template_statuses',
    )
  );

const getProjectStatus = (id: string) =>
  <Promise<ProjectTemplateStatusModel>>(
    get(id, TableNames.PROJECT_STATUSES, 'project_status')
  );

const getProjectStatuses = (ids: string[]) =>
  <Promise<ProjectTemplateStatusModel[]>>(
    getMany(ids, TableNames.PROJECT_STATUSES, 'project_statuses')
  );

const getProjectGroup = (id: string) =>
  <Promise<ProjectGroupModel>>(
    get(id, TableNames.PROJECT_GROUPS, 'project_group')
  );

const getProjectGroups = (ids: string[]) =>
  <Promise<ProjectGroupModel[]>>(
    getMany(ids, TableNames.PROJECT_GROUPS, 'project_groups')
  );

const getBillingInvoice = (id: string) =>
  <Promise<BillingInvoiceModel>>(
    get(id, TableNames.BILLING_INVOICES, 'billing_invoice')
  );

const getBillingInvoices = (ids: string[]) =>
  <Promise<BillingInvoiceModel[]>>(
    getMany(ids, TableNames.BILLING_INVOICES, 'billing_invoices')
  );

const getBillingInvoiceItem = (id: string) =>
  <Promise<BillingInvoiceItemModel>>(
    get(id, TableNames.BILLING_INVOICE_ITEMS, 'billing_invoice_item')
  );

const getBillingInvoiceItems = (ids: string[]) =>
  <Promise<BillingInvoiceItemModel[]>>(
    getMany(ids, TableNames.BILLING_INVOICE_ITEMS, 'billing_invoice_items')
  );

const getSubscriptionProduct = (id: string) =>
  <Promise<SubscriptionProductModel>>(
    get(id, TableNames.SUBSCRIPTION_PRODUCTS, 'product')
  );

const getCustomAttribute = (id: string) =>
  <Promise<ProjectGroupCustomAttributeModel>>(
    get(id, TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES, 'custom_attribute')
  );

const getCustomAttributes = (ids: string[]) =>
  <Promise<ProjectGroupCustomAttributeModel[]>>(
    getMany(
      ids,
      TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES,
      'custom_attributes',
    )
  );

const get = async <T>(
  id: string,
  tableName: string,
  name: string,
): Promise<T> => {
  const obj = _.head(
    await knex.from(tableName).where('id_text', id).select(),
  ) as T;
  if (!obj) {
    throw new Error(`That ${name} does not exist`);
  }

  // merge the snake case and camel case to temporarily support deprecated schema
  const mergedObject = {
    ...(camelize(obj) as T),
    ...(obj as T),
  };

  return mergedObject as T;
};

const getMany = async <T>(
  ids: string[],
  tableName: string,
  name: string,
): Promise<T[]> => {
  const objs = (await knex
    .from(tableName)
    .whereIn('id_text', ids)
    .select()) as T[];
  if (!objs || objs.length !== ids.length) {
    throw new Error(`One or more ${name} does not exist`);
  }

  if (objs.some((obj) => obj === undefined)) {
    throw new Error(`One or more ${name} does not exist`);
  }

  // merge the snake case and camel case to temporarily support deprecated schema
  const mergedObjects = objs.map((obj) => ({
    ...(camelize(obj) as T),
    ...(obj as T),
  }));

  return mergedObjects as T[];
};

const getFromLoader = async <T>(
  id: string,
  loaderType: string,
  name: string,
): Promise<T> => {
  const loaders = createLoaders();
  const obj = await loaders[loaderType].load(id);
  if (!obj) {
    throw new Error(`That ${name} does not exist`);
  }

  // merge the snake case and camel case to temporarily support deprecated schema
  const mergedObject = {
    ...(camelize(obj) as T),
    ...(obj as T),
  };

  return mergedObject as T;
};

const getManyFromLoader = async <T>(
  ids: string[],
  loaderType: string,
  name: string,
): Promise<T[]> => {
  const loaders = createLoaders();
  const objs = await loaders[loaderType].loadMany(ids);
  if (!objs || objs.length !== ids.length) {
    throw new Error(`Not all ids of type ${name} exist`);
  }

  // merge the snake case and camel case to temporarily support deprecated schema
  const mergedObjects = objs.map((obj) => ({
    ...(camelize(obj) as T),
    ...(obj as T),
  }));

  return mergedObjects as T[];
};

export {
  getUser,
  getUsers,
  getCompany,
  getTemplate,
  getTask,
  getTasks,
  getTaskBoard,
  getCompanyTeam,
  getCompanyTeams,
  getTaskComment,
  getTaskAttachment,
  getTag,
  getTags,
  getTagGroup,
  getContact,
  getContacts,
  getContactGroup,
  getContactGroups,
  getContactPic,
  getContactPics,
  getContactNote,
  getContactNotes,
  getCollection,
  getCollections,
  getCollectionPeriod,
  getCollectionPeriods,
  getCollectionPayment,
  getCollectionPayments,
  getCollector,
  getCollectors,
  getCompanyMember,
  getCompanyMembers,
  getPublicHoliday,
  getPublicHolidays,
  getCompanyHoliday,
  getCompanyHolidays,
  getLocation,
  getLocations,
  getSubscriptionPackagePrice,
  getSubscriptionPackagePrices,
  getCompanySubscription,
  getCompanySubscriptions,
  getEmployeeType,
  getEmployeeTypes,
  getCompanyTeamStatus,
  getCompanyTeamStatuses,
  getAttendance,
  getAttendances,
  getSubtask,
  getTaskBoardFolder,
  getTaskBoards,
  getProjectInvoice,
  getProjectInvoices,
  getProjectClaim,
  getProjectClaims,
  getProjectTimeCost,
  getProjectTimeCosts,
  getProject,
  getProjects,
  getWorkspace,
  getWorkspaces,
  getProjectTemplate,
  getProjectTemplates,
  getProjectTemplateStatus,
  getProjectTemplateStatuses,
  getProjectStatus,
  getProjectStatuses,
  getProjectGroup,
  getProjectGroups,
  getBillingInvoice,
  getBillingInvoices,
  getBillingInvoiceItem,
  getBillingInvoiceItems,
  getSubscriptionProduct,
  getCustomAttribute,
  getCustomAttributes,
};
