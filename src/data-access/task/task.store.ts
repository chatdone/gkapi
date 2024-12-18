/* eslint-disable prefer-const */
import knex from '@db/knex';
import _ from 'lodash';

import {
  CompanyId,
  CompanyMemberId,
  CompanyTeamId,
} from '@models/company.model';
import {
  SubtaskModel,
  TaskAttachmentId,
  TaskAttachmentModel,
  TaskBoardId,
  TaskBoardModel,
  TaskCommentModel,
  AffectedRowsResult,
  TaskId,
  TaskMemberModel,
  TaskModel,
  TaskPicModel,
  TaskCreatePicPayload,
  SubtaskPayload,
  TaskCreatePayload,
  TaskBoardTeamModel,
  AttachmentPayload,
  TaskCommentId,
  SubtaskId,
  TaskBoardPayload,
  TaskUpdatePayload,
  TaskBoardUpdatePayload,
  TaskBoardTeamId,
  TaskBoardTeamPayload,
  TaskActivityModel,
  TaskCreateMemberPayload,
  TasksSequenceUpdatePayload,
  TaskActivityPayload,
  SubtaskUpdatePayload,
  TaskCommentUpdatePayload,
  TaskAttachmentPublicId,
  TaskStatusId,
  TaskStatusModel,
  TaskTimerEntryModel,
  TaskTimerTotalModel,
  TaskBoardOwnerModel,
  TaskPicPublicId,
  ExternalAttachmentModel,
  TaskFilter,
  TaskBoardFilter,
  TaskSort,
  TaskWatcherModel,
  ProjectId,
  TaskKanbanPosition,
  ProjectGroupId,
  ProjectStatusId,
  ProjectModel,
} from '@models/task.model';
import { ContactId, ContactPicId } from '@models/contact.model';
import { UserId } from '@models/user.model';
import { TeamId } from '@models/team.model';
import { TimesheetId } from '@models/timesheet.model';
import { camelize } from '../utils';
import { TemplateId } from '@models/template.model';
import { TableNames } from '@db-tables';

import TaskBoardStoreFunctions from './task-board.store';
import { TaskBoardSortType, TaskSortType } from '@constants';
import logger from '@tools/logger';
import { getInsertedIds } from '@db/utils';
import { WorkspaceStore } from '@data-access';
import { TaskService, UserService, WorkspaceService } from '@services';
import { CommonVisibilityModel } from '@models/common.model';
import { redis } from '@data-access';
import dayjs from 'dayjs';

type TaskStoreCreateTaskInput = {
  name: string;
  createdBy: UserId;
  projectId: ProjectId;
  sequence: number;
  completed: boolean;

  teamId?: TeamId;
  description?: string;
  taskStatusId?: TaskStatusId;
  dueDate?: string;
  stageType?: number;
  value?: number;
  startDate?: string;
  endDate?: string;
  plannedEffort?: number;
  projectedCost?: number;
  priority?: number;
  visibility?: number;

  published?: boolean;
  actualStart?: string;
  actualEnd?: string;
  groupId?: ProjectGroupId;
  parentId?: TaskId;
  type?: string;
  statusId?: ProjectStatusId;
  archived?: boolean;
  posY?: number;
  companyId: CompanyId;
};

type ImportTasksInput = {
  projectId: ProjectId;
  groupId: ProjectGroupId | null;
  userId: UserId;
  tasks: {
    name: string;
    description: string;
    dueDate?: string;
  }[];
};

type ImportTaskMembersInput = {
  taskId: TaskId;
  memberId: CompanyMemberId;
  userId: UserId;
}[];

type UpdateTaskParentInput = {
  childId: TaskId;
  destinationParentId: TaskId;
  sourceParentId: TaskId;
  userId: UserId;
};

const DEFAULT_LOCAL_TIME = process.env.LOCAL_TIMEZONE
  ? process.env.LOCAL_TIMEZONE
  : 'Asia/Kuala_Lumpur';

