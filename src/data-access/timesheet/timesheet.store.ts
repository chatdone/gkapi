import { TaskId } from '@models/task.model';
import knex from '@db/knex';
import _ from 'lodash';
import {
  TimesheetModel,
  TimesheetEntryPayload,
  TimesheetId,
  UpdateTimesheetPayload,
  TimeSheetFilterOptions,
  TimesheetActivityModel,
  ActivityTrackerWeeklyQuery,
  ActivityTrackerWeeklyPayload,
  ActivityTrackerWeeklyModel,
  ActivityTrackerMonthlyQuery,
  ActivityTrackerMonthlyModel,
  ActivityTrackerMonthlyPayload,
  ActivityTrackerMonthlyUpdatePayload,
  ActivityTrackerDailyModel,
  ActivityTrackerDailyPayload,
  ActivityTrackerDailyQuery,
  ActivityTrackerWeeklySummariesForMonthQuery,
  TimesheetDayApprovalModel,
  TimesheetDayCustomApprovalModel,
} from '@models/timesheet.model';
import { CompanyId, CompanyMemberId } from '@models/company.model';
import { camelize } from '@data-access/utils';
import { TableNames } from '@db-tables';
import dayjs from 'dayjs';

const createTimesheetActivity = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TimesheetActivityModel | Error> => {
  try {
    const insertActivity = await knex(TableNames.TIMESHEET_ACTIVITIES).insert({
      task_id: taskId,
      created_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.TIMESHEET_ACTIVITIES)
      .where('id', _.head(insertActivity))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTimesheet = async ({
  payload,
}: {
  payload: TimesheetEntryPayload;
}): Promise<TimesheetModel | Error> => {
  try {
    const insertEntry = await knex(TableNames.TIMESHEETS).insert({
      ...payload,
    });

    const res = await knex
      .from(TableNames.TIMESHEETS)
      .where('id', _.head(insertEntry))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTimesheetsByCompanyMemberIds = async ({
  companyMemberIds,
}: {
  companyMemberIds: CompanyMemberId[];
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TIMESHEETS)
      .whereIn('company_member_id', companyMemberIds)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTimesheetByCompanyMemberId = async ({
  companyMemberId,
}: {
  companyMemberId: CompanyMemberId;
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TIMESHEETS)
      .where('company_member_id', companyMemberId)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTimesheet = async ({
  timesheetId,
  payload,
}: {
  timesheetId: TimesheetId;
  payload: UpdateTimesheetPayload;
}): Promise<TimesheetModel | Error> => {
  try {
    const check = await knex(TableNames.TIMESHEETS)
      .where({
        id: timesheetId,
        end_date: null,
      })
      .select();

    if (_.isEmpty(check)) {
      throw new Error('Activity tracker has already been stopped.');
    }

    await knex(TableNames.TIMESHEETS)
      .where({ id: timesheetId, end_date: null })
      .update({ ...payload, updated_at: knex.fn.now() });
    const res = await knex({ ts: TableNames.TIMESHEETS })
      .leftJoin(
        { ta: TableNames.TIMESHEET_ACTIVITIES },
        'ta.id',
        'ts.activity_id',
      )
      .leftJoin({ t: TableNames.TASKS }, 't.id', 'ta.task_id')
      .where('ts.id', timesheetId)
      .select('ts.*', 'ta.task_id', 't.actual_effort');

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTotalTimeSpentByTaskId = async (taskId: TaskId): Promise<number> => {
  try {
    const res = (await knex
      .from({ ts: TableNames.TIMESHEETS })
      .leftJoin(
        { ta: TableNames.TIMESHEET_ACTIVITIES },
        'ta.id',
        'ts.activity_id',
      )
      .where({ 'ta.task_id': taskId })
      .select('ts.*')) as TimesheetModel[];

    const totalTimeSpent = res.reduce((acc, curr) => {
      if (curr.end_date) {
        const duration = dayjs(curr.end_date).diff(dayjs(curr.start_date), 's');

        return acc + duration;
      }
      return acc;
    }, 0);

    return totalTimeSpent / 60;
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const updateTaskActualEffortByTimesheetActivities = async () => {
  try {
    const timesheetActivities = await knex
      .from({ ta: TableNames.TIMESHEET_ACTIVITIES })
      .leftJoin({ ts: TableNames.TIMESHEETS }, 'ts.activity_id', 'ta.id')
      .select('ts.*', 'ta.task_id');

    for (let i = 0; i < timesheetActivities.length; i++) {
      const element = timesheetActivities[i];
      const totalTimeSpent = await getTotalTimeSpentByTaskId(element.task_id);

      await knex(TableNames.TASKS)
        .where({ id: element.task_id })
        .update({ actual_effort: totalTimeSpent });
    }
    return;
  } catch (error) {
    return Promise.reject(error);
  }
};

// const updateActualCost = async ({
//   timesheetId,
//   payload,
//   timesheet,
// }: {
//   timesheetId: TimesheetId;
//   payload: UpdateTimesheetPayload;
//   timesheet: TimesheetModel;
// }): Promise<void | Error> => {
//   try {
//     if (payload.end_date) {
//       const companyMember = (await knex('company_members')
//         .where({ id: timesheet.company_member_id })
//         .select()) as CompanyMemberModel[];

//       const duration = dayjs(timesheet.end_date).diff(
//         dayjs(timesheet.start_date),
//         's',
//       );

//       const task = (await knex({ ta: TIMESHEET_ACTIVITIES })
//         .leftJoin({ c: 'cards' }, 'ta.task_id', 'c.id')
//         .leftJoin({ t: TIMESHEETS }, 't.activity_id', 'ta.id')
//         .where({ 't.id': timesheetId })
//         .select('c.*')) as TaskModel[];

//       if (task[0]) {
//         const hourlyRate = companyMember[0]?.hourly_rate
//           ? _.toNumber(companyMember[0].hourly_rate)
//           : 0;
//         const currentActualCost =
//           task[0]?.actual_cost !== null ? _.toNumber(task[0].actual_cost) : 0;
//         const actualCost = _.round(
//           currentActualCost + (duration / 3600) * hourlyRate,
//           2,
//         );
//         await knex('cards')
//           .where('id', task[0]?.id)
//           .update({ actual_cost: actualCost });
//       }
//     }
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };

const updateTimeSheetArchivedStatus = async ({
  timesheetIds,
  archived,
}: {
  timesheetIds: TimesheetId[];
  archived: number;
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    await knex(TableNames.TIMESHEETS)
      .whereIn('id', timesheetIds)
      .update({ archived: archived });
    const res = await knex(TableNames.TIMESHEETS)
      .whereIn('id', timesheetIds)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const filterTimeSheet = async ({
  filterBy,
}: {
  filterBy: TimeSheetFilterOptions;
}): Promise<(TimesheetModel | Error)[]> => {
  try {
    const res = await knex({ t: TableNames.TIMESHEETS })
      .leftJoin({ ta: 'timesheet_activities' }, 't.activity_id', 'ta.id')
      .leftJoin({ c: 'cards' }, 'c.id', 'ta.task_id')
      .where(
        knex.raw(`
      ${
        filterBy.companyMemberId
          ? `t.company_member_id = ${filterBy.companyMemberId}  ${
              filterBy.teamId ? `and` : ''
            }`
          : ''
      }
      ${filterBy.teamId ? `c.team_id = ${filterBy.teamId}` : ''}
    `),
      )
      .select({
        id: 't.id',
        id_text: 't.id_text',
        company_member_id: 't.company_member_id',
        activity_id: 't.activity_id',
        location_id: 't.location_id',
        time_total: 't.time_total',
        start_date: 't.start_date',
        end_date: 't.end_date',
        submitted_date: 't.submitted_date',
        archived: 't.archived',
        comments: 't.comments',
        created_at: 't.created_at',
        updated_at: 't.updated_at',
      });

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTimesheetActivityByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TimesheetActivityModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.TIMESHEET_ACTIVITIES)
      .where({ task_id: taskId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getActivityTimeSummaryByWeek = async ({
  companyId,
  payload,
}: {
  companyId: CompanyId;
  payload: ActivityTrackerWeeklyQuery;
}): Promise<(ActivityTrackerWeeklyModel | Error)[]> => {
  try {
    let res;

    if (!payload?.company_member_id && payload?.task_id) {
      res = await knex
        .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
        .where({
          task_id: payload.task_id,
          week_number: payload.week_number,
          year: payload.year,
        })
        .select();
    } else if (payload?.company_member_id && !payload?.task_id) {
      res = await knex
        .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
        .where({
          company_member_id: payload.company_member_id,
          week_number: payload.week_number,
          year: payload.year,
        })
        .select();
    } else if (payload?.company_member_id && payload?.task_id) {
      res = await knex
        .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
        .where({ ...payload })
        .select();
    } else {
      res = await knex
        .from({ weekly: TableNames.ACTIVITY_TRACKER_WEEKLY })
        .leftJoin({ t: 'cards' }, 't.id', 'weekly.task_id')
        .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
        .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
        .where({
          week_number: payload?.week_number,
          year: payload?.year,
          'com.id': companyId,
        })
        .select('weekly.*');
    }

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getActivityWeeklySummariesForMonth = async ({
  companyId,
  query,
}: {
  companyId: CompanyId;
  query: ActivityTrackerWeeklySummariesForMonthQuery;
}): Promise<(ActivityTrackerWeeklyModel | Error)[]> => {
  try {
    let res;

    if (!query?.company_member_id && query?.task_id) {
      res = await knex
        .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
        .where({
          task_id: query.task_id,
          year: query.year,
        })
        .whereIn('week_number', query.week_numbers)
        .select();
    } else if (query?.company_member_id && !query?.task_id) {
      res = await knex
        .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
        .where({
          company_member_id: query.company_member_id,
          year: query.year,
        })
        .whereIn('week_number', query.week_numbers)
        .select();
    } else if (query?.company_member_id && query?.task_id) {
      res = await knex
        .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
        .where({ ...query })
        .select();
    } else {
      res = await knex
        .from({ weekly: TableNames.ACTIVITY_TRACKER_WEEKLY })
        .leftJoin({ t: 'cards' }, 't.id', 'weekly.task_id')
        .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
        .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
        .where({
          year: query?.year,
          'com.id': companyId,
        })
        .whereIn('week_number', query.week_numbers)
        .select('weekly.*');
    }

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getActivityTimeSummaryByMonth = async ({
  companyId,
  query,
}: {
  companyId: CompanyId;
  query: ActivityTrackerMonthlyQuery;
}): Promise<(ActivityTrackerMonthlyModel | Error)[]> => {
  try {
    const res = await knex
      .from({ monthly: TableNames.ACTIVITY_TRACKER_MONTHLY })
      .leftJoin({ t: 'cards' }, 't.id', 'monthly.task_id')
      .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
      .whereIn('week_number', query.week_number)
      .where((builder) => {
        if (query?.company_member_id) {
          builder.where({
            'monthly.company_member_id': query.company_member_id,
          });
        }
        if (query?.task_id) {
          builder.where({
            'monthly.task_id': query.task_id,
          });
        }
      })
      .where({
        'com.id': companyId,
      })
      .groupBy('company_member_id', 'task_id')
      .select('monthly.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getActivityTimeSummaryByDay = async ({
  query,
  companyId,
}: {
  query: ActivityTrackerDailyQuery;
  companyId: CompanyId;
}): Promise<(ActivityTrackerDailyModel | Error)[]> => {
  try {
    let res;

    const { day, month, year } = query;

    if (!query?.company_member_id && query?.task_id) {
      res = await knex
        .from({ daily: TableNames.ACTIVITY_TRACKER_DAILY })
        .leftJoin({ t: 'cards' }, 't.id', 'daily.task_id')
        .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
        .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
        .where({
          'daily.task_id': query.task_id,
          'daily.day': query.day,
          'daily.month': query.month,
          'daily.year': query.year,
        })
        .select('daily.*');
    } else if (query?.company_member_id && !query?.task_id) {
      res = await knex
        .from({ daily: TableNames.ACTIVITY_TRACKER_DAILY })
        .leftJoin({ t: 'cards' }, 't.id', 'daily.task_id')
        .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
        .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
        .where({
          'daily.company_member_id': query.company_member_id,
          'daily.day': query.day,
          'daily.month': query.month,
          'daily.year': query.year,
        })
        .select('daily.*');
    } else if (query?.company_member_id && query?.task_id) {
      res = await knex
        .from({ daily: TableNames.ACTIVITY_TRACKER_DAILY })
        .leftJoin({ t: 'cards' }, 't.id', 'daily.task_id')
        .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
        .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
        .where({
          'daily.task_id': query.task_id,
          'daily.company_member_id': query.company_member_id,
          'daily.day': query.day,
          'daily.month': query.month,
          'daily.year': query.year,
        })
        .select('daily.*');
    } else {
      res = await knex
        .from({ daily: TableNames.ACTIVITY_TRACKER_DAILY })
        .leftJoin({ t: 'cards' }, 't.id', 'daily.task_id')
        .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
        .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
        .where({
          'daily.day': day,
          'daily.month': month,
          'daily.year': year,
          'com.id': companyId,
        })
        .select('daily.*');
    }

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createDailyActivityTrackerSummary = async ({
  payload,
}: {
  payload: ActivityTrackerDailyPayload;
}): Promise<ActivityTrackerDailyModel | Error> => {
  try {
    const insert = await knex
      .from(TableNames.ACTIVITY_TRACKER_DAILY)
      .insert({ ...payload })
      .select();

    const res = await knex
      .from(TableNames.ACTIVITY_TRACKER_DAILY)
      .where({ id: _.head(insert) })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createWeeklyActivityTrackerSummary = async ({
  payload,
}: {
  payload: ActivityTrackerWeeklyPayload;
}): Promise<ActivityTrackerWeeklyModel | Error> => {
  try {
    const insert = await knex
      .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
      .insert({ ...payload })
      .select();

    const res = await knex
      .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
      .where({ id: _.head(insert) })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createMonthlyActivityTrackerSummary = async ({
  payload,
}: {
  payload: ActivityTrackerMonthlyPayload;
}): Promise<ActivityTrackerMonthlyModel | Error> => {
  try {
    const insert = await knex
      .from(TableNames.ACTIVITY_TRACKER_MONTHLY)
      .insert({ ...payload })
      .select();

    const res = await knex
      .from(TableNames.ACTIVITY_TRACKER_MONTHLY)
      .where({ id: _.head(insert) })
      .select();

    return camelize(_.head(res));
  } catch (error) {
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
    await knex
      .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
      .where({ id: weeklyTimesheetId })
      .increment('monday', payload.monday)
      .increment('tuesday', payload.tuesday)
      .increment('wednesday', payload.wednesday)
      .increment('thursday', payload.thursday)
      .increment('friday', payload.friday)
      .increment('saturday', payload.saturday)
      .increment('sunday', payload.sunday)
      .update({ updated_at: knex.fn.now() })
      .select();

    const res = await knex
      .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
      .where({ id: weeklyTimesheetId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateMonthlyTimesheetSummary = async ({
  monthlyTimesheetId,
  payload,
}: {
  monthlyTimesheetId: number;
  payload: ActivityTrackerMonthlyUpdatePayload;
}): Promise<ActivityTrackerMonthlyModel | Error> => {
  try {
    await knex
      .from(TableNames.ACTIVITY_TRACKER_MONTHLY)
      .where({ id: monthlyTimesheetId })
      .increment('week_total', payload.week_total)
      .update({ updated_at: knex.fn.now() })
      .select();

    const res = await knex
      .from(TableNames.ACTIVITY_TRACKER_MONTHLY)
      .where({ id: monthlyTimesheetId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
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
    await knex
      .from(TableNames.ACTIVITY_TRACKER_DAILY)
      .where({ id: dailyActivityTrackerId })
      .update({ total, updated_at: knex.fn.now() })
      .select();

    const res = await knex
      .from(TableNames.ACTIVITY_TRACKER_DAILY)
      .where({ id: dailyActivityTrackerId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTimesheetsByActivityId = async ({
  activityId,
  memberId,
}: {
  activityId: number;
  memberId?: CompanyMemberId;
}): Promise<TimesheetModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TIMESHEETS)
      .where({
        activity_id: activityId,
      })
      .andWhere((builder) => {
        if (memberId) {
          builder.where({ company_member_id: memberId });
        }
      })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const stopMemberActivityTracker = async ({
  memberId,
}: {
  memberId: CompanyMemberId;
}): Promise<TimesheetModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.TIMESHEETS)
      .where({ end_date: null, company_member_id: memberId })
      .select();
    await knex
      .from(TableNames.TIMESHEETS)
      .where({ end_date: null, company_member_id: memberId })
      .update({ end_date: knex.fn.now() });

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteViewsForTask = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<void> => {
  try {
    const activities = (await knex
      .from(TableNames.TIMESHEET_ACTIVITIES)
      .where({ task_id: taskId })
      .select()) as TimesheetActivityModel[];

    const activityIds = _.map(activities, (act) => act.id);

    await knex
      .from(TableNames.TIMESHEETS)
      .whereIn('activity_id', activityIds)
      .delete();
    await knex
      .from(TableNames.ACTIVITY_TRACKER_DAILY)
      .where({ task_id: taskId })
      .delete();
    await knex
      .from(TableNames.ACTIVITY_TRACKER_WEEKLY)
      .where({ task_id: taskId })
      .delete();
    await knex
      .from(TableNames.ACTIVITY_TRACKER_MONTHLY)
      .where({ task_id: taskId })
      .delete();
    await knex
      .from(TableNames.TIMESHEET_ACTIVITIES)
      .where({ task_id: taskId })
      .delete();
  } catch (error) {
    return Promise.reject(error);
  }
};

type TimesheetApprovalCreatePayload = {
  day: number;
  month: number;
  year: number;
  total: number;
};

type DeleteTimesheetApprovalCreatePayload = {
  day: number;
  month: number;
  year: number;
};

const createTimesheetApproval = async (input: {
  memberId: number;
  taskInput: { taskId: TaskId; days: TimesheetApprovalCreatePayload }[];
}): Promise<TimesheetDayApprovalModel[]> => {
  try {
    const { memberId, taskInput } = input;

    for (const ti of taskInput) {
      const { taskId, days } = ti;

      const { day: dayOfMonth, month, year, total } = days;

      await knex
        .from('timesheet_day_approvals')
        .insert({
          task_id: taskId,
          company_member_id: memberId,
          day: dayOfMonth,
          month,
          year,
          total,
        })
        .onConflict(['task_id', 'company_member_id', 'day', 'month', 'year'])
        .merge();
    }

    const res = await knex
      .from('timesheet_day_approvals')
      .where('company_member_id', memberId)
      .whereIn(
        'task_id',
        taskInput.map((ti) => ti.taskId),
      )
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTimesheetApprovals = async ({
  memberIds,
}: {
  memberIds: number[];
}) => {
  try {
    const res = await knex
      .from('timesheet_day_approvals')
      .whereIn('company_member_id', memberIds)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTimesheetApprovals = async ({
  dates,
  sheets,
  status,
  billable,
}: {
  dates: { day: number; month: number; year: number }[];
  sheets: { memberIds?: CompanyMemberId[]; taskIds: TaskId[] };
  status?: number;
  billable?: number;
}) => {
  try {
    const { memberIds = [], taskIds = [] } = sheets;

    if (typeof status === 'number') {
      for (let i = 0; i < dates.length; i++) {
        const { day, month, year } = dates[i];

        await knex
          .from('timesheet_day_approvals')
          .where({
            day,
            month,
            year,
          })
          .whereIn('company_member_id', memberIds)
          .whereIn('task_id', taskIds)
          .update({
            status,
          });
      }
    } else if (typeof billable === 'number') {
      for (let i = 0; i < dates.length; i++) {
        const { day, month, year } = dates[i];

        await knex
          .from('timesheet_day_approvals')
          .where({
            day,
            month,
            year,
          })
          .whereIn('company_member_id', memberIds)
          .whereIn('task_id', taskIds)
          .update({
            billable,
          });
      }
    }

    let res: TimesheetDayApprovalModel[] = [];

    for (let i = 0; i < dates.length; i++) {
      const { day, month, year } = dates[i];
      const res1 = await knex
        .from('timesheet_day_approvals')
        .where({
          day,
          month,
          year,
        })
        .whereIn('company_member_id', memberIds)
        .whereIn('task_id', taskIds)
        .select();
      res = [...res, ...res1];
    }

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTimesheetApprovalsByDate = async ({
  memberId,
  taskId,
  dates,
}: {
  memberId: number;
  taskId: TaskId;
  dates: { day: number; month: number; year: number }[];
}) => {
  try {
    const res = [];

    for (let i = 0; i < dates.length; i++) {
      const { day, month, year } = dates[i];
      const r = await knex
        .from('timesheet_day_approvals')
        .where({
          day,
          month,
          year,
          company_member_id: memberId,
          task_id: taskId,
          status: 1,
          billable: 1,
        })
        .first();

      res.push(r);
    }

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTimesheetCustomApproval = async (input: {
  memberId: number;
  customInput: { customName: string; days: TimesheetApprovalCreatePayload }[];
}): Promise<TimesheetDayCustomApprovalModel[]> => {
  try {
    const { memberId, customInput } = input;

    for (const ti of customInput) {
      const { customName, days } = ti;

      const { day: dayOfMonth, month, year, total } = days;

      await knex
        .from('timesheet_day_custom_approvals')
        .insert({
          custom_name: customName,
          company_member_id: memberId,
          day: dayOfMonth,
          month,
          year,
          total,
        })
        .onConflict([
          'custom_name',
          'company_member_id',
          'day',
          'month',
          'year',
        ])
        .merge();
    }

    const res = await knex
      .from('timesheet_day_approvals')
      .where('company_member_id', memberId)
      .whereIn(
        'task_id',
        customInput.map((ti) => ti.customName),
      )
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCustomTimesheetApprovals = async ({
  memberIds,
}: {
  memberIds: number[];
}) => {
  try {
    const res = await knex
      .from('timesheet_day_custom_approvals')
      .whereIn('company_member_id', memberIds)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCustomTimesheetApprovals = async ({
  dates,
  sheets,
  status,
  billable,
}: {
  dates: { day: number; month: number; year: number }[];
  sheets: { memberIds?: CompanyMemberId[]; customNames: string[] };
  status?: number;
  billable?: number;
}) => {
  try {
    const { memberIds = [], customNames = [] } = sheets;

    if (typeof status === 'number') {
      for (let i = 0; i < dates.length; i++) {
        const { day, month, year } = dates[i];

        await knex
          .from('timesheet_day_custom_approvals')
          .where({
            day,
            month,
            year,
          })
          .whereIn('company_member_id', memberIds)
          .whereIn('custom_name', customNames)
          .update({
            status,
          });
      }
    } else if (typeof billable === 'number') {
      for (let i = 0; i < dates.length; i++) {
        const { day, month, year } = dates[i];

        await knex
          .from('timesheet_day_custom_approvals')
          .where({
            day,
            month,
            year,
          })
          .whereIn('company_member_id', memberIds)
          .whereIn('custom_name', customNames)
          .update({
            billable,
          });
      }
    }

    let res: TimesheetDayCustomApprovalModel[] = [];

    for (let i = 0; i < dates.length; i++) {
      const { day, month, year } = dates[i];
      const res1 = await knex
        .from('timesheet_day_custom_approvals')
        .where({
          day,
          month,
          year,
        })
        .whereIn('company_member_id', memberIds)
        .whereIn('custom_name', customNames)
        .select();
      res = [...res, ...res1];
    }

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCustomTimesheetApprovals = async (input: {
  memberId: number;
  customInput: {
    customName: string;
    days: DeleteTimesheetApprovalCreatePayload;
  }[];
}) => {
  try {
    const { memberId, customInput } = input;

    const customApprovals: TimesheetDayCustomApprovalModel[] = [];
    for (const ti of customInput) {
      const { customName, days } = ti;

      const { day: dayOfMonth, month, year } = days;

      const res = await knex
        .from(TableNames.TIMESHEET_DAY_CUSTOM_APPROVALS)
        .where({
          custom_name: customName,
          company_member_id: memberId,
          day: dayOfMonth,
          month,
          year,
        })
        .select();

      customApprovals.push(...res);

      await knex
        .from(TableNames.TIMESHEET_DAY_CUSTOM_APPROVALS)
        .where({
          custom_name: customName,
          company_member_id: memberId,
          // day: dayOfMonth,
          // month,
          // year,
        })
        .del();
    }

    return camelize(customApprovals);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

export default {
  createTimesheetActivity,
  createTimesheet,
  getTimesheetsByCompanyMemberIds,
  getTimesheetByCompanyMemberId,
  updateTimesheet,
  updateTimeSheetArchivedStatus,
  filterTimeSheet,
  getTimesheetActivityByTaskId,
  getActivityTimeSummaryByWeek,
  createWeeklyActivityTrackerSummary,
  updateWeeklyTimesheetSummary,
  getActivityTimeSummaryByMonth,
  createMonthlyActivityTrackerSummary,
  updateMonthlyTimesheetSummary,
  createDailyActivityTrackerSummary,
  getActivityTimeSummaryByDay,
  updateDailyTimesheetSummary,
  getTimesheetsByActivityId,
  getActivityWeeklySummariesForMonth,
  stopMemberActivityTracker,
  deleteViewsForTask,
  getTotalTimeSpentByTaskId,
  updateTaskActualEffortByTimesheetActivities,
  createTimesheetApproval,
  getTimesheetApprovals,
  updateTimesheetApprovals,
  getTimesheetApprovalsByDate,
  createTimesheetCustomApproval,
  getCustomTimesheetApprovals,
  updateCustomTimesheetApprovals,
  deleteCustomTimesheetApprovals,
};
