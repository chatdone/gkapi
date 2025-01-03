/* eslint-disable prefer-const */
import knex from '@db/knex';
import { v4 as uuid } from 'uuid';
import { validate as isEmail } from 'isemail';
import {
  TaskStore,
  createLoaders,
  TimesheetStore,
  CompanyStore,
  WorkspaceStore,
  SubscriptionStore,
} from '@data-access';
import {
  ContactService,
  EmailService,
  SocketService,
  StorageService,
  SubscriptionService,
  TagService,
  WorkspaceService,
} from '@services';
import { TaskBoardType } from '@generated/graphql-types';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamId,
  CompanyTeamStatusModel,
} from '@models/company.model';
import _ from 'lodash';
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
  TaskBoardTeamModel,
  TaskAttachmentPayload,
  TaskCommentId,
  SubtaskId,
  TaskBoardPayload,
  TaskUpdatePayload,
  TaskBoardUpdatePayload,
  TaskBoardTeamId,
  TaskBoardTeamPayload,
  TaskActivityModel,
  TaskCreateMemberPayload,
  TaskCreateInitialPayload,
  TaskActivityPayload,
  SubtaskInitialPayload,
  SubtaskUpdatePayload,
  TaskCommentUpdatePayload,
  TaskCreatePayload,
  TaskAttachmentPublicId,
  TaskStatusId,
  TaskStatusModel,
  TaskTimerEntryModel,
  TaskTimerTotalModel,
  TaskBoardOwnerModel,
  TaskPublicId,
  TaskBoardVisibilityModel,
  ExternalAttachmentModel,
  TaskFilter,
  TaskSort,
  TaskBoardFilter,
  TaskWatcherModel,
  ProjectModel,
  TaskKanbanPosition,
  ProjectGroupId,
  ProjectStatusId,
  ProjectStatusModel,
  ProjectId,
  TaskModelRefactor,
} from '@models/task.model';
import { UserId, UserModel } from '@models/user.model';
import { TeamId } from '@models/team.model';
import s3 from '@tools/s3';
import { ContactPicModel } from '@models/contact.model';
import { UserInputError } from 'apollo-server-errors';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import TaskBoardServiceFunctions from './task-board.service';
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(tz);

import {
  CompanyService,
  EventManagerService,
  FilterService,
  TimesheetService,
} from '@services';
import { consoleLog, getDateDuration } from '@tools/utils';
import {
  AttachmentPayload,
  CommonVisibilityModel,
  DataLoaders,
} from '@models/common.model';
import { FilterOptionsModel } from '@models/filter.model';
import {
  TimesheetActivityModel,
  TimesheetId,
  TimesheetModel,
} from '@models/timesheet.model';
import { CompanyStageType, ResourceTypes } from '@services/company/constant';
import logger from '@tools/logger';
import { TemplateId } from '@models/template.model';
import { TagModel } from '@models/tag.model';
import {
  CommonVisibilityTypes,
  TaskBoardVisibilityTypes,
} from './task.constant';
import { ACTION_TYPES } from '@services/event-manager/event-manager.constants';
import { TASK_INVOICE } from '@tools/email-templates';
import { processFileStream } from '@utils/file.util';
import { TASK_KANBAN_POSITION_BUFFER } from '@constants';
import * as fs from 'fs';

type CreateTaskInput = {
  user: UserModel;
  name: string;
  description?: string;
  project: ProjectModel;

  pics: ContactPicModel[];
  loaders: DataLoaders; // FIXME: this needs to be deprecated out

  /* NOTE: Personal tasks will have a stage but no taskStatus
	Team tasks will have a taskStatus but no stage */
  stage?: number; // this maps to stageStatus from resolver
  taskStatus?: TaskStatusModel; // this maps to the subStatusId (data model)
  /* END NOTE */

  parentId?: TaskId;
  tags?: TagModel[];
  memberPublicIds?: string[]; // FIXME: Deprecate this to use memberIds
  teamId?: TeamId;
  dueDate?: string;
  value?: number;
  startDate?: string;
  endDate?: string;
  plannedEffort?: number;
  projectedCost?: number;
  priority?: number;
  visibility?: number;
  published?: boolean;
  posY?: number;
  groupId?: ProjectGroupId;
  statusId?: ProjectStatusId;
};

type UpdateTaskParentInput = {
  childId: TaskId;
  sourceParentId: TaskId;
  destinationParentId: TaskId;
  user: UserModel;
};

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];

const isMemberAssignedToBoard = ({
  board,
  userId,
  boardOwners,
  companyMemberId,
  userTeamIds,
  boardTeamIds,
}: {
  board: TaskBoardModel;
  userId: UserId;
  boardOwners: TaskBoardOwnerModel[];
  companyMemberId: CompanyMemberId;
  userTeamIds: TeamId[];
  boardTeamIds: TaskBoardTeamId[];
}) => {
  const isCreator = board.createdBy === userId;
  const isBoardOwner = !!_.find(boardOwners, {
    jobId: board.id,
    companyMemberId,
  });

  const isInTeam = _.intersection(userTeamIds, boardTeamIds).length > 0;

  return isCreator || isBoardOwner || isInTeam;
};

const isMemberSpecificVisibleOnBoard = ({
  board,
  userId,
  boardVisibility,
  companyMemberId,
  userTeamIds,
}: {
  board: TaskBoardModel;
  userId: UserId;
  boardVisibility: TaskBoardVisibilityModel[];
  companyMemberId: CompanyMemberId;
  userTeamIds: TeamId[];
}) => {
  const isCreator = board.createdBy === userId;
  let vTeams = [];
  let vMembers = [];
  const visibility = boardVisibility.filter((e) => e.boardId === board.id);
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

const isBoardVisible = ({
  board,
  userId,
  boardTeamIds,
  boardOwners,
  userTeamIds,
  member,
  boardVisibility,
}: {
  board: TaskBoardModel;
  userId: UserId;
  boardTeamIds: TaskBoardTeamId[];
  boardOwners: TaskBoardOwnerModel[];
  userTeamIds: TeamId[];
  member: CompanyMemberModel;
  boardVisibility: TaskBoardVisibilityModel[];
}) => {
  try {
    const { visibility } = board;

    /* These visibility check functions are split out because the
		same logic is used in other functions. - Enoch */

    // user is the creator of the board
    if (board.createdBy === userId) {
      return true;
    }

    if (visibility === TaskBoardVisibilityTypes.PUBLIC) {
      return true;
    } else if (visibility === TaskBoardVisibilityTypes.ASSIGNED) {
      return exportFunctions.isMemberAssignedToBoard({
        board,
        userId,
        boardOwners,
        boardTeamIds,
        userTeamIds,
        companyMemberId: member.id,
      });
    } else if (visibility === TaskBoardVisibilityTypes.SPECIFIC) {
      return exportFunctions.isMemberSpecificVisibleOnBoard({
        board,
        userId,
        boardVisibility,
        userTeamIds,
        companyMemberId: member.id,
      });
    } else if (visibility === TaskBoardVisibilityTypes.PRIVATE) {
      return board.createdBy === userId;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const filterVisibleBoards = async ({
  boards,
  userId,
  companyId,
}: {
  boards: TaskBoardModel[];
  userId: UserId;
  companyId: CompanyId;
}) => {
  try {
    const boardIds = boards.map((b) => b.id);

    const member = (await CompanyStore.getMemberByUserIdAndCompanyId({
      userId,
      companyId,
    })) as CompanyMemberModel;

    const userTeams = await CompanyStore.getCompanyTeamsByUserId({
      userId,
      companyId,
    });

    const userTeamIds = userTeams.map((team) => team?.id);

    const boardTeams = await TaskStore.getTeamsForTaskBoardIds({
      ids: boardIds,
    });

    const boardOwners = await TaskStore.getOwnersForTaskBoardIds({
      ids: boardIds,
    });

    const boardVisibility = await TaskStore.getVisibilityForTaskBoardIds({
      ids: boardIds,
    });

    let taskBoards = [];

    for (const board of boards) {
      const boardTeamIds = boardTeams
        .filter((bt) => bt?.jobId === board?.id)
        .map((bt) => bt?.teamId);

      const isProjectVisible = await exportFunctions.isBoardVisible({
        board,
        boardTeamIds,
        userId,
        member,
        boardOwners,
        boardVisibility,
        userTeamIds,
      });

      if (isProjectVisible) {
        taskBoards.push(board);
      }
    }

    return taskBoards;
  } catch (error) {
    const err = error as Error;
    return Promise.reject(error);
  }
};

const getByCompanyId = async ({
  taskType,
  userId,
  companyId,
  payload,
  filters,
}: {
  taskType: TaskBoardType;
  userId: UserId;
  companyId: CompanyId;
  payload: { company_id: CompanyId; category?: number };
  filters?: { assignedToMember?: { memberId?: CompanyMemberId } };
}): Promise<(TaskBoardModel | Error)[]> => {
  try {
    let boards = (await TaskStore.getByCompanyId({
      taskType,
      payload,
    })) as TaskBoardModel[];

    let taskBoards = await exportFunctions.filterVisibleBoards({
      boards,
      userId,
      companyId,
    });

    const filterBoards = (await FilterService.filterPersonalTaskBoards({
      taskboards: taskBoards,
      userId,
    })) as TaskBoardModel[];

    // Get only assigned to this member
    if (filters?.assignedToMember?.memberId) {
      const filteredAssignedToMember =
        await exportFunctions.filterVisibleBoards({
          boards: filterBoards,
          userId,
          companyId,
        });

      taskBoards = filteredAssignedToMember;
    } else {
      taskBoards = filterBoards;
    }

    return taskBoards;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getByCompanyId',
        userId,
        companyId,
        payload,
        filters,
      },
    });

    return [];
  }
};

const getTaskBoardsV3 = async ({
  companyId,
  filter,
  sort,
}: {
  companyId: CompanyId;
  filter: TaskBoardFilter;
  sort: TaskSort;
}): Promise<(TaskBoardModel | Error)[]> => {
  try {
    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId,
    });

    const res = await TaskStore.getTaskBoardsV3({
      companyId,
      filter,
      sort,
      companyTimezone,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        companyId,
        filter,
        sort,
        service,
        fnName: 'getTaskBoardsV3',
      },
    });

    return Promise.reject(err);
  }
};

const getSubtasksByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(SubtaskModel | Error)[]> => {
  try {
    const res = await TaskStore.getSubtasksByTaskId({ taskId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        service,
        fnName: 'getSubtasksByTaskId',
      },
    });

    return [];
  }
};

const getTaskPicsByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskPicsByTaskId({ taskId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        service,
        fnName: 'getTaskPicsByTaskId',
      },
    });
    return [];
  }
};

const getTaskMembersByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskMemberModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskMembersByTaskId({ taskId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        service,
        fnName: 'getTaskMembersByTaskId',
      },
    });

    return [];
  }
};

const getTasksByTaskBoardId = async ({
  id,
  filters,
  memberId,
  limit,
  offset,
}: {
  id: TaskBoardId;
  filters?: FilterOptionsModel;
  memberId: CompanyMemberId;
  limit?: number;
  offset?: number;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await TaskStore.getTasksByTaskBoardId({ id, limit, offset });

    const tasks = filters ? await FilterService.Filter(res, filters) : res;

    return tasks;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        id,
        service,
        fnName: 'getTasksByTaskBoardId',
      },
    });
    return [];
  }
};

const getTaskMembers = async (
  memberId: CompanyMemberId,
): Promise<(TaskMemberModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskMembers(memberId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        memberId,
        fnName: 'getTaskMembers',
      },
    });
    return Promise.reject(error);
  }
};

