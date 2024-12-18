import { TableNames } from '@db-tables';
import knex from '@db/knex';
import {
  CustomColumnType,
  ProjectGroupCustomAttributeModel,
  ProjectGroupCustomColumnModel,
  ProjectTemplateGalleryModel,
  WorkspaceId,
  WorkspaceModel,
  WorkspacePublicId,
} from '@models/workspace.model';
import _ from 'lodash';
import { camelizeOnly as camelize, camelize as camelizeBoth } from '../utils';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyTeamId,
  CompanyTeamStatusModel,
} from '@models/company.model';
import { UserId } from '@models/user.model';
import {
  AffectedRowsResult,
  ProjectBillingAuditLogModel,
  ProjectGroupId,
  ProjectGroupModel,
  ProjectId,
  ProjectInvoiceModel,
  ProjectModel,
  ProjectSettingsModel,
  ProjectStatusId,
  ProjectStatusModel,
  ProjectTemplateId,
  ProjectTemplateModel,
  ProjectTemplateStatusId,
  ProjectTemplateStatusModel,
  ProjectTimeCostId,
  ProjectTimeCostModel,
  TaskAttachmentModel,
  TaskBoardOwnerModel,
  TaskId,
  TaskModel,
} from '@models/task.model';
import { TaskStore, createLoaders, redis } from '@data-access';
import { TaskService } from '@services';
import { CommonVisibilityModel } from '@models/common.model';

type GetWorkspacesInput = {
  ids?: WorkspaceId[];
  companyId: CompanyId;
};

type CreateWorkspaceInput = {
  name: string;
  bgColor: string;
  companyId: CompanyId;
  userId: UserId;
};

type UpdateWorkspaceInput = {
  workspaceId: WorkspaceId;
  name?: string;
  bgColor?: string;
  userId: UserId;
};

type GetProjectsByWorkspaceIdInput = {
  workspaceId: WorkspaceId;
};

type AssignProjectsToWorkspaceInput = {
  workspaceId: WorkspaceId;
  projectIds: ProjectId[];
};

type RemoveProjectsFromWorkspaceInput = {
  workspaceId: WorkspaceId;
  projectIds: ProjectId[];
};

type CreateProjectInput = {
  name: string;
  userId: UserId;
  companyId: CompanyId;
  visibility?: number;
};

type ProjectInvoiceInput = {
  name: string;
  invoiceNo?: string;
  quantity: number;
  price: string;
  actualCost?: string;
  projectId: ProjectId;
  createdBy: UserId;
};

type ProjectInvoiceEditInput = {
  invoiceId: number;
  name?: string;
  invoiceNo?: string;
  quantity?: number;
  price?: string;
  actualCost?: string;
  updatedBy: UserId;
};

type GetProjectInvoicesInput = {
  projectId?: ProjectId;
  companyId: CompanyId;
  type?: string;
  sort?: string;
  limit?: number;
  offset?: number;
};

type ProjectClaimInput = {
  name: string;
  description?: string;
  note?: string;
  memberId: CompanyMemberId;
  amount: string;
  attachmentUrl?: string;
  status?: number;
  projectId: ProjectId;
  createdBy: UserId;
};

type ClaimEditInput = {
  name?: string;
  description?: string;
  note?: string;
  memberId?: CompanyMemberId;
  amount?: string; //This shouldn't be edited in real life use case, make a new claim instead
  attachmentUrl?: string;
  status?: number;
  updatedBy: UserId;
  claimId: number;
};

type GetProjectClaimsInput = {
  projectId?: ProjectId;
  companyId: CompanyId;
  type?: string;
  sort?: string;
  limit?: number;
  offset?: number;
};

type ProjectTimeCostInput = {
  date: string;
  timeIn?: string;
  timeOut?: string;
  taskId: TaskId;
  memberId: CompanyMemberId;
  amount: string;
  projectId: ProjectId;
  createdBy: UserId;
  note?: string;
};

type TimeCostEditInput = {
  timeCostId: ProjectTimeCostId;
  date?: string;
  timeIn?: string;
  timeOut?: string;
  taskId?: TaskId;
  memberId?: CompanyMemberId;
  amount?: string;
  note?: string;
  projectId?: ProjectId;
  updatedBy: UserId;
};

type GetProjectTimeCostsInput = {
  projectId?: ProjectId;
  companyId: CompanyId;
  type?: string;
  sort?: string;
  limit?: number;
  offset?: number;
};

type ProjectBillingAuditLogs = {
  actionType: number;
  billingType: number;
  note?: string;
  memberId?: CompanyMemberId;
  name: string;
  data?: string;
  createdBy: UserId;
};

type ProjectTemplateInput = {
  name: string;
  companyId: CompanyId;
  columns: string;
};

type ProjectTemplateUpdateInput = {
  templateId: ProjectTemplateId;
  name?: string;
  columns?: string;
};

type ProjectStatusInput = {
  name: string;
  color: string;
  sequence: number;
  notify?: boolean;
  projectId: ProjectId;
};

type ProjectStatusUpdateInput = {
  name?: string;
  color?: string;
  notify?: boolean;
  sequence?: number;
  projectStatusId: ProjectStatusId;
};

type ProjectSettingsInput = {
  columns: string;
  projectId: ProjectId;
};

type ProjectSettingsUpdateInput = {
  columns: string;
  projectId: ProjectId;
};

type ProjectTemplateStatusInput = {
  name: string;
  color: string;
  notify?: boolean;
  projectTemplateId: ProjectTemplateId;
};

type ProjectTemplateStatusUpdateInput = {
  name?: string;
  color?: string;
  notify?: boolean;
  projectTemplateStatusId: ProjectTemplateStatusId;
};

