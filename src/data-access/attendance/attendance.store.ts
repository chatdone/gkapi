import { camelize } from '@data-access/utils';
import knex from '@db/knex';
import {
  AttendanceDailySummaryModel,
  AttendanceId,
  AttendanceLabelId,
  AttendanceLabelModel,
  AttendanceModel,
  AttendanceWeeklySummaryModel,
  AttendanceVerificationModel,
  AttendanceVerificationS3ObjectModel,
  CreateAttendancePayload,
  UpdateMemberDailySummaryPayload,
  UpdateMemberWeeklySummaryPayload,
  AttendanceMonthlySummaryModel,
  AttendanceSettingsModel,
  AttendanceSettingsPayload,
  DateRangeModel,
} from '@models/attendance.model';
import { CompanyId, CompanyMemberId } from '@models/company.model';
import { ContactId } from '@models/contact.model';
import { TableNames } from '@db-tables';
import _ from 'lodash';

const getOpenAttendancesForCompanyMember = async ({
  companyMemberId,
}: {
  companyMemberId: CompanyMemberId;
}): Promise<AttendanceModel[] | Error> => {
  try {
    const res = await knex(TableNames.ATTENDANCES)
      .where({ company_member_id: companyMemberId })
      .whereNull('end_date')
      .select();
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createAttendanceVerification = async ({
  companyMemberId,
  s3Object,
}: {
  companyMemberId: CompanyMemberId;
  s3Object: AttendanceVerificationS3ObjectModel;
}): Promise<AttendanceVerificationModel | Error> => {
  try {
    const insertResult = await knex(TableNames.ATTENDANCE_VERIFICATIONS).insert(
      {
        company_member_id: companyMemberId,
        s3_bucket: s3Object.bucket,
        s3_key: s3Object.key,
        status: 1, // NOTE: hardcoded 1 for now, just supporting for future need to verify
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      },
    );

    const res = await knex
      .from(TableNames.ATTENDANCE_VERIFICATIONS)
      .where('id', _.head(insertResult))
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createAttendanceEntry = async ({
  payload,
}: {
  payload: CreateAttendancePayload;
}): Promise<AttendanceModel | Error> => {
  const { lat, lng, ...insertPayload } = payload;

  try {
    const insertResult = await knex(TableNames.ATTENDANCES).insert({
      ...insertPayload,
      ...(lat && lng && { location: knex.raw(`POINT(${lat}, ${lng})`) }),
      start_date: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      submitted_date: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where('id', _.head(insertResult))
      .select(
        '*',
        knex.raw(`ST_X(location) AS lat`),
        knex.raw(`ST_Y(location) AS lng`),
      );

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const closeAttendanceEntry = async ({
  id,
  commentsOut,
}: {
  id: AttendanceId;
  commentsOut?: string;
}): Promise<AttendanceModel | Error> => {
  try {
    await knex(TableNames.ATTENDANCES)
      .where('id', id)
      .update({
        end_date: knex.fn.now(),
        ...(commentsOut && { comments_out: commentsOut }),
        updated_at: knex.fn.now(),
        is_last_out: 1,
      });

    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where('id', id)
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendances = async ({
  fromDate,
  toDate,
  companyId,
  companyMemberId,
  contactId,
}: {
  fromDate: string;
  toDate: string;
  companyId?: CompanyId;
  companyMemberId?: CompanyMemberId;
  contactId?: ContactId;
}): Promise<AttendanceModel[] | Error> => {
  try {
    let conditions = `WHERE ta.start_date BETWEEN '${fromDate}' AND '${toDate}'`;
    if (companyId) {
      conditions += ` AND cm.company_id = ${companyId}`;
    }
    if (companyMemberId) {
      conditions += ` AND cm.id = ${companyMemberId}`;
    }

    if (contactId) {
      conditions += ` AND ta.contact_id = ${contactId}`;
    }

    const rawRes = await knex.raw(`
			SELECT
				ta.*,
				ST_X(ta.location) AS lat,
				ST_Y(ta.location) AS lng
			FROM attendances ta
			INNER JOIN company_members cm ON ta.company_member_id = cm.id
			${conditions}
		
		`);
    const res = _.head(rawRes) as AttendanceModel[];
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
    const insertRes = await knex(TableNames.ATTENDANCE_LABELS).insert({
      company_id: companyId,
      name,
      ...(color && { color }),
      ...(description && { description }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.ATTENDANCE_LABELS)
      .where('id', _.head(insertRes))
      .select();

    return _.head(res);
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
    await knex(TableNames.ATTENDANCE_LABELS)
      .where('id', labelId)
      .update({
        name,
        updated_at: knex.fn.now(),
        ...(color && { color }),
        ...(description && { description }),
      });

    const res = await knex
      .from(TableNames.ATTENDANCE_LABELS)
      .where('id', labelId)
      .select();

    return _.head(res);
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
    await knex(TableNames.ATTENDANCE_LABELS).where('id', labelId).update({
      updated_at: knex.fn.now(),
      archived,
    });

    const res = await knex
      .from(TableNames.ATTENDANCE_LABELS)
      .where('id', labelId)
      .select();

    return _.head(res);
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
    const res = await knex
      .from(TableNames.ATTENDANCE_LABELS)
      .where('company_id', companyId)
      .select();

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
    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where({ company_member_id: memberId, is_last_out: 1 })
      .orderBy('end_date', 'desc')
      .limit(1);

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const upsertMemberDaySummary = async ({
  companyMemberId,
  payload,
  id,
  generatedAt,
  firstAttendanceId,
  lastAttendanceId,
}: {
  companyMemberId: CompanyMemberId;
  payload: UpdateMemberDailySummaryPayload;
  id?: number;
  generatedAt?: string;
  firstAttendanceId?: number;
  lastAttendanceId?: number;
}): Promise<AttendanceDailySummaryModel | Error> => {
  try {
    if (id) {
      await knex
        .from(TableNames.ATTENDANCE_DAILY_SUMMARY_MV)
        .where({
          id,
        })
        .update({
          ...payload,
          first_attendance_id: firstAttendanceId,
          last_attendance_id: lastAttendanceId,
        });
    } else {
      await knex(TableNames.ATTENDANCE_DAILY_SUMMARY_MV).insert({
        company_member_id: companyMemberId,
        ...payload,
        generated_at: generatedAt,
        first_attendance_id: firstAttendanceId,
        last_attendance_id: lastAttendanceId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
    }

    const res = await knex
      .from(TableNames.ATTENDANCE_DAILY_SUMMARY_MV)
      .where({ company_member_id: companyMemberId, ...payload })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const upsertMemberWeekSummary = async ({
  companyMemberId,
  payload,
  id,
}: {
  companyMemberId: CompanyMemberId;
  payload: UpdateMemberWeeklySummaryPayload;
  id?: number;
}): Promise<AttendanceWeeklySummaryModel | Error> => {
  try {
    if (id) {
      await knex(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV)
        .where({ id })
        .update({
          ...payload,
          updated_at: knex.fn.now(),
        });
    } else {
      await knex(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV).insert({
        company_member_id: companyMemberId,
        ...payload,
        generated_at: knex.fn.now(),
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
    }

    const res = await knex
      .from(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV)
      .where({ company_member_id: companyMemberId, ...payload })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWeeklySummary = async ({
  companyMemberId,
  query,
}: {
  companyMemberId?: CompanyMemberId;
  query: { week: number; year: number; month: number };
}): Promise<AttendanceWeeklySummaryModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV)
      .where({ company_member_id: companyMemberId, ...query })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDailySummary = async ({
  companyMemberId,
  query,
  companyId,
}: {
  companyMemberId?: CompanyMemberId;
  companyId: CompanyId;
  query: { day: number; year: number; month: number };
}): Promise<(AttendanceDailySummaryModel | Error)[]> => {
  try {
    let res;
    if (companyMemberId) {
      res = await knex
        .from(TableNames.ATTENDANCE_DAILY_SUMMARY_MV)
        .where({ company_member_id: companyMemberId, ...query })
        .select();
    } else {
      res = await knex
        .from({ a: TableNames.ATTENDANCE_DAILY_SUMMARY_MV })
        .leftJoin({ cm: 'company_members' }, 'a.company_member_id', 'cm.id')
        .where({ ...query })
        .where('cm.company_id', companyId)
        .select();
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getWeeklySummaries = async ({
  companyMemberId,
  query,
  companyId,
}: {
  companyMemberId?: CompanyMemberId;
  query: { week: number; year: number; month: number };
  companyId: CompanyMemberId;
}): Promise<(AttendanceWeeklySummaryModel | Error)[]> => {
  try {
    let res;
    if (companyMemberId) {
      res = await knex
        .from(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV)
        .where({ company_member_id: companyMemberId, ...query })
        .select();
    } else {
      res = await knex
        .from({ a: TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV })
        .leftJoin({ cm: 'company_members' }, 'a.company_member_id', 'cm.id')
        .where('cm.company_id', companyId)
        .where({ ...query })
        .select();
    }

    return res;
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
    let res;
    if (companyMemberId) {
      res = await knex
        .from(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV)
        .where({
          company_member_id: companyMemberId,
          year: query.year,
          month: query.month,
        })
        .whereIn('week', query.week)
        .groupBy('company_member_id')
        .sum({
          tracked_total: 'tracked_total',
          worked_total: 'worked_total',
          regular_total: 'regular_total',
          overtime_total: 'overtime_total',
        })
        .select('month', 'year', 'company_member_id');
    } else if (!companyMemberId) {
      res = await knex
        .from({ a: TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV })
        .leftJoin({ cm: 'company_members' }, 'a.company_member_id', 'cm.id')
        .where('cm.company_id', companyId)
        .where({ year: query.year, month: query.month })
        .whereIn('week', query.week)
        .groupBy('company_member_id')
        .sum({
          tracked_total: 'tracked_total',
          worked_total: 'worked_total',
          regular_total: 'regular_total',
          overtime_total: 'overtime_total',
        })
        .select('month', 'year', 'company_member_id');
    } else {
      res = await knex
        .from({ a: TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV })
        .leftJoin({ cm: 'company_members' }, 'a.company_member_id', 'cm.id')
        .where('cm.company_id', companyId)
        .where({ year: query.year, month: query.month })
        .whereIn('week', query.week)
        .groupBy('company_member_id')
        // .sum({
        //   tracked_total: 'tracked_total',
        //   worked_total: 'worked_total',
        //   regular_total: 'regular_total',
        //   overtime_total: 'overtime_total',
        // })
        .select('month', 'year', 'company_member_id');
    }

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
    let res;
    if (companyMemberId) {
      res = await knex
        .from(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV)
        .where({
          company_member_id: companyMemberId,
          month: query.month,
          year: query.year,
        })
        .whereIn('week', query.week_numbers)
        .select();
    } else {
      res = await knex
        .from({ a: TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV })
        .leftJoin({ cm: 'company_members' }, 'a.company_member_id', 'cm.id')
        .where('cm.company_id', companyId)
        .where({ month: query.month, year: query.year })
        .whereIn('week', query.week_numbers)
        .select();
    }
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getMemberOpenAttendance = async ({
  memberId,
}: {
  memberId: CompanyMemberId;
}): Promise<AttendanceModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where({ company_member_id: memberId, end_date: null })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendanceSettings = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<AttendanceSettingsModel> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCE_SETTINGS)
      .where('company_id', companyId)
      .select();

    return _.head(res);
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
}): Promise<AttendanceSettingsModel> => {
  try {
    await knex(TableNames.ATTENDANCE_SETTINGS)
      .insert({
        company_id: companyId,
        ...payload,
      })
      .onConflict('company_id')
      .merge();

    const res = await knex
      .from(TableNames.ATTENDANCE_SETTINGS)
      .where('company_id', companyId)
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getMemberAttendanceStats = async (
  memberId: CompanyMemberId,
): Promise<{ tracked: number; worked: number; overtime: number }> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCE_DAILY_SUMMARY_MV)
      .where({ company_member_id: memberId })
      .select('tracked', 'worked', 'overtime');

    const total = res.reduce(
      (prev, curr) => {
        if (prev) {
          const current = {
            overtime: curr?.overtime + prev?.overtime,
            tracked: curr?.tracked + prev?.tracked,
            worked: curr?.worked + prev?.worked,
          };

          return current;
        }
      },
      { tracked: 0, worked: 0, overtime: 0 },
    );

    return total;
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
}): Promise<AttendanceDailySummaryModel | Error> => {
  try {
    const res = await knex('attendance_daily_summary_mv')
      .where({
        company_member_id: companyMemberId,
        day: day,
        month: month,
        year: year,
      })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getOpenAttendances = async (): Promise<AttendanceModel[] | Error> => {
  try {
    const res = await knex(TableNames.ATTENDANCES)
      .whereNull('end_date')
      .select();
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const closePreviousDayAttendance = async ({
  attendanceId,
  endDate,
}: {
  attendanceId: number;
  endDate: string;
}): Promise<AttendanceModel> => {
  try {
    await knex(TableNames.ATTENDANCES).where('id', attendanceId).update({
      end_date: endDate,
      comments_out: '',
      updated_at: endDate,
      is_last_out: 1,
    });

    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where('id', attendanceId)
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateOvertimeWorkedAttendanceEntry = async ({
  attendanceId,
  worked,
  overtime,
}: {
  attendanceId: AttendanceId;
  worked: number;
  overtime: number;
}): Promise<AttendanceModel> => {
  try {
    await knex
      .from(TableNames.ATTENDANCES)
      .where({ id: attendanceId })
      .update({ worked, overtime });

    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where({ id: attendanceId })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

//Partial rework
const getMemberDaySummary = async ({
  companyMemberId,
  day,
  month,
  year,
}: {
  companyMemberId: CompanyMemberId;

  day: number;
  month: number;
  year: number;
}): Promise<AttendanceDailySummaryModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCE_DAILY_SUMMARY_MV)
      .where({
        company_member_id: companyMemberId,
        day,
        month,
        year,
      })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

//Partial rework
const getMemberWeeklySummary = async ({
  companyMemberId,
  week,
  year,
}: {
  companyMemberId: CompanyMemberId;
  week: number;
  year: number;
}): Promise<AttendanceWeeklySummaryModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCE_WEEKLY_SUMMARY_MV)
      .where({
        company_member_id: companyMemberId,
        week,
        year,
      })
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendancesAll = async ({
  companyMemberId,
}: {
  companyMemberId: CompanyMemberId;
}): Promise<AttendanceModel[] | Error> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCES)
      .where({ company_member_id: companyMemberId });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const setAttendanceVerificationImageSize = async ({
  companyMemberId,
  attendanceId,
  s3Bucket,
  s3Key,
  s3ImageUrl,
  fileSize,
}: {
  companyMemberId: CompanyMemberId;
  attendanceId: AttendanceId;
  s3Bucket: string;
  s3Key: string;
  s3ImageUrl: string;
  fileSize: number;
}): Promise<AttendanceModel | Error> => {
  try {
    const updatedRow = await knex(TableNames.ATTENDANCES)
      .where({
        id: attendanceId,
        company_member_id: companyMemberId,
      })
      .update({
        s3_key: s3Key,
        s3_bucket: s3Bucket,
        image_url: s3ImageUrl,
        image_size: fileSize,
      });

    const res = await knex(TableNames.ATTENDANCES)
      .where('id', attendanceId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendanceDaySummaries = async ({
  range,
  companyMemberIds,
}: {
  range: DateRangeModel;
  companyMemberIds: CompanyMemberId[];
}): Promise<AttendanceDailySummaryModel[]> => {
  try {
    const { days, month, year } = range;

    const res = await knex
      .from(TableNames.ATTENDANCE_DAILY_SUMMARY_MV)
      .where((builder) => {
        builder.whereIn('day', days).andWhere({ month, year });
      })
      .whereIn('company_member_id', companyMemberIds)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getOpenAttendancesForCompanyMember,
  createAttendanceVerification,
  createAttendanceEntry,
  closeAttendanceEntry,
  getAttendances,
  createAttendanceLabel,
  updateAttendanceLabel,
  archiveAttendanceLabel,
  getAttendanceLabels,
  getMemberLastOut,
  upsertMemberDaySummary,
  upsertMemberWeekSummary,
  getWeeklySummary,
  getDailySummary,
  getWeeklySummaries,
  getMonthlySummary,
  getWeeklySummariesForMonth,
  getDailySummaryByDateAndMemberId,
  getMemberOpenAttendance,
  getAttendanceSettings,
  updateAttendanceSettings,
  getMemberAttendanceStats,
  getOpenAttendances,
  closePreviousDayAttendance,
  updateOvertimeWorkedAttendanceEntry,
  getMemberDaySummary,
  getMemberWeeklySummary,
  getAttendancesAll,
  setAttendanceVerificationImageSize,
  getAttendanceDaySummaries,
};