const getCommentsByTaskId = async ({
  loaders,
  taskId,
}: {
  loaders: any;
  taskId: TaskId;
}): Promise<(TaskCommentModel | Error)[]> => {
  try {
    const res = (await TaskStore.getCommentsByTaskId({
      taskId,
    })) as TaskCommentModel[];
    if (_.head(res) instanceof Error) {
      return Promise.reject(res);
    }

    const convertedComments = (await getConvertedComments({
      loaders,
      taskComments: res as TaskCommentModel[],
    })) as TaskCommentModel[];

    const commentIds = res.map((comment) => comment.id);

    const attachments = await TaskStore.getTaskAttachmentsByCommentIds({
      commentIds,
    });

    const commentsWithAttachments = appendAttachmentsToComments({
      attachments,
      comments: convertedComments,
    });

    return commentsWithAttachments;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        service,
        fnName: 'getCommentsByTaskId',
      },
    });
    return [];
  }
};

const appendAttachmentsToComments = ({
  attachments,
  comments,
}: {
  attachments: TaskAttachmentModel[];
  comments: TaskCommentModel[];
}): TaskCommentModel[] => {
  return comments.map((comment) => ({
    ...comment,
    attachments: attachments.filter(
      (attachment) => attachment.commentId === comment.id,
    ),
  }));
};

const getConvertedComments = async ({
  loaders,
  taskComments,
}: {
  loaders: any;
  taskComments: TaskCommentModel[];
}): Promise<TaskCommentModel[]> => {
  try {
    const convertedComments = Promise.all(
      taskComments.map(async (comment: TaskCommentModel) => {
        const commentMessage = await getMentionName({
          loaders,
          message: comment.message,
        });

        return {
          ...comment,
          message: commentMessage,
        };
      }),
    );

    return convertedComments;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskComments,
        service,
        fnName: 'getConvertedComments',
      },
    });
    return [];
  }
};

const USER_NOT_FOUND = 'USER_NOT_FOUND';

const getMentionName = async ({
  loaders,
  message,
}: {
  loaders: any;
  message: string;
}): Promise<string> => {
  try {
    const regExp = /@\[(.*?)\]/; //Get everything inside @[*]
    const arrMessage = message?.split(' ') || [];
    // eslint-disable-next-line prefer-const
    let stringArr = [];
    for (let i = 0; i < arrMessage.length; i++) {
      // TODO: Error handling for string like this: 'connectedToAtSymbol@[uuid]'
      // TODO: Error handling for string like this: '@[AlreadyAName]'
      // TODO:Look into markdowns when passing messages
      if (arrMessage[i].includes('@[')) {
        const stringWithAtBrackets = arrMessage[i];
        const RegExpExecArray = regExp.exec(
          stringWithAtBrackets,
        ) as RegExpExecArray;

        if (_.isEmpty(RegExpExecArray)) {
          return message;
        }
        const userId = RegExpExecArray[1];
        const actualUserId = userId.replace(/@\[(.*?)\]/g, '$1');
        const isNaN = _.isNaN(+actualUserId);

        if (isNaN) {
          return message;
        }
        const user = (await loaders.users.load(parseInt(userId))) as UserModel;
        stringArr.push(
          arrMessage[i].replace(
            /@\[(.*?)\]/g,
            `@${user ? (user.name ? user.name : user.email) : USER_NOT_FOUND}`,
          ),
        );
      } else {
        stringArr.push(arrMessage[i]);
      }
    }

    const convertedMessage = stringArr.join(' ');
    return convertedMessage;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        message,
        service,
        fnName: 'getMentionName',
      },
    });
    return Promise.reject(error);
  }
};

const createTaskAttachment = async ({
  taskId,
  attachment,
  user,
  commentId,
  companyId,
}: {
  taskId: TaskId;
  attachment: TaskAttachmentPayload;
  user: UserModel;
  commentId: TaskCommentId | null;
  companyId: CompanyId;
}): Promise<TaskAttachmentModel | Error> => {
  try {
    const bytesToUpload = await StorageService.getFileSize(attachment);

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'storage',
      quota: bytesToUpload,
      isDecrement: true,
    });

    const uploaded = await s3.processUploadToS3({
      attachment,
      s3Directory: 'attachments/',
      isPublicAccess: false,
      companyId,
    });

    if (!uploaded.success) throw new Error('Upload failed');

    const payload = {
      name: uploaded.name,
      type: uploaded.type,
      file_size: bytesToUpload,
      url: uploaded.url,
      card_id: taskId,
      document_hash: uploaded.hash_result,
      created_by: user.id,
      updated_by: user.id,
      path: uploaded.path,
    };

    const res = (await TaskStore.createTaskAttachment({
      payload,
    })) as TaskAttachmentModel;

    if (commentId) {
      await linkAttachmentToComment({
        attachmentId: res.id,
        commentId,
        user,
      });
    }

    await createTaskActivity({
      payload: {
        action_type: ACTION_TYPES.ATTACHMENT_UPLOADED,
        created_by: user.id,
        card_id: taskId,
        attachment_id: res.id,
      },
    });

    await EventManagerService.logTaskAttachmentUploaded({
      taskAttachment: res,
      uploadedBy: user,
      changedValue: { uploaded_attachment: true },
    });

    await EventManagerService.handleNotifyUploadedToTask(res, user);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        attachment,
        userId: user?.id,
        commentId,
        companyId,
        service,
        fnName: 'createTaskAttachment',
      },
    });
    return Promise.reject(error);
  }
};

const deleteTaskAttachment = async ({
  taskId,
  taskAttachmentIds,
  user,
  loaders,
  companyId,
}: {
  taskId: TaskId;
  taskAttachmentIds: TaskAttachmentId[];
  user: UserModel;
  loaders: any;
  companyId: CompanyId;
}): Promise<number | Error> => {
  try {
    let totalSize = 0;
    await Promise.all(
      _.map(taskAttachmentIds, async (tId) => {
        const ta = (await loaders.taskAttachments.load(
          tId,
        )) as TaskAttachmentModel;

        totalSize += ta.file_size;

        await EventManagerService.logTaskAttachmentUploaded({
          taskAttachment: ta,
          uploadedBy: user,
          changedValue: { uploaded_attachment: false },
        });
      }),
    );

    const res = await TaskStore.deleteTaskAttachment({
      taskAttachmentIds,
      userId: user.id,
    });
    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'storage',
      quota: totalSize,
    });

    taskAttachmentIds.forEach(async (id) => {
      await createTaskActivity({
        payload: {
          action_type: 'ATTACHMENT_REMOVED',
          created_by: user.id,
          card_id: taskId,
          attachment_id: id,
        },
      });
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        taskAttachmentIds,
        userId: user?.id,
        service,
        fnName: 'deleteTaskAttachment',
      },
    });

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
    const res = await TaskStore.deleteTaskComment({ taskCommentId, taskId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskCommentId,
        service,
        fnName: 'deleteTaskComment',
      },
    });
    return Promise.reject(error);
  }
};

const deleteSubtasks = async ({
  subtaskIds,
}: {
  subtaskIds: SubtaskId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await TaskStore.deleteSubtasks({ subtaskIds });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        subtaskIds,
        service,
        fnName: 'deleteSubtasks',
      },
    });
    return Promise.reject(error);
  }
};

const deleteTasks = async ({
  tasks,
  user,
  companyId,
  projectIds,
}: {
  user: UserModel;
  tasks: TaskModel[];
  companyId: CompanyId;
  projectIds: ProjectId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const taskIds = _.map(tasks, 'id');
    const attachments = await WorkspaceStore.getAttachmentsByTaskIds(taskIds);

    const totalFileSize = _.sumBy(attachments, 'fileSize');

    const res = await TaskStore.deleteTasks({
      userId: user.id,
      taskIds: tasks.map((t) => t.id),
      projectIds,
      companyId,
    });

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'storage',
      quota: totalFileSize,
    });

    const isProject = _.some(tasks, (t) => t.end_date);

    tasks.forEach(async (task) => {
      await EventManagerService.handleNotifyTaskDeleted({
        task,
        deletedBy: user,
        companyId,
      });

      await createTaskActivity({
        payload: {
          card_id: task.id,
          created_by: user.id,
          action_type: isProject
            ? ACTION_TYPES.PROJECT_TASK_REMOVED
            : ACTION_TYPES.TASK_REMOVED,
        },
      });

      await TimesheetStore.deleteViewsForTask({ taskId: task.id });
    });

    await EventManagerService.logTaskCreateDelete({
      tasks,
      updatedBy: user,
      changedValue: {
        is_create: false,
        task: isProject ? false : true,
        project_task: isProject ? true : false,
      },
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskIds: tasks.map((t) => t?.id),
        userId: user?.id,
        service,
        fnName: 'deleteTasks',
      },
    });
    return Promise.reject(error);
  }
};

const deleteTaskBoardTeams = async ({
  taskBoardTeams,
  isV3,
}: {
  taskBoardTeams: TaskBoardTeamModel[];
  isV3: boolean;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const taskBoardTeamIds = taskBoardTeams.map((tbt) => {
      return tbt.id;
    });

    const res = await TaskStore.deleteTaskBoardTeams({
      taskBoardTeamIds,
      isV3,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskBoardTeams,
        isV3,
        service,
        fnName: 'deleteTaskBoardTeams',
      },
    });
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
    const res = await TaskStore.getByTaskBoardName({ type, name, companyId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        type,
        name,
        companyId,
        service,
        fnName: 'getByTaskBoardName',
      },
    });
    return Promise.reject(err);
  }
};

const createTaskBoard = async ({
  payload,
  owners,
}: {
  payload: TaskBoardPayload;
  owners: CompanyMemberId[] | null | undefined;
}): Promise<TaskBoardModel | Error> => {
  try {
    const { type, company_id } = payload;
    if (payload.name && type !== 'Collaboration') {
      const getSameName = await getByTaskBoardName({
        type,
        name: payload.name,
        companyId: company_id,
      });
      if (!_.isEmpty(getSameName)) {
        throw new UserInputError('Cannot have the same task board name');
      }
    }

    if (type === 'Collaboration' && payload.category !== 1) {
      const collaborationBoard = (await TaskStore.getCollaborationTaskBoard({
        contactId: payload.contact_id as number,
        companyId: payload.company_id,
      })) as TaskBoardModel[];

      if (
        collaborationBoard?.length > 0 &&
        collaborationBoard.some((b) => b.category === payload.category)
      ) {
        throw new UserInputError('The board already exists');
      }
    }

    const res = await TaskStore.createTaskBoard({
      payload,
    });

    if (owners) {
      await TaskStore.updateTaskBoardOwners({
        boardId: (res as TaskBoardModel).id,
        companyMemberIds: owners,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        owners,
        service,
        fnName: 'createTaskBoard',
      },
    });
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
    const { type, company_id } = payload;
    if (payload.name && type !== 'Collaboration') {
      const getSameName = await getByTaskBoardName({
        type,
        name: payload.name,
        companyId: company_id,
      });
      if (getSameName) {
        throw new UserInputError('Cannot have the same task board name');
      }
    }

    if (type === 'Collaboration') {
      const collaborationBoard = (await TaskStore.getCollaborationTaskBoard({
        contactId: payload.contact_id as number,
        companyId: payload.company_id,
      })) as TaskBoardModel[];

      if (
        collaborationBoard?.length > 0 &&
        collaborationBoard.some((b) => b.category === payload.category)
      ) {
        throw new UserInputError('The board already exists');
      }
    }

    const res = await TaskStore.createProjectBoard({
      payload,
      teamId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        teamId,
        service,
        fnName: 'createProjectBoard',
      },
    });
    return Promise.reject(error);
  }
};

const createTaskBoardTeam = async ({
  payload,
}: {
  payload: TaskBoardTeamPayload;
}): Promise<TaskBoardTeamModel | Error> => {
  try {
    const res = await TaskStore.createTaskBoardTeam({ payload });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        service,
        fnName: 'createTaskBoardTeam',
      },
    });
    return Promise.reject(error);
  }
};

const addTeamIdTaskBoard = async ({
  id,
  team_id,
}: {
  id: TaskBoardId;
  team_id: TeamId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await TaskStore.addTeamIdTaskBoard({ id, team_id });
    return Promise.resolve(res);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        id,
        service,
        fnName: 'addTeamIdTaskBoard',
      },
    });
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
    const res = TaskStore.getByTaskName({ name, type });
    return Promise.resolve(res);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        name,
        type,
        service,
        fnName: 'getByTaskName',
      },
    });
    return Promise.reject(error);
  }
};

