import dayjs from 'dayjs';
import { Resolvers } from '@generated/graphql-types';
import { withAuth } from '@graphql/wrappers';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import {
  getCompanyMembers,
  getCompanyTeams,
  getTags,
  getTaskBoard,
  getTaskBoardFolder,
  getTaskBoards,
  getUsers,
} from '@data-access/getters';
import {
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamModel,
} from '@models/company.model';
import {
  CompanyService,
  TaskService,
  TimesheetService,
  WorkspaceService,
} from '@services';
import { TaskBoardModel, TaskMemberModel, TaskModel } from '@models/task.model';
import { handleResolverError } from '@graphql/errors';
import _ from 'lodash';
import { FilterOptionsModel } from '@models/filter.model';
import {
  TimesheetActivityModel,
  TimesheetModel,
} from '@models/timesheet.model';
import tz from 'dayjs/plugin/timezone';
import { TaskStore, UserStore } from '@data-access';
dayjs.extend(tz);

export const TaskBoardFolderTypeMappings = {
  INTERNAL: 1,
  PERSONAL: 2,
  COLLABORATION: 3,
  PROJECT: 4,
};

export const resolvers: Resolvers = {
  TaskBoard: {
    id: ({ id_text, idText }) => id_text || idText,
    name: async ({ name }, args, { loaders }) => {
      return name;
    },
    taskBoardTeams: async ({ id }) => {
      const now = dayjs();

      const res = await TaskService.getTaskBoardTeams({ id });
      const timeDiff = dayjs().diff(now, 'ms');

      return res || [];
    },
    // DEPRECATED
    task_board_teams: async ({ id }) => {
      const now = dayjs();

      const timeDiff = dayjs().diff(now, 'ms');

      const res = await TaskService.getTaskBoardTeams({ id });
      return res;
    },
    tasks: async (
      { id, type, companyId },
      { filters, limit, offset },
      { auth: { user } },
    ) => {
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: companyId,
        userId: user.id,
      })) as CompanyMemberModel;
      const res = (await TaskService.getTasksByTaskBoardId({
        id,
        filters: filters as FilterOptionsModel,
        memberId: member.id,
        ...(limit && { limit }),
        ...(offset && { offset }),
      })) as TaskModel[];

      const filteredTasks = await TaskService.filterVisibleTasks({
        tasks: res,
        userId: user?.id,
        companyId,
      });

      return filteredTasks;
    },
    contact: async ({ contactId }, args, { loaders }) => {
      const now = dayjs();
      const contact = await loaders.contacts.load(contactId);
      const timeDiff = dayjs().diff(now, 'ms');

      return contact;
    },
    type: async ({ type }) => {
      const now = dayjs();

      const timeDiff = dayjs().diff(now, 'ms');

      return type;
    },
    company: async ({ companyId }, args, { loaders }) => {
      const now = dayjs();

      const company = await loaders.companies.load(companyId);
      const timeDiff = dayjs().diff(now, 'ms');

      return company;
    },
    members: async ({ id, companyId }, args, { loaders, auth: { user } }) => {
      const members = await TaskStore.getTaskMembersByCompanyIdAndProjectId({
        companyId,
        projectId: id,
      });

      return members;
    },
    value: async ({ id, company_id }, args, { auth: { user } }) => {
      const now = dayjs();

      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company_id,
        userId: user.id,
      })) as CompanyMemberModel;

      const tasks = (await TaskService.getTasksByTaskBoardId({
        id,
        memberId: member.id,
      })) as TaskModel[];

      let value = 0;

      await Promise.all(
        _.map(tasks, (t) => {
          const taskValue = t.projected_cost
            ? parseInt(`${t.projected_cost}`)
            : 0;

          value = taskValue + value;
        }),
      );

      const timeDiff = dayjs().diff(now, 'ms');

      return value;
    },
    folder: async ({ folder_id }, args, { loaders }) => {
      const now = dayjs();

      if (!folder_id) {
        return null;
      }
      const folder = await loaders.boardFolders.load(folder_id);
      const timeDiff = dayjs().diff(now, 'ms');

      return folder ? folder : null;
    },
    timeSpent: async ({ id, company_id }, args, { auth: { user } }) => {
      const now = dayjs();

      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company_id,
        userId: user.id,
      })) as CompanyMemberModel;
      const tasks = (await TaskService.getTasksByTaskBoardId({
        id,
        memberId: member.id,
      })) as TaskModel[];

      let spent = 0;

      await Promise.all(
        _.map(tasks, async (t) => {
          let spentEffort = 0;

          const activity = (await TimesheetService.getTimesheetActivityByTaskId(
            { taskId: t?.id },
          )) as TimesheetActivityModel;

          if (activity) {
            const timesheets =
              (await TimesheetService.getTimesheetsByActivityId({
                activityId: activity?.id,
              })) as TimesheetModel[];
            timesheets.forEach((tm) => {
              spentEffort = spentEffort + tm?.time_total;
            });

            spent = spentEffort + spent;
          }
        }),
      );

      const timeDiff = dayjs().diff(now, 'ms');

      return spent;
    },
    startDate: async (
      { id, category, company_id },
      args,
      { auth: { user } },
    ) => {
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company_id,
        userId: user.id,
      })) as CompanyMemberModel;
      const tasks = (await TaskService.getTasksByTaskBoardId({
        id,
        memberId: member.id,
      })) as TaskModel[];
      const unarchivedTasks = _.filter(tasks, (t) => !t.archived);

      if (category === 0) {
        return null;
      }

      let startDate: null | Date = null;

      await Promise.all(
        _.map(unarchivedTasks, async (t) => {
          if (!t?.archived) {
            if (startDate) {
              const isEarliest = dayjs(t.start_date).isBefore(startDate);

              if (isEarliest) {
                startDate = dayjs(t.start_date).toDate();
              }
            } else {
              startDate = dayjs(t.start_date).toDate();
            }
          }
        }),
      );

      const isDate = _.isDate(startDate);
      const isNull = JSON.stringify(startDate) === 'null';

      if (isDate && !isNull) {
        return startDate;
      }

      return null;
    },
    endDate: async ({ id, category, company_id }, args, { auth: { user } }) => {
      const now = dayjs();

      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company_id,
        userId: user.id,
      })) as CompanyMemberModel;
      const tasks = (await TaskService.getTasksByTaskBoardId({
        id,
        memberId: member.id,
      })) as TaskModel[];

      if (category === 0) {
        return null;
      }

      let endDate: null | Date = null;

      await Promise.all(
        _.map(tasks, async (t) => {
          if (endDate) {
            const isLatest = dayjs(t.end_date).isAfter(endDate);

            if (isLatest) {
              endDate = dayjs(t.end_date).toDate();
            }
          } else {
            endDate = dayjs(t.end_date).toDate();
          }
        }),
      );
      const isDate = _.isDate(endDate);
      const isNull = JSON.stringify(endDate) === 'null';

      if (isDate && !isNull) {
        return endDate;
      }

      const timeDiff = dayjs().diff(now, 'ms');

      return null;
    },
    createdBy: async ({ createdBy }, args) => {
      const user = await UserStore.getUser(createdBy);
      return user;
    },
    archivedBy: async ({ archivedBy }, args) => {
      const user = await UserStore.getUser(archivedBy);
      return user;
    },
    groups: async (
      { id, idText, id_text, name },
      { groupQuery },
      { auth: { user } },
    ) => {
      const res = await WorkspaceService.getProjectGroups(id);

      const groups = res.sort((a, b) => a.ordering - b.ordering);

      if (groupQuery && !_.isEmpty(groupQuery)) {
        const taskQuery = groupQuery.taskQuery;

        return groups.map((g) => {
          const query = taskQuery?.find((tq) => tq?.groupId === g.idText);
          return {
            ...g,
            query,
          };
        });
      }

      return groups;
    },
    workspace: async ({ id }, args, { loaders }) => {
      try {
        const workspace = await WorkspaceService.getWorkspaceByProjectId(id);
        return workspace;
      } catch (error) {
        return null;
      }
    },
    time_spent: async ({ id, company_id }, args, { auth: { user } }) => {
      const now = dayjs();

      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company_id,
        userId: user.id,
      })) as CompanyMemberModel;
      const tasks = (await TaskService.getTasksByTaskBoardId({
        id,
        memberId: member.id,
      })) as TaskModel[];

      let spent = 0;

      await Promise.all(
        _.map(tasks, async (t) => {
          let spentEffort = 0;

          const activity = (await TimesheetService.getTimesheetActivityByTaskId(
            { taskId: t?.id },
          )) as TimesheetActivityModel;

          if (activity) {
            const timesheets =
              (await TimesheetService.getTimesheetsByActivityId({
                activityId: activity?.id,
              })) as TimesheetModel[];
            timesheets.forEach((tm) => {
              spentEffort = spentEffort + tm?.time_total;
            });

            spent = spentEffort + spent;
          }
        }),
      );

      const timeDiff = dayjs().diff(now, 'ms');

      return spent;
    },
    start_date: async (
      { id, category, company_id },
      args,
      { auth: { user } },
    ) => {
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company_id,
        userId: user.id,
      })) as CompanyMemberModel;
      const tasks = (await TaskService.getTasksByTaskBoardId({
        id,
        memberId: member.id,
      })) as TaskModel[];

      if (category === 0) {
        return null;
      }

      let startDate: null | Date = null;

      await Promise.all(
        _.map(tasks, async (t) => {
          if (startDate) {
            const isEarliest = dayjs(t.start_date).isBefore(startDate);

            if (isEarliest) {
              startDate = dayjs(t.start_date).toDate();
            }
          } else {
            startDate = dayjs(t.start_date).toDate();
          }

          // if (timeline.end) {
          //   const isLatest = dayjs(t.end_date).isAfter(timeline.end);

          //   if (isLatest) {
          //     timeline.end = dayjs(t.end_date).toDate();
          //   }
          // } else {
          //   timeline.end = dayjs(t.end_date).toDate();
          // }
        }),
      );
      const isDate = _.isDate(startDate);
      const isNull = JSON.stringify(startDate) === 'null';

      if (isDate && !isNull) {
        return startDate;
      }

      return null;
    },
    end_date: async (
      { id, category, company_id },
      args,
      { auth: { user } },
    ) => {
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company_id,
        userId: user.id,
      })) as CompanyMemberModel;
      const tasks = (await TaskService.getTasksByTaskBoardId({
        id,
        memberId: member.id,
      })) as TaskModel[];

      if (category === 0) {
        return null;
      }

      let endDate: null | Date = null;

      await Promise.all(
        _.map(tasks, async (t) => {
          if (endDate) {
            const isLatest = dayjs(t.end_date).isAfter(endDate);

            if (isLatest) {
              endDate = dayjs(t.end_date).toDate();
            }
          } else {
            endDate = dayjs(t.end_date).toDate();
          }
        }),
      );
      const isDate = _.isDate(endDate);
      const isNull = JSON.stringify(endDate) === 'null';

      if (isDate && !isNull) {
        return endDate;
      }

      return null;
    },
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    owners: async ({ id }, args, {}) => {
      const now = dayjs();
      const o = await TaskService.getTaskBoardOwnersByTaskBoardId(id);
      const timeDiff = dayjs().diff(now, 'ms');

      return o;
    },
    visibilityWhitelist: async ({ id }, args, { loaders, auth: { user } }) => {
      const res = await TaskService.getVisibilityWhitelist({ boardId: id });
      let teams = [];
      let members = [];

      if (res?.teams) {
        teams = await loaders.companyTeams.loadMany(res.teams);
      }

      if (res?.members) {
        members = await loaders.companyMembers.loadMany(res.members);
      }

      return {
        ...(res.teams && {
          teams: teams,
        }),
        ...(res.members && {
          members: members,
        }),
      };
    },
    projectSettings: async ({ id }, args, { loaders, auth: { user } }) => {
      const now = dayjs();

      const res = await WorkspaceService.getProjectSettings(id);

      const timeDiff = dayjs().diff(now, 'ms');

      return res;
    },
    projectStatuses: async ({ id }, args, { loaders, auth: { user } }) => {
      const now = dayjs();

      const res = await WorkspaceService.getProjectStatusesByProjectId(id);

      const timeDiff = dayjs().diff(now, 'ms');

      return res;
    },
  },
  TaskBoardFolder: {
    id: ({ id_text }) => id_text,
    taskBoards: async ({ id, type }, {}, { auth: { user } }) => {
      if (!user?.activeCompany) {
        throw new AuthenticationError('No active company selected');
      }

      const res = await TaskService.getTaskBoardsByFolderId({
        folderId: id,
        user,
        folderType: type,
        companyId: user.activeCompany,
      });

      return res;
    },
  },
  Query: {
    taskBoard: withAuth(
      async (root, { id }, { loaders, auth: { isAuthenticated, user } }) => {
        if (!isAuthenticated) {
          throw new AuthenticationError('Not logged in');
        }

        const res = await getTaskBoard(id);
        return res;
      },
    ),
    taskBoards: async (
      root,
      { companyId, type, category, filters },
      { loaders, auth: { isAuthenticated, user } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }
      const company = (await loaders.companies.load(companyId)) as CompanyModel;
      if (!company) {
        throw new UserInputError('Company does not exist');
      }

      let parsedCategory;
      if (typeof category === 'number') {
        parsedCategory = parseInt(category);
      }

      let memberPrivateId;

      if (filters?.memberId) {
        const member = (await loaders.companyMembers.load(
          filters.memberId,
        )) as CompanyMemberModel;
        memberPrivateId = member?.id;
      }
      const res = (await TaskService.getByCompanyId({
        taskType: type,
        userId: user.id,
        companyId: company.id,
        payload: { company_id: company.id, category: parsedCategory },
        filters: { assignedToMember: { memberId: memberPrivateId } },
      })) as TaskBoardModel[];
      return res;
    },
    taskBoardsV3: async (
      root,
      { filter, limit, offset, sort },
      { auth: { isAuthenticated, user } },
    ) => {
      let memberOwnerPrivateIds: number[] | undefined;
      let memberAssigneePrivateIds: number[] | undefined;
      let tagPrivateIds: number[] | undefined;

      if (filter?.memberOwnerIds) {
        const memberOwners = await getUsers(filter?.memberOwnerIds as string[]);
        memberOwnerPrivateIds = memberOwners.map(
          (memberOwner) => memberOwner.id,
        );
      }

      if (filter?.memberAssigneeIds) {
        const members = await getCompanyMembers(
          filter?.memberAssigneeIds as string[],
        );
        memberAssigneePrivateIds = members.map((memberOwner) => memberOwner.id);
      }

      if (filter?.tagIds) {
        const tags = await getTags(filter?.tagIds as string[]);
        tagPrivateIds = tags.map((tag) => tag.id);
      }

      const res = await TaskService.getTaskBoardsV3({
        companyId: user?.activeCompany,
        filter: {
          memberOwnerIds: memberOwnerPrivateIds,
          memberAssigneeIds: memberAssigneePrivateIds,
          tagIds: tagPrivateIds,
          limit,
          offset,
          userId: user?.id,
          boardType: filter?.boardType,
          category: filter?.category?.toString(),
        },
        sort: {
          direction: sort?.direction,
          type: sort?.type,
        },
      });

      return {
        taskBoards: res,
        total: res.length,
      };
    },
    taskBoardFolders: async (root, { type }, { auth: { user } }) => {
      if (!user.activeCompany) {
        throw new UserInputError('No active company selected');
      }

      const res = await TaskService.getTaskBoardFolders({
        companyId: user.activeCompany,
        type,
        user,
      });

      return res;
    },
  },
  Mutation: {
    setTaskBoardVisibility: async (root, { input }, { auth: { user } }) => {
      try {
        const { visibility, boardId } = input;
        if (!user.activeCompany) {
          throw new UserInputError('No active company selected');
        }

        const board = await getTaskBoard(boardId);

        const res = await TaskService.setTaskBoardVisibility({
          boardId: board.id,
          companyId: user.activeCompany,
          user,
          visibility,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    createTaskBoardFolder: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, type } = input;
        if (!user.activeCompany) {
          throw new UserInputError('No active company selected');
        }

        const res = await TaskService.createTaskBoardFolder({
          companyId: user.activeCompany,
          name,
          type,
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    updateTaskBoardFolder: async (root, { input }, { auth: { user } }) => {
      try {
        const { name, folderId } = input;
        if (!user.activeCompany) {
          throw new UserInputError('No active company selected');
        }
        const folder = await getTaskBoardFolder(folderId);

        const res = await TaskService.updateTaskBoardFolder({
          folderId: folder.id,
          name,
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    deleteTaskBoardFolder: async (root, { folderId }, { auth: { user } }) => {
      try {
        if (!user.activeCompany) {
          throw new UserInputError('No active company selected');
        }
        const folder = await getTaskBoardFolder(folderId);

        await TaskService.deleteTaskBoardFolder({
          folderId: folder.id,
          user,
        });

        return folder;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    assignTaskBoardsToFolder: async (root, { input }, { auth: { user } }) => {
      try {
        const folder = await getTaskBoardFolder(input.folderId);
        const boards = await getTaskBoards(input.boardIds);

        const boardIds = boards.map((b) => b.id);

        const res = await TaskService.assignTaskBoardsToFolder({
          folderId: folder.id,
          boardIds,
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    //@ts-ignore
    removeTaskBoardsFromFolder: async (root, { input }, { auth: { user } }) => {
      try {
        const boards = await getTaskBoards(input.boardIds);

        const boardIds = boards.map((b) => b?.id);

        const res = await TaskService.removeTaskBoardsFromFolder({
          boardIds,
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    toggleTaskBoardPinned: async (root, { boardId }, { auth: { user } }) => {
      try {
        const board = await getTaskBoard(boardId);

        const res = await TaskService.toggleTaskBoardPinned({
          boardId: board.id,
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    //@ts-ignore
    toggleTaskBoardsPinned: async (root, { boardIds }, { auth: { user } }) => {
      try {
        const boards = await getTaskBoards(boardIds);

        const privateBoardIds = boards.map((b) => b.id);

        const res = await TaskService.toggleTaskBoardsPinned({
          boardIds: privateBoardIds,
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    addToVisibilityWhitelist: async (root, { input }, { auth: { user } }) => {
      try {
        const { boardId, memberIds, teamIds } = input;
        const board = await getTaskBoard(boardId);

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
        return handleResolverError(error);
      }
    },
    removeFromVisibilityWhitelist: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { boardId, memberIds, teamIds } = input;
        const board = await getTaskBoard(boardId);

        let members: CompanyMemberModel[] = [];
        let teams: CompanyTeamModel[] = [];

        if (memberIds) {
          members = await getCompanyMembers(memberIds);
        }

        if (teamIds) {
          teams = await getCompanyTeams(teamIds);
        }

        const res = await TaskService.removeFromVisibilityWhitelist({
          boardId: board.id,
          ...(members.length > 0 && { memberIds: members.map((m) => m.id) }),
          ...(teams.length > 0 && { teamIds: teams.map((t) => t.id) }),
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
  },
  TaskBoardVisibility: {
    HIDDEN: 0,
    PUBLIC: 1,
    ASSIGNED: 2,
    SPECIFIC: 3,
    PRIVATE: 4,
  },
  TaskBoardFolderType: {
    INTERNAL: TaskBoardFolderTypeMappings.INTERNAL,
    PERSONAL: TaskBoardFolderTypeMappings.PERSONAL,
    COLLABORATION: TaskBoardFolderTypeMappings.COLLABORATION,
    PROJECT: TaskBoardFolderTypeMappings.PROJECT,
  },
};
