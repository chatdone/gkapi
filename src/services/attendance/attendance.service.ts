import dayjs from 'dayjs';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { AttendanceStore, createLoaders } from '@data-access';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyPublicId,
  CompanyWorkDaySettingModel,
  EmployeeTypeModel,
} from '@models/company.model';
import {
  AttendanceDailySummaryModel,
  AttendanceId,
  AttendanceLabelId,
  AttendanceLabelModel,
  AttendanceModel,
  AttendanceMonthlySummaryModel,
  AttendanceSettingsModel,
  AttendanceSettingsPayload,
  AttendanceTrackedHoursModel,
  AttendanceTrackedHoursWeeklyModel,
  AttendanceWeeklySummaryModel,
  DateRangeModel,
  StartAttendancePayload,
  WorkHoursWeeklyTotalsModel,
  WorkHourTotalsModel,
} from '@models/attendance.model';
import { LocationId } from '@models/location.model';
import {
  CompanyService,
  SocketService,
  StorageService,
  TagService,
} from '@services';

import weekOfYear from 'dayjs/plugin/weekOfYear';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { consoleLog } from '@tools/utils';
import { currentDay } from '@services/event-manager/event-manager.helper';
import logger from '@tools/logger';
import {
  AttendanceType,
  CompanyWorkDaySetting,
} from '@generated/graphql-types';
import { TagModel } from '@models/tag.model';
import s3 from '@tools/s3';
import { ContactId } from '@models/contact.model';
import { UserModel } from '@models/user.model';

dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(tz);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

export const ATTENDANCE_TYPES = {
  BREAK: 0,
  CLOCK: 1,
};