/* DEPRECATION NOTICE: 
Deprecate once new createTask is ready -- Enoch
*/
const createTaskLegacy = async ({
  loaders,
  memberIds,
  picIds,
  payload,
  user,
  creatorMemberId,
  tags,
}: {
  loaders: DataLoaders;
  memberIds: string[] | undefined[];
  picIds?: string[];
  payload: TaskCreateInitialPayload;
  user: UserModel;
  creatorMemberId?: CompanyMemberId;
  tags?: TagModel[];
}): Promise<TaskModel | Error> => {
  try {
    let subStatusId = null;
    let status = 1;

    let insert: TaskCreatePayload = {
      name: payload.name,
      description: payload.description,
      createdBy: user.id,
      jobId: payload.jobId,
      teamId: payload.teamId,
      subStatusId: payload.subStatusId ? payload.subStatusId : null,
      dueDate: payload.dueDate,
      status: payload.status ? payload.status : 1,
      value: payload.value ? payload.value : 0,
      startDate: payload.startDate,
      endDate: payload.endDate,
      plannedEffort: payload.plannedEffort ? payload.plannedEffort : 0,
      projectedCost: payload.projectedCost ? payload.projectedCost : 0,
      priority: payload.priority ? payload.priority : 0,
      sequence: 0,
      published: payload.published,
    };

    if (payload.subStatusId && payload.subStatusId !== '') {
      const companyTeamStatus = (await loaders.teamStatuses.load(
        payload.subStatusId as string,
      )) as CompanyTeamStatusModel;

      if (!companyTeamStatus) {
        throw new UserInputError('Company team status does not exist');
      }

      let actualStartEndValue: { actual_start?: any; actual_end?: any } = {};
      const completed = companyTeamStatus.parent_status === 2 ? 1 : 0;

      if (
        _.toNumber(companyTeamStatus?.percentage) !== 0 &&
        companyTeamStatus?.parent_status === 1
      ) {
        actualStartEndValue = {
          actual_start: knex.fn.now() as any,
        };
      } else if (completed === 1 || companyTeamStatus?.parent_status === 3) {
        actualStartEndValue = {
          actual_end: knex.fn.now(),
        };
      } else {
        actualStartEndValue = {
          actual_start: null,
          actual_end: null,
        };
      }

      subStatusId = companyTeamStatus.id;
      status = companyTeamStatus.parent_status;

      insert = {
        ...insert,
        actualStart: actualStartEndValue?.actual_start,
        actualEnd: actualStartEndValue?.actual_end,
        subStatusId: subStatusId,
        status,
      };
    } else if (payload.status) {
      status = payload.status;

      insert = {
        ...insert,
        subStatusId: null,
        status,
      };
    }

    if (payload.startDate && !payload.endDate) {
      throw new Error('Start date should also have an end date');
    } else if (!payload.startDate && payload.endDate) {
      throw new Error('End date should also have a start date');
    }

    const res = (await TaskStore.createTaskLegacy({
      payload: {
        ...insert,
        sequence: payload.teamId
          ? await getTaskSequence({ teamId: payload.teamId as TeamId })
          : 0, //TODO: Get proper sequence number
      },
    })) as TaskModel;

    const taskboard = (await loaders.taskBoards.load(
      res?.job_id,
    )) as TaskBoardModel;

    const isProject = taskboard.category === 1;

    await EventManagerService.logTaskCreateDelete({
      tasks: [res],
      updatedBy: user,
      changedValue: {
        is_create: true,
        task: isProject ? false : true,
        project_task: isProject ? true : false,
      },
    });

    await createTaskActivity({
      payload: {
        action_type: ACTION_TYPES.TASK_CREATED,
        created_by: user.id,
        card_id: res.id,
      },
    });

    await addTaskPicsForCreateTask({ task: res, picIds, loaders, user });

    await addTaskMembersForCreateTask({
      task: res,
      memberIds,
      user,
      loaders,
    });

    if (payload?.startDate) {
      await TimesheetService.createTimesheetActivity({ taskId: res.id });
    }

    if (tags && !_.isEmpty(tags)) {
      await TagService.assignTagsToTask({
        tagIds: tags?.map((tag) => tag.id),
        taskId: res?.id,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        memberIds,
        picIds,
        payload,
        userId: user.id,
        creatorMemberId,
        tags: tags ? tags.map((tag) => tag.id) : [],
        service,
        fnName: 'createTask',
      },
    });
    return Promise.reject(error);
  }
};

const generateCreateTaskValues = (input: CreateTaskInput) => {
  const {
    user,
    name,
    description,
    project,
    taskStatus,
    teamId,
    dueDate,
    value,
    startDate,
    endDate,
    plannedEffort,
    projectedCost,
    priority,
    visibility,
    published,
    stage,
    groupId,
    parentId,
    statusId,
  } = input;

  let completed = false;
  let stageType = null;
  let startEndDates = null;

  if (taskStatus) {
    // NOTE: This is a team task
    completed = taskStatus.stage === CompanyStageType.CLOSED ? true : false;
    startEndDates = exportFunctions.getActualStartEndDates({
      percentage: taskStatus.percentage,
      stageType: taskStatus.stage,
    });
    stageType = taskStatus.stage;
  } else {
    // NOTE: This is a personal task
    completed = stage === CompanyStageType.CLOSED ? true : false;
    stageType = stage;
  }

  let values = {
    name,
    description,
    createdBy: user.id,
    projectId: project.id,
    stageType: stageType || CompanyStageType.PENDING,
    taskStatusId: taskStatus?.id,
    teamId,
    dueDate,
    value: value || 0,
    startDate,
    endDate,
    plannedEffort: plannedEffort || 0,
    projectedCost: projectedCost || 0,
    priority: priority || 2, // FIXME: Refactor to a constant
    sequence: 0,
    visibility,
    published,
    completed,
    groupId,
    parentId,
    statusId,
    companyId: user?.activeCompany as CompanyId,
    ...startEndDates,
  };

  return values;
};

const getActualStartEndDates = ({
  percentage,
  stageType,
}: {
  percentage: number;
  stageType: number;
}) => {
  const values: { [key: string]: null | string } = {
    actualStart: null,
    actualEnd: null,
  };

  const isTaskInProgress =
    percentage > 0 && stageType === CompanyStageType.PENDING;
  const isTaskCompleted = stageType === CompanyStageType.CLOSED;

  if (isTaskInProgress) {
    values.actualStart = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');
  } else if (isTaskCompleted) {
    values.actualEnd = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');
  }

  return values;
};

const calculateTaskPositionY = async ({
  taskStatusId,
  posY,
}: {
  taskStatusId?: TaskStatusId;
  posY?: number;
}) => {
  let targetPosY = null;

  // NOTE: If there's a task status, then we need to calculate the y position for the kanban
  if (taskStatusId) {
    const tasksInStatus = (await exportFunctions.getTasksAssignedToStatusId(
      taskStatusId,
    )) as TaskModelRefactor[];

    // If frontend sends the pos y then it gets priority otherwise we calculate it
    if (posY) {
      targetPosY = posY;
    } else {
      if (_.isEmpty(tasksInStatus)) {
        return TASK_KANBAN_POSITION_BUFFER;
      }

      const positions = tasksInStatus?.map((task) => task?.posY || 0);
      const highestPosition = Math.max(...positions);

      targetPosY = highestPosition + TASK_KANBAN_POSITION_BUFFER;
    }
  }
  return targetPosY;
};

const createTask = async (input: CreateTaskInput, companyId: CompanyId) => {
  try {
    const {
      user,
      project,
      pics,
      loaders,
      startDate,
      tags,
      memberPublicIds,
      taskStatus, //To be deprecated
      posY,
      statusId, // NOTE: This is the status id of the task
    } = input;

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'task',
      isDecrement: true,
    });

    const isProject = project.category === 1;

    const insertInput = exportFunctions.generateCreateTaskValues(input);

    const task = await TaskStore.createTask(insertInput);

    await EventManagerService.logTaskCreateDelete({
      tasks: [task],
      updatedBy: user,
      changedValue: {
        is_create: true,
        task: isProject ? false : true,
        project_task: isProject ? true : false,
      },
    });

    await createTaskActivity({
      payload: {
        action_type: ACTION_TYPES.TASK_CREATED,
        created_by: user.id,
        card_id: task.id,
      },
    });

    // TODO: Refactor this out
    if (!_.isEmpty(pics)) {
      const picPayload = _.map(pics, (cp) => {
        return {
          pic_id: cp.id,
          user_id: cp.user_id,
          contact_id: cp.contact_id,
        };
      });

      await exportFunctions.addTaskPics({
        task,
        payload: { pics: picPayload },
        loaders,
        user,
      });
    }

    if (memberPublicIds) {
      await addTaskMembersForCreateTask({
        task,
        memberIds: memberPublicIds,
        user,
        loaders,
      });
    }

    if (startDate) {
      await TimesheetService.createTimesheetActivity({ taskId: task.id });
    }

    if (tags && !_.isEmpty(tags)) {
      await TagService.assignTagsToTask({
        tagIds: tags?.map((tag) => tag.id),
        taskId: task.id,
      });
    }

    if (statusId) {
      const targetPosY = await exportFunctions.calculateTaskPositionY({
        taskStatusId: statusId,
        posY,
      });

      if (targetPosY) {
        await exportFunctions.changeTaskPosition({
          taskId: task.id,
          posY: targetPosY,
          projectId: task.jobId,
        });
      }
    }

    return task;
  } catch (error) {
    return Promise.reject(error);
  }
};

const addTaskPicsForCreateTask = async ({
  task,
  picIds,
  loaders,
  user,
}: {
  task: TaskModel;
  picIds?: string[];
  loaders: DataLoaders;
  user: UserModel;
}): Promise<void | Error> => {
  try {
    if (task?.id && picIds && picIds.length > 0) {
      const contactPics = (await loaders.contactPics.loadMany(
        picIds,
      )) as ContactPicModel[];

      if (contactPics.some((p) => p === undefined)) {
        throw new UserInputError('One or more PICs does not exists');
      }

      const pics = _.map(contactPics, (cp) => {
        return {
          pic_id: cp.id,
          user_id: cp.user_id,
          contact_id: cp.contact_id,
        };
      });

      await exportFunctions.addTaskPics({
        task,
        payload: { pics },
        loaders,
        user,
      });
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task?.id,
        picIds,
        userId: user?.id,
        service,
        fnName: 'addTaskPicsForCreateTask',
      },
    });
    return Promise.reject(error);
  }
};

const addTaskMembersForCreateTask = async ({
  task,
  memberIds,
  user,
  loaders,
}: {
  task: TaskModel;
  memberIds: string[] | undefined[];
  user: UserModel;
  loaders: DataLoaders;
}): Promise<CompanyMemberId[] | void | Error> => {
  try {
    if (task?.id && memberIds && memberIds.length > 0) {
      const companyMembers = (await loaders.companyMembers.loadMany(
        memberIds as string[],
      )) as CompanyMemberModel[];

      if (companyMembers.some((cm) => cm === undefined)) {
        throw new Error('One or more company members does not exist');
      }

      const members = companyMembers.map((mem) => {
        return { id: mem.id, user_id: mem.user_id };
      });

      if (memberIds?.length !== members.length) {
        return;
      }

      await exportFunctions.addTaskMembers({
        task,
        payload: { members },
        user,
      });

      return members.map((m) => m.id);
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task?.id,
        memberIds,
        service,
        fnName: 'addTaskMembersForCreateTask',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskSequence = async ({
  teamId,
}: {
  teamId: TeamId;
}): Promise<number> => {
  try {
    // eslint-disable-next-line prefer-const
    let tasks = (await TaskStore.getTasksByTeamId({
      teamId,
    })) as TaskModel[];

    const sequence = tasks.length + 1;

    return sequence;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        teamId,
        service,
        fnName: 'getTaskSequence',
      },
    });
    return Promise.reject(error);
  }
};

