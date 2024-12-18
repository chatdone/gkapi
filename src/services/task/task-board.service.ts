import { TaskStore } from '@data-access';
import {
  CompanyId,
  CompanyMemberId,
  CompanyTeamId,
} from '@models/company.model';
import {
  TaskBoardFolderId,
  TaskBoardFolderType,
  TaskBoardId,
  TaskBoardModel,
  TaskId,
} from '@models/task.model';
import TaskService from './task.service';
import { UserModel } from '@models/user.model';
import { TaskBoardFolderTypeMappings } from '@graphql/modules/task/task-board.resolvers';
import _ from 'lodash';
import logger from '@tools/logger';

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];

const getTaskBoardFolders = async ({
  companyId,
  type,
  user,
}: {
  companyId: CompanyId;
  type: TaskBoardFolderType;
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.getTaskBoardFolders({
      companyId,
      type,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getTaskBoardFolders',
        companyId,
        type,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const createTaskBoardFolder = async ({
  companyId,
  name,
  type,
  user,
}: {
  companyId: CompanyId;
  name: string;
  type: TaskBoardFolderType;
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.createTaskBoardFolder({
      companyId,
      userId: user.id,
      type,
      name,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createTaskBoardFolder',
        companyId,
        type,
        userId: user?.id,
        name,
      },
    });
    return Promise.reject(error);
  }
};

const updateTaskBoardFolder = async ({
  folderId,
  name,
  user,
}: {
  folderId: TaskBoardFolderId;
  name: string;
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.updateTaskBoardFolder({
      folderId,
      name,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateTaskBoardFolder',
        userId: user?.id,
        name,
        folderId,
      },
    });
    return Promise.reject(error);
  }
};

const deleteTaskBoardFolder = async ({
  folderId,
  user,
}: {
  folderId: TaskBoardFolderId;
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.deleteTaskBoardFolder({
      folderId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,

      payload: {
        service,
        fnName: 'deleteTaskBoardFolder',
        userId: user?.id,
        folderId,
      },
    });
    return Promise.reject(error);
  }
};

const setTaskBoardVisibility = async ({
  boardId,
  companyId,
  user,
  visibility,
}: {
  boardId: TaskBoardId;
  companyId: CompanyId;
  user: UserModel;
  visibility: number;
}) => {
  try {
    const res = await TaskStore.setTaskBoardVisibility({
      boardId,
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
        fnName: 'setTaskBoardVisibility',
        userId: user?.id,
        boardId,
        visibility,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const assignTaskBoardsToFolder = async ({
  folderId,
  boardIds,
  user,
}: {
  folderId: TaskBoardFolderId;
  boardIds: TaskBoardId[];
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.assignTaskBoardsToFolder({
      folderId,
      boardIds,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'assignTaskBoardsToFolder',
        userId: user?.id,
        folderId,
        boardIds,
      },
    });
    return Promise.reject(error);
  }
};

const removeTaskBoardsFromFolder = async ({
  boardIds,
  user,
}: {
  boardIds: TaskBoardId[];
  user: UserModel;
}): Promise<TaskBoardModel[]> => {
  try {
    const res = await TaskStore.removeTaskBoardsFromFolder({
      boardIds,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'removeTaskBoardsFromFolder',
        userId: user?.id,
        boardIds,
      },
    });
    return Promise.reject(error);
  }
};

const getTaskBoardsByFolderId = async ({
  folderId,
  user,
  folderType,
  companyId,
}: {
  folderId: TaskBoardFolderId;
  user: UserModel;
  folderType: TaskBoardFolderType;
  companyId: CompanyId;
}) => {
  try {
    // FIXME: This mapping sucks, I'll refactor this later -- Enoch
    const BoardTypeMapping = {
      [TaskBoardFolderTypeMappings.INTERNAL]: 'Internal',
      [TaskBoardFolderTypeMappings.PERSONAL]: 'Personal',
      [TaskBoardFolderTypeMappings.COLLABORATION]: 'Collaboration',
      [TaskBoardFolderTypeMappings.PROJECT]: 'All',
    };

    const res = await TaskStore.getTaskBoardsByFolderId({
      folderId,
      type: BoardTypeMapping[folderType],
      category: folderType === TaskBoardFolderTypeMappings.PROJECT ? 1 : 0,
    });

    const filteredBoards = await TaskService.filterVisibleBoards({
      boards: res,
      userId: user.id,
      companyId,
    });

    return filteredBoards;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getTaskBoardsByFolderId',
        userId: user?.id,
        folderId,
        folderType,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const toggleTaskBoardPinned = async ({
  boardId,
  user,
}: {
  boardId: TaskBoardId;
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.toggleTaskBoardPinned({
      boardId,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'toggleTaskBoardPinned',
        userId: user?.id,
        boardId,
      },
    });
    return Promise.reject(error);
  }
};

const toggleTaskBoardsPinned = async ({
  boardIds,
  user,
}: {
  boardIds: TaskBoardId[];
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.toggleTaskBoardsPinned({
      boardIds,
      userId: user?.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'toggleTaskBoardsPinned',
        userId: user?.id,
        boardIds,
      },
    });
    return Promise.reject(error);
  }
};

const getVisibilityWhitelist = async ({
  boardId,
}: {
  boardId: TaskBoardId;
}) => {
  try {
    const res = await TaskStore.getVisibilityWhitelist({ boardId });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const addToVisibilityWhitelist = async ({
  boardId,
  memberIds,
  teamIds,
  user,
}: {
  boardId: TaskBoardId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
  user: UserModel;
}) => {
  try {
    const currentVisibility = await TaskStore.getVisibilityWhitelist({
      boardId,
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
    const res = await TaskStore.addToVisibilityWhitelist({
      boardId,
      memberIds,
      teamIds,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'addToVisibilityWhitelist',
        boardId,
        memberIds,
        teamIds,
      },
    });
    return Promise.reject(error);
  }
};

const removeFromVisibilityWhitelist = async ({
  boardId,
  memberIds,
  teamIds,
  user,
}: {
  boardId: TaskBoardId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
  user: UserModel;
}) => {
  try {
    const res = await TaskStore.removeFromVisibilityWhitelist({
      boardId,
      memberIds,
      teamIds,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'removeFromVisibilityWhitelist',
        boardId,
        memberIds,
        teamIds,
        userId: user?.id,
      },
    });
    return Promise.reject(error);
  }
};

const exportFunctions = {
  getTaskBoardFolders,
  createTaskBoardFolder,
  updateTaskBoardFolder,
  deleteTaskBoardFolder,
  setTaskBoardVisibility,
  assignTaskBoardsToFolder,
  removeTaskBoardsFromFolder,
  getTaskBoardsByFolderId,
  toggleTaskBoardPinned,
  toggleTaskBoardsPinned,
  getVisibilityWhitelist,
  addToVisibilityWhitelist,
  removeFromVisibilityWhitelist,
};

export default exportFunctions;
