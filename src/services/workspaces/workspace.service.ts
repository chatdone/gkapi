import { TASK_KANBAN_POSITION_BUFFER } from '@constants';
import {
  CompanyStore,
  createLoaders,
  TaskStore,
  WorkspaceStore,
} from '@data-access';
import { TableNames } from '@db-tables';
import { CommonVisibilityModel } from '@models/common.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamId,
} from '@models/company.model';
import {
  AffectedRowsResult,
  ProjectClaimModel,
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
  TaskBoardTeamId,
  TaskId,
  TaskModel,
} from '@models/task.model';
import { TeamId } from '@models/team.model';
import { UserId, UserModelUpdated as UserModel } from '@models/user.model';
import {
  CustomColumnType,
  ProjectGroupCustomColumnModel,
  WorkspaceId,
  WorkspaceModel,
} from '@models/workspace.model';
import {
  EventManagerService,
  SubscriptionService,
  TaskService,
  WorkspaceService,
} from '@services';
import {
  LogEventsProjectActionTypes,
  LogEventsProjectBillingTypes,
} from '@services/event-manager/event-manager.service';
import { CommonVisibilityTypes } from '@services/task/task.constant';
import logger from '@tools/logger';
import _ from 'lodash';

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];

type GetWorkspacesInput = {
  ids?: WorkspaceId[];
  user: UserModel;
  companyId: CompanyId;
};

type CreateWorkspaceInput = {
  name: string;
  bgColor: string;
  companyId: CompanyId;
  user: UserModel;
};

type UpdateWorkspaceInput = {
  name?: string;
  bgColor?: string;
  workspaceId: WorkspaceId;
  user: UserModel;
};

type AssignProjectsToWorkspaceInput = {
  workspaceId: WorkspaceId;
  projectIds: ProjectId[];
  user: UserModel;
};

type RemoveProjectsFromWorkspaceInput = {
  workspaceId: WorkspaceId;
  projectIds: ProjectId[];
  user: UserModel;
};

type MoveProjectsToWorkspaceInput = {
  sourceWorkspaceId: WorkspaceId;
  destinationWorkspaceId: WorkspaceId;
  projectIds: ProjectId[];
  user: UserModel;
};