const getDueReminderDifference = async (
  task: TaskModel,
  payload: TaskUpdatePayload,
): Promise<number | undefined | Error> => {
  try {
    let diff;
    if (payload?.dueReminder) {
      const dueDate = task?.due_date ? task?.due_date : task?.start_date;
      const difference = getDateDuration(
        dayjs(dueDate),
        dayjs(payload?.dueReminder).toString(),
      );

      diff = difference.minutes;
    }

    return diff;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task?.id,
        payload,
        service,
        fnName: 'getDueReminderDifference',
      },
    });
    return Promise.reject(error);
  }
};

const updateTask = async ({
  task,
  payload,
  updatedBy,
  loaders,
  companyTeamStatus,
}: {
  task: TaskModel;
  payload: TaskUpdatePayload;
  updatedBy: UserModel;
  loaders: any;
  companyTeamStatus?: TaskStatusModel;
}): Promise<TaskModel | Error> => {
  try {
    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;
    const isProject = taskBoard?.category ? true : false;

    const dueReminder = await getDueReminderDifference(task, payload);
    payload.dueReminder = dueReminder as number | undefined;

    const res = (await TaskStore.updateTask({
      taskId: task.id,
      payload,
      companyTeamStatus,
      companyId: taskBoard.company_id,
    })) as TaskModel;

    const updated = (await loaders.tasks.load(res.id)) as TaskModel;

    if (payload.dueDate && payload.dueDate !== task.due_date && !isProject) {
      await createTaskActivity({
        payload: {
          card_id: task.id,
          created_by: payload.updatedBy as number,
          action_type: ACTION_TYPES.UPDATED_DUE_DATE,
          from_date: task.due_date,
          to_date: payload.dueDate,
        },
      });

      await EventManagerService.logUpdatedTaskDueDate({
        task,
        updatedTask: updated,
        updatedBy,
        taskBoard,
      });
    }
    if (
      payload.startDate &&
      !dayjs(payload.startDate).isSame(task.start_date)
    ) {
      await createTaskActivity({
        payload: {
          card_id: task.id,
          created_by: payload.updatedBy as number,
          action_type: ACTION_TYPES.UPDATED_START_DATE,
          from_date: task.start_date,
          to_date: payload.startDate,
        },
      });

      await EventManagerService.logUpdatedTaskProjectDueDate({
        task,
        updatedTask: updated,
        updatedBy,
        taskBoard,
      });
    }

    if (payload.endDate && !dayjs(payload.endDate).isSame(task.end_date)) {
      await createTaskActivity({
        payload: {
          card_id: task.id,
          created_by: payload.updatedBy as number,
          action_type: ACTION_TYPES.UPDATED_END_DATE,
          from_date: task.end_date,
          to_date: payload.endDate,
        },
      });
    }

    if (
      !process.env.TASK_UNIFICATION &&
      payload.subStatusId &&
      payload.subStatusId !== task.sub_status_id
    ) {
      const targetPosY = await exportFunctions.calculateTaskPositionY({
        taskStatusId: payload.subStatusId,
      });

      if (targetPosY) {
        await exportFunctions.changeTaskPosition({
          taskId: task.id,
          posY: targetPosY,
          projectId: task.job_id,
        });
      }

      await createTaskActivity({
        payload: {
          card_id: task.id,
          created_by: payload.updatedBy as number,
          action_type: ACTION_TYPES.UPDATED_TEAM_STATUS,
          from_card_status_id: task.sub_status_id,
          to_card_status_id: payload.subStatusId,
        },
      });

      await EventManagerService.handleNotifyTaskStageChanged({
        task,
        updatedBy,
        fromStatusId: task?.sub_status_id,
        toStatusId: payload?.subStatusId,
      });

      if (task?.sub_status_id) {
        const companyTeamStatus = await loaders.teamStatuses.load(
          task.sub_status_id,
        );

        const updatedCompanyTeamStatus = (await loaders.teamStatuses.load(
          payload.subStatusId,
        )) as CompanyTeamStatusModel;

        const shouldUpdateActualDate = await shouldUpdateActualDates({
          stage: updatedCompanyTeamStatus?.stage,
          task,
          payload,
        });

        if (shouldUpdateActualDate) {
          if (!task.actual_start) {
            await TaskStore.updateActualStart({
              taskId: task.id,
              payload: { updatedBy: updatedBy.id },
            });
          }
          await TaskStore.updateActualEnd({
            taskId: task.id,
            payload: { updatedBy: updatedBy.id },
          });
        }

        await EventManagerService.logUpdatedTaskCompanyTeamStatus({
          companyTeamStatus,
          updatedCompanyTeamStatus,
          task,
          updatedBy,
          taskBoard,
        });
      } else {
        if (!task.actual_start) {
          await TaskStore.updateActualStart({
            taskId: task.id,
            payload: { updatedBy: updatedBy.id },
          });
        }
      }
    }

    if (
      process.env.TASK_UNIFICATION &&
      payload.statusId &&
      payload.statusId !== task.status_id
    ) {
      const updatedProjectStatus = (await loaders.projectStatuses.load(
        payload.statusId,
      )) as ProjectStatusModel;

      const targetPosY = await exportFunctions.calculateTaskPositionY({
        taskStatusId: payload.statusId,
      });

      if (targetPosY) {
        await exportFunctions.changeTaskPosition({
          taskId: task.id,
          posY: targetPosY,
          projectId: task.job_id,
        });
      }

      if (updatedProjectStatus?.notify) {
        // await createTaskActivity({
        //   payload: {
        //     card_id: task.id,
        //     created_by: payload.updatedBy as number,
        //     action_type: ACTION_TYPES.UPDATED_TEAM_STATUS,
        //     from_card_status_id: task.status_id,
        //     to_card_status_id: payload.statusId,
        //   },
        // });

        await EventManagerService.handleNotifyProjectStatusChanged({
          task,
          updatedBy,
          fromStatusId: task?.status_id,
          toStatusId: payload?.statusId,
        });
      }

      // if (payload?.statusId) {

      //   const projectStatus = await loaders.projectStatuses.load(task.status_id)

      //   const updatedProjectStatus = await loaders.projectStatuses.load(payload.statusId)

      //   const shouldUpdateActualDate = await shouldUpdateActualDates({
      //     stage: updatedCompanyTeamStatus?.stage,
      //     task,
      //     payload,
      //   });

      //   if (shouldUpdateActualDate) {
      //     if (!task.actual_start) {
      //       await TaskStore.updateActualStart({
      //         taskId: task.id,
      //         payload: { updatedBy: updatedBy.id },
      //       });
      //     }
      //     await TaskStore.updateActualEnd({
      //       taskId: task.id,
      //       payload: { updatedBy: updatedBy.id },
      //     });
      //   }

      //   await EventManagerService.logUpdatedTaskCompanyTeamStatus({
      //     companyTeamStatus,
      //     updatedCompanyTeamStatus,
      //     task,
      //     updatedBy,
      //     taskBoard,
      //   });
      // } else {
      //   if (!task.actual_start) {
      //     await TaskStore.updateActualStart({
      //       taskId: task.id,
      //       payload: { updatedBy: updatedBy.id },
      //     });
      //   }
      // }
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task.id,
        payload,
        updatedBy: updatedBy?.id,
        service,
        fnName: 'updateTask',
      },
    });
    return Promise.reject(error);
  }
};

const shouldUpdateActualDates = async ({
  stage,
  task,
  payload,
}: {
  stage: number;
  task: TaskModel;
  payload: TaskUpdatePayload;
}) => {
  try {
    const isClosedOrPassed =
      stage === CompanyStageType.PASS || stage === CompanyStageType.CLOSED;
    const isSubStatusIdUpdated = task?.sub_status_id !== payload?.subStatusId;
    const hasNoActualEnd = !task.actual_end;

    if (isClosedOrPassed && isSubStatusIdUpdated && hasNoActualEnd) {
      return true;
    }

    return false;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task.id,
        payload,
        service,
        fnName: 'shouldUpdateActualDates',
      },
    });
    return false;
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
    const res = (await TaskStore.updateSubtask({
      subtaskId,
      payload,
    })) as SubtaskModel;

    if (payload?.checked && res.checked === 1)
      await EventManagerService.handleNotifySubtaskDone(
        res,
        payload.updated_by,
      );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        subtaskId,
        service,
        fnName: 'updateSubtask',
      },
    });
    return Promise.reject(error);
  }
};

const updateTaskBoard = async ({
  id,
  payload,
  owners,
}: {
  id: TaskBoardId;
  payload: TaskBoardUpdatePayload;
  owners: CompanyMemberId[] | null | undefined;
}): Promise<TaskBoardModel | Error> => {
  try {
    const res = await TaskStore.updateTaskBoard({
      id,
      payload,
    });

    if (owners) {
      await TaskStore.updateTaskBoardOwners({
        boardId: id,
        companyMemberIds: owners,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        id,
        service,
        fnName: 'updateTaskBoard',
      },
    });
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
    const res = await TaskStore.updateTaskComment({
      taskCommentId,
      payload,
      taskId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskCommentId,
        payload,
        service,
        fnName: 'updateTaskComment',
      },
    });
    return Promise.reject(error);
  }
};

const addTaskMembers = async ({
  task,
  payload,
  user,
}: {
  task: TaskModel;
  payload: TaskCreateMemberPayload;
  user: UserModel;
}): Promise<(TaskMemberModel | Error)[]> => {
  try {
    const taskMembers = (await getTaskMembersByTaskId({
      taskId: task.id,
    })) as TaskMemberModel[];
    await EventManagerService.logAssigneeAddRemoveTask({
      updatedMemberIds: _.map(payload.members, (m) => m.id),
      task,
      updatedBy: user,
      taskMembers,
      changedValue: { is_create: true },
    });

    // const watcherMembers = await getTaskWatchers({ taskId: task?.id });
    // const watcherMemberIds = _.map(watcherMembers, (m) => m?.memberId);

    // const membersToAdd = _.filter(
    //   payload?.members,
    //   (m) => !_.includes(watcherMemberIds, m?.id),
    // );

    // if (_.isEmpty(membersToAdd)) {
    //   throw new UserInputError(
    //     'Member is already a watcher, please remove them from the watcher list first',
    //   );
    // }
    const res = (await TaskStore.addTaskMembers({
      taskId: task.id,
      payload,
    })) as TaskMemberModel[];

    res.forEach(async (mem) => {
      await createTaskActivity({
        payload: {
          action_type: ACTION_TYPES.ASSIGNEE_ADDED,
          created_by: user.id,
          card_id: task.id,
          target_member_id: mem.member_id,
        },
      });

      if (mem.user_id !== user.id) {
        await EventManagerService.handleNotifyAssignToTask({
          taskMember: mem,
          user,
          task,
        });
      }
    });

    return res;
  } catch (error) {
    const err = error as Error;

    logger.logError({
      error: err,
      payload: {
        taskId: task.id,
        payload,
        service,
        fnName: 'addTaskMembers',
      },
    });
    return Promise.reject(error);
  }
};

const addTaskPics = async ({
  task,
  payload,
  user,
  loaders,
}: {
  task: TaskModel;
  payload: TaskCreatePicPayload;
  user: UserModel;
  loaders: any;
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const res = (await TaskStore.addTaskPics({
      payload,
      taskId: task.id,
    })) as TaskPicModel[];

    res.forEach(async (tp) => {
      await createTaskActivity({
        payload: {
          action_type: 'PIC_ADDED',
          created_by: user.id,
          card_id: task.id,
          target_pic_id: tp.pic_id,
        },
      });

      await EventManagerService.handleNotifyAssignToTask({
        taskPic: tp,
        user,
        task,
      });
    });

    const picIds = payload.pics.map((p) => p.pic_id);
    const pics = (await loaders.contactPics.loadMany(
      picIds,
    )) as ContactPicModel[];

    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;

    const taskPics = (await getTaskPicsByTaskId({
      taskId: task.id,
    })) as TaskPicModel[];

    await EventManagerService.logPicAddRemoveTask({
      updatedPics: pics,
      taskPics,
      task,
      taskBoard,
      updatedBy: user,
      changedValue: { is_create: true },
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task?.id,
        payload,
        user: user?.id,
        service,
        fnName: 'addTaskPics',
      },
    });
    return Promise.reject(error);
  }
};

