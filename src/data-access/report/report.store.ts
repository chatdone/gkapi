import { camelize } from '@data-access/utils';
import knex from '@db/knex';
import { BillingInvoiceModel } from '@models/billing.model';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberPublicId,
  CompanyModel,
  CompanyProfileModel,
} from '@models/company.model';
import { ContactModel, ContactPicModel } from '@models/contact.model';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { WorkspaceId } from '@models/workspace.model';
import {
  ProjectReportRowModel,
  ProjectTaskReportRowModel,
} from '@services/report/report.model';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import { TableNames } from '@db-tables';
dayjs.extend(tz);
dayjs.extend(isSameOrBefore);
import _ from 'lodash';
import { minutesToHoursAndMinutes } from '@services/report/tools';
import { ProjectId, TaskId, TaskModel } from '@models/task.model';
import { parseMoney } from '@services/collection/util';
import { TeamId } from '@models/team.model';
import { UserId } from '@models/user.model';
import { createLoaders } from '@data-access/loaders';
import { TaskService } from '@services';

const selection = {
  'p.deleted_at': null,
  'p.archived_at': null,
  't.archived_at': null,
  't.deleted_at': null,
};

const generateReport = async (query: any) => {
  try {
    const res = await knex.raw(query);
    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const showTime = process.env.SHOW_TIME_PROJECT_TASK ? '%h:%i%p,' : '';

const generateProjectTasksReports = async ({
  companyId,
  timezone = 'Asia/Kuala_Lumpur',
  start,
  end,
  actualStart,
  actualEnd,
  subStatusId,
  contactIds,
  projectIds,
  memberIds,
  teamIds,
  projectedCostMin,
  projectedCostMax,
  actualCostMin,
  actualCostMax,
  projectOwnerIds,
  tagIds,
}: {
  companyId: CompanyId;
  timezone: string;
  start?: string;
  end?: string;
  actualStart?: string;
  actualEnd?: string;
  subStatusId?: number;
  contactIds?: number[];
  projectIds?: number[];
  memberIds?: number[];
  teamIds?: number[];
  projectedCostMin?: string;
  projectedCostMax?: string;
  actualCostMin?: string;
  actualCostMax?: string;
  projectOwnerIds?: number[];
  tagIds?: number[];
}) => {
  try {
    const startDate = `CONVERT_TZ(t.start_date, '+00:00', '${timezone}')`;
    const endDate = `CONVERT_TZ(t.end_date, '+00:00', '${timezone}')`;

    const actualStartDate = `CONVERT_TZ(t.actual_start, '+00:00', '${timezone}')`;
    const actualEndDate = `CONVERT_TZ(t.actual_end, '+00:00', '${timezone}')`;

    const res = (await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 't.job_id')
      .leftJoin({ com: TableNames.COMPANIES }, 'com.id', 'tb.company_id')
      .leftJoin({ ta: TableNames.TIMESHEET_ACTIVITIES }, 'ta.task_id', 't.id')
      .leftJoin({ ts: TableNames.TIMESHEETS }, 'ts.activity_id', 'ta.id')
      .leftJoin({ contact: TableNames.CONTACTS }, 'contact.id', 'tb.contact_id')
      .leftJoin(
        { jobTeam: TableNames.TASK_BOARD_TEAMS },
        'jobTeam.job_id',
        'tb.id',
      )
      .leftJoin(
        { subStatus: TableNames.TASK_STATUSES },
        'subStatus.id',
        't.sub_status_id',
      )
      .leftJoin({ tbo: TableNames.TASK_BOARD_OWNERS }, 'tbo.job_id', 'tb.id')
      .leftJoin(
        { teamMember: 'team_members' },
        'teamMember.team_id',
        'jobTeam.team_id',
      )
      .where({
        'com.id': companyId,
        't.deleted_at': null,

        'tb.archived': 0,
      })

      .andWhere((builder) => {
        if (start && end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${endDate} <= "${dayjs(end)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!start && end) {
          builder.whereRaw(
            `${endDate} <= "${dayjs(end)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (start && !end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        if (actualStart && actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!actualStart && actualEnd) {
          builder.whereRaw(
            `${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (actualStart && !actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        if (subStatusId) {
          builder.where({ 'subStatus.id': subStatusId });
        }

        if (!_.isEmpty(contactIds) && contactIds) {
          builder.whereIn('tb.contact_id', contactIds);
        }

        if (!_.isEmpty(projectIds) && projectIds) {
          builder.whereIn('tb.id', projectIds);
        }

        if (!_.isEmpty(memberIds) && memberIds) {
          builder.whereIn('teamMember.member_id', memberIds);
        }

        if (!_.isEmpty(teamIds) && teamIds) {
          builder.whereIn('team.id', teamIds);
        }

        if (actualCostMax && actualCostMin) {
          builder.whereRaw(
            `t.actual_cost between '${actualCostMin}' and '${actualCostMax}'`,
          );
        } else if (actualCostMax && !actualCostMin) {
          builder.whereRaw(`t.actual_cost < ${actualCostMax}`);
        } else if (!actualCostMax && actualCostMin) {
          builder.whereRaw(`t.actual_cost > ${actualCostMin}`);
        }

        if (projectedCostMax && projectedCostMin) {
          builder.whereRaw(
            `t.projected_cost between '${projectedCostMin}' and '${projectedCostMax}'`,
          );
        } else if (projectedCostMax && !projectedCostMin) {
          builder.whereRaw(`t.projected_cost < ${projectedCostMax}`);
        } else if (projectedCostMin && !projectedCostMax) {
          builder.whereRaw(`t.projected_cost > ${projectedCostMin}`);
        }

        if (!_.isEmpty(projectOwnerIds) && projectOwnerIds) {
          builder.whereIn('tbo.company_member_id', projectOwnerIds);
        }

        if (tagIds && !_.isEmpty(tagIds)) {
          builder.whereIn('tt.tag_id', tagIds);
        }
      })
      .groupBy('t.id')
      .sum({ effort_spent: 'ts.time_total' })
      .select(
        't.id_text as id',
        'tb.id_text as projectId',
        knex.raw('IFNULL(t.name, "-") as "taskName"'),
        knex.raw('IFNULL(tb.name, "-") as "projectName"'),
        knex.raw('IFNULL(contact.name, "-") as "contactName"'),
        knex.raw('IFNULL(subStatus.label, "-") as "subStatus"'),
        knex.raw(
          `IFNULL(DATE_FORMAT(${startDate}, '${showTime} %d %b %Y'), "-") as "start_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(${endDate}, '${showTime} %d %b %Y'), "-") as "end_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_start, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_start"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_end, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_end"`,
        ),

        knex.raw('IFNULL(t.projected_cost, "-") as "projected_cost"'),
        knex.raw('IFNULL(t.actual_cost, "-") as "actual_cost"'),
        knex.raw(
          'IFNULL((DATEDIFF(t.actual_end, t.actual_start) - DATEDIFF(t.end_date, t.start_date)), "-") as "variance"',
        ),
        knex.raw(`(
          select group_concat(team.title separator ', ') 
          from teams team
          left join jobs_teams jt on jt.team_id = team.id
          where jt.job_id = jobTeam.job_id
          ) as "teamName"`),
        knex.raw(`(
        select group_concat(user.name separator ', ') 
        from card_members cam
        left join users user on user.id = cam.user_id
        where cam.card_id = t.id
        ) as "assignee"`),
        knex.raw(`(
          select group_concat(tag.name separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagNames"`),
        knex.raw(`(
          select group_concat(tag.color separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagColors"`),
        knex.raw(`(
            select group_concat(us.name separator ', ') 
            from job_owners jo
            left join company_members cmem on cmem.id = jo.company_member_id
            left join users us on us.id = cmem.user_id
            where tb.id = jo.job_id
            ) as "projectOwner"`),
      )) as ProjectTaskReportRowModel[];

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateProjectTasksUnificationReports = async ({
  companyId,
  timezone = 'Asia/Kuala_Lumpur',
  start,
  end,
  actualStart,
  actualEnd,
  subStatusId,
  contactIds,
  projectIds,
  memberIds,
  teamIds,
  projectedCostMin,
  projectedCostMax,
  actualCostMin,
  actualCostMax,
  projectOwnerIds,
  tagIds,
}: {
  companyId: CompanyId;
  timezone: string;
  start?: string;
  end?: string;
  actualStart?: string;
  actualEnd?: string;
  subStatusId?: number;
  contactIds?: number[];
  projectIds?: number[];
  memberIds?: number[];
  teamIds?: number[];
  projectedCostMin?: string;
  projectedCostMax?: string;
  actualCostMin?: string;
  actualCostMax?: string;
  projectOwnerIds?: number[];
  tagIds?: number[];
}) => {
  try {
    const startDate = `CONVERT_TZ(t.start_date, '+00:00', '${timezone}')`;
    const endDate = `CONVERT_TZ(t.end_date, '+00:00', '${timezone}')`;

    const actualStartDate = `CONVERT_TZ(t.actual_start, '+00:00', '${timezone}')`;
    const actualEndDate = `CONVERT_TZ(t.actual_end, '+00:00', '${timezone}')`;

    const res = (await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 't.job_id')
      .leftJoin({ com: TableNames.COMPANIES }, 'com.id', 'tb.company_id')
      .leftJoin({ contact: TableNames.CONTACTS }, 'contact.id', 'tb.contact_id')
      .leftJoin(
        { jobTeam: TableNames.TASK_BOARD_TEAMS },
        'jobTeam.job_id',
        'tb.id',
      )
      .leftJoin(
        { subStatus: TableNames.TASK_STATUSES },
        'subStatus.id',
        't.sub_status_id',
      )
      .leftJoin({ tbo: TableNames.TASK_BOARD_OWNERS }, 'tbo.job_id', 'tb.id')
      .leftJoin(
        { teamMember: 'team_members' },
        'teamMember.team_id',
        'jobTeam.team_id',
      )
      .where({
        'com.id': companyId,
        't.deleted_at': null,

        'tb.archived': 0,
      })

      .andWhere((builder) => {
        if (start && end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${endDate} <= "${dayjs(end)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!start && end) {
          builder.whereRaw(
            `${endDate} <= "${dayjs(end)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (start && !end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        if (actualStart && actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!actualStart && actualEnd) {
          builder.whereRaw(
            `${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (actualStart && !actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        if (subStatusId) {
          builder.where({ 'subStatus.id': subStatusId });
        }

        if (!_.isEmpty(contactIds) && contactIds) {
          builder.whereIn('tb.contact_id', contactIds);
        }

        if (!_.isEmpty(projectIds) && projectIds) {
          builder.whereIn('tb.id', projectIds);
        }

        if (!_.isEmpty(memberIds) && memberIds) {
          builder.whereIn('teamMember.member_id', memberIds);
        }

        if (!_.isEmpty(teamIds) && teamIds) {
          builder.whereIn('team.id', teamIds);
        }

        if (actualCostMax && actualCostMin) {
          builder.whereRaw(
            `t.actual_cost between '${actualCostMin}' and '${actualCostMax}'`,
          );
        } else if (actualCostMax && !actualCostMin) {
          builder.whereRaw(`t.actual_cost < ${actualCostMax}`);
        } else if (!actualCostMax && actualCostMin) {
          builder.whereRaw(`t.actual_cost > ${actualCostMin}`);
        }

        if (projectedCostMax && projectedCostMin) {
          builder.whereRaw(
            `t.projected_cost between '${projectedCostMin}' and '${projectedCostMax}'`,
          );
        } else if (projectedCostMax && !projectedCostMin) {
          builder.whereRaw(`t.projected_cost < ${projectedCostMax}`);
        } else if (projectedCostMin && !projectedCostMax) {
          builder.whereRaw(`t.projected_cost > ${projectedCostMin}`);
        }

        if (!_.isEmpty(projectOwnerIds) && projectOwnerIds) {
          builder.whereIn('tbo.company_member_id', projectOwnerIds);
        }

        if (tagIds && !_.isEmpty(tagIds)) {
          builder.whereIn('tt.tag_id', tagIds);
        }
      })
      .groupBy('t.id')
      .sum({ effort_spent: 't.actual_effort' })
      .select(
        't.id_text as id',
        'tb.id_text as projectId',
        knex.raw('IFNULL(t.name, "-") as "taskName"'),
        knex.raw('IFNULL(tb.name, "-") as "projectName"'),
        knex.raw('IFNULL(contact.name, "-") as "contactName"'),
        knex.raw('IFNULL(subStatus.label, "-") as "subStatus"'),
        knex.raw(
          `IFNULL(DATE_FORMAT(${startDate}, '${showTime} %d %b %Y'), "-") as "start_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(${endDate}, '${showTime} %d %b %Y'), "-") as "end_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_start, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_start"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_end, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_end"`,
        ),

        knex.raw('IFNULL(t.projected_cost, "-") as "projected_cost"'),
        knex.raw('IFNULL(t.actual_cost, "-") as "actual_cost"'),
        knex.raw(
          'IFNULL((DATEDIFF(t.actual_end, t.actual_start) - DATEDIFF(t.end_date, t.start_date)), "-") as "variance"',
        ),
        knex.raw(`(
          select group_concat(team.title separator ', ') 
          from teams team
          left join jobs_teams jt on jt.team_id = team.id
          where jt.job_id = jobTeam.job_id
          ) as "teamName"`),
        knex.raw(`(
        select group_concat(user.name separator ', ') 
        from card_members cam
        left join users user on user.id = cam.user_id
        where cam.card_id = t.id
        ) as "assignee"`),
        knex.raw(`(
          select group_concat(tag.name separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagNames"`),
        knex.raw(`(
          select group_concat(tag.color separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagColors"`),
        knex.raw(`(
            select group_concat(us.name separator ', ') 
            from job_owners jo
            left join company_members cmem on cmem.id = jo.company_member_id
            left join users us on us.id = cmem.user_id
            where tb.id = jo.job_id
            ) as "projectOwner"`),
      )) as ProjectTaskReportRowModel[];

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateProjectsReports = async (input: {
  companyId: CompanyId;
  timezone: string;
  start?: string;
  end?: string;
  actualStart?: string;
  actualEnd?: string;
  subStatusId?: number;
  contactIds?: number[];
  projectIds?: number[];
  memberIds?: number[];
  teamIds?: number[];
  projectedCostMin?: string;
  projectedCostMax?: string;
  actualCostMin?: string;
  actualCostMax?: string;
  projectOwnerIds?: number[];
  tagIds?: number[];
}) => {
  try {
    const {
      companyId,
      timezone = 'Asia/Kuala_Lumpur',
      start,
      end,
      actualStart,
      actualEnd,
      subStatusId,
      contactIds,
      projectIds,
      memberIds,
      teamIds,
      projectedCostMin,
      projectedCostMax,
      actualCostMin,
      actualCostMax,
      projectOwnerIds,
      tagIds,
    } = input;
    const startDate = `CONVERT_TZ(t.start_date, '+00:00', '${timezone}')`;
    const endDate = `CONVERT_TZ(t.end_date, '+00:00', '${timezone}')`;

    const actualStartDate = `CONVERT_TZ(t.actual_start, '+00:00', '${timezone}')`;
    const actualEndDate = `CONVERT_TZ(t.actual_end, '+00:00', '${timezone}')`;

    const res = (await knex
      .from({ p: TableNames.PROJECTS })
      .leftJoin({ t: TableNames.TASKS }, 't.job_id', 'p.id')
      .leftJoin({ com: TableNames.COMPANIES }, 'com.id', 'p.company_id')
      .leftJoin({ contact: TableNames.CONTACTS }, 'contact.id', 'p.contact_id')
      .leftJoin(
        { jobTeam: TableNames.TASK_BOARD_TEAMS },
        'jobTeam.job_id',
        'p.id',
      )
      .leftJoin(
        { subStatus: TableNames.TASK_STATUSES },
        'subStatus.id',
        't.sub_status_id',
      )
      .leftJoin({ tbo: TableNames.TASK_BOARD_OWNERS }, 'tbo.job_id', 'p.id')
      .leftJoin(
        { teamMember: 'team_members' },
        'teamMember.team_id',
        'jobTeam.team_id',
      )
      .where({
        'com.id': companyId,
        't.deleted_at': null,
        'p.archived': 0,
      })
      .andWhere((builder) => {
        if (start && end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${endDate} <= "${dayjs(end)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!start && end) {
          builder.whereRaw(
            `${endDate} <= "${dayjs(end)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (start && !end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        if (actualStart && actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!actualStart && actualEnd) {
          builder.whereRaw(
            `${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (actualStart && !actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        // if (subStatusId) {
        //   builder.where({ 'subStatus.id': subStatusId });
        // }

        if (!_.isEmpty(contactIds) && contactIds) {
          builder.whereIn('p.contact_id', contactIds);
        }

        if (!_.isEmpty(projectIds) && projectIds) {
          builder.whereIn('p.id', projectIds);
        }

        if (!_.isEmpty(memberIds) && memberIds) {
          builder.whereIn('teamMember.member_id', memberIds);
        }

        if (!_.isEmpty(teamIds) && teamIds) {
          builder.whereIn('team.id', teamIds);
        }

        if (actualCostMax && actualCostMin) {
          builder.whereRaw(
            `t.actual_cost between '${actualCostMin}' and '${actualCostMax}'`,
          );
        } else if (actualCostMax && !actualCostMin) {
          builder.whereRaw(`t.actual_cost < ${actualCostMax}`);
        } else if (!actualCostMax && actualCostMin) {
          builder.whereRaw(`t.actual_cost > ${actualCostMin}`);
        }

        if (projectedCostMax && projectedCostMin) {
          builder.whereRaw(
            `t.projected_cost between '${projectedCostMin}' and '${projectedCostMax}'`,
          );
        } else if (projectedCostMax && !projectedCostMin) {
          builder.whereRaw(`t.projected_cost < ${projectedCostMax}`);
        } else if (projectedCostMin && !projectedCostMax) {
          builder.whereRaw(`t.projected_cost > ${projectedCostMin}`);
        }

        if (!_.isEmpty(projectOwnerIds) && projectOwnerIds) {
          builder.whereIn('tbo.company_member_id', projectOwnerIds);
        }

        if (tagIds && !_.isEmpty(tagIds)) {
          builder.whereIn('tt.tag_id', tagIds);
        }
      })
      .groupBy('p.id')
      .sum({ effort_spent: 't.actual_effort' })
      .select(
        't.id_text as id',
        'p.id_text as projectId',
        knex.raw('IFNULL(p.name, "-") as "projectName"'),
        knex.raw('IFNULL(contact.name, "-") as "contactName"'),
        knex.raw('IFNULL(subStatus.label, "-") as "statuses"'),
        knex.raw(
          `IFNULL(DATE_FORMAT(${startDate}, '${showTime} %d %b %Y'), "-") as "start_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(${endDate}, '${showTime} %d %b %Y'), "-") as "end_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_start, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_start"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_end, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_end"`,
        ),
        knex.raw('IFNULL(t.projected_cost, "-") as "projected_cost"'),
        knex.raw('IFNULL(t.actual_cost, "-") as "actual_cost"'),
        knex.raw(
          'IFNULL((DATEDIFF(t.actual_end, t.actual_start) - DATEDIFF(t.end_date, t.start_date)), "-") as "variance"',
        ),
        knex.raw(`(
          select group_concat(tag.name separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagNames"`),
        knex.raw(`(
          select group_concat(tag.color separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagColors"`),
        knex.raw(`(
            select group_concat(us.name separator ', ') 
            from job_owners jo
            left join company_members cmem on cmem.id = jo.company_member_id
            left join users us on us.id = cmem.user_id
            where p.id = jo.job_id
            ) as "projectOwner"`),
      )) as ProjectReportRowModel[];

    const all = await Promise.all(
      _.map(res, async (row) => {
        const { projectId } = row;

        const projectMemberNames = await getAllProjectAssigneeNames(projectId);
        const actualCost = await knex
          .from({ t: TableNames.TASKS })
          .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
          .where({ 'p.id_text': projectId, ...selection })
          .sum({ actual_cost: 't.actual_cost' })
          .first();

        const actualStartDate = await knex({ t: TableNames.TASKS })
          .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
          .where((builder) => {
            if (start && end) {
              builder.whereBetween('t.actual_start', [start, end]);
            }
          })
          .where({ 'p.id_text': projectId, ...selection })
          .min({ earliest_start_date: 't.actual_start' })
          .first();

        const actualEndDate = await knex({ t: TableNames.TASKS })
          .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
          .where((builder) => {
            if (start && end) {
              builder.whereBetween('t.actual_end', [start, end]);
            }
          })
          .where({ 'p.id_text': projectId, ...selection })
          .max({ latest_end_date: 't.actual_end' })
          .first();

        const projectedStartDate = await knex({ t: TableNames.TASKS })
          .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
          .where((builder) => {
            if (start && end) {
              builder.whereBetween('t.start_date', [start, end]);
            }
          })
          .where({ 'p.id_text': projectId, ...selection })
          .min({ earliest_start_date: 't.start_date' })
          .first();

        const projectedEndDate = await knex({ t: TableNames.TASKS })
          .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
          .where((builder) => {
            if (start && end) {
              builder.whereBetween('t.end_date', [start, end]);
            }
          })
          .where({ 'p.id_text': projectId, ...selection })
          .max({ latest_end_date: 't.end_date' })
          .first();

        const statuses = await getAllProjectStatuses(projectId);
        const tags = await getAllTagsProject(projectId);
        const tagColors = await getAllTagColorsProject(projectId);
        const projectOwners = await getAllProjectOwnerNames(projectId);

        return {
          ...row,
          subStatus: statuses,
          start_date: projectedStartDate?.earliest_start_date
            ? dayjs(projectedStartDate?.earliest_start_date).format(
                'hh:mmA, DD MMM YYYY',
              )
            : null,
          end_date: projectedEndDate?.latest_end_date
            ? dayjs(projectedEndDate?.latest_end_date).format(
                'hh:mmA, DD MMM YYYY',
              )
            : null,
          actual_start: actualStartDate?.earliest_start_date
            ? dayjs(actualStartDate?.earliest_start_date).format(
                'hh:mmA, DD MMM YYYY',
              )
            : null,
          actual_end: actualEndDate?.latest_end_date
            ? dayjs(actualEndDate?.latest_end_date).format(
                'hh:mmA, DD MMM YYYY',
              )
            : null,
          actual_cost: actualCost?.actual_cost,
          assignee: projectMemberNames,
          tagNames: tags ? tags : null,
          tagColors: tagColors ? tagColors : null,
          projectOwners: projectOwners,
        };
      }),
    );

    return camelize(all);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAllProjectOwnerNames = async (projectId: string) => {
  try {
    const projectMemberNames = await knex
      .from({ p: TableNames.PROJECTS })
      .leftJoin({ po: TableNames.TASK_BOARD_OWNERS }, 'po.job_id', 'p.id')
      .leftJoin(
        { cm: TableNames.COMPANY_MEMBERS },
        'cm.id',
        'po.company_member_id',
      )
      .leftJoin({ u: TableNames.USERS }, 'u.id', 'cm.user_id')
      .where({
        'p.id_text': projectId,
        'p.deleted_at': null,
        'p.archived_at': null,
      })
      .groupBy('u.id')
      .select('u.name');

    const namesString = projectMemberNames.map((m) => m.name).join(', ');

    return namesString;
  } catch (error) {
    return '';
  }
};

const getAllTagsProject = async (projectId: string) => {
  try {
    const res = await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .leftJoin({ tt: TableNames.TASK_TAGS }, 'tt.task_id', 't.id')
      .leftJoin({ tag: TableNames.TAGS }, 'tag.id', 'tt.tag_id')
      .where({ 'p.id_text': projectId })
      .select('tag.name');

    const uniqRes = _.uniqBy(res, 'name');
    const filteredRes = uniqRes.filter((r) => r.name !== null);

    if (filteredRes?.length === 1) {
      return _.head(filteredRes)?.name;
    }

    const resString = filteredRes.map((r) => r.name).join(', ');

    return resString;
  } catch (error) {
    return '';
  }
};

const getAllTagColorsProject = async (projectId: string) => {
  try {
    const res = await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .leftJoin({ tt: TableNames.TASK_TAGS }, 'tt.task_id', 't.id')
      .leftJoin({ tag: TableNames.TAGS }, 'tag.id', 'tt.tag_id')
      .where({ 'p.id_text': projectId })
      .select('tag.color');

    const uniqRes = _.uniqBy(res, 'color');
    const filteredRes = uniqRes.filter((r) => r.color !== null);

    if (filteredRes?.length === 1) {
      return _.head(filteredRes)?.color;
    }

    const resString = filteredRes.map((r) => r.color).join(', ');

    return resString;
  } catch (error) {
    return '';
  }
};

const getAllProjectStatuses = async (projectId: string) => {
  try {
    const res = await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .leftJoin({ ps: TableNames.PROJECT_STATUSES }, 'ps.id', 't.status_id')

      .where({ 'p.id_text': projectId })
      .select('ps.name');

    const uniqRes = _.uniqBy(res, 'name');

    const resString = uniqRes.map((r) => r.name).join(', ');

    return resString;
  } catch (error) {
    return '';
  }
};

const getAllProjectAssigneeNames = async (projectId: string) => {
  try {
    const projectMemberNames = await knex
      .from({ tm: TableNames.TASK_MEMBERS })
      .leftJoin({ t: TableNames.TASKS }, 't.id', 'tm.card_id')
      .leftJoin({ u: TableNames.USERS }, 'u.id', 'tm.user_id')
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .where({
        'p.id_text': projectId,
        ...selection,
      })
      .groupBy('u.id')
      .select('u.name', 'p.id as projectId');

    const namesString = projectMemberNames.map((m) => m.name).join(', ');

    return namesString;
  } catch (error) {
    return '';
  }
};

const generateAttendanceReport = async ({
  memberIds,
  companyId,
  overtimeFlag,
  startDate,
  endDate,
  employeeTypeId,
  attendanceLabelIds,
  contactIds,
  tagIds,
}: {
  memberIds: CompanyMemberId[];
  companyId: CompanyId;
  overtimeFlag: string;
  startDate: string;
  endDate: string;
  employeeTypeId: number;
  attendanceLabelIds: number[];
  contactIds: number[];
  tagIds?: number[];
}) => {
  try {
    const startDateQuery = `DATE_FORMAT(att.start_date, '%Y-%m-%d 00:%00:00')`;
    const endDateQuery = `DATE_FORMAT(att.end_date, '%Y-%m-%d 23:%59:59')`;

    const attendances = await knex
      .from({ att: 'attendances' })
      .leftJoin({ cm: 'company_members' }, 'cm.id', 'att.company_member_id')
      .leftJoin({ u: 'users' }, 'u.id', 'cm.user_id')
      .leftJoin(
        { wh: 'company_working_hours' },
        'wh.employee_type_id',
        'cm.employee_type',
      )
      .leftJoin({ al: 'attendance_labels' }, 'al.id', 'att.attendance_label_id')
      .leftJoin({ et: 'employee_types' }, 'et.id', 'cm.employee_type')
      .leftJoin({ at: 'attendance_tags' }, 'at.attendance_id', 'att.id')
      .leftJoin({ l: 'locations' }, 'l.id', 'att.location_id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'att.contact_id')
      .where('cm.company_id', companyId)
      .where((builder) => {
        if (!_.isEmpty(memberIds)) {
          builder.whereIn('att.company_member_id', memberIds);
        }

        if (overtimeFlag === 'true') {
          builder.whereRaw(`att.overtime > 0`);
        }

        if (startDate && endDate) {
          builder.whereRaw(
            `${startDateQuery} >= "${dayjs(startDate)
              .startOf('day')
              .format('YYYY-MM-DD HH:mm:ss')}" and ${endDateQuery} <= "${dayjs(
              endDate,
            )
              .endOf('day')
              .format('YYYY-MM-DD HH:mm:ss')}"`,
          );
        } else if (!startDate && endDate) {
          builder.whereRaw(
            `${endDateQuery} <= "${dayjs(endDate).startOf('day').format()}"`,
          );
        } else if (startDate && !endDate) {
          builder.whereRaw(
            `${startDateQuery} >= "${dayjs(startDate)
              .startOf('day')
              .format()}"`,
          );
        }

        if (employeeTypeId) {
          builder.where('et.id', employeeTypeId);
        }

        if (!_.isEmpty(attendanceLabelIds)) {
          builder.whereIn('att.attendance_label_id', attendanceLabelIds);
        }

        if (contactIds && !_.isEmpty(contactIds)) {
          builder.whereIn('att.contact_id', contactIds);
        }

        if (tagIds && !_.isEmpty(tagIds)) {
          builder.whereIn('at.tag_id', tagIds);
        }
      })
      .groupBy('att.id', 'att.company_member_id')
      .select(
        `att.id as id`,
        `att.start_date as startDate`,
        `att.end_date as endDate`,
        `cm.id_text as memberId`,
        `cm.id as privateMemberId`,
        `cm.employee_type as employeeTypeId`,
        `u.id_text as userId`,
        `wh.timezone as timezone`,
        `u.name as memberName`,
        `l.name as locationName`,
        `l.address as locationAddress`,
        `c.name as contactName`,
        // knex.raw(
        //   `IFNULL(DATE_FORMAT(CONVERT_TZ(att.start_date, '+00:00', wh.timezone), '%d %b %Y %l:%i %p'), "-") as "period"`,
        // ),
        `att.start_date as period`,
        knex.raw(`IFNULL(att.time_total, '-') as trackedTime`),
        knex.raw(`IFNULL(att.time_total, '-') as trackedTimeMinutes`),
        knex.raw(`IFNULL(att.type, '-') as type`),
        `al.name as activity`,
        `att.comments`,
        `att.comments_out`,
        `et.has_overtime as hasOvertime`,
        `att.worked as workedHours`,
        knex.raw(`att.worked as workedHoursMinutes`),
        `att.overtime as overtime`,
        knex.raw(`IFNULL(et.name, '-') as employeeType`),
        `et.id as employeeTypeId`,
        knex.raw(`IF(att.type = 0, att.time_total, 0) as breakHours`),
        knex.raw(`(
          select group_concat(tag.name separator ', ') 
          from attendance_tags at
          left join tags tag on tag.id = at.tag_id
          where at.attendance_id = att.id
          ) as "tagNames"`),
        knex.raw(`(
            select group_concat(tag.color separator ', ') 
            from attendance_tags at
            left join tags tag on tag.id = at.tag_id
            where at.attendance_id = att.id
            ) as "tagColors"`),
      );

    return attendances.map((att) => {
      const workedHoursMinutes = _.isNaN(+att?.workedHoursMinutes / 60)
        ? 0
        : +att?.workedHoursMinutes / 60;
      const trackedTimeMinutes = _.isNaN(+att?.trackedTimeMinutes / 60)
        ? 0
        : +att?.trackedTimeMinutes / 60;

      return {
        ...att,
        period: dayjs(att?.period)
          .tz(att?.timezone || 'Asia/Kuala_Lumpur')
          .format('DD MMM YYYY hh:mm a Z'),
        workedHoursMinutes: +workedHoursMinutes.toFixed(2),
        trackedTimeMinutes: +trackedTimeMinutes.toFixed(2),
      };
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateTasksReports = async ({
  companyId,
  timezone = 'Asia/Kuala_Lumpur',
  start,
  end,
  actualStart,
  actualEnd,
  subStatusId,
  contactIds,
  projectIds,
  memberIds,
  teamIds,
  projectedCostMin,
  projectedCostMax,
  actualCostMin,
  actualCostMax,
  projectOwnerIds,
  tagIds,
}: {
  companyId: CompanyId;
  timezone: string;
  start?: string;
  end?: string;
  actualStart?: string;
  actualEnd?: string;
  subStatusId?: number;
  contactIds?: number[];
  projectIds?: number[];
  memberIds?: number[];
  teamIds?: number[];
  projectedCostMin?: string;
  projectedCostMax?: string;
  actualCostMin?: string;
  actualCostMax?: string;
  projectOwnerIds?: number[];
  tagIds?: number[];
}) => {
  try {
    const startDate = `CONVERT_TZ(t.start_date, '+00:00', '${timezone}')`;
    const endDate = `CONVERT_TZ(t.end_date, '+00:00', '${timezone}')`;

    const actualStartDate = `CONVERT_TZ(t.actual_start, '+00:00', '${timezone}')`;
    const actualEndDate = `CONVERT_TZ(t.actual_end, '+00:00', '${timezone}')`;

    const res = (await knex
      .from({ t: TableNames.TASKS })
      .leftJoin({ tb: TableNames.TASK_BOARDS }, 'tb.id', 't.job_id')
      .leftJoin({ com: TableNames.COMPANIES }, 'com.id', 'tb.company_id')
      .leftJoin({ ta: TableNames.TIMESHEET_ACTIVITIES }, 'ta.task_id', 't.id')
      .leftJoin({ ts: TableNames.TIMESHEETS }, 'ts.activity_id', 'ta.id')
      .leftJoin({ contact: TableNames.CONTACTS }, 'contact.id', 'tb.contact_id')
      .leftJoin(
        { jobTeam: TableNames.TASK_BOARD_TEAMS },
        'jobTeam.job_id',
        'tb.id',
      )
      // .leftJoin(
      //   { subStatus: TableNames.TASK_STATUSES },
      //   'subStatus.id',
      //   't.sub_status_id',
      // )
      // .leftJoin({ tbo: TableNames.TASK_BOARD_OWNERS }, 'tbo.job_id', 'tb.id')
      // .leftJoin(
      //   { teamMember: 'team_members' },
      //   'teamMember.team_id',
      //   'jobTeam.team_id',
      // )
      .where({
        'com.id': companyId,
        't.deleted_at': null,
        'tb.archived': 0,
      })
      .andWhere((builder) => {
        if (start && end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${endDate} <= "${dayjs(end)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!start && end) {
          builder.whereRaw(
            `${endDate} <= "${dayjs(end)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (start && !end) {
          builder.whereRaw(
            `${startDate} >= "${dayjs(start)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        if (actualStart && actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}" and ${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .endOf('day')
              .format()}"`,
          );
        } else if (!actualStart && actualEnd) {
          builder.whereRaw(
            `${actualEndDate} <= "${dayjs(actualEnd)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        } else if (actualStart && !actualEnd) {
          builder.whereRaw(
            `${actualStartDate} >= "${dayjs(actualStart)
              .tz(timezone)
              .startOf('day')
              .format()}"`,
          );
        }

        // if (subStatusId) {
        //   builder.where({ 'subStatus.id': subStatusId });
        // }

        if (!_.isEmpty(contactIds) && contactIds) {
          builder.whereIn('tb.contact_id', contactIds);
        }

        if (!_.isEmpty(projectIds) && projectIds) {
          builder.whereIn('tb.id', projectIds);
        }

        if (!_.isEmpty(memberIds) && memberIds) {
          builder.whereIn('ts.company_member_id', memberIds);
        }

        if (!_.isEmpty(teamIds) && teamIds) {
          builder.whereIn('team.id', teamIds);
        }

        if (actualCostMax && actualCostMin) {
          builder.whereRaw(
            `t.actual_cost between '${actualCostMin}' and '${actualCostMax}'`,
          );
        } else if (actualCostMax && !actualCostMin) {
          builder.whereRaw(`t.actual_cost < ${actualCostMax}`);
        } else if (!actualCostMax && actualCostMin) {
          builder.whereRaw(`t.actual_cost > ${actualCostMin}`);
        }

        if (projectedCostMax && projectedCostMin) {
          builder.whereRaw(
            `t.projected_cost between '${projectedCostMin}' and '${projectedCostMax}'`,
          );
        } else if (projectedCostMax && !projectedCostMin) {
          builder.whereRaw(`t.projected_cost < ${projectedCostMax}`);
        } else if (projectedCostMin && !projectedCostMax) {
          builder.whereRaw(`t.projected_cost > ${projectedCostMin}`);
        }

        if (!_.isEmpty(projectOwnerIds) && projectOwnerIds) {
          builder.whereIn('tbo.company_member_id', projectOwnerIds);
        }

        if (tagIds && !_.isEmpty(tagIds)) {
          builder.whereIn('tt.tag_id', tagIds);
        }
      })
      .groupBy('t.id')
      .sum({ effort_spent: 'ts.time_total' })
      .select(
        't.id_text as id',
        'tb.id_text as projectId',
        knex.raw('IFNULL(t.name, "-") as "taskName"'),
        knex.raw('IFNULL(tb.name, "-") as "projectName"'),
        knex.raw('IFNULL(contact.name, "-") as "contactName"'),

        knex.raw(
          `IFNULL(DATE_FORMAT(${startDate}, '${showTime} %d %b %Y'), "-") as "start_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(${endDate}, '${showTime} %d %b %Y'), "-") as "end_date"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_start, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_start"`,
        ),
        knex.raw(
          `IFNULL(DATE_FORMAT(CONVERT_TZ(t.actual_end, '+00:00', '${timezone}'), '${showTime} %d %b %Y'), "-") as "actual_end"`,
        ),

        knex.raw('IFNULL(t.projected_cost, "-") as "projected_cost"'),
        knex.raw('IFNULL(t.actual_cost, "-") as "actual_cost"'),
        knex.raw(
          'IFNULL((DATEDIFF(t.actual_end, t.actual_start) - DATEDIFF(t.end_date, t.start_date)), "-") as "variance"',
        ),
        knex.raw(`(
          select group_concat(team.title separator ', ') 
          from teams team
          left join jobs_teams jt on jt.team_id = team.id
          where jt.job_id = jobTeam.job_id
          ) as "teamName"`),
        knex.raw(`(
        select group_concat(user.name separator ', ') 
        from card_members cam
        left join users user on user.id = cam.user_id
        where cam.card_id = t.id
        ) as "assignee"`),
        knex.raw(`(
          select group_concat(tag.name separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagNames"`),
        knex.raw(`(
          select group_concat(tag.color separator ', ') 
          from task_tags tt
          left join tags tag on tag.id = tt.tag_id
          where tt.task_id = t.id
          ) as "tagColors"`),
        knex.raw(`(
            select group_concat(us.name separator ', ') 
            from job_owners jo
            left join company_members cmem on cmem.id = jo.company_member_id
            left join users us on us.id = cmem.user_id
            where tb.id = jo.job_id
            ) as "projectOwner"`),
      )) as ProjectTaskReportRowModel[];

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export type BillingInvoiceReportModel = BillingInvoiceModel &
  CompanyProfileModel &
  CompanyModel &
  ContactPicModel &
  ContactModel & {
    DocumentNo: string;
    invoicePrefix: string;
    // contactAccountCode: string;
    companyAccountCode: string;
    picName: string;
    companyName: string;
  };

const generateInvoiceReport = async (input: {
  workspaceIds?: WorkspaceId[];
  start: string;
  end: string;
  companyId: CompanyId;
}) => {
  try {
    const { workspaceIds, start, end, companyId } = input;

    const res = await knex
      .from({ bi: TableNames.BILLING_INVOICES })
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 'bi.project_id')
      .leftJoin({ wp: TableNames.WORKSPACE_PROJECTS }, 'wp.project_id', 'p.id')
      .leftJoin({ pic: TableNames.CONTACT_PICS }, 'pic.id', 'bi.pic_id')
      .innerJoin({ com: TableNames.COMPANIES }, 'com.id', 'p.company_id')
      .innerJoin({ cp: TableNames.COMPANY_PROFILES }, 'cp.company_id', 'com.id')
      .where((builder) => {
        if (!_.isEmpty(workspaceIds) && workspaceIds) {
          builder.whereIn('wp.workspace_id', workspaceIds);
        }

        if (start && end) {
          builder.whereBetween('bi.doc_date', [start, end]);
        }
      })
      .where({
        'p.company_id': companyId,
        'com.id': companyId,
        'bi.deleted_at': null,
      })
      .select(
        'bi.*',
        'pic.name as picName',
        'com.name as companyName',
        'cp.invoice_prefix as invoicePrefix',
        'com.account_code as companyAccountCode',
        knex.raw(
          'CONCAT(IFNULL(cp.invoice_prefix, "IV"), "-" , bi.doc_no) as DocumentNo',
        ),
      );

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export type ProjectGroupWithTaskModel = {
  projectGroupName: string;
  projectGroupId: number;
  tasks: TaskReportModel[];
  totalTargetedMinutes: number;
  totalActualMinutes: number;
  totalVarianceMinutes: number;
};

type TaskReportModel = {
  name: string;
  taskId: number;
  statusName: string | null;
  assigneeNames: string | null;
  tagNames: string | null;
  targetedMinutes: number | null;
  targetedHour: string | null;
  actualMinutes: number | null;
  actualHour: string | null;
  budget: string | null;
  actualCost: string | null;
  targetedStart: string | null;
  targetedEnd: string | null;
  actualStart: string | null;
  varianceHours: string | null;
  varianceMinutes: number | null;
  varianceBudget: number | null;
  actualEnd: string | null;
  billable: number | null;
  customValuesObj: {
    name: string;
    value: string;
    type: string;
  }[];
};

type TaskQueryReportModel = {
  name: string;
  taskId: number;
  targetedMinutes: number;
  actualMinutes: number;
  budget: number;
  actualCost: string;
  targetedStart: string;
  targetedEnd: string;
  actualStart: string;
  actualEnd: string | null;
  statusName: string | null;
  billable: number;
  assigneeNames: string;
  memberIds: string;
  hourlyRates: string;
  tagNames: string | null;
  customValues: string;
  customColumnEnabled: number;
};

const getProjectGroupsWithTasks = async ({
  projectId,
  timezone,
  dateRange,
  projectOwnerIds,
  memberIds,
  companyId,
  userId,
}: {
  projectId: ProjectId;
  timezone: string;
  dateRange?: [string, string];
  projectOwnerIds?: CompanyMemberId[];
  memberIds?: CompanyMemberId[];
  companyId: CompanyId;
  userId: UserId;
}): Promise<ProjectGroupWithTaskModel[]> => {
  try {
    // if null change to 2020-01-01
    const startDate = dateRange ? dateRange[0] : '2020-01-01';
    // if null change to now
    const endDate = dateRange ? dateRange[1] : dayjs().format('YYYY-MM-DD');

    // loop startDate to endDate
    const dateRangeArr = [] as { day: number; month: number; year: number }[];
    let currentDate = startDate;
    while (dayjs(currentDate).isSameOrBefore(endDate)) {
      dateRangeArr.push({
        day: dayjs(currentDate).date(),
        month: dayjs(currentDate).month() + 1,
        year: dayjs(currentDate).year(),
      });

      currentDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD');
    }

    const res = await knex
      .from({ pg: TableNames.PROJECT_GROUPS })
      .leftJoin({ p: TableNames.PROJECTS }, 'p.id', 'pg.project_id')
      .leftJoin({ t: TableNames.TASKS }, 't.group_id', 'pg.id')
      .leftJoin({ po: TableNames.TASK_BOARD_OWNERS }, 'po.job_id', 'p.id')
      .leftJoin(
        { pgcc: TableNames.PROJECT_GROUP_CUSTOM_COLUMNS },
        'pgcc.group_id',
        'pg.id',
      )
      .where({ 'pg.project_id': projectId, 'p.deleted_at': null })
      .where({ 't.archived_at': null, 't.deleted_at': null, 'p.id': projectId })
      .where((builder) => {
        if (!_.isEmpty(projectOwnerIds) && projectOwnerIds) {
          builder.whereIn('po.company_member_id', projectOwnerIds);
        }
      })
      .groupBy('pg.id')
      .select('pg.id as projectGroupId', 'p.name as projectName')
      .select(knex.raw("ifnull(pg.name, 'Unassigned') as projectGroupName"))
      .select(knex.raw("ifnull(group_concat(t.id), '') as taskIds"));

    const groups = [] as ProjectGroupWithTaskModel[];
    for (const r of res) {
      const taskIds = r.taskIds.split(',');

      const tasks = (await knex
        .from({ t: TableNames.TASKS })
        .leftJoin({ ps: TableNames.PROJECT_STATUSES }, 'ps.id', 't.status_id')
        .leftJoin({ tm: TableNames.TASK_MEMBERS }, 'tm.card_id', 't.id')
        .leftJoin({ cm: TableNames.COMPANY_MEMBERS }, 'cm.id', 'tm.member_id')
        .leftJoin({ u: TableNames.USERS }, 'u.id', 'tm.user_id')
        .leftJoin({ tt: TableNames.TASK_TAGS }, 'tt.task_id', 't.id')
        .leftJoin({ ta: TableNames.TAGS }, 'ta.id', 'tt.tag_id')
        .leftJoin({ tda: 'timesheet_day_approvals' }, 'tda.task_id', 't.id')
        .innerJoin({ pg: TableNames.PROJECT_GROUPS }, 'pg.id', 't.group_id')
        .leftJoin({ tcv: TableNames.TASK_CUSTOM_VALUES }, 'tcv.task_id', 't.id')
        .leftJoin(
          { pgca: TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES },
          'pgca.id',
          'tcv.attribute_id',
        )
        .leftJoin(
          { pgcc: TableNames.PROJECT_GROUP_CUSTOM_COLUMNS },
          'pgcc.group_id',
          'pg.id',
        )
        .whereIn('t.id', taskIds)
        //whereIn dateRangeArr
        .where((builder) => {
          if (dateRangeArr.length > 0) {
            builder.where((builder) => {
              for (const date of dateRangeArr) {
                builder.orWhere({
                  'tda.year': date.year,
                  'tda.month': date.month,
                  'tda.day': date.day,
                });
              }
            });

            if (memberIds && !_.isEmpty(memberIds)) {
              builder.whereIn('tm.member_id', memberIds);
            }
          }
        })
        // .where({ 'pgcc.enabled': 1 })
        .where({ 't.archived_at': null, 't.deleted_at': null })
        .groupBy('t.id')
        .select(
          't.name',
          't.id as taskId',
          't.planned_effort as targetedMinutes', //in minutes
          't.actual_effort as actualMinutes', //  in minutes
          't.projected_cost as budget',
          't.actual_cost as actualCost',
        )
        .select(
          knex.raw(
            `DATE_FORMAT(CONVERT_TZ(t.start_date, '+0:00' ,'${timezone}'), '%Y-%m-%d') as targetedStart`,
          ),
          knex.raw(
            `DATE_FORMAT(CONVERT_TZ(t.end_date, '+0:00' ,'${timezone}'), '%Y-%m-%d') as targetedEnd`,
          ),
          knex.raw(
            `DATE_FORMAT(CONVERT_TZ(t.actual_start, '+0:00' ,'${timezone}'), '%Y-%m-%d') as actualStart`,
          ),
          knex.raw(
            `DATE_FORMAT(CONVERT_TZ(t.actual_end, '+0:00' ,'${timezone}'), '%Y-%m-%d') as actualEnd`,
          ),
        )
        .select('ps.name as statusName')
        .select('tda.billable')
        .select(knex.raw('group_concat(u.name) as assigneeNames'))
        .select(knex.raw('group_concat(tm.member_id) as memberIds'))
        .select(knex.raw('group_concat(cm.hourly_rate) as hourlyRates'))
        .select(knex.raw('group_concat(ta.name) as tagNames'))
        .select(
          knex.raw(
            `group_concat(ifnull(concat(':::',pgca.name,'===',pgca.type,'===',tcv.value,':::'),'')) as customValues`,
          ),
        )
        .select(
          knex.raw('ifnull(pgcc.enabled, 0) as customColumnEnabled'),
        )) as TaskQueryReportModel[];

      const tasksArray = [];

      for (const t of tasks) {
        const customValues = t?.customColumnEnabled ? t?.customValues : '';
        const filteredArray = generateFilteredTaskArray(customValues, t) || [];

        const isTaskVisible = await isTaskVisibleForReport({
          t,
          userId,
          companyId,
        });

        if (!isTaskVisible) {
          continue;
        }

        const assigneeNamesArr = t.assigneeNames?.split(',');
        const uniqAssigneeNames = _.uniq(assigneeNamesArr).join(', ');

        const hourlyRatesArr = _.uniq(t.hourlyRates?.split(','));

        const approvedSeconds = _.head(
          await knex
            .from({ tda: 'timesheet_day_approvals' })
            .where({ 'tda.task_id': t.taskId, 'tda.status': 1 })
            .sum('tda.total as seconds'),
        ) as { seconds: string };

        const approvedMinutes = +approvedSeconds?.seconds / 60;

        let actualApprovedCost = 0;

        for (const hourlyRate of hourlyRatesArr) {
          actualApprovedCost +=
            +(hourlyRate as string) * (approvedMinutes / 60);
        }

        if (t.billable === 0) {
          actualApprovedCost = 0;
        }

        const tagNamesArr = t.tagNames?.split(',');
        const uniqTagNames = _.uniq(tagNamesArr).join(', ');

        const targetedHour = minutesToHoursAndMinutes(t?.targetedMinutes);

        const actualHour = minutesToHoursAndMinutes(approvedMinutes);

        // variance: The difference between the targeted hours and actual hours
        const targetedMinutes = t?.targetedMinutes || 0;

        const varianceMinutes = targetedMinutes - approvedMinutes;

        const varianceHours = minutesToHoursAndMinutes(varianceMinutes);

        const varianceBudget =
          t?.budget - (+t?.actualCost || actualApprovedCost);

        tasksArray.push({
          taskId: t?.taskId,
          name: t?.name,
          statusName: t?.statusName || '',
          assigneeNames: uniqAssigneeNames || '',
          tagNames: uniqTagNames || '',
          targetedHour: targetedHour || '',
          actualHour: actualHour || '',
          actualMinutes: approvedMinutes || 0,
          targetedMinutes,
          budget: (t?.budget || 0)?.toString() || '0.00',
          actualCost:
            parseMoney(+t?.actualCost || actualApprovedCost) || '0.00',
          targetedStart: t?.targetedStart || '',
          targetedEnd: t?.targetedEnd || '',
          actualStart: t?.actualStart || '',
          actualEnd: t?.actualEnd || '',
          varianceHours: varianceHours || '',
          varianceBudget: varianceBudget || 0,
          billable: t?.billable ? 1 : 0,
          varianceMinutes,
          customValuesObj: filteredArray,
        });
      }

      const totalTargetedMinutes = tasksArray.reduce((acc, cur) => {
        return acc + cur.targetedMinutes;
      }, 0);

      const totalActualMinutes = tasksArray.reduce((acc, cur) => {
        return acc + cur.actualMinutes;
      }, 0);

      const totalVarianceMinutes = tasksArray.reduce((acc, cur) => {
        return acc + cur?.varianceMinutes;
      }, 0);

      groups.push({
        totalTargetedMinutes,
        totalActualMinutes,
        projectGroupId: r?.projectGroupId,
        projectGroupName: r?.projectGroupName,
        totalVarianceMinutes,
        tasks: tasksArray.filter(async (t) => {
          const isAllApproved = await isTaskApprovedForTimesheet(t?.taskId);
          if (isAllApproved) {
            return t;
          }
        }),
      });
    }

    return groups;
  } catch (error) {
    return Promise.reject(error);
  }
};

const isTaskApprovedForTimesheet = async (taskId: TaskId) => {
  try {
    const res = await knex
      .from({ t: TableNames.TASKS })
      .innerJoin({ tda: 'timesheet_day_approvals' }, 't.id', 'tda.task_id')
      .where({ 'tda.task_id': taskId })
      .select('tda.status as isApproved');

    const isAllApproved = res.every((r) => r?.isApproved === 1);

    return isAllApproved;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCustomActivities = async ({
  dateRange,
  memberIds,
}: {
  dateRange?: [string, string];
  memberIds: CompanyMemberId[];
}): Promise<ProjectGroupWithTaskModel | void> => {
  try {
    // if null change to 2020-01-01
    const startDate = dateRange ? dateRange[0] : '2020-01-01';
    // if null change to now
    const endDate = dateRange ? dateRange[1] : dayjs().format('YYYY-MM-DD');

    // loop startDate to endDate
    const dateRangeArr = [] as { day: number; month: number; year: number }[];
    let currentDate = startDate;
    while (dayjs(currentDate).isSameOrBefore(endDate)) {
      dateRangeArr.push({
        day: dayjs(currentDate).date(),
        month: dayjs(currentDate).month() + 1,
        year: dayjs(currentDate).year(),
      });

      currentDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD');
    }

    // These are not related to tasks
    const customOtherActivities = await knex
      .from({ tdca: 'timesheet_day_custom_approvals' })
      .leftJoin(
        { cm: TableNames.COMPANY_MEMBERS },
        'cm.id',
        'tdca.company_member_id',
      )
      .leftJoin({ u: TableNames.USERS }, 'u.id', 'cm.user_id')
      .where({ 'tdca.status': 1 })
      .where((builder) => {
        if (dateRangeArr.length > 0) {
          builder.where((builder) => {
            for (const date of dateRangeArr) {
              builder.orWhere({
                'tdca.year': date.year,
                'tdca.month': date.month,
                'tdca.day': date.day,
              });
            }
          });

          if (memberIds && !_.isEmpty(memberIds)) {
            builder.whereIn('tdca.company_member_id', memberIds);
          }
        }
      })
      .groupBy('tdca.custom_name')
      .select('tdca.custom_name as name', 'tdca.billable')
      .select(knex.raw('group_concat(u.name) as assigneeNames'))
      .select(knex.raw('group_concat(cm.hourly_rate) as hourlyRates'))
      //sum of total
      .select(knex.raw('sum(tdca.total) as totalApprovedSeconds'));

    let customArr = [];

    for (const custom of customOtherActivities) {
      const assigneeNamesArr = custom.assigneeNames?.split(',');
      const uniqAssigneeNames = _.uniq(assigneeNamesArr).join(', ');

      const hourlyRatesArr = _.uniq(custom.hourlyRates?.split(','));

      const approvedSeconds = custom.totalApprovedSeconds;

      const approvedMinutes = +approvedSeconds / 60;

      let actualApprovedCost = 0;

      for (const hourlyRate of hourlyRatesArr) {
        actualApprovedCost +=
          +((hourlyRate || '0') as string) * (approvedMinutes / 60);
      }

      if (custom.billable === 0) {
        actualApprovedCost = 0;
      }

      const uniqTagNames = '';

      const targetedHour = '0';

      const actualHour = minutesToHoursAndMinutes(approvedMinutes);

      // variance: The difference between the targeted hours and actual hours
      const targetedMinutes = 0;

      const varianceMinutes = 0;

      const varianceHours = 0;

      const varianceBudget = 0;

      let index = 1;

      const customToPush = {
        taskId: index++,
        name: custom?.name,
        statusName: '',
        assigneeNames: uniqAssigneeNames || '',
        tagNames: uniqTagNames || '',
        targetedHour: targetedHour || '',
        actualHour: actualHour || '',
        actualMinutes: approvedMinutes || 0,
        targetedMinutes: targetedMinutes || 0,
        budget: '0.00',
        actualCost: parseMoney(actualApprovedCost) || '0.00',
        targetedStart: '',
        targetedEnd: '',
        actualStart: '',
        actualEnd: '',
        varianceHours: varianceHours || '',
        varianceBudget: varianceBudget || 0,
        billable: custom?.billable ? 1 : 0,
        varianceMinutes,
      } as TaskReportModel;

      customArr.push(customToPush);
    }

    let custom = {} as ProjectGroupWithTaskModel;

    if (customArr.length > 0 && !_.isEmpty(customArr)) {
      custom = {
        projectGroupName: 'Other Activities',
        projectGroupId: 0,
        totalActualMinutes: 0,
        totalTargetedMinutes: 0,
        totalVarianceMinutes: 0,
        tasks: customArr,
      };

      return custom;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getGroupColumnNames = async (groupId: number) => {
  try {
    return await knex
      .from({ pg: TableNames.PROJECT_GROUPS })
      .innerJoin(
        { pgcc: TableNames.PROJECT_GROUP_CUSTOM_COLUMNS },
        'pg.id',
        'pgcc.group_id',
      )
      .innerJoin(
        { pgca: TableNames.PROJECT_GROUPS_CUSTOM_ATTRIBUTES },
        'pgcc.attribute_id',
        'pgca.id',
      )
      .where({ 'pg.id': groupId, 'pgcc.enabled': 1 })
      .select('pgca.name', 'pgca.type');
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateFilteredTaskArray = (
  customValues: string,
  t: TaskQueryReportModel,
) => {
  try {
    const customValuesArr = customValues
      ?.split(':::')
      .filter((v: string) => v !== '' && v !== ',');

    const c = customValuesArr.map((a: string) => a.split('==='));
    const customValuesObj = [];
    for (const a of c) {
      customValuesObj.push({
        name: a[0],
        type: a[1],
        value: a[2],
      });
    }

    const filteredArray = customValuesObj.filter(
      (item, index, self) =>
        self.findIndex(
          (t) =>
            t.name === item.name &&
            t.type === item.type &&
            t.value === item.value,
        ) === index,
    );

    return filteredArray;
  } catch (error) {
    console.error(error);
    return;
  }
};

const isTaskVisibleForReport = async (input: {
  t: TaskQueryReportModel;
  userId: number;
  companyId: number;
}) => {
  try {
    const { t, userId, companyId } = input;
    const loaders = createLoaders();
    const task = (await loaders.tasks.load(t.taskId)) as TaskModel;

    const filteredTask = await TaskService.filterVisibleTasks({
      tasks: [task],
      userId,
      companyId,
    });

    return !_.isEmpty(filteredTask);
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default {
  generateReport,
  generateAttendanceReport,
  generateProjectTasksUnificationReports,
  generateProjectTasksReports,
  generateProjectsReports,
  generateTasksReports,
  generateInvoiceReport,
  getProjectGroupsWithTasks,
  getCustomActivities,
  getGroupColumnNames,
};
