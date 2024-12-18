import { Resolvers } from '@generated/graphql-types';
import _ from 'lodash';
import { CompanyService, TaskService, WorkspaceService } from '@services';
import {
  getCompany,
  getWorkspaces,
  getWorkspace,
  getProjects,
  getProjectTemplate,
  getProjectTimeCosts,
  getProject,
  getProjectInvoice,
  getProjectInvoices,
  getCompanyMember,
  getProjectClaim,
  getProjectClaims,
  getTask,
  getProjectTimeCost,
  getProjectTemplateStatus,
  getProjectStatus,
  getProjectTemplateStatuses,
  getCompanyMembers,
  getProjectStatuses,
  getProjectGroup,
  getProjectTemplates,
  getCompanyTeams,
  getProjectGroups,
  getTasks,
  getCustomAttribute,
} from '@data-access/getters';
import { TaskStore, UserStore, WorkspaceStore } from '@data-access';
import {
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamModel,
} from '@models/company.model';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from 'apollo-server-express';
import {
  ProjectGroupId,
  ProjectGroupModel,
  ProjectModel,
  TaskModel,
} from '@models/task.model';
import { WorkspaceModel } from '@models/workspace.model';
import dayjs from 'dayjs';
import { FilterOptionsModel } from '@models/filter.model';