const getOpenAttendances = async (
  companyMemberId?: CompanyMemberId,
): Promise<AttendanceModel[] | Error> => {
  try {
    if (companyMemberId) {
      const res = (await AttendanceStore.getOpenAttendancesForCompanyMember({
        companyMemberId,
      })) as AttendanceModel[];
      return res;
    } else {
      const res =
        (await AttendanceStore.getOpenAttendances()) as AttendanceModel[];

      return res;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const startAttendanceEntry = async ({
  companyMemberId,
  locationId,
  labelId,
  contactId,
  input,
  tags,
  user,
}: {
  companyMemberId: CompanyMemberId;
  locationId?: LocationId;
  labelId?: AttendanceLabelId;
  contactId?: ContactId;
  input: StartAttendancePayload;
  tags?: TagModel[];
  user?: UserModel;
}): Promise<AttendanceModel | Error | void> => {
  try {
    const existing = (await AttendanceStore.getOpenAttendancesForCompanyMember({
      companyMemberId,
    })) as AttendanceModel[];

    if (existing.length > 0) {
      (await exportFunctions.closeAttendance({
        companyMemberId,
        commentsOut: '',
      })) as AttendanceModel;
    }

    const { lat, lng, ...insertPayload } = input;

    const res = (await AttendanceStore.createAttendanceEntry({
      payload: {
        company_member_id: companyMemberId,
        ...(locationId && { location_id: locationId }),
        ...(labelId && { attendance_label_id: labelId }),
        ...(contactId && { contact_id: contactId }),
        ...input,
      },
    })) as AttendanceModel;

    if (tags) {
      await TagService.assignTagsToAttendance({
        tagIds: tags.map((tag) => tag.id),
        attendanceId: res?.id,
      });
    }

    // NOTE: the user can be null because the attendance can be created by the system
    if (user) {
      await SocketService.notifyAttendanceStarted({ user });
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const closeAttendance = async ({
  companyMemberId,
  commentsOut,
  initiatingUser,
  targetUser,
}: {
  companyMemberId: CompanyMemberId;
  commentsOut?: string;
  initiatingUser?: UserModel;
  targetUser?: UserModel;
}): Promise<AttendanceModel | Error> => {
  try {
    const existing = (await AttendanceStore.getOpenAttendancesForCompanyMember({
      companyMemberId,
    })) as AttendanceModel[];

    if (existing.length === 0) {
      throw new Error('No open attendances for user');
    }

    const res = (await AttendanceStore.closeAttendanceEntry({
      id: (_.head(existing) as AttendanceModel).id,
      commentsOut,
    })) as AttendanceModel;

    if (res.type === 1) {
      const overtime = await exportFunctions.getOvertimeFromAttendance(res);
      const worked = await exportFunctions.getWorkedFromAttendance(res);
      await AttendanceStore.updateOvertimeWorkedAttendanceEntry({
        attendanceId: res.id,
        overtime,
        worked,
      });
    }

    await exportFunctions.recalculateAttendanceDailyMvs(res);
    await exportFunctions.recalculateAttendanceWeeklyMvs(res);

    if (targetUser) {
      await SocketService.notifyAttendanceStopped({
        user: targetUser,
        message:
          targetUser !== initiatingUser
            ? `Your current clock in was stopped by ${initiatingUser?.name} <${initiatingUser?.email}>`
            : null,
      });
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getVerificationImageUploadUrl = async (
  companyPublicId: CompanyPublicId,
): Promise<{ s3_bucket: string; s3_key: string; upload_url: string }> => {
  try {
    const filename = uuid();
    const options = {
      bucketName: 'gokudos-assets',
      filePath: `${process.env.GK_ENVIRONMENT}/member-verification-images/${companyPublicId}/${filename}.jpg`,
    };
    const res = await StorageService.generatePresignedS3Url(options);
    return {
      s3_bucket: options.bucketName,
      s3_key: options.filePath,
      upload_url: res,
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendances = async ({
  fromDate,
  toDate,
  companyId,
  contactId,
  companyMemberId,
}: {
  fromDate: string;
  toDate: string;
  companyId?: CompanyId;
  contactId?: ContactId;
  companyMemberId?: CompanyMemberId;
}): Promise<AttendanceModel[] | Error> => {
  try {
    const res = await AttendanceStore.getAttendances({
      fromDate: dayjs(fromDate).format(`YYYY-MM-DD HH:mm:ss`),
      toDate: dayjs(toDate).format(`YYYY-MM-DD HH:mm:ss`),
      companyId,
      companyMemberId,
      contactId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendanceLabels = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<AttendanceLabelModel[] | Error> => {
  try {
    const res = await AttendanceStore.getAttendanceLabels({
      companyId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createAttendanceLabel = async ({
  companyId,
  name,
  color,
  description,
}: {
  companyId: CompanyId;
  name: string;
  color?: string;
  description?: string;
}): Promise<AttendanceLabelModel | Error> => {
  try {
    const res = await AttendanceStore.createAttendanceLabel({
      companyId,
      name,
      color,
      description,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateAttendanceLabel = async ({
  labelId,
  name,
  color,
  description,
}: {
  labelId: AttendanceLabelId;
  name: string;
  color?: string;
  description?: string;
}): Promise<AttendanceLabelModel | Error> => {
  try {
    const res = await AttendanceStore.updateAttendanceLabel({
      labelId,
      name,
      color,
      description,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const archiveAttendanceLabel = async ({
  labelId,
  archived,
}: {
  labelId: AttendanceLabelId;
  archived: boolean;
}): Promise<AttendanceLabelModel | Error> => {
  try {
    const res = await AttendanceStore.archiveAttendanceLabel({
      labelId,
      archived,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getMemberLastOut = async ({
  memberId,
}: {
  memberId: CompanyMemberId;
}): Promise<AttendanceModel | Error> => {
  try {
    const res = await AttendanceStore.getMemberLastOut({ memberId });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDaySummary = async ({
  memberId,
  day,
  month,
  year,
  companyId,
}: {
  memberId?: CompanyMemberId;
  day: number;
  month: number;
  year: number;
  companyId: CompanyId;
}): Promise<(AttendanceDailySummaryModel | Error)[]> => {
  try {
    const res = await AttendanceStore.getDailySummary({
      companyMemberId: memberId,
      query: { day, month, year },
      companyId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWeeklySummaries = async ({
  memberId,
  week,
  month,
  year,
  companyId,
}: {
  memberId?: CompanyMemberId;
  week: number;
  month: number;
  year: number;
  companyId: CompanyId;
}): Promise<(AttendanceWeeklySummaryModel | Error)[]> => {
  try {
    const res = await AttendanceStore.getWeeklySummaries({
      companyMemberId: memberId,
      query: { week, month, year },
      companyId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDayRange = (startDate: string) => {
  const start = dayjs(startDate).hour(0).minute(0).second(0);

  const end = dayjs(start).add(1, 'day');
  return {
    start: start.format('YYYY-MM-DD HH:mm:ss'),
    end: end.format('YYYY-MM-DD HH:mm:ss'),
  };
};

const createWorkHourTotals = async ({
  companyMemberId,
  latestAttendance,
}: {
  companyMemberId: CompanyMemberId;
  latestAttendance: AttendanceModel;
}): Promise<WorkHourTotalsModel[] | Error | undefined> => {
  // TODO: handle case of getting the attendances if closing the entry after midnight the next day
  try {
    const loaders = createLoaders();

    // Getting the full company member data
    const member = (await loaders.companyMembers.load(
      companyMemberId,
    )) as CompanyMemberModel;

    const timezone = await CompanyService.getMemberWorkingHourTimezone({
      companyMemberId: member.id,
      day: currentDay(),
    });

    // Gets the date range to find all attendance entries for today
    const dates = (await exportFunctions.getDatesWithTimezone({
      startDate: latestAttendance.start_date,
      endDate: latestAttendance.end_date,
      timezone,
    })) as { start: string; end: string };

    const startDateDay = dayjs(dates.start).day();
    const endDateDay = dayjs(dates.end).day();

    // get working hours for this employee type
    const workHourSettings = (await CompanyService.getWorkDaySettings({
      employeeTypeId: member.employee_type,
    })) as CompanyWorkDaySettingModel[];

    let hasOvertime = false;

    if (member?.employee_type) {
      const employeeType = (await exportFunctions.getEmployeeType(
        member.employee_type,
      )) as EmployeeTypeModel;

      if (employeeType) {
        // check if the employee qualifies for overtime
        hasOvertime = employeeType.has_overtime;
      }
    }

    // get the specific work hour schedule for the day (eg Friday)
    const workDay = _.find(
      workHourSettings,
      (e: CompanyWorkDaySettingModel) => e.day === startDateDay,
    );

    let endHour: string | null = null;
    let startHour: string | null = null;

    if (workDay) {
      endHour = workDay?.end_hour;
      startHour = workDay?.start_hour;
    }

    const range = exportFunctions.getDayRange(latestAttendance.start_date);

    consoleLog(`fromDate: ${range.start}`);
    consoleLog(`toDate: ${range.end}`);

    // Gets all the attendance entries for the day
    const attendances = (await AttendanceStore.getAttendances({
      fromDate: range.start,
      toDate: range.end,
      companyId: member.company_id,
      companyMemberId: member.id,
    })) as AttendanceModel[];

    const initialValue: WorkHourTotalsModel = {
      tracked: 0,
      worked: 0,
      regular: 0,
      overtime: 0,
      day: dayjs(dates.start).date(),
      month: dayjs(dates.start).month() + 1,
      year: dayjs(dates.start).year(),
    };

    const initialNextDayValue: WorkHourTotalsModel = {
      tracked: 0,
      worked: 0,
      regular: 0,
      overtime: 0,
      day: dayjs(dates.end).date(),
      month: dayjs(dates.end).month() + 1,
      year: dayjs(dates.end).year(),
    };

    const reducer = (accumulator: unknown, item: unknown) => {
      const totals = accumulator as WorkHourTotalsModel;

      const attendance = item as AttendanceModel;

      const { time_total, end_date, start_date } = attendance;

      const endDate = dayjs(end_date)
        .tz(timezone)

        .format('YYYY-MM-DD HH:mm:ss');

      const startDate = dayjs(start_date)
        .tz(timezone)

        .format('YYYY-MM-DD HH:mm:ss');

      const day = dayjs(startDate).date();
      const month = dayjs(startDate).month();
      const year = dayjs(startDate).year();

      totals.day = dayjs(startDate).date();
      totals.month = dayjs(startDate).month() + 1;
      totals.year = dayjs(startDate).year();

      if (attendance.type === ATTENDANCE_TYPES.CLOCK) {
        if (endHour) {
          const endHoursString = `${year}-${month + 1 < 10 ? '0' : ''}${
            month + 1
          }-${day < 10 ? '0' : ''}${day} ${endHour}`;

          const startHoursString = `${year}-${month + 1 < 10 ? '0' : ''}${
            month + 1
          }-${day < 10 ? '0' : ''}${day} ${startHour}`;

          // const endHoursFormatted = dayjs(endHoursString).format(
          //   'YYYY-MM-DD HH:mm:ss',
          // );

          // const startHoursFormatted = dayjs(startHoursString).format(
          //   'YYYY-MM-DD HH:mm:ss',
          // );

          const endOfDay = dayjs(
            `${year}-${month + 1 < 10 ? '0' : ''}${month + 1}-${
              day < 10 ? '0' : ''
            }${day} 23:59:59`,
          )
            .tz(timezone)
            .format('YYYY-MM-DD HH:mm:ss');

          // const endHours = dayjs(endHoursFormatted)
          //   .tz(timezone)
          //   .format('YYYY-MM-DD HH:mm:ss');

          // const startHours = dayjs(startHoursFormatted)
          //   .tz(timezone)
          //   .format('YYYY-MM-DD HH:mm:ss');

          const startDateDay = dayjs(startDate).day();

          const endDateDay = dayjs(endDate).day();

          const isSameDay = startDateDay === endDateDay;

          if (
            dayjs(startDate).isBetween(
              startHoursString,
              endHoursString,
              'hour',
            ) &&
            dayjs(endDate).isBetween(
              startHoursString,
              endHoursString,
              'hour',
            ) &&
            isSameDay
          ) {
            consoleLog('is same day and within working hours');
            totals.tracked += time_total;
            totals.worked += time_total;
            totals.regular += time_total;
          } else if (
            dayjs(startDate).isBefore(startHoursString) &&
            dayjs(endDate).isBetween(
              startHoursString,
              endHoursString,
              'hour',
            ) &&
            isSameDay
          ) {
            consoleLog(
              'is within same day but worker clocked in before start hours',
            );
            const regularHours = dayjs(endDate).diff(
              startHoursString,
              'second',
            );
            totals.tracked += time_total;
            totals.worked += time_total;
            totals.regular += regularHours;
            // totals.overtime += 0;
          } else if (
            dayjs(startDate).isBetween(
              startHoursString,
              endHoursString,
              'hour',
            ) &&
            dayjs(endDate).isAfter(endHoursString) &&
            isSameDay
          ) {
            consoleLog(
              'is within same day but worker clocked out after end hours',
            );
            const regularHours = dayjs(endHoursString).diff(
              startDate,
              'second',
            );
            const after = dayjs(endDate).diff(endHoursString, 'second');
            totals.tracked += time_total;
            if (hasOvertime) {
              totals.worked += time_total;
              totals.regular += regularHours;
              totals.overtime += after;
            } else {
              totals.worked += regularHours;
              totals.regular += regularHours;
              // totals.overtime += 0;
            }
          } else if (
            dayjs(endDate).isBefore(startHoursString) &&
            dayjs(startDate).isBefore(startHoursString) &&
            isSameDay
          ) {
            consoleLog(
              'is within same day but worker clocked in and out before start hours',
            );

            // totals.overtime += 0;
            totals.tracked += time_total;
            totals.worked += time_total;
            // totals.regular += 0;
          } else if (
            dayjs(endDate).isAfter(endHoursString) &&
            dayjs(startDate).isAfter(endHoursString) &&
            isSameDay
          ) {
            consoleLog(
              'is within same day but worker clocked in and out after end hours',
            );
            totals.tracked += time_total;

            if (hasOvertime) {
              totals.overtime += time_total;
              totals.worked += time_total;
              // totals.regular += 0;
            } else {
              // totals.overtime += 0;
              totals.worked += time_total;
              // totals.regular += 0;
            }
          } else if (!isSameDay) {
            const diffUntilMidnight = dayjs(endOfDay).diff(startDate, 'second');

            totals.tracked += diffUntilMidnight;
            totals.worked += diffUntilMidnight;

            if (hasOvertime) {
              totals.overtime += diffUntilMidnight;
            }

            if (dayjs(startDate).isBetween(startHoursString, endHoursString)) {
              totals.regular += diffUntilMidnight;
            }
          } else {
            consoleLog('Else');
            totals.tracked += time_total;
            totals.worked += time_total;
            totals.regular += time_total;
          }
        } else {
          totals.tracked += time_total;
          totals.worked += time_total;
          totals.regular += time_total;
        }
      } else if (attendance.type === ATTENDANCE_TYPES.BREAK) {
        totals.tracked += time_total;
      }

      return totals;
    };
    let totalNextDay;

    const totalHours = attendances.reduce(reducer, initialValue);

    if (startDateDay !== endDateDay) {
      let nextEndHour: string | null = null;
      let nextStartHour: string | null = null;

      const workNextDay = _.find(
        workHourSettings,
        (e: CompanyWorkDaySettingModel) => e.day === endDateDay,
      );

      if (workNextDay) {
        nextEndHour = workNextDay?.end_hour;
        nextStartHour = workNextDay?.start_hour;
      }

      const nextDayRange = exportFunctions.getDayRange(
        latestAttendance.end_date,
      );

      const nextDayAttendances = (await AttendanceStore.getAttendances({
        fromDate: dayjs(nextDayRange.start).format('YYYY-MM-DD HH:mm:ss'),
        toDate: dayjs(nextDayRange.end).format('YYYY-MM-DD HH:mm:ss'),
        companyId: member.company_id,
        companyMemberId: member.id,
      })) as AttendanceModel[];

      const nextDayReducer = (accumulator: unknown, item: unknown) => {
        const totals = accumulator as WorkHourTotalsModel;
        const attendance = item as AttendanceModel;

        const { time_total, end_date, start_date } = attendance;
        consoleLog(attendance);
        const endDateFormatted = dayjs(end_date).format('YYYY-MM-DD HH:mm:ss');

        const startDateFormatted = dayjs(start_date).format(
          'YYYY-MM-DD HH:mm:ss',
        );

        const endDate = dayjs(endDateFormatted)
          .tz(timezone)
          .format('YYYY-MM-DD HH:mm:ss');

        const startDate = dayjs(startDateFormatted)
          .tz(timezone)
          .format('YYYY-MM-DD HH:mm:ss');

        const day = dayjs(startDate).date();
        const month = dayjs(startDate).month();
        const year = dayjs(startDate).year();

        totals.day = day;
        totals.month = month + 1;
        totals.year = year;

        if (attendance.type === ATTENDANCE_TYPES.CLOCK) {
          if (endHour) {
            const endHoursString = `${year}-${month + 1 < 10 ? '0' : ''}${
              month + 1
            }-${day < 10 ? '0' : ''}${day} ${nextEndHour}`;

            const startHoursString = `${year}-${month + 1 < 10 ? '0' : ''}${
              month + 1
            }-${day < 10 ? '0' : ''}${day} ${nextStartHour}`;

            const endHoursFormatted = dayjs(endHoursString).format(
              'YYYY-MM-DD HH:mm:ss',
            );

            const startHoursFormatted = dayjs(startHoursString).format(
              'YYYY-MM-DD HH:mm:ss',
            );

            const endOfDay = dayjs(
              `${year}-${month + 1 < 10 ? '0' : ''}${month + 1}-${
                day < 10 ? '0' : ''
              }${day} 23:59:59`,
            )
              .tz(timezone)
              .format('YYYY-MM-DD HH:mm:ss');

            const endHours = dayjs(endHoursFormatted)
              .tz(timezone)
              .format('YYYY-MM-DD HH:mm:ss');

            const startHours = dayjs(startHoursFormatted)
              .tz(timezone)
              .format('YYYY-MM-DD HH:mm:ss');

            const startDateDay = dayjs(startDate).date();

            const endDateDay = dayjs(endDate).date();

            const isSameDay = startDateDay === endDateDay;
            if (!isSameDay) {
              const diffFromMidnight = dayjs(endDate).diff(endOfDay, 'second');

              totals.day = +endDateDay;
              totals.month = dayjs(endDate).month() + 1;
              totals.year = dayjs(endDate).year();
              totals.tracked += diffFromMidnight;
              totals.worked += diffFromMidnight;

              if (dayjs(endDate).isBetween(startHours, endHours)) {
                totals.regular += diffFromMidnight;
              }

              if (hasOvertime) {
                totals.overtime += diffFromMidnight;
              }

              // if (dayjs(endDate).isBefore(startHours)) {
              //   totals.overtime += 0;
              // }
            } else {
              totals.tracked += time_total;
              totals.worked += time_total;
              totals.regular += time_total;
            }
          } else {
            totals.tracked += time_total;
            totals.worked += time_total;
            totals.regular += time_total;
          }
        } else if (attendance.type === ATTENDANCE_TYPES.BREAK) {
          totals.tracked += time_total;
        }
        return totals;
      };

      totalNextDay = nextDayAttendances.reduce(
        nextDayReducer,
        initialNextDayValue,
      );

      return [totalHours, totalNextDay];
    } else {
      return [totalHours];
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getEmployeeType = async (
  employeeTypeNumber: number,
): Promise<EmployeeTypeModel | Error> => {
  try {
    const loaders = createLoaders();
    const employeeType = (await loaders.employeeTypes.load(
      employeeTypeNumber,
    )) as EmployeeTypeModel;

    return employeeType;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateMemberDailySummary = async ({
  companyMemberId,
  latestAttendance,
}: {
  companyMemberId: CompanyMemberId;
  latestAttendance: AttendanceModel;
}): Promise<void | Error> => {
  try {
    const payloads = (await exportFunctions.createWorkHourTotals({
      companyMemberId,
      latestAttendance,
    })) as WorkHourTotalsModel[];

    const loaders = createLoaders();
    const member = (await loaders.companyMembers.load(
      companyMemberId,
    )) as CompanyMemberModel;

    const dailies = (await Promise.all(
      _.map(payloads, async (payload) => {
        const existing = (await AttendanceStore.getDailySummary({
          query: { day: payload.day, month: payload.month, year: payload.year },
          companyMemberId,
          companyId: member.company_id,
        })) as AttendanceDailySummaryModel[];

        if (existing?.length > 0) {
          return await AttendanceStore.upsertMemberDaySummary({
            payload,
            companyMemberId,
            id: _.head(existing)?.id,
          });
        } else {
          return await AttendanceStore.upsertMemberDaySummary({
            payload,
            companyMemberId,
            // generatedAt: dateString,
          });
        }
      }),
    )) as AttendanceDailySummaryModel[];

    await Promise.all(
      _.map(dailies, async (daily) => {
        return await exportFunctions.updateMemberWeeklySummary({
          daily,
          companyMemberId,
        });
      }),
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateMemberWeeklySummary = async ({
  daily,
  companyMemberId,
}: {
  daily: AttendanceDailySummaryModel;
  companyMemberId: CompanyMemberId;
}): Promise<void> => {
  try {
    const dayOfWeek = dayjs(
      `${daily.year}-${daily.month < 10 ? '0' : ''}${daily.month}-${
        daily.day < 10 ? '0' : ''
      }${daily.day}`,
    ).day();

    const date = `${daily.year}-${daily.month < 10 ? '0' : ''}${daily.month}-${
      daily.day < 10 ? '0' : ''
    }${daily.day}`;

    const weeklyInitialValue: WorkHoursWeeklyTotalsModel = {
      tracked_total: 0,
      worked_total: 0,
      regular_total: 0,
      overtime_total: 0,
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    const loaders = createLoaders();
    const member = (await loaders.companyMembers.load(
      companyMemberId,
    )) as CompanyMemberModel;

    const existing = (await AttendanceStore.getWeeklySummaries({
      companyMemberId,
      query: {
        week: dayjs(date).isoWeek(),
        month: dayjs(date).month() + 1, // NOTE: month on dayjs is zero-indexed
        year: dayjs(date).year(),
      },
      companyId: member.company_id,
    })) as AttendanceWeeklySummaryModel[];

    if (existing?.length > 0) {
      const exist = _.head(existing);
      // Yes, these are ridiculous. Sorry :(
      // I built the daily recalculate without thinking about
      // weekly recalculate in mind
      weeklyInitialValue.tracked_total +=
        daily.tracked - (exist?.tracked_total || 0);
      weeklyInitialValue.worked_total +=
        daily.worked - (exist?.worked_total || 0);
      weeklyInitialValue.regular_total +=
        daily.regular - (exist?.regular_total || 0);
      weeklyInitialValue.overtime_total +=
        daily.overtime - (exist?.overtime_total || 0);

      switch (dayOfWeek) {
        case 0:
          weeklyInitialValue.sunday += daily.tracked - (exist?.sunday || 0);

          break;

        case 1:
          weeklyInitialValue.monday += daily.tracked - (exist?.monday || 0);

          break;

        case 2:
          weeklyInitialValue.tuesday += daily.tracked - (exist?.tuesday || 0);

          break;

        case 3:
          weeklyInitialValue.wednesday +=
            daily.tracked - (exist?.wednesday || 0);

          break;

        case 4:
          weeklyInitialValue.thursday += daily.tracked - (exist?.thursday || 0);

          break;

        case 5:
          weeklyInitialValue.friday += daily.tracked - (exist?.friday || 0);

          break;

        case 6:
          weeklyInitialValue.saturday += daily.tracked - (exist?.saturday || 0);

          break;

        default:
          break;
      }

      const weeklyPayload = {
        week: dayjs(date).isoWeek(),
        month: dayjs(date).month() + 1, // NOTE: month on dayjs is zero-indexed
        year: dayjs(date).year(),
        ...weeklyInitialValue,
      };

      weeklyPayload.monday += exist?.monday || 0;
      weeklyPayload.tuesday += exist?.tuesday || 0;
      weeklyPayload.wednesday += exist?.wednesday || 0;
      weeklyPayload.thursday += exist?.thursday || 0;
      weeklyPayload.friday += exist?.friday || 0;
      weeklyPayload.saturday += exist?.saturday || 0;
      weeklyPayload.sunday += exist?.sunday || 0;
      weeklyPayload.tracked_total += exist?.tracked_total || 0;
      weeklyPayload.worked_total += exist?.worked_total || 0;
      weeklyPayload.overtime_total += exist?.overtime_total || 0;
      weeklyPayload.regular_total += exist?.regular_total || 0;

      await AttendanceStore.upsertMemberWeekSummary({
        companyMemberId,
        payload: weeklyPayload,
        id: _.head(existing)?.id,
      });
    } else {
      switch (dayOfWeek) {
        case 0:
          weeklyInitialValue.sunday += daily.tracked;

          break;

        case 1:
          weeklyInitialValue.monday += daily.tracked;

          break;

        case 2:
          weeklyInitialValue.tuesday += daily.tracked;

          break;

        case 3:
          weeklyInitialValue.wednesday += daily.tracked;

          break;

        case 4:
          weeklyInitialValue.thursday += daily.tracked;

          break;

        case 5:
          weeklyInitialValue.friday += daily.tracked;

          break;

        case 6:
          weeklyInitialValue.saturday += daily.tracked;

          break;

        default:
          break;
      }

      weeklyInitialValue.tracked_total += daily.tracked;
      weeklyInitialValue.worked_total += daily.worked;
      weeklyInitialValue.overtime_total += daily.overtime;
      weeklyInitialValue.regular_total += daily.regular;
      const weeklyPayload = {
        week: dayjs(date).isoWeek(),
        month: dayjs(date).month() + 1, // NOTE: month on dayjs is zero-indexed
        year: dayjs(date).year(),
        ...weeklyInitialValue,
      };

      await AttendanceStore.upsertMemberWeekSummary({
        companyMemberId,
        payload: weeklyPayload,
      });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDatesWithTimezone = async ({
  startDate,
  endDate,
  timezone,
}: {
  startDate: string;
  endDate: string;
  timezone: string;
}): Promise<{ start: string; end: string } | Error> => {
  try {
    const start = dayjs(startDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');

    const end = dayjs(endDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');

    return { start, end };
  } catch (error) {
    return Promise.reject(error);
  }
};

const getMonthlySummary = async ({
  companyMemberId,
  query,
  companyId,
}: {
  companyMemberId?: CompanyMemberId;
  query: { week: number[]; year: number; month: number };
  companyId: CompanyId;
}): Promise<(AttendanceMonthlySummaryModel | Error)[]> => {
  try {
    const res = await AttendanceStore.getMonthlySummary({
      companyMemberId,
      query,
      companyId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWeeklySummariesForMonth = async ({
  companyMemberId,
  query,
  companyId,
}: {
  companyMemberId?: CompanyMemberId;
  query: {
    week_numbers: number[];
    month: number;
    year: number;
  };
  companyId: CompanyId;
}): Promise<AttendanceWeeklySummaryModel[] | Error> => {
  try {
    const res = await AttendanceStore.getWeeklySummariesForMonth({
      companyMemberId,
      query,
      companyId,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendanceSettings = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<AttendanceSettingsModel | Error> => {
  try {
    const res = await AttendanceStore.getAttendanceSettings({
      companyId,
    });

    if (!res) {
      const createDefaultRes = await AttendanceStore.updateAttendanceSettings({
        companyId,
        payload: {
          allow_mobile: 1,
          allow_web: 1,
          require_verification: 0,
          require_location: 0,
          enable_2d: 1,
          enable_biometric: 1,
        },
      });

      return createDefaultRes;
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateAttendanceSettings = async ({
  companyId,
  payload,
}: {
  companyId: CompanyId;
  payload: AttendanceSettingsPayload;
}): Promise<AttendanceSettingsModel | Error> => {
  try {
    const res = await AttendanceStore.updateAttendanceSettings({
      companyId,
      payload,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getMemberAttendanceStats = async (
  memberId: CompanyMemberId,
): Promise<{
  total: number;
  break: number;
  overtime: number;
  worked: number;
}> => {
  try {
    const res = await AttendanceStore.getMemberAttendanceStats(memberId);

    const stats = {
      total: res?.tracked || 0,
      break: res?.tracked - res.worked || 0,
      worked: res.worked || 0,
      overtime: res?.overtime || 0,
    };

    return stats;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDailySummaryByDateAndMemberId = async ({
  day,
  month,
  year,
  companyMemberId,
}: {
  day: number;
  month: number;
  year: number;
  companyMemberId: CompanyMemberId;
}) => {
  try {
    const res = await AttendanceStore.getDailySummaryByDateAndMemberId({
      day,
      month,
      year,
      companyMemberId,
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const clockOutAndInOpenAttendances = async () => {
  try {
    const openAttendances =
      (await exportFunctions.getOpenAttendances()) as AttendanceModel[];

    await Promise.all(
      _.map(openAttendances, async (attendance) => {
        const workSchedule = (await CompanyService.getMemberWorkingHours({
          companyMemberId: attendance.company_member_id,
          day: currentDay(),
        })) as CompanyWorkDaySettingModel;

        const timezone = workSchedule?.timezone || 'Asia/Kuala_Lumpur';

        const startDate = dayjs(attendance.start_date).tz(timezone); //Convert to schedule timezone

        const isNextDay =
          startDate.tz(timezone).date() !== dayjs().tz(timezone).date();

        if (isNextDay) {
          await exportFunctions
            .closePreviousDayAttendance({
              attendanceId: attendance.id,
              timezone,
            })
            .then(async () => {
              await exportFunctions.startAttendanceEntry({
                companyMemberId: attendance.company_member_id,
                labelId: attendance?.attendance_label_id,
                locationId: attendance?.location_id,
                input: {
                  comments: attendance.comments,
                  type: attendance.type,
                  verification_type: attendance?.verification_type,
                  image_url: attendance?.image_url,
                  s3_bucket: attendance?.s3_bucket,
                  s3_key: attendance?.s3_key,
                  address: attendance?.address,
                },
              });
            });
        }
      }),
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const closePreviousDayAttendance = async ({
  attendanceId,
  timezone,
}: {
  attendanceId: number;
  timezone: string;
}) => {
  try {
    const res = await AttendanceStore.closePreviousDayAttendance({
      attendanceId,
      endDate: dayjs()
        .tz(timezone)
        .hour(23)
        .minute(59)
        .second(59)
        .subtract(1, 'day')
        .toISOString(),
    }); //Convert it back to UTC

    if (res.type === 1) {
      const overtime = await exportFunctions.getOvertimeFromAttendance(res);
      const worked = await exportFunctions.getWorkedFromAttendance(res);

      await AttendanceStore.updateOvertimeWorkedAttendanceEntry({
        attendanceId: res.id,
        overtime,
        worked,
      });
    }

    if (res) {
      await exportFunctions.recalculateAttendanceDailyMvs(res);
      await exportFunctions.recalculateAttendanceWeeklyMvs(res);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getOvertimeFromAttendance = async (
  attendance: AttendanceModel,
): Promise<number> => {
  try {
    const attendanceDay = dayjs(attendance.end_date).get('day');

    const workHour = (await CompanyService.getMemberWorkingHours({
      companyMemberId: attendance.company_member_id,
      day: attendanceDay,
    })) as CompanyWorkDaySetting;

    if (!workHour?.open) {
      return 0;
    }

    const workScheduleTimezone = workHour?.timezone || 'Asia/Kuala_Lumpur';

    const currentDate = dayjs(attendance.end_date)
      .tz(workScheduleTimezone)
      .format('YYYY-MM-DD');

    const startDate = dayjs(attendance.start_date)
      .tz(workScheduleTimezone)
      .format(`YYYY-MM-DD HH:mm:ss`);

    const endDate = dayjs(attendance.end_date)
      .tz(workScheduleTimezone)
      .format(`YYYY-MM-DD HH:mm:ss`);

    const endHour = `${currentDate} ${workHour.end_hour}`;

    const overtimeTime = dayjs(endDate).diff(endHour, 's');
    const hasOvertime = await exportFunctions.hasOvertime(
      attendance.company_member_id,
    );
    if (overtimeTime < 0 || !hasOvertime) {
      return 0;
    }

    if (dayjs(startDate).isAfter(endHour)) {
      const overtime = dayjs(endDate).diff(startDate, 's');

      return overtime;
    }

    return overtimeTime;
  } catch (error) {
    logger.errorLogger.log('info', 'getOvertimeFromAttendance', { error });
    return 0;
  }
};

const hasOvertime = async (memberId: CompanyMemberId): Promise<boolean> => {
  try {
    const loaders = createLoaders();
    const member = (await loaders.companyMembers.load(
      memberId,
    )) as CompanyMemberModel;

    if (!member?.employee_type) {
      return false;
    }

    const employeeType = (await loaders.employeeTypes.load(
      member.employee_type,
    )) as EmployeeTypeModel;

    if (employeeType.has_overtime) {
      return true;
    }
    return false;
  } catch (error) {
    logger.errorLogger.log('info', 'hasOvertime', { error });
    return false;
  }
};

const getWorkedFromAttendance = async (
  attendance: AttendanceModel,
): Promise<number> => {
  try {
    const attendanceDay = dayjs(attendance?.end_date).get('day');

    const workHour = (await CompanyService.getMemberWorkingHours({
      companyMemberId: attendance.company_member_id,
      day: attendanceDay,
    })) as CompanyWorkDaySetting;

    const workScheduleTimezone = workHour?.timezone || 'Asia/Kuala_Lumpur';

    const currentDate = dayjs(attendance?.end_date)
      .tz(workScheduleTimezone)
      .format('YYYY-MM-DD');

    const attendanceStart = dayjs(attendance?.start_date)
      .tz(workScheduleTimezone)
      .format(`YYYY-MM-DD HH:mm:ss`);

    const startDate = attendanceStart;

    const endHour = `${currentDate} ${workHour?.end_hour}`;

    const attendanceEnd = dayjs(attendance?.end_date)
      .tz(workScheduleTimezone)
      .format(`YYYY-MM-DD HH:mm:ss`);

    const endDate = dayjs(attendanceEnd).isAfter(endHour)
      ? endHour
      : attendanceEnd;

    const hasOvertime = await exportFunctions.hasOvertime(
      attendance.company_member_id,
    );

    if (!hasOvertime || !workHour?.open) {
      return dayjs(attendanceEnd).diff(attendanceStart, 's');
    }

    if (
      dayjs(attendance.start_date).tz(workScheduleTimezone).isAfter(endHour)
    ) {
      return 0;
    }

    const workedSeconds =
      dayjs(endDate).diff(startDate, 's') < 0
        ? 0
        : dayjs(endDate).diff(startDate, 's');

    return workedSeconds;
  } catch (error) {
    logger.errorLogger.log('info', 'getWorkedFromAttendance', { error });
    return 0;
  }
};

const recalculateAttendanceMvs = async (attendance: AttendanceModel) => {
  try {
  } catch (error) {
    logger.errorLogger.log('info', 'recalculateAttendanceMvs', { error });
    return;
  }
};

const recalculateAttendanceDailyMvs = async (attendance: AttendanceModel) => {
  try {
    const companyMemberId = attendance.company_member_id;

    const day = dayjs(attendance.end_date).get('date');
    const month = dayjs(attendance.end_date).get('month') + 1;
    const year = dayjs(attendance.end_date).get('year');

    const attendanceDay = dayjs(attendance.end_date).get('day');
    const workHour = (await CompanyService.getMemberWorkingHours({
      companyMemberId: attendance.company_member_id,
      day: attendanceDay,
    })) as CompanyWorkDaySetting;

    const workScheduleTimezone = workHour?.timezone || 'Asia/Kuala_Lumpur';

    const fromDate = dayjs(attendance.end_date)
      .tz(workScheduleTimezone)
      .hour(0)
      .minute(0)
      .second(0)
      .toISOString();

    const toDate = dayjs(attendance.end_date)
      .tz(workScheduleTimezone)
      .hour(23)
      .minute(59)
      .second(59)
      .toISOString();

    logger.attendanceLogger.log('info', 'recalculateAttendanceDailyMvs', {
      fromDate,
      toDate,
    });

    const currentDayAttendances = (await exportFunctions.getAttendances({
      fromDate,
      toDate,
      companyMemberId: companyMemberId,
    })) as AttendanceModel[];

    const totalTracked = await exportFunctions.getTotalTrackedHours(
      currentDayAttendances || [],
    );

    if (totalTracked) {
      let summaryId;
      const currentMemberDaySummary =
        (await AttendanceStore.getMemberDaySummary({
          companyMemberId,
          day,
          month,
          year,
        })) as AttendanceDailySummaryModel;

      if (currentMemberDaySummary) {
        summaryId = currentMemberDaySummary?.id;
      }

      const firstAttendanceId = _.head(currentDayAttendances)?.id;

      const lastAttendanceId = _.last(currentDayAttendances)?.id;

      await AttendanceStore.upsertMemberDaySummary({
        companyMemberId,
        id: summaryId,
        firstAttendanceId,
        lastAttendanceId,
        payload: {
          day,
          month,
          year,
          ...totalTracked,
          regular: totalTracked.worked,
        },
      });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'recalculateAttendanceDaily', { error });
    return;
  }
};

const recalculateAttendanceWeeklyMvs = async (attendance: AttendanceModel) => {
  try {
    const companyMemberId = attendance.company_member_id;
    const year = dayjs(attendance.end_date).get('year');
    const month = dayjs(attendance.end_date).get('month') + 1;

    const fromDate = dayjs(attendance.end_date)
      .startOf('year')
      .hour(0)
      .minute(0)
      .second(0)
      .toISOString(); //Convert back to UTC

    const toDate = dayjs(attendance.end_date)
      .endOf('year')
      .hour(23)
      .minute(59)
      .second(59)
      .toISOString(); //Convert back to UTC

    logger.attendanceLogger.log('info', 'recalculateAttendanceWeeklyMvs', {
      fromDate,
      toDate,
    });

    const allAttendances = (await AttendanceStore.getAttendances({
      fromDate,
      toDate,
      companyMemberId,
    })) as AttendanceModel[];

    const groupedAttendances =
      await exportFunctions.groupAttendancesBasedOnWeekNumber(allAttendances);

    if (groupedAttendances && groupedAttendances?.length > 0) {
      await Promise.all(
        _.map(groupedAttendances, async (group) => {
          const weekNumber = _.head(group)?.weekNumber || 0;

          if (weekNumber === 0) {
            logger.errorLogger.log('info', 'recalculateAttendanceWeeklyMvs', {
              weekNumber,
            });
          }

          // logger.attendanceLogger.log(
          //   'info',
          //   'recalculateAttendanceWeeklyMvs',
          //   {
          //     weekNumber,
          //   },
          // );

          const attendances = _.map(group, (att) => {
            return att.attendance;
          });

          const totalWeeklyTracked = await getTotalTrackedHoursForWeekly(
            attendances || [],
          );

          // logger.attendanceLogger.log(
          //   'info',
          //   'recalculateAttendanceWeeklyMvs',
          //   {
          //     totalWeeklyTracked,
          //   },
          // );

          if (totalWeeklyTracked) {
            let summaryId;
            const currentMemberWeekSummary =
              (await AttendanceStore.getMemberWeeklySummary({
                companyMemberId,
                week: weekNumber,
                year,
              })) as AttendanceWeeklySummaryModel;

            if (currentMemberWeekSummary) {
              summaryId = currentMemberWeekSummary?.id;
            }

            await AttendanceStore.upsertMemberWeekSummary({
              companyMemberId,
              id: summaryId,
              payload: {
                month,
                week: weekNumber,
                year,
                ...totalWeeklyTracked,
              },
            });
          }
        }),
      );
    }
  } catch (error) {
    logger.errorLogger.log('info', 'recalculateAttendanceWeeklyMvs', { error });
    return;
  }
};

const getTotalTrackedHours = async (
  attendances: AttendanceModel[],
): Promise<AttendanceTrackedHoursModel | void> => {
  try {
    const total = attendances.reduce(
      (totalValue, currentValue) => {
        totalValue.tracked += currentValue?.time_total || 0;

        if (currentValue?.type === 1) {
          totalValue.worked += currentValue?.worked || 0;
          totalValue.overtime += currentValue?.overtime || 0;
        }

        return totalValue;
      },
      { worked: 0, tracked: 0, overtime: 0 },
    );

    return total;
  } catch (error) {
    logger.errorLogger.log('info', 'getTotalTrackedHours', { error });
    return;
  }
};

const getTotalTrackedHoursForWeekly = async (
  attendances: AttendanceModel[],
): Promise<AttendanceTrackedHoursWeeklyModel | void> => {
  try {
    const total = attendances.reduce(
      (totalValue, currentValue) => {
        const dayOfWeek = dayjs(currentValue.end_date).get('day');

        totalValue.tracked_total += currentValue.time_total || 0;

        if (currentValue.type === 0) {
          return totalValue;
        }

        totalValue.overtime_total += currentValue.overtime || 0;
        totalValue.worked_total += currentValue.worked || 0;
        totalValue.regular_total += currentValue.worked || 0;

        if (dayOfWeek === 0) {
          totalValue.sunday += currentValue.time_total || 0;
        } else if (dayOfWeek === 1) {
          totalValue.monday += currentValue.time_total || 0;
        } else if (dayOfWeek === 2) {
          totalValue.tuesday += currentValue.time_total || 0;
        } else if (dayOfWeek === 3) {
          totalValue.wednesday += currentValue.time_total || 0;
        } else if (dayOfWeek === 4) {
          totalValue.thursday += currentValue.time_total || 0;
        } else if (dayOfWeek === 5) {
          totalValue.friday += currentValue.time_total || 0;
        } else if (dayOfWeek === 6) {
          totalValue.saturday += currentValue.time_total || 0;
        }

        return totalValue;
      },
      {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        tracked_total: 0,
        worked_total: 0,
        regular_total: 0,
        overtime_total: 0,
      },
    );

    return total;
  } catch (error) {
    logger.errorLogger.log('info', 'getTotalTrackedHoursForWeekly', { error });
    return;
  }
};

const groupAttendancesBasedOnWeekNumber = async (
  attendances: AttendanceModel[],
): Promise<{ weekNumber: number; attendance: AttendanceModel }[][] | void> => {
  try {
    const withWeekNumber = await Promise.all(
      _.map(attendances, async (attendance) => {
        const weekNumber = dayjs(attendance.end_date).isoWeek();

        return { weekNumber, attendance };
      }),
    );

    const groupedWeek = _.groupBy(withWeekNumber, 'weekNumber');

    return Object.values(groupedWeek);
  } catch (error) {
    logger.errorLogger.log('info', 'groupAttendancesBasedOnWeekNumber', {
      error,
    });
    return [];
  }
};

const setAttendanceVerificationImage = async ({
  companyMemberId,
  s3ImageUrl,
  s3Bucket,
  s3Key,
  attendanceId,
}: {
  companyMemberId: CompanyMemberId;
  s3ImageUrl: string;
  s3Bucket: string;
  s3Key: string;
  attendanceId: AttendanceId;
}) => {
  try {
    const res = await s3.setAttendanceVerificationImageSize({
      companyMemberId,
      imageUrl: s3ImageUrl,
      bucket: s3Bucket,
      attendanceId,
      key: s3Key,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendanceDaySummaries = async ({
  selectedDate,
  companyMemberId,
  companyId,
}: {
  selectedDate: string;
  companyMemberId?: CompanyMemberId;
  companyId: CompanyId;
}): Promise<AttendanceDailySummaryModel[]> => {
  try {
    let companyMemberIds = [companyMemberId];
    if (!companyMemberId) {
      const companyMembers = (await CompanyService.getCompanyMembers(
        companyId,
      )) as CompanyMemberModel[];
      companyMemberIds = companyMembers.map((cm) => cm?.id);
    }
    const fromDate = dayjs(selectedDate).startOf('month').toISOString();
    const toDate = dayjs(selectedDate).endOf('month').toISOString();
    const range = await getDateRange({ fromDate, toDate });
    const res = await AttendanceStore.getAttendanceDaySummaries({
      range,
      companyMemberIds: companyMemberIds as number[],
    });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDateRange = async ({
  fromDate,
  toDate,
}: {
  fromDate: string;
  toDate: string;
}): Promise<DateRangeModel> => {
  try {
    const diff = dayjs(toDate).diff(fromDate, 'day');

    const days = [];

    const month = dayjs(toDate).month() + 1;
    const year = dayjs(toDate).year();
    for (let i = 0; i <= diff; i++) {
      const dayDate = dayjs(fromDate).add(i, 'day');
      const day = dayDate.date();

      days.push(day);
    }

    return { days, month, year };
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  getOpenAttendances,
  startAttendanceEntry,
  closeAttendance,
  getVerificationImageUploadUrl,
  getAttendances,
  createAttendanceLabel,
  updateAttendanceLabel,
  archiveAttendanceLabel,
  getAttendanceLabels,
  getMemberLastOut,
  getDaySummary,
  createWorkHourTotals,
  getDatesWithTimezone,
  getDayRange,
  updateMemberDailySummary,
  updateMemberWeeklySummary,
  getWeeklySummaries,
  getMonthlySummary,
  getWeeklySummariesForMonth,
  getEmployeeType,
  getAttendanceSettings,
  getDailySummaryByDateAndMemberId,
  updateAttendanceSettings,
  getMemberAttendanceStats,
  clockOutAndInOpenAttendances,
  getOvertimeFromAttendance,
  hasOvertime,
  getWorkedFromAttendance,
  recalculateAttendanceMvs,
  recalculateAttendanceDailyMvs,
  getTotalTrackedHours,
  recalculateAttendanceWeeklyMvs,
  getTotalTrackedHoursForWeekly,
  closePreviousDayAttendance,
  groupAttendancesBasedOnWeekNumber,
  setAttendanceVerificationImage,
  getAttendanceDaySummaries,
  getDateRange,
};

export default exportFunctions;
