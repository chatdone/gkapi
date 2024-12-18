import { CompanyId } from '@models/company.model';
import dayjs from 'dayjs';
import _ from 'lodash';
import { CollectionReportRowModel, TaskReportRowModel } from './report.model';
import humanizeDuration from 'humanize-duration';

export const dueDateFilterGenerator = ({
  from,
  to,
  timezone,
}: {
  from?: string;
  to?: string;
  timezone: string;
}): string => {
  let filterQuery = '';

  if (from && to) {
    filterQuery = `and (CONVERT_TZ(cards.due_date, '+00:00', '${timezone}')) between "${dayjs(
      from,
    )
      .startOf('day')
      .format()}" and "${dayjs(to).endOf('day').format()}"`;
  } else if (from && !to) {
    filterQuery = `and (CONVERT_TZ(cards.due_date, '+00:00', '${timezone}')) > "${dayjs(
      from,
    )
      .startOf('day')
      .format()}"`;
  } else if (!from && to) {
    filterQuery = `and (CONVERT_TZ(cards.due_date, '+00:00', '${timezone}')) < "${dayjs(
      to,
    )
      .endOf('day')
      .format()}"`;
  } else {
    filterQuery;
  }
  return filterQuery;
};

export const collectionDueFilter = (from?: string, to?: string) => {
  let periodFilter = '';
  if (from && to) {
    periodFilter = `and rr.due_date between "${dayjs(from)
      .startOf('day')
      .format()}" and "${dayjs(to).endOf('day').format()}"`;
  } else if (from && !to) {
    periodFilter = `and rr.due_date > "${dayjs(from).startOf('day').format()}"`;
  } else if (!from && to) {
    periodFilter = `and rr.due_date < "${dayjs(to).startOf('day').format()}"`;
  } else {
    periodFilter;
  }
  return periodFilter;
};

export const getProjectActualPeriodFilter = ({
  actualStart,
  actualEnd,
}: {
  actualStart: string;
  actualEnd: string;
}) => {
  let actualPeriodFilter = '';
  if (actualStart && actualEnd) {
    actualPeriodFilter = `and c.actual_start >= "${dayjs(actualStart)
      .startOf('day')
      .format()}" and c.actual_end <= "${dayjs(actualEnd)
      .endOf('day')
      .format()}"`;
  } else if (actualStart && !actualEnd) {
    actualPeriodFilter = `and c.actual_start >= "${dayjs(actualStart)
      .startOf('day')
      .format()}"`;
  } else if (!actualStart && actualEnd) {
    actualPeriodFilter = `and c.actual_end <= "${dayjs(actualEnd)
      .startOf('day')
      .format()}"`;
  } else {
    actualPeriodFilter;
  }
  return actualPeriodFilter;
};

export const getProjectPeriodFilter = ({
  start,
  end,
}: {
  start: string;
  end: string;
}) => {
  let actualPeriodFilter = '';
  if (start && end) {
    actualPeriodFilter = `and c.start_date >= "${dayjs(start)
      .startOf('day')
      .format()}" and c.end_date <= "${dayjs(end).endOf('day').format()}"`;
  } else if (start && !end) {
    actualPeriodFilter = `and c.start_date >= "${dayjs(start)
      .startOf('day')
      .format()}"`;
  } else if (!start && end) {
    actualPeriodFilter = `and c.end_date <= "${dayjs(end)
      .startOf('day')
      .format()}"`;
  } else {
    actualPeriodFilter;
  }
  return actualPeriodFilter;
};

export const getActualCostFilter = ({
  actualCostMin,
  actualCostMax,
}: {
  actualCostMin: string;
  actualCostMax: string;
}) => {
  let actualCostFilter = '';
  if (actualCostMax || actualCostMin) {
    if (actualCostMax && actualCostMin)
      actualCostFilter = `and c.actual_cost between "${actualCostMin}" and "${actualCostMax}"`;
    else if (actualCostMax && !actualCostMin)
      actualCostFilter = `and c.actual_cost < "${actualCostMax}"`;
    else actualCostFilter = `and c.actual_cost > "${actualCostMin}"`;
  }

  return actualCostFilter;
};

export const getProjectedCostFilter = ({
  projectedCostMin,
  projectedCostMax,
}: {
  projectedCostMin: string;
  projectedCostMax: string;
}) => {
  let projectedCostFilter = '';
  if (projectedCostMax || projectedCostMin) {
    if (projectedCostMax && projectedCostMin)
      projectedCostFilter = `and c.projected_cost between "${projectedCostMin}" and "${projectedCostMax}"`;
    else if (projectedCostMax && !projectedCostMin)
      projectedCostFilter = `and c.projected_cost < "${projectedCostMax}"`;
    else projectedCostFilter = `and c.projected_cost > "${projectedCostMin}"`;
  }
  return projectedCostFilter;
};