//DEPRECATED SOON 2022-05-06
const getByCompanyId = async ({
  taskType,
  payload,
}: {
  taskType: string;
  payload: { company_id: CompanyId; category?: number };
}): Promise<(TaskBoardModel | Error)[]> => {
  try {
    let res;

    if (typeof payload?.category === 'number') {
      if (taskType === 'Collaboration') {
        res = await knex
          .from(TableNames.TASK_BOARDS)
          .whereIn('type', [taskType, 'Company'])
          .where({
            ...payload,
          })
          .whereNull('deleted_at')

          .select();
      } else if (taskType === 'All') {
        res = await knex
          .from(TableNames.TASK_BOARDS)
          .where({
            ...payload,
          })
          .whereNull('deleted_at')

          .select();
      } else {
        res = await knex
          .from(TableNames.TASK_BOARDS)
          .where({
            ...payload,
            type: taskType,
          })
          .whereNull('deleted_at')

          .select();
      }
    } else {
      if (taskType === 'Collaboration') {
        res = await knex
          .from(TableNames.TASK_BOARDS)
          .whereIn('type', [taskType, 'Company'])
          .where({
            company_id: payload?.company_id,
          })
          .whereNull('deleted_at')

          .select();
      } else if (taskType === 'All') {
        res = await knex
          .from(TableNames.TASK_BOARDS)
          .where({
            company_id: payload?.company_id,
          })
          .whereNull('deleted_at')

          .select();
      } else {
        res = await knex
          .from(TableNames.TASK_BOARDS)
          .where({
            company_id: payload?.company_id,
            type: taskType,
          })
          .whereNull('deleted_at')

          .select();
      }
    }

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getTaskById = async (id: number) => {
  try {
    const res = await knex
      .where({ id })
      .from(TableNames.TASKS)
      .where({ deleted_at: null })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksById = async ({ ids }: { ids: TaskId[] }) => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .whereIn('id', ids)
      .whereNotNull('group_id')
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const setCachedTaskCommentsByTaskId = async ({
  comments,
  taskId,
}: {
  comments: TaskCommentModel[];
  taskId: TaskId;
}) => {
  if (comments) {
    // await redis.set(`comments-by-task:${taskId}`, comments);
  }
};

const getCommentsByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskCommentModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TASK_COMMENTS)
      .where({ card_id: taskId, deleted_at: null })
      .select();

    setCachedTaskCommentsByTaskId({ comments: camelize(res), taskId });

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskMembersByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TaskMemberModel[]> => {
  try {
    const res = await knex(TableNames.TASK_MEMBERS)
      .where({ card_id: taskId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubtasksByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(SubtaskModel | Error)[]> => {
  try {
    const res = await knex(TableNames.SUBTASKS)
      .where({ card_id: taskId, deleted_at: null })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskPicsByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TASK_PICS)
      .where({ card_id: taskId })

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const setCachedTasksByProject = async ({
  tasks,
  projectId,
}: {
  tasks: TaskModel[];
  projectId: CompanyId;
}) => {
  if (tasks) {
    // await redis.set(`tasks-by-project:${projectId}`, tasks);
  }
};

const getTasksByTaskBoardId = async ({
  id,
  limit,
  offset = 0,
}: {
  id: TaskBoardId;
  limit?: number;
  offset?: number;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({ job_id: id, deleted_at: null, parent_id: null })
      .whereNotNull('group_id')
      .limit(limit || 9999)
      .offset(offset)
      .select();

    setCachedTasksByProject({ tasks: camelize(res), projectId: id });

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getTaskMembers = async (
  memberId: CompanyMemberId,
): Promise<(TaskMemberModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_MEMBERS)
      .where({ member_id: memberId })

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksByTeamId = async ({
  teamId,
}: {
  teamId: CompanyTeamId;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({ team_id: teamId, deleted_at: null })
      .whereNotNull('group_id')

      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getTaskAttachmentsByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskAttachmentModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_ATTACHMENTS)
      .where({ card_id: taskId, deleted_at: null })

      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const createTaskAttachment = async ({
  payload,
}: {
  payload: AttachmentPayload;
}): Promise<TaskAttachmentModel | Error> => {
  try {
    const insert = await knex(TableNames.TASK_ATTACHMENTS).insert({
      ...payload,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
    const res = await knex
      .from(TableNames.TASK_ATTACHMENTS)
      .where('id', _.head(insert))

      .select();
    return camelize(_.head(res));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const getByTaskBoardName = async ({
  type,
  name,
  companyId,
}: {
  type: string;
  name: string;
  companyId: CompanyId;
}): Promise<TaskBoardModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where({ name, type, company_id: companyId, deleted_at: null })

      .select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const createTaskBoard = async ({
  payload,
}: {
  payload: TaskBoardPayload;
}): Promise<TaskBoardModel | Error> => {
  try {
    const insert = await knex(TableNames.TASK_BOARDS).insert({
      ...payload,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where({
        company_id: payload.company_id,
        type: payload.type,
        id: _.head(insert),
      })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const createProjectBoard = async ({
  payload,
  teamId,
}: {
  payload: TaskBoardPayload;
  teamId: TeamId | undefined;
}): Promise<TaskBoardModel | Error> => {
  try {
    const insertId = await knex(TableNames.TASK_BOARDS).insert({
      ...payload,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    if (teamId) {
      await knex(TableNames.TASK_BOARD_TEAMS).insert({
        job_id: _.head(insertId),
        team_id: teamId ? teamId : null,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
    }

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where({
        company_id: payload.company_id,
        type: payload.type,
        id: _.head(insertId),
      })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const addTeamIdTaskBoard = async ({
  id,
  team_id,
}: {
  id: TaskBoardId;
  team_id: CompanyTeamId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where({ id })
      .update({ team_id });
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTask = async ({
  name,
  description,
  createdBy,
  projectId,
  teamId,
  taskStatusId,
  dueDate,
  stageType,
  value,
  startDate,
  endDate,
  plannedEffort,
  projectedCost,
  priority,
  visibility,
  sequence,
  published,
  completed,
  actualStart,
  actualEnd,
  groupId,
  parentId,
  statusId,
  archived,
  posY,
  companyId,
}: TaskStoreCreateTaskInput): Promise<TaskModel> => {
  try {
    const insert = await knex(TableNames.TASKS).insert({
      name,
      description,
      created_by: createdBy,
      job_id: projectId,
      team_id: teamId,
      sub_status_id: taskStatusId,
      due_date: dueDate,
      status: stageType,
      value,
      start_date: startDate,
      end_date: endDate,
      planned_effort: plannedEffort,
      projected_cost: projectedCost,
      priority,
      visibility,
      sequence,
      actual_start: actualStart,
      actual_end: actualEnd,
      completed,
      created_at: knex.fn.now(),
      published,
      ...(groupId && { group_id: groupId }),
      ...(parentId && { parent_id: parentId }),
      ...(statusId && { status_id: statusId }),
      ...(archived && { archived }),
    });

    const res = await knex
      .from(TableNames.TASKS)
      .where('id', _.head(insert))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTaskLegacy = async ({
  payload,
}: {
  payload: TaskCreatePayload;
}): Promise<TaskModel> => {
  const completed = payload.status == 2 ? 1 : 0;
  try {
    const insert = await knex(TableNames.TASKS).insert({
      name: payload.name ? payload.name : undefined,
      description: payload.description ? payload.description : undefined,
      created_by: payload.createdBy ? payload.createdBy : undefined,
      job_id: payload.jobId ? payload.jobId : undefined,
      team_id: payload.teamId ? payload.teamId : undefined,
      sub_status_id: payload.subStatusId ? payload.subStatusId : undefined,
      due_date: payload.dueDate ? payload.dueDate : undefined,
      status: payload.status ? payload.status : undefined,
      value: payload.value ? payload.value : undefined,
      start_date: payload.startDate ? payload.startDate : undefined,
      end_date: payload.endDate ? payload.endDate : undefined,
      planned_effort: payload.plannedEffort ? payload.plannedEffort : undefined,
      projected_cost: payload.projectedCost ? payload.projectedCost : undefined,
      priority: payload.priority ? payload.priority : undefined,
      sequence: payload.sequence ? payload.sequence : undefined,
      actual_start: payload.actualStart ? payload.actualStart : undefined,
      actual_end: payload.actualEnd ? payload.actualEnd : undefined,
      completed,
      created_at: knex.fn.now(),
      published: payload.published,
    });

    const res = await knex
      .from(TableNames.TASKS)
      .where('id', _.head(insert))

      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const createTaskBoardTeam = async ({
  payload,
}: {
  payload: TaskBoardTeamPayload;
}): Promise<TaskBoardTeamModel | Error> => {
  try {
    const check = await knex
      .from(TableNames.TASK_BOARD_TEAMS)
      .where({ ...payload })

      .select();
    if (check.length > 0) {
      throw new Error('Team already added');
    }

    const insert = await knex(TableNames.TASK_BOARD_TEAMS).insert({
      ...payload,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
    const res = await knex
      .from(TableNames.TASK_BOARD_TEAMS)
      .where('id', _.head(insert))

      .select();
    return camelize(_.head(res));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const createTaskActivity = async ({
  payload,
}: {
  payload: TaskActivityPayload;
}): Promise<TaskActivityModel | Error> => {
  try {
    const insert = await knex(TableNames.TASK_ACTIVITIES).insert({
      ...payload,
      created_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.TASK_ACTIVITIES)
      .where('id', _.head(insert))

      .select();

    return camelize(_.head(res));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const updateTask = async ({
  taskId,
  payload,
  companyTeamStatus,
  companyId,
}: {
  taskId: TaskId;
  payload: TaskUpdatePayload;
  companyTeamStatus?: TaskStatusModel;
  companyId: CompanyId;
}): Promise<TaskModel | Error> => {
  try {
    const { statusId, actualEnd, actualStart, actualEffort, actualValue } =
      payload;
    const completed = payload.status === 2 ? 1 : 0;
    let actualEndValue;
    if (!process.env.TASK_UNIFICATION) {
      if (
        _.toNumber(companyTeamStatus?.percentage) !== 0 &&
        companyTeamStatus?.parent_status === 1
      ) {
        actualEndValue = null;
      } else if (completed === 1 || companyTeamStatus?.parent_status === 3) {
        actualEndValue = knex.fn.now();
      } else {
        actualEndValue = null;
      }
    } else {
      actualEndValue = actualEnd;
    }
    await knex
      .from(TableNames.TASKS)
      .where({ id: taskId })
      .update({
        name: payload.name,
        due_date: payload.dueDate,
        sequence: payload.sequence,
        description: payload.description,
        sub_status_id: payload.subStatusId,
        updated_by: payload.updatedBy,
        due_reminder: payload.dueReminder,
        status: payload.status,
        value: payload.value,
        start_date: payload.startDate,
        end_date: payload.endDate,
        actual_start: actualStart,
        actual_end: actualEndValue,
        actual_effort: actualEffort,
        actual_cost: actualValue,
        last_remind_on: payload?.dueDate ? null : undefined,
        priority: payload.priority,
        planned_effort: payload.plannedEffort,
        projected_cost: payload.projectedCost,
        team_id: payload.teamId,
        due_date_updated_at: payload?.dueDate ? knex.fn.now() : undefined,
        completed,
        updated_at: knex.fn.now(),
        visibility:
          typeof payload.visibility === 'number'
            ? payload.visibility
            : undefined,
        published:
          typeof payload.published === 'boolean'
            ? payload.published
            : undefined,
        ...(statusId && { status_id: statusId }),
      });

    // if (typeof payload?.visibility === 'number') {
    //   await knex
    //     .from(TableNames.TASKS)
    //     .where({ id: taskId })

    //     .update({ visibility: payload.visibility });
    // }

    // if (typeof payload?.published === 'number') {
    //   await knex
    //     .from(TableNames.TASKS)
    //     .where({ id: taskId })
    //     .update({ published: payload?.published });
    // }

    const res = await knex
      .from(TableNames.TASKS)
      .where({ id: taskId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubtask = async ({
  subtaskId,
  payload,
}: {
  subtaskId: SubtaskId;
  payload: SubtaskUpdatePayload;
}): Promise<SubtaskModel | Error> => {
  try {
    await knex
      .from(TableNames.SUBTASKS)
      .where({ id: subtaskId })
      .update({
        ...payload,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.SUBTASKS)
      .where({ id: subtaskId })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTaskComment = async ({
  taskCommentId,
  payload,
  taskId,
}: {
  taskCommentId: TaskCommentId;
  payload: TaskCommentUpdatePayload;
  taskId: TaskId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASK_COMMENTS)
      .where({ id: taskCommentId })
      .update({
        message: payload.message ? payload.message : undefined,
        message_content: payload.messageContent
          ? payload.messageContent
          : undefined,
        updated_by: payload.updatedBy ? payload.updatedBy : undefined,
        updated_at: knex.fn.now(),
      });

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTaskBoard = async ({
  id,
  payload,
}: {
  id: TaskBoardId;
  payload: TaskBoardUpdatePayload;
}): Promise<TaskBoardModel | Error> => {
  try {
    await knex
      .from(TableNames.TASK_BOARDS)
      .where({ id })
      .update({
        ...payload,
        description: payload.description,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where({ id })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getByTaskName = async ({
  name,
  type,
}: {
  name: string;
  type: string;
}): Promise<TaskModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({ name, type, deleted_at: null, parent_id: null })

      .select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const getTaskAttachmentByTaskId = async ({
  card_id,
  id,
}: {
  card_id: TaskId;
  id: TaskBoardId;
}): Promise<TaskAttachmentModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASK_ATTACHMENTS)
      .where({ card_id, id, deleted_at: null })

      .select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const deleteTasks = async ({
  taskIds,
  userId,
  projectIds,
  companyId,
}: {
  taskIds: TaskId[];
  userId: UserId;
  projectIds: ProjectId[];
  companyId: CompanyId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.TASKS)
      .whereIn('id', taskIds)
      .update({ deleted_at: knex.fn.now(), deleted_by: userId });

    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const deleteTaskAttachment = async ({
  taskAttachmentIds,
  userId,
}: {
  taskAttachmentIds: TaskAttachmentId[];
  userId: UserId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.TASK_ATTACHMENTS)
      .whereIn('id', taskAttachmentIds)
      .update({ deleted_at: knex.fn.now(), deleted_by: userId });

    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const deleteTaskComment = async ({
  taskCommentId,
  taskId,
}: {
  taskCommentId: TaskCommentId;
  taskId: TaskId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.TASK_COMMENTS)
      .where({ id: taskCommentId })
      .del();
    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const deleteSubtasks = async ({
  subtaskIds,
}: {
  subtaskIds: SubtaskId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.SUBTASKS).whereIn('id', subtaskIds).del();

    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const deleteTaskMembers = async ({
  taskId,
  memberIds,
}: {
  taskId: TaskId;
  memberIds: CompanyMemberId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.TASK_MEMBERS)
      .where({ card_id: taskId })
      .whereIn('member_id', memberIds)
      .del();

    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

//DEPRECATED WHEN V3 LAUNCHED
const deleteTaskPics = async ({
  taskId,
  picIds,
}: {
  taskId: TaskId;
  picIds: ContactPicId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.TASK_PICS)
      .where({ card_id: taskId })
      .whereIn('pic_id', picIds)
      .del();

    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const removeTaskPics = async (
  taskPicsPublicIds: TaskPicPublicId[],
): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.TASK_PICS)
      .whereIn('id_text', taskPicsPublicIds)
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteTaskBoardTeams = async ({
  taskBoardTeamIds,
  isV3,
}: {
  taskBoardTeamIds: TaskBoardTeamId[];
  isV3: boolean;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const taskBoardTeams = (await knex
      .from(TableNames.TASK_BOARD_TEAMS)
      .whereIn('id', taskBoardTeamIds)) as {
      job_id: TaskBoardId;
      team_id: TeamId;
    }[];

    if (!isV3) {
      await Promise.all(
        taskBoardTeams.map(async (tbt) => {
          return _.head(
            await knex.raw(`
              UPDATE cards c
              INNER JOIN teams t ON c.team_id = t.id
              INNER JOIN jobs_teams jt ON jt.team_id = t.id
              SET c.deleted_at = NOW()
              WHERE c.team_id = ${tbt?.team_id} and jt.job_id = ${tbt?.job_id} and c.job_id = ${tbt?.job_id}
              AND c.deleted_at IS null
          `),
          );
        }),
      );
    }

    const res = await knex(TableNames.TASK_BOARD_TEAMS)
      .whereIn('id', taskBoardTeamIds)
      .delete();

    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const deleteTaskBoards = async ({
  ids,
  userId,
}: {
  ids: TaskBoardId[];
  userId: UserId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex(TableNames.TASK_BOARDS)
      .whereIn('id', ids)
      .update({ deleted_at: knex.fn.now(), deleted_by: userId });
    return res;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const addTaskMembers = async ({
  taskId,
  payload,
}: {
  taskId: TaskId;
  payload: TaskCreateMemberPayload;
}): Promise<(TaskMemberModel | Error)[]> => {
  try {
    const { members } = payload;

    const check = await knex
      .from(TableNames.TASK_MEMBERS)
      .where({ card_id: taskId })
      .whereIn(
        'member_id',
        members.map((m) => m.id),
      )

      .select();

    if (check.length > 0) {
      return Promise.reject({ message: 'Member is already in the group' });
    }

    await knex(TableNames.TASK_MEMBERS).insert(
      members.map((m) => ({
        member_id: m.id,
        card_id: taskId,
        user_id: m.user_id,
      })),
    );

    const res = await knex
      .from(TableNames.TASK_MEMBERS)
      .where({ card_id: taskId })
      .whereIn(
        'member_id',
        members.map((m) => m.id),
      )

      .select();

    return camelize(res);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const addTaskPics = async ({
  taskId,
  payload,
}: {
  taskId: TaskId;
  payload: TaskCreatePicPayload;
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const { pics } = payload;

    const check = await knex
      .from(TableNames.TASK_PICS)
      .where({ card_id: taskId })
      .whereIn(
        'pic_id',
        pics.map((p) => p.pic_id),
      )

      .select();

    if (check.length > 0) {
      return Promise.reject({ message: 'PIC is already in the group' });
    }

    await knex(TableNames.TASK_PICS).insert(
      pics.map((p) => ({
        pic_id: p.pic_id,
        card_id: taskId,
        contact_id: p.contact_id,
        user_id: p.user_id,
      })),
    );

    const res = await knex
      .from(TableNames.TASK_PICS)
      .where({ card_id: taskId })
      .whereIn(
        'pic_id',
        pics.map((p) => p.pic_id),
      )

      .select();

    return camelize(res);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const addSubtask = async ({
  payload,
}: {
  payload: SubtaskPayload;
}): Promise<SubtaskModel | Error> => {
  try {
    const insert = await knex(TableNames.SUBTASKS).insert({
      ...payload,
      checked: 0,
      created_at: knex.fn.now(),
    });
    const res = await knex
      .from(TableNames.SUBTASKS)
      .where('id', _.head(insert))

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const postTaskComment = async ({
  payload,
}: {
  payload: {
    messageContent: string;
    parentId?: TaskCommentId;
    taskId: TaskId;
    userId: UserId;
  };
}): Promise<TaskCommentModel> => {
  try {
    const { userId, taskId, messageContent } = payload;
    const insert = await knex(TableNames.TASK_COMMENTS).insert({
      card_id: taskId,
      parent_id: payload?.parentId ? payload?.parentId : null,
      message_content: messageContent,
      user_id: userId,
      created_by: userId,
      created_at: knex.fn.now(),
    });
    const res = await knex
      .from(TableNames.TASK_COMMENTS)
      .where('id', _.head(insert))

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskMembersByTaskIdAndMemberId = async ({
  taskId,
  memberIds,
}: {
  taskId: TaskId;
  memberIds: CompanyMemberId[];
}): Promise<(TaskMemberModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TASK_MEMBERS)
      .where({ card_id: taskId })
      .whereIn('member_id', memberIds)

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskPicsByTaskIdAndPicId = async ({
  taskId,
  picIds,
}: {
  taskId: TaskId;
  picIds: ContactPicId[];
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TASK_PICS)
      .where({ card_id: taskId })
      .whereIn('pic_id', picIds)

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskBoardTeams = async ({
  id,
}: {
  id: TaskBoardId;
}): Promise<(TaskBoardTeamModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARD_TEAMS)
      .where('job_id', id)
      .whereNull('deleted_at')

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTeamsForTaskBoardIds = async ({ ids }: { ids: TaskBoardId[] }) => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARD_TEAMS)
      .whereIn('job_id', ids)

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const setProjectOwnerCacheByProjectId = async ({
  projectOwner,
}: {
  projectOwner: TaskBoardOwnerModel;
}) => {
  if (projectOwner?.jobId) {
    // await redis.set(`project-owner:${projectOwner.jobId}`, projectOwner);
  }
};

const getOwnersForTaskBoardIds = async ({ ids }: { ids: TaskBoardId[] }) => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARD_OWNERS)
      .whereIn('job_id', ids)

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskBoardTeamById = async ({
  boardId,
  teamId,
}: {
  boardId: TaskBoardId;
  teamId: CompanyTeamId;
}): Promise<TaskBoardTeamModel | Error> => {
  try {
    const res = await knex(TableNames.TASK_BOARD_TEAMS)
      .where({ job_id: boardId, team_id: teamId, deleted_at: null })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksForTeam = async ({
  teamId,
  boardId,
}: {
  teamId: CompanyTeamId;
  boardId: TaskBoardId;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({ team_id: teamId, job_id: boardId, parent_id: null })
      .whereNull('deleted_at')

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTasksArchivedState = async ({
  taskIds,
  archived,
  userId,
  projectIds,
}: {
  taskIds: TaskId[];
  archived: boolean;
  userId: UserId;
  projectIds: ProjectId[];
}): Promise<(TaskModel | Error)[]> => {
  try {
    await knex
      .from(TableNames.TASKS)
      .whereIn('id', taskIds)
      .update({
        archived,
        archived_at: archived ? knex.fn.now() : null,
        archived_by: archived ? userId : null,
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

const updateActualCost = async ({
  taskId,
  actualCost,
}: {
  taskId: TaskId;
  actualCost: number;
}): Promise<void | Error> => {
  try {
    await knex('cards').where('id', taskId).update({ actual_cost: actualCost });
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskActivities = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskActivityModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_ACTIVITIES)
      .where({ card_id: taskId });
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTasksSequence = async ({
  payload,
}: {
  payload: TasksSequenceUpdatePayload[];
}): Promise<(TaskModel | Error)[]> => {
  try {
    Promise.all(
      payload.map(async (task) => {
        const update = await knex
          .from(TableNames.TASKS)
          .where({ id: task.taskId })
          .update({ sequence: task.sequence });
        return update;
      }),
    );

    const res = await knex
      .from(TableNames.TASKS)
      .whereIn(
        'id',
        payload.map((t) => t.taskId),
      )
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskAttachment = async (
  attachmentId: TaskAttachmentId,
): Promise<TaskAttachmentModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASK_ATTACHMENTS)
      .where({ id: attachmentId, deleted_at: null })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskAttachmentByPublicId = async (
  attachmentId: TaskAttachmentPublicId,
): Promise<TaskAttachmentModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASK_ATTACHMENTS)
      .where({ id_text: attachmentId, deleted_at: null })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTask = async (taskId: TaskId): Promise<Error | TaskModel> => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({ id: taskId, deleted_at: null })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasks = async ({
  companyId,
  category,
}: {
  companyId: CompanyId;
  category?: number;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const taskboards = (await knex
      .from(TableNames.TASK_BOARDS)
      .where((builder) => {
        if (typeof category === 'number') {
          builder.where({ category });
        }
      })
      .where({
        company_id: companyId,
        deleted_at: null,
      })) as TaskBoardModel[];

    let tasks: TaskModel[] = [];
    for (let i = 0; i < taskboards.length; i++) {
      const boardTasks = (await knex
        .from(TableNames.TASKS)
        .where({ job_id: taskboards[i].id, deleted_at: null, parent_id: null })
        .whereNotNull('group_id')
        .select()) as TaskModel[];

      for (let j = 0; j < boardTasks.length; j++) {
        tasks.push({ ...boardTasks[j], board_type: taskboards[i]?.type });
      }
    }

    return camelize(tasks);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksV3 = async ({
  companyId,
  filter,
  companyTimezone = DEFAULT_LOCAL_TIME,
  sort,
}: {
  companyId: CompanyId;
  companyTimezone: string;
  filter: TaskFilter;
  sort: TaskSort;
}): Promise<(TaskModel | Error)[]> => {
  try {
    let direction;
    let sortField;
    for (const key in TaskSortType) {
      if (TaskSortType[key as keyof typeof TaskSortType] === sort?.type) {
        direction = sort?.direction;
        sortField = sort?.type;
      }
    }

    const res = await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 't.job_id')
      .leftJoin({ tbo: TableNames.TASK_BOARD_OWNERS }, 'tbo.job_id', 't.job_id')
      .leftJoin({ tm: TableNames.TASK_MEMBERS }, 'tm.card_id', 't.id')
      .leftJoin({ pic: TableNames.TASK_PICS }, 'pic.card_id', 't.id')
      .leftJoin({ tag: TableNames.TASK_TAGS }, 'tag.task_id', 't.id')
      .leftJoin({ to: TableNames.TEMPLATE_OPTIONS }, 'to.task_id', 't.id')
      .leftJoin(
        { cmp: TableNames.COMPANY_PROFILES },
        'cmp.company_id',
        'tb.company_id',
      )
      .where((builder) => {
        const {
          ids,
          boardType,
          stage,
          subStatusId,
          contactIds,
          priority,
          dueDateRange,
          memberOwnerIds,
          memberAssigneeIds,
          picIds,
          tagIds,
          isRecurring,
          isOverdue,
          category,
          userId,
          search,
        } = filter;

        const conditions: { [key: string]: () => void } = {
          boardType: () => {
            if (boardType && boardType !== 'All' && boardType !== 'Personal') {
              const type =
                boardType === 'Company' ? 'Collaboration' : boardType;
              builder.where('tb.type', _.capitalize(type));
            } else if (boardType === 'Personal') {
              builder.where({ 'tb.created_by': userId, 'tb.type': 'Personal' });
            }
          },
          ids: () => ids && builder.whereIn('t.id', ids),
          stage: () => builder.where('t.status', stage),
          subStatusId: () => builder.where('t.sub_status_id', subStatusId),
          contactIds: () =>
            !_.isEmpty(contactIds) &&
            builder.whereIn('tb.contact_id', contactIds as ContactId[]),
          priority: () => builder.where('t.priority', priority),
          dueDateRange: () => {
            if (!_.isEmpty(dueDateRange) && _.isArray(dueDateRange)) {
              builder.whereBetween('t.due_date', dueDateRange);
            }
          },
          memberOwnerIds: () =>
            memberOwnerIds &&
            builder.whereIn('tbo.company_member_id', memberOwnerIds),
          memberAssigneeIds: () =>
            memberAssigneeIds &&
            builder.whereIn('tm.member_id', memberAssigneeIds),
          picIds: () => picIds && builder.whereIn('pic.id', picIds),
          tagIds: () => tagIds && builder.whereIn('tag.tag_id', tagIds),
          isRecurring: () => isRecurring && builder.where('to.is_recurring', 1),
          isOverdue: () =>
            isOverdue &&
            builder.whereRaw(
              `DATE_FORMAT(CONVERT_TZ(t.due_date, '+0:00', IF(cmp.default_timezone is null, '${companyTimezone}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00') >= DATE_FORMAT(CONVERT_TZ(NOW(), '+0:00', IF(cmp.default_timezone is null, '${companyTimezone}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00')`,
            ),
          category: () => category && builder.where('tb.category', +category),
          search: () =>
            search && builder.where('t.name', 'like', `%${search}%`),
        };

        for (const key in filter) {
          filter[key as keyof TaskFilter] &&
            conditions[key] &&
            conditions[key]();
        }
      })
      .where({
        'tb.company_id': companyId,
        't.deleted_at': null,
        't.parent_id': null,
      })
      .select('t.*')
      .limit(filter.limit || 999)
      .offset(filter.offset || 0)
      .orderBy(`t.${sortField || 'created_at'}`, direction || 'desc');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskBoardsV3 = async ({
  companyId,
  filter,
  companyTimezone = DEFAULT_LOCAL_TIME,
  sort,
}: {
  companyId: CompanyId;
  companyTimezone: string;
  filter: TaskBoardFilter;
  sort: TaskSort;
}): Promise<(TaskBoardModel | Error)[]> => {
  try {
    let direction;
    let sortField;
    for (const key in TaskBoardSortType) {
      if (
        TaskBoardSortType[key as keyof typeof TaskBoardSortType] === sort?.type
      ) {
        direction = sort?.direction;
        sortField = sort?.type;
      }
    }

    const res = await knex
      .from({ tb: TableNames.TASK_BOARDS })
      .leftJoin({ t: TableNames.TASKS }, 't.job_id', 'tb.id')
      .leftJoin(
        { cmp: TableNames.COMPANY_PROFILES },
        'cmp.company_id',
        'tb.company_id',
      )
      .where((builder) => {
        const {
          boardType,
          dueDateRange,
          startDateRange,
          memberOwnerIds,
          memberAssigneeIds,
          tagIds,
          isOverdue,
          userId,
          category,
        } = filter;

        const conditions: { [key: string]: () => void } = {
          category: () => category && builder.where('tb.category', +category),
          boardType: () => {
            if (boardType && boardType !== 'All' && boardType !== 'Personal') {
              const type =
                boardType === 'Company' ? 'Collaboration' : boardType;
              builder.where('tb.type', _.capitalize(type));
            } else if (boardType === 'Personal') {
              builder.where({ 'tb.created_by': userId, 'tb.type': 'Personal' });
            }
          },
          isOverdue: () =>
            isOverdue &&
            builder.whereRaw(
              `DATE_FORMAT(CONVERT_TZ(t.due_date, '+0:00', IF(cmp.default_timezone is null, '${companyTimezone}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00') >= DATE_FORMAT(CONVERT_TZ(NOW(), '+0:00', IF(cmp.default_timezone is null, '${companyTimezone}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00')`,
            ),
          tagIds: () => tagIds && builder.whereIn('tag.tag_id', tagIds),
          memberOwnerIds: () =>
            memberOwnerIds &&
            builder.whereIn('tbo.company_member_id', memberOwnerIds),
          memberAssigneeIds: () =>
            memberAssigneeIds &&
            builder.whereIn('tm.member_id', memberAssigneeIds),
          dueDateRange: () => {
            if (!_.isEmpty(dueDateRange) && _.isArray(dueDateRange)) {
              builder.whereBetween('t.due_date', dueDateRange);
            }
          },
          startDateRange: () => {
            if (!_.isEmpty(startDateRange) && _.isArray(startDateRange)) {
              builder.whereBetween('t.start_date', startDateRange);
            }
          },
        };

        for (const key in filter) {
          filter[key as keyof TaskBoardFilter] &&
            conditions[key] &&
            conditions[key]();
        }
      })

      .whereNull('tb.deleted_at')
      .andWhere({ 'tb.company_id': companyId })
      .groupBy('tb.id')
      .select('tb.*')
      .limit(filter.limit || 999)
      .offset(filter.offset || 0)
      .orderBy(`tb.${sortField || 'created_at'}`, direction || 'desc');

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getTaskPics = async ({
  userId,
}: {
  userId: UserId;
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_PICS)
      .where({ user_id: userId })

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollaborationTaskBoard = async ({
  contactId,
  companyId,
}: {
  contactId: ContactId;
  companyId: CompanyId;
}): Promise<(TaskBoardModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TASK_BOARDS)
      .where({ contact_id: contactId, company_id: companyId, deleted_at: null })

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksAssignedToStatusId = async (
  projectStatusId: ProjectStatusId,
): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await knex({ t: TableNames.TASKS })
      .join({ kp: TableNames.TASK_KANBAN_POSITIONS }, 'kp.task_id', 't.id')
      .where({ 't.status_id': projectStatusId })
      .select('t.*', 'kp.pos_y');
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskByTimesheetId = async (
  timesheetId: TimesheetId,
): Promise<TaskModel | Error> => {
  try {
    const task = await knex({ ta: 'timesheet_activities' })
      .leftJoin({ c: 'cards' }, 'ta.task_id', 'c.id')
      .leftJoin({ t: 'timesheets' }, 't.activity_id', 'ta.id')
      .where({ 't.id': timesheetId })
      .select('c.*');

    return camelize(_.head(task));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getOpenTaskTimers = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TaskTimerEntryModel[] | Error> => {
  try {
    const res = await knex
      .from(TableNames.TASK_TIMER_ENTRIES)
      .where({ task_id: taskId })
      .whereNull('end_date')

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTaskTimerEntry = async ({
  taskId,
  companyMemberId,
}: {
  taskId: TaskId;
  companyMemberId: CompanyMemberId;
}): Promise<TaskTimerEntryModel | Error> => {
  try {
    const insertRes = await knex(TableNames.TASK_TIMER_ENTRIES).insert({
      company_member_id: companyMemberId,
      task_id: taskId,
      start_date: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.TASK_TIMER_ENTRIES)
      .where('id', _.head(insertRes))

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const closeTaskTimerEntry = async ({
  taskId,
  companyMemberId,
}: {
  taskId: TaskId;
  companyMemberId: CompanyMemberId;
}): Promise<TaskTimerEntryModel | Error> => {
  try {
    await knex(TableNames.TASK_TIMER_ENTRIES)
      .where({
        company_member_id: companyMemberId,
        task_id: taskId,
      })
      .update({
        end_date: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.TASK_TIMER_ENTRIES)
      .where('id', taskId)

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskTimerTotals = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TaskTimerTotalModel[] | Error> => {
  try {
    const rawRes = await knex.raw(`
		SELECT 
			company_member_id, 
			SUM(time_total) as member_total 
		FROM ${TableNames.TASK_TIMER_ENTRIES} 
		WHERE task_id = ${taskId}
		GROUP BY company_member_id 
		`);

    const res = _.head(rawRes) as TaskTimerTotalModel[];

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateActualStart = async ({
  taskId,
  payload,
}: {
  taskId: TaskId;
  payload: { updatedBy: UserId };
}): Promise<TaskModel | Error> => {
  try {
    await knex.from(TableNames.TASKS).where({ id: taskId }).update({
      actual_start: knex.fn.now(),
      updated_by: payload.updatedBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.TASKS)
      .where({ id: taskId })

      .select();

    camelize(res).map(async (task) => {});

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateActualEnd = async ({
  taskId,
  payload,
}: {
  taskId: TaskId;
  payload: { updatedBy: UserId };
}): Promise<TaskModel | Error> => {
  try {
    await knex.from(TableNames.TASKS).where({ id: taskId }).update({
      actual_end: knex.fn.now(),
      updated_by: payload.updatedBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.TASKS)
      .where({ id: taskId })
      .select();

    camelize(res).map(async (task) => {});

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const copyTask = async (input: {
  taskId: TaskId;
  userId: UserId;
  taskBoardId: TaskBoardId;
  companyTeamId: CompanyTeamId | null;
  projectGroupId?: ProjectGroupId | null;
  parentId?: TaskId;
}): Promise<TaskModel> => {
  try {
    const {
      taskId,
      taskBoardId,
      companyTeamId,
      userId,
      projectGroupId,
      parentId,
    } = input;
    const taskRes = await knex
      .from(TableNames.TASKS)
      .where('id', taskId)

      .select();
    const task = _.head(taskRes) as TaskModel;

    const { id, id_text, id_bin, due_date, ...newTask } = task;

    const insertRes = await knex(TableNames.TASKS).insert({
      ...newTask,
      job_id: taskBoardId || newTask.job_id,
      team_id: companyTeamId || newTask.team_id,
      created_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      status_id: null,
      group_id: projectGroupId ? projectGroupId : null,
      parent_id: parentId ? parentId : null,
    });

    const res = await knex
      .from(TableNames.TASKS)
      .where('id', _.head(insertRes))

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const copyChecklists = async ({
  sourceTaskId,
  targetTaskId,
  userId,
}: {
  sourceTaskId: TaskId;
  targetTaskId: TaskId;
  userId: UserId;
}) => {
  try {
    const subtasks = await knex
      .from(TableNames.SUBTASKS)
      .where('card_id', sourceTaskId)

      .select();

    if (subtasks.length > 0) {
      const itemsToInsert = subtasks.map((subtask) => ({
        card_id: targetTaskId,
        sequence: subtask.sequence,
        title: subtask.title,
        created_by: userId,
        updated_by: userId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      }));

      await knex(TableNames.SUBTASKS).insert(itemsToInsert);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertTaskAttachments = async ({
  taskId,
  userId,
  attachments,
}: {
  taskId: TaskId;
  userId: UserId;
  attachments: {
    name: string;
    type: string;
    filesize: number;
    url: string;
    bucket: string;
    path: string;
  }[];
}) => {
  try {
    if (attachments.length > 0) {
      const itemsToInsert = attachments.map((attachment) => ({
        card_id: taskId,
        name: attachment.name,
        type: attachment.type,
        file_size: attachment.filesize,
        path: attachment.path,
        url: attachment.url,
        created_by: userId,
        updated_by: userId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      }));

      await knex(TableNames.TASK_ATTACHMENTS).insert(itemsToInsert);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTaskBoardsArchivedState = async ({
  boardIds,
  archived,
  updatedBy,
}: {
  boardIds: TaskBoardId[];
  archived: boolean;
  updatedBy: UserId;
}): Promise<(TaskBoardModel | Error)[]> => {
  try {
    await knex(TableNames.TASK_BOARDS)
      .whereIn('id', boardIds)
      .update({
        updated_at: knex.fn.now(),
        archived,
        archived_at: archived ? knex.fn.now() : null,
        archived_by: archived ? updatedBy : null,
      });

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .whereIn('id', boardIds)

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskBoardOwnersByTaskBoardId = async (
  boardId: TaskBoardId,
): Promise<TaskBoardOwnerModel[]> => {
  try {
    const res = await knex(TableNames.TASK_BOARD_OWNERS)
      .where('job_id', boardId)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTaskBoardOwners = async ({
  boardId,
  companyMemberIds,
}: {
  boardId: TaskBoardId;
  companyMemberIds: CompanyMemberId[];
}): Promise<TaskBoardOwnerModel[]> => {
  try {
    await knex(TableNames.TASK_BOARD_OWNERS).where('job_id', boardId).delete();

    if (companyMemberIds.length > 0) {
      const itemsToInsert = companyMemberIds.map((memberId) => ({
        job_id: boardId,
        company_member_id: memberId,
      }));

      await knex(TableNames.TASK_BOARD_OWNERS).insert(itemsToInsert);
    }

    const res = await knex(TableNames.TASK_BOARD_OWNERS)
      .where('job_id', boardId)

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskAttachmentsByCommentIds = async ({
  commentIds,
}: {
  commentIds: TaskCommentId[];
}) => {
  try {
    const res = await knex
      .from({ tca: TableNames.TASK_COMMENT_ATTACHMENTS })
      .whereIn('tca.comment_id', commentIds)
      .innerJoin(
        { ta: TableNames.TASK_ATTACHMENTS },
        'tca.attachment_id',
        'ta.id',
      )
      .select('ta.*', 'tca.comment_id');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const linkAttachmentToComment = async ({
  commentId,
  attachmentId,
}: {
  commentId: TaskCommentId;
  attachmentId: TaskAttachmentId;
}): Promise<TaskCommentModel | Error> => {
  try {
    await knex(TableNames.TASK_COMMENT_ATTACHMENTS)
      .insert({
        attachment_id: attachmentId,
        comment_id: commentId,
      })
      .onConflict('attachment_id')
      .merge();

    const res = await knex
      .from(TableNames.TASK_COMMENTS)
      .where('id', commentId)

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const unlinkAttachmentFromComment = async ({
  commentId,
  attachmentId,
}: {
  commentId: TaskCommentId;
  attachmentId: TaskAttachmentId;
}): Promise<TaskCommentModel | Error> => {
  try {
    await knex(TableNames.TASK_COMMENT_ATTACHMENTS)
      .where({
        attachment_id: attachmentId,
        comment_id: commentId,
      })
      .del();

    const res = await knex
      .from(TableNames.TASK_COMMENTS)
      .where('id', commentId)

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskBoardTeamByBoardId = async ({
  boardId,
}: {
  boardId: TaskBoardId;
}): Promise<TaskBoardTeamModel | Error> => {
  try {
    const res = await knex(TableNames.TASK_BOARD_TEAMS)
      .where({ job_id: boardId, deleted_at: null })

      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTaskWithTemplateId = async ({
  taskId,
  templateId,
}: {
  taskId: TaskId;
  templateId: TemplateId;
}): Promise<TaskModel> => {
  try {
    await knex
      .from(TableNames.TASKS)
      .where({ id: taskId })
      .update({ template_id: templateId });

    const res = await knex
      .from(TableNames.TASKS)
      .where({ id: taskId })

      .select();

    camelize(res).map(async (task) => {});

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const editTaskComment = async ({
  commentId,
  messageContent,
}: {
  commentId: TaskCommentId;
  messageContent: string;
}): Promise<TaskCommentModel | Error> => {
  try {
    await knex
      .from(TableNames.TASK_COMMENTS)
      .where({ id: commentId })
      .update({ message_content: messageContent });

    const res = await knex
      .from(TableNames.TASK_COMMENTS)
      .where('id', commentId)

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskBoardTeamsByCompanyId = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<(TaskBoardTeamModel | Error)[]> => {
  try {
    const res = await knex
      .from({ tbt: TableNames.TASK_BOARD_TEAMS })
      .leftJoin({ team: TableNames.COMPANY_TEAMS }, 'team.id', 'tbt.team_id')
      .where('team.company_id', companyId)
      .whereNull('tbt.deleted_at')
      .whereNull('team.deleted_at')
      .select('tbt.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubtaskSequences = async (
  payload: { subtaskId: SubtaskId; sequence: number }[],
): Promise<SubtaskModel[]> => {
  try {
    const ids = await Promise.all(
      _.map(payload, async (updatePayload) => {
        return await knex
          .from(TableNames.SUBTASKS)
          .where({ id: updatePayload.subtaskId })
          .update({ sequence: updatePayload.sequence });
      }),
    );

    const res = await knex.from(TableNames.SUBTASKS).whereIn('id', ids);
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const toggleTasksPinned = async ({
  taskIds,
  userId,
}: {
  taskIds: TaskId[];
  userId: UserId;
}): Promise<TaskModel[]> => {
  try {
    await knex.raw(`
			UPDATE ${TableNames.TASKS} 
			SET pinned = NOT pinned, 
			updated_at = NOW(),
			updated_by = ${userId}
			WHERE id IN(${taskIds})
		`);

    const res = await knex
      .from(TableNames.TASKS)
      .whereIn('id', taskIds)

      .select();

    camelize(res).map(async (task) => {});

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const linkExternalAttachments = async ({
  taskId,
  userId,
  externalAttachments,
}: {
  taskId: TaskId;
  userId: UserId;
  externalAttachments: ExternalAttachmentModel[];
}): Promise<TaskModel> => {
  try {
    await knex(TableNames.TASK_ATTACHMENTS).insert(
      externalAttachments.map((attachment) => ({
        card_id: taskId,
        name: attachment.name,
        type: attachment.type,
        file_size: 0,
        path: '',
        is_external: true,
        external_source: attachment.source,
        url: attachment.url,
        created_by: userId,
        updated_by: userId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })),
    );

    const res = await knex
      .from(TableNames.TASKS)
      .where('id', taskId)

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const toggleTasksPublishStatus = async ({
  taskIds,
  userId,
}: {
  taskIds: TaskId[];
  userId: UserId;
}): Promise<TaskModel[]> => {
  try {
    await knex.raw(`
			UPDATE ${TableNames.TASKS} 
			SET published = NOT published, 
			updated_at = NOW(),
			updated_by = ${userId}
			WHERE id IN(${taskIds})
		`);

    const res = await knex
      .from(TableNames.TASKS)
      .whereIn('id', taskIds)

      .select();

    camelize(res).map(async (task) => {});

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSharedTasks = async ({
  userId,
  filter,
  companyTimezone = DEFAULT_LOCAL_TIME,
  sort,
}: {
  userId: UserId;
  companyTimezone: string;
  filter: TaskFilter;
  sort: TaskSort;
}): Promise<TaskModel[]> => {
  try {
    let direction;
    let sortField;
    for (const key in TaskSortType) {
      if (TaskSortType[key as keyof typeof TaskSortType] === sort?.type) {
        direction = sort?.direction;
        sortField = sort?.type;
      }
    }

    const res = await knex
      .from({ tp: TableNames.TASK_PICS })
      .leftJoin({ t: TableNames.TASKS }, 't.id', 'tp.card_id')
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 't.job_id')
      .leftJoin({ tbo: TableNames.TASK_BOARD_OWNERS }, 'tbo.job_id', 't.job_id')
      .leftJoin({ tm: TableNames.TASK_MEMBERS }, 'tm.card_id', 't.id')
      .leftJoin({ pic: TableNames.TASK_PICS }, 'pic.card_id', 't.id')
      .leftJoin({ tag: TableNames.TASK_TAGS }, 'tag.task_id', 't.id')
      .leftJoin({ to: TableNames.TEMPLATE_OPTIONS }, 'to.task_id', 't.id')
      .where((builder) => {
        const {
          ids,
          boardType,
          stage,
          subStatusId,
          contactIds,
          priority,
          dueDateRange,
          memberOwnerIds,
          memberAssigneeIds,
          picIds,
          tagIds,
          isRecurring,
          isOverdue,
          category,
          startDateRange,
        } = filter;

        const conditions: { [key: string]: () => void } = {
          boardType: () => {
            if (boardType && boardType !== 'All' && boardType !== 'Personal') {
              const type =
                boardType === 'Company' ? 'Collaboration' : boardType;
              builder.where('tb.type', _.capitalize(type));
            }
          },
          ids: () => ids && builder.whereIn('t.id', ids),
          stage: () => builder.where('t.status', stage),
          subStatusId: () => builder.where('t.sub_status_id', subStatusId),
          contactIds: () =>
            !_.isEmpty(contactIds) &&
            builder.whereIn('tb.contact_id', contactIds as ContactId[]),
          priority: () => builder.where('t.priority', priority),
          dueDateRange: () => {
            if (!_.isEmpty(dueDateRange) && _.isArray(dueDateRange)) {
              builder.whereBetween('t.due_date', dueDateRange);
            }
          },
          startDateRange: () => {
            if (!_.isEmpty(startDateRange) && _.isArray(startDateRange)) {
              builder.whereBetween('t.start_date', startDateRange);
            }
          },
          memberOwnerIds: () =>
            memberOwnerIds &&
            builder.whereIn('tbo.company_member_id', memberOwnerIds),
          memberAssigneeIds: () =>
            memberAssigneeIds &&
            builder.whereIn('tm.member_id', memberAssigneeIds),
          picIds: () => picIds && builder.whereIn('pic.id', picIds),
          tagIds: () => tagIds && builder.whereIn('tag.tag_id', tagIds),
          isRecurring: () => isRecurring && builder.where('to.is_recurring', 1),
          isOverdue: () =>
            isOverdue &&
            builder.whereRaw(
              `DATE_FORMAT(CONVERT_TZ(t.due_date, '+0:00', IF(cmp.default_timezone is null, '${companyTimezone}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00') >= DATE_FORMAT(CONVERT_TZ(NOW(), '+0:00', IF(cmp.default_timezone is null, '${companyTimezone}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00')`,
            ),
          category: () => category && builder.where('tb.category', +category),
        };

        for (const key in filter) {
          filter[key as keyof TaskFilter] &&
            conditions[key] &&
            conditions[key]();
        }
      })
      .groupBy('t.id')
      .where({ 'tp.user_id': userId, 't.archived': 0 })
      .whereNull('t.deleted_at')
      .select('t.*')
      .limit(filter.limit || 999)
      .offset(filter.offset || 0)
      .orderBy(`t.${sortField || 'created_at'}`, direction || 'desc');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const addTaskWatchers = async ({
  taskId,
  memberIds,
}: {
  taskId: TaskId;
  memberIds: CompanyMemberId[];
}): Promise<TaskWatcherModel[]> => {
  try {
    await knex(TableNames.TASK_WATCHERS)
      .insert(
        memberIds.map((memberId) => ({
          member_id: memberId,
          task_id: taskId,
        })),
      )
      .onConflict(['member_id', 'task_id'])
      .merge();

    const res = await knex
      .from(TableNames.TASK_WATCHERS)
      .where('task_id', taskId)
      .whereIn('member_id', memberIds)

      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeTaskWatchers = async ({
  taskId,
  memberIds,
}: {
  taskId: TaskId;
  memberIds: CompanyMemberId[];
}): Promise<TaskWatcherModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_WATCHERS)
      .where('task_id', taskId)
      .whereIn('member_id', memberIds)

      .select();

    await knex(TableNames.TASK_WATCHERS)
      .where({ task_id: taskId })
      .whereIn('member_id', memberIds)
      .del();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskWatchers = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TaskWatcherModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_WATCHERS)
      .where({ task_id: taskId })

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const isTaskPublished = async (taskId: TaskId): Promise<boolean> => {
  try {
    const res = await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 't.job_id')
      .where({ 't.id': taskId, 't.published': 1, 'tb.published': 1 })
      .select('t.*');

    if (_.isEmpty(res)) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

const changeTaskPosY = async ({
  taskId,
  posY,
  projectId,
}: {
  taskId: TaskId;
  posY: number;
  projectId: ProjectId;
}): Promise<TaskModel> => {
  try {
    await knex(TableNames.TASK_KANBAN_POSITIONS)
      .insert({
        task_id: taskId,
        pos_y: posY,
      })
      .onConflict('task_id')
      .merge();

    const res = await knex
      .from(TableNames.TASKS)
      .where({
        id: taskId,
      })

      .select();

    camelize(res).map(async (task) => {});

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskSequence = async (taskId: TaskId): Promise<TaskKanbanPosition> => {
  try {
    const res = await knex
      .from(TableNames.TASK_KANBAN_POSITIONS)
      .where({
        task_id: taskId,
      })

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

//This is also changing the sequence of the task
const updateTaskStatusId = async ({
  taskId,
  projectStatusId,
  projectId,
}: {
  taskId: TaskId;
  projectStatusId: ProjectStatusId;
  projectId: ProjectId;
}): Promise<AffectedRowsResult> => {
  try {
    const res = await knex(TableNames.TASKS).where({ id: taskId }).update({
      status_id: projectStatusId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getChildTasks = async (taskId: TaskId): Promise<TaskModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where('parent_id', taskId)
      .whereNull('deleted_at')
      .whereNotNull('group_id')

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksByProjectGroupId = async ({
  projectGroupId,
  limit,
  offset,
  archived,
}: {
  projectGroupId: ProjectGroupId;
  limit?: number;
  offset?: number;
  archived?: number;
}): Promise<TaskModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .where({
        group_id: projectGroupId,
        parent_id: null,
        archived: archived ? archived : 0,
      })
      .whereNull('deleted_at')
      .limit(limit ? limit : 999)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksByProjectGroupIdLength = async (
  projectGroupId: ProjectGroupId,
): Promise<number> => {
  try {
    // get the count for tasks
    const res = await knex
      .from(TableNames.TASKS)
      .where({ group_id: projectGroupId, parent_id: null })
      .whereNull('deleted_at')
      .count('id as count');

    return _.get(res, '0.count', 0);
  } catch (error) {
    return Promise.reject(error);
  }
};

const importTasks = async (input: ImportTasksInput) => {
  try {
    const { userId, projectId, groupId } = input;
    const insertRes = await knex(TableNames.TASKS).insert(
      input.tasks.map((task) => {
        return {
          name: task.name,
          description: task.description,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
          created_by: userId,
          status: 1,
          group_id: groupId,
          job_id: projectId,
          ...(task.dueDate && { due_date: task.dueDate }),
        };
      }),
    );

    if (!insertRes) {
      throw new Error('error importing tasks');
    } else {
    }

    const start = _.head(insertRes) as number;

    const insertedIds = getInsertedIds(start, input.tasks.length);

    const res = await knex
      .from(TableNames.TASKS)
      .whereIn('id', insertedIds)

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksByProjectId = async (
  projectId: ProjectId,
): Promise<TaskModel[]> => {
  try {
    const res = await knex
      .from({ p: TableNames.PROJECTS })
      .leftJoin({ t: TableNames.TASKS }, 't.job_id', 'p.id')
      .where({
        'p.id': projectId,
      })
      .groupBy('t.id')
      .orderBy('t.created_at', 'desc')
      .select('t.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const batchAssignTaskMembers = async (input: ImportTaskMembersInput) => {
  try {
    await knex(TableNames.TASK_MEMBERS).insert(
      input.map((m) => ({
        card_id: m.taskId,
        member_id: m.memberId,
        user_id: m.userId,
      })),
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTaskParent = async ({
  childId,
  sourceParentId,
  destinationParentId,
  userId,
}: UpdateTaskParentInput): Promise<TaskModel[]> => {
  try {
    await knex(TableNames.TASKS).where({ id: childId }).update({
      parent_id: destinationParentId,
      updated_at: knex.fn.now(),
      updated_by: userId,
    });

    const res = await knex
      .from(TableNames.TASKS)
      .whereIn('id', [sourceParentId, destinationParentId])

      .select();

    camelize(res).map(async (task) => {});

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const updateTaskWithTeamStatus = async () => {
  try {
    const tasks = await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ ts: TableNames.TASK_STATUSES }, 'ts.id', 't.sub_status_id')
      .whereNotNull('t.sub_status_id')
      .whereNull('t.status_id')
      .select('t.*', 'ts.label', 'ts.color');

    //create project status
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      const status = await WorkspaceService.createProjectStatus({
        name: task?.label,
        color: task?.color || 'orange',
        projectId: task?.job_id,
      });

      await knex
        .from(TableNames.TASKS)
        .where({ id: task.id })
        .update({ status_id: status.id });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const updateDeleteDuplicatedStatuses = async () => {
  try {
    const tasks = await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ ts: TableNames.PROJECT_STATUSES }, 'ts.id', 't.status_id')
      .select('t.*', 'ts.name as status_name');
    const camelized = camelize(tasks);

    const grouped = _.groupBy(camelized, 'status_name');

    for (let i = 0; i < Object.keys(grouped).length; i++) {
      const key = Object.keys(grouped)[i];
      const statuses = grouped[key];

      if (statuses.length > 1) {
        //group by job id
        const groupedByJobId = _.groupBy(statuses, 'jobId');

        for (let j = 0; j < Object.keys(groupedByJobId).length; j++) {
          const jobId = Object.keys(groupedByJobId)[j];
          const statuses = groupedByJobId[jobId];

          if (statuses.length > 1) {
            const first = _.head(statuses);
            const rest = _.tail(statuses);
            const restIds = rest.map((s) => s.id);

            await knex
              .from(TableNames.TASKS)
              .whereIn('id', restIds)
              .update({ status_id: first.statusId });

            //delete rest
            if (!_.isEmpty(restIds)) {
              const t = await knex
                .from(TableNames.PROJECT_STATUSES)
                .whereIn('id', restIds)
                .del();
            }
          }
        }
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const changeProjectStatusName = async () => {
  await knex
    .from(TableNames.PROJECT_STATUSES)
    .whereIn('color', ['#F2F3F5'])
    .update({ color: '#86909C' });
};

const updateActualEffort = async ({
  taskId,
  actualEffort,
}: {
  taskId: TaskId;
  actualEffort: number;
}): Promise<void | Error> => {
  try {
    await knex('cards')
      .where('id', taskId)
      .update({ actual_effort: actualEffort });
  } catch (error) {
    return Promise.reject(error);
  }
};

const copySubtasks = async (input: {
  sourceParentId: TaskId;
  destinationParentId: TaskId;
  userId: UserId;
}) => {
  try {
    const { sourceParentId, destinationParentId, userId } = input;
    const subtasks = (await knex
      .from(TableNames.TASKS)
      .where({ parent_id: sourceParentId })

      .select()) as TaskModel[];

    for (let i = 0; i < subtasks.length; i++) {
      const subtask = subtasks[i];

      const { id, jobId, team_id, group_id } = subtask;
      await copyTask({
        taskId: id,
        userId,
        taskBoardId: jobId,
        parentId: destinationParentId,
        companyTeamId: team_id,
        projectGroupId: group_id,
      });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskVisibilityWhitelist = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<{ teams?: CompanyTeamId[]; members?: CompanyMemberId[] }> => {
  try {
    const res = await knex
      .from(TableNames.TASK_VISIBILITY)
      .where('task_id', taskId)
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

const addToTaskVisibilityWhitelist = async ({
  taskId,
  teamIds,
  memberIds,
}: {
  taskId: TaskId;
  teamIds?: CompanyTeamId[];
  memberIds?: CompanyMemberId[];
}) => {
  try {
    if (teamIds) {
      await knex(TableNames.TASK_VISIBILITY)
        .insert(
          teamIds.map((teamId) => ({
            task_id: taskId,
            team_id: teamId,
          })),
        )
        .onConflict('(task_id, team_id)')
        .merge();
    }

    if (memberIds) {
      await knex(TableNames.TASK_VISIBILITY)
        .insert(
          memberIds.map((memberId) => ({
            task_id: taskId,
            member_id: memberId,
          })),
        )
        .onConflict('(task_id, member_id)')
        .merge();
    }

    const res = await knex
      .from(TableNames.TASKS)
      .where('id', taskId)

      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCurrentMemberVisibilityIds = async (taskId: TaskId) => {
  const members = await knex(TableNames.TASK_VISIBILITY)
    .where('task_id', taskId)
    .whereNotNull('member_id')
    .select('member_id');
  return camelize(members.map((record) => record.member_id));
};

const getCurrentTeamVisibilityIds = async (taskId: TaskId) => {
  const teams = await knex(TableNames.TASK_VISIBILITY)
    .where('task_id', taskId)
    .whereNotNull('team_id')
    .select('team_id');
  return camelize(teams.map((record) => record.team_id));
};

const removeFromTaskVisibilityWhitelist = async ({
  taskId,
  memberIds = [],
  teamIds = [],
}: {
  taskId: TaskId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
}) => {
  try {
    let query = ``;
    if (memberIds.length > 0 && teamIds.length > 0) {
      query = `WHERE task_id = ${taskId} AND (member_id IN(${memberIds}) OR team_id IN(${teamIds}))`;
      query = `WHERE task_id = ${taskId} AND (member_id IN(${memberIds}) OR team_id IN(${teamIds}))`;
    } else if (memberIds.length > 0) {
      query = `WHERE task_id = ${taskId} AND member_id IN(${memberIds})`;
    } else if (teamIds.length > 0) {
      query = `WHERE task_id = ${taskId} AND team_id IN(${teamIds})`;
    }

    await knex.raw(`
			DELETE FROM ${TableNames.TASK_VISIBILITY} ${query}
		`);

    const res = await knex
      .from(TableNames.TASKS)
      .where('id', taskId)

      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const setTaskVisibility = async ({
  taskId,
  visibility,
  userId,
}: {
  taskId: TaskId;
  visibility: number;
  userId: UserId;
}) => {
  try {
    await knex(TableNames.TASKS)
      .update({
        visibility,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', taskId);

    // If visibility is not custom, remove all members and teams from the visibility whitelist
    if (visibility !== 3) {
      await knex(TableNames.TASK_VISIBILITY).where('task_id', taskId).delete();
    }

    const res = await knex.from(TableNames.TASKS).where('id', taskId).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTeamsForTaskIds = async ({ ids }: { ids: TaskId[] }) => {
  try {
    const res = await knex
      .from({ tbt: TableNames.TASK_BOARD_TEAMS })
      .innerJoin({ t: TableNames.TASKS }, 'tbt.job_id', 't.job_id')
      .whereIn('t.job_id', ids)
      .select('tbt.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getVisibilityForTaskIds = async ({
  ids,
}: {
  ids: TaskBoardId[];
}): Promise<CommonVisibilityModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_VISIBILITY)
      .whereIn('task_id', ids)

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCustomValuesForTaskId = async (taskId: TaskId) => {
  try {
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

const createUnassignedGroupForAllTasks = async () => {
  try {
    const tasks = await knex
      .from(TableNames.TASKS)
      .where({
        group_id: null,
      })
      .select('id', 'job_id');

    //group by job_id renamed as jobId
    const groupedTasks = _.groupBy(tasks, 'job_id');

    Object.entries(groupedTasks).forEach(async ([jobId, tasks]) => {
      const taskIds = tasks.map((task) => task.id);

      const group = await WorkspaceStore.createProjectGroup({
        projectId: +jobId,
        name: 'Unassigned@DEBUG',
      });

      await WorkspaceStore.moveGroupTasks({ taskIds, groupId: group.id });
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProject = async (projectId: ProjectId): Promise<ProjectModel> => {
  try {
    const res = await knex
      .from(TableNames.PROJECTS)
      .where('id', projectId)

      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const assignChildTasksWithNoGroupId = async () => {
  try {
    const res = await knex
      .from(TableNames.TASKS)
      .whereNull('group_id')
      .whereNotNull('parent_id')
      .select('id', 'parent_id');

    const groupedTasks = _.groupBy(res, 'parent_id');

    Object.entries(groupedTasks).forEach(async ([parentId, tasks]) => {
      const taskIds = tasks.map((task) => task.id);

      const parentTask = (await getTask(+parentId)) as TaskModel;

      await WorkspaceStore.moveGroupTasks({
        taskIds,
        groupId: parentTask?.groupId,
      });
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  addTaskMembers,
  addTaskPics,
  addSubtask,
  addTeamIdTaskBoard,
  createTask,
  createTaskAttachment,
  createTaskBoard,
  createProjectBoard,
  createTaskBoardTeam,
  createTaskActivity,
  createTaskTimerEntry,

  deleteTasks,
  deleteTaskAttachment,
  deleteTaskBoards,
  deleteTaskMembers,
  deleteTaskPics,
  deleteTaskComment,
  deleteSubtasks,
  deleteTaskBoardTeams,
  getByCompanyId,
  getByTaskBoardName,
  getByTaskName,
  getCommentsByTaskId,
  getSubtasksByTaskId,
  getTaskAttachmentByTaskId,
  getTaskMembersByTaskId,
  getTaskMembersByTaskIdAndMemberId,
  getTaskPicsByTaskId,
  getTaskPicsByTaskIdAndPicId,
  getTasksByTaskBoardId,
  getTaskMembers,
  getTaskBoardTeams,
  getTasksForTeam,
  getTaskActivities,
  getTasksByTeamId,
  getTaskBoardTeamById,
  getTaskAttachmentsByTaskId,
  getTaskAttachment,
  getTaskAttachmentByPublicId,
  getTask,
  getTasks,
  getTasksById,
  getTaskPics,
  getTasksAssignedToStatusId,
  getTaskByTimesheetId,
  getTaskBoardOwnersByTaskBoardId,
  updateTask,
  updateSubtask,
  updateTaskComment,
  updateTaskBoard,
  updateTasksSequence,
  updateTasksArchivedState,
  updateActualCost,
  updateTaskBoardsArchivedState,
  updateTaskBoardOwners,
  getCollaborationTaskBoard,
  getOpenTaskTimers,
  getTaskTimerTotals,
  closeTaskTimerEntry,
  updateActualStart,
  updateActualEnd,
  copyTask,
  copyChecklists,
  insertTaskAttachments,
  getTaskAttachmentsByCommentIds,
  linkAttachmentToComment,
  unlinkAttachmentFromComment,
  getTaskBoardTeamByBoardId,
  updateTaskWithTemplateId,
  editTaskComment,
  getTaskBoardTeamsByCompanyId,
  removeTaskPics,
  postTaskComment,
  updateSubtaskSequences,
  getTeamsForTaskBoardIds,
  getOwnersForTaskBoardIds,
  toggleTasksPinned,
  linkExternalAttachments,
  getTasksV3,
  getTaskBoardsV3,
  toggleTasksPublishStatus,
  getSharedTasks,
  addTaskWatchers,
  removeTaskWatchers,
  getTaskWatchers,
  createTaskLegacy,
  isTaskPublished,
  changeTaskPosY,
  getTaskSequence,
  updateTaskStatusId,
  getChildTasks,
  getTasksByProjectGroupId,
  getTasksByProjectId,
  importTasks,
  batchAssignTaskMembers,
  updateTaskParent,
  updateTaskWithTeamStatus,
  updateDeleteDuplicatedStatuses,
  changeProjectStatusName,
  updateActualEffort,
  copySubtasks,
  getTaskVisibilityWhitelist,
  addToTaskVisibilityWhitelist,
  removeFromTaskVisibilityWhitelist,
  setTaskVisibility,
  getTeamsForTaskIds,
  getVisibilityForTaskIds,
  getCustomValuesForTaskId,
  createUnassignedGroupForAllTasks,
  getProject,
  getTaskById,
  setCachedTasksByProject,
  getTasksByProjectGroupIdLength,
  getCurrentMemberVisibilityIds,
  getCurrentTeamVisibilityIds,
  ...TaskBoardStoreFunctions,
};