type CreateProjectInput = {
  name: string;
  user: UserModel;
  companyId: CompanyId;
  workspaceId?: WorkspaceId;
  projectTemplateId?: ProjectTemplateId;
  visibility?: number;
  ownerIds?: UserId[];
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

type InvoiceEditInput = {
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

type ProjectTemplateInput = {
  name: string;
  companyId: CompanyId;
  columns: string;
  statuses: { name: string; color: string; notify?: boolean }[];
};

type ProjectTemplateUpdateInput = {
  templateId: ProjectTemplateId;
  name?: string;
  columns?: string;
};

type ProjectStatusInput = {
  name: string;
  color: string;
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

const defaultStatuses = [
  { name: 'To Do', color: 'blue', notify: false },
  { name: 'Doing', color: 'gold', notify: false },
  { name: 'Done', color: 'green', notify: false },
  { name: 'On hold', color: 'red', notify: false },
];

const getWorkspaces = async (
  input: GetWorkspacesInput,
): Promise<WorkspaceModel[]> => {
  try {
    const { ids, companyId, user } = input;
    const res = await WorkspaceStore.getWorkspaces({
      ids,
      companyId,
    });

    const visibleWorkspaces = await exportFunctions.filterVisibleWorkspaces({
      workspaces: res,
      userId: user?.id,
      companyId,
    });

    return visibleWorkspaces;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createWorkspace = async (input: CreateWorkspaceInput) => {
  try {
    const { name, bgColor, companyId, user } = input;
    const res = await WorkspaceStore.createWorkspace({
      name,
      bgColor,
      companyId,
      userId: user.id,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateWorkspace = async (input: UpdateWorkspaceInput) => {
  try {
    const { name, bgColor, workspaceId, user } = input;
    const res = await WorkspaceStore.updateWorkspace({
      name,
      bgColor,
      workspaceId,
      userId: user.id,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignProjectsToWorkspace = async (
  input: AssignProjectsToWorkspaceInput,
) => {
  try {
    const { workspaceId, projectIds } = input;
    const res = await WorkspaceStore.assignProjectsToWorkspace({
      workspaceId,
      projectIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeProjectsFromWorkspace = async (
  input: RemoveProjectsFromWorkspaceInput,
) => {
  try {
    const { workspaceId, projectIds } = input;
    const res = await WorkspaceStore.removeProjectsFromWorkspace({
      workspaceId,
      projectIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const moveProjectsToWorkspace = async (
  input: MoveProjectsToWorkspaceInput,
): Promise<WorkspaceModel[]> => {
  try {
    const { sourceWorkspaceId, destinationWorkspaceId, projectIds } = input;

    const source = await WorkspaceStore.removeProjectsFromWorkspace({
      workspaceId: sourceWorkspaceId,
      projectIds,
    });

    const destination = await WorkspaceStore.assignProjectsToWorkspace({
      workspaceId: destinationWorkspaceId,
      projectIds,
    });

    return [source, destination];
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProject = async (input: CreateProjectInput) => {
  try {
    const {
      name,
      user,
      companyId,
      workspaceId,
      projectTemplateId,
      visibility,
      ownerIds,
    } = input;

    const project = await WorkspaceStore.createProject({
      name,
      companyId,
      userId: user.id,
      visibility,
    });

    if (projectTemplateId) {
      await exportFunctions.applyProjectTemplate({
        projectId: project.id,
        templateId: projectTemplateId,
      });
    }

    if (workspaceId) {
      await exportFunctions.assignProjectsToWorkspace({
        workspaceId,
        user,
        projectIds: [project.id],
      });
    }

    if (!_.isEmpty(ownerIds)) {
      await TaskStore.updateTaskBoardOwners({
        boardId: project.id,
        companyMemberIds: ownerIds as CompanyMemberId[],
      });
    }

    return project;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProjectInvoices = async (input: GetProjectInvoicesInput) => {
  try {
    const { projectId, companyId, sort, type, limit, offset } = input;
    const res = await WorkspaceStore.getProjectInvoices({
      projectId,
      companyId,
      sort,
      type,
      limit,
      offset,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectInvoices.name,
        input,
      },
    });
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

    const res = await WorkspaceStore.createProjectInvoice({
      name,
      invoiceNo,
      quantity,
      price,
      actualCost,
      projectId,
      createdBy,
    });

    if (!_.isEmpty(res)) {
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_INVOICE_CREATED,
        billingType: LogEventsProjectBillingTypes.PROJECT_INVOICES,
        name,
        createdBy,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectInvoice.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const editProjectInvoice = async (
  input: InvoiceEditInput,
  oldProjectInvoice: ProjectInvoiceModel,
) => {
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

    const res = (await WorkspaceStore.editProjectInvoice({
      name,
      invoiceNo,
      quantity,
      price,
      actualCost,
      updatedBy,
      invoiceId,
    })) as ProjectInvoiceModel;

    if (!_.isEmpty(res)) {
      const changedData = {
        from: {
          name: oldProjectInvoice?.name,
          invoiceNo: oldProjectInvoice?.invoiceNo,
          quantity: oldProjectInvoice?.quantity,
          price: oldProjectInvoice?.price,
          actualCost: oldProjectInvoice?.actualCost,
        },
        to: {
          name: res?.name,
          invoiceNo: res?.invoiceNo,
          quantity: res?.quantity,
          price: res?.price,
          actualCost: res?.actualCost,
        },
      };
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_INVOICE_EDITED,
        billingType: LogEventsProjectBillingTypes.PROJECT_INVOICES,
        name: res?.name,
        createdBy: updatedBy,
        data: JSON.stringify(changedData),
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: editProjectInvoice.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const deleteProjectInvoices = async (
  projectInvoices: ProjectInvoiceModel[],
  deletedBy: UserId,
): Promise<ProjectInvoiceModel[]> => {
  try {
    const invoiceIds = projectInvoices.map((invoice) => invoice.id);

    const res = await WorkspaceStore.deleteProjectInvoices(invoiceIds);

    if (!_.isEmpty(res)) {
      const name = projectInvoices.map((invoice) => invoice.name).join(', ');
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_INVOICE_DELETED,
        billingType: LogEventsProjectBillingTypes.PROJECT_INVOICES,
        name,
        createdBy: deletedBy,
      });
    }
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: deleteProjectInvoices.name,
        invoiceIds: projectInvoices.map((invoice) => invoice.id),
      },
    });
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

    const res = await WorkspaceStore.createProjectClaim({
      name,
      description,
      note,
      memberId,
      amount,
      attachmentUrl,
      status,
      projectId,
      createdBy,
    });

    if (!_.isEmpty(res)) {
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_CLAIM_CREATED,
        billingType: LogEventsProjectBillingTypes.PROJECT_CLAIMS,
        name,
        createdBy,
        memberId,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectClaim.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const editProjectClaim = async (
  input: ClaimEditInput,
  oldProjectClaim: ProjectClaimModel,
) => {
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

    const res = await WorkspaceStore.editProjectClaim({
      name,
      description,
      note,
      memberId,
      amount,
      attachmentUrl,
      status,
      updatedBy,
      claimId,
    });

    if (!_.isEmpty(res)) {
      const changedData = {
        from: {
          name: oldProjectClaim?.name,
          description: oldProjectClaim?.description,
          note: oldProjectClaim?.note,
          memberId: oldProjectClaim?.memberId,
          amount: oldProjectClaim?.amount,
          attachmentUrl: oldProjectClaim?.attachmentUrl,
          status: oldProjectClaim?.status,
        },
        to: {
          name: res?.name,
          description: res?.description,
          note: res?.note,
          memberId: res?.memberId,
          amount: res?.amount,
          attachmentUrl: res?.attachmentUrl,
          status: res?.status,
        },
      };
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_CLAIM_EDITED,
        billingType: LogEventsProjectBillingTypes.PROJECT_CLAIMS,
        name: res?.name,
        createdBy: updatedBy,
        data: JSON.stringify(changedData),
        memberId,
      });
    }
    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: editProjectClaim.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const deleteProjectClaims = async (
  projectClaims: ProjectClaimModel[],
  deletedBy: UserId,
) => {
  try {
    const claimIds = projectClaims.map((claim) => claim.id);
    const res = await WorkspaceStore.deleteProjectClaims(claimIds);

    if (!_.isEmpty(res)) {
      const name = projectClaims.map((claim) => claim.name).join(', ');
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_CLAIM_DELETED,
        billingType: LogEventsProjectBillingTypes.PROJECT_CLAIMS,
        name,
        createdBy: deletedBy,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: deleteProjectClaims.name,
        claimIds: projectClaims.map((claim) => claim.id),
        deletedBy,
      },
    });
    return Promise.reject(error);
  }
};

const getProjectClaims = async (input: GetProjectClaimsInput) => {
  try {
    const { projectId, companyId, type, sort, limit, offset } = input;
    const res = await WorkspaceStore.getProjectClaims({
      projectId,
      companyId,
      type,
      sort,
      limit,
      offset,
    });

    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectClaims.name,
        input,
      },
    });
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
      projectId,
      createdBy,
      note,
    } = input;

    const res = await WorkspaceStore.createProjectTimeCost({
      date,
      timeIn,
      timeOut,
      taskId,
      memberId,
      amount,
      projectId,
      createdBy,
      note,
    });

    if (!_.isEmpty(res)) {
      const loaders = createLoaders();
      const member = (await loaders.companyMembers.load(
        memberId,
      )) as CompanyMemberModel;
      const user = (await loaders.users.load(member?.user_id)) as UserModel;
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_TIME_COST_CREATED,
        billingType: LogEventsProjectBillingTypes.PROJECT_TIME_COSTS,
        name: user?.name || user?.email,
        createdBy,
        memberId,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectTimeCost.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const editProjectTimeCost = async (
  input: TimeCostEditInput,
  oldProjectTimeCost: ProjectTimeCostModel,
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

    const res = await WorkspaceStore.editProjectTimeCost({
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
    });

    if (!_.isEmpty(res)) {
      const changedData = {
        from: {
          date: oldProjectTimeCost?.date,
          timeIn: oldProjectTimeCost?.timeIn,
          timeOut: oldProjectTimeCost?.timeOut,
          taskId: oldProjectTimeCost?.taskId,
          memberId: oldProjectTimeCost?.memberId,
          amount: oldProjectTimeCost?.amount,
          note: oldProjectTimeCost?.note,
        },
        to: {
          date: res?.date,
          timeIn: res?.timeIn,
          timeOut: res?.timeOut,
          taskId: res?.taskId,
          memberId: res?.memberId,
          amount: res?.amount,
          note: res?.note,
        },
      };

      const loaders = createLoaders();
      const member = (await loaders.companyMembers.load(
        oldProjectTimeCost?.memberId,
      )) as CompanyMemberModel;
      const user = (await loaders.users.load(member?.user_id)) as UserModel;
      const name = user?.name || user?.email;
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_TIME_COST_EDITED,
        billingType: LogEventsProjectBillingTypes.PROJECT_TIME_COSTS,
        name,
        createdBy: updatedBy,
        data: JSON.stringify(changedData),
        memberId,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: editProjectTimeCost.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const deleteProjectTimeCosts = async (
  projectTimeCosts: ProjectTimeCostModel[],
  deletedBy: UserId,
): Promise<ProjectTimeCostModel[]> => {
  try {
    const timeCostIds = projectTimeCosts.map((timeCost) => timeCost.id);
    const res = await WorkspaceStore.deleteProjectTimeCosts(timeCostIds);

    if (!_.isEmpty(res)) {
      const loaders = createLoaders();
      const member = (await loaders.companyMembers.load(
        projectTimeCosts[0]?.memberId,
      )) as CompanyMemberModel;
      const user = (await loaders.users.load(member?.user_id)) as UserModel;
      const name = user?.name || user?.email;
      await EventManagerService.logProjectBilling({
        actionType: LogEventsProjectActionTypes.PROJECT_TIME_COST_DELETED,
        billingType: LogEventsProjectBillingTypes.PROJECT_TIME_COSTS,
        name,
        createdBy: deletedBy,
      });
    }
    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: deleteProjectTimeCosts.name,
        timeCostIds: projectTimeCosts.map((timeCost) => timeCost.id),
        deletedBy,
      },
    });
    return Promise.reject(error);
  }
};

const getProjectTimeCosts = async (
  input: GetProjectTimeCostsInput,
): Promise<ProjectTimeCostModel[]> => {
  try {
    const { projectId, companyId, type, sort, limit, offset } = input;
    const res = await WorkspaceStore.getProjectTimeCosts({
      projectId,
      companyId,
      type,
      sort,
      limit,
      offset,
    });
    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectTimeCosts.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const getProjectTemplates = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<ProjectTemplateModel[]> => {
  try {
    const res = await WorkspaceStore.getProjectTemplates({ companyId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectTemplates.name,
        input: companyId,
      },
    });
    return Promise.reject(error);
  }
};

const createProjectTemplate = async (
  input: ProjectTemplateInput,
): Promise<ProjectTemplateModel> => {
  const { name, companyId, columns, statuses } = input;
  try {
    const res = await WorkspaceStore.createProjectTemplate({
      name,
      companyId,
      columns,
    });

    if (!_.isEmpty(statuses)) {
      for (const status of statuses) {
        await exportFunctions.createProjectTemplateStatus({
          name: status.name,
          color: status.color,
          projectTemplateId: res.id,
          notify: status?.notify,
        });
      }
    }
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectTemplate.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const validateTemplateColumns = async (
  columns: string,
): Promise<boolean | Error> => {
  try {
    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: validateTemplateColumns.name,
        input: columns,
      },
    });

    return Promise.reject(error);
  }
};

const deleteProjectTemplates = async (
  templateIds: ProjectTemplateId[],
): Promise<AffectedRowsResult> => {
  try {
    const res = await WorkspaceStore.deleteProjectTemplates(templateIds);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: deleteProjectTemplates.name,
        input: templateIds,
      },
    });
    return Promise.reject(error);
  }
};

const updateProjectTemplate = async (
  input: ProjectTemplateUpdateInput,
): Promise<ProjectTemplateModel> => {
  try {
    const res = await WorkspaceStore.updateProjectTemplate(input);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: updateProjectTemplate.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const createProjectStatus = async (
  input: ProjectStatusInput,
): Promise<ProjectStatusModel> => {
  try {
    const { name, color, projectId } = input;
    const projectStatuses = await WorkspaceStore.getProjectStatusesByProjectId(
      projectId,
    );
    const sequence =
      (projectStatuses?.length || 1) * TASK_KANBAN_POSITION_BUFFER;
    const res = await WorkspaceStore.createProjectStatus({
      name,
      color,
      projectId,
      sequence,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectStatus.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const deleteProjectStatuses = async (
  statusIds: ProjectStatusId[],
): Promise<AffectedRowsResult> => {
  try {
    const res = await WorkspaceStore.deleteProjectStatuses(statusIds);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: deleteProjectStatuses.name,
        input: statusIds,
      },
    });
    return Promise.reject(error);
  }
};

const updateProjectStatus = async (
  input: ProjectStatusUpdateInput,
): Promise<ProjectStatusModel> => {
  try {
    const res = await WorkspaceStore.updateProjectStatus(input);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: updateProjectStatus.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const createProjectSettings = async (
  input: ProjectSettingsInput,
): Promise<ProjectSettingsModel> => {
  try {
    const res = await WorkspaceStore.createProjectSettings(input);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectSettings.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const updateProjectSettings = async (
  input: ProjectSettingsUpdateInput,
): Promise<ProjectSettingsModel> => {
  try {
    const res = await WorkspaceStore.updateProjectSettings(input);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: updateProjectSettings.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const createProjectTemplateStatus = async (
  input: ProjectTemplateStatusInput,
): Promise<ProjectTemplateStatusModel> => {
  try {
    const res = await WorkspaceStore.createProjectTemplateStatus(input);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectTemplateStatus.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const updateProjectTemplateStatus = async (
  input: ProjectTemplateStatusUpdateInput,
): Promise<ProjectTemplateStatusModel> => {
  try {
    const res = await WorkspaceStore.updateProjectTemplateStatus(input);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: updateProjectTemplateStatus.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const applyProjectTemplate = async (input: {
  projectId: ProjectId;
  templateId?: ProjectTemplateId;
}): Promise<ProjectSettingsModel> => {
  const { projectId, templateId } = input;
  try {
    const loaders = createLoaders();

    if (templateId) {
      const { columns } = (await loaders.projectTemplates.load(
        templateId,
      )) as ProjectTemplateModel;

      const res = await exportFunctions.createProjectSettings({
        projectId,
        columns,
      });

      await exportFunctions.applyProjectTemplateStatuses({
        templateId,
        projectId,
      });

      return res;
    } else {
      const res = await exportFunctions.createProjectSettings({
        projectId,
        columns: JSON.stringify([]),
      });

      return res;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: applyProjectTemplate.name,
      },
    });
    return { projectId, columns: JSON.stringify([]) };
  }
};

const getProjectSettings = async (projectId: ProjectId) => {
  try {
    const res = await WorkspaceStore.getProjectSettings(projectId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectSettings.name,
        input: projectId,
      },
    });
    return Promise.reject(error);
  }
};

const applyProjectTemplateStatuses = async (input: {
  templateId: ProjectTemplateId;
  projectId: ProjectId;
}): Promise<ProjectStatusModel[] | void> => {
  try {
    const { templateId, projectId } = input;

    const projectTemplateStatuses =
      await WorkspaceStore.getProjectTemplateStatuses(templateId);

    const projectStatusInputs = _.map(projectTemplateStatuses, (status) => {
      const { name, color, notify } = status;

      return {
        name,
        color,
        notify: notify ? true : false,
        projectId,
      };
    });

    let res: ProjectStatusModel[] = [];
    for (let i = 0; i < projectStatusInputs.length; i++) {
      const s = await exportFunctions.createProjectStatus(
        projectStatusInputs[i],
      );
      res.push(s);
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: applyProjectTemplateStatuses.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const getProjectTemplateStatuses = async (
  projectTemplateId: ProjectTemplateId,
): Promise<ProjectTemplateStatusModel[]> => {
  try {
    const res = await WorkspaceStore.getProjectTemplateStatuses(
      projectTemplateId,
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectTemplateStatuses.name,
        input: projectTemplateId,
      },
    });

    return Promise.reject(error);
  }
};

const getProjectStatusesByProjectId = async (
  projectTemplateId: ProjectTemplateId,
): Promise<ProjectStatusModel[]> => {
  try {
    const res = await WorkspaceStore.getProjectStatusesByProjectId(
      projectTemplateId,
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectStatusesByProjectId.name,
        input: projectTemplateId,
      },
    });

    return Promise.reject(error);
  }
};

const createProjectGroup = async (input: {
  projectId: ProjectId;
  name: string;
}): Promise<ProjectGroupModel> => {
  try {
    const { projectId, name } = input;

    const res = await WorkspaceStore.createProjectGroup({ projectId, name });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createProjectGroup.name,
      },
    });

    return Promise.reject(error);
  }
};

const getProjectGroups = async (
  projectId: ProjectId,
): Promise<ProjectGroupModel[]> => {
  try {
    const res = await WorkspaceStore.getProjectGroups(projectId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getProjectGroups.name,
        input: projectId,
      },
    });

    return Promise.reject(error);
  }
};

const createDefaultCompanyTemplate = async (input: {
  companyId: CompanyId;
  projectId: ProjectId;
}) => {
  try {
    const { companyId, projectId } = input;
    const template = await WorkspaceStore.createProjectTemplate({
      name: 'Default Template',
      companyId,
      columns: JSON.stringify({
        name: true,
        status: true,
        timeline: true,
        activity: true,
      }),
    });

    await Promise.all(
      _.map(defaultStatuses, async (status) => {
        const res = await WorkspaceStore.createProjectTemplateStatus({
          projectTemplateId: template.id,
          ...status,
        });

        await exportFunctions.createProjectStatus({
          name: res.name,
          color: res.color,
          projectId: projectId,
        });
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createDefaultCompanyTemplate.name,
      },
    });
    return Promise.reject(error);
  }
};

const setProjectVisibility = async (input: {
  projectId: ProjectId;
  visibility: number;
  user: UserModel;
}) => {
  try {
    const { projectId, visibility, user } = input;
    const res = await WorkspaceStore.setProjectVisibility({
      projectId,
      visibility,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: setProjectVisibility.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const deleteProjectTemplateStatuses = async ({
  templateStatusIds,
}: {
  templateStatusIds: ProjectTemplateStatusId[];
}): Promise<AffectedRowsResult> => {
  try {
    const res = await WorkspaceStore.deleteProjectTemplateStatuses({
      templateStatusIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProject = async (input: {
  name?: string;
  color?: string;
  published?: boolean;
  ownerIds?: UserId[];
  projectId: ProjectId;
  updatedBy: UserId;
  description?: string;
}): Promise<ProjectModel | Error> => {
  try {
    const {
      name,
      color,
      published,
      ownerIds,
      projectId,
      updatedBy,
      description,
    } = input;

    const res = await WorkspaceStore.updateProject({
      name,
      color,
      published,
      updatedBy,
      projectId,
      description,
    });

    if (ownerIds) {
      await TaskStore.updateTaskBoardOwners({
        boardId: projectId,
        companyMemberIds: ownerIds,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateTaskBoard',
        input,
      },
    });
    return Promise.reject(error);
  }
};

const updateProjectGroup = async (input: {
  projectGroupId: ProjectGroupId;
  name: string;
}): Promise<ProjectGroupModel> => {
  try {
    const { projectGroupId, name } = input;
    const res = await WorkspaceStore.updateProjectGroup({
      projectGroupId,
      name,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: updateProjectGroup.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const deleteWorkspaces = async (
  workspaceIds: WorkspaceId[],
  userId: UserId,
): Promise<AffectedRowsResult> => {
  try {
    const res = await WorkspaceStore.deleteWorkspaces(workspaceIds, userId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: deleteWorkspaces.name,
      },
    });

    return Promise.reject(error);
  }
};

const copyProject = async (input: {
  originalProjectId: ProjectId;
  duplicatedBy: UserId;
  workspaceId?: WorkspaceId;
  companyId: CompanyId;
}): Promise<ProjectModel> => {
  try {
    const { originalProjectId, duplicatedBy, workspaceId, companyId } = input;

    const taskCount = await WorkspaceStore.getTaskCountByProjectId(
      originalProjectId,
    );

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'task',
      quota: taskCount,
    });

    const res = await WorkspaceStore.copyProject({
      originalProjectId,
      duplicatedBy,
      workspaceId,
      companyId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: copyProject.name,
        input,
      },
    });

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
    const res = await WorkspaceStore.updateProjectsArchivedState({
      projectIds,
      archived,
      updatedBy,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        input,
        service,
        fnName: 'updateTaskBoardsArchivedState',
      },
    });
    return Promise.reject(error);
  }
};

const createDefaultProject = async (input: {
  companyId: CompanyId;
  userId: UserId;
}) => {
  try {
    const { companyId, userId } = input;
    const res = await WorkspaceStore.createProject({
      name: 'Default Project',
      companyId,
      userId,
    });

    await exportFunctions.createDefaultCompanyTemplate({
      companyId,
      projectId: res.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createDefaultProject.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const getWorkspaceByProjectId = async (
  projectId: ProjectId,
): Promise<WorkspaceModel> => {
  try {
    const res = await WorkspaceStore.getWorkspaceByProjectId(projectId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getWorkspaceByProjectId.name,
      },
    });
    return Promise.reject(error);
  }
};

const deleteProjectGroups = async ({
  projectGroupIds,
  userId,
  companyId,
}: {
  projectGroupIds: ProjectGroupId[];
  userId: UserId;
  companyId: CompanyId;
}): Promise<AffectedRowsResult> => {
  try {
    const attachments = await WorkspaceStore.getAttachmentsByProjectGroupIds(
      projectGroupIds,
    );

    const totalFileSize = _.sumBy(attachments, 'fileSize');

    const res = await WorkspaceStore.deleteProjectGroups(
      projectGroupIds,
      userId,
    );

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'storage',
      quota: totalFileSize,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        input: projectGroupIds,
        fnName: deleteProjectGroups.name,
      },
    });
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
    const res = await WorkspaceStore.moveProjectGroup({
      groupId,
      projectId,
      userId,
      taskIds,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        input,
        fnName: moveProjectGroup.name,
      },
    });

    return Promise.reject(error);
  }
};

//Only launch this once to seed the database with the default project templates
const generateDefaultTemplatesForCompanies = async () => {
  try {
    const companies = (await CompanyStore.getAllCompanies()) as CompanyModel[];
    await Promise.all(
      _.map(companies, async (company) => {
        const { id: companyId } = company;
        // check if default templates exist
        const defaultTemplates = await WorkspaceStore.getProjectTemplates({
          companyId,
        });
        if (defaultTemplates?.length === 0) {
          await WorkspaceStore.createProjectTemplate({
            name: 'Default Template',
            companyId,
            columns: JSON.stringify({
              name: true,
              status: true,
              timeline: true,
              assignee: true,
            }),
          });
        }
        //create default templates
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: generateDefaultTemplatesForCompanies.name,
      },
    });
  }
};

//Only launch this once to seed the database with the default project template statuses
const generateDefaultTemplateStatusesForDefaultTemplates = async () => {
  try {
    const allTemplates = await WorkspaceStore.getAllProjectTemplates();

    await Promise.all(
      _.map(allTemplates, async (template) => {
        const { id: templateId } = template;

        for (let i = 0; i < defaultStatuses.length; i++) {
          await WorkspaceStore.createProjectTemplateStatus({
            projectTemplateId: templateId,
            ...defaultStatuses[i],
          });
        }
      }),
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

// Only launch once
const mapLegacyStatusesToNewStatuses = async () => {
  try {
    const statuses = await WorkspaceStore.getAllSubStatuses();

    const uniqStatuses = _.groupBy(statuses, 'companyId');

    await Promise.all(
      _.map(uniqStatuses, async (statuses, companyId) => {
        const statusesInput = _.map(statuses, (status) => {
          let color = status.color;
          if (color === 'blank' || !color) {
            color = 'gray';
          } else if (color === 'brand.oran') {
            color = 'orange';
          }
          return {
            name: status.label,
            color,
            notify: status.stage === 2 ? true : false,
            //@ts-ignore
            projectId: status?.projectId,
            //@ts-ignore
            taskId: status?.taskId,
          };
        });

        const uniqStatusesInput = _.uniqBy(statusesInput, 'name');

        const template = await exportFunctions.createProjectTemplate({
          companyId: +companyId,
          name: 'Legacy Template',
          columns: `{"name": true, "status": true, "assignee": true, "timeline": true}`,
          statuses: uniqStatusesInput,
        });

        for (let i = 0; i < uniqStatusesInput.length; i++) {
          await exportFunctions.applyProjectTemplateStatuses({
            //@ts-ignore
            projectId: uniqStatusesInput[i]?.projectId,
            templateId: template?.id,
          });

          await WorkspaceStore.applySubStatusesAsProjectStatusesToTask({
            statusName: uniqStatusesInput[i].name,
            //@ts-ignore
            taskId: uniqStatusesInput[i]?.taskId,
            //@ts-ignore
            projectId: uniqStatusesInput[i]?.projectId,
          });
        }
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: mapLegacyStatusesToNewStatuses.name,
      },
    });
  }
};

//Only launch this once to seed the database with the sequences
const generateTaskSequences = async () => {
  try {
    const companies = (await CompanyStore.getAllCompanies()) as CompanyModel[];

    await Promise.all(
      _.map(companies, async (company) => {
        const allProjects = await WorkspaceStore.getProjectsByCompanyId(
          company.id,
        );

        await Promise.all(
          _.map(allProjects, async (project) => {
            const allTasks = await TaskStore.getTasksByProjectId(project.id);

            await Promise.all(
              _.map(allTasks, async (task, index) => {
                const { id } = task;
                const posY = (index + 1) * 65535;
                await TaskStore.changeTaskPosY({
                  taskId: id,
                  posY,
                  projectId: task.jobId,
                });
              }),
            );
          }),
        );
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: generateTaskSequences.name,
      },
    });
  }
};

const getDefaultProjects = async (companyId: CompanyId) => {
  try {
    const res = await WorkspaceStore.getDefaultProjects(companyId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getDefaultProjects.name,
      },
    });
    return Promise.reject(error);
  }
};

const getDefaultTasks = async (projectId: ProjectId): Promise<TaskModel[]> => {
  try {
    const res = await WorkspaceStore.getDefaultTasks(projectId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getDefaultTasks.name,
        input: projectId,
      },
    });
    return Promise.reject(error);
  }
};

//Only launch once
const convertAllPersonalProjectsToPrivateVisibility = async () => {
  try {
    const privateProjects = await WorkspaceStore.allPersonalProjects();

    for (let i = 0; i < privateProjects.length; i++) {
      await WorkspaceStore.setProjectVisibility({
        projectId: privateProjects[i]?.id,
        visibility: 4,
        userId: privateProjects[i]?.createdBy,
      });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteWorkspaceProjects = async ({
  workspaceIds,
  companyId,
}: {
  workspaceIds: WorkspaceId[];
  companyId: CompanyId;
}) => {
  try {
    const attachments = await WorkspaceStore.getAttachmentsByWorkspaceIds(
      workspaceIds,
    );

    const totalFileSize = _.sumBy(attachments, 'fileSize');

    const res = await WorkspaceStore.deleteWorkspaceProjects(workspaceIds);

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'storage',
      quota: totalFileSize,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWorkspaceVisibilityWhitelist = async ({
  workspaceId,
}: {
  workspaceId: WorkspaceId;
}) => {
  try {
    const res = await WorkspaceStore.getWorkspaceVisibilityWhitelist({
      workspaceId,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const addToWorkspaceVisibilityWhitelist = async ({
  workspaceId,
  memberIds,
  teamIds,
}: {
  workspaceId: WorkspaceId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
}) => {
  try {
    const currentVisibility =
      await WorkspaceStore.getWorkspaceVisibilityWhitelist({
        workspaceId,
      });

    if (
      memberIds &&
      _.intersection(memberIds, currentVisibility.members).length > 0
    ) {
      throw new Error('Member already in whitelist');
    }

    if (
      teamIds &&
      _.intersection(teamIds, currentVisibility.teams).length > 0
    ) {
      throw new Error('Team already in whitelist');
    }
    const res = await WorkspaceStore.addToWorkspaceVisibilityWhitelist({
      workspaceId,
      memberIds,
      teamIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeFromWorkspaceVisibilityWhitelist = async ({
  workspaceId,
  memberIds,
  teamIds,
}: {
  workspaceId: WorkspaceId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
}) => {
  try {
    const res = await WorkspaceStore.removeFromWorkspaceVisibilityWhitelist({
      workspaceId,
      memberIds,
      teamIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const setWorkspaceVisibility = async (input: {
  workspaceId: WorkspaceId;
  visibility: number;
  user: UserModel;
}) => {
  try {
    const { workspaceId, visibility, user } = input;
    const res = await WorkspaceStore.setWorkspaceVisibility({
      workspaceId,
      visibility,
      userId: user.id,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const filterVisibleWorkspaces = async ({
  workspaces,
  userId,
  companyId,
}: {
  workspaces: WorkspaceModel[];
  userId: UserId;
  companyId: CompanyId;
}) => {
  try {
    const workspaceIds = workspaces.map((b) => b.id);
    const member = (await CompanyStore.getMemberByUserIdAndCompanyId({
      userId,
      companyId,
    })) as CompanyMemberModel;

    const userTeams = await CompanyStore.getCompanyTeamsByUserId({
      userId,
      companyId,
    });

    const userTeamIds = userTeams.map((team) => team?.id);

    const boardTeams = await WorkspaceStore.getTeamsForWorkspaceIds({
      ids: workspaceIds,
    });

    const workspaceVisibility =
      await WorkspaceStore.getVisibilityForWorkspaceIds({
        ids: workspaceIds,
      });

    let filteredWorkspaces = [];

    for (const workspace of workspaces) {
      const boardTeamIds = boardTeams.map((bt) => bt?.teamId);

      if (
        await exportFunctions.isWorkspaceVisible({
          workspace,
          boardTeamIds,
          userId,
          member,
          workspaceVisibility,
          userTeamIds,
        })
      ) {
        filteredWorkspaces.push(workspace);
      }
    }

    return filteredWorkspaces;
  } catch (error) {
    return Promise.reject(error);
  }
};

const isWorkspaceVisible = ({
  workspace,
  userId,
  boardTeamIds,
  userTeamIds,
  member,
  workspaceVisibility,
}: {
  workspace: WorkspaceModel;
  userId: UserId;
  boardTeamIds: TaskBoardTeamId[];
  userTeamIds: TeamId[];
  member: CompanyMemberModel;
  workspaceVisibility: CommonVisibilityModel[];
}) => {
  try {
    const { visibility } = workspace;

    /* These visibility check functions are split out because the
		same logic is used in other functions. - Enoch */

    // user is the creator of the board
    if (workspace.createdBy === userId) {
      return true;
    }

    if (visibility === CommonVisibilityTypes.PUBLIC) {
      return true;
    } else if (visibility === CommonVisibilityTypes.ASSIGNED) {
      return exportFunctions.isMemberAssignedToWorkspace({
        workspace,
        userId,
        boardTeamIds,
        userTeamIds,
      });
    } else if (visibility === CommonVisibilityTypes.SPECIFIC) {
      return exportFunctions.isMemberSpecificVisibleOnWorkspace({
        workspace,
        userId,
        workspaceVisibility,
        userTeamIds,
        companyMemberId: member.id,
      });
    } else if (visibility === CommonVisibilityTypes.PRIVATE) {
      return workspace.createdBy === userId;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const isMemberAssignedToWorkspace = ({
  workspace,
  userId,
  userTeamIds,
  boardTeamIds,
}: {
  workspace: WorkspaceModel;
  userId: UserId;
  userTeamIds: TeamId[];
  boardTeamIds: TaskBoardTeamId[];
}) => {
  const isCreator = workspace.createdBy === userId;

  const isInTeam = _.intersection(userTeamIds, boardTeamIds).length > 0;

  return isCreator || isInTeam;
};

const isMemberSpecificVisibleOnWorkspace = ({
  workspace,
  userId,
  workspaceVisibility,
  companyMemberId,
  userTeamIds,
}: {
  workspace: WorkspaceModel;
  userId: UserId;
  workspaceVisibility: CommonVisibilityModel[];
  companyMemberId: CompanyMemberId;
  userTeamIds: TeamId[];
}) => {
  const isCreator = workspace.createdBy === userId;
  let vTeams = [];
  let vMembers = [];
  const visibility = workspaceVisibility.filter(
    (e) => e.workspaceId === workspace.id,
  );
  for (const v of visibility) {
    if (v.teamId) {
      vTeams.push(v.teamId);
    } else if (v.memberId) {
      vMembers.push(v.memberId);
    }
  }

  const isInTeam = _.intersection(userTeamIds, vTeams).length > 0;
  const isMember = !!_.find(vMembers, (m) => m === companyMemberId);

  return isCreator || isInTeam || isMember;
};

const createCustomColumnForGroup = async (input: {
  groupId: ProjectGroupId;
  customName: string;
  type: number;
}): Promise<ProjectGroupCustomColumnModel> => {
  try {
    const { groupId, customName, type } = input;

    const res = await WorkspaceStore.createCustomColumnForGroup({
      groupId,
      customName,
      type,
    });

    return res;
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
    const res = await WorkspaceStore.deleteCustomColumnForGroup({
      groupId,
      attributeId,
      projectId,
    });

    return res;
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
    const { groupId, attributeId, taskId, value } = input;
    const res = await WorkspaceStore.insertCustomValueToTask({
      groupId,
      attributeId,
      taskId,
      value,
    });

    return res;
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
    const res = await WorkspaceStore.deleteCustomValueToTask({
      groupId,
      attributeId,
      taskId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const reorderGroup = (groups: ProjectGroupModel[], newPos: number) => {
  let task = groups.splice(newPos, 1);
  groups.unshift(task[0]);
  return groups;
};

const exportFunctions = {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  assignProjectsToWorkspace,
  removeProjectsFromWorkspace,
  moveProjectsToWorkspace,
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
  getProjectTemplates,
  createProjectTemplate,
  validateTemplateColumns,
  deleteProjectTemplates,
  updateProjectTemplate,
  createProjectStatus,
  deleteProjectStatuses,
  updateProjectStatus,
  createProjectSettings,
  updateProjectSettings,
  createProjectTemplateStatus,
  updateProjectTemplateStatus,
  applyProjectTemplate,
  getProjectSettings,
  applyProjectTemplateStatuses,
  getProjectTemplateStatuses,
  getProjectStatusesByProjectId,
  createProjectGroup,
  getProjectGroups,
  createDefaultCompanyTemplate,
  setProjectVisibility,
  deleteProjectTemplateStatuses,
  updateProject,
  updateProjectGroup,
  deleteWorkspaces,
  copyProject,
  updateProjectsArchivedState,
  createDefaultProject,
  getWorkspaceByProjectId,
  deleteProjectGroups,
  moveProjectGroup,
  generateDefaultTemplatesForCompanies,
  generateDefaultTemplateStatusesForDefaultTemplates,
  generateTaskSequences,
  getDefaultProjects,
  getDefaultTasks,
  mapLegacyStatusesToNewStatuses,
  convertAllPersonalProjectsToPrivateVisibility,
  deleteWorkspaceProjects,
  getWorkspaceVisibilityWhitelist,
  addToWorkspaceVisibilityWhitelist,
  removeFromWorkspaceVisibilityWhitelist,
  setWorkspaceVisibility,
  isMemberAssignedToWorkspace,
  isMemberSpecificVisibleOnWorkspace,
  isWorkspaceVisible,
  filterVisibleWorkspaces,
  createCustomColumnForGroup,
  deleteCustomColumnForGroup,
  insertCustomValueToTask,
  deleteCustomValueToTask,
  reorderGroup,
};

export default exportFunctions;