const addSubtask = async ({
  payload,
}: {
  payload: SubtaskInitialPayload;
}): Promise<SubtaskModel | Error> => {
  try {
    const subtasks = await TaskStore.getSubtasksByTaskId({
      taskId: payload.card_id,
    });

    const sequence = subtasks.length + 1;

    const res = await TaskStore.addSubtask({
      payload: {
        ...payload,
        sequence,
      },
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        service,
        fnName: 'addSubtask',
      },
    });
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
    companyId: CompanyId;
  };
}): Promise<TaskCommentModel> => {
  try {
    const { userId, messageContent, companyId, taskId } = payload;

    const parsed = JSON.parse(messageContent);

    const mentionIds = await parseMentions(parsed);

    const res = await TaskStore.postTaskComment({ payload });
    await SocketService.notifyTaskUpdated({
      taskId,
      companyId,
    });

    if (mentionIds) {
      await EventManagerService.notifyMentions({
        mentionIds,
        taskId: res?.card_id,
        commenterUserId: userId,
      });
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const parseMentions = async (parsed: {
  root: { children: { children: { mention: { id: string } }[] }[] };
}): Promise<string[]> => {
  try {
    const ids = parsed?.root?.children[0]?.children
      .map((child) => {
        return child?.mention?.id;
      })
      .filter((id) => id);

    return ids;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteTaskBoards = async ({
  ids,
  userId,
  companyId,
}: {
  ids: TaskBoardId[];
  userId: UserId;
  companyId: CompanyId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    await Promise.all(
      _.map(ids, async (id) => {
        const tasks = (await TaskStore.getTasksByTaskBoardId({
          id,
        })) as TaskModel[];

        const taskIds = _.map(tasks, (t) => t.id);

        await EventManagerService.handleNotifyBoardDeleted({
          boardId: id,
          deletedById: userId,
        });

        await Promise.all(
          _.map(taskIds, async (taskId) => {
            await TimesheetStore.deleteViewsForTask({ taskId });
          }),
        );

        await TaskStore.deleteTasks({
          taskIds,
          userId,
          projectIds: ids,
          companyId,
        });
      }),
    );

    const attachments = await WorkspaceStore.getAttachmentsByProjectIds(ids);

    const totalFileSize = _.sumBy(attachments, 'fileSize');

    const res = await TaskStore.deleteTaskBoards({ ids, userId });

    // await SubscriptionService.handleSubscriptionQuota({
    //   companyId,
    //   quotaType: 'storage',
    //   quota: totalFileSize,
    // });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        ids,
        userId,
        service,
        fnName: 'deleteTaskBoards',
      },
    });
    return Promise.reject(error);
  }
};

// Deprecated V3
const deleteTaskPics = async ({
  task,
  pics,
  user,
}: {
  task: TaskModel;
  pics: ContactPicModel[];
  user: UserModel;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const picIds = pics.map((p) => p.id);

    picIds.forEach(async (id) => {
      await createTaskActivity({
        payload: {
          action_type: ACTION_TYPES.PIC_REMOVED,
          created_by: user.id,
          card_id: task.id,
          target_pic_id: id,
        },
      });
    });

    const loaders = createLoaders();

    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;

    const taskPics = (await getTaskPicsByTaskId({
      taskId: task.id,
    })) as TaskPicModel[];

    await EventManagerService.logPicAddRemoveTask({
      updatedPics: pics,
      task,
      taskPics,
      taskBoard,
      updatedBy: user,
      changedValue: { is_create: false },
    });

    const res = await TaskStore.deleteTaskPics({ taskId: task.id, picIds });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task.id,
        picIds: pics.map((p) => p?.id),
        userId: user?.id,
        service,
        fnName: 'deleteTaskPics',
      },
    });

    return Promise.reject(error);
  }
};

// Replace deleteTaskPics
const removeTaskPics = async ({
  taskPics,
  user,
  task,
}: {
  taskPics: TaskPicModel[];
  user: UserModel;
  task: TaskModel;
}) => {
  try {
    const contactPicIds = taskPics.map((p) => p?.pic_id);

    contactPicIds.forEach(async (id) => {
      await createTaskActivity({
        payload: {
          action_type: ACTION_TYPES.PIC_REMOVED,
          created_by: user.id,
          card_id: task.id,
          target_pic_id: id,
        },
      });
    });

    const loaders = createLoaders();

    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;

    const contactPics = await ContactService.getContactPics(
      taskBoard?.contact_id,
    );

    await EventManagerService.logPicAddRemoveTask({
      updatedPics: contactPics as ContactPicModel[],
      task,
      taskPics,
      taskBoard,
      updatedBy: user,
      changedValue: { is_create: false },
    });

    const taskPicsPublicIds = taskPics.map((tp) => tp.id_text);

    const res = await TaskStore.removeTaskPics(taskPicsPublicIds);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task.id,
        picIds: taskPics.map((p) => p?.pic_id),
        userId: user?.id,
        service,
        fnName: 'removeTaskPics',
      },
    });
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
    const res = await TaskStore.getTaskMembersByTaskIdAndMemberId({
      taskId,
      memberIds,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        memberIds,
        service,
        fnName: 'getTaskMembersByTaskIdAndMemberId',
      },
    });
    return Promise.reject(error);
  }
};

const deleteTaskMembers = async ({
  task,
  members,
  user,
}: {
  task: TaskModel;
  members: CompanyMemberModel[];
  user: UserModel;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const memberIds = members.map((m) => m.id);

    const res = await TaskStore.deleteTaskMembers({
      taskId: task.id,
      memberIds,
    });

    memberIds.forEach(async (id) => {
      await createTaskActivity({
        payload: {
          action_type: 'ASSIGNEE_REMOVED',
          created_by: user.id,
          card_id: task.id,
          target_member_id: id,
        },
      });
    });

    //TODO: Bug, when user click multiple times on removed assignee,
    //it wil log this out multiple times as well.

    const taskMembers = (await getTaskMembersByTaskId({
      taskId: task.id,
    })) as TaskMemberModel[];

    await EventManagerService.logAssigneeAddRemoveTask({
      updatedMemberIds: memberIds,
      task,
      taskMembers,
      updatedBy: user,
      changedValue: { is_create: false },
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId: task.id,
        memberIds: members.map((m) => m?.id),
        userId: user?.id,
        service,
        fnName: 'deleteTaskMembers',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskPicsByTaskIdAndPicId = async ({
  taskId,
  pics,
}: {
  taskId: TaskId;
  pics: ContactPicModel[];
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const picIds = pics.map((p) => p.id);
    const res = await TaskStore.getTaskPicsByTaskIdAndPicId({
      taskId,
      picIds,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        picIds: pics.map((p) => p?.id),
        service,
        fnName: 'getTaskPicsByTaskIdAndPicId',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskBoardTeams = async ({
  id,
}: {
  id: TaskBoardId;
}): Promise<(TaskBoardTeamModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskBoardTeams({ id });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        id,
        service,
        fnName: 'getTaskBoardTeams',
      },
    });
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
    const res = await TaskStore.getTaskBoardTeamById({ boardId, teamId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        boardId,
        teamId,
        service,
        fnName: 'getTaskBoardTeamById',
      },
    });
    return Promise.reject(error);
  }
};

const getTasksForTeam = async ({
  teamId,
  boardId,
  memberId,
}: {
  teamId: TaskBoardTeamId;
  boardId: TaskBoardId;
  memberId: CompanyMemberId;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await TaskStore.getTasksForTeam({ teamId, boardId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        boardId,
        teamId,
        memberId,
        service,
        fnName: 'getTasksForTeam',
      },
    });
    return Promise.reject(error);
  }
};

const archiveTasks = async ({
  tasks,
  createdBy,
}: {
  tasks: TaskModel[];
  createdBy: UserModel;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await TaskStore.updateTasksArchivedState({
      taskIds: tasks.map((t) => t.id),
      archived: true,
      userId: createdBy?.id,
      projectIds: tasks.map((t) => t.job_id),
    });

    tasks.forEach(async (task) => {
      await createTaskActivity({
        payload: {
          card_id: task.id,
          created_by: createdBy.id,
          action_type: 'TASK_ARCHIVED',
        },
      });
    });

    await EventManagerService.logArchiveTask({
      tasks,
      affectedTasksCount: res.length,
      updatedBy: createdBy,
      isArchive: true,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        tasks: tasks.map((t) => t?.id),
        createdBy: createdBy?.id,
        service,
        fnName: 'archiveTasks',
      },
    });
    return Promise.reject(error);
  }
};

const unarchiveTasks = async ({
  createdBy,
  tasks,
}: {
  createdBy: UserModel;
  tasks: TaskModel[];
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = await TaskStore.updateTasksArchivedState({
      taskIds: tasks.map((t) => t.id),
      archived: false,
      userId: createdBy?.id,
      projectIds: tasks.map((t) => t.job_id),
    });

    tasks.forEach(async (task) => {
      await createTaskActivity({
        payload: {
          card_id: task.id,
          created_by: createdBy.id,
          action_type: 'TASK_UNARCHIVED',
        },
      });
    });

    await EventManagerService.logArchiveTask({
      tasks,
      affectedTasksCount: res.length,
      updatedBy: createdBy,
      isArchive: false,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        tasks: tasks.map((t) => t?.id),
        createdBy: createdBy?.id,
        service,
        fnName: 'unarchiveTasks',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskActivities = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskActivityModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskActivities({ taskId });
    return res;
  } catch (error) {
    const err = error as Error;
    return Promise.reject(error);
  }
};

const createTaskActivity = async ({
  payload,
}: {
  payload: TaskActivityPayload;
}): Promise<TaskActivityModel | Error> => {
  try {
    const res = await TaskStore.createTaskActivity({ payload });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        service,
        fnName: 'createTaskActivity',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskAttachmentsByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TaskAttachmentModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskAttachmentsByTaskId({ taskId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        service,
        fnName: 'getTaskAttachmentsByTaskId',
      },
    });
    return Promise.reject(error);
  }
};

const updateTasksSequence = async ({
  payload,
}: {
  payload: {
    task_id: TaskPublicId;
    sequence: number;
  }[];
}): Promise<(TaskModel | Error)[]> => {
  try {
    const loaders = createLoaders();
    const payloadWithTasks = await Promise.all(
      payload.map(async (t) => {
        return {
          taskId: ((await loaders.tasks.load(t.task_id)) as TaskModel).id,
          sequence: t.sequence,
        };
      }),
    );

    const res = await TaskStore.updateTasksSequence({
      payload: payloadWithTasks,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        service,
        fnName: 'updateTasksSequence',
      },
    });
    return Promise.reject(error);
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
    const res = await TaskStore.getTaskAttachmentByTaskId({ card_id, id });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        card_id,
        id,
        service,
        fnName: 'getTaskAttachmentByTaskId',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskAttachment = async (
  attachmentId: TaskAttachmentId,
): Promise<TaskAttachmentModel | Error> => {
  try {
    const res = await TaskStore.getTaskAttachment(attachmentId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        attachmentId,
        service,
        fnName: 'getTaskAttachment',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskAttachmentByPublicId = async (
  attachmentId: TaskAttachmentPublicId,
): Promise<TaskAttachmentModel | Error> => {
  try {
    const res = await TaskStore.getTaskAttachmentByPublicId(attachmentId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        attachmentId,
        service,
        fnName: 'getTaskAttachmentByPublicId',
      },
    });
    return Promise.reject(error);
  }
};

const downloadFile = async ({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName?: string;
}): Promise<any | Error> => {
  try {
    const file = await s3.getObjectFromS3({
      filePath,
      isPublicAccess: false,
    });

    return file;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        filePath,
        fileName,
        service,
        fnName: 'downloadFile',
      },
    });
    return Promise.reject(error);
  }
};

const getTask = async (taskId: TaskId): Promise<Error | TaskModel> => {
  try {
    const res = await TaskStore.getTask(taskId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        service,
        fnName: 'getTask',
      },
    });
    return Promise.reject(error);
  }
};

