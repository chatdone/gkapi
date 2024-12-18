import {
  CompanyStore,
  createLoaders,
  TaskStore,
  TimesheetStore,
} from '@data-access';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyTeamMemberModel,
} from '@models/company.model';
import { FilterOptionsModel } from '@models/filter.model';
import { TaskId, TaskModel } from '@models/task.model';
import {
  TimesheetModel,
  TimesheetEntryPayload,
  TimesheetId,
  UpdateTimesheetPayload,
  TimeSheetFilterOptions,
  TimesheetActivityModel,
  ActivityTrackerWeeklyModel,
  ActivityTrackerWeeklyQuery,
  ActivityTrackerWeeklyPayload,
  ActivityTrackerMonthlyQuery,
  ActivityTrackerMonthlyModel,
  ActivityTrackerMonthlyPayload,
  ActivityTrackerDailyPayload,
  ActivityTrackerDailyModel,
  TimeTrackedModel,
  ActivityTrackerDailyQuery,
  ActivityTrackerWeeklySummariesForMonthQuery,
} from '@models/timesheet.model';
import {
  CompanyService,
  EventManagerService,
  FilterService,
  TaskService,
} from '@services';
import _ from 'lodash';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import { UserId } from '@models/user.model';
import logger from '@tools/logger';
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(tz);