export const formatCollectionRowData = (row: CollectionReportRowModel) => {
  const keys = [
    'createdAt',
    'dueDate',
    'collector',
    'refNo',
    'payableAmount',
    'contactGroupName',
    'assignee',
    'notify_pics',
    'status',
    'remindType',
  ] as const;

  for (let i = 0; i < keys.length; i++) {
    if (row[keys[i]] === null || row[keys[i]] === undefined) row[keys[i]] = '-';

    if (keys[i] === 'dueDate' || keys[i] === 'createdAt') {
      let value = row[keys[i]] instanceof Date ? row[keys[i]] : '-';
      //@ts-ignore
      row[keys[i]] = value;
    }
  }
  return row;
};

export const formatTaskReportData = (row: TaskReportRowModel) => {
  const keys = [
    'name',
    'statusLabel',
    'dueDate',
    'createdAt',
    'boardName',
    'taskBoardDescription',
    'companyName',
    'contactName',
    'teamTitle',
    'assignee',
    'pics',
  ] as const;
  for (let i = 0; i < keys.length; i++) {
    if (
      row[keys[i]] === null ||
      row[keys[i]] === undefined ||
      row[keys[i]] === ''
    ) {
      row[keys[i]] = '-';
    }
    if (keys[i] === 'dueDate' || keys[i] === 'createdAt') {
      let value = row[keys[i]] instanceof Date ? row[keys[i]] : '-';
      //@ts-ignore
      row[keys[i]] = value;
    }
  }

  return row;
};

export const buildAttendanceQuery = ({
  startDate,
  endDate,
  companyId,
  intervalType,
  privateAttendanceLabelIds,
  privateMemberIds,
  privateTeamIds,
  privateEmployeeTypeId,
}: {
  startDate: string;
  endDate: string;
  companyId: CompanyId;
  intervalType: string;
  privateAttendanceLabelIds: number[];
  privateMemberIds: number[];
  privateTeamIds: number[];
  privateEmployeeTypeId: number;
}): string => {
  let query = ``;

  if (intervalType === 'daily') {
    query = `
    select
    a.id_text as id,
    a.start_date as startDate,
    a.end_date as endDate, 
    cm.id_text as memberId,
    cm.id as privateMemberId,
    cm.employee_type as employeeTypeId,
    u.id_text as userId,
    cwh.timezone as timezone,
    IFNULL(IFNULL(u.name, u.email),'-') as memberName,
    IFNULL(a.start_date, '-') as 'period',
    IFNULL(a.time_total, '-') as trackedTime,
    IFNULL(a.type,'-') as type,
    al.name as activity,
    a.comments,
    a.comments_out,
    a.type,
    et.has_overtime as hasOvertime,
    IFNULL(et.name, '-') as employeeType,
    et.id as employeeTypeId

    from attendances a
    left join company_members cm on cm.id = a.company_member_id
    left join users u on cm.user_id = u.id
    left join employee_types et on cm.employee_type = et.id
    left join attendance_labels al on a.attendance_label_id = al.id
    left join company_working_hours cwh on cm.employee_type = cwh.employee_type_id

    where cm.company_id = ${companyId}
    ${_.isEmpty(privateMemberIds) ? '' : `and cm.id in (${privateMemberIds})`}
    ${_.isEmpty(privateTeamIds) ? '' : `and t.id in (${privateTeamIds})`}
    ${startDate ? `and DATE(a.start_date) >= '${startDate}'` : ``}
    ${endDate ? `and DATE(a.start_date) <= '${endDate}'` : ``}
    ${privateEmployeeTypeId !== 0 ? `and et.id = ${privateEmployeeTypeId}` : ``}
    ${
      _.isEmpty(privateAttendanceLabelIds)
        ? ''
        : `and al.id in (${privateAttendanceLabelIds})`
    }
    group by a.id

    order by a.start_date, a.company_member_id

    

    
    `;
  } else if (intervalType === 'weekly') {
    query = `
   
    `;
  } else {
    query = `
    

    
    `;
  }

  return query;
};

export const secondsToHoursAndMinutes = (totalSeconds: number): string => {
  const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: 'shortEn',
    delimiter: '',
    spacer: '',
    round: true,
    languages: {
      shortEn: {
        y: () => 'y',
        mo: () => 'mo',
        w: () => 'w',
        d: () => 'd',
        h: () => 'h',
        m: () => 'm',
        s: () => 's',
        ms: () => 'ms',
      },
    },
  });

  const hoursAndMinutes = shortEnglishHumanizer(totalSeconds);

  return hoursAndMinutes;
};

export const minutesToHoursAndMinutes = (totalMinutes: number): string => {
  const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: 'shortEn',
    delimiter: '',
    spacer: '',
    round: true,
    languages: {
      shortEn: {
        y: () => 'y',
        mo: () => 'mo',
        w: () => 'w',
        d: () => 'd',
        h: () => 'h',
        m: () => 'm',
        s: () => 's',
      },
    },
  });

  const hoursAndMinutes = shortEnglishHumanizer(totalMinutes * 60000);

  if (totalMinutes < 0) {
    return `-${hoursAndMinutes}`;
  }

  return `${hoursAndMinutes}`;
};