const getTasks = async ({
  companyId,
  userId,
  filters,
  category,
}: {
  companyId: CompanyId;
  userId: UserId;
  filters?: FilterOptionsModel;
  category?: number;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const res = (await TaskStore.getTasks({
      companyId,
      category,
    })) as TaskModel[];
    // const loaders = createLoaders();
    const filteredTasks = (
      filters ? await FilterService.Filter(res, filters) : res
    ) as TaskModel[];

    const filterPersonal = await Promise.all(
      _.map(filteredTasks, async (task) => {
        const taskboard = await WorkspaceStore.getProjectById(task.job_id);

        if (taskboard.type === 'Personal') {
          if (task.created_by === userId) {
            return task;
          } else {
            return undefined;
          }
        } else {
          return task;
        }
      }),
    );

    const tasks = filterPersonal.filter(
      (task) => !_.isEmpty(task),
    ) as TaskModel[];

    const tasksFiltered = await Promise.all(
      _.map(tasks, async (task) => {
        const taskboard = await WorkspaceStore.getProjectById(task.job_id);
        const taskBoardFiltered = await filterVisibleBoards({
          boards: [taskboard],
          userId: userId,
          companyId,
        });

        if (_.isEmpty(taskBoardFiltered)) {
          return undefined;
        } else {
          return task;
        }
      }),
    );

    return tasksFiltered.filter((task) => task) as TaskModel[];
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskPics = async ({
  userId,
}: {
  userId: UserId;
}): Promise<(TaskPicModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskPics({ userId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        userId,
        service,
        fnName: 'getTaskPics',
      },
    });
    return Promise.reject(error);
  }
};

const getTasksAssignedToStatusId = async (
  projectStatusId: ProjectStatusId,
): Promise<TaskModel[] | TaskModelRefactor[]> => {
  try {
    const res = (await TaskStore.getTasksAssignedToStatusId(
      projectStatusId,
    )) as TaskModel[];
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        projectStatusId,
        service,
        fnName: 'getTasksAssignedToStatusId',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskByTimesheetId = async (
  timesheetId: TimesheetId,
): Promise<TaskModel | Error> => {
  try {
    const res = TaskStore.getTaskByTimesheetId(timesheetId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        timesheetId,
        service,
        fnName: 'getTaskByTimesheetId',
      },
    });
    return Promise.reject(error);
  }
};

const startTaskTimer = async ({
  taskId,
  companyMemberId,
}: {
  taskId: TaskId;
  companyMemberId: CompanyMemberId;
}): Promise<TaskTimerEntryModel | Error> => {
  try {
    const openTimers = (await TaskStore.getOpenTaskTimers({
      taskId: taskId,
    })) as TaskTimerEntryModel[];
    const filteredByMember = openTimers.filter(
      (t) => t.company_member_id === companyMemberId,
    );
    if (filteredByMember.length > 0) {
      throw new Error('Member already has a timer running');
    }

    const res = await TaskStore.createTaskTimerEntry({
      taskId,
      companyMemberId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        companyMemberId,
        service,
        fnName: 'startTaskTimer',
      },
    });
    return Promise.reject(error);
  }
};

const stopTaskTimer = async ({
  taskId,
  companyMemberId,
}: {
  taskId: TaskId;
  companyMemberId: CompanyMemberId;
}): Promise<TaskTimerEntryModel | Error> => {
  try {
    const openTimers = (await TaskStore.getOpenTaskTimers({
      taskId: taskId,
    })) as TaskTimerEntryModel[];
    const filteredByMember = openTimers.filter(
      (t) => t.company_member_id === companyMemberId,
    );
    if (filteredByMember.length === 0) {
      throw new Error('Member does not have a timer running');
    }

    const res = await TaskStore.closeTaskTimerEntry({
      taskId,
      companyMemberId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        companyMemberId,
        service,
        fnName: 'stopTaskTimer',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskTimerTotals = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TaskTimerTotalModel[]> => {
  try {
    const res = (await TaskStore.getTaskTimerTotals({
      taskId,
    })) as TaskTimerTotalModel[];
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        service,
        fnName: 'getTaskTimerTotals',
      },
    });
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
    const res = await TaskStore.updateActualStart({ taskId, payload });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        payload,
        service,
        fnName: 'updateActualStart',
      },
    });
    return Promise.reject(error);
  }
};

const copyTask = async ({
  taskId,
  taskBoardId,
  companyId,
  user,
  companyTeamId,
  copyChecklists,
  copyAttachments,
}: {
  taskId: TaskId;
  taskBoardId: TaskBoardId;
  companyId: CompanyId;
  user: UserModel;
  companyTeamId: CompanyTeamId | null;
  copyChecklists: boolean;
  copyAttachments: boolean;
}) => {
  try {
    const newTask = (await TaskStore.copyTask({
      taskId,
      taskBoardId,
      companyTeamId,
      userId: user.id,
    })) as TaskModel;

    if (copyChecklists) {
      await TaskStore.copyChecklists({
        sourceTaskId: taskId,
        targetTaskId: newTask.id,
        userId: user.id,
      });
    }

    if (copyAttachments) {
      const attachments = (await TaskStore.getTaskAttachmentsByTaskId({
        taskId,
      })) as TaskAttachmentModel[];

      const attachmentsPayload = await Promise.all(
        attachments.map(async (attachment: TaskAttachmentModel) => {
          const fileExtension = attachment.path.split('.');
          const destinationKey = `attachments/${uuid()}.${fileExtension[1]}`;
          const path = `${process.env.AWS_S3_BUCKET}/${attachment.path}`;
          const destinationBucket = process.env.AWS_S3_BUCKET || 'gokudos-dev';

          await StorageService.copyS3File({
            sourcePath: path,
            destinationBucket,
            destinationKey,
          });

          return {
            name: attachment.name,
            type: attachment.type,
            filesize: attachment.file_size,
            url: `https://${destinationBucket}.s3.ap-southeast-1.amazonaws.com/${destinationKey}`,
            bucket: destinationBucket,
            path: destinationKey,
          };
        }),
      );

      await TaskStore.insertTaskAttachments({
        taskId: newTask.id,
        userId: user.id,
        attachments: attachmentsPayload,
      });
    }

    return newTask;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        taskBoardId,
        companyId,
        userId: user.id,
        companyTeamId,
        copyChecklists,
        copyAttachments,
        service,
        fnName: 'copyTask',
      },
    });
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
    const res = await TaskStore.updateTaskBoardsArchivedState({
      boardIds,
      archived,
      updatedBy,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        boardIds,
        archived,
        service,
        fnName: 'updateTaskBoardsArchivedState',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskBoardOwnersByTaskBoardId = async (
  boardId: TaskBoardId,
): Promise<TaskBoardOwnerModel[]> => {
  try {
    const res = await TaskStore.getTaskBoardOwnersByTaskBoardId(boardId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        boardId,
        service,
        fnName: 'getTaskBoardOwnersByTaskBoardId',
      },
    });
    return Promise.reject(error);
  }
};

const linkAttachmentToComment = async ({
  attachmentId,
  commentId,
  user,
}: {
  attachmentId: TaskAttachmentId;
  commentId: TaskCommentId;
  user: UserModel;
}): Promise<TaskCommentModel> => {
  try {
    const res = (await TaskStore.linkAttachmentToComment({
      attachmentId,
      commentId,
    })) as TaskCommentModel;

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        attachmentId,
        commentId,
        userId: user?.id,
        service,
        fnName: 'linkAttachmentToComment',
      },
    });
    return Promise.reject(error);
  }
};

const unlinkAttachmentFromComment = async ({
  attachmentId,
  commentId,
  user,
}: {
  attachmentId: TaskAttachmentId;
  commentId: TaskCommentId;
  user: UserModel;
}): Promise<TaskCommentModel> => {
  try {
    const res = (await TaskStore.unlinkAttachmentFromComment({
      attachmentId,
      commentId,
    })) as TaskCommentModel;

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        attachmentId,
        commentId,
        userId: user?.id,
        service,
        fnName: 'unlinkAttachmentFromComment',
      },
    });
    return Promise.reject(error);
  }
};

//Also known as effort spent, depends on the worked hours by members.
//Not difference between actual end and actual start
const getTimeSpent = async ({
  taskId,
  memberIds,
}: {
  taskId: TaskId | TaskPublicId;
  memberIds?: CompanyMemberId[];
}): Promise<number> => {
  let spent = 0;
  try {
    let taskPrivateId = taskId as number;
    if (typeof taskId === 'string') {
      const loaders = createLoaders();
      const task = (await loaders.tasks.load(taskId)) as TaskModel;
      taskPrivateId = task.id;
    }

    const activity = (await TimesheetService.getTimesheetActivityByTaskId({
      taskId: taskPrivateId,
    })) as TimesheetActivityModel;

    if (activity) {
      const allTimesheets = (await TimesheetService.getTimesheetsByActivityId({
        activityId: activity?.id,
      })) as TimesheetModel[];

      const timesheets =
        memberIds && memberIds?.length > 0
          ? allTimesheets.filter((timesheet) =>
              memberIds.includes(timesheet.company_member_id),
            )
          : allTimesheets;

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
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        memberIds,
        spent,
        service,
        fnName: 'getTimeSpent',
      },
    });
    return 0;
  }
};

const totalProjectedAndActualCostByTaskIds = async ({
  taskIds,
}: {
  taskIds: TaskPublicId[] | TaskId[];
}) => {
  try {
    const loaders = createLoaders();

    const tasks = (await loaders.tasks.loadMany(taskIds)) as TaskModel[];

    const totalCosts = tasks?.reduce(
      (curr, prev) => {
        curr.actual += +prev.actual_cost;
        curr.projected += +prev.projected_cost;

        return curr;
      },
      { actual: 0, projected: 0 },
    );

    return totalCosts;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskIds,
        service,
        fnName: 'totalProjectedAndActualCostByTaskIds',
      },
    });
    return Promise.reject(error);
  }
};

const updateTaskWithTemplateId = async ({
  taskId,
  templateId,
}: {
  taskId: TaskId;
  templateId: TemplateId;
}) => {
  try {
    const res = await TaskStore.updateTaskWithTemplateId({
      taskId,
      templateId,
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        templateId,
        service,
        fnName: 'updateTaskWithTemplateId',
      },
    });
    return Promise.reject(error);
  }
};

