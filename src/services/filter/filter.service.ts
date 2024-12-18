import { createLoaders, WorkspaceStore } from '@data-access';
import {
  CompanyMemberId,
  CompanyMemberModel,
  CompanyTeamId,
  CompanyTeamStatusModel,
} from '@models/company.model';
import { FilterOptionsModel } from '@models/filter.model';
import { TaskBoardModel, TaskMemberModel, TaskModel } from '@models/task.model';
import { TaskService, CompanyService } from '@services';
import { UserInputError } from 'apollo-server-express';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import utc from 'dayjs/plugin/utc';
import logger from '@tools/logger';
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

import _ from 'lodash';
import { UserId } from '@models/user.model';
import { CollectionModel } from '@models/collection.model';
import { ContactPicId } from '@models/contact.model';
import {
  ActivityTrackerDailyModel,
  ActivityTrackerMonthlyModel,
  ActivityTrackerWeeklyModel,
} from '@models/timesheet.model';

const Filter = async <T>(
  filterObjects: T[],
  filters: FilterOptionsModel,
): Promise<(T | Error)[]> => {
  try {
    const loaders = createLoaders();

    let filteredObjects: T[] = filterObjects;
    if (filters.date && filters.date.end_date) {
      const filtered = _.filter(filterObjects, (fo) =>
        //@ts-ignore
        dayjs(fo.due_date).isBetween(
          filters.date?.start_date,
          dayjs(filters.date?.end_date),
          'day',
        ),
      );
      filteredObjects = filtered;
    }

    if (!filters.date?.end_date && filters.date) {
      const filtered = _.filter(filteredObjects, (fo) =>
        // @ts-ignore
        dayjs().isSameOrAfter(fo?.due_date, 'day'),
      );

      filteredObjects = filtered;
    }

    if (filters.team_status) {
      const companyTeamStatus = (await loaders.teamStatuses.load(
        filters.team_status.sub_status_id,
      )) as CompanyTeamStatusModel;

      if (!companyTeamStatus) {
        throw new UserInputError('Company team status does not exist');
      }

      const filtered = _.filter(
        filteredObjects,
        //@ts-ignore
        (fo) => fo.sub_status_id === companyTeamStatus.id,
      );

      filteredObjects = filtered;
    }
    if (filters.project_type) {
      const filtered = _.filter(
        filteredObjects,
        //@ts-ignore
        (fo) => fo.board_type === filters.project_type,
      );

      filteredObjects = filtered;
    }

    if (filters.category?.is_project === true) {
      const filtered = _.filter(
        filteredObjects,
        //@ts-ignore
        (fo) => fo.end_date !== null,
      );

      filteredObjects = filtered;
    } else if (filters.category?.is_project === false) {
      const filtered = _.filter(
        filteredObjects,
        //@ts-ignore
        (fo) => !fo.end_date,
      );

      filteredObjects = filtered;
    }

    if (filters.task_member) {
      const taskMember = (await loaders.taskMembers.load(
        filters?.task_member.member_id,
      )) as TaskMemberModel;

      if (!taskMember) {
        throw new Error('Company member does not exist');
      }

      const taskMembers = (await TaskService.getTaskMembers(
        taskMember.member_id,
      )) as TaskMemberModel[];

      const filtered = _.filter(filteredObjects, (fo) =>
        //@ts-ignore
        taskMembers.some((tm) => tm.card_id === fo.id),
      );

      filteredObjects = filtered;
    }

    if (filters.taskMember) {
      const member = (await loaders.companyMembers.load(
        filters.taskMember.memberId,
      )) as CompanyMemberModel;
      const tasksByMemberId = (await WorkspaceStore.getTasksByMemberId(
        member.id,
      )) as TaskModel[];

      const filtered = _.filter(filteredObjects, (fo) =>
        //@ts-ignore
        tasksByMemberId.some((tm) => tm.id === fo.id),
      );

      filteredObjects = filtered;
    }

    if (filters.archived) {
      const filtered = _.filter(
        filteredObjects,
        //@ts-ignore
        (fo) => fo.archived === filters.archived.status,
      );
      filteredObjects = filtered;
    }

    if (filters.weekly_timesheet) {
      const filtered = _.filter(
        filteredObjects,
        (wtm) =>
          //@ts-ignore
          dayjs(wtm.created_at).utc().week() ===
            filters.weekly_timesheet?.week &&
          //@ts-ignore
          dayjs(wtm.created_at).utc().year() === filters.weekly_timesheet.year,
      );
      filteredObjects = filtered;
    }

    if (filters.selectedDate) {
      const filtered = _.filter(
        filteredObjects,
        (wtm) =>
          //@ts-ignore
          dayjs(wtm.start_date).format('YYYY-MM-DD') ===
          dayjs(filters.selectedDate).format('YYYY-MM-DD'),
      );

      filteredObjects = filtered;
    }

    if (filters.company_id) {
      const members = await CompanyService.getCompanyMembers(
        filters.company_id,
      );

      const filtered = _.filter(filteredObjects, (fo) =>
        //@ts-ignore
        members.some((m) => m.id === fo.company_member_id),
      );

      filteredObjects = filtered;
    }

    return filteredObjects;
  } catch (error) {
    return Promise.reject(error);
  }
};