const getWorkspaces = async (
  input: GetWorkspacesInput,
): Promise<WorkspaceModel[]> => {
  try {
    const { ids, companyId } = input;
    const res = await knex
      .from(TableNames.WORKSPACES)
      .where((builder) => {
        if (ids) {
          builder.whereIn('id', ids);
        }

        builder.where('company_id', companyId);
      })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createWorkspace = async (input: CreateWorkspaceInput) => {
  try {
    const insertRes = await knex(TableNames.WORKSPACES).insert({
      name: input.name,
      bg_color: input.bgColor,
      company_id: input.companyId,
      created_by: input.userId,
      created_at: knex.fn.now(),
      updated_by: input.userId,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.WORKSPACES)
      .where('id', insertRes[0])
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateWorkspace = async (input: UpdateWorkspaceInput) => {
  try {
    const payload = {
      ...(input.name && { name: input.name }),
      ...(input.bgColor && { bg_color: input.bgColor }),
      updated_by: input.userId,
      updated_at: knex.fn.now(),
    };

    const updateRes = await knex(TableNames.WORKSPACES)
      .update(payload)
      .where('id', input.workspaceId);

    const res = await knex
      .from(TableNames.WORKSPACES)
      .where('id', updateRes)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectsByWorkspaceId = async (
  input: GetProjectsByWorkspaceIdInput,
) => {
  try {
    const { workspaceId } = input;

    const res = await knex
      .from({ wp: TableNames.WORKSPACE_PROJECTS })
      .join({ p: TableNames.PROJECTS }, 'wp.project_id', 'p.id')
      .where({ 'wp.workspace_id': workspaceId })
      .groupBy('p.id')
      .whereNull('p.deleted_at')
      .select('p.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignProjectsToWorkspace = async (
  input: AssignProjectsToWorkspaceInput,
): Promise<WorkspaceModel> => {
  try {
    const { workspaceId, projectIds } = input;

    await knex(TableNames.WORKSPACE_PROJECTS)
      .insert(
        projectIds.map((projectId) => ({
          workspace_id: workspaceId,
          project_id: projectId,
        })),
      )
      .onConflict(['workspace_id', 'project_id'])
      .merge();

    const res = await knex
      .from(TableNames.WORKSPACES)
      .where('id', workspaceId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeProjectsFromWorkspace = async (
  input: RemoveProjectsFromWorkspaceInput,
): Promise<WorkspaceModel> => {
  try {
    const { workspaceId, projectIds } = input;

    await knex(TableNames.WORKSPACE_PROJECTS)
      .where('workspace_id', workspaceId)
      .whereIn('project_id', projectIds)
      .del();

    const res = await knex
      .from(TableNames.WORKSPACES)
      .where('id', workspaceId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProject = async (input: CreateProjectInput) => {
  try {
    const { name, userId, companyId, visibility } = input;
    const insertRes = await knex(TableNames.PROJECTS).insert({
      name,
      company_id: companyId,
      created_by: userId,
      updated_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      ...(visibility && { visibility }),
      associate_by: 1, // legacy column default
      status: 1, // legacy column default
      category: 1, // Always a project
    });

    // create "Unassigned" project group
    await createProjectGroup({
      projectId: _.head(insertRes) as number,
      name: 'Unassigned',
      ordering: 999,
    });

    const res = await knex
      .from(TableNames.PROJECTS)
      .where('id', _.head(insertRes))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectInvoices = async ({
  projectId,
  companyId,
  type,
  sort,
  limit,
  offset,
}: GetProjectInvoicesInput) => {
  try {
    const res = await knex
      .from({ pi: TableNames.PROJECT_INVOICES })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 'pi.project_id')
      .where({ 'tb.company_id': companyId })
      .andWhere((builder) => {
        if (projectId) {
          builder.where({ 'pi.project_id': projectId });
        }
      })
      .limit(limit || 999)
      .offset(offset || 0)
      .orderBy(`pi.${type || 'created_at'}`, sort || 'desc')
      .select('pi.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectInvoice = async (input: ProjectInvoiceInput) => {
  try {
    const {
      name,
      invoiceNo,
      quantity,
      price,
      actualCost,
      projectId,
      createdBy,
    } = input;

    const insert = await knex.from(TableNames.PROJECT_INVOICES).insert({
      name,
      ...(invoiceNo && { invoice_no: invoiceNo }),
      quantity,
      price: +price,
      ...(actualCost && { actual_cost: +actualCost }),
      project_id: projectId,
      created_at: knex.fn.now(),
      created_by: createdBy,
      updated_by: createdBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.PROJECT_INVOICES)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const editProjectInvoice = async (input: ProjectInvoiceEditInput) => {
  try {
    const {
      name,
      invoiceNo,
      quantity,
      price,
      actualCost,
      updatedBy,
      invoiceId,
    } = input;

    await knex
      .from(TableNames.PROJECT_INVOICES)
      .where({ id: invoiceId })
      .update({
        ...(name && { name }),
        ...(invoiceNo && { invoice_no: invoiceNo }),
        ...(quantity && { quantity }),
        ...(price && { price: +price }),
        ...(actualCost && { actual_cost: +actualCost }),
        updated_by: updatedBy,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.PROJECT_INVOICES)
      .where('id', invoiceId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteProjectInvoices = async (
  invoiceIds: number[],
): Promise<ProjectInvoiceModel[]> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_INVOICES)
      .whereIn('id', invoiceIds)
      .select();

    await knex
      .from(TableNames.PROJECT_INVOICES)
      .whereIn('id', invoiceIds)
      .del();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectClaim = async (input: ProjectClaimInput) => {
  try {
    const {
      name,
      description,
      note,
      memberId,
      amount,
      attachmentUrl,
      status,
      projectId,
      createdBy,
    } = input;

    const insert = await knex.from(TableNames.PROJECT_CLAIMS).insert({
      name,
      ...(description && { description }),
      ...(note && { note }),
      ...(attachmentUrl && { attachmentUrl }),
      ...(status && { status }),
      member_id: memberId,
      amount: +amount,
      project_id: projectId,
      created_at: knex.fn.now(),
      created_by: createdBy,
      updated_by: createdBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.PROJECT_CLAIMS)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const editProjectClaim = async (input: ClaimEditInput) => {
  try {
    const {
      name,
      description,
      note,
      memberId,
      amount,
      attachmentUrl,
      status,
      updatedBy,
      claimId,
    } = input;

    await knex
      .from(TableNames.PROJECT_CLAIMS)
      .where({ id: claimId })
      .update({
        ...(name && { name }),
        ...(description && { description }),
        ...(note && { note }),
        ...(memberId && { member_id: memberId }),
        ...(amount && { amount }),
        ...(attachmentUrl && { attachment_url: attachmentUrl }),
        ...(status && { status }),
        updated_by: updatedBy,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.PROJECT_CLAIMS)
      .where('id', claimId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteProjectClaims = async (
  claimIds: number[],
): Promise<ProjectInvoiceModel[]> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_CLAIMS)
      .whereIn('id', claimIds)
      .select();

    await knex.from(TableNames.PROJECT_CLAIMS).whereIn('id', claimIds).del();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectClaims = async ({
  projectId,
  companyId,
  type,
  sort,
  limit,
  offset,
}: GetProjectClaimsInput) => {
  try {
    const res = await knex
      .from({ pc: TableNames.PROJECT_CLAIMS })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 'pc.project_id')
      .where({ 'tb.company_id': companyId })
      .andWhere((builder) => {
        if (projectId) {
          builder.where({ 'pc.project_id': projectId });
        }
      })
      .limit(limit || 999)
      .offset(offset || 0)
      .orderBy(`pc.${type || 'created_at'}`, sort || 'desc')
      .select('pc.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectTimeCost = async (
  input: ProjectTimeCostInput,
): Promise<ProjectTimeCostModel> => {
  try {
    const {
      date,
      timeIn,
      timeOut,
      taskId,
      memberId,
      amount,
      note,
      projectId,
      createdBy,
    } = input;

    const insert = await knex.from(TableNames.PROJECT_TIME_COSTS).insert({
      date,
      ...(timeIn && { time_in: timeIn }),
      member_id: memberId,
      task_id: taskId,
      ...(timeOut && { time_out: timeOut }),
      ...(note && { note }),
      amount: +amount,
      project_id: projectId,
      created_at: knex.fn.now(),
      created_by: createdBy,
      updated_by: createdBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.PROJECT_TIME_COSTS)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const editProjectTimeCost = async (
  input: TimeCostEditInput,
): Promise<ProjectTimeCostModel> => {
  try {
    const {
      timeCostId,
      date,
      timeIn,
      timeOut,
      taskId,
      memberId,
      amount,
      note,
      projectId,
      updatedBy,
    } = input;

    await knex
      .from(TableNames.PROJECT_TIME_COSTS)
      .where({ id: timeCostId })
      .update({
        ...(date && { date }),
        ...(timeIn && { time_in: timeIn }),
        ...(timeOut && { time_out: timeOut }),
        ...(taskId && { task_id: taskId }),
        ...(projectId && { project_id: projectId }),
        ...(note && { note }),
        ...(memberId && { member_id: memberId }),
        ...(amount && { amount }),
        updated_by: updatedBy,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.PROJECT_TIME_COSTS)
      .where('id', timeCostId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteProjectTimeCosts = async (
  timeCostIds: ProjectTimeCostId[],
): Promise<ProjectTimeCostModel[]> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_TIME_COSTS)
      .whereIn('id', timeCostIds)
      .select();

    await knex
      .from(TableNames.PROJECT_TIME_COSTS)
      .whereIn('id', timeCostIds)
      .del();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectTimeCosts = async ({
  projectId,
  companyId,
  type,
  sort,
  limit,
  offset,
}: GetProjectTimeCostsInput) => {
  try {
    const res = await knex
      .from({ ptc: TableNames.PROJECT_TIME_COSTS })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 'ptc.project_id')
      .where({ 'tb.company_id': companyId })
      .andWhere((builder) => {
        if (projectId) {
          builder.where({ 'ptc.project_id': projectId });
        }
      })
      .limit(limit || 999)
      .offset(offset || 0)
      .orderBy(`ptc.${type || 'created_at'}`, sort || 'desc')
      .select('ptc.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectBillingAuditLog = async (
  input: ProjectBillingAuditLogs,
): Promise<ProjectBillingAuditLogModel> => {
  try {
    const { actionType, billingType, note, memberId, name, data, createdBy } =
      input;
    const insert = await knex
      .from(TableNames.PROJECT_BILLING_AUDIT_LOGS)
      .insert({
        action_type: actionType,
        billing_type: billingType,
        ...(note && { note }),
        ...(memberId && { member_id: memberId }),
        name,
        ...(data && { data }),
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
        created_by: createdBy,
        updated_by: createdBy,
      });

    const res = await knex
      .from(TableNames.PROJECT_BILLING_AUDIT_LOGS)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectTemplates = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<ProjectTemplateModel[]> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_TEMPLATES)
      .where({ company_id: companyId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectTemplate = async (
  input: ProjectTemplateInput,
): Promise<ProjectTemplateModel> => {
  try {
    const { name, companyId, columns } = input;

    const insert = await knex.from(TableNames.PROJECT_TEMPLATES).insert({
      name,
      company_id: companyId,
      columns,
    });

    const res = await knex
      .from(TableNames.PROJECT_TEMPLATES)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteProjectTemplates = async (
  templateIds: ProjectTemplateId[],
): Promise<AffectedRowsResult> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_TEMPLATES)
      .whereIn('id', templateIds)
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProjectTemplate = async (
  input: ProjectTemplateUpdateInput,
): Promise<ProjectTemplateModel> => {
  try {
    const { templateId, name, columns } = input;

    await knex
      .from(TableNames.PROJECT_TEMPLATES)
      .where({ id: templateId })
      .update({
        ...(name && { name }),
        ...(columns && { columns }),
      });

    const res = await knex
      .from(TableNames.PROJECT_TEMPLATES)
      .where('id', templateId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectStatus = async (
  input: ProjectStatusInput,
): Promise<ProjectStatusModel> => {
  try {
    const { name, projectId, color, notify, sequence } = input;

    const insert = await knex.from(TableNames.PROJECT_STATUSES).insert({
      name,
      project_id: projectId,
      color,
      sequence,
      ...(notify && { notify }),
    });

    const res = await knex
      .from(TableNames.PROJECT_STATUSES)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteProjectStatuses = async (
  statusIds: ProjectStatusId[],
): Promise<AffectedRowsResult> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_STATUSES)
      .whereIn('id', statusIds)
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProjectStatus = async (
  input: ProjectStatusUpdateInput,
): Promise<ProjectStatusModel> => {
  try {
    const { projectStatusId, name, color, notify, sequence } = input;

    await knex
      .from(TableNames.PROJECT_STATUSES)
      .where({ id: projectStatusId })
      .update({
        ...(name && { name }),
        ...(color && { color }),
        ...(notify && { notify: notify ? 1 : 0 }),
        ...(sequence && { sequence }),
      });

    const res = await knex
      .from(TableNames.PROJECT_STATUSES)
      .where('id', projectStatusId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectSettings = async (
  input: ProjectSettingsInput,
): Promise<ProjectSettingsModel> => {
  try {
    const { projectId, columns } = input;

    const insert = await knex.from(TableNames.PROJECT_SETTINGS).insert({
      project_id: projectId,
      columns: JSON.stringify(columns),
    });

    const res = await knex
      .from(TableNames.PROJECT_SETTINGS)
      .where('project_id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProjectSettings = async (
  input: ProjectSettingsUpdateInput,
): Promise<ProjectSettingsModel> => {
  try {
    const { projectId, columns } = input;

    const update = await knex
      .from(TableNames.PROJECT_SETTINGS)
      .where({ project_id: projectId })
      .update({
        columns,
      });
    if (!update) {
      await knex.from(TableNames.PROJECT_SETTINGS).insert({
        project_id: projectId,
        columns,
      });
    }

    const res = await knex
      .from(TableNames.PROJECT_SETTINGS)
      .where('project_id', projectId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectTemplateStatus = async (
  input: ProjectTemplateStatusInput,
): Promise<ProjectTemplateStatusModel> => {
  try {
    const { name, projectTemplateId, color, notify } = input;

    const insert = await knex
      .from(TableNames.PROJECT_TEMPLATE_STATUSES)
      .insert({
        name,
        project_template_id: projectTemplateId,
        color,
        ...(typeof notify === 'boolean' && { notify }),
      });

    const res = await knex
      .from(TableNames.PROJECT_TEMPLATE_STATUSES)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProjectTemplateStatus = async (
  input: ProjectTemplateStatusUpdateInput,
): Promise<ProjectTemplateStatusModel> => {
  try {
    const { projectTemplateStatusId, name, color, notify } = input;

    await knex
      .from(TableNames.PROJECT_TEMPLATE_STATUSES)
      .where({ id: projectTemplateStatusId })
      .update({
        ...(name && { name }),
        ...(color && { color }),
        ...(notify && { notify: notify ? 1 : 0 }),
      });

    const res = await knex
      .from(TableNames.PROJECT_TEMPLATE_STATUSES)
      .where('id', projectTemplateStatusId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectSettings = async (
  projectId: ProjectId,
): Promise<ProjectSettingsModel> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_SETTINGS)
      .where({ project_id: projectId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectTemplateStatuses = async (
  projectTemplateId: ProjectTemplateId,
): Promise<ProjectTemplateStatusModel[]> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_TEMPLATE_STATUSES)
      .where({ project_template_id: projectTemplateId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectStatusesByProjectId = async (
  projectId: ProjectId,
): Promise<ProjectStatusModel[]> => {
  try {
    const res = await knex.from(TableNames.PROJECT_STATUSES).where({
      project_id: projectId,
    });

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectsByCompanyId = async (
  companyId: CompanyId,
): Promise<ProjectModel[]> => {
  try {
    const res = await knex
      .from({ com: TableNames.COMPANIES })
      .innerJoin({ p: TableNames.PROJECTS }, 'p.company_id', 'com.id')
      .where({ 'p.company_id': companyId })
      .whereNull('p.deleted_at')
      .groupBy('p.id')
      .select('p.*');

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProjectGroup = async (input: {
  projectId: ProjectId;
  name: string;
  ordering?: number;
}): Promise<ProjectGroupModel> => {
  try {
    const { projectId, name, ordering } = input;

    const insert = await knex.from(TableNames.PROJECT_GROUPS).insert({
      project_id: projectId,
      name,
    });

    const res = await knex
      .from(TableNames.PROJECT_GROUPS)
      .where({ id: _.head(insert) })
      .select();

    const numberOfGroupsInProject = await knex
      .from(TableNames.PROJECT_GROUPS)
      .where({ project_id: projectId })
      .count('id as count');

    //insert project order group
    await knex.from(TableNames.PROJECT_GROUP_ORDERS).insert({
      project_id: projectId,
      group_id: _.head(insert),

      ordering:
        // @ts-ignore
        ordering || (+numberOfGroupsInProject[0]?.count as unknown as number),
    });

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const moveGroupTasks = async (input: {
  taskIds: TaskId[];
  groupId: ProjectGroupId;
}): Promise<TaskModel[]> => {
  try {
    const { taskIds, groupId } = input;

    await knex
      .from(TableNames.TASKS)
      .whereIn('id', taskIds)
      .update({ group_id: groupId });

    const res = await knex
      .from(TableNames.TASKS)
      .where({ id: taskIds })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectGroups = async (
  projectId: ProjectId,
): Promise<ProjectGroupModel[]> => {
  try {
    const res = await knex
      .from({ pg: TableNames.PROJECT_GROUPS })
      .leftJoin(
        { pgo: TableNames.PROJECT_GROUP_ORDERS },
        'pgo.group_id',
        'pg.id',
      )
      .where({ 'pg.project_id': projectId })
      .select('pg.*', 'pgo.ordering');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAllProjectTemplates = async () => {
  try {
    const res = await knex.from(TableNames.PROJECT_TEMPLATES).select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const setProjectVisibility = async ({
  projectId,
  visibility,
  userId,
}: {
  projectId: ProjectId;
  visibility: number;
  userId: UserId;
}) => {
  try {
    await knex(TableNames.PROJECTS)
      .update({
        visibility,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', projectId);

    const res = await knex
      .from(TableNames.PROJECTS)
      .where('id', projectId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteProjectTemplateStatuses = async ({
  templateStatusIds,
}: {
  templateStatusIds: ProjectTemplateStatusId[];
}): Promise<AffectedRowsResult> => {
  try {
    const res = await knex(TableNames.PROJECT_TEMPLATE_STATUSES)
      .whereIn('id', templateStatusIds)
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProjectOwners = async ({
  projectId,
  companyMemberIds,
}: {
  projectId: ProjectId;
  companyMemberIds: CompanyMemberId[];
}): Promise<TaskBoardOwnerModel[]> => {
  try {
    await knex(TableNames.TASK_BOARD_OWNERS)
      .where('job_id', projectId)
      .delete();

    if (companyMemberIds.length > 0) {
      const itemsToInsert = companyMemberIds.map((memberId) => ({
        job_id: projectId,
        company_member_id: memberId,
      }));

      await knex(TableNames.TASK_BOARD_OWNERS).insert(itemsToInsert);
    }

    const res = await knex(TableNames.TASK_BOARD_OWNERS)
      .where('job_id', projectId)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProject = async (input: {
  name?: string;
  color?: string;
  published?: boolean;
  projectId: ProjectId;
  updatedBy: UserId;
  description?: string;
}): Promise<ProjectModel | Error> => {
  try {
    const { name, color, published, projectId, updatedBy, description } = input;
    await knex
      .from(TableNames.PROJECTS)
      .where({ id: projectId })
      .update({
        ...(name && { name }),
        ...(color && { color }),
        ...(published !== undefined && { published }),
        ...(updatedBy && { updated_by: updatedBy }),
        ...(description && { description }),
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.PROJECTS)
      .where({ id: projectId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProjectGroup = async (input: {
  projectGroupId: ProjectGroupId;
  name: string;
}): Promise<ProjectGroupModel> => {
  try {
    const { projectGroupId, name } = input;
    await knex
      .from(TableNames.PROJECT_GROUPS)
      .where({ id: projectGroupId })
      .update({ name });

    const res = await knex
      .from(TableNames.PROJECT_GROUPS)
      .where({ id: projectGroupId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteWorkspaces = async (
  workspaceIds: WorkspaceId[],
  userId: UserId,
): Promise<AffectedRowsResult> => {
  try {
    await knex
      .from({ wp: TableNames.WORKSPACE_PROJECTS })
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 'wp.project_id')
      .leftJoin({ t: TableNames.TASKS }, 't.job_id', 'p.id')
      .whereIn('wp.workspace_id', workspaceIds)
      .update({
        'p.archived': 1,
        'p.archived_at': knex.fn.now(),
        'p.archived_by': userId,
        't.archived': 1,
        't.archived_at': knex.fn.now(),
        't.archived_by': userId,
      });

    await knex
      .from({ pg: TableNames.PROJECT_GROUPS })
      .leftJoin(
        { wp: TableNames.WORKSPACE_PROJECTS },
        'wp.project_id',
        'pg.project_id',
      )
      .whereIn('wp.workspace_id', workspaceIds)
      .update({
        'pg.archived': 1,
        'pg.archived_at': knex.fn.now(),
        'pg.archived_by': userId,
      });

    const res = await knex(TableNames.WORKSPACES)
      .whereIn('id', workspaceIds)
      .del();
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

//TODO: It works, but needs a rework. It's horrible.
const copyProject = async (input: {
  originalProjectId: ProjectId;
  duplicatedBy: UserId;
  workspaceId?: WorkspaceId;
  companyId: CompanyId;
}): Promise<ProjectModel> => {
  try {
    const { originalProjectId, duplicatedBy, workspaceId, companyId } = input;

    const projects = await knex
      .from(TableNames.PROJECTS)
      .where({ id: originalProjectId })
      .select();

    const allProjectSettings = await knex
      .from(TableNames.PROJECT_SETTINGS)
      .where({ project_id: originalProjectId })
      .select();

    const project = _.head(projects) as ProjectModel;
    const projectGroups = (await knex
      .from(TableNames.PROJECT_GROUPS)
      .where({ project_id: originalProjectId })
      .select()) as ProjectGroupModel[];

    const projectSettings = _.head(allProjectSettings) as ProjectSettingsModel;

    const {
      company_id,
      contact_id,
      team_id,
      type,
      category,
      name,
      description,
      comment,
      associate_by,
      status,
      archived,
      visibility,
      pinned,
      published,
    } = project;
    const projectInsert = await knex(TableNames.PROJECTS).insert({
      ...(company_id && { company_id }),
      ...(contact_id && { contact_id }),
      ...(team_id && { team_id }),
      ...(type && { type }),
      ...(category && { category }),
      name: `Copy of ${name}`,
      ...(description && { description }),
      ...(comment && { comment }),
      ...(associate_by && { associate_by }),
      ...(status && { status }),
      ...(archived && { archived }),
      ...(visibility && { visibility }),
      ...(pinned && { pinned }),
      ...(published && { published }),
      created_by: duplicatedBy,
      created_at: knex.fn.now(),
    });

    const createdProjectId = _.head(projectInsert) as ProjectId;

    for (let k = 0; k < projectGroups.length; k++) {
      let groupId;
      const copied = await createProjectGroup({
        projectId: createdProjectId,
        name: `Copy of ${projectGroups[k].name}`,
      });
      groupId = copied.id;

      const originalTasks = (await knex
        .from({ pg: TableNames.PROJECT_GROUPS })
        .leftJoin({ t: TableNames.TASKS }, 't.group_id', 'pg.id')
        .where({ 't.group_id': projectGroups[k].id, 't.parent_id': null })
        .whereNull('t.deleted_at')
        .groupBy('t.id')
        .select('t.*')) as TaskModel[];

      for (let i = 0; i < originalTasks.length; i++) {
        const {
          name,
          description,
          due_date,
          start_date,
          end_date,
          planned_effort,
          priority,
          projected_cost,
          status,
          completed,
          status_id,
          archived,
          sequence,
        } = originalTasks[i];

        const newParentTask = await TaskStore.createTask({
          projectId: createdProjectId,
          name: `Copy of ${name}`,
          description,
          priority,
          dueDate: due_date,
          createdBy: duplicatedBy,
          startDate: start_date,
          endDate: end_date,
          plannedEffort: planned_effort,
          projectedCost: projected_cost,
          completed: completed ? true : false,
          sequence,
          stageType: status,
          ...(groupId && { groupId }),
          statusId: status_id,
          archived: archived ? true : false,
          companyId,
        });

        await TaskStore.copyChecklists({
          sourceTaskId: originalTasks[i].id,
          targetTaskId: newParentTask.id,
          userId: duplicatedBy,
        });

        await TaskService.copyAttachments({
          sourceTaskId: originalTasks[i].id,
          targetTaskId: newParentTask.id,
          userId: duplicatedBy,
          companyId,
        });

        const originalChildTasks = await knex
          .from(TableNames.TASKS)
          .where({ parent_id: originalTasks[i].id })
          .whereNull('deleted_at')
          .select();

        for (let j = 0; j < originalChildTasks.length; j++) {
          const targetChildTask = await TaskStore.createTask({
            projectId: createdProjectId,
            name: `Copy of ${originalChildTasks[j].name}`,
            description: originalChildTasks[j].description,
            priority: originalChildTasks[j].priority,
            dueDate: originalChildTasks[j].due_date,
            createdBy: duplicatedBy,
            startDate: originalChildTasks[j].start_date,
            endDate: originalChildTasks[j].end_date,
            plannedEffort: originalChildTasks[j].planned_effort,
            projectedCost: originalChildTasks[j].projected_cost,
            completed: originalChildTasks[j].completed ? true : false,
            sequence: originalChildTasks[j].sequence,
            stageType: originalChildTasks[j].status,
            parentId: newParentTask?.id,
            statusId: originalChildTasks[j].status_id,
            archived: originalChildTasks[j].archived ? true : false,
            ...(groupId && { groupId }),
            companyId,
          });

          await TaskStore.copyChecklists({
            sourceTaskId: originalChildTasks[i].id,
            targetTaskId: targetChildTask.id,
            userId: duplicatedBy,
          });

          await TaskService.copyAttachments({
            sourceTaskId: originalChildTasks[i].id,
            targetTaskId: targetChildTask.id,
            userId: duplicatedBy,
            companyId,
          });
        }
      }
    }

    const originalTasksForDefaultGroups = (await knex
      .from(TableNames.TASKS)
      .where({ job_id: originalProjectId, group_id: null })
      .whereNull('deleted_at')
      .select()) as TaskModel[];

    for (let i = 0; i < originalTasksForDefaultGroups.length; i++) {
      const {
        name,
        description,
        due_date,
        start_date,
        end_date,
        planned_effort,
        priority,
        projected_cost,
        status,
        completed,
        status_id,
        archived,
        sequence,
      } = originalTasksForDefaultGroups[i];

      const newParentTask = await TaskStore.createTask({
        projectId: createdProjectId,
        name: `Copy of ${name}`,
        description,
        priority,
        dueDate: due_date,
        createdBy: duplicatedBy,
        startDate: start_date,
        endDate: end_date,
        plannedEffort: planned_effort,
        projectedCost: projected_cost,
        completed: completed ? true : false,
        sequence,
        stageType: status,
        statusId: status_id,
        archived: archived ? true : false,
        companyId,
      });

      await TaskStore.copyChecklists({
        sourceTaskId: originalTasksForDefaultGroups[i].id,
        targetTaskId: newParentTask.id,
        userId: duplicatedBy,
      });

      await TaskService.copyAttachments({
        sourceTaskId: originalTasksForDefaultGroups[i].id,
        targetTaskId: newParentTask.id,
        userId: duplicatedBy,
        companyId,
      });

      const originalChildTasks = await knex
        .from(TableNames.TASKS)
        .where({ parent_id: originalTasksForDefaultGroups[i].id })
        .whereNull('deleted_at')
        .select();

      for (let j = 0; j < originalChildTasks.length; j++) {
        const targetChildTask = await TaskStore.createTask({
          projectId: createdProjectId,
          name: `Copy of ${originalChildTasks[j].name}`,
          description: originalChildTasks[j].description,
          priority: originalChildTasks[j].priority,
          dueDate: originalChildTasks[j].due_date,
          createdBy: duplicatedBy,
          startDate: originalChildTasks[j].start_date,
          endDate: originalChildTasks[j].end_date,
          plannedEffort: originalChildTasks[j].planned_effort,
          projectedCost: originalChildTasks[j].projected_cost,
          completed: originalChildTasks[j].completed ? true : false,
          sequence: originalChildTasks[j].sequence,
          stageType: originalChildTasks[j].status,
          parentId: newParentTask?.id,
          statusId: originalChildTasks[j].status_id,
          archived: originalChildTasks[j].archived ? true : false,
          companyId,
        });

        await TaskStore.copyChecklists({
          sourceTaskId: originalChildTasks[i].id,
          targetTaskId: targetChildTask.id,
          userId: duplicatedBy,
        });

        await TaskService.copyAttachments({
          sourceTaskId: originalChildTasks[i].id,
          targetTaskId: targetChildTask.id,
          userId: duplicatedBy,
          companyId,
        });
      }
    }

    await createProjectSettings({
      columns: projectSettings?.columns || '{}',
      projectId: createdProjectId,
    });

    const originalProjectStatuses = (await knex
      .from(TableNames.PROJECT_STATUSES)
      .where({ project_id: originalProjectId })
      .select()) as ProjectStatusModel[];

    for (const s of originalProjectStatuses) {
      await createProjectStatus({
        projectId: createdProjectId,
        name: s.name,
        color: s.color,
        sequence: s.sequence,
        notify: s.notify === 1,
      });
    }

    if (workspaceId) {
      await assignProjectsToWorkspace({
        workspaceId,
        projectIds: [createdProjectId],
      });
    }

    const res = await knex
      .from(TableNames.PROJECTS)
      .where({ id: createdProjectId });

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProjectsArchivedState = async (input: {
  projectIds: ProjectId[];
  archived: boolean;
  updatedBy: UserId;
}): Promise<ProjectModel[]> => {
  try {
    const { projectIds, archived, updatedBy } = input;
    await knex(TableNames.PROJECTS)
      .whereIn('id', projectIds)
      .update({
        updated_at: knex.fn.now(),
        archived,
        archived_at: archived ? knex.fn.now() : null,
        archived_by: archived ? updatedBy : null,
      });

    for (const projectId of projectIds) {
      const tasks = (await knex
        .from({ t: TableNames.TASKS })
        .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
        .where({ 't.job_id': projectId })
        .groupBy('t.id')
        .select('t.*')) as TaskModel[];
      const taskIds = tasks.map((t) => t.id);

      await TaskStore.updateTasksArchivedState({
        taskIds,
        archived,
        userId: updatedBy,
        projectIds,
      });
    }

    const res = await knex
      .from(TableNames.PROJECTS)
      .whereIn('id', projectIds)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWorkspaceByProjectId = async (
  projectId: ProjectId,
): Promise<WorkspaceModel> => {
  try {
    const res = await knex
      .from({ p: TableNames.PROJECTS })
      .leftJoin({ wp: TableNames.WORKSPACE_PROJECTS }, 'wp.project_id', 'p.id')
      .leftJoin({ w: TableNames.WORKSPACES }, 'w.id', 'wp.workspace_id')
      .where({ 'wp.project_id': projectId })
      .groupBy('w.id')
      .select('w.*');

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteProjectGroups = async (
  projectGroupIds: ProjectGroupId[],
  userId: UserId,
): Promise<AffectedRowsResult> => {
  try {
    await knex({ t: TableNames.TASKS })
      .leftJoin({ pg: TableNames.PROJECT_GROUPS }, 'pg.id', 't.group_id')
      .whereIn('t.group_id', projectGroupIds)
      .update({
        't.deleted_at': knex.fn.now(),
        't.deleted_by': userId,
        't.group_id': null,
      });

    const res = await knex(TableNames.PROJECT_GROUPS)
      .whereIn('id', projectGroupIds)
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const moveProjectGroup = async (input: {
  groupId?: ProjectGroupId;
  userId: UserId;
  taskIds: TaskId[];
  projectId: ProjectId;
}): Promise<TaskModel[]> => {
  try {
    const { groupId, projectId, userId, taskIds } = input;
    await knex
      .from(TableNames.TASKS)
      .whereIn('id', taskIds)
      .update({
        job_id: projectId,
        status_id: null,
        ...(groupId && { group_id: groupId }),
        updated_at: knex.fn.now(),
        updated_by: userId,
      });

    const res = await knex
      .from(TableNames.TASKS)
      .whereIn('id', taskIds)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDefaultProjects = async (companyId: CompanyId) => {
  try {
    const workspaces = await getWorkspaces({ companyId });
    const workspaceIds = workspaces.map((w) => w.id);
    const projects = await knex
      .from({ p: TableNames.PROJECTS })
      .leftJoin({ wp: TableNames.WORKSPACE_PROJECTS }, 'wp.project_id', 'p.id')
      .whereIn('wp.workspace_id', workspaceIds)
      .whereNull('p.deleted_at')
      .select('p.*');

    const projectIds = projects.map((p) => p?.id);

    const allProjects = await getProjectsByCompanyId(companyId);

    const defaultProjects = allProjects.filter(
      (p) => !projectIds.includes(p.id) && !p.deleted_by,
    );

    return camelize(defaultProjects);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDefaultTasks = async (projectId: ProjectId): Promise<TaskModel[]> => {
  try {
    const tasks = await knex
      .from(TableNames.TASKS)
      .where({
        job_id: projectId,
        deleted_at: null,
        group_id: null,
        parent_id: null,
      })
      .select();

    return camelize(tasks);
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteWorkspaceProjects = async (workspaceIds: WorkspaceId[]) => {
  try {
    const res = await knex(TableNames.WORKSPACE_PROJECTS)
      .whereIn('workspace_id', workspaceIds)
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAllSubStatuses = async (): Promise<CompanyTeamStatusModel[]> => {
  try {
    const allStatuses = await knex
      .from({ t: TableNames.TASKS })
      .join(
        {
          ts: TableNames.TASK_STATUSES,
        },
        'ts.id',
        't.sub_status_id',
      )
      .join(
        {
          p: TableNames.PROJECTS,
        },
        'p.id',
        't.job_id',
      )
      .where({
        'p.deleted_at': null,
        't.deleted_at': null,
        'ts.deleted_at': null,
      })
      .select(
        'ts.*',
        't.id as taskId',
        't.job_id as projectId',
        'p.company_id as companyId',
      );

    return camelize(allStatuses);
  } catch (error) {
    return Promise.reject(error);
  }
};

const applySubStatusesAsProjectStatusesToTask = async (input: {
  statusName: string;
  taskId: TaskId;
  projectId: ProjectId;
}) => {
  try {
    const { statusName, taskId, projectId } = input;
    const status = (await knex
      .from(TableNames.PROJECT_STATUSES)
      .where({ name: statusName, project_id: projectId })
      .first()) as ProjectStatusModel;

    await knex.from(TableNames.TASKS).where({ id: taskId }).update({
      status_id: status?.id,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const allPersonalProjects = async (): Promise<ProjectModel[]> => {
  try {
    const res = await knex
      .from({ p: TableNames.PROJECTS })
      .where({ 'p.type': 'Personal' })
      .whereNull('p.deleted_at')
      .select('p.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const renameLegacyCollaborationProjectUsingContactName = async () => {
  try {
    await knex
      .from({ p: TableNames.PROJECTS })
      .innerJoin({ c: TableNames.CONTACTS }, 'c.id', 'p.contact_id')
      .where({ 'p.type': 'Collaboration' })
      .whereNotNull('p.contact_id')
      .update({ 'p.name': knex.raw('c.name') });
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWorkspacesByIds = async (
  input:
    | (WorkspaceId | WorkspacePublicId)
    | (WorkspaceId | WorkspacePublicId)[],
) => {
  try {
    const loaders = createLoaders();

    if (Array.isArray(input)) {
      return await loaders.workspaces.loadMany(input);
    } else {
      return await loaders.workspaces.load(input);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

// Launch this once
// const deleteDuplicatedProjectStatus = async () => {
//   try {
//     const tasks = await knex
//       .from(TableNames.TASKS)
//       .where({ deleted_at: null })
//       .select();

//     const usedStatusIds = _.uniq(
//       tasks.map((t) => t.status_id).filter((s) => !!s),
//     );

//     const projectStatuses = await knex
//       .from(TableNames.PROJECT_STATUSES)
//       .select();

//     const projectStatusIds = projectStatuses.map((s) => s.id);

//     // get unusedStatusIds
//     const unusedStatusIds = _.difference(projectStatusIds, usedStatusIds);
//     console.log(unusedStatusIds);

//     const del = await knex
//       .from(TableNames.PROJECT_STATUSES)
//       .whereIn('id', unusedStatusIds)
//       .del();
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };

// const deleteDuplicatedProjectStatus = async () => {
//   try {
//     const projectStatuses = await knex
//       .from(TableNames.PROJECT_STATUSES)
//       .select();
//     //group by project_id
//     const groupedProjectStatuses = _.groupBy(projectStatuses, 'project_id');

//     await Promise.all(
//       _.map(groupedProjectStatuses, async (statuses, id) => {
//         // get non unique statuses
//         const nonUniqueStatuses = _.filter(statuses, (s) => {
//           return _.filter(statuses, { name: s.name }).length > 1;
//         });

//         if (!_.isEmpty(nonUniqueStatuses)) {
//           const firstStatus = nonUniqueStatuses[0];

//           const restStatuses = _.slice(nonUniqueStatuses, 1);
//           await knex
//             .from(TableNames.TASKS)
//             .whereIn(
//               'status_id',
//               restStatuses.map((s) => s.id),
//             )
//             .update({ status_id: firstStatus.id });
//         }
//       }),
//     );
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };

const getAttachmentsByWorkspaceIds = async (
  workspaceId: WorkspaceId[],
): Promise<TaskAttachmentModel[]> => {
  try {
    const res = await knex
      .from({ ta: TableNames.TASK_ATTACHMENTS })
      .leftJoin({ t: TableNames.TASKS }, 't.id', 'ta.card_id')
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .leftJoin({ wp: TableNames.WORKSPACE_PROJECTS }, 'w.project_id', 'p.id')
      .whereIn('wp.workspace_id', workspaceId)
      .select('ta.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttachmentsByProjectIds = async (
  projectIds: ProjectId[],
): Promise<TaskAttachmentModel[]> => {
  try {
    const res = await knex
      .from({ ta: TableNames.TASK_ATTACHMENTS })
      .leftJoin({ t: TableNames.TASKS }, 't.id', 'ta.card_id')
      .whereIn('t.job_id', projectIds)
      .select('ta.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttachmentsByTaskIds = async (
  taskIds: TaskId[],
): Promise<TaskAttachmentModel[]> => {
  try {
    const res = await knex
      .from({ ta: TableNames.TASK_ATTACHMENTS })
      .whereIn('ta.card_id', taskIds)
      .select('ta.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttachmentsByProjectGroupIds = async (
  projectGroupIds: ProjectGroupId[],
) => {
  try {
    const res = await knex
      .from({ ta: TableNames.TASK_ATTACHMENTS })
      .leftJoin({ t: TableNames.TASKS }, 't.id', 'ta.card_id')
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .leftJoin({ pg: TableNames.PROJECT_GROUPS }, 'pg.project_id', 'p.id')
      .whereIn('pg.id', projectGroupIds)
      .select('ta.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskCountByProjectId = async (projectId: ProjectId) => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({ job_id: projectId, deleted_at: null })
      .count('id as count');

    return _.get(res, '0.count', 0);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectsByMemberId = async (memberId: CompanyMemberId) => {
  try {
    const res = await knex
      .from({ p: TableNames.PROJECTS })
      .innerJoin({ t: TableNames.TASKS }, 't.job_id', 'p.id')
      .innerJoin({ tm: TableNames.TASK_MEMBERS }, 'tm.card_id', 't.id')
      .where({
        'tm.member_id': memberId,
        'p.deleted_at': null,
        'p.archived_at': null,
        't.archived_at': null,
        't.deleted_at': null,
      })
      .select('p.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksByMemberId = async (memberId: CompanyMemberId) => {
  try {
    const res = await knex
      .from({ t: TableNames.TASKS })
      .innerJoin({ tm: TableNames.TASK_MEMBERS }, 'tm.card_id', 't.id')
      .where({
        'tm.member_id': memberId,
        't.archived_at': null,
        't.deleted_at': null,
      })
      .select('t.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const moveTaskToMember = async (input: {
  sourceMemberId: CompanyMemberId;
  destinationMemberId: CompanyMemberId;
  destinationUserId: UserId;
  taskId: TaskId;
}) => {
  try {
    const { sourceMemberId, destinationMemberId, taskId, destinationUserId } =
      input;

    await knex
      .from(TableNames.TASK_MEMBERS)
      .where({
        card_id: taskId,
        member_id: sourceMemberId,
      })
      .del();

    await knex(TableNames.TASK_MEMBERS).insert({
      card_id: taskId,
      member_id: destinationMemberId,
      user_id: destinationUserId,
    });

    const res = await knex.from(TableNames.TASKS).where({ id: taskId }).first();

    return camelizeBoth(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectOwners = async (
  projectId: ProjectId,
): Promise<(CompanyMemberModel & { name: string; email: string })[]> => {
  try {
    const res = await knex
      .from({ mem: TableNames.COMPANY_MEMBERS })
      .leftJoin({ u: TableNames.USERS }, 'u.id', 'mem.user_id')
      .leftJoin(
        { po: TableNames.TASK_BOARD_OWNERS },
        'po.company_member_id',
        'mem.id',
      )
      .where({ 'po.job_id': projectId })
      .select('mem.*', 'u.email', 'u.name');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWorkspaceVisibilityWhitelist = async ({
  workspaceId,
}: {
  workspaceId: WorkspaceId;
}): Promise<{ teams?: CompanyTeamId[]; members?: CompanyMemberId[] }> => {
  try {
    const res = await knex
      .from(TableNames.WORKSPACE_VISIBILITY)
      .where('workspace_id', workspaceId)
      .select();

    let teams: CompanyTeamId[] = [];
    let members: CompanyMemberId[] = [];

    res.forEach((item) => {
      item.member_id ? members.push(item.member_id) : teams.push(item.team_id);
    });

    return {
      ...(teams.length > 0 && { teams }),
      ...(members.length > 0 && { members }),
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

const addToWorkspaceVisibilityWhitelist = async ({
  workspaceId,
  teamIds,
  memberIds,
}: {
  workspaceId: WorkspaceId;
  teamIds?: CompanyTeamId[];
  memberIds?: CompanyMemberId[];
}) => {
  try {
    if (teamIds) {
      await knex(TableNames.WORKSPACE_VISIBILITY)
        .insert(
          teamIds.map((teamId) => ({
            workspace_id: workspaceId,
            team_id: teamId,
          })),
        )
        .onConflict('(workspace_id, team_id)')
        .merge();
    }

    if (memberIds) {
      await knex(TableNames.WORKSPACE_VISIBILITY)
        .insert(
          memberIds.map((memberId) => ({
            workspace_id: workspaceId,
            member_id: memberId,
          })),
        )
        .onConflict('(workspace_id, member_id)')
        .merge();
    }

    const res = await knex
      .from(TableNames.WORKSPACES)
      .where('id', workspaceId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeFromWorkspaceVisibilityWhitelist = async ({
  workspaceId,
  memberIds = [],
  teamIds = [],
}: {
  workspaceId: WorkspaceId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
}) => {
  try {
    let query = ``;
    if (memberIds.length > 0 && teamIds.length > 0) {
      query = `WHERE workspace_id = ${workspaceId} AND (member_id IN(${memberIds}) OR team_id IN(${teamIds}))`;
      query = `WHERE workspace_id = ${workspaceId} AND (member_id IN(${memberIds}) OR team_id IN(${teamIds}))`;
    } else if (memberIds.length > 0) {
      query = `WHERE workspace_id = ${workspaceId} AND member_id IN(${memberIds})`;
    } else if (teamIds.length > 0) {
      query = `WHERE workspace_id = ${workspaceId} AND team_id IN(${teamIds})`;
    }

    await knex.raw(`
			DELETE FROM ${TableNames.WORKSPACE_VISIBILITY} ${query}
		`);

    const res = await knex
      .from(TableNames.WORKSPACES)
      .where('id', workspaceId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const setWorkspaceVisibility = async ({
  workspaceId,
  visibility,
  userId,
}: {
  workspaceId: WorkspaceId;
  visibility: number;
  userId: UserId;
}) => {
  try {
    await knex(TableNames.WORKSPACES)
      .update({
        visibility,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', workspaceId);

    const res = await knex
      .from(TableNames.WORKSPACES)
      .where('id', workspaceId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTeamsForWorkspaceIds = async ({ ids }: { ids: WorkspaceId[] }) => {
  try {
    const res = await knex
      .from({ tbt: TableNames.TASK_BOARD_TEAMS })
      .innerJoin(
        { wp: TableNames.WORKSPACE_PROJECTS },
        'wp.project_id',
        'tbt.job_id',
      )
      .whereIn('wp.workspace_id', ids)
      .select('tbt.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getVisibilityForWorkspaceIds = async ({
  ids,
}: {
  ids: WorkspaceId[];
}): Promise<CommonVisibilityModel[]> => {
  try {
    const res = await knex
      .from(TableNames.WORKSPACE_VISIBILITY)
      .whereIn('workspace_id', ids)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCustomColumnForGroup = async (input: {
  groupId: ProjectGroupId;
  customName: string;
  type: CustomColumnType;
}): Promise<ProjectGroupCustomColumnModel> => {
  try {
    const { groupId, customName, type } = input;

    const attribute = await knex(
      TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES,
    ).insert({ name: customName, type });

    const attributeId = _.head(attribute);

    const create = await knex(TableNames.PROJECT_GROUP_CUSTOM_COLUMNS).insert({
      group_id: groupId,
      attribute_id: attributeId,
    });

    const res = await knex(TableNames.PROJECT_GROUP_CUSTOM_COLUMNS)
      .where({
        group_id: groupId,
        attribute_id: attributeId,
      })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const editCustomColumnForGroup = async (input: {
  groupId: ProjectGroupId;
  attributeId: number;
  customName: string;
}): Promise<ProjectGroupCustomColumnModel> => {
  try {
    const { groupId, customName, attributeId } = input;

    await knex(TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES).update({
      name: customName,
    });

    const res = await knex(TableNames.PROJECT_GROUP_CUSTOM_COLUMNS)
      .where({
        group_id: groupId,
        attribute_id: attributeId,
      })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCustomColumnForGroup = async (input: {
  groupId: ProjectGroupId;
  attributeId: number;
  projectId: number;
}): Promise<ProjectGroupCustomColumnModel> => {
  try {
    const { groupId, attributeId, projectId } = input;

    const res = await knex(TableNames.PROJECT_GROUP_CUSTOM_COLUMNS)
      .where({
        group_id: groupId,
        attribute_id: attributeId,
      })
      .select();

    const projectGroups = await getProjectGroups(projectId);
    const groupIds = projectGroups.map((group) => group.id);
    const sel = await knex({ pgcc: TableNames.PROJECT_GROUP_CUSTOM_COLUMNS })
      .innerJoin(
        { pgca: TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES },
        'pgcc.attribute_id',
        'pgca.id',
      )
      .whereIn('pgcc.group_id', groupIds)
      .where({
        'pgcc.attribute_id': attributeId,
      })
      .select('pgcc.group_id', 'pgca.type', 'pgcc.attribute_id', 'pgca.name')
      .first();

    await knex
      .from(TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES)
      .where({
        type: sel.type,
        name: sel.name,
      })
      .del();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCustomAttribute = async (input: {
  attributeId: number;
}): Promise<void> => {
  try {
    const { attributeId } = input;

    await knex(TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES)
      .where('id', attributeId)
      .del();
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertCustomValueToTask = async (input: {
  groupId: ProjectGroupId;
  attributeId: number;
  taskId: TaskId;
  value: string | number;
}) => {
  try {
    const { groupId, attributeId, value, taskId } = input;
    await knex
      .from(TableNames.TASK_CUSTOM_VALUES)
      .insert({
        group_id: groupId,
        attribute_id: attributeId,
        task_id: taskId,
        value,
      })
      .onConflict(['group_id', 'attribute_id', 'task_id'])
      .merge();

    const res = await knex
      .from(TableNames.TASK_CUSTOM_VALUES)
      .where({
        group_id: groupId,
        attribute_id: attributeId,
        task_id: taskId,
        value,
      })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCustomValueToTask = async (input: {
  groupId: ProjectGroupId;
  attributeId: number;
  taskId: TaskId;
}) => {
  try {
    const { groupId, attributeId, taskId } = input;

    const res = await knex
      .from(TableNames.TASK_CUSTOM_VALUES)
      .where({
        group_id: groupId,
        attribute_id: attributeId,
        task_id: taskId,
      })
      .select();
    await knex
      .from(TableNames.TASK_CUSTOM_VALUES)
      .where({
        group_id: groupId,
        attribute_id: attributeId,
        task_id: taskId,
      })
      .del();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getGroupCustomColumns = async (input: { groupId: ProjectGroupId }) => {
  try {
    const { groupId } = input;

    const res = await knex
      .from(TableNames.PROJECT_GROUP_CUSTOM_COLUMNS)
      .where({
        group_id: groupId,
      })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskCustomValues = async (input: { taskId: TaskId }) => {
  try {
    const { taskId } = input;

    const res = await knex
      .from(TableNames.TASK_CUSTOM_VALUES)
      .where({
        task_id: taskId,
      })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const toggleCustomColumn = async ({
  projectId,
  attributeId,
}: {
  projectId: number;
  attributeId: number;
}): Promise<ProjectGroupCustomColumnModel> => {
  try {
    const projectGroups = await getProjectGroups(projectId);

    const groupIds = projectGroups.map((group) => group.id);

    const attributeIds = await getSameAttributeIds({
      attributeId,
      projectId,
    });

    await knex(TableNames.PROJECT_GROUP_CUSTOM_COLUMNS)
      .update({ enabled: knex.raw('NOT enabled') })
      .whereIn('group_id', groupIds)
      .whereIn('attribute_id', attributeIds);

    const res = await knex
      .from(TableNames.PROJECT_GROUP_CUSTOM_COLUMNS)
      .where({
        attribute_id: attributeId,
      })
      .whereIn('group_id', groupIds)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSameAttributeIds = async (input: {
  attributeId: number;
  projectId: ProjectId;
}) => {
  try {
    const { attributeId, projectId } = input;

    const results = await knex
      .select('pgca.id as attribute_id', 'pg.id as group_id', 'pg.project_id')
      .from({ pgca: TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES })
      .leftJoin(
        { pgcc: TableNames.PROJECT_GROUP_CUSTOM_COLUMNS },
        'pgca.id',
        'pgcc.attribute_id',
      )
      .leftJoin({ pg: TableNames.PROJECT_GROUPS }, 'pgcc.group_id', 'pg.id')
      .where('pgca.id', attributeId)
      .orWhere({
        'pgca.name': knex.raw(
          `(SELECT name FROM ${TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES} WHERE id = ?)`,
          [attributeId],
        ),
        'pgca.type': knex.raw(
          `(SELECT type FROM ${TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES} WHERE id = ?)`,
          [attributeId],
        ),
      });

    return results
      .filter((result) => result.project_id === projectId)
      .map((result) => result.attribute_id);
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const assignOrderingNumberToProjectGroups = async () => {
  try {
    const projects = await knex.from(TableNames.PROJECTS).select();

    for (const project of projects) {
      const projectGroups = await knex
        .from({ pg: TableNames.PROJECT_GROUPS })
        .leftJoin(
          { pgo: TableNames.PROJECT_GROUP_ORDERS },
          'pg.id',
          'pgo.group_id',
        )
        .where({
          'pg.project_id': project.id,
        })
        .select('pgo.ordering', 'pg.*');

      for (let i = 0; i < projectGroups.length; i++) {
        if (projectGroups[i]?.ordering === null) {
          // await knex(TableNames.PROJECT_GROUP_ORDERS).insert({
          //   project_id: project?.id,
          //   group_id: projectGroups[i]?.id,
          //   ordering: i + 1,
          // });
        }
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }
};
// assignOrderingNumberToProjectGroups();

const getGroupOrderingNumber = async (
  groupId: ProjectGroupId,
): Promise<number> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_GROUP_ORDERS)
      .where({
        group_id: groupId,
      })
      .select('ordering');

    return res[0]?.ordering;
  } catch (error) {
    return Promise.reject(error);
  }
};

const reorderGroups = async (input: {
  projectId: ProjectId;
  reordered: { groupId: ProjectGroupId; ordering: number }[];
}) => {
  try {
    const { reordered, projectId } = input;

    for (const { groupId, ordering } of reordered) {
      await knex(TableNames.PROJECT_GROUP_ORDERS)
        .where({
          project_id: projectId,
          group_id: groupId,
        })
        .update({
          ordering,
        });
    }
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

//launch once
const insertTemplateGallery = async () => {
  try {
    const groups = [
      {
        name: 'Team',
        key: 'team',
        templates: [
          {
            name: 'Minutes',
            title: 'Minutes: Add a Topic',
            groups: [
              {
                name: 'Action Items',
                tasks: ['Task 1', 'Task 2'],
              },
              {
                name: 'Discussion',
                tasks: ['Topic 1', 'Topic 2'],
              },
              {
                name: 'References',
                tasks: ['Source 1', 'Source 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
          {
            name: 'Brainstorm',
            title: 'Brainstorm: Add a Topic',
            groups: [
              {
                name: 'Goals',
                tasks: ['Goal 1', 'Goal 2'],
              },
              {
                name: 'Inspiration',
                tasks: ['Inspiration 1', 'Inspiration 2'],
              },
              {
                name: 'Ideas',
                tasks: ['Idea 1', 'Idea 2'],
              },
              {
                name: 'Next Steps',
                tasks: ['Plan 1', 'Plan 2'],
              },
            ],
            status: ['Avoid', 'Consider', 'Shortlist', 'Proceed'],
            fields: ['Assignee'],
          },
          {
            name: 'Weekly Updates (PPP)',
            title: 'PPP: #year Week #number',
            groups: [
              {
                name: 'Plans',
                tasks: ['Plan 1', 'Plan 2'],
              },
              {
                name: 'Progress',
                tasks: ['Progress 1', 'Progress 2'],
              },
              {
                name: 'Problems',
                tasks: ['Problem 1', 'Problem 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
          {
            name: 'Quarterly Review (OKR)',
            title: 'OKR: #year Q#number',
            groups: [
              {
                name: 'Objectives',
                tasks: ['Objective 1', 'Objective 2'],
              },
              {
                name: 'Key Results',
                tasks: ['Key Result 1', 'Key Result 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Results'],
          },
          {
            name: 'Project Product Plan',
            title: 'Plan: Add a Project/Product Name',
            groups: [
              {
                name: 'Objectives',
                tasks: ['Objective 1', 'Objective 2'],
              },
              {
                name: 'Milestones',
                tasks: ['Milestone 1', 'Milestone 2'],
              },
              {
                name: 'Budget',
                tasks: ['Budget 1', 'Budget 2'],
              },
              {
                name: 'Appendix',
                tasks: ['Appendix 1', 'Appendix 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Budget value'],
          },
        ],
      },
      {
        name: 'Personal',
        key: 'personal',
        templates: [
          {
            name: 'Weekly Planner',
            title: 'Plan: #year Week #number',
            groups: [
              {
                name: 'Monday',
                tasks: ['Todo 1', 'Todo 2'],
              },
              {
                name: 'Tuesday',
                tasks: ['Todo 1', 'Todo 2'],
              },
              {
                name: 'Wednesday',
                tasks: ['Todo 1', 'Todo 2'],
              },
              {
                name: 'Thursday',
                tasks: ['Todo 1', 'Todo 2'],
              },
              {
                name: 'Friday',
                tasks: ['Todo 1', 'Todo 2'],
              },
              {
                name: 'Saturday',
                tasks: ['Todo 1', 'Todo 2'],
              },
              {
                name: 'Sunday',
                tasks: ['Todo 1', 'Todo 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Priority'],
          },
          {
            name: 'Weekly Expenses',
            title: 'Plan: #year Week #number',
            groups: [
              {
                name: 'Monday',
                tasks: ['Food', 'Wellness'],
              },
              {
                name: 'Tuesday',
                tasks: ['Food', 'Wellness'],
              },
              {
                name: 'Wednesday',
                tasks: ['Food', 'Wellness'],
              },
              {
                name: 'Thursday',
                tasks: ['Food', 'Wellness'],
              },
              {
                name: 'Friday',
                tasks: ['Food', 'Wellness'],
              },
              {
                name: 'Saturday',
                tasks: ['Food', 'Wellness'],
              },
              {
                name: 'Sunday',
                tasks: ['Food', 'Wellness'],
              },
            ],
            status: ['Needs', 'Wants'],
            fields: ['Budget value', 'Actual value'],
          },
        ],
      },
      {
        name: 'Creative',
        key: 'creative',
        templates: [
          {
            name: 'Creative Brief',
            title: 'Creative Brief: Add a Project Name',
            groups: [
              {
                name: 'Description',
                tasks: ['Intro 1', 'Intro 2'],
              },
              {
                name: 'Objectives',
                tasks: ['Objective 1', 'Objective 2'],
              },
              {
                name: 'Audience',
                tasks: ['Audience 1', 'Audience 2'],
              },
              {
                name: 'Messaging',
                tasks: ['Look and feel', 'Tone'],
              },
              {
                name: 'Deliverables',
                tasks: ['Deliverable 1', 'Deliverable 2'],
              },
              {
                name: 'Budget',
                tasks: ['Budget 1', 'Budget 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: [
              'Due Date',
              'Assignee',
              'Priority',
              'Budget value',
              'Budget hours',
            ],
          },
          {
            name: 'Production Plan',
            title: 'Production Plan: Add a Project Name',
            groups: [
              {
                name: 'Overview',
                tasks: ['Intro 1', 'Intro 2'],
              },
              {
                name: 'Mood Board',
                tasks: ['Sample 1', 'Sample 2'],
              },
              {
                name: 'Budget',
                tasks: ['Budget 1', 'Budget 2'],
              },
              {
                name: 'Script',
                tasks: ['Script 1', 'Script 2'],
              },
              {
                name: 'Storyboard',
                tasks: ['Scene 1', 'Scene 2'],
              },
              {
                name: 'Music',
                tasks: ['Music 1', 'Music 2'],
              },
              {
                name: 'Footages',
                tasks: ['Video 1', 'Video 2'],
              },
              {
                name: 'Rough Cuts',
                tasks: ['Version 1', 'Version 2'],
              },
              {
                name: 'Final',
                tasks: ['Final'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: [
              'Due Date',
              'Assignee',
              'Priority',
              'Budget value',
              'Budget hours',
            ],
          },
        ],
      },
      {
        name: 'Education',
        key: 'education',
        templates: [
          {
            name: 'Course Content',
            title: 'Course: Add a Course Name',
            groups: [
              {
                name: 'Chapter 1',
                tasks: ['Lesson 1', 'Lesson 2'],
              },
              {
                name: 'Chapter 2',
                tasks: ['Lesson 1', 'Lesson 2'],
              },
              {
                name: 'Chapter 3',
                tasks: ['Lesson 1', 'Lesson 2'],
              },
              {
                name: 'Chapter 4',
                tasks: ['Lesson 1', 'Lesson 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
          {
            name: 'Research Paper',
            title: 'Research: Add a Topic',
            groups: [
              {
                name: 'Abstract',
                tasks: ['Abstract 1', 'Abstract 2'],
              },
              {
                name: 'Methods',
                tasks: ['Method 1', 'Method 2'],
              },
              {
                name: 'Results',
                tasks: ['Result 1', 'Result 2'],
              },
              {
                name: 'Discussion',
                tasks: ['Discussion 1', 'Discussion 2'],
              },
              {
                name: 'References',
                tasks: ['Reference 1', 'Reference 2'],
              },
              {
                name: 'Appendix',
                tasks: ['Appendix 1', 'Appendix 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
        ],
      },
      {
        name: 'HR',
        key: 'HR',
        templates: [
          {
            name: 'New Recruit Onboarding',
            title: 'New Recruit Onboarding',
            groups: [
              {
                name: 'General',
                tasks: ['Background', 'Mission & Vision', 'Management'],
              },
              {
                name: 'Checklist',
                tasks: ['Orientation', 'Workstation', 'Stationery'],
              },
              {
                name: 'Forms',
                tasks: ['Leave Form', 'Claim Form'],
              },
              {
                name: 'Tools',
                tasks: ['GoKudos'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
          {
            name: 'Job Vacancy',
            title: 'Vacancy: Add a Position Name',
            groups: [
              {
                name: 'Responsibles',
                tasks: ['Responsible 1', 'Responsible 2'],
              },
              {
                name: 'Requirements',
                tasks: ['Requirement 1', 'Requirement 2'],
              },
              {
                name: 'Perks',
                tasks: ['Basic Salary', 'Allowances'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
        ],
      },
      {
        name: 'IT',
        key: 'IT',
        templates: [
          {
            name: 'Asset Tracking',
            title: 'Asset Tracking',
            groups: [
              {
                name: 'Laptops',
                tasks: ['Laptop 1', 'Laptop 2'],
              },
              {
                name: 'Printers',
                tasks: ['Printer 1', 'Printer 2'],
              },
              {
                name: 'Licenses',
                tasks: ['License 1', 'License 2'],
              },
              {
                name: 'Domains',
                tasks: ['Domain1.com', 'Domain2.com'],
              },
            ],
            status: ['New', 'Used', 'Damaged', 'Scrapped'],
            fields: ['Due Date', 'Assignee'],
          },
          {
            name: 'IT Request',
            title: 'IT Request',
            groups: [
              {
                name: 'Software',
                tasks: ['Software 1', 'Software 2'],
              },
              {
                name: 'Hardware',
                tasks: ['Hardware 1', 'Hardware 2'],
              },
              {
                name: 'Network',
                tasks: ['Network 1', 'Network 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
          {
            name: 'Software Development',
            title: 'Development: Add a Project Name',
            groups: [
              {
                name: 'Planning',
                tasks: ['Objective', 'Research'],
              },
              {
                name: 'Design',
                tasks: ['Prototyping', 'UI/UX'],
              },
              {
                name: 'Development',
                tasks: ['Database', 'Programming'],
              },
              {
                name: 'Testing',
                tasks: ['Testing 1', 'Testing 2'],
              },
              {
                name: 'Deployment',
                tasks: ['Server 1', 'Server 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
        ],
      },
      {
        name: 'Marketing',
        key: 'Marketing',
        templates: [
          {
            name: 'Content Calendar',
            title: 'Content Calendar: #year',
            groups: [
              {
                name: 'January',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'February',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'March',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'April',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'May',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'June',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'July',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'August',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'September',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'October',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'November',
                tasks: ['Post 1', 'Post 2'],
              },
              {
                name: 'December',
                tasks: ['Post 1', 'Post 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee'],
          },
          {
            name: 'Brand Assets',
            title: 'Brand: Add a Brand Name',
            groups: [
              {
                name: 'Logo',
                tasks: ['Master Logo', 'Logomark'],
              },
              {
                name: 'Colour',
                tasks: ['Primary Colour', 'Accent Colour'],
              },
              {
                name: 'Typography',
                tasks: ['Title Font', 'Body Font'],
              },
              {
                name: 'Templates',
                tasks: ['Business Card', 'Letterhead'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee'],
          },
          {
            name: 'Marketing Campaign',
            title: 'Campaign: Add a Campaign Name',
            groups: [
              {
                name: 'Objectives',
                tasks: ['Objectives 1', 'Objectives 2'],
              },
              {
                name: 'Audiences',
                tasks: ['Audience 1', 'Audience 2'],
              },
              {
                name: 'Content',
                tasks: ['Copywriting', 'Design'],
              },
              {
                name: 'Channels',
                tasks: ['Search Engine', 'Social Media'],
              },
              {
                name: 'Budget',
                tasks: ['Budget 1', 'Budget 2'],
              },
              {
                name: 'Results',
                tasks: ['Impression', 'Conversion'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee'],
          },
        ],
      },
      {
        name: 'Sales',
        key: 'Sales',
        templates: [
          {
            name: 'Sales Pipeline',
            title: 'Sales Pipeline',
            groups: [
              {
                name: 'New Opportunities',
                tasks: ['Prospect 1', 'Prospect 2'],
              },
              {
                name: 'Active Opportunities',
                tasks: ['Prospect 1', 'Prospect 2'],
              },
              {
                name: 'Last Stage Opportunities',
                tasks: ['Prospect 1', 'Prospect 2'],
              },
              {
                name: 'Closed Won',
                tasks: ['Prospect 1', 'Prospect 2'],
              },
              {
                name: 'Closed Lost',
                tasks: ['Prospect 1', 'Prospect 2'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee', 'Priority'],
          },
          {
            name: 'Sales Deck',
            title: 'Sales Deck',
            groups: [
              {
                name: 'Executive Summary',
                tasks: ['Problems', 'Solutions'],
              },
              {
                name: 'About Us',
                tasks: ['Background', 'Mission & Vision', 'Management'],
              },
              {
                name: 'Product/Services',
                tasks: ['Feature 1', 'Feature 2'],
              },
              {
                name: 'Pricing',
                tasks: ['Plans', 'Bundles'],
              },
              {
                name: 'Call to Action',
                tasks: ['Why Us', 'Free Consultation'],
              },
            ],
            status: ['Todo', 'Doing', 'Done', 'KIV'],
            fields: ['Due Date', 'Assignee'],
          },
        ],
      },
    ];

    await knex.from(TableNames.PROJECT_TEMPLATE_GALLERIES).insert({
      gallery_templates: JSON.stringify(groups),
      enabled: true,
    });
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const getProjectTemplateGalleries =
  async (): Promise<ProjectTemplateGalleryModel> => {
    try {
      const res = await knex
        .from(TableNames.PROJECT_TEMPLATE_GALLERIES)
        .where({ enabled: 1 })
        .first();

      return camelize(res);
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  };

// const getUnassignedProjectGroups = async () => {
//   try {
//     const res = await knex
//       .from(TableNames.PROJECT_GROUPS)
//       .where({ name: 'Unassigned' })
//       .select();

//     const groupedByProjectId = _.groupBy(res, 'project_id');

//     Object.entries(groupedByProjectId).forEach(async ([key, value]) => {
//       if (value?.length > 1) {
//         const firstUnassignedGroup = value[0];

//         const tasks = await knex
//           .from(TableNames.TASKS)
//           .where({
//             group_id: firstUnassignedGroup.id,
//           })
//           .select();

//         if (_.isEmpty(tasks)) {
//           await knex
//             .from(TableNames.PROJECT_GROUPS)
//             .where({ id: firstUnassignedGroup.id })
//             .del();
//         }
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     return Promise.reject(error);
//   }
// };
// getUnassignedProjectGroups();

const getUnassignedGroupByProjectId = async (
  projectId: number,
): Promise<ProjectGroupModel> => {
  try {
    const res = await knex
      .from(TableNames.PROJECT_GROUPS)
      .where({
        name: 'Unassigned',
        project_id: projectId,
      })
      .select();

    if (_.isEmpty(res)) {
      const createUnassigned = await knex
        .from(TableNames.PROJECT_GROUPS)
        .insert({
          name: 'Unassigned',
          project_id: projectId,
        });

      const unassignedGroup = await knex
        .from(TableNames.PROJECT_GROUPS)
        .where({ id: _.head(createUnassigned) })
        .first();

      return camelize(unassignedGroup);
    }

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectById = async (id: ProjectId) => {
  try {
    const project = await knex
      .from(TableNames.PROJECTS)
      .where({ id, deleted_at: null })
      .select();

    return camelizeBoth(_.head(project));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksByGroupId = async ({ groupId }: { groupId: ProjectGroupId }) => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({ group_id: groupId, archived: 0 })
      .whereNull('deleted_at')
      .select();

    return camelizeBoth(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  getProjectsByWorkspaceId,
  assignProjectsToWorkspace,
  removeProjectsFromWorkspace,
  createProject,
  getProjectInvoices,
  createProjectInvoice,
  editProjectInvoice,
  deleteProjectInvoices,
  createProjectClaim,
  editProjectClaim,
  deleteProjectClaims,
  getProjectClaims,
  createProjectTimeCost,
  editProjectTimeCost,
  deleteProjectTimeCosts,
  getProjectTimeCosts,
  createProjectBillingAuditLog,
  getProjectTemplates,
  createProjectTemplate,
  deleteProjectTemplates,
  updateProjectTemplate,
  createProjectStatus,
  deleteProjectStatuses,
  updateProjectStatus,
  createProjectSettings,
  updateProjectSettings,
  createProjectTemplateStatus,
  updateProjectTemplateStatus,
  getProjectSettings,
  getProjectTemplateStatuses,
  getProjectStatusesByProjectId,
  getProjectsByCompanyId,
  createProjectGroup,
  moveGroupTasks,
  getProjectGroups,
  getAllProjectTemplates,
  setProjectVisibility,
  deleteProjectTemplateStatuses,
  updateProjectOwners,
  updateProject,
  updateProjectGroup,
  deleteWorkspaces,
  copyProject,
  updateProjectsArchivedState,
  getWorkspaceByProjectId,
  deleteProjectGroups,
  moveProjectGroup,
  getDefaultProjects,
  getDefaultTasks,
  deleteWorkspaceProjects,
  getAllSubStatuses,
  applySubStatusesAsProjectStatusesToTask,
  allPersonalProjects,
  renameLegacyCollaborationProjectUsingContactName,
  getWorkspacesByIds,
  getAttachmentsByWorkspaceIds,
  getAttachmentsByProjectIds,
  getAttachmentsByTaskIds,
  getAttachmentsByProjectGroupIds,
  getTaskCountByProjectId,
  getProjectsByMemberId,
  getTasksByMemberId,
  moveTaskToMember,
  getProjectOwners,
  getWorkspaceVisibilityWhitelist,
  addToWorkspaceVisibilityWhitelist,
  removeFromWorkspaceVisibilityWhitelist,
  setWorkspaceVisibility,
  getTeamsForWorkspaceIds,
  getVisibilityForWorkspaceIds,
  createCustomColumnForGroup,
  deleteCustomAttribute,
  deleteCustomColumnForGroup,
  insertCustomValueToTask,
  deleteCustomValueToTask,
  getGroupCustomColumns,
  getTaskCustomValues,
  toggleCustomColumn,
  editCustomColumnForGroup,
  getGroupOrderingNumber,
  reorderGroups,
  getProjectTemplateGalleries,
  getUnassignedGroupByProjectId,
  getProjectById,
  getTasksByGroupId,
};