const copyTasks = async (input: {
  taskIds: TaskId[];
  taskBoardId: TaskBoardId;
  companyId: CompanyId;
  user: UserModel;
  companyTeamId: CompanyTeamId | null;
  copyChecklists: boolean;
  copyAttachments: boolean;
  projectGroupId?: ProjectGroupId | null;
  parentId?: TaskId;
}): Promise<TaskModel[]> => {
  try {
    const {
      taskIds,
      taskBoardId,
      companyId,
      user,
      companyTeamId,
      copyChecklists,
      copyAttachments,
      projectGroupId,
      parentId,
    } = input;
    const res = await Promise.all(
      _.map(taskIds, async (taskId) => {
        await SubscriptionService.handleSubscriptionQuota({
          companyId,
          quotaType: 'task',
          isDecrement: true,
        });

        const newTask = (await TaskStore.copyTask({
          taskId,
          taskBoardId,
          companyTeamId,
          userId: user.id,
          projectGroupId,
          parentId,
        })) as TaskModel;

        if (copyChecklists) {
          await TaskStore.copyChecklists({
            sourceTaskId: taskId,
            targetTaskId: newTask.id,
            userId: user.id,
          });
        }

        if (copyAttachments) {
          const attachments = (await TaskStore.getTaskAttachmentsByTaskId({
            taskId,
          })) as TaskAttachmentModel[];

          const totalSize = _.sumBy(attachments, 'fileSize');

          const attachmentsPayload = await Promise.all(
            attachments.map(async (attachment: TaskAttachmentModel) => {
              const fileExtension = attachment.path.split('.');
              const destinationKey = `attachments/${uuid()}.${
                fileExtension[1]
              }`;
              const path = `${process.env.AWS_S3_BUCKET}/${attachment.path}`;
              const destinationBucket =
                process.env.AWS_S3_BUCKET || 'gokudos-dev';

              await StorageService.copyS3File({
                sourcePath: path,
                destinationBucket,
                destinationKey,
              });

              return {
                name: attachment.name,
                type: attachment.type,
                filesize: attachment.file_size,
                url: `https://${destinationBucket}.s3.ap-southeast-1.amazonaws.com/${destinationKey}`,
                bucket: destinationBucket,
                path: destinationKey,
              };
            }),
          );

          // await SubscriptionService.handleSubscriptionQuota({
          //   companyId,
          //   quotaType: 'storage',
          //   isDecrement: true,
          //   quota: totalSize,
          // });

          await TaskStore.insertTaskAttachments({
            taskId: newTask.id,
            userId: user.id,
            attachments: attachmentsPayload,
          });
        }

        if (!newTask?.parentId) {
          await TaskStore.copySubtasks({
            sourceParentId: taskId,
            destinationParentId: newTask.id,
            userId: user.id,
          });
        }

        return newTask;
      }),
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        input,
        copyAttachments,
        service,
        fnName: 'copyTasks',
      },
    });
    return Promise.reject(error);
  }
};

const editTaskComment = async ({
  commentId,
  messageContent,
  mentionIds,
}: {
  commentId: TaskCommentId;
  messageContent: string;
  mentionIds?: string[];
}): Promise<TaskCommentModel | Error> => {
  try {
    const res = (await TaskStore.editTaskComment({
      commentId,
      messageContent,
    })) as TaskCommentModel;

    if (mentionIds) {
      await EventManagerService.notifyMentions({
        mentionIds,
        taskId: res.card_id,
        commenterUserId: res.created_by,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        commentId,
        messageContent,
        mentionIds,
        service,
        fnName: 'editTaskComment',
      },
    });
    return Promise.reject(error);
  }
};

const getTaskBoardTeamsByCompanyId = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<(TaskBoardTeamModel | Error)[]> => {
  try {
    const res = await TaskStore.getTaskBoardTeamsByCompanyId({ companyId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        companyId,
        service,
        fnName: 'getTaskBoardTeamsByCompanyId',
      },
    });
    return Promise.reject(error);
  }
};

const updateSubtaskSequences = async (
  payload: { subtaskId: SubtaskId; sequence: number }[],
): Promise<SubtaskModel[]> => {
  try {
    const res = await TaskStore.updateSubtaskSequences(payload);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        payload,
        service,
        fnName: 'updateSubtaskSequences',
      },
    });
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
    const res = await TaskStore.toggleTasksPinned({
      taskIds,
      userId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskIds,
        userId,
        service,
        fnName: 'toggleTasksPinned',
      },
    });
    return Promise.reject(error);
  }
};

const linkExternalAttachments = async ({
  taskId,
  externalAttachments,
  user,
}: {
  taskId: TaskId;
  externalAttachments: ExternalAttachmentModel[];
  user: UserModel;
}): Promise<TaskModel> => {
  try {
    const res = await TaskStore.linkExternalAttachments({
      taskId,
      externalAttachments,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskId,
        externalAttachments,
        userId: user?.id,
        service,
        fnName: 'linkExternalAttachments',
      },
    });
    return Promise.reject(error);
  }
};

const getTasksV3 = async ({
  companyId,
  filter,
  sort,
}: {
  companyId: CompanyId;
  filter: TaskFilter;
  sort: TaskSort;
}): Promise<(TaskModel | Error)[]> => {
  try {
    const timezone = await CompanyService.getCompanyDefaultTimezone({
      companyId,
    });

    const res = (await TaskStore.getTasksV3({
      companyId,
      companyTimezone: timezone,
      filter,
      sort,
    })) as TaskModel[];

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        companyId,
        filter,
        sort,
        service,
        fnName: 'getTasksV3',
      },
    });
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
    const res = await TaskStore.toggleTasksPublishStatus({
      taskIds,
      userId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        taskIds,
        userId,
        service,
        fnName: 'toggleTasksPublishStatus',
      },
    });
    return Promise.reject(error);
  }
};

const getSharedTasks = async ({
  userId,
  filter,
  companyId,
  sort,
}: {
  userId: UserId;
  companyId: CompanyId;
  filter: TaskFilter;
  sort: TaskSort;
}): Promise<TaskModel[]> => {
  try {
    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId,
    });

    const res = await TaskStore.getSharedTasks({
      userId,
      filter,
      sort,
      companyTimezone,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        userId,
        companyId,
        filter,
        sort,
        service,
        fnName: 'getSharedTasks',
      },
    });
    return Promise.reject(error);
  }
};

const addTaskWatchers = async ({
  taskId,
  memberIds,
  addedBy,
}: {
  taskId: TaskId;
  memberIds: CompanyMemberId[];
  addedBy?: UserModel;
}): Promise<TaskWatcherModel[]> => {
  try {
    const taskMembers = (await getTaskMembersByTaskId({
      taskId,
    })) as TaskMemberModel[];
    const taskMemberIds = taskMembers.map((taskMember) => taskMember.member_id);

    const watcherMemberIds = memberIds.filter(
      (memberId) => !taskMemberIds.includes(memberId),
    );

    if (_.isEmpty(watcherMemberIds)) {
      throw new UserInputError('No eligible members to add as watchers');
    }

    const res = (await TaskStore.addTaskWatchers({
      taskId,
      memberIds: watcherMemberIds,
    })) as TaskWatcherModel[];

    if (res && addedBy) {
      const watcherIds = res.map((watcher) => watcher?.memberId);
      await EventManagerService.handleNotifyTaskWatchers({
        watcherIds,
        addedBy,
        taskId,
      });
    }

    return res;
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
    const res = (await TaskStore.removeTaskWatchers({
      taskId,
      memberIds,
    })) as TaskWatcherModel[];

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskWatchersAsMembers = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<CompanyMemberModel[]> => {
  try {
    const loaders = createLoaders();
    const res = (await TaskStore.getTaskWatchers({
      taskId,
    })) as TaskWatcherModel[];

    const memberIds = res.map(({ memberId }) => memberId);

    const members = (await loaders.companyMembers.loadMany(
      memberIds,
    )) as CompanyMemberModel[];
    return members;
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
    const res = (await TaskStore.getTaskWatchers({
      taskId,
    })) as TaskWatcherModel[];
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const isTaskPublished = async (taskId: TaskId): Promise<boolean> => {
  try {
    const res = await TaskStore.isTaskPublished(taskId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'task',
        fnName: 'isTaskPublished',
        taskId,
      },
      error: err,
    });
    return false;
  }
};

const isTaskMember = async ({
  taskId,
  memberId,
}: {
  taskId: TaskId;
  memberId: CompanyMemberId;
}): Promise<boolean> => {
  try {
    const res = (await exportFunctions.getTaskMembersByTaskId({
      taskId,
    })) as TaskMemberModel[];

    const memberIds = res.map((taskMember) => taskMember.member_id);
    if (memberIds.includes(memberId)) {
      return true;
    }
    return false;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'task',
        fnName: 'isTaskMember',
        taskId,
        memberId,
      },
      error: err,
    });
    return false;
  }
};

const sendTaskInvoice = async (task: TaskModel) => {
  try {
    const loaders = createLoaders();
    const taskPics = (await exportFunctions.getTaskPicsByTaskId({
      taskId: task?.id,
    })) as TaskPicModel[];

    const project = (await loaders.taskBoards.load(
      task?.job_id,
    )) as TaskBoardModel;
    const company = (await loaders.companies.load(
      project?.company_id,
    )) as CompanyModel;

    let picInfos = [];

    for (const taskPic of taskPics) {
      const picUser = (await loaders.users.load(taskPic.user_id)) as UserModel;
      if (picUser?.email) {
        const picUserInfo = {
          name: picUser?.name || picUser?.email,
          email: picUser?.email,
        };

        picInfos.push(picUserInfo);
      }
    }

    for (const picInfo of picInfos) {
      const option = await EventManagerService.createEmailOption({
        templateId: TASK_INVOICE,
        email: picInfo.email,
        receiverName: picInfo.name,
        companyName: company?.name,
        title: 'Title here',
        attachments: 'attachments here',
        companyLogoUrl: company.logo_url,
      });
      await EmailService.sendEmail(option);
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'task',
        fnName: 'sendTaskInvoice',
      },
      error: err,
    });
    return false;
  }
};