const createTimesheetActivity = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TimesheetActivityModel | Error> => {
  try {
    const res = await TimesheetStore.createTimesheetActivity({ taskId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'createTimesheetActivity',
        taskId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const createTimesheet = async ({
  payload,
  task,
  userId,
}: {
  payload: TimesheetEntryPayload;
  task: { actual_start: string | null; id: number };
  userId: UserId;
}): Promise<TimesheetModel | Error> => {
  const ERR = 'Cannot start a new timesheet if there is an ongoing one';
  try {
    const timesheets = (await exportFunctions.getTimesheetByCompanyMemberId({
      companyMemberId: payload?.company_member_id,
    })) as TimesheetModel[];

    if (timesheets.some((tm) => !tm?.end_date)) {
      throw new Error(ERR);
    }

    if (!task?.actual_start) {
      await TaskService.updateActualStart({
        taskId: task.id,
        payload: { updatedBy: userId },
      });
    }

    const res = await TimesheetStore.createTimesheet({
      payload,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    if (err?.message !== ERR) {
      logger.logError({
        payload: {
          service: 'timesheet',
          fnName: 'createTimesheet',
          payload,
          taskId: task?.id,
        },
        error: err,
      });
    }

    return Promise.reject(error);
  }
};

const getTimesheetsByCompanyMemberIds = async ({
  companyMemberIds,
  filters,
}: {
  companyMemberIds: CompanyMemberId[];
  filters?: FilterOptionsModel;
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    const res = await TimesheetStore.getTimesheetsByCompanyMemberIds({
      companyMemberIds,
    });
    const timesheets = filters ? await FilterService.Filter(res, filters) : res;

    return timesheets;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getTimesheetsByCompanyMemberIds',
        companyMemberIds,
        filters,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTimesheetByCompanyMemberId = async ({
  companyMemberId,
}: {
  companyMemberId: CompanyMemberId;
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    const res = await TimesheetStore.getTimesheetByCompanyMemberId({
      companyMemberId,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getTimesheetByCompanyMemberId',
        companyMemberId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateTimesheet = async ({
  timesheetId,
  payload,
  companyId,
}: {
  timesheetId: TimesheetId;
  payload: UpdateTimesheetPayload;
  companyId: CompanyId;
}): Promise<TimesheetModel | Error> => {
  try {
    const res = (await TimesheetStore.updateTimesheet({
      timesheetId,
      payload,
    })) as TimesheetModel;

    if (payload?.end_date) {
      await EventManagerService.handleActivityTimerStopped({
        timesheet: res,
        companyId,
      });

      await updateActualCost({ timesheetId, timesheet: res });

      await updateActualEffort({
        taskId: res?.taskId as TaskId,
      });
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'updateTimesheet',
        timesheetId,
        payload,
        companyId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateActualCost = async ({
  timesheetId,
  timesheet,
}: {
  timesheetId: TimesheetId;
  timesheet: TimesheetModel;
}): Promise<void | Error> => {
  try {
    const loaders = await createLoaders();
    const companyMember = (await loaders.companyMembers.load(
      timesheet.company_member_id,
    )) as CompanyMemberModel;

    const duration = dayjs(timesheet.end_date).diff(
      dayjs(timesheet.start_date),
      's',
    );

    const task = (await TaskService.getTaskByTimesheetId(
      timesheetId,
    )) as TaskModel;

    if (task && companyMember) {
      const hourlyRate = companyMember.hourly_rate
        ? _.toNumber(companyMember.hourly_rate)
        : 0;
      const currentActualCost =
        task.actual_cost !== null ? _.toNumber(task.actual_cost) : 0;

      const actualCost = _.round(
        currentActualCost + (duration / 3600) * hourlyRate,
        2,
      );

      await TaskStore.updateActualCost({ taskId: task.id, actualCost });
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'updateActualCost',
        timesheetId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateActualEffort = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<void | Error> => {
  try {
    const duration = await TimesheetStore.getTotalTimeSpentByTaskId(taskId);

    await TaskStore.updateActualEffort({
      taskId,
      actualEffort: duration,
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'updateActualCost',
        taskId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateTimeSheetArchivedStatus = async ({
  timesheetIds,
  archived,
}: {
  timesheetIds: TimesheetId[];
  archived: number;
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    const res = await TimesheetStore.updateTimeSheetArchivedStatus({
      timesheetIds,
      archived,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'updateTimeSheetArchivedStatus',
        timesheetIds,
        archived,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const filterTimesheet = async ({
  filterBy,
}: {
  filterBy: TimeSheetFilterOptions;
}) => {
  try {
    const res = await TimesheetStore.filterTimeSheet({ filterBy });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'filterTimesheet',
        filterBy,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTimesheetActivityByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TimesheetActivityModel | Error> => {
  try {
    const res = await TimesheetStore.getTimesheetActivityByTaskId({ taskId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getTimesheetActivityByTaskId',
        taskId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getActivityTimeSummaryByDay = async ({
  query,
  companyId,
  userId,
}: {
  query: ActivityTrackerDailyQuery;
  companyId: CompanyId;
  userId?: UserId;
}): Promise<(ActivityTrackerDailyModel | Error)[]> => {
  try {
    let res = (await TimesheetStore.getActivityTimeSummaryByDay({
      query,
      companyId,
    })) as ActivityTrackerDailyModel[];

    if (userId) {
      //Don't need userId if it's for recalculate, only for querying to FE.
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        userId,
        companyId,
      })) as CompanyMemberModel;

      const teams = (await CompanyService.getCompanyTeamsByMemberId({
        memberId: member.id,
      })) as CompanyTeamMemberModel[];

      const teamIds = _.map(teams, (t) => t?.team_id);

      res = (await FilterService.filterActivityTrackersPermission({
        tasks: res as ActivityTrackerDailyModel[],
        memberId: member?.id,
        teamIds,
      })) as ActivityTrackerDailyModel[];
    }

    return res as ActivityTrackerDailyModel[];
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getActivityTimeSummaryByDay',
        query,
        companyId,
        userId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getActivityTimeSummaryByWeek = async ({
  payload,
  companyId,
  userId,
}: {
  payload: ActivityTrackerWeeklyQuery;
  companyId: CompanyId;
  userId?: UserId;
}): Promise<(ActivityTrackerWeeklyModel | Error)[]> => {
  try {
    const res = (await TimesheetStore.getActivityTimeSummaryByWeek({
      companyId,
      payload,
    })) as ActivityTrackerWeeklyModel[];

    let weeklyTimesheet = await FilterService.Filter(res, {
      company_id: companyId,
    });

    if (userId && weeklyTimesheet?.length > 0) {
      //Don't need userId if it's for recalculate, only for querying to FE.
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        userId,
        companyId,
      })) as CompanyMemberModel;

      const teams = (await CompanyService.getCompanyTeamsByMemberId({
        memberId: member.id,
      })) as CompanyTeamMemberModel[];

      const teamIds = _.map(teams, (t) => t?.team_id);

      weeklyTimesheet = (await FilterService.filterActivityTrackersPermission({
        tasks: weeklyTimesheet as ActivityTrackerWeeklyModel[],
        memberId: member?.id,
        teamIds,
      })) as ActivityTrackerWeeklyModel[];
    }

    return weeklyTimesheet;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getActivityTimeSummaryByWeek',
        companyId,
        userId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getActivityTimeSummaryByMonth = async ({
  query,
  companyId,
  userId,
}: {
  query: ActivityTrackerMonthlyQuery;
  companyId: CompanyId;
  userId?: UserId;
}): Promise<(ActivityTrackerMonthlyModel | Error)[]> => {
  try {
    let res = await TimesheetStore.getActivityTimeSummaryByMonth({
      query,
      companyId,
    });

    if (userId && res?.length > 0) {
      //Don't need userId if it's for recalculate, only for querying to FE.
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        userId,
        companyId,
      })) as CompanyMemberModel;

      const teams = (await CompanyService.getCompanyTeamsByMemberId({
        memberId: member.id,
      })) as CompanyTeamMemberModel[];

      const teamIds = _.map(teams, (t) => t?.team_id);

      res = (await FilterService.filterActivityTrackersPermission({
        tasks: res as ActivityTrackerMonthlyModel[],
        memberId: member?.id,
        teamIds,
      })) as ActivityTrackerMonthlyModel[];
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getActivityTimeSummaryByMonth',
        companyId,
        userId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getActivityWeeklySummariesForMonth = async ({
  companyId,
  query,
  userId,
}: {
  companyId: CompanyId;
  query: ActivityTrackerWeeklySummariesForMonthQuery;
  userId?: UserId;
}): Promise<(ActivityTrackerWeeklyModel | Error)[]> => {
  try {
    let res = await TimesheetStore.getActivityWeeklySummariesForMonth({
      query,
      companyId,
    });

    if (userId && res?.length > 0) {
      //Don't need userId if it's for recalculate, only for querying to FE.
      const member = (await CompanyService.getMemberByUserIdAndCompanyId({
        userId,
        companyId,
      })) as CompanyMemberModel;

      const teams = (await CompanyService.getCompanyTeamsByMemberId({
        memberId: member.id,
      })) as CompanyTeamMemberModel[];

      const teamIds = _.map(teams, (t) => t?.team_id);

      res = (await FilterService.filterActivityTrackersPermission({
        tasks: res as ActivityTrackerWeeklyModel[],
        memberId: member?.id,
        teamIds,
      })) as ActivityTrackerWeeklyModel[];
    }

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getActivityWeeklySummariesForMonth',
        companyId,
        userId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTimeTracked = async ({
  query,
}: {
  query: { start_date: string; end_date: string };
}): Promise<TimeTrackedModel[] | Error | void> => {
  try {
    const endDate = dayjs(query.end_date).toISOString();
    const startDate = dayjs(query.start_date).toISOString();

    const endDateOnly = dayjs(endDate).format('YYYY-MM-DD').toString();
    const startDateOnly = dayjs(startDate).format('YYYY-MM-DD').toString();

    const endDateMidnight = dayjs(`${endDateOnly}:00:00:00.000Z`).toISOString();
    const startDateMidnight = dayjs(
      `${startDateOnly}:23:59:59.000Z`,
    ).toISOString();

    const isSameDay = dayjs(startDate).day() === dayjs(endDate).day();
    const isNextDay =
      dayjs(startDate).add(1, 'day').day() === dayjs(endDate).day();

    const dayDiff = dayjs(endDate)
      .startOf('day')
      .diff(dayjs(startDate).startOf('day'), 'day');

    if (isSameDay) {
      return [
        {
          total: Math.abs(dayjs(endDate).diff(dayjs(startDate), 's')),
          day: dayjs(startDate).date(),
          month: dayjs(startDate).month() + 1,
          year: dayjs(startDate).year(),
        },
      ];
    } else if (isNextDay) {
      const startDay = {
        total: Math.abs(dayjs(startDateMidnight).diff(dayjs(startDate), 's')),
        day: dayjs(startDate).date(),
        month: dayjs(startDate).month() + 1,
        year: dayjs(startDate).year(),
      };
      const endDay = {
        total: Math.abs(dayjs(endDate).diff(dayjs(endDateMidnight), 's')),
        day: dayjs(endDate).date(),
        month: dayjs(endDate).month() + 1,
        year: dayjs(endDate).year(),
      };

      return [startDay, endDay];
    } else if (dayDiff > 1) {
      const daysTracked = new Set();
      for (let i = 0; i <= dayDiff; i++) {
        if (i === 0) {
          const startDay = {
            total: Math.abs(
              dayjs(startDateMidnight).diff(dayjs(startDate), 's'),
            ),
            day: dayjs(startDate).date(),
            month: dayjs(startDate).month() + 1,
            year: dayjs(startDate).year(),
          };
          daysTracked.add(startDay);
        } else if (i === dayDiff) {
          const endDay = {
            total: Math.abs(dayjs(endDate).diff(dayjs(endDateMidnight), 's')),
            day: dayjs(endDate).date(),
            month: dayjs(endDate).month() + 1,
            year: dayjs(endDate).year(),
          };
          daysTracked.add(endDay);
        } else {
          const dateDay = dayjs(startDate).add(i, 'day');
          const day = {
            total: 86400,
            day: dateDay.date(),
            month: dateDay.month() + 1,
            year: dateDay.year(),
          };
          daysTracked.add(day);
        }
      }

      return Array.from(daysTracked) as TimeTrackedModel[];
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getTimeTracked',
        query,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const createDailyActivityTrackerSummary = async ({
  payload,
}: {
  payload: ActivityTrackerDailyPayload;
}): Promise<ActivityTrackerDailyModel | Error> => {
  try {
    const res = (await TimesheetStore.createDailyActivityTrackerSummary({
      payload,
    })) as ActivityTrackerDailyModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'createDailyActivityTrackerSummary',
        payload,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const createWeeklyActivityTrackerSummary = async ({
  payload,
}: {
  payload: ActivityTrackerWeeklyPayload;
}): Promise<ActivityTrackerWeeklyModel | Error> => {
  try {
    const res = (await TimesheetStore.createWeeklyActivityTrackerSummary({
      payload,
    })) as ActivityTrackerWeeklyModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'createWeeklyActivityTrackerSummary',
        payload,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const createMonthlyActivityTrackerSummary = async ({
  payload,
}: {
  payload: ActivityTrackerMonthlyPayload;
}): Promise<ActivityTrackerMonthlyModel | Error> => {
  try {
    const res = (await TimesheetStore.createMonthlyActivityTrackerSummary({
      payload,
    })) as ActivityTrackerMonthlyModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'createMonthlyActivityTrackerSummary',
        payload,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateDailyTimesheetSummary = async ({
  dailyActivityTrackerId,
  total,
}: {
  dailyActivityTrackerId: number;
  total: number;
}): Promise<ActivityTrackerDailyModel | Error> => {
  try {
    const res = (await TimesheetStore.updateDailyTimesheetSummary({
      dailyActivityTrackerId,
      total,
    })) as ActivityTrackerDailyModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'updateDailyTimesheetSummary',
        dailyActivityTrackerId,
        total,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateWeeklyTimesheetSummary = async ({
  weeklyTimesheetId,
  payload,
}: {
  weeklyTimesheetId: number;
  payload: ActivityTrackerWeeklyPayload;
}): Promise<ActivityTrackerWeeklyModel | Error> => {
  try {
    const res = (await TimesheetStore.updateWeeklyTimesheetSummary({
      weeklyTimesheetId,
      payload,
    })) as ActivityTrackerWeeklyModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'updateWeeklyTimesheetSummary',
        weeklyTimesheetId,
        payload,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateMonthlyTimesheetSummary = async ({
  monthlyTimesheetId,
  payload,
}: {
  monthlyTimesheetId: number;
  payload: ActivityTrackerMonthlyPayload;
}): Promise<ActivityTrackerMonthlyModel | Error> => {
  try {
    const res = (await TimesheetStore.updateMonthlyTimesheetSummary({
      monthlyTimesheetId,
      payload,
    })) as ActivityTrackerMonthlyModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'updateMonthlyTimesheetSummary',
        payload,
        monthlyTimesheetId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTimesheetsByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<(TimesheetModel | Error)[]> => {
  const activity = (await exportFunctions.getTimesheetActivityByTaskId({
    taskId,
  })) as TimesheetActivityModel;

  const timesheets = await exportFunctions.getTimesheetsByActivityId({
    activityId: activity.id,
  });

  return timesheets;
};

const getTimesheetsByActivityId = async ({
  activityId,
  memberId,
}: {
  activityId: number;
  memberId?: CompanyMemberId;
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    const res = await TimesheetStore.getTimesheetsByActivityId({
      activityId,
      memberId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'getTimesheetsByActivityId',
        activityId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const stopMemberActivityTracker = async ({
  memberId,
}: {
  memberId: CompanyMemberId;
}): Promise<TimesheetModel | Error> => {
  try {
    ``;
    const res = (await TimesheetStore.stopMemberActivityTracker({
      memberId,
    })) as TimesheetModel;

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'timesheet',
        fnName: 'stopMemberActivityTracker',
        memberId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTimesheetApprovalsByCompany = async ({
  companyId,
}: {
  companyId: CompanyId;
}) => {
  try {
    const members = (await CompanyStore.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];

    const memberIds = members.map((member) => member.id);

    const res = await TimesheetStore.getTimesheetApprovals({ memberIds });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCustomTimesheetApprovalsByCompany = async ({
  companyId,
}: {
  companyId: CompanyId;
}) => {
  try {
    const members = (await CompanyStore.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];

    const memberIds = members.map((member) => member.id);

    const res = await TimesheetStore.getCustomTimesheetApprovals({ memberIds });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  createTimesheetActivity,
  createTimesheet,
  getTimesheetsByCompanyMemberIds,
  getTimesheetByCompanyMemberId,
  updateTimesheet,
  updateTimeSheetArchivedStatus,
  filterTimesheet,
  getTimesheetActivityByTaskId,
  getActivityTimeSummaryByWeek,
  createWeeklyActivityTrackerSummary,
  updateWeeklyTimesheetSummary,
  getActivityTimeSummaryByMonth,
  createMonthlyActivityTrackerSummary,
  updateMonthlyTimesheetSummary,
  createDailyActivityTrackerSummary,
  getTimeTracked,
  getActivityTimeSummaryByDay,
  updateDailyTimesheetSummary,
  getTimesheetsByActivityId,
  getTimesheetsByTaskId,
  getActivityWeeklySummariesForMonth,
  stopMemberActivityTracker,
  getTimesheetApprovalsByCompany,
  getCustomTimesheetApprovalsByCompany,
};

export default exportFunctions;
