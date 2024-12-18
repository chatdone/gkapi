import { camelize, camelizeOnly } from '@data-access/utils';
import { TableNames } from '@db-tables';
import knex from '@db/knex';
import {
  CompanyId,
  CompanyMemberId,
  CompanyTeamId,
} from '@models/company.model';
import {
  ProjectId,
  TaskBoardFolderId,
  TaskBoardFolderModel,
  TaskBoardFolderType,
  TaskBoardId,
  TaskBoardModel,
  TaskBoardVisibilityModel,
} from '@models/task.model';
import { UserId } from '@models/user.model';

import _ from 'lodash';

const getTaskBoardFolders = async ({
  companyId,
  type,
}: {
  companyId: CompanyId;
  type: TaskBoardFolderType;
}) => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARD_FOLDERS)
      .where({ company_id: companyId, type: type })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskMembersByCompanyIdAndProjectId = async (input: {
  projectId: ProjectId;
  companyId: CompanyId;
}) => {
  try {
    const { projectId, companyId } = input;
    const res = await knex
      .from({ tm: TableNames.TASK_MEMBERS })
      .join(
        {
          t: TableNames.TASKS,
        },
        'tm.card_id',
        't.id',
      )
      .join({ cm: TableNames.COMPANY_MEMBERS }, 'tm.member_id', 'cm.id')
      .where({
        't.job_id': projectId,
        'cm.company_id': companyId,
      })
      .select('tm.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTaskBoardFolder = async ({
  companyId,
  name,
  type,
  userId,
}: {
  companyId: CompanyId;
  name: string;
  type: number;
  userId: UserId;
}): Promise<TaskBoardFolderModel> => {
  try {
    const insertRes = await knex(TableNames.TASK_BOARD_FOLDERS).insert({
      company_id: companyId,
      name,
      type,
      created_at: knex.fn.now(),
      created_by: userId,
      updated_at: knex.fn.now(),
      updated_by: userId,
    });

    const res = await knex
      .from(TableNames.TASK_BOARD_FOLDERS)
      .where('id', _.head(insertRes))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTaskBoardFolder = async ({
  folderId,
  name,
  userId,
}: {
  folderId: TaskBoardFolderId;
  name: string;
  userId: UserId;
}): Promise<TaskBoardFolderModel> => {
  try {
    await knex(TableNames.TASK_BOARD_FOLDERS).where('id', folderId).update({
      name,
      updated_at: knex.fn.now(),
      updated_by: userId,
    });

    const res = await knex
      .from(TableNames.TASK_BOARD_FOLDERS)
      .where('id', folderId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteTaskBoardFolder = async ({
  folderId,
}: {
  folderId: TaskBoardFolderId;
}) => {
  try {
    await knex(TableNames.TASK_BOARD_FOLDERS).where('id', folderId).del();
  } catch (error) {
    return Promise.reject(error);
  }
};

const setProjectVisibilityByProjectId = async ({
  projectVis,
}: {
  projectVis: TaskBoardVisibilityModel;
}) => {
  if (projectVis?.boardId) {
    // await redis.set(`project-vis:${projectVis.boardId}`, projectVis);
  }
};

const getVisibilityForTaskBoardIds = async ({
  ids,
}: {
  ids: TaskBoardId[];
}): Promise<TaskBoardVisibilityModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARD_VISIBILITY)
      .whereIn('board_id', ids)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const setTaskBoardVisibility = async ({
  boardId,
  visibility,
  userId,
}: {
  boardId: TaskBoardId;
  visibility: number;
  userId: UserId;
}) => {
  try {
    await knex(TableNames.TASK_BOARDS)
      .update({
        visibility,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', boardId);

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where('id', boardId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignTaskBoardsToFolder = async ({
  folderId,
  boardIds,
  userId,
}: {
  folderId: TaskBoardFolderId;
  boardIds: TaskBoardId[];
  userId: UserId;
}): Promise<TaskBoardFolderModel> => {
  try {
    await knex(TableNames.TASK_BOARDS)
      .update({
        folder_id: folderId,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .whereIn('id', boardIds);

    const res = await knex
      .from(TableNames.TASK_BOARD_FOLDERS)
      .where('id', folderId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeTaskBoardsFromFolder = async ({
  boardIds,
  userId,
}: {
  boardIds: TaskBoardId[];
  userId: UserId;
}): Promise<TaskBoardModel[]> => {
  try {
    await knex(TableNames.TASK_BOARDS)
      .update({
        folder_id: null,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .whereIn('id', boardIds);

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where('id', boardIds)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskBoardsByFolderId = async ({
  folderId,
  category,
  type,
}: {
  folderId: TaskBoardFolderId;
  category: number;
  type: string;
}) => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where({
        folder_id: folderId,
        deleted_at: null,
        category,
      })
      .andWhere((builder) => {
        if (type !== 'All') {
          return builder.where({ type });
        }
      })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const toggleTaskBoardPinned = async ({
  boardId,
  userId,
}: {
  boardId: TaskBoardId;
  userId: UserId;
}): Promise<TaskBoardModel> => {
  try {
    await knex.raw(`
			UPDATE ${TableNames.TASK_BOARDS} 
			SET pinned = NOT pinned, 
			updated_at = NOW(),
			updated_by = ${userId}
			WHERE id = ${boardId}
		`);

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where('id', boardId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const toggleTaskBoardsPinned = async ({
  boardIds,
  userId,
}: {
  boardIds: TaskBoardId[];
  userId: UserId;
}): Promise<TaskBoardModel[]> => {
  try {
    await knex.raw(`
			UPDATE ${TableNames.TASK_BOARDS} 
			SET pinned = NOT pinned, 
			updated_at = NOW(),
			updated_by = ${userId}
			WHERE id IN(${boardIds})
		`);

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .whereIn('id', boardIds)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getVisibilityWhitelist = async ({
  boardId,
}: {
  boardId: TaskBoardId;
}): Promise<{ teams?: CompanyTeamId[]; members?: CompanyMemberId[] }> => {
  try {
    const res = await knex
      .from(TableNames.TASK_BOARD_VISIBILITY)
      .where('board_id', boardId)
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

const addToVisibilityWhitelist = async ({
  boardId,
  teamIds,
  memberIds,
}: {
  boardId: TaskBoardId;
  teamIds?: CompanyTeamId[];
  memberIds?: CompanyMemberId[];
}) => {
  try {
    if (teamIds) {
      await knex(TableNames.TASK_BOARD_VISIBILITY)
        .insert(
          teamIds.map((teamId) => ({
            board_id: boardId,
            team_id: teamId,
          })),
        )
        .onConflict('(board_id, team_id)')
        .merge();
    }

    if (memberIds) {
      await knex(TableNames.TASK_BOARD_VISIBILITY)
        .insert(
          memberIds.map((memberId) => ({
            board_id: boardId,
            member_id: memberId,
          })),
        )
        .onConflict('(board_id, member_id)')
        .merge();
    }

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where('id', boardId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeFromVisibilityWhitelist = async ({
  boardId,
  memberIds = [],
  teamIds = [],
}: {
  boardId: TaskBoardId;
  memberIds?: CompanyMemberId[];
  teamIds?: CompanyTeamId[];
}) => {
  try {
    let query = ``;
    if (memberIds.length > 0 && teamIds.length > 0) {
      query = `WHERE board_id = ${boardId} AND (member_id IN(${memberIds}) OR team_id IN(${teamIds}))`;
      query = `WHERE board_id = ${boardId} AND (member_id IN(${memberIds}) OR team_id IN(${teamIds}))`;
    } else if (memberIds.length > 0) {
      query = `WHERE board_id = ${boardId} AND member_id IN(${memberIds})`;
    } else if (teamIds.length > 0) {
      query = `WHERE board_id = ${boardId} AND team_id IN(${teamIds})`;
    }

    await knex.raw(`
			DELETE FROM ${TableNames.TASK_BOARD_VISIBILITY} ${query}
		`);

    const res = await knex
      .from(TableNames.TASK_BOARDS)
      .where('id', boardId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getTaskBoardFolders,
  createTaskBoardFolder,
  updateTaskBoardFolder,
  deleteTaskBoardFolder,
  getVisibilityForTaskBoardIds,
  setTaskBoardVisibility,
  assignTaskBoardsToFolder,
  removeTaskBoardsFromFolder,
  getTaskBoardsByFolderId,
  toggleTaskBoardPinned,
  toggleTaskBoardsPinned,
  getVisibilityWhitelist,
  addToVisibilityWhitelist,
  removeFromVisibilityWhitelist,
  getTaskMembersByCompanyIdAndProjectId,
};