const filterActivityTrackersPermission = async ({
  tasks,
  memberId,
  teamIds,
}: {
  tasks: (
    | ActivityTrackerDailyModel
    | ActivityTrackerWeeklyModel
    | ActivityTrackerMonthlyModel
    | undefined
  )[];
  teamIds: CompanyTeamId[];
  memberId: CompanyMemberId;
}): Promise<
  | ActivityTrackerDailyModel[]
  | ActivityTrackerWeeklyModel[]
  | ActivityTrackerMonthlyModel[]
  | Error
> => {
  try {
    const loaders = createLoaders();

    const member = (await loaders.companyMembers.load(
      memberId,
    )) as CompanyMemberModel;
    const withPermission = await Promise.all(
      _.map(tasks, async (t) => {
        const task = (await loaders.tasks.load(
          t?.task_id as number,
        )) as TaskModel;
        const board = (await loaders.boards.load(
          task?.job_id,
        )) as TaskBoardModel;
        const filteredBoards = await TaskService.filterVisibleBoards({
          boards: [board],
          userId: member?.user_id,
          companyId: member?.company_id,
        });

        if (!_.isEmpty(filteredBoards)) {
          return t;
        } else {
          return undefined;
        }
      }),
    );

    const tasksWithPermission = _.filter(
      withPermission,
      (t) => t !== undefined,
    ) as unknown as ActivityTrackerDailyModel[];

    return tasksWithPermission;
  } catch (error) {
    logger.errorLogger.log('info', 'filterActivityTrackersPermission', {
      error,
      memberId,
    });

    return tasks as
      | ActivityTrackerDailyModel[]
      | ActivityTrackerWeeklyModel[]
      | ActivityTrackerMonthlyModel[];
  }
};

const filterCollectionsForCollector = async ({
  collections,
  contactPicId,
}: {
  collections: CollectionModel[];
  contactPicId: ContactPicId;
}): Promise<(CollectionModel | Error)[]> => {
  try {
    const mapped = await Promise.all(
      _.map(collections, async (c) => {
        const assignedPics =
          typeof c?.notify_pics === 'string'
            ? JSON.parse(c?.notify_pics)
            : c?.notify_pics;

        if (assignedPics?.includes(contactPicId) && !c?.deleted_at) {
          return c;
        } else {
          null;
        }
      }),
    );

    const filtered = mapped?.filter((m) => m) as CollectionModel[];

    return filtered;
  } catch (error) {
    return Promise.reject(error);
  }
};

const BOARD_TYPES = {
  PERSONAL: 'Personal',
  INTERNAL: 'Internal',
  COLLABORATION: 'Collaboration',
};

const filterPersonalTaskBoards = async ({
  taskboards,
  userId,
}: {
  taskboards: TaskBoardModel[];
  userId: UserId;
}): Promise<TaskBoardModel[] | Error> => {
  try {
    const filterBoards = _.filter(
      taskboards,
      (tb) =>
        tb.type !== BOARD_TYPES.PERSONAL ||
        (tb.type === BOARD_TYPES.PERSONAL && tb.created_by === userId),
    );

    return filterBoards;
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  Filter,
  filterCollectionsForCollector,
  filterActivityTrackersPermission,
  filterPersonalTaskBoards,
};

export default exportFunctions;