export const resolvers: Resolvers = {
  Workspace: {
    id: ({ idText }) => idText,
    company: async ({ companyId }, args, { loaders }) =>
      await loaders.companies.load(companyId),
    projects: async ({ id, idText, companyId }, args, { auth: { user } }) => {
      let projects = [];
      if (id === 'DEFAULT_WORKSPACE') {
        projects = await WorkspaceService.getDefaultProjects(companyId);
      } else {
        projects = (await WorkspaceStore.getProjectsByWorkspaceId({
          workspaceId: id,
        })) as ProjectModel[];
      }

      const visibleProjects = await TaskService.filterVisibleBoards({
        boards: projects,
        userId: user.id,
        companyId,
      });

      return visibleProjects;
    },
    createdBy: async ({ createdBy }) => {
      const user = await UserStore.getUser(createdBy);
      return user;
    },
    updatedBy: async ({ updatedBy }) => {
      return updatedBy ? await UserStore.getUser(updatedBy) : null;
    },
    visibilityWhitelist: async ({ id }, args, { loaders, auth: { user } }) => {
      const res = await WorkspaceService.getWorkspaceVisibilityWhitelist({
        workspaceId: id,
      });

      return {
        ...(res.teams && {
          teams: await loaders.companyTeams.loadMany(res.teams),
        }),
        ...(res.members && {
          members: await loaders.companyMembers.loadMany(res.members),
        }),
      };
    },
  },
  ProjectInvoice: {
    id: ({ idText }) => idText,
    project: async ({ projectId }, args, { loaders }) => {
      return projectId ? await loaders.taskBoards.load(projectId) : null;
    },
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    updatedBy: async ({ updatedBy, updated_by }, args, { loaders }) => {
      return updatedBy ? await loaders.users.load(updatedBy) : null;
    },
  },
  ProjectClaim: {
    id: ({ idText }) => idText,
    project: async ({ projectId }, args, { loaders }) => {
      return projectId ? await loaders.taskBoards.load(projectId) : null;
    },
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    updatedBy: async ({ updatedBy, updated_by }, args, { loaders }) => {
      return updatedBy ? await loaders.users.load(updatedBy) : null;
    },
  },
  ProjectTimeCost: {
    id: ({ idText }) => idText,
    project: async ({ projectId }, args, { loaders }) => {
      return projectId ? await loaders.taskBoards.load(projectId) : null;
    },
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    updatedBy: async ({ updatedBy, updated_by }, args, { loaders }) => {
      return updatedBy ? await loaders.users.load(updatedBy) : null;
    },
  },
  ProjectTemplate: {
    id: ({ idText }) => idText,
    company: async ({ companyId }, args, { loaders }) => {
      return companyId ? await loaders.companies.load(companyId) : null;
    },
    columns: async ({ columns }, args, { loaders }) => {
      if (_.isEmpty(columns)) {
        return { name: true, status: true, timeline: true, activity: true };
      }
      return columns;
    },
    statuses: async ({ id }, args, { loaders }) => {
      const templateStatuses =
        await WorkspaceService.getProjectTemplateStatuses(id);

      return templateStatuses;
    },
  },
  ProjectStatus: {
    id: ({ idText }) => idText,
    project: async ({ id }, args, { loaders }) => {
      const project = await loaders.taskBoards.load(id);

      return project;
    },
  },
  ProjectTemplateStatus: {
    id: ({ idText }) => idText,
    projectTemplate: async ({ projectTemplateId }, args, { loaders }) => {
      const projectTemplate = await loaders.projectTemplates.load(
        projectTemplateId,
      );
      return projectTemplate;
    },
  },
  ProjectGroup: {
    id: ({ idText }) => idText,
    project: async ({ projectId }, args, { loaders }) => {
      const project = await loaders.taskBoards.load(projectId);
      return project;
    },
    tasks: async ({ id, query }, { filters }, { auth: { user } }) => {
      const { archived } = filters || {};

      const res = await TaskStore.getTasksByProjectGroupId({
        projectGroupId: id,
        limit: query?.limitTasks,
        archived: archived?.status as unknown as number,
      });

      return res;
    },
    totalTasks: async ({ id }, args, { auth: { user } }) => {
      const res = await TaskStore.getTasksByProjectGroupIdLength(id);

      return res;
    },
    customColumns: async ({ id }, args, { loaders }) => {
      const columns = await WorkspaceStore.getGroupCustomColumns({
        groupId: id,
      });

      return columns;
    },
    ordering: async ({ id }, args, { loaders }) => {
      const orderingNumber = await WorkspaceStore.getGroupOrderingNumber(id);

      return orderingNumber;
    },
  },
  ProjectGroupCustomColumn: {
    group: async ({ groupId }, args, { loaders }) => {
      const group = await loaders.projectGroups.load(groupId);
      return group;
    },
    attribute: async ({ attributeId }, args, { loaders }) => {
      const attribute = await loaders.groupCustomAttributes.load(attributeId);
      return attribute;
    },
  },
  ProjectGroupCustomAttribute: {
    id: ({ idText }) => idText,
  },
  TaskCustomValue: {
    task: async ({ taskId }, args, { loaders }) => {
      const task = await loaders.tasks.load(taskId);
      return task;
    },
    group: async ({ groupId }, args, { loaders }) => {
      const group = await loaders.projectGroups.load(groupId);
      return group;
    },
    attribute: async ({ attributeId }, args, { loaders }) => {
      const attribute = await loaders.groupCustomAttributes.load(attributeId);
      return attribute;
    },
    value: async ({ value }) => {
      if (typeof value !== 'string') {
        return (value || '')?.toString();
      }

      return value;
    },
  },
  ProjectTemplateGallery: {
    galleryTemplates: async ({ galleryTemplates }) => {
      return galleryTemplates;
    },
  },
  Query: {
    workspace: async (root, { id }, { auth: { user } }) => {
      try {
        if (id === 'DEFAULT_WORKSPACE') {
          return {
            id: 'DEFAULT_WORKSPACE',
            idText: 'DEFAULT_WORKSPACE',
            name: 'Default Workspace',
            bgColor: 'gray',
            companyId: user.activeCompany,
            createdAt: null,
            updatedAt: null,
            createdBy: null,
            updatedBy: null,
          };
        }
        const workspace = await getWorkspace(id);

        const res = await WorkspaceService.getWorkspaces({
          companyId: user.activeCompany,
          ids: [workspace.id],
          user,
        });

        return _.head(res);
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    workspaces: async (root, { ids, companyId }, { auth: { user } }) => {
      try {
        let workspaceIds;
        if (ids) {
          workspaceIds = (await getWorkspaces(ids)).map((w) => w.id);
        }

        const company = (await getCompany(companyId)) as CompanyModel;

        const res = await WorkspaceService.getWorkspaces({
          ...(workspaceIds && { ids: workspaceIds }),
          companyId: company.id,
          user,
        });

        const workspaces = [
          {
            id: 'DEFAULT_WORKSPACE',
            idText: 'DEFAULT_WORKSPACE',
            name: 'Default Workspace',
            bgColor: 'gray',
            companyId: company.id,
            createdAt: null,
            updatedAt: null,
            createdBy: company.created_by,
            updatedBy: null,
          },
          ...res,
        ];

        return workspaces;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    project: async (root, { id }, { auth: { isAuthenticated, user } }) => {
      try {
        const now = dayjs();
        const res = await getProject(id);

        const visibleBoards = await TaskService.filterVisibleBoards({
          boards: [res],
          userId: user.id,
          companyId: user.activeCompany,
        });

        return _.head(visibleBoards);
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    projects: async (
      root,
      { memberId },
      { auth: { isAuthenticated, user } },
    ) => {
      try {
        const member = (await getCompanyMember(memberId)) as CompanyMemberModel;

        const res = (await WorkspaceStore.getProjectsByMemberId(
          member.id,
        )) as ProjectModel[];
        const visibleBoards = await TaskService.filterVisibleBoards({
          boards: res,
          userId: user.id,
          companyId: user.activeCompany,
        });

        const uniqProjects = _.uniqBy(visibleBoards, 'id');

        return uniqProjects;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    projectInvoices: async (
      root,
      { filter, sort, limit, offset },
      { auth: { user } },
    ) => {
      //I don't know how to destructure this without ts screaming at me, I'm sorry Uncle Bobby
      const projectId = filter?.projectId;
      const type = sort?.type;
      const direction = sort?.direction;

      let privateProjectId;
      if (projectId) {
        const board = await getProject(projectId);
        privateProjectId = board?.id;
      }

      const res = await WorkspaceService.getProjectInvoices({
        projectId: privateProjectId,
        companyId: user?.activeCompany,
        ...(type && { type }),
        ...(direction && { direction }),
        ...(limit && { limit }),
        ...(offset && { offset }),
      });

      return { projectInvoices: res, total: res?.length };
    },
    projectInvoice: async (root, { invoiceId }, { auth: { user } }) => {
      const res = await getProjectInvoice(invoiceId);

      return res;
    },
    projectClaims: async (
      root,
      { filter, sort, limit, offset },
      { auth: { user } },
    ) => {
      //I don't know how to destructure this without ts screaming at me, I'm sorry Uncle Bobby
      const projectId = filter?.projectId;
      const type = sort?.type;
      const direction = sort?.direction;

      let privateProjectId;
      if (projectId) {
        const board = await getProject(projectId);
        privateProjectId = board?.id;
      }

      const res = await WorkspaceService.getProjectClaims({
        projectId: privateProjectId,
        companyId: user?.activeCompany,
        ...(type && { type }),
        ...(direction && { direction }),
        ...(limit && { limit }),
        ...(offset && { offset }),
      });

      return { projectInvoices: res, total: res?.length };
    },
    projectClaim: async (root, { claimId }, { auth: { user } }) => {
      const res = await getProjectClaim(claimId);

      return res;
    },
    projectTimeCosts: async (
      root,
      { filter, sort, limit, offset },
      { auth: { user } },
    ) => {
      //I don't know how to destructure this without ts screaming at me, I'm sorry Uncle Bobby
      const projectId = filter?.projectId;
      const type = sort?.type;
      const direction = sort?.direction;

      let privateProjectId;
      if (projectId) {
        const board = await getProject(projectId);
        privateProjectId = board?.id;
      }

      const res = await WorkspaceService.getProjectTimeCosts({
        projectId: privateProjectId,
        companyId: user?.activeCompany,
        ...(type && { type }),
        ...(direction && { direction }),
        ...(limit && { limit }),
        ...(offset && { offset }),
      });

      return { projectInvoices: res, total: res?.length };
    },
    projectTimeCost: async (root, { timeCostId }, { auth: { user } }) => {
      const res = await getProjectTimeCost(timeCostId);

      return res;
    },
    projectTemplates: async (root, { companyId }, { auth: { user } }) => {
      const company = await getCompany(companyId);
      const res = await WorkspaceService.getProjectTemplates({
        companyId: company?.id,
      });

      return res;
    },
    globalProjectTemplateGallery: async (root, input, { auth: { user } }) => {
      try {
        const json = await WorkspaceStore.getProjectTemplateGalleries();

        return json;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
  },
  Mutation: {
    createWorkspace: async (root, { input }, { auth: { user } }) => {
      try {
        const { companyId, name, bgColor } = input;

        const company = (await getCompany(companyId)) as CompanyModel;

        // TODO: Company permission check

        const res = await WorkspaceService.createWorkspace({
          companyId: company.id,
          name,
          user,
          bgColor,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    moveProjectsToWorkspace: async (root, { input }, { auth: { user } }) => {
      try {
        const { sourceWorkspaceId, destinationWorkspaceId, projectIds } = input;

        let destinationWorkspacePrivateId =
          destinationWorkspaceId !== 'DEFAULT_WORKSPACE'
            ? (await getWorkspace(destinationWorkspaceId)).id
            : null;
        let sourceWorkspacePrivateId =
          sourceWorkspaceId !== 'DEFAULT_WORKSPACE'
            ? (await getWorkspace(sourceWorkspaceId)).id
            : null;
        const projects = await getProjects(projectIds);
        if (sourceWorkspaceId === 'DEFAULT_WORKSPACE') {
          const destinationWorkspace = await getWorkspace(
            destinationWorkspaceId,
          );
          destinationWorkspacePrivateId = destinationWorkspace?.id;
          const destination = await WorkspaceStore.assignProjectsToWorkspace({
            workspaceId: destinationWorkspace.id,
            projectIds: projects.map((p) => p.id),
          });

          return [destination];
        }

        if (destinationWorkspaceId === 'DEFAULT_WORKSPACE') {
          const sourceWorkspace = await getWorkspace(sourceWorkspaceId);
          sourceWorkspacePrivateId = sourceWorkspace?.id;
          await WorkspaceService.deleteWorkspaceProjects({
            workspaceIds: [sourceWorkspace.id],
            companyId: sourceWorkspace.companyId,
          });

          return [
            {
              id: 'DEFAULT_WORKSPACE',
              idText: 'DEFAULT_WORKSPACE',
              name: 'Default Workspace',
              bgColor: 'gray',
              companyId: user.activeCompany,
              createdAt: null,
              updatedAt: null,
              createdBy: null,
              updatedBy: null,
            },
          ];
        }

        const projectPrivateIds = projects.map((p) => p.id);
        if (sourceWorkspacePrivateId && destinationWorkspacePrivateId) {
          const res = await WorkspaceService.moveProjectsToWorkspace({
            sourceWorkspaceId: sourceWorkspacePrivateId,
            destinationWorkspaceId: destinationWorkspacePrivateId,
            projectIds: projectPrivateIds,
            user,
          });

          return res;
        }

        return [];
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateProjectsArchivedState: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { projectIds, archived } = input;

        const projects = await getProjects(projectIds);
        const projectPrivateIds = projects.map((p) => p.id);

        const res = await WorkspaceService.updateProjectsArchivedState({
          projectIds: projectPrivateIds,
          archived,
          updatedBy: user?.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateWorkspace: async (root, { input }, { auth: { user } }) => {
      try {
        const { workspaceId, name, bgColor } = input;

        const workspace = await getWorkspace(workspaceId);

        // TODO: Company permission check

        const res = await WorkspaceService.updateWorkspace({
          workspaceId: workspace.id,
          user,
          ...(name && { name }),
          ...(bgColor && { bgColor }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    assignProjectsToWorkspace: async (root, { input }, { auth: { user } }) => {
      try {
        const { workspaceId, projectIds } = input;

        const workspace = (await getWorkspace(workspaceId)) as WorkspaceModel;

        const projects = (await getProjects(projectIds)) as ProjectModel[];

        const res = await WorkspaceService.assignProjectsToWorkspace({
          workspaceId: workspace.id,
          projectIds: projects.map((p) => p.id),
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createProject: async (root, { input }, { auth: { user } }) => {
      try {
        const {
          name,
          companyId,
          workspaceId,
          projectTemplateId,
          visibility,
          ownerIds,
        } = input;

        const company = (await getCompany(companyId)) as CompanyModel;
        let workspacePrivateId;

        if (workspaceId && workspaceId !== 'DEFAULT_WORKSPACE') {
          const workspace = (await getWorkspace(workspaceId)) as WorkspaceModel;
          workspacePrivateId = workspace.id;
        }

        const projectTemplate = projectTemplateId
          ? await getProjectTemplate(projectTemplateId)
          : null;
        let ownerPrivateIds;
        if (ownerIds) {
          const companyMembers = (await getCompanyMembers(
            ownerIds,
          )) as CompanyMemberModel[];

          if (companyMembers.some((member) => !member)) {
            throw new UserInputError(
              'One or more company member does not exist.',
            );
          }

          ownerPrivateIds = companyMembers
            .map((member) => member.id)
            .filter((id) => id) as CompanyMemberId[];
        }

        const res = await WorkspaceService.createProject({
          name,
          user,
          companyId: company.id,
          projectTemplateId: projectTemplate?.id,
          visibility: +(visibility || 4),
          ...(workspacePrivateId && { workspaceId: workspacePrivateId }),
          ...(ownerPrivateIds && { ownerIds: ownerPrivateIds }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateProject: async (_, { input }, { auth: { user } }) => {
      const { name, color, ownerIds, published, projectId, description } =
        input;
      const project = await getProject(projectId);

      let ownerPrivateIds;
      if (ownerIds) {
        const companyMembers = await getCompanyMembers(ownerIds);

        if (companyMembers.some((member) => !member)) {
          throw new UserInputError(
            'One or more company member does not exist.',
          );
        }

        ownerPrivateIds = companyMembers.map((member) => member.id);
      }

      const res = await WorkspaceService.updateProject({
        projectId: project.id,
        ...(name && { name }),
        ...(description && { description }),
        ...(color && { color }),
        ...(ownerPrivateIds && { ownerIds: ownerPrivateIds }),
        ...(published && { published }),
        updatedBy: user.id,
      });

      return res;
    },
    createProjectInvoice: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, invoiceNo, quantity, price, actualCost, projectId } =
          input;

        const project = await getProject(projectId);

        const res = await WorkspaceService.createProjectInvoice({
          name,
          ...(invoiceNo && { invoiceNo }),
          quantity,
          price: price.toString(),
          ...(actualCost && { actualCost: actualCost.toString() }),
          projectId: project?.id,
          createdBy: user?.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editProjectInvoice: async (root, { input }, { auth: { user } }) => {
      try {
        const { invoiceId, name, invoiceNo, quantity, price, actualCost } =
          input;

        const projectInvoice = await getProjectInvoice(invoiceId);

        const res = await WorkspaceService.editProjectInvoice(
          {
            ...(name && { name }),
            ...(invoiceNo && { invoiceNo }),
            ...(quantity && { quantity }),
            ...(price && { price: price.toString() }),
            ...(actualCost && { actualCost: actualCost.toString() }),
            updatedBy: user?.id,
            invoiceId: projectInvoice?.id,
          },
          projectInvoice,
        );

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteProjectInvoices: async (root, { input }, { auth: { user } }) => {
      const { ids } = input;

      const projectInvoices = await getProjectInvoices(ids);

      await WorkspaceService.deleteProjectInvoices(projectInvoices, user.id);

      return projectInvoices;
    },
    createProjectClaim: async (root, { input }, { auth: { user } }) => {
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
        } = input;

        const project = await getProject(projectId);
        let privateMemberId: number | undefined;
        if (memberId) {
          const member = await getCompanyMember(memberId);
          privateMemberId = member?.id;
        }

        const res = await WorkspaceService.createProjectClaim({
          name,
          memberId: privateMemberId as number,
          amount: amount.toString(),
          ...(description && { description }),
          ...(note && { note }),
          ...(attachmentUrl && { attachmentUrl }),
          ...(status && { status: +status }),
          projectId: project?.id,
          createdBy: user?.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editProjectClaim: async (root, { input }, { auth: { user } }) => {
      try {
        const {
          name,
          description,
          note,
          memberId,
          amount,
          attachmentUrl,
          status,
          claimId,
        } = input;

        const projectClaim = await getProjectClaim(claimId);

        let privateMemberId: number | undefined;
        if (memberId) {
          const member = await getCompanyMember(memberId);
          privateMemberId = member?.id;
        }

        const res = await WorkspaceService.editProjectClaim(
          {
            ...(name && { name }),
            ...(description && { description }),
            ...(note && { note }),
            ...(status && { status: +status }),
            ...(attachmentUrl && { attachmentUrl }),
            ...(memberId && { memberId: privateMemberId }),
            ...(amount && { amount: amount.toString() }),
            updatedBy: user?.id,
            claimId: projectClaim?.id,
          },
          projectClaim,
        );

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteProjectClaims: async (root, { input }, { auth: { user } }) => {
      const { ids } = input;

      const projectClaims = await getProjectClaims(ids);

      const projectInvoiceIds = projectClaims.map((pi) => pi?.id);
      await WorkspaceService.deleteProjectClaims(projectClaims, user?.id);

      return projectClaims;
    },
    createProjectTimeCost: async (root, { input }, { auth: { user } }) => {
      try {
        const {
          date,
          timeIn,
          timeOut,
          taskId,
          memberId,
          amount,
          projectId,
          note,
        } = input;
        const project = await getProject(projectId);
        const task = await getTask(taskId);
        let privateMemberId: number | undefined;
        if (memberId) {
          const member = await getCompanyMember(memberId);
          privateMemberId = member?.id;
        }

        const res = await WorkspaceService.createProjectTimeCost({
          date,
          taskId: task?.id,
          memberId: privateMemberId as number,
          amount: amount.toString(),
          projectId: project?.id,
          createdBy: user?.id,
          ...(note && { note }),
          ...(timeIn && { timeIn }),
          ...(timeOut && { timeOut }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editProjectTimeCost: async (root, { input }, { auth: { user } }) => {
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
        } = input;

        const projectTimeCost = await getProjectTimeCost(timeCostId);

        let privateMemberId: number | undefined;
        let privateTaskId: number | undefined;
        let privateProjectId: number | undefined;
        if (memberId) {
          const member = await getCompanyMember(memberId);
          privateMemberId = member?.id;
        }

        if (taskId) {
          const task = await getTask(taskId);
          privateTaskId = task?.id;
        }

        if (projectId) {
          const project = await getProject(projectId);
          privateProjectId = project?.id;
        }
        const res = await WorkspaceService.editProjectTimeCost(
          {
            timeCostId: projectTimeCost?.id,
            ...(date && { date }),
            ...(timeIn && { timeIn }),
            ...(timeOut && { timeOut }),
            ...(taskId && privateTaskId && { taskId: privateTaskId as number }),
            ...(projectId &&
              privateProjectId && { projectId: privateProjectId as number }),
            ...(note && { note }),
            ...(memberId && { memberId: privateMemberId }),
            ...(amount && { amount: amount.toString() }),
            updatedBy: user?.id,
          },
          projectTimeCost,
        );

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteProjectTimeCosts: async (root, { input }, { auth: { user } }) => {
      const { ids } = input;

      const projectTimeCosts = await getProjectTimeCosts(ids);

      await WorkspaceService.deleteProjectTimeCosts(projectTimeCosts, user?.id);

      return projectTimeCosts;
    },
    editProjectTemplate: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, columns, projectTemplateId } = input;

        const projectTemplate = await getProjectTemplate(projectTemplateId);

        const res = await WorkspaceService.updateProjectTemplate({
          ...(name && { name }),
          ...(columns && { columns: JSON.stringify(columns) }),
          templateId: projectTemplate.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createProjectTemplate: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, columns, companyId, statuses } = input;

        const col = columns ? JSON.stringify(columns) : JSON.stringify([]);
        const company = await getCompany(companyId);

        const statusInput = statuses
          ? statuses.map((s) => {
              return {
                name: s?.name as string,
                color: s?.color as string,
                notify: s?.notify as boolean | undefined,
              };
            })
          : [];

        const res = await WorkspaceService.createProjectTemplate({
          name,
          columns: col,
          companyId: company?.id,
          ...(statusInput && { statuses: statusInput }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editProjectTemplateStatus: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, color, notify, projectTemplateStatusId } = input;

        const projectTemplateStatus = await getProjectTemplateStatus(
          projectTemplateStatusId,
        );

        const res = await WorkspaceService.updateProjectTemplateStatus({
          ...(name && { name }),
          ...(color && { color }),
          ...(notify && { notify: notify ? true : false }),
          projectTemplateStatusId: projectTemplateStatus.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editProjectStatus: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, color, notify, sequence, projectStatusId } = input;

        const projectStatus = await getProjectStatus(projectStatusId);

        const res = await WorkspaceService.updateProjectStatus({
          ...(name && { name }),
          ...(color && { color }),
          ...(notify && { notify: notify ? true : false }),
          ...(sequence && { sequence }),
          projectStatusId: projectStatus.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editProjectSettings: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectId, columns } = input;

        const project = await getProject(projectId);

        const res = await WorkspaceService.updateProjectSettings({
          projectId: project.id,
          columns: JSON.stringify(columns),
        });
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createProjectGroup: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, projectId } = input;
        const project = await getProject(projectId);
        const res = await WorkspaceService.createProjectGroup({
          name,
          projectId: project?.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    setProjectVisibility: async (root, { input }, { auth: { user } }) => {
      try {
        const { visibility, projectId } = input;
        if (!user.activeCompany) {
          throw new UserInputError('No active company selected');
        }

        const project = await getProject(projectId);

        const res = await WorkspaceService.setProjectVisibility({
          projectId: project.id,
          ...(user?.activeCompany && { companyId: user?.activeCompany }),
          user,
          visibility: +visibility || 4,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    setWorkspaceVisibility: async (root, { input }, { auth: { user } }) => {
      try {
        const { visibility, workspaceId } = input;
        if (!user.activeCompany) {
          throw new UserInputError('No active company selected');
        }

        const workspace = await getWorkspace(workspaceId);

        const res = await WorkspaceService.setWorkspaceVisibility({
          workspaceId: workspace.id,
          ...(user?.activeCompany && { companyId: user?.activeCompany }),
          user,
          visibility: +visibility || 4,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteProjectTemplateStatuses: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { projectTemplateStatusIds } = input;

        const projectTemplateStatuses = await getProjectTemplateStatuses(
          projectTemplateStatusIds,
        );
        const projectTemplateStatusPrivateIds = projectTemplateStatuses.map(
          (s) => s.id,
        );
        await WorkspaceService.deleteProjectTemplateStatuses({
          templateStatusIds: projectTemplateStatusPrivateIds,
        });

        return projectTemplateStatuses;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    createProjectTemplateStatus: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { name, color, notify, projectTemplateId } = input;

        const projectTemplate = await getProjectTemplate(projectTemplateId);
        const res = await WorkspaceService.createProjectTemplateStatus({
          name,
          color,
          notify: notify ? true : false,
          projectTemplateId: projectTemplate.id,
        });
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createProjectStatus: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, color, notify, projectId } = input;

        const project = await getProject(projectId);

        const res = await WorkspaceService.createProjectStatus({
          name,
          color,
          notify: notify ? true : false,
          projectId: project.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteProjectStatuses: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectStatusIds } = input;
        const projects = await getProjectStatuses(projectStatusIds);
        const projectPrivateIds = projects.map((s) => s.id);

        await WorkspaceService.deleteProjectStatuses(projectPrivateIds);

        return projects;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editProjectGroup: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, projectGroupId } = input;
        const projectGroup = await getProjectGroup(projectGroupId);

        const res = await WorkspaceService.updateProjectGroup({
          name,
          projectGroupId: projectGroup.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteWorkspaces: async (root, { input }, { auth: { user } }) => {
      try {
        const { workspaceIds } = input;
        const workspaces = await getWorkspaces(workspaceIds);
        const workspacesPrivateIds = workspaces.map((s) => s.id);

        await WorkspaceService.deleteWorkspaces(workspacesPrivateIds, user.id);

        return workspaces;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteProjectTemplates: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectTemplateIds } = input;
        const projectTemplates = await getProjectTemplates(projectTemplateIds);
        const projectTemplatePrivateIds = projectTemplates.map((s) => s.id);
        await WorkspaceService.deleteProjectTemplates(
          projectTemplatePrivateIds,
        );

        return projectTemplates;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    copyProject: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectId, targetWorkspaceId } = input;
        const project = await getProject(projectId);

        let workspacePrivateId;
        if (targetWorkspaceId && targetWorkspaceId !== 'DEFAULT_WORKSPACE') {
          const workspace = await getWorkspace(targetWorkspaceId);

          workspacePrivateId = workspace.id;
        }

        const res = await WorkspaceService.copyProject({
          originalProjectId: project.id,
          duplicatedBy: user?.id,
          ...(workspacePrivateId && { workspaceId: workspacePrivateId }),
          companyId: project.companyId,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    addToVisibilityWhitelistProject: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { projectId, memberIds, teamIds } = input;
        const board = await getProject(projectId);

        let members: CompanyMemberModel[] = [];
        let teams: CompanyTeamModel[] = [];

        if (memberIds) {
          members = await getCompanyMembers(memberIds);
        }

        if (teamIds) {
          teams = await getCompanyTeams(teamIds);
        }

        const res = await TaskService.addToVisibilityWhitelist({
          boardId: board.id,
          ...(members.length > 0 && { memberIds: members.map((m) => m.id) }),
          ...(teams.length > 0 && { teamIds: teams.map((t) => t.id) }),
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    removeFromVisibilityWhitelistProject: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { projectId, memberIds, teamIds } = input;
        const project = await getProject(projectId);

        let members: CompanyMemberModel[] = [];
        let teams: CompanyTeamModel[] = [];

        if (memberIds) {
          members = await getCompanyMembers(memberIds);
        }

        if (teamIds) {
          teams = await getCompanyTeams(teamIds);
        }

        const res = await TaskService.removeFromVisibilityWhitelist({
          boardId: project.id,
          ...(members.length > 0 && { memberIds: members.map((m) => m.id) }),
          ...(teams.length > 0 && { teamIds: teams.map((t) => t.id) }),
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteProjects: async (_, { input }, { auth: { user } }) => {
      const { projectIds } = input;
      const projects = await getProjects(projectIds);

      if (projects.some((tb) => tb === undefined))
        throw new UserInputError('One or more project does not exist.');

      const projectPrivateIds = projects.map((p) => p.id);

      const deleteResult = await TaskService.deleteTaskBoards({
        ids: projectPrivateIds,
        userId: user.id,
        companyId: user.activeCompany,
      });

      if (deleteResult !== projectPrivateIds.length)
        throw new Error('Failed to delete one or more project.');

      return projects;
    },
    deleteProjectGroups: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectGroupIds } = input;
        const projectGroups = await getProjectGroups(projectGroupIds);
        const projectGroupPrivateIds = projectGroups.map((s) => s.id);

        await WorkspaceService.deleteProjectGroups({
          projectGroupIds: projectGroupPrivateIds,
          userId: user.id,
          companyId: user?.activeCompany,
        });

        return projectGroups;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    moveTasks: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectGroupId, taskIds, projectId } = input;

        const tasks = await getTasks(taskIds);
        const taskPrivateIds = tasks.map((s) => s.id);

        let projectGroupPrivateId;
        let projectPrivateId;
        if (projectGroupId && !projectGroupId.includes('DEFAULT_GROUP')) {
          const projectGroup = await getProjectGroup(projectGroupId);
          projectGroupPrivateId = projectGroup.id;
          projectPrivateId = projectGroup.projectId;
        } else if (projectGroupId.includes('DEFAULT_GROUP') && projectId) {
          projectPrivateId = (await getProject(projectId)).id;
        }

        const res = await WorkspaceService.moveProjectGroup({
          groupId: projectGroupPrivateId,
          taskIds: taskPrivateIds,
          projectId: projectPrivateId as number,
          userId: user?.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    moveTaskToMember: async (root, { input }, { auth: { user } }) => {
      try {
        const { taskId, sourceMemberId, destinationMemberId } = input;

        const task = await getTask(taskId);

        const sourceMember = await getCompanyMember(sourceMemberId);
        const destinationMember = await getCompanyMember(destinationMemberId);
        const res = await WorkspaceStore.moveTaskToMember({
          taskId: task.id,
          sourceMemberId: sourceMember.id,
          destinationMemberId: destinationMember.id,
          destinationUserId: destinationMember.userId,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    addToWorkspaceVisibilityWhitelist: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { workspaceId, memberIds, teamIds } = input;
        const workspace = await getWorkspace(workspaceId);

        let members: CompanyMemberModel[] = [];
        let teams: CompanyTeamModel[] = [];

        if (memberIds) {
          members = await getCompanyMembers(memberIds);
        }

        if (teamIds) {
          teams = await getCompanyTeams(teamIds);
        }

        const res = await WorkspaceService.addToWorkspaceVisibilityWhitelist({
          workspaceId: workspace.id,
          ...(members.length > 0 && { memberIds: members.map((m) => m.id) }),
          ...(teams.length > 0 && { teamIds: teams.map((t) => t.id) }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    removeFromWorkspaceVisibilityWhitelist: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { workspaceId, memberIds, teamIds } = input;
        const workspace = await getWorkspace(workspaceId);

        let members: CompanyMemberModel[] = [];
        let teams: CompanyTeamModel[] = [];

        if (memberIds) {
          members = await getCompanyMembers(memberIds);
        }

        if (teamIds) {
          teams = await getCompanyTeams(teamIds);
        }

        const res =
          await WorkspaceService.removeFromWorkspaceVisibilityWhitelist({
            workspaceId: workspace.id,
            ...(members.length > 0 && { memberIds: members.map((m) => m.id) }),
            ...(teams.length > 0 && { teamIds: teams.map((t) => t.id) }),
          });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createCustomColumnForGroup: async (root, { input }, { auth: { user } }) => {
      try {
        const { groupId, name, type } = input;

        const group = await getProjectGroup(groupId);

        const res = await WorkspaceService.createCustomColumnForGroup({
          groupId: group.id,
          customName: name,
          type: type as unknown as number,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    editCustomColumnForGroup: async (root, { input }, { auth: { user } }) => {
      try {
        const { groupId, name, attributeId } = input;

        const group = await getProjectGroup(groupId);
        const attribute = await getCustomAttribute(attributeId);

        const res = await WorkspaceStore.editCustomColumnForGroup({
          groupId: group.id,
          attributeId: attribute.id,
          customName: name,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteCustomColumnForGroup: async (root, { input }, { auth: { user } }) => {
      try {
        const { groupId, attributeId } = input;

        const attribute = await getCustomAttribute(attributeId);
        const group = await getProjectGroup(groupId);

        const res = await WorkspaceService.deleteCustomColumnForGroup({
          groupId: group.id,
          attributeId: attribute.id,
          projectId: group.projectId,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    addCustomValueToTask: async (root, { input }, { auth: { user } }) => {
      try {
        const { groupId, attributeId, taskId, value } = input;

        const task = await getTask(taskId);
        const attribute = await getCustomAttribute(attributeId);
        const group = await getProjectGroup(groupId);

        const res = await WorkspaceService.insertCustomValueToTask({
          groupId: group.id,
          attributeId: attribute.id,
          taskId: task.id,
          value,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteCustomValueFromTask: async (root, { input }, { auth: { user } }) => {
      try {
        const { groupId, attributeId, taskId } = input;

        const task = await getTask(taskId);
        const attribute = await getCustomAttribute(attributeId);
        const group = await getProjectGroup(groupId);

        const res = await WorkspaceService.deleteCustomValueToTask({
          groupId: group.id,
          attributeId: attribute.id,
          taskId: task.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    toggleEnabledCustomColumn: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectId, attributeId } = input;
        const attribute = await getCustomAttribute(attributeId);

        const project = await getProject(projectId);

        const res = await WorkspaceStore.toggleCustomColumn({
          projectId: project.id,
          attributeId: attribute.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    reorderGroups: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectId, reorderedGroups } = input;

        const reordered: { groupId: ProjectGroupId; ordering: number }[] = [];

        const project = await getProject(projectId);
        const groups: ProjectGroupModel[] = [];

        for (const r of reorderedGroups) {
          const group = await getProjectGroup(r.groupId);
          groups.push(group);
          reordered.push({ groupId: group.id, ordering: r.ordering });
        }

        await WorkspaceStore.reorderGroups({
          projectId: project.id,
          reordered,
        });

        return groups;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
  },
  ProjectInvoiceSortType: {
    CREATED_AT: 'created_at',
    NAME: 'name',
  },
  ProjectClaimSortType: {
    CREATED_AT: 'created_at',
    NAME: 'name',
  },
  ProjectTimeCostSortType: {
    CREATED_AT: 'created_at',
  },
  ProjectClaimType: {
    NEW: 0,
    APPROVED: 1,
    REJECTED: 2,
  },
  ProjectVisibility: {
    HIDDEN: 0,
    PUBLIC: 1,
    ASSIGNED: 2,
    SPECIFIC: 3,
    PRIVATE: 4,
  },
  ProjectGroupCustomAttributeType: {
    TEXT: 1,
    NUMBER: 2,
  },
};
