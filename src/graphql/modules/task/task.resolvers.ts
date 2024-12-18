import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { GraphQLUpload } from 'graphql-upload';
import dayjs from 'dayjs';
import {
  TaskModel,
  TaskBoardModel,
  TaskCommentModel,
  SubtaskModel,
  TaskAttachmentModel,
  TaskBoardTeamModel,
  TaskStatusModel,
  TaskPicModel,
  ChecklistModel,
  ProjectModel,
  TaskMemberModel,
} from '@models/task.model';
import {
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamModel,
  CompanyTeamStatusModel,
} from '@models/company.model';
import {
  CompanyService,
  SubscriptionService,
  TagService,
  TaskService,
  TemplateService,
  TimesheetService,
} from '@services';
import {
  getCompanyMembers,
  getCompanyTeams,
  getCompanyTeamStatus,
  getContactPics,
  getContacts,
  getProject,
  getProjectGroup,
  getProjectStatus,
  getSubtask,
  getTags,
  getTaskAttachment,
  getTaskComment,
  getTasks,
  getUsers,
} from '@data-access/getters';
import { ContactModel, ContactPicModel } from '@models/contact.model';
import _ from 'lodash';
import { CompanySubscriptionModel } from '@models/subscription.model';
import { FilterOptionsModel } from '@models/filter.model';
import { handleResolverError } from '@graphql/errors';
import {
  TimesheetActivityModel,
  TimesheetDayApprovalModel,
  TimesheetModel,
} from '@models/timesheet.model';
import tz from 'dayjs/plugin/timezone';
import {
  getTask,
  getTaskBoard,
  getCompanyTeam,
  getCompany,
} from '@data-access/getters';
import { TaskBoardSortType, TaskSortType } from '@constants';
import path from 'path';
import { TaskStore, TimesheetStore, WorkspaceStore } from '@data-access';

dayjs.extend(tz);