const changeTaskPosition = async ({
  taskId,
  posY,
  projectStatusId,
  projectId,
}: {
  taskId: TaskId;
  posY: number;
  projectStatusId?: TaskStatusId;
  projectId: ProjectId;
}): Promise<TaskModel> => {
  try {
    if (projectStatusId) {
      await TaskStore.updateTaskStatusId({
        projectStatusId,
        taskId,
        projectId,
      });
    }
    const res = await TaskStore.changeTaskPosY({ taskId, posY, projectId });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskSequenceRework = async (
  taskId: TaskId,
): Promise<TaskKanbanPosition> => {
  try {
    const res = await TaskStore.getTaskSequence(taskId);
    return res;
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
    const res = await WorkspaceStore.moveGroupTasks({ taskIds, groupId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'task',
        fnName: 'moveGroupTasks',
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getChildTasks = async (taskId: TaskId): Promise<TaskModel[]> => {
  try {
    const res = await TaskStore.getChildTasks(taskId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'task',
        fnName: 'getChildTasks',
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const copyAttachments = async (input: {
  sourceTaskId: TaskId;
  targetTaskId: TaskId;
  companyId: CompanyId;
  userId: UserId;
}) => {
  try {
    const { sourceTaskId, targetTaskId, userId, companyId } = input;
    const attachments = (await TaskStore.getTaskAttachmentsByTaskId({
      taskId: sourceTaskId,
    })) as TaskAttachmentModel[];

    const attachmentsPayload = await Promise.all(
      attachments.map(async (attachment: TaskAttachmentModel) => {
        const fileExtension = attachment.path.split('.');
        const destinationKey = `attachments/${uuid()}.${fileExtension[1]}`;
        const path = `${process.env.AWS_S3_BUCKET}/${attachment.path}`;
        const destinationBucket = process.env.AWS_S3_BUCKET || 'gokudos-dev';

        await StorageService.copyS3File({
          sourcePath: path,
          destinationBucket,
          destinationKey,
        });

        // await SubscriptionService.handleSubscriptionQuota({
        //   companyId,
        //   quotaType: 'storage',
        //   quota: attachment.file_size,
        // });

        return {
          name: attachment.name,
          type: attachment.type,
          filesize: attachment.file_size,
          url: `https://${destinationBucket}.s3.ap-southeast-1.amazonaws.com/${destinationKey}`,
          bucket: destinationBucket,
          path: destinationKey,
        };
      }),
    );

    await TaskStore.insertTaskAttachments({
      taskId: targetTaskId,
      userId,
      attachments: attachmentsPayload,
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'task',
        fnName: 'copyAttachments',
      },
      error: err,
    });
  }
};

type ImportTasksInput = {
  projectId: ProjectId;
  groupId: ProjectGroupId | null;
  attachment: AttachmentPayload;
  user: UserModel;
  companyId: CompanyId;
};

// NOTE: underscore case because that's how the csv parser returns the data
type ParsedImportedTask = {
  task_name: string;
  task_description: string;
  due_date: string;
  assignees: string;
};

type ImportTasksResult = {
  imported: number;
  failed: number;
  tasks: TaskModel[];
};

const parseImportTaskFile = async (attachment: AttachmentPayload) => {
  // const readStream = attachment.createReadStream();
  const readStream = fs.createReadStream(attachment.filename);
  let hasSample = false;
  const results = (await processFileStream(readStream)).filter(
    (p: ParsedImportedTask) => {
      const isSample = p.task_name !== 'Sample Task Name';
      if (isSample) {
        hasSample = true;
      }
      return isSample;
    },
  ) as ParsedImportedTask[];

  return {
    parsedResults: results,
    hasSample,
  };
};

const importTasks = async (
  input: ImportTasksInput,
): Promise<ImportTasksResult> => {
  const { projectId, groupId, attachment, user, companyId } = input;

  try {
    const { parsedResults, hasSample } = await parseImportTaskFile(attachment);

    if (parsedResults.length > 500) {
      throw new Error('Cannot import more than 500 tasks at a time');
    }

    const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
      companyId,
    });

    dayjs.tz.setDefault(companyTimezone);

    const companyMembers = (await CompanyService.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];

    let taskAssignees: {
      [key: string]: any;
    }[] = [];

    if (parsedResults.length === 0) {
      throw new Error('No tasks to import');
    }

    // NOTE: underscore case because that's how the parser returns the data
    const tasks = parsedResults.map((item, index) => {
      const currentCsvRow = hasSample ? index + 3 : index + 2; // +1 for the header, +1 because of 0 index, then +1 if there's a sample row
      let formattedDate = null;

      if (item.due_date) {
        const parsedDate = dayjs(item.due_date).utc();

        if (!parsedDate.isValid()) {
          throw new Error(
            `Error on row ${currentCsvRow}: Invalid due date format for "${item.due_date}"`,
          );
        }

        formattedDate = parsedDate.format('YYYY-MM-DD HH:mm:ss');
      }

      if (item.assignees) {
        const assignees = item.assignees.split(',').map((assignee) => {
          const assigneeEmail = assignee.trim();
          if (!isEmail(assigneeEmail)) {
            throw new Error(
              `Error on row ${currentCsvRow}: The assignee "${assignee}" is not a valid email address`,
            );
          }

          const member = companyMembers.find(
            (member) => member.userEmail === assigneeEmail,
          );
          if (!member) {
            throw new Error(
              `Error on row ${currentCsvRow}: The assignee "${assignee}" is not a member of this company`,
            );
          }
          return {
            index,
            userId: member.userId,
            memberId: member.id,
          };
        });

        taskAssignees = [...taskAssignees, ...assignees];
      }

      return {
        name: item.task_name,
        description: item.task_description,
        ...(formattedDate && { dueDate: formattedDate }),
      };
    });

    const insertedTasks = (await TaskStore.importTasks({
      projectId,
      groupId,
      userId: user.id,
      tasks,
    })) as TaskModel[];

    // NOTE: This has to happen after the tasks are inserted into the database
    // in order to get the task ids
    if (taskAssignees.length > 0) {
      const assigneesInput = taskAssignees.map((assignee) => {
        const task = insertedTasks[assignee.index];
        const taskId = task.id;

        return {
          taskId,
          userId: assignee.userId,
          memberId: assignee.memberId,
        };
      });
      await EventManagerService.handleNotifyTaskAssignees({
        assignees: assigneesInput,
        addedBy: user,
      });
      await TaskStore.batchAssignTaskMembers(assigneesInput);
    }

    return {
      imported: insertedTasks.length,
      failed: parsedResults.length - insertedTasks.length,
      tasks: insertedTasks,
    };
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const updateTaskParent = async (input: UpdateTaskParentInput) => {
  const { childId, sourceParentId, destinationParentId, user } = input;

  try {
    const res = await TaskStore.updateTaskParent({
      childId,
      sourceParentId,
      destinationParentId,
      userId: user.id,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskVisibilityWhitelist = async ({ taskId }: { taskId: TaskId }) => {
  try {
    const res = await TaskStore.getTaskVisibilityWhitelist({ taskId });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const addToTaskVisibilityWhitelist = async ({
  taskId,
  memberIds,
  teamIds,
}: {
  taskId: TaskId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
}) => {
  try {
    const currentMemberVisibilityIds =
      await TaskStore.getCurrentMemberVisibilityIds(taskId);
    const currentTeamVisibilityIds =
      await TaskStore.getCurrentTeamVisibilityIds(taskId);

    if (
      memberIds &&
      _.intersection(memberIds, currentMemberVisibilityIds).length > 0
    ) {
      throw new Error('Member already in whitelist');
    }

    if (
      teamIds &&
      _.intersection(teamIds, currentTeamVisibilityIds).length > 0
    ) {
      throw new Error('Team already in whitelist');
    }
    const res = await TaskStore.addToTaskVisibilityWhitelist({
      taskId,
      memberIds,
      teamIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeFromTaskVisibilityWhitelist = async ({
  taskId,
  memberIds,
  teamIds,
}: {
  taskId: TaskId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
}) => {
  try {
    const res = await TaskStore.removeFromTaskVisibilityWhitelist({
      taskId,
      memberIds,
      teamIds,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const setTaskVisibility = async (input: {
  taskId: TaskId;
  visibility: number;
  user: UserModel;
}) => {
  try {
    const { taskId, visibility, user } = input;
    const res = await TaskStore.setTaskVisibility({
      taskId,
      visibility,
      userId: user.id,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const isMemberAssignedToTask = ({
  task,
  userId,
  userTeamIds,
  boardTeamIds,
}: {
  task: TaskModel;
  userId: UserId;
  userTeamIds: TeamId[];
  boardTeamIds: TaskBoardTeamId[];
}) => {
  const isCreator = task.createdBy === userId;

  const isInTeam = _.intersection(userTeamIds, boardTeamIds).length > 0;

  return isCreator || isInTeam;
};

const isMemberSpecificVisibleOnTask = ({
  task,
  userId,
  taskVisibility,
  companyMemberId,
  userTeamIds,
}: {
  task: TaskModel;
  userId: UserId;
  taskVisibility: CommonVisibilityModel[];
  companyMemberId: CompanyMemberId;
  userTeamIds: TeamId[];
}) => {
  const isCreator = task.createdBy === userId;
  let vTeams = [];
  let vMembers = [];
  const visibility = taskVisibility.filter((e) => e.taskId === task.id);
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

const filterVisibleTasks = async ({
  tasks,
  userId,
  companyId,
}: {
  tasks: TaskModel[];
  userId: UserId;
  companyId: CompanyId;
}) => {
  try {
    const taskIds = tasks.map((b) => b.id);
    const member = (await CompanyStore.getMemberByUserIdAndCompanyId({
      userId,
      companyId,
    })) as CompanyMemberModel;

    const userTeams = await CompanyStore.getCompanyTeamsByUserId({
      userId,
      companyId,
    });

    const userTeamIds = userTeams.map((team) => team?.id);

    const boardTeams = await TaskStore.getTeamsForTaskIds({
      ids: taskIds,
    });

    const taskVisibility = await TaskStore.getVisibilityForTaskIds({
      ids: taskIds,
    });

    let filteredTasks = [];

    for (const task of tasks) {
      const boardTeamIds = boardTeams
        .filter((bt) => bt?.jobId === task?.jobId)
        .map((bt) => bt?.teamId);

      const isTaskVisible = await exportFunctions.isTaskVisible({
        task,
        boardTeamIds,
        userId,
        member,
        taskVisibility,
        userTeamIds,
      });

      if (isTaskVisible) {
        filteredTasks.push(task);
      }
    }

    return filteredTasks;
  } catch (error) {
    return Promise.reject(error);
  }
};

const isTaskVisible = ({
  task,
  userId,
  boardTeamIds,
  userTeamIds,
  member,
  taskVisibility,
}: {
  task: TaskModel;
  userId: UserId;
  boardTeamIds: TaskBoardTeamId[];
  userTeamIds: TeamId[];
  member: CompanyMemberModel;
  taskVisibility: CommonVisibilityModel[];
}) => {
  try {
    const { visibility } = task;

    /* These visibility check functions are split out because the
		same logic is used in other functions. - Enoch */

    // user is the creator of the board
    if (task.createdBy === userId) {
      return true;
    }

    if (visibility === CommonVisibilityTypes.PUBLIC) {
      return true;
    } else if (visibility === CommonVisibilityTypes.ASSIGNED) {
      return exportFunctions.isMemberAssignedToTask({
        task,
        userId,
        boardTeamIds,
        userTeamIds,
      });
    } else if (visibility === CommonVisibilityTypes.SPECIFIC) {
      return exportFunctions.isMemberSpecificVisibleOnTask({
        task,
        userId,
        taskVisibility,
        userTeamIds,
        companyMemberId: member.id,
      });
    } else if (visibility === CommonVisibilityTypes.PRIVATE) {
      return task.createdBy === userId;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const exportFunctions = {
  ...TaskBoardServiceFunctions,
  addTaskMembers,
  addTaskPics,
  addSubtask,
  addTeamIdTaskBoard,
  addTaskMembersForCreateTask,
  addTaskPicsForCreateTask,
  createTaskAttachment,
  createTask,
  createTaskBoard,
  createProjectBoard,
  createTaskBoardTeam,
  createTaskActivity,
  deleteTaskBoards,
  deleteTasks,
  deleteTaskAttachment,
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
  getTaskMembersByTaskId,
  getTaskMembersByTaskIdAndMemberId,
  getTaskPicsByTaskId,
  getTaskPicsByTaskIdAndPicId,
  getTasksByTaskBoardId,
  getTaskMembers,
  getTaskActivities,
  getTaskBoardTeams,
  getTasksForTeam,
  getTaskBoardTeamById,
  getTaskAttachmentsByTaskId,
  getTaskAttachmentByTaskId,
  getTaskAttachment,
  getTaskAttachmentByPublicId,
  getTask,
  getTasks,
  getTaskPics,
  getTaskSequence,
  getTasksAssignedToStatusId,
  getTaskByTimesheetId,
  getTaskTimerTotals,
  getTaskBoardOwnersByTaskBoardId,
  updateTask,
  updateTaskBoard,
  updateTaskComment,
  unarchiveTasks,
  updateSubtask,
  updateTasksSequence,
  updateTaskBoardsArchivedState,
  archiveTasks,
  downloadFile,
  startTaskTimer,
  stopTaskTimer,
  updateActualStart,
  copyTask,
  linkAttachmentToComment,
  unlinkAttachmentFromComment,
  getTimeSpent,
  totalProjectedAndActualCostByTaskIds,
  updateTaskWithTemplateId,
  copyTasks,
  editTaskComment,
  getTaskBoardTeamsByCompanyId,
  removeTaskPics,
  postTaskComment,
  updateSubtaskSequences,
  filterVisibleBoards,
  isBoardVisible,
  isMemberAssignedToBoard,
  isMemberSpecificVisibleOnBoard,
  toggleTasksPinned,
  linkExternalAttachments,
  getTasksV3,
  getTaskBoardsV3,
  toggleTasksPublishStatus,
  getSharedTasks,
  addTaskWatchers,
  removeTaskWatchers,
  getTaskWatchersAsMembers,
  getTaskWatchers,
  shouldUpdateActualDates,
  createTaskLegacy,
  generateCreateTaskValues,
  getActualStartEndDates,
  isTaskPublished,
  isTaskMember,
  sendTaskInvoice,
  changeTaskPosition,
  getTaskSequenceRework,
  moveGroupTasks,
  getChildTasks,
  copyAttachments,
  importTasks,
  parseImportTaskFile,
  updateTaskParent,
  calculateTaskPositionY,
  getTaskVisibilityWhitelist,
  addToTaskVisibilityWhitelist,
  removeFromTaskVisibilityWhitelist,
  setTaskVisibility,
  isMemberAssignedToTask,
  isMemberSpecificVisibleOnTask,
  isTaskVisible,
  filterVisibleTasks,
};

export default exportFunctions;