export const resolvers: Resolvers = {
  Query: {
    getTaskPics: async (
      root,
      _,
      { loaders, auth: { isAuthenticated, user } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }

      const res = await TaskService.getTaskPics({ userId: user.id });

      return res;
    },
    taskPics: async (root, _, { loaders, auth: { isAuthenticated, user } }) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }

      const res = await TaskService.getTaskPics({ userId: user.id });

      return res;
    },
    task: async (
      root,
      { taskId },
      { loaders, auth: { isAuthenticated, user } },
    ) => {
      try {
        if (!isAuthenticated) {
          throw new AuthenticationError('Not logged in');
        }
        const task = await getTask(taskId);

        if (task?.visibility === 0) {
          if (task.created_by === user.id) {
            return task;
          }

          const boardOwners = await TaskService.getTaskBoardOwnersByTaskBoardId(
            task.job_id,
          );

          const ownerMembers = await Promise.all(
            boardOwners.map(
              async (bo) =>
                await loaders.companyMembers.load(bo.companyMemberId),
            ),
          );
          const ownerUserIds = ownerMembers.map((m) => m.user_id);
          const isOwner = ownerUserIds.includes(user.id);

          if (isOwner) {
            return task;
          }

          throw new AuthenticationError('403: Forbidden');
        }

        const taskboard = (await loaders.taskBoards.load(
          task?.job_id,
        )) as TaskBoardModel;

        const pics = (await TaskService.getTaskPicsByTaskId({
          taskId: task.id,
        })) as TaskPicModel[];

        const companyMembers = (await CompanyService.getCompanyMembers(
          taskboard.company_id,
        )) as CompanyMemberModel[];

        const member = companyMembers.find(
          (cm) => cm.user_id === user.id,
        ) as CompanyMemberModel;

        if (member?.id) {
          const memberId = member.id;

          const taskBoardFiltered = await TaskService.filterVisibleBoards({
            boards: [taskboard],
            userId: user.id,
            companyId: user?.active_company,
          });

          if (_.isEmpty(taskBoardFiltered)) {
            throw new UserInputError('Not authorized to view this task');
          }

          return task;
        } else if (pics.some((pic) => pic.user_id === user.id)) {
          return task;
        } else {
          return null;
        }
      } catch (error) {
        handleResolverError(error);
      }
    },
    tasks: async (
      root,
      { companyId, filters, category },
      { loaders, auth: { isAuthenticated, user } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }
      const company = await getCompany(companyId);

      const res = (await TaskService.getTasks({
        companyId: company.id,
        userId: user.id,
        category: category as unknown as number,
        filters: filters as FilterOptionsModel,
      })) as TaskModel[];

      return res;
    },
    taskBoardTeams: async (
      root,
      { companyId, type, category },
      { auth: { isAuthenticated, user } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }

      const company = await getCompany(companyId);

      const res = await TaskService.getTaskBoardTeamsByCompanyId({
        companyId: company.id,
      });

      return res;
    },

    tasksV3: async (
      root,
      { filter, limit, offset, sort },
      { auth: { isAuthenticated, user } },
    ) => {
      let taskIds: number[] | undefined;
      let contactPrivateIds: number[] | undefined;
      let memberOwnerPrivateIds: number[] | undefined;
      let memberAssigneePrivateIds: number[] | undefined;
      let picPrivateIds: number[] | undefined;
      let tagPrivateIds: number[] | undefined;

      if (filter?.ids) {
        const tasks = await getTasks(filter?.ids as string[]);
        taskIds = tasks.map((task) => task.id);
      }

      if (filter?.contactIds) {
        const contacts = await getContacts(filter?.contactIds as string[]);
        if (!_.isEmpty(contacts)) {
          contactPrivateIds = contacts.map((contact) => contact.id);
        }
      }

      if (filter?.memberOwnerIds) {
        const memberOwners = await getUsers(filter?.memberOwnerIds as string[]);
        memberOwnerPrivateIds = memberOwners.map(
          (memberOwner) => memberOwner.id,
        );
      }

      if (filter?.picIds) {
        const pics = await getContactPics(filter?.picIds as string[]);
        picPrivateIds = pics.map((pic) => pic.id);
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

      const res = await TaskService.getTasksV3({
        companyId: user?.activeCompany,
        filter: {
          userId: user?.id,
          ids: taskIds,
          limit: limit,
          offset: offset,
          boardType: filter?.boardType,
          stage: filter?.stage,
          contactIds: contactPrivateIds,
          priority: filter?.priority,
          search: _.lowerCase(filter?.search),
          dueDateRange: _.isArray(filter?.dueDateRange)
            ? [
                dayjs(filter?.dueDateRange?.[0])?.toISOString(),
                dayjs(filter?.dueDateRange?.[1])?.toISOString(),
              ]
            : undefined,
          memberOwnerIds: memberOwnerPrivateIds,
          memberAssigneeIds: memberAssigneePrivateIds,
          isRecurring: filter?.isRecurring,
          isOverdue: filter?.isOverdue,
          picIds: picPrivateIds,
          tagIds: tagPrivateIds,
          category: filter?.category?.toString(),
        },
        sort: {
          type: sort?.type,
          direction: sort?.direction,
        },
      });

      return { tasks: res, total: res.length };
    },
    sharedWithMeTasks: async (
      root,
      { filter, limit, offset, sort },
      { auth: { isAuthenticated, user } },
    ) => {
      let taskIds: number[] | undefined;
      let contactPrivateIds: number[] | undefined;
      let memberOwnerPrivateIds: number[] | undefined;
      let memberAssigneePrivateIds: number[] | undefined;
      let picPrivateIds: number[] | undefined;
      let tagPrivateIds: number[] | undefined;

      if (filter?.ids) {
        const tasks = await getTasks(filter?.ids as string[]);
        taskIds = tasks.map((task) => task.id);
      }

      if (filter?.contactIds) {
        const contacts = await getContacts(filter?.contactIds as string[]);
        if (!_.isEmpty(contacts)) {
          contactPrivateIds = contacts.map((contact) => contact.id);
        }
      }

      if (filter?.memberOwnerIds) {
        const memberOwners = await getUsers(filter?.memberOwnerIds as string[]);
        memberOwnerPrivateIds = memberOwners.map(
          (memberOwner) => memberOwner.id,
        );
      }

      if (filter?.picIds) {
        const pics = await getContactPics(filter?.picIds as string[]);
        picPrivateIds = pics.map((pic) => pic.id);
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

      const res = await TaskService.getSharedTasks({
        userId: user.id,
        companyId: user.activeCompany,
        filter: {
          userId: user?.id,
          ids: taskIds,
          limit: limit,
          offset: offset,
          boardType: filter?.boardType,
          stage: filter?.stage,
          contactIds: contactPrivateIds,
          priority: filter?.priority,
          dueDateRange: _.isArray(filter?.dueDateRange)
            ? [
                dayjs(filter?.dueDateRange?.[0])?.toISOString(),
                dayjs(filter?.dueDateRange?.[1])?.toISOString(),
              ]
            : undefined,
          startDateRange: _.isArray(filter?.startDateRange)
            ? [
                dayjs(filter?.startDateRange?.[0])?.toISOString(),
                dayjs(filter?.startDateRange?.[1])?.toISOString(),
              ]
            : undefined,
          memberOwnerIds: memberOwnerPrivateIds,
          memberAssigneeIds: memberAssigneePrivateIds,
          isRecurring: filter?.isRecurring,
          isOverdue: filter?.isOverdue,
          picIds: picPrivateIds,
          tagIds: tagPrivateIds,
          category: filter?.category?.toString(),
        },
        sort: {
          type: sort?.type,
          direction: sort?.direction,
        },
      });

      return { tasks: res, total: res.length };
    },
  },
  Task: {
    id: ({ id_text, idText }) => id_text || idText,

    comments: async (
      { id },
      args,
      { loaders }, //TODO: Pagination
    ) => {
      if (!id) {
        //TODO: Fix error when fetching comments, it will not load comments that is not in proper format.
        //NOTE: Correct✅ format for mentioned user in card_comments: @[user-id] -> auto convert to their display names
        //NOTE: Wrong❌ format for mentioned user in card_comments: @[Random name] -> does not load, will be fixed
        console.error('Task id is null for comments');
        return [];
      }

      const res = (await TaskService.getCommentsByTaskId({
        loaders,
        taskId: id,
      })) as TaskCommentModel[];

      return res;
    },
    members: async ({ id }) => {
      const res = await TaskService.getTaskMembersByTaskId({ taskId: id });
      return res;
    },
    taskBoardTeam: async ({ job_id, team_id, jobId, teamId }) => {
      const res = await TaskService.getTaskBoardTeamById({
        boardId: job_id || jobId,
        teamId: team_id || teamId,
      });
      return res;
    },
    pics: async ({ id }) => {
      const res = await TaskService.getTaskPicsByTaskId({ taskId: id });
      return res;
    },
    subtasks: async ({ id }) => {
      const res = id
        ? ((await TaskService.getSubtasksByTaskId({
            taskId: id,
          })) as SubtaskModel[])
        : null;

      return res;
    },
    checklists: async ({ id }) => {
      const res = id
        ? ((await TaskService.getSubtasksByTaskId({
            taskId: id,
          })) as SubtaskModel[])
        : null;

      return res;
    },
    companyTeamStatus: async ({ subStatusId }, args, { loaders }) => {
      return subStatusId ? await loaders.teamStatuses.load(subStatusId) : null;
    },
    childTasks: async ({ id }) => {
      const res = await TaskService.getChildTasks(id);
      return res;
    },
    parentTask: async ({ parentId, parent_id }, args, { loaders }) => {
      if (!parentId && !parent_id) {
        return null;
      }

      const task = await TaskStore.getTaskById(parentId || parent_id);

      return task;
    },
    taskActivities: async ({ id }) => {
      const res = await TaskService.getTaskActivities({ taskId: id });

      return res;
    },
    createdBy: async ({ created_by, createdBy }, args, { loaders }) => {
      if (createdBy) {
        return loaders.users.load(createdBy);
      } else {
        return created_by ? await loaders.users.load(created_by) : null;
      }
    },
    archivedBy: async ({ archivedBy }, args, { loaders }) => {
      return archivedBy ? await loaders.users.load(archivedBy) : null;
    },
    attachments: async ({ id }) => {
      const now = dayjs();
      const res = await TaskService.getTaskAttachmentsByTaskId({ taskId: id });

      // console.log('end attach', dayjs().diff(now, 'ms'));
      return res;
    },
    dueReminder: async ({ dueDate, startDate, dueReminder }) => {
      if (dueDate) {
        const dueReminderDate = dayjs(dueDate)
          .subtract(dueReminder, 'minute')
          .toISOString();
        return dueReminderDate;
      } else if (startDate) {
        const dueReminderDate = dayjs(startDate)
          .subtract(dueReminder, 'minute')
          .toISOString();
        return dueReminderDate;
      } else {
        return null;
      }
    },
    companyTeam: async ({ team_id, teamId }, args, { loaders }) => {
      if (teamId) {
        return loaders.companyTeams.load(teamId);
      }
      return team_id ? await loaders.companyTeams.load(team_id) : null;
    },
    spentEffort: ({ actual_start, actual_end, actualStart, actualEnd }) => {
      const as = actual_start || actualStart;
      const ae = actual_end || actualEnd;
      if (as && ae) {
        return dayjs(ae).diff(dayjs(as), 's');
      } else {
        return 0;
      }
    },
    timerTotals: async ({ id }) => {
      const res = await TaskService.getTaskTimerTotals({ taskId: id });

      return res;
    },
    totalRate: async ({ id }, { dates }, { loaders }) => {
      const members = (await TaskService.getTaskMembersByTaskId({
        taskId: id,
      })) as TaskMemberModel[];
      const memberIds = members?.map((member) => member?.member_id);
      const companyMembers = (await loaders.companyMembers.loadMany(
        memberIds,
      )) as CompanyMemberModel[];

      let totalRate = +0;

      for (const cm of companyMembers) {
        const hourlyRate = cm?.hourly_rate;
        const memberId = cm?.id;

        const timesheetApprovals =
          (await TimesheetStore.getTimesheetApprovalsByDate({
            memberId,
            taskId: id,
            dates,
          })) as TimesheetDayApprovalModel[];
        const total = _.reduce(
          timesheetApprovals,
          (prev, curr) => prev + curr?.total,
          0,
        );
        totalRate += total * hourlyRate;
      }

      return totalRate;
    },
    approvedCost: async ({ id }, args, { loaders }) => {
      return 0;

    },
    timeSpent: async ({ id }) => {
      let spent = 0;

      const activity = (await TimesheetService.getTimesheetActivityByTaskId({
        taskId: id,
      })) as TimesheetActivityModel;

      if (activity) {
        const timesheets = (await TimesheetService.getTimesheetsByActivityId({
          activityId: activity?.id,
        })) as TimesheetModel[];

        const total = _.reduce(
          timesheets,
          (prev, curr) => prev + curr?.time_total,
          spent,
        );
        spent = total;

        return spent;
      } else {
        return 0;
      }
    },
    timeSpentMember: async ({ id }, args, { auth: { user } }) => {
      let spent = 0;

      const companyMembers = (await CompanyService.getCompanyMembersByUserId(
        user.id,
      )) as CompanyMemberModel[];
      const companyMemberId = _.find(companyMembers, {
        companyId: user?.activeCompany,
      })?.id;

      const activity = (await TimesheetService.getTimesheetActivityByTaskId({
        taskId: id,
      })) as TimesheetActivityModel;
      if (activity) {
        const timesheets = (await TimesheetService.getTimesheetsByActivityId({
          activityId: activity?.id,
          ...({ companyMemberId } && { memberId: companyMemberId }),
        })) as TimesheetModel[];

        const total = _.reduce(
          timesheets,
          (prev, curr) => prev + curr?.time_total,
          spent,
        );
        spent = total;

        return spent;
      } else {
        return 0;
      }
    },
    timesheets: async ({ id }, args, { auth: { user } }) => {
      try {
        const companyMembers = (await CompanyService.getCompanyMembersByUserId(
          user.id,
        )) as CompanyMemberModel[];
        const companyMemberId = _.find(companyMembers, {
          companyId: user?.activeCompany,
        })?.id;

        const activity = (await TimesheetService.getTimesheetActivityByTaskId({
          taskId: id,
        })) as TimesheetActivityModel;

        const timesheets = (await TimesheetService.getTimesheetsByActivityId({
          activityId: activity?.id,
          ...({ companyMemberId } && { memberId: companyMemberId }),
        })) as TimesheetModel[];

        return timesheets;
      } catch (error) {
        return [];
      }
    },

    taskBoard: async ({ job_id, jobId }, args, { loaders }) => {
      const projectId = job_id || jobId;
      return await loaders.taskBoards.load(projectId);
    },
    project: async ({ job_id, jobId }, args, { loaders }) => {
      const projectId = job_id || jobId;

      const tb = await loaders.taskBoards.load(projectId);

      return tb;
    },
    company: async ({ companyIdText }, args, { loaders }) => {
      const company = loaders.companies.load(companyIdText);

      return company;
    },
    status: ({ status, sub_status_id }) => {
      if (status === 0) return 1;
      return status;
    },
    stageStatus: async ({ status, sub_status_id }, args, { loaders }) => {
      if (sub_status_id) {
        const companyTeamStatus = (await loaders.subStatuses.load(
          sub_status_id,
        )) as CompanyTeamStatusModel;
        if (companyTeamStatus.stage === 0) {
          return 1;
        } else return companyTeamStatus.stage;
      }
      if (status === 0) return 1;

      return status;
    },
    templateTask: async ({ templateId }, args, { loaders }) => {
      if (templateId) {
        const template = await loaders.templates.load(templateId);

        const res = await TemplateService.getTaskTemplate(template.id);

        return res;
      } else {
        return null;
      }
    },
    projectStatus: async ({ statusId }, args, { loaders }) => {
      if (statusId) {
        const status = await loaders.projectStatuses.load(statusId);
        return status;
      }

      return null;
    },
    tags: async ({ id }) => {
      const res = await TagService.getTagsByTaskId({ taskId: id });
      return res;
    },
    dueDate: ({ due_date }) => {
      return due_date ? due_date : null;
    },
    startDate: ({ start_date, startDate }) => {
      const sd = start_date || startDate;
      return sd ? sd : null;
    },
    endDate: ({ end_date, endDate }) => {
      const ed = end_date || endDate;
      return ed ? ed : null;
    },
    watchers: async ({ id }) => {
      const watchers = await TaskService.getTaskWatchers({ taskId: id });

      return watchers;
    },
    posY: async ({ id }) => {
      const sequence = await TaskService.getTaskSequenceRework(id);

      return sequence?.posY;
    },
    group: async ({ groupId }, args, { loaders }) => {
      return groupId ? await loaders.projectGroups.load(groupId) : null;
    },
    actualValue: async ({ actual_cost }) => {
      return actual_cost;
    },
    projectedValue: async ({ projected_cost }) => {
      return projected_cost;
    },
    customValues: async ({ id }) => {
      const res = await TaskStore.getCustomValuesForTaskId(id);

      return res;
    },
    visibilityWhitelist: async ({ id }, args, { loaders, auth: { user } }) => {
      const res = await TaskService.getTaskVisibilityWhitelist({ taskId: id });

      return {
        ...(res.teams && {
          teams: await loaders.companyTeams.loadMany(res.teams),
        }),
        ...(res.members && {
          members: await loaders.companyMembers.loadMany(res.members),
        }),
      };
    },
    // DEPRECATED
    company_team_status: async ({ sub_status_id }, args, { loaders }) => {
      return sub_status_id
        ? await loaders.teamStatuses.load(sub_status_id)
        : null;
    },
    // DEPRECATED
    task_board_team: async ({ job_id, team_id }) => {
      const res = await TaskService.getTaskBoardTeamById({
        boardId: job_id,
        teamId: team_id,
      });
      return res;
    },
    // DEPRECATED
    task_activities: async ({ id }) => {
      const res = await TaskService.getTaskActivities({ taskId: id });
      return res;
    },
    // DEPRECATED
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    // DEPRECATED
    company_team: async ({ team_id }, args, { loaders }) => {
      return team_id ? await loaders.companyTeams.load(team_id) : null;
    },
    // DEPRECATED
    task_board: async ({ job_id }, args, { loaders }) => {
      return await loaders.taskBoards.load(job_id);
    },
    // DEPRECATED
    due_reminder: async ({ due_date, start_date, due_reminder }) => {
      if (due_date) {
        const dueReminderDate = dayjs(due_date)
          .subtract(due_reminder, 'minute')
          .toISOString();
        return dueReminderDate;
      } else if (start_date) {
        const dueReminderDate = dayjs(start_date)
          .subtract(due_reminder, 'minute')
          .toISOString();
        return dueReminderDate;
      } else {
        return null;
      }
    },
    // DEPRECATED
    spent_effort: ({ actual_start, actual_end }) => {
      if (actual_start && actual_end) {
        return dayjs(actual_end).diff(dayjs(actual_start), 's');
      } else {
        return 0;
      }
    },
    // DEPRECATED
    timer_totals: async ({ id }) => {
      const res = await TaskService.getTaskTimerTotals({ taskId: id });
      return res;
    },
    // DEPRECATED
    time_spent: async ({ id }) => {
      let spent = 0;

      const activity = (await TimesheetService.getTimesheetActivityByTaskId(
        id,
      )) as TimesheetActivityModel;

      if (activity) {
        const timesheets = (await TimesheetService.getTimesheetsByActivityId({
          activityId: activity?.id,
        })) as TimesheetModel[];

        const total = _.reduce(
          timesheets,
          (prev, curr) => prev + curr.time_total,
          spent,
        );
        spent = total;

        return spent;
      } else {
        return 0;
      }
    },
  },
  TaskComment: {
    id: ({ id_text, idText }) => id_text || idText,
    createdBy: async ({ created_by, createdBy }, args, { loaders }) => {
      const userId = created_by || createdBy;
      return userId ? await loaders.users.load(userId) : null;
    },
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    parentTaskComment: async ({ parent_id, parentId }, args, { loaders }) => {
      const pId = parent_id || parentId;
      return pId ? await loaders.taskComments.load(pId) : null;
    },
    messageContent: async ({ message_content, messageContent }) => {
      const m = message_content || messageContent;

      const message = m
        ? typeof m !== 'string'
          ? JSON.stringify(m)
          : m
        : null;

      return message;
    },
  },
  TaskMember: {
    id: ({ id_text, idText }) => id_text || idText,
    companyMember: async ({ member_id, memberId }, args, { loaders }) => {
      const mId = member_id || memberId;
      return mId ? await loaders.companyMembers.load(mId) : null;
    },
    company_member: async ({ member_id }, args, { loaders }) =>
      member_id ? await loaders.companyMembers.load(member_id) : null,
    user: async ({ user_id, userId }, args, { loaders }) => {
      const uId = user_id || userId;
      return await loaders.users.load(uId);
    },
  },
  TaskPic: {
    id: ({ id_text, idText }) => id_text || idText,
    pic: async ({ pic_id, picId }, args, { loaders }) => {
      const pId = pic_id || picId;
      return pId ? await loaders.contactPics.load(pId) : null;
    },
    contact: async ({ contact_id, contactId }, args, { loaders }) => {
      const cId = contact_id || contactId;
      const contact = await loaders.contacts.load(cId);
      return contact;
    },
    task: async ({ card_id, cardId }, { isProject }, { loaders }) => {
      const cId = card_id || cardId;
      const task = (await TaskStore.getTaskById(cId)) as TaskModel;

      const taskBoard = (await loaders.taskBoards.load(
        task?.job_id,
      )) as TaskBoardModel;

      if (isProject && taskBoard?.category) {
        if (task.deleted_at) {
          return null;
        } else {
          return task;
        }
      } else if (!isProject && !taskBoard?.category) {
        const task = await TaskStore.getTaskById(card_id);

        if (task.deleted_at) {
          return null;
        } else {
          return task;
        }
      }
    },
  },
  Subtask: {
    id: ({ id_text, idText }) => id_text || idText,
  },
  Checklist: {
    id: ({ id_text, idText }) => id_text || idText,
  },
  TaskBoardTeam: {
    id: ({ id_text, idText }) => id_text || idText,
    tasks: async (
      { team_id, job_id, teamId, jobId },
      args,
      { loaders, auth: { user } },
    ) => {
      const tId = team_id || teamId;
      const jId = job_id || jobId;
      const taskboard = (await loaders.taskBoards.load(jId)) as TaskBoardModel;

      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: taskboard?.company_id,
        userId: user?.id,
      })) as CompanyMemberModel;

      const res = await TaskService.getTasksForTeam({
        teamId: tId,
        boardId: jId,
        memberId: member?.id,
      });

      return res;
    },
    companyTeam: async ({ teamId }, args, { loaders }) => {
      return teamId ? await loaders.companyTeams.load(teamId) : null;
    },
    // DEPRECATED
    company_team: async ({ team_id }, args, { loaders }) => {
      return team_id ? await loaders.companyTeams.load(team_id) : null;
    },
  },
  TaskActivity: {
    id: ({ id_text, idText }) => id_text || idText,
    task: async ({ card_id, cardId }, args, { loaders }) => {
      const cId = card_id || cardId;
      return await TaskStore.getTaskById(cId);
    },
    fromCardStatus: async (
      { from_card_status_id, fromCardStatusId },
      args,
      { loaders },
    ) => {
      const fId = from_card_status_id || fromCardStatusId;
      return fId ? await loaders.teamStatuses.load(fId) : null;
    },
    toCardStatus: async (
      { to_card_status_id, toCardStatusId },
      args,
      { loaders },
    ) => {
      const tId = to_card_status_id || toCardStatusId;
      return tId ? await loaders.teamStatuses.load(tId) : null;
    },
    targetMember: async (
      { target_member_id, targetMemberId },
      args,
      { loaders },
    ) => {
      const tmId = target_member_id || targetMemberId;
      return tmId ? await loaders.companyMembers.load(tmId) : null;
    },
    targetPic: async ({ target_pic_id, targetPicId }, args, { loaders }) => {
      const tpId = target_pic_id || targetPicId;
      return tpId ? await loaders.contactPics.load(tpId) : null;
    },
    createdBy: async ({ created_by, createdBy }, args, { loaders }) => {
      const cId = created_by || createdBy;
      return cId ? await loaders.users.load(cId) : null;
    },
    actionType: async ({ action_type, actionType }) => {
      let at = action_type || actionType;
      switch (action_type) {
        case 'CARD_STATUS_CHANGED':
          actionType = 'UPDATED_TEAM_STATUS';
          break;
        case 'DeleteCard':
          actionType = 'TASK_REMOVED';
          break;
        case 'UpdateCard':
          actionType = 'UPDATED_DUE_DATE';
          break;
        case 'AssignMemberToCard':
          actionType = 'PIC_ADDED';
          break;
        case 'AssignPICToCard':
          actionType = 'ASSIGNEE_ADDED';
          break;
        default:
          break;
      }
      return at;
    },
    from_card_status: async (
      { from_card_status_id, fromCardStatusId },
      args,
      { loaders },
    ) => {
      const fId = from_card_status_id || fromCardStatusId;
      return fId ? await loaders.teamStatuses.load(fId) : null;
    },
    to_card_status: async (
      { to_card_status_id, toCardStatusId },
      args,
      { loaders },
    ) => {
      const tId = to_card_status_id || toCardStatusId;
      return tId ? await loaders.teamStatuses.load(tId) : null;
    },
    target_member: async (
      { target_member_id, targetMemberId },
      args,
      { loaders },
    ) => {
      const tmId = target_member_id || targetMemberId;
      return tmId ? await loaders.companyMembers.load(tmId) : null;
    },
    target_pic: async ({ target_pic_id, targetPicId }, args, { loaders }) => {
      const tpId = target_pic_id || targetPicId;
      return tpId ? await loaders.contactPics.load(tpId) : null;
    },
    attachment: async ({ attachment_id, attachmentId }, args, { loaders }) => {
      const attId = attachment_id || attachmentId;
      return attId ? await loaders.taskAttachments.load(attId) : null;
    },
    created_by: async ({ created_by, createdBy }, args, { loaders }) => {
      const cId = created_by || createdBy;
      return cId ? await loaders.users.load(cId) : null;
    },
    action_type: async ({ action_type, actionType }) => {
      let at = action_type || actionType;
      switch (action_type) {
        case 'CARD_STATUS_CHANGED':
          actionType = 'UPDATED_TEAM_STATUS';
          break;
        case 'DeleteCard':
          actionType = 'TASK_REMOVED';
          break;
        case 'UpdateCard':
          actionType = 'UPDATED_DUE_DATE';
          break;
        case 'AssignMemberToCard':
          actionType = 'PIC_ADDED';
          break;
        case 'AssignPICToCard':
          actionType = 'ASSIGNEE_ADDED';
          break;
        default:
          break;
      }
      return at;
    },
  },
  TaskAttachment: {
    id: ({ id_text, idText }) => id_text || idText,
    createdBy: async ({ created_by, createdBy }, args, { loaders }) => {
      const cId = created_by || createdBy;
      return cId ? await loaders.users.load(cId) : null;
    },
    isDeleted: async ({ deletedAt }, args, { loaders }) => {
      return !!deletedAt;
    },
  },
  TaskTimerEntry: {
    task: async ({ task_id, taskId }, args, { loaders }) => {
      const tId = task_id || taskId;
      if (tId) {
        return await TaskStore.getTaskById(tId);
      }
    },
    company_member: async (
      { company_member_id, companyMemberId },
      args,
      { loaders },
    ) => {
      const cmId = company_member_id || companyMemberId;
      return await loaders.companyMembers.load(cmId);
    },
  },
  TaskTimerTotal: {
    company_member: async (
      { company_member_id, companyMemberId },
      args,
      { loaders },
    ) => {
      const cmId = company_member_id || companyMemberId;
      return await loaders.companyMembers.load(cmId);
    },
  },
  TaskBoardOwner: {
    board: async ({ jobId }, args, { loaders }) => {
      return await loaders.taskBoards.load(jobId);
    },
    companyMember: async ({ companyMemberId }, args, { loaders }) => {
      return await loaders.companyMembers.load(companyMemberId);
    },
  },
  TaskWatcher: {
    task: async ({ taskId }, args, { loaders }) => {
      return taskId ? await TaskStore.getTaskById(taskId) : null;
    },
    companyMember: async ({ memberId }, args, { loaders }) => {
      return memberId ? await loaders.companyMembers.load(memberId) : null;
    },
  },
  TaskBoardType: {
    INTERNAL: 'Internal',
    PERSONAL: 'Personal',
    COLLABORATION: 'Collaboration',
    ALL: 'All',
  },
  TaskBoardCategory: {
    DEFAULT: 0,
    PROJECT: 1,
  },
  TaskPriorityType: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  },
  TaskBoardStatusType: {
    PROGRESS: 1,
    DONE: 2,
    CANCELLED: 3,
  },
  TaskType: {
    TASK: 'Task',
    DOCUMENT: 'Document',
  },
  TaskActionType: {
    TASK_CREATED: 'TASK_CREATED',
    TASK_ARCHIVED: 'TASK_ARCHIVED',
    TASK_UNARCHIVED: 'TASK_UNARCHIVED',
    TASK_REMOVED: 'TASK_REMOVED',
    UPDATED_DUE_DATE: 'UPDATED_DUE_DATE',
    UPDATED_START_DATE: 'UPDATED_START_DATE',
    UPDATED_END_DATE: 'UPDATED_END_DATE',
    UPDATED_TEAM_STATUS: 'UPDATED_TEAM_STATUS',
    ASSIGNEE_ADDED: 'ASSIGNEE_ADDED',
    ASSIGNEE_REMOVED: 'ASSIGNEE_REMOVED',
    PIC_ADDED: 'PIC_ADDED',
    PIC_REMOVED: 'PIC_REMOVED',
    ATTACHMENT_UPLOADED: 'ATTACHMENT_UPLOADED',
    ATTACHMENT_REMOVED: 'ATTACHMENT_REMOVED',
  },
  TaskDueRemindersType: {
    ON_DUE: 0,
    FIVE_M: 5,
    TEN_M: 10,
    FIFTEEN_M: 15,
    ONE_HOUR: 60,
    TWO_HOUR: 120,
    ONE_DAY: 1440,
    TWO_DAY: 2880,
  },
  PersonalStatusType: {
    PENDING: 1,
    PASS: 2,
    FAIL: 3,
    CLOSED: 4,
  },
  ExternalFileSource: {
    ONE_DRIVE: 'onedrive',
    GOOGLE_DRIVE: 'gdrive',
    DROPBOX: 'dropbox',
  },
  TaskVisibilityType: {
    OWNERS: 0,
    DEFAULT: 1,
  },
  TaskSortType: {
    CREATED_AT: TaskSortType.CREATED_AT,
    DUE_DATE: TaskSortType.DUE_DATE,
    NAME: TaskSortType.NAME,
    PRIORITY: TaskSortType.PRIORITY,
    STAGE: TaskSortType.STAGE,
  },
  TaskBoardSortType: {
    CREATED_AT: TaskBoardSortType.CREATED_AT,
    NAME: TaskBoardSortType.NAME,
  },
  Upload: GraphQLUpload,
  Mutation: {
    uploadTaskAttachment: async (
      _,
      { taskId, attachment, commentId },
      { loaders, auth: { user } },
    ) => {
      const task = await getTask(taskId);

      let comment = null;

      if (commentId) {
        comment = await getTaskComment(commentId);
      }

      const res = await TaskService.createTaskAttachment({
        taskId: task.id,
        user,
        attachment,
        commentId: comment ? comment.id : null,
        companyId: user?.active_company,
      });
      if (!res) return new Error('Upload failed');

      return res;
    },

    deleteTaskAttachments: async (
      _,
      { taskAttachmentIds },
      { loaders, auth: { user } },
    ) => {
      const taskAttachments = (await loaders.taskAttachments.loadMany(
        taskAttachmentIds,
      )) as TaskAttachmentModel[];

      if (!taskAttachments)
        throw new UserInputError('Attachment does not exist');

      const taskId = taskAttachments[0].card_id; // Assuming that on delete it is always the same task

      const deleteResult = await TaskService.deleteTaskAttachment({
        taskAttachmentIds: taskAttachments.map((ta) => ta.id),
        user,
        taskId,
        loaders,
        companyId: user.activeCompany,
      });
      if (deleteResult === 1) {
        return taskAttachments;
      } else {
        throw new Error('Could not delete attachment');
      }
    },

    deleteTasks: async (_, { taskIds }, { loaders, auth: { user } }) => {
      const tasks = await getTasks(taskIds as string[]);

      if (tasks.some((t) => t === undefined))
        throw new UserInputError('One or more task board does not exist.');

      const deleteResult = await TaskService.deleteTasks({
        tasks,
        user,
        projectIds: tasks.map((t) => t.jobId),
        companyId: user?.activeCompany,
      });

      if (deleteResult !== tasks.length)
        throw new Error('Failed to delete one or more task.');

      return tasks;
    },

    deleteTaskComment: async (
      _,
      { taskCommentId },
      { loaders, auth: { user } },
    ) => {
      const taskComment = (await loaders.taskComments.load(
        taskCommentId,
      )) as TaskCommentModel;
      if (!taskComment) throw new UserInputError('Comment does not exist');

      if (user.id !== taskComment?.created_by) {
        throw new UserInputError('No permission to delete this comment');
      }
      const res = await TaskService.deleteTaskComment({
        taskCommentId: taskComment.id,
        taskId: taskComment.card_id,
      });
      if (res === 0) throw new Error('Failed to delete task comment');
      return taskComment;
    },

    //TODO: To be replaced by checklists.
    deleteSubtasks: async (_, { subtaskIds }, { loaders, auth: { user } }) => {
      const subtasks = (await loaders.subtasks.loadMany(
        subtaskIds as string[],
      )) as SubtaskModel[];
      if (subtasks.some((st) => st === undefined))
        throw new UserInputError('One or more subtask does not exist');

      const res = await TaskService.deleteSubtasks({
        subtaskIds: subtasks.map((st) => st.id),
      });

      if (res === 0) throw new Error('Delete subtasks failed');
      return subtasks;
    },
    deleteChecklists: async (
      _,
      { checklistIds },
      { loaders, auth: { user } },
    ) => {
      const subtasks = (await loaders.subtasks.loadMany(
        checklistIds as string[],
      )) as SubtaskModel[];
      if (subtasks.some((st) => st === undefined))
        throw new UserInputError('One or more subtask does not exist');

      const res = await TaskService.deleteSubtasks({
        subtaskIds: subtasks.map((st) => st.id),
      });

      if (res === 0) throw new Error('Delete subtasks failed');
      return subtasks;
    },

    createTaskBoard: async (_, { input }, { loaders, auth: { user } }) => {
      const {
        name,
        description,
        company_id,
        companyId,
        type,
        status,
        category,
        color,
        owners,
      } = input;

      const company = (await loaders.companies.load(
        company_id || companyId,
      )) as CompanyModel;
      if (!company) throw new UserInputError('Company does not exists');

      let companyMembers = null;
      if (owners) {
        companyMembers = (await loaders.companyMembers.loadMany(
          owners,
        )) as CompanyMemberModel[];

        if (companyMembers.some((member) => !member)) {
          throw new UserInputError(
            'One or more company member does not exist.',
          );
        }
      }

      const res = await TaskService.createTaskBoard({
        payload: {
          name,
          description: description as string | undefined,
          category: category as number | undefined,
          company_id: company.id,
          type,
          associate_by: 2, //TODO: Function to get associate by
          created_by: user.id,
          status,
          ...(color && { color }),
        },
        owners: companyMembers
          ? companyMembers.map((member) => member.id)
          : undefined,
      });

      return res;
    },

    createCollaborationBoard: async (
      _,
      { input },
      { loaders, auth: { user } },
    ) => {
      const {
        contactId,
        companyId,
        contact_id,
        company_id,
        description,
        type,
        status,
        category,
        name,
        owners,
        color,
      } = input;

      const company = (await loaders.companies.load(
        company_id || companyId,
      )) as CompanyModel;
      if (!company) throw new UserInputError('Company does not exists');

      const contact = (await loaders.contacts.load(
        contact_id || contactId,
      )) as ContactModel;
      if (!contact) throw new UserInputError('Contact does not exists');

      let companyMembers = null;
      if (owners) {
        companyMembers = (await loaders.companyMembers.loadMany(
          owners,
        )) as CompanyMemberModel[];

        if (companyMembers.some((member) => !member)) {
          throw new UserInputError(
            'One or more company member does not exist.',
          );
        }
      }

      const subscriptions =
        (await SubscriptionService.getActiveCompanySubscriptions(
          company.id,
        )) as CompanySubscriptionModel[];

      const hasBasicPlan = subscriptions.some(
        (subscription) => subscription?.data?.type === 1,
      );

      if (!hasBasicPlan) {
        throw new UserInputError(
          'Company does not have basic plan to create a collaboration board',
        );
      }

      const res = await TaskService.createTaskBoard({
        payload: {
          name: name || '',
          contact_id: contact.id,
          description: description as string | undefined,
          category: category as number | undefined,
          company_id: company.id,
          type,
          associate_by: 1,
          created_by: user.id,
          status,
          ...(color && { color }),
        },
        owners: companyMembers
          ? companyMembers.map((member) => member.id)
          : undefined,
      });

      return res;
    },

    createTaskBoardTeam: async (_, { input }, { loaders, auth: { user } }) => {
      const { team_id, job_id } = input;

      const team = (await loaders.companyTeams.load(
        team_id,
      )) as CompanyTeamModel;
      if (!team) throw new UserInputError('Team does not exists');

      const taskBoard = (await loaders.taskBoards.load(
        job_id,
      )) as TaskBoardModel;
      if (!taskBoard) throw new UserInputError('TaskBoard does not exists');

      const res = await TaskService.createTaskBoardTeam({
        payload: {
          team_id: team.id,
          job_id: taskBoard.id,
          created_by: user.id,
        },
      });

      if (!res) return new Error('Failed to create task board team');

      return taskBoard;
    },

    createTask: async (
      root,
      { memberIds, picIds, input },
      { loaders, auth: { user } },
    ) => {
      try {
        const {
          job_id,
          team_id,
          tagIds,
          jobId,
          parentId,
          teamId: tid,
          projectId: pid,
        } = input;

        /* TODO: FIXME:
			There's a whole bunch of optionals that need to be required (workspaceId, teamId, etc)
			but we need to make everything optional first and handle all the cases until we can 
			update all the clients to the new schema
			*/

        ('start create task');

        const projectId = job_id || jobId || pid;
        if (!projectId) {
          throw new UserInputError('No project id provided');
        }
        const teamId = team_id || tid;

        // FIXME: The weird destructuring can be removed when deprecated
        const {
          name,
          description,
          value,
          priority,
          plannedEffort: pe,
          planned_effort,
          published,
          dueDate: dd,
          due_date,
          startDate: sd,
          start_date,
          subStatusId: ssid,
          sub_status_id,
          endDate: ed,
          end_date,
          projected_cost,
          projectedCost: pc,
          visibility,
          posY,
          groupId,
          projectStatusId,
        } = input;

        const plannedEffort = pe || planned_effort;
        const dueDate = dd || due_date;
        const startDate = sd || start_date;
        const endDate = ed || end_date;
        const subStatusId = ssid || sub_status_id;
        const projectedCost = pc || projected_cost;

        const picsFilteredIds = picIds?.filter((e) => !!e) as
          | string[]
          | undefined;
        const pics = await getContactPics(picsFilteredIds || []);

        /* --- END ugly optionals logic --- */

        if (startDate && !endDate) {
          throw new UserInputError('Start date should also have an end date');
        } else if (!startDate && endDate) {
          throw new UserInputError('End date should also have a start date');
        }

        const project = await getProject(projectId);

        let team;

        if (teamId) {
          team = await getCompanyTeam(teamId);
        }

        const tags = tagIds ? await getTags(tagIds) : undefined;

        let taskStatus = null;
        if (subStatusId) {
          taskStatus = await getCompanyTeamStatus(subStatusId);
        }

        let parentTask = null;
        if (parentId) {
          parentTask = await getTask(parentId);
        }

        let groupPrivateId = null;
        if (groupId && !groupId.includes('DEFAULT_GROUP')) {
          const group = await getProjectGroup(groupId);
          groupPrivateId = group?.id;
        } else if (parentTask && parentTask?.groupId) {
          groupPrivateId = parentTask.groupId;
        }

        let projectStatusPrivateId;
        if (projectStatusId) {
          const projectStatus = await getProjectStatus(projectStatusId);
          projectStatusPrivateId = projectStatus?.id;
        }

        const body = {
          user,
          name,
          project,
          loaders,
          taskStatus,
          ...(typeof published === 'boolean' && { published }),
          ...(description && { description }),
          ...(pics && { pics }),
          ...(memberIds && { memberPublicIds: memberIds }),
          ...(team && { teamId: team.id }),
          ...(tags && { tags }),
          ...(value && { value }),
          ...(priority && { priority }),
          ...(plannedEffort && { plannedEffort }),
          ...(dueDate && { dueDate }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(projectedCost && { projectedCost }),
          ...(visibility && { visibility }),
          ...(posY && { posY }),
          ...(parentTask && { parentId: parentTask.id }),
          ...(groupPrivateId && { groupId: groupPrivateId }),
          ...(projectStatusPrivateId && { statusId: projectStatusPrivateId }),
        };

        const res = await TaskService.createTask(body, user.activeCompany);

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createPersonalTask: async (
      _,
      { memberIds, input, creatorMemberId },
      { loaders, auth: { user } },
    ) => {
      const { job_id, jobId } = input;

      let memberId;
      if (creatorMemberId) {
        //For creating default permission
        const member = (await loaders.companyMembers.load(
          creatorMemberId,
        )) as CompanyMemberModel;

        if (!member) {
          throw new UserInputError('Member does not exist');
        }
        memberId = member.id;
      }
      const taskBoard = (await loaders.taskBoards.load(
        job_id || jobId,
      )) as TaskBoardModel;

      if (!taskBoard) throw new UserInputError('Task Board does not exist');

      const name = input?.name;
      const description = input?.description;
      const status = input?.status;
      const stageStatus = input?.stageStatus;
      const value = input?.value;
      const priority = input?.priority;
      const dueDate = input?.due_date || input?.dueDate;
      const startDate = input?.start_date || input?.startDate;
      const endDate = input?.end_date || input?.endDate;

      // NOTE: if personal task -- stageStatus is the one
      // if team task -- incoming is subStatusId
      // ...(visibility && { visibility }),
      // FIXME: Switch this to the new createTask
      const res = await TaskService.createTaskLegacy({
        loaders,
        user,
        payload: {
          name,
          ...(description && { description }),
          ...((status && { status: +status }) ||
            (stageStatus && { status: +stageStatus })),
          ...(value && { value }),
          ...(dueDate && { dueDate }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          createdBy: user.id,
          priority,
          jobId: taskBoard.id,
        },
        memberIds: memberIds as string[],
        creatorMemberId: memberId,
      });

      return res;
    },
    updateTask: async (_, { input, taskId }, { loaders, auth: { user } }) => {
      const {
        name,
        description,
        sequence,
        priority,
        dueDate: dd,
        due_date,
        dueReminder: dr,
        due_reminder,
        plannedEffort: pe,
        planned_effort,
        startDate: sd,
        start_date,
        endDate: ed,
        end_date,
        projected_cost,
        projectedCost: pc,
        visibility,
        published,
        subStatusId: ssid,
        sub_status_id,
        projectStatusId,
        actualStart,
        actualEnd,
        actualEffort,
        actualValue,
      } = input;

      // FIXME: The weird destructuring can be removed when deprecated
      const dueDate = dd || due_date;
      const dueReminder = dr || due_reminder;
      const plannedEffort = pe || planned_effort;
      const actualStartDate =
        actualStart || (input.hasOwnProperty('actualStart') ? null : undefined);
      const actualEndDate =
        actualEnd || (input.hasOwnProperty('actualEnd') ? null : undefined);

      const startDate =
        sd ||
        start_date ||
        (input.hasOwnProperty('startDate') || input.hasOwnProperty('start_date')
          ? null
          : undefined);

      const endDate =
        ed ||
        end_date ||
        (input.hasOwnProperty('endDate') || input.hasOwnProperty('end_date')
          ? null
          : undefined);
      const subStatusId = ssid || sub_status_id;
      const projectedCost = pc || projected_cost;

      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      if (!task) throw new UserInputError('Task does not exist.');

      let companyTeamStatus = null;
      if (subStatusId) {
        const teamStatus = (await loaders.teamStatuses.load(
          subStatusId,
        )) as CompanyTeamStatusModel;

        if (!teamStatus) {
          throw new UserInputError('Status does not exist');
        }

        companyTeamStatus = teamStatus;
      }

      let privateTeamId;
      if (input?.team_id || input?.teamId) {
        const team = (await loaders.companyTeams.load(
          input?.team_id || input?.teamId,
        )) as CompanyTeamModel;

        if (!team) {
          throw new UserInputError('Team does not exist');
        }

        privateTeamId = team.id;
      }

      let projectStatusPrivateId;
      if (projectStatusId) {
        const projectStatus = await getProjectStatus(projectStatusId);
        projectStatusPrivateId = projectStatus?.id;
      }

      /* --- END ugly optionals logic --- */

      const res = await TaskService.updateTask({
        task,
        loaders,
        payload: {
          ...(name && { name }),
          ...(description && { description }),
          ...(dueDate && { dueDate }),
          ...(priority && { priority }),
          ...(plannedEffort && { plannedEffort }),
          ...(projectedCost && { projectedCost }),
          ...((startDate || startDate === null) && { startDate }),
          ...((endDate || endDate === null) && { endDate }),
          ...(dueReminder && { dueReminder }),
          ...(visibility && { visibility }),
          ...(typeof published === 'boolean' && { published }),
          ...((actualStartDate || actualStartDate === null) && {
            actualStart: actualStartDate,
          }),
          ...((actualEndDate || actualEndDate === null) && {
            actualEnd: actualEndDate,
          }),
          ...(actualEffort &&
            typeof actualEffort === 'number' && { actualEffort }),
          ...(actualValue &&
            typeof actualValue === 'number' && { actualValue }),
          sequence,
          teamId: privateTeamId,
          updatedBy: user.id,
          subStatusId: companyTeamStatus?.id,
          status: companyTeamStatus?.stage,
          ...(projectStatusPrivateId && { statusId: projectStatusPrivateId }),
        },
        updatedBy: user,
        companyTeamStatus: companyTeamStatus as TaskStatusModel,
      });

      if (!res) {
        throw new Error('Failed to update task');
      }

      return res;
    },
    updatePersonalTask: async (
      _,
      { input, taskId },
      { loaders, auth: { user } },
    ) => {
      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      if (!task) {
        throw new UserInputError('Task does not exist.');
      }

      const {
        name,
        description,
        sequence,
        dueDate: dd,
        due_date,
        dueReminder: dr,
        due_reminder,
        startDate: sd,
        start_date,
        endDate: ed,
        end_date,
        status: s,
        stageStatus,
      } = input;

      // FIXME: The weird destructuring can be removed when deprecated

      const dueDate = dd || due_date;
      const dueReminder = dr || due_reminder;
      const startDate = sd || start_date;
      const endDate = ed || end_date;
      const status = s || stageStatus;

      /* --- END ugly optionals logic --- */

      const res = await TaskService.updateTask({
        task,
        loaders,
        payload: {
          ...(name && { name }),
          ...(description && { description }),
          ...(dueDate && { dueDate }),
          ...(sequence && { sequence }),
          ...(dueReminder && { dueReminder: +dueReminder }),
          ...(status && { status: +status }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          updatedBy: user?.id,
        },
        updatedBy: user,
      });

      if (!res) new Error('Failed to update personal task');

      return res;
    },

    // TODO: Deprecated, old subtask is now a checklist, new subtask is just another task.
    updateSubtask: async (
      _,
      { input, subtaskId },
      { loaders, auth: { user } },
    ) => {
      const { title, checked } = input;

      const subtask = (await loaders.subtasks.load(subtaskId)) as SubtaskModel;
      if (!subtask) throw new UserInputError('Subtask does not exist.');

      const res = await TaskService.updateSubtask({
        subtaskId: subtask.id,
        payload: {
          ...(title && { title }),
          updated_by: user.id,
          checked: checked ? 1 : 0,
        },
      });

      if (!res) new Error('Failed to update subtask');

      return res;
    },
    updateChecklist: async (
      _,
      { input, checklistId },
      { loaders, auth: { user } },
    ) => {
      const { title, checked } = input;

      const checklist = (await loaders.subtasks.load(
        checklistId,
      )) as ChecklistModel;
      if (!checklist) throw new UserInputError('Checklist does not exist.');

      const res = await TaskService.updateSubtask({
        subtaskId: checklist.id,
        payload: {
          ...(title && { title }),
          updated_by: user.id,
          checked: checked ? 1 : 0,
        },
      });

      if (!res) new Error('Failed to update subtask');

      return res;
    },

    updateTaskComment: async (
      _,
      { input, taskCommentId },
      { loaders, auth: { user } },
    ) => {
      const { message, messageContent } = input;

      const taskComment = (await loaders.taskComments.load(
        taskCommentId,
      )) as TaskCommentModel;
      if (!taskComment)
        throw new UserInputError('Task Comment does not exist.');

      const res = await TaskService.updateTaskComment({
        taskCommentId: taskComment.id,
        payload: {
          ...(message && { message }),
          ...(messageContent && { messageContent }),
          updatedBy: user.id,
        },
        taskId: taskComment.card_id,
      });

      if (!res) new Error('Failed to update subtask');

      return taskComment;
    },

    updateTaskBoard: async (_, { input, id }, { loaders, auth: { user } }) => {
      const taskBoard = await getTaskBoard(id);

      const { owners, ...restInput } = input;

      let companyMembers = null;
      if (owners) {
        companyMembers = await getCompanyMembers(owners);

        if (companyMembers.some((member) => !member)) {
          throw new UserInputError(
            'One or more company member does not exist.',
          );
        }
      }

      const payload = { ...restInput, updated_by: user.id };

      const {
        updated_by,
        category,
        color,
        description,
        name,
        published,
        type,
      } = payload;

      const res = await TaskService.updateTaskBoard({
        id: taskBoard.id,
        payload: {
          ...(updated_by && { updated_by }),
          ...(category && { category }),
          ...(color && { color }),
          ...(description && { description }),
          ...(name && { name }),
          ...(typeof published === 'boolean' && { published }),
          ...(type && { type }),
        },
        owners: companyMembers
          ? companyMembers.map((member) => member.id)
          : undefined,
      });

      return res;
    },

    deleteTaskBoards: async (_, { ids }, { loaders, auth: { user } }) => {
      const taskBoards = (await loaders.taskBoards.loadMany(
        ids as string[],
      )) as TaskBoardModel[];

      if (taskBoards.some((tb) => tb === undefined))
        throw new UserInputError('One or more task board does not exist.');

      const taskBoardsIds = taskBoards.map((tb) => tb.id);

      const deleteResult = await TaskService.deleteTaskBoards({
        ids: taskBoardsIds,
        userId: user.id,
        companyId: user.activeCompany,
      });

      if (deleteResult !== taskBoardsIds.length)
        throw new Error('Failed to delete one or more task board.');

      return taskBoards;
    },

    assignTaskPics: async (
      root,
      { taskId, input },
      { loaders, auth: { user } },
    ) => {
      const { pic_ids } = input;

      const picIds = pic_ids || input?.picIds;

      if (_.isEmpty(picIds)) {
        throw new UserInputError('PIC id(s) is empty');
      }

      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      if (!task) throw new UserInputError('Task does not exist.');

      const pics = (await loaders.contactPics.loadMany(
        picIds as string[],
      )) as ContactPicModel[];

      const picsPayloads = pics.map((pic) => {
        return {
          pic_id: pic.id,
          user_id: pic.user_id,
          contact_id: pic.contact_id,
        };
      });

      if (pics.some((p) => p === undefined))
        throw new UserInputError('One or more PICs does not exist.');

      const res = await TaskService.addTaskPics({
        task,
        payload: { pics: picsPayloads },
        user,
        loaders,
      });

      return res;
    },

    assignTaskMembers: async (
      _,
      { taskId, input },
      { loaders, auth: { user } },
    ) => {
      const { company_member_ids } = input;

      const task = await getTask(taskId);

      const companyMembers = (await loaders.companyMembers.loadMany(
        (company_member_ids || input?.companyMemberIds) as string[],
      )) as CompanyMemberModel[];

      const members = companyMembers.map((mem) => {
        return { id: mem.id, user_id: mem.user_id };
      });

      if (companyMembers.some((cm) => cm === undefined)) {
        throw new UserInputError('One or more company member does not exist');
      }

      const res = await TaskService.addTaskMembers({
        user,
        task,
        payload: { members },
      });

      return res;
    },

    deleteTaskPics: async (
      _,
      { taskId, input },
      { loaders, auth: { user } },
    ) => {
      const { pic_ids } = input;

      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      if (!task) throw new UserInputError('Task does not exist');

      const pics = (await loaders.contactPics.loadMany(
        pic_ids as string[],
      )) as ContactPicModel[];

      if (pics.some((p) => p === undefined))
        throw new UserInputError('One or more PIC does not exist');

      const taskPics = await TaskService.getTaskPicsByTaskIdAndPicId({
        taskId: task.id,
        pics,
      });

      const deleteResult = await TaskService.deleteTaskPics({
        task,
        pics,
        user,
      });

      if (deleteResult === pics.length) {
        return taskPics;
      } else {
        throw new Error('Could not delete task PIC');
      }
    },
    removeTaskPics: async (_, { input }, { loaders, auth: { user } }) => {
      const { picIds, taskId } = input;

      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      if (!task) throw new UserInputError('Task does not exist');

      const pics = (await loaders.contactPics.loadMany(
        picIds as string[],
      )) as ContactPicModel[];

      const taskPics = (await TaskService.getTaskPicsByTaskIdAndPicId({
        taskId: task.id,
        pics,
      })) as TaskPicModel[];

      const deleteResult = await TaskService.removeTaskPics({
        task,
        taskPics,
        user,
      });

      if (deleteResult === pics.length) {
        return taskPics;
      } else {
        throw new Error('Could not delete task PIC');
      }
    },
    deleteTaskMembers: async (
      _,
      { taskId, input },
      { loaders, auth: { user } },
    ) => {
      const { company_member_ids } = input;

      const task = await getTask(taskId);

      const companyMembers = (await loaders.companyMembers.loadMany(
        (company_member_ids || input?.companyMemberIds) as string[],
      )) as CompanyMemberModel[];

      if (companyMembers.some((cm) => cm === undefined))
        throw new UserInputError('One or more company members does not exist');

      const taskMembers = await TaskService.getTaskMembersByTaskIdAndMemberId({
        taskId: task.id,
        memberIds: companyMembers.map((mem) => {
          return mem.id;
        }),
      });

      //WIP add checking if the member is already not in the group

      const deleteResult = await TaskService.deleteTaskMembers({
        user,
        task,
        members: companyMembers,
      });

      if (deleteResult === companyMembers.length) {
        return taskMembers;
      } else {
        throw new Error('Could not delete a task member');
      }
    },
    deleteTaskBoardTeams: async (
      _,
      { ids, isV3 },
      { loaders, auth: { user } },
    ) => {
      const taskBoardTeams = (await loaders.taskBoardTeams.loadMany(
        ids as string[],
      )) as TaskBoardTeamModel[];

      if (taskBoardTeams.some((tbt) => tbt === undefined))
        throw new UserInputError('One or more task board team does not exist');

      const deleteResult = await TaskService.deleteTaskBoardTeams({
        taskBoardTeams,
        isV3: isV3 || true,
      });

      if (deleteResult !== taskBoardTeams.length)
        throw new Error('Failed to delete one or more task board team');

      return taskBoardTeams;
    },
    // TODO: Deprecated, "subtask" is now called "checklist", and new subtask is just another task.
    createSubtask: async (
      _,
      { taskId, input },
      { loaders, auth: { user } },
    ) => {
      const { title } = input;

      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      if (!task) throw new UserInputError('Task does not exist.');

      const res = await TaskService.addSubtask({
        payload: {
          title,
          card_id: task.id,
          created_by: user.id,
        },
      });

      return res;
    },
    createChecklist: async (
      _,
      { taskId, input },
      { loaders, auth: { user } },
    ) => {
      const { title } = input;

      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      if (!task) throw new UserInputError('Task does not exist.');

      const res = await TaskService.addSubtask({
        payload: {
          title,
          card_id: task.id,
          created_by: user.id,
        },
      });

      return res;
    },
    postTaskComment: async (_, { input }, { loaders, auth: { user } }) => {
      const { messageContent, parentId, taskId } = input;
      const task = (await getTask(taskId)) as TaskModel;
      const project = (await loaders.taskBoards.load(
        task.jobId,
      )) as ProjectModel;

      let parentPrivateId;

      if (parentId) {
        const comment = (await loaders.taskComments.load(
          parentId,
        )) as TaskCommentModel;
        if (!comment) {
          throw new UserInputError('Parent ID is not valid');
        }
        parentPrivateId = comment?.id;
      }

      const res = await TaskService.postTaskComment({
        payload: {
          taskId: task.id,
          userId: user.id,
          messageContent,
          parentId: parentPrivateId,
          companyId: project.companyId,
        },
      });

      return res;
    },
    editTaskComment: async (_, { input }, { loaders, auth: { user } }) => {
      const { messageContent, mentionIds, commentId } = input;
      const taskComment = await getTaskComment(commentId);

      const publicMentionIds =
        (mentionIds && mentionIds.filter((id) => typeof id === 'string')) || [];

      const res = await TaskService.editTaskComment({
        commentId: taskComment.id,
        messageContent,
        mentionIds: publicMentionIds,
      });

      return res;
    },
    archiveTasks: async (_, { input }, { loaders, auth: { user } }) => {
      const { task_ids } = input;

      const tasks = (await loaders.tasks.loadMany(
        task_ids as string[],
      )) as TaskModel[];

      const res = await TaskService.archiveTasks({
        tasks,
        createdBy: user,
      });

      if (res.length == tasks.length) {
        return res;
      } else {
        throw new Error('Could not archive a task');
      }
    },
    unarchiveTasks: async (_, { input }, { loaders, auth: { user } }) => {
      const { task_ids } = input;

      const tasks = (await loaders.tasks.loadMany(task_ids)) as TaskModel[];

      const res = await TaskService.unarchiveTasks({
        tasks,
        createdBy: user,
      });

      if (res.length == tasks.length) {
        return res;
      } else {
        throw new Error('Could not unarchive a task');
      }
    },

    updateTasksSequence: async (_, { input: inputs }, { auth: { user } }) => {
      const sequencesInput = inputs
        .map((input) => {
          if (input) {
            const { task_id, sequence } = input;
            return { task_id: task_id as string, sequence: sequence as number };
          }
        })
        .filter((input) => input !== undefined) as {
        task_id: string;
        sequence: number;
      }[];
      const res = await TaskService.updateTasksSequence({
        payload: sequencesInput,
      });

      return res;
    },
    startTaskTimer: async (
      root,
      { taskId, companyMemberId },
      { loaders, auth: { user } },
    ) => {
      try {
        const member = await loaders.companyMembers.load(companyMemberId);
        if (!member) {
          throw new UserInputError('That member does not exist');
        }

        const company = await loaders.companies.load(member.company_id);
        if (!company) {
          throw new UserInputError('That company does not exist');
        }

        const task = await loaders.tasks.load(taskId);
        if (!task) {
          throw new UserInputError('That task does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!isValid) {
          throw new AuthenticationError('User does not belong to the company');
        }

        const res = await TaskService.startTaskTimer({
          taskId: task.id,
          companyMemberId: member.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    stopTaskTimer: async (
      root,
      { taskId, companyMemberId },
      { loaders, auth: { user } },
    ) => {
      try {
        const member = await loaders.companyMembers.load(companyMemberId);
        if (!member) {
          throw new UserInputError('That member does not exist');
        }

        const company = await loaders.companies.load(member.company_id);
        if (!company) {
          throw new UserInputError('That company does not exist');
        }

        const task = await loaders.tasks.load(taskId);
        if (!task) {
          throw new UserInputError('That task does not exist');
        }

        const isValid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!isValid) {
          throw new AuthenticationError('User does not belong to the company');
        }

        const res = await TaskService.stopTaskTimer({
          taskId: task.id,
          companyMemberId: member.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    //TODO: Deprecate, replaced with duplicateTasks
    copyTask: async (root, { input }, { auth: { user } }) => {
      try {
        const {
          companyId,
          taskBoardId,
          companyTeamId,
          copySubtasks,
          copyAttachments,
        } = input;
        const company = await getCompany(companyId);
        const taskBoard = await getTaskBoard(taskBoardId);
        const task = await getTask(input.taskId);

        let team = null;
        if (companyTeamId) {
          team = await getCompanyTeam(companyTeamId);
        }

        const res = await TaskService.copyTask({
          taskId: task.id,
          taskBoardId: taskBoard.id,
          companyId: company.id,
          user,
          companyTeamId: team ? team.id : null,
          copyChecklists: copySubtasks,
          copyAttachments,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    //TODO: Deprecate, replaced with duplicateTasks
    copyTasks: async (root, { input }, { auth: { user } }) => {
      try {
        const {
          companyId,
          taskBoardId,
          companyTeamId,
          copySubtasks,
          copyAttachments,
          taskIds,
        } = input;
        const company = await getCompany(companyId);
        const taskBoard = await getTaskBoard(taskBoardId);
        const tasks = await Promise.all(
          _.map(taskIds, async (taskId) => {
            return await getTask(taskId);
          }),
        );

        const taskPrivateIds = tasks.map((task) => task.id);

        let team = null;
        if (companyTeamId) {
          team = await getCompanyTeam(companyTeamId);
        }

        const res = await TaskService.copyTasks({
          taskIds: taskPrivateIds,
          taskBoardId: taskBoard.id,
          companyId: company.id,
          user,
          companyTeamId: team ? team.id : null,
          copyChecklists: copySubtasks,
          copyAttachments,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    duplicateTasks: async (root, { input }, { auth: { user } }) => {
      try {
        const { taskIds, projectGroupId, projectId, parentId } = input;

        if (!user.activeCompany) {
          throw new Error('User does not belong to a company');
        }

        const tasks = await getTasks(taskIds);
        let projectGroupPrivateId;
        let projectPrivateId;

        if (projectGroupId && !projectGroupId.includes('DEFAULT_GROUP')) {
          const projectGroup = await getProjectGroup(projectGroupId);
          projectGroupPrivateId = projectGroup.id;
          projectPrivateId = projectGroup.projectId;
        } else if (
          projectGroupId &&
          projectGroupId.includes('DEFAULT_GROUP') &&
          projectId
        ) {
          projectPrivateId = (await getProject(projectId)).id;
        }

        const taskPrivateIds = tasks.map((task) => task.id);
        let parentPrivateId;
        if (parentId) {
          const parentTask = await getTask(parentId);
          parentPrivateId = parentTask.id;
        }

        const res = await TaskService.copyTasks({
          taskIds: taskPrivateIds,
          taskBoardId: projectPrivateId as number,
          companyId: user.activeCompany,
          user,
          companyTeamId: null,
          copyChecklists: true,
          copyAttachments: true,
          ...(projectGroupPrivateId && {
            projectGroupId: projectGroupPrivateId,
          }),
          ...(parentPrivateId && { parentId: parentPrivateId }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateTaskBoardsArchivedState: async (
      root,
      { input },
      { loaders, auth: { user } },
    ) => {
      try {
        const { boardIds, archived } = input;

        const taskBoards = (await loaders.taskBoards.loadMany(
          boardIds,
        )) as TaskBoardModel[];
        if (taskBoards.some((board) => !board)) {
          throw new UserInputError('One or more task board does not exist.');
        }

        const res = await TaskService.updateTaskBoardsArchivedState({
          boardIds: taskBoards.map((board) => board.id),
          archived,
          updatedBy: user?.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    linkAttachmentToComment: async (root, { input }, { auth: { user } }) => {
      try {
        const { attachmentId, commentId } = input;

        const attachment = await getTaskAttachment(attachmentId);
        const comment = await getTaskComment(commentId);

        if (comment.user_id !== user.id) {
          throw new AuthenticationError('User does not own comment');
        }

        const res = await TaskService.linkAttachmentToComment({
          attachmentId: attachment.id,
          commentId: comment.id,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    unlinkAttachmentFromComment: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { attachmentId, commentId } = input;

        const attachment = await getTaskAttachment(attachmentId);
        const comment = await getTaskComment(commentId);

        if (comment.user_id !== user.id) {
          throw new AuthenticationError('User does not own comment');
        }

        const res = await TaskService.unlinkAttachmentFromComment({
          attachmentId: attachment.id,
          commentId: comment.id,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    //@ts-ignore
    updateSubtaskSequences: async (root, { input }, { auth: { user } }) => {
      try {
        //FIXME: Why
        const payload =
          input &&
          (await Promise.all(
            _.map(input, async (inputPayload) => {
              const subtask = await getSubtask(
                inputPayload?.subtaskId as string,
              );

              return {
                subtaskId: subtask.id,
                sequence: inputPayload?.sequence as number,
              };
            }),
          ));

        if (payload) {
          const res = await TaskService.updateSubtaskSequences(payload);

          return res;
        }
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    //@ts-ignore
    toggleTasksPinned: async (root, { taskIds }, { auth: { user } }) => {
      try {
        const tasks = await getTasks(taskIds);
        const privateTaskIds = tasks.map((task) => task.id);

        const res = await TaskService.toggleTasksPinned({
          taskIds: privateTaskIds,
          userId: user?.id,
        });
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    linkExternalAttachments: async (root, { input }, { auth: { user } }) => {
      try {
        const task = await getTask(input.taskId);

        const res = await TaskService.linkExternalAttachments({
          taskId: task.id,
          externalAttachments: input.externalAttachments,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    //@ts-ignore
    toggleTasksPublishStatus: async (root, { taskIds }, { auth: { user } }) => {
      try {
        const tasks = await getTasks(taskIds);
        const privateTaskIds = tasks.map((task) => task.id);

        const res = await TaskService.toggleTasksPublishStatus({
          taskIds: privateTaskIds,
          userId: user?.id,
        });
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    //@ts-ignore
    addTaskWatchers: async (root, { input }, { auth: { user } }) => {
      try {
        const { taskId, memberIds } = input;

        const task = await getTask(taskId);

        const uniqMemberIds = _.uniq(memberIds) as string[];

        const members = await getCompanyMembers(uniqMemberIds);

        const memberPrivateIds = members.map((member) => member?.id);

        const res = await TaskService.addTaskWatchers({
          taskId: task?.id,
          memberIds: memberPrivateIds,
          addedBy: user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    //@ts-ignore
    removeTaskWatchers: async (root, { input }, { auth: { user } }) => {
      try {
        const { taskId, memberIds } = input;
        const task = await getTask(taskId);
        const uniqMemberIds = _.uniq(memberIds) as string[];
        const members = await getCompanyMembers(uniqMemberIds);
        const memberPrivateIds = members.map((member) => member?.id);

        const res = await TaskService.removeTaskWatchers({
          taskId: task?.id,
          memberIds: memberPrivateIds,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    changeTaskPosition: async (root, { input }, { auth: { user } }) => {
      try {
        const { taskId, posY, projectStatusId } = input;
        const task = await getTask(taskId);

        let projectStatusPrivateId;
        if (projectStatusId) {
          const projectStatus = await getProjectStatus(projectStatusId);
          projectStatusPrivateId = projectStatus?.id;
        }
        const res = await TaskService.changeTaskPosition({
          taskId: task?.id,
          posY,
          ...(projectStatusPrivateId && {
            projectStatusId: projectStatusPrivateId,
          }),
          projectId: task?.jobId,
        });
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    changeGroupTasks: async (root, { input }, { auth: { user } }) => {
      try {
        const { taskIds, groupId } = input;
        const group = await getProjectGroup(groupId);
        const tasks = await getTasks(taskIds);

        const taskPrivateIds = tasks.map((task) => task.id);

        const res = await TaskService.moveGroupTasks({
          taskIds: taskPrivateIds,
          groupId: group.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    importTasks: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectId, groupId } = input;

        const project = await getProject(projectId);

        let group = null;
        if (groupId) {
          group = await getProjectGroup(groupId);
        }

        if (user.activeCompany !== project.companyId) {
          throw new AuthenticationError('Project is not in the company');
        }

        const attachment = await input.attachment;

        const extension = path.extname(attachment.filename);
        if (extension !== '.csv') {
          throw new Error('file extension is not csv');
        }

        if (group === null) {
          const unassignedGroup =
            await WorkspaceStore.getUnassignedGroupByProjectId(project?.id);

          if (unassignedGroup) {
            group = unassignedGroup;
          }
        }

        const res = await TaskService.importTasks({
          projectId: project.id,
          groupId: group ? group.id : null,
          attachment,
          user,
          companyId: user.activeCompany,
        });

        return {
          imported: res.imported,
          failed: res.failed,
          tasks: res.tasks,
        };
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateTaskParent: async (root, { input }, { auth: { user } }) => {
      try {
        const { childTaskId, destinationParentId } = input;
        const childTask = await getTask(childTaskId);
        const destinationTask = await getTask(destinationParentId);

        // TODO: Needs validation of being in company

        const res = await TaskService.updateTaskParent({
          childId: childTask.id,
          sourceParentId: childTask.parentId,
          destinationParentId: destinationTask.id,
          user,
        });

        const response = {
          sourceTask: _.find(res, { id: childTask.parentId }),
          destinationTask: _.find(res, { id: destinationTask.id }),
        };

        return response;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    addToTaskVisibilityWhitelist: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { taskId, memberIds, teamIds } = input;
        const task = await getTask(taskId);

        let members: CompanyMemberModel[] = [];
        let teams: CompanyTeamModel[] = [];

        if (memberIds) {
          members = await getCompanyMembers(memberIds);
        }

        if (teamIds) {
          teams = await getCompanyTeams(teamIds);
        }

        const res = await TaskService.addToTaskVisibilityWhitelist({
          taskId: task.id,
          ...(members.length > 0 && { memberIds: members.map((m) => m.id) }),
          ...(teams.length > 0 && { teamIds: teams.map((t) => t.id) }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    removeFromTaskVisibilityWhitelist: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { taskId, memberIds, teamIds } = input;
        const task = await getTask(taskId);

        let members: CompanyMemberModel[] = [];
        let teams: CompanyTeamModel[] = [];

        if (memberIds) {
          members = await getCompanyMembers(memberIds);
        }

        if (teamIds) {
          teams = await getCompanyTeams(teamIds);
        }

        const res = await TaskService.removeFromTaskVisibilityWhitelist({
          taskId: task.id,
          ...(members.length > 0 && { memberIds: members.map((m) => m.id) }),
          ...(teams.length > 0 && { teamIds: teams.map((t) => t.id) }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    setTaskVisibility: async (root, { input }, { auth: { user } }) => {
      try {
        const { visibility, taskId } = input;
        if (!user.activeCompany) {
          throw new UserInputError('No active company selected');
        }

        const task = await getTask(taskId);

        const res = await TaskService.setTaskVisibility({
          taskId: task.id,
          ...(user?.activeCompany && { companyId: user?.activeCompany }),
          user,
          visibility: +visibility || 4,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
  },
};
