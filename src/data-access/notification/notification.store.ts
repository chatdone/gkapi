import knex from '@db/knex';
import _ from 'lodash';

import { TaskNotificationReminderModel } from '@models/notification.model';
import { TaskBoardModel, TaskId, TaskModel } from '@models/task.model';
import { ContactModel } from '@models/contact.model';
import { EventCollectionPayload } from '@models/event-manager.model';
import dayjs from 'dayjs';
import {
  currentDay,
  getCurrentMonth,
} from '@services/event-manager/event-manager.helper';
import logger from '@tools/logger';
import { TableNames } from '@db-tables';

export const TaskTypes = [
  'MemberRemovedFromJob',
  'PICAssignedToJob',
  'PICRemovedFromJob',
  'MemberAssignedToCard',
  'MemberRemovedFromCard',
  'PICAssignedToCard',
  'PICRemovedFromCard',
  'CommentOnCard',
  'UploadToCard',
  'CardOnDue',
  'CardOnDueMember',
  'CARD_OVERDUE_DUE_PIC',
  'CARD_OVERDUE_DUE_MEMBER',
  'CardRejected',
  'CardDone',
];

export const CollectionTypes = [
  'ReceivableReminderCreated',
  'ReceivableReminderDue',
  'ReceivableReminderOverdue',
  'ReceivablePaymentRejected',
  'ReceivablePaymentReceived',
  'ReceivableReminderCancelled',
];

const COLLECTION_TRIGGER_TIME = process.env.COLLECTION_REMINDER_TIME
  ? process.env.COLLECTION_REMINDER_TIME
  : '11:%00';

//And also project tasks reminders
const TASK_OVERDUE_TRIGGER_TIME = process.env.TASK_REMINDER_TIME
  ? process.env.TASK_REMINDER_TIME
  : '08:%00';

const DEFAULT_LOCAL_TIME = process.env.LOCAL_TIMEZONE
  ? process.env.LOCAL_TIMEZONE
  : 'Asia/Kuala_Lumpur';

const getOnDueTasks = async (): Promise<
  (TaskNotificationReminderModel | Error)[]
> => {
  try {
    const res = await knex
      .from({ t: 'cards' })
      .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
      .leftJoin({ c: 'companies' }, 'c.id', 'tb.company_id')
      .leftJoin({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'c.id')
      .where({
        't.status': 1,
        't.published': 1,
        't.deleted_at': null,
        't.archived': 0,
        'tb.category': 0,
      })
      .where((builder) => {
        builder.whereRaw(
          `DATE_FORMAT(CONVERT_TZ(t.due_date, '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00') = DATE_FORMAT(CONVERT_TZ(NOW(), '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00')`,
        );
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        'tb.id_text as taskBoardPublicId',
        'c.slug as companySlug',
        'tb.type as taskBoardType',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'c.id as companyId',
        'c.name as companyName',
        'c.logo_url as companyLogoUrl',
        't.due_reminder as dueReminder',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
      )

      .select(
        knex.raw(`DATE_FORMAT(t.due_date, '%Y-%m-%d %H:%i:00') as dueDate`),
        knex.raw(`DATE_FORMAT(t.due_date, '%Y-%m-%d %H:%i:00') as remindAt`),
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
        knex.raw(
          `DATE_FORMAT(t.due_date, '%Y-%m-%d %H:%i:00') = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00') as isOnDue`,
        ),
      );

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getReminderTasks = async (
  isProject?: boolean,
): Promise<(TaskNotificationReminderModel | Error)[]> => {
  try {
    const date = isProject ? `start_date` : `due_date`;
    const res = (await knex
      .from<TaskModel>({ t: 'cards' })
      .leftJoin<TaskBoardModel>(
        { tb: TableNames.PROJECTS },
        'tb.id',
        't.job_id',
      )
      .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
      .leftJoin({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .where({
        't.status': 1,
        't.deleted_at': null,
        't.archived': 0,
        't.published': 1,
      })
      .where((builder) => {
        builder.whereRaw(
          `DATE_SUB(DATE_FORMAT(CONVERT_TZ(t.${date}, '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00'), INTERVAL IFNULL(t.due_reminder, 0) MINUTE) = DATE_FORMAT(CONVERT_TZ(NOW(), '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00')`,
        );
      })

      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(t.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({ 't.last_remind_on': null });
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'tb.id_text as taskBoardPublicId',
        'tb.type as taskBoardType',
        'tb.company_id as companyId',
        'com.name as companyName',
        'com.slug as companySlug',
        'com.logo_url as companyLogoUrl',
        `t.${isProject ? `start_date` : `due_date`} as dueDate`,
        't.due_reminder as dueReminder',
        'tb.category as category',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
      )
      .select(
        knex.raw(`(IFNULL(t.due_reminder, 0)) = 0 as isOnDue`),
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
      )) as TaskNotificationReminderModel[];
    const filtered = _.filter(res, (r) => !r?.isOnDue);

    return filtered;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getOnDueProjectTasks = async (): Promise<
  (TaskNotificationReminderModel | Error)[]
> => {
  try {
    const res = (await knex
      .from<TaskModel>({ t: 'cards' })
      .leftJoin<TaskBoardModel>(
        { tb: TableNames.PROJECTS },
        'tb.id',
        't.job_id',
      )
      .leftJoin<ContactModel>({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .where({
        't.status': 1,
        't.published': 1,
        't.deleted_at': null,
        't.archived': 0,
        'tb.category': 1,
      })
      .where((builder) => {
        builder.whereRaw(
          `DATE_FORMAT(CONVERT_TZ(t.start_date, '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d') = DATE_FORMAT(CONVERT_TZ(NOW(), '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d')`,
        );
      })

      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(t.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({ 't.last_remind_on': null });
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'tb.id_text as taskBoardPublicId',
        'tb.type as taskBoardType',
        'tb.company_id as companyId',
        'com.name as companyName',
        'com.logo_url as companyLogoUrl',
        'com.slug as companySlug',
        't.start_date as dueDate',
        't.due_reminder as dueReminder',
        'tb.category as category',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
      )
      .select(
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
        knex.raw(
          `DATE_FORMAT(t.start_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d') as isOnDue`,
        ),
        // knex.raw(
        //   `DATE_FORMAT(CONVERT_TZ(t.start_date, '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d %H:%i:00') as startDateJp`,
        // ),
      )) as TaskNotificationReminderModel[];

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getOverdueTasks = async (
  isProject?: boolean,
): Promise<(TaskNotificationReminderModel | Error)[]> => {
  try {
    const date = isProject ? `start_date` : `due_date`;
    // IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)
    const res = (await knex
      .from<TaskModel>({ t: 'cards' })
      .leftJoin<TaskBoardModel>(
        { tb: TableNames.PROJECTS },
        'tb.id',
        't.job_id',
      )
      .leftJoin<ContactModel>({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .where({
        't.status': 1,
        't.deleted_at': null,
        't.archived': 0,
        'tb.category': isProject ? 1 : 0,
      })
      // .whereRaw(
      //   `DATE_FORMAT(CONVERT_TZ(t.start_date, '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d')`,
      // )
      .where((builder) => {
        builder.whereRaw(
          `DATE_ADD(DATE_FORMAT(CONVERT_TZ(t.${date}, '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(CONVERT_TZ(NOW(), '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)), '%Y-%m-%d')`,
        );
      })

      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(t.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({ 't.last_remind_on': null });
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'tb.id_text as taskBoardPublicId',
        'tb.type as taskBoardType',
        'tb.company_id as companyId',
        'com.name as companyName',
        'com.slug as companySlug',
        'com.logo_url as companyLogoUrl',
        `t.${date} as dueDate`,
        't.due_reminder as dueReminder',
        'tb.name as taskBoardName',
        'tb.category as category',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
      )
      .select(
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
        knex.raw(
          `DATE_ADD(DATE_FORMAT(t.${date}, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d') as isOverdue`,
        ),
      )) as TaskNotificationReminderModel[];

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateLastRemindOnTask = async (
  taskId: TaskId,
): Promise<TaskModel | Error> => {
  try {
    await knex
      .from('cards')
      .where({ id: taskId })
      .update({ last_remind_on: knex.fn.now() });

    const res = await knex.from('cards').where({ id: taskId }).select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTimezoneQuery = (columnName: string): string => {
  try {
    return `CONVERT_TZ(${columnName}, '+0:00', IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone))`;
  } catch (error) {
    logger.errorLogger.log('info', 'getTimezoneQuery', error);
    return columnName;
  }
};

const getWeeklyReminders = async ({
  remindType,
}: {
  remindType: number;
}): Promise<(EventCollectionPayload | Error)[]> => {
  try {
    const reminderTable = remindType === 2 ? 'rp' : 'rr';

    const res = (await knex
      .from({ rr: TableNames.COLLECTION_REMINDERS })
      .leftJoin(
        { rp: TableNames.COLLECTION_PERIODS },
        'rp.receivable_id',
        'rr.id',
      )
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ days: 'remind_on_days' }, 'days.receivable_id', 'rr.id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %${COLLECTION_TRIGGER_TIME}:00')`,
      )
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(rr.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({
            'rr.last_remind_on': null,
          });
      })
      .whereNotNull('rr.remind_interval')
      .where((builder) => {
        builder
          .where({ 'rr.remind_on_date': 0 })
          .orWhereNull('rr.remind_on_date');
      })
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(rr.remind_end_on, '%Y-%m-%d') >= DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhereNull('rr.remind_end_on');
      })
      .groupBy('rr.id')
      .where({
        'rr.deleted_at': null,
        'rp.deleted_at': null,
        'c.deleted_at': null,
        'days.deleted_at': null,
        'rr.remind_type': remindType,
        'rr.status': 1,
        'rp.status': 1,
        'rr.active': 1,
        'rr.is_draft': 0,
        'rr.archive': 0,
        'days.day': currentDay(),
        'rr.remind_interval': 'Week',
      })

      .select(
        'rr.*',
        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
        `days.day as day`,
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
        knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'),
        knex.raw(
          `IF(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
        ),
      )) as EventCollectionPayload[];

    const filtered = _.filter(res, (r) => r.id !== null);

    return filtered;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getMonthlyReminders = async ({
  remindType,
}: {
  remindType: number;
}): Promise<(EventCollectionPayload | Error)[]> => {
  try {
    const reminderTable = remindType === 2 ? 'rp' : 'rr';

    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %${COLLECTION_TRIGGER_TIME}:00')`,
      )
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(rr.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({
            'rr.last_remind_on': null,
          });
      })
      .whereNotNull('rr.remind_interval')
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(${getTimezoneQuery(
              'rr.remind_end_on',
            )}, '%Y-%m-%d') >= DATE_FORMAT(${getTimezoneQuery(
              'NOW()',
            )}, '%Y-%m-%d')`,
          )
          .orWhereNull('rr.remind_end_on');
      })
      .groupBy('rr.id')
      .where({
        'rr.deleted_at': null,
        'rp.deleted_at': null,
        'c.deleted_at': null,
        'rr.remind_type': remindType,
        'rr.status': 1,
        'rp.status': 1,
        'rr.active': 1,
        'rr.is_draft': 0,
        'rr.archive': 0,
        'rr.remind_on_date': dayjs().date(),
        'rr.remind_interval': 'Month',
      })

      .select(
        'rr.*',
        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
        knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'),
        knex.raw(
          `IF(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
        ),
      );

    const filtered = _.filter(res, (r) => r.id !== null);

    return filtered;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getYearlyReminders = async ({
  remindType,
}: {
  remindType: number;
}): Promise<(EventCollectionPayload | Error)[]> => {
  try {
    const reminderTable = remindType === 2 ? 'rp' : 'rr';
    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %${COLLECTION_TRIGGER_TIME}:00')`,
      )
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(rr.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({
            'rr.last_remind_on': null,
          });
      })
      .whereNotNull('rr.remind_interval')
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(rr.remind_end_on, '%Y-%m-%d') >= DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhereNull('rr.remind_end_on');
      })
      .groupBy('rr.id')
      .where({
        'rr.deleted_at': null,
        'rp.deleted_at': null,
        'c.deleted_at': null,
        'rr.remind_type': remindType,
        'rr.status': 1,
        'rp.status': 1,
        'rr.active': 1,
        'rr.is_draft': 0,
        'rr.archive': 0,
        'rr.remind_on_date': dayjs().date(),
        'rr.remind_on_month': getCurrentMonth(),
        'rr.remind_interval': 'Year',
      })

      .select(
        'rr.*',
        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
        knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'),
        knex.raw(
          `IF(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
        ),
      );

    const filtered = _.filter(res, (r) => r.id !== null);

    return filtered;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getOnDueResults = async ({
  remindType,
}: {
  remindType: number;
}): Promise<(EventCollectionPayload | Error)[]> => {
  try {
    const reminderTable = remindType === 2 ? 'rp' : 'rr';
    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %${COLLECTION_TRIGGER_TIME}:00')`,
      )
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(rr.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(),'%Y-%m-%d')`,
          )
          .orWhere({ 'rr.last_remind_on': null });
      })
      .groupBy('rr.id')
      .where({
        'rr.deleted_at': null,
        'rp.deleted_at': null,
        'c.deleted_at': null,
        'rr.status': 1,
        'rp.status': 1,
        'rr.active': 1,
        'rr.is_draft': 0,
        'rr.archive': 0,
      })
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          `${reminderTable}.due_date`,
        )}, '%Y-%m-%d') = DATE_FORMAT(${getTimezoneQuery('NOW()')},'%Y-%m-%d')`,
      )
      .select(
        'rr.*',
        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
        knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'),
        knex.raw(
          `IF(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
        ),
      );

    const filtered = _.filter(res, (r) => r.id !== null);

    return filtered;
  } catch (err) {
    return Promise.reject(err);
  }
};
const getOverdueResults = async ({
  remindType,
}: {
  remindType: number;
}): Promise<(EventCollectionPayload | Error)[]> => {
  try {
    const reminderTable = remindType === 2 ? 'rp' : 'rr';

    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %${COLLECTION_TRIGGER_TIME}:00')`,
      )
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(rr.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(),'%Y-%m-%d')`,
          )
          .orWhere({ 'rr.last_remind_on': null });
      })
      .groupBy('rr.id')
      .where({
        'rr.deleted_at': null,
        'rp.deleted_at': null,
        'c.deleted_at': null,
        'rr.status': 1,
        'rp.status': 1,
        'rr.active': 1,
        'rr.is_draft': 0,
        'rr.archive': 0,
      })
      .whereRaw(
        `DATE_ADD(DATE_FORMAT(${getTimezoneQuery(
          `${reminderTable}.due_date`,
        )}, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )},'%Y-%m-%d')`,
      )
      .select(
        'rr.*',
        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
        knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'),
        knex.raw(
          `IF(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${reminderTable}.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
        ),
      );

    const filtered = _.filter(res, (r) => r.id !== null);

    return filtered;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getOnDueTasksTimezone = async (): Promise<
  (TaskNotificationReminderModel | Error)[]
> => {
  try {
    const res = await knex
      .from({ t: 'cards' })
      .leftJoin({ tb: TableNames.PROJECTS }, 'tb.id', 't.job_id')
      .leftJoin({ c: 'companies' }, 'c.id', 'tb.company_id')
      .leftJoin({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'c.id')
      .where({
        't.status': 1,
        't.published': 1,
        't.deleted_at': null,
        't.archived': 0,
        'tb.category': 0,
      })
      .where((builder) => {
        builder.whereRaw(
          `DATE_FORMAT(${getTimezoneQuery(
            't.due_date',
          )}, '%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
            'NOW()',
          )}, '%Y-%m-%d %H:%i:00')`,
        );
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        'tb.id_text as taskBoardPublicId',
        'c.slug as companySlug',
        'tb.type as taskBoardType',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'c.id as companyId',
        'c.name as companyName',
        'c.logo_url as companyLogoUrl',
        't.due_reminder as dueReminder',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
      )

      .select(
        knex.raw(`DATE_FORMAT(t.due_date, '%Y-%m-%d %H:%i:00') as dueDate`),
        knex.raw(`DATE_FORMAT(t.due_date, '%Y-%m-%d %H:%i:00') as remindAt`),
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
        knex.raw(
          `DATE_FORMAT(t.due_date, '%Y-%m-%d %H:%i:00') = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00') as isOnDue`,
        ),
      );

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getReminderTasksTimezone = async (
  isProject?: boolean,
): Promise<(TaskNotificationReminderModel | Error)[]> => {
  try {
    const date = isProject ? `start_date` : `due_date`;
    // IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)
    const res = (await knex
      .from<TaskModel>({ t: 'cards' })
      .leftJoin<TaskBoardModel>(
        { tb: TableNames.PROJECTS },
        'tb.id',
        't.job_id',
      )
      .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
      .leftJoin({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .where({
        't.status': 1,
        't.published': 1,
        't.deleted_at': null,
        't.archived': 0,
      })
      .where((builder) => {
        builder.whereRaw(
          `DATE_SUB(DATE_FORMAT(${`${getTimezoneQuery(
            `t.${date}`,
          )}`}, '%Y-%m-%d %H:%i:00'), INTERVAL IFNULL(t.due_reminder, 0) MINUTE) = DATE_FORMAT(${getTimezoneQuery(
            'NOW()',
          )}, '%Y-%m-%d %H:%i:00')`,
        );
      })

      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(t.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({ 't.last_remind_on': null });
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'tb.id_text as taskBoardPublicId',
        'tb.type as taskBoardType',
        'tb.company_id as companyId',
        'com.name as companyName',
        'com.slug as companySlug',
        'com.logo_url as companyLogoUrl',
        `t.${isProject ? `start_date` : `due_date`} as dueDate`,
        't.due_reminder as dueReminder',
        'tb.category as category',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
        knex.raw(`(IFNULL(t.due_reminder, 0)) = 0 as isOnDue`),
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
      )) as TaskNotificationReminderModel[];
    const filtered = _.filter(res, (r) => !r?.isOnDue);

    return filtered;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getOverdueTasksTimezone = async (
  isProject?: boolean,
): Promise<(TaskNotificationReminderModel | Error)[]> => {
  try {
    const date = isProject ? `start_date` : `due_date`;
    // IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone)
    const res = (await knex
      .from<TaskModel>({ t: 'cards' })
      .leftJoin<TaskBoardModel>(
        { tb: TableNames.PROJECTS },
        'tb.id',
        't.job_id',
      )
      .leftJoin<ContactModel>({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .where({
        't.status': 1,
        't.published': 1,
        't.deleted_at': null,
        't.archived': 0,
        'tb.category': isProject ? 1 : 0,
      })
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %${TASK_OVERDUE_TRIGGER_TIME}:00')`,
      )
      .whereRaw(
        `DATE_ADD(DATE_FORMAT(${getTimezoneQuery(
          `t.${date}`,
        )}, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )}, '%Y-%m-%d')`,
      )
      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(t.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({ 't.last_remind_on': null });
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'tb.id_text as taskBoardPublicId',
        'tb.type as taskBoardType',
        'tb.company_id as companyId',
        'com.name as companyName',
        'com.slug as companySlug',
        'com.logo_url as companyLogoUrl',
        `t.${date} as dueDate`,
        't.due_reminder as dueReminder',
        'tb.name as taskBoardName',
        'tb.category as category',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
      )
      .select(
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
        knex.raw(
          `DATE_ADD(DATE_FORMAT(t.${date}, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d') as isOverdue`,
        ),
      )) as TaskNotificationReminderModel[];

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getOnDueProjectTasksTimezone = async (): Promise<
  (TaskNotificationReminderModel | Error)[]
> => {
  try {
    const res = (await knex
      .from<TaskModel>({ t: 'cards' })
      .leftJoin<TaskBoardModel>(
        { tb: TableNames.PROJECTS },
        'tb.id',
        't.job_id',
      )
      .leftJoin<ContactModel>({ con: 'contacts' }, 'con.id', 'tb.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'tb.company_id')
      .leftJoin({ cmp: 'company_profiles' }, 'cmp.company_id', 'com.id')
      .where({
        't.status': 1,
        't.published': 1,
        't.deleted_at': null,
        't.archived': 0,
        'tb.category': 1,
      })
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )} ,'%Y-%m-%d %${TASK_OVERDUE_TRIGGER_TIME}:00')`,
      )
      .whereRaw(
        `DATE_FORMAT(${getTimezoneQuery(
          't.start_date',
        )}, '%Y-%m-%d') = DATE_FORMAT(${getTimezoneQuery(
          'NOW()',
        )}, '%Y-%m-%d')`,
      )

      .where((builder) => {
        builder
          .whereRaw(
            `DATE_FORMAT(t.last_remind_on, '%Y-%m-%d') != DATE_FORMAT(NOW(), '%Y-%m-%d')`,
          )
          .orWhere({ 't.last_remind_on': null });
      })
      .select(
        't.id as id',
        't.id_text as id_text',
        't.name as name',
        't.status as status',
        'tb.id as taskBoardId',
        'tb.id_text as taskBoardPublicId',
        'tb.type as taskBoardType',
        'tb.company_id as companyId',
        'com.name as companyName',
        'com.logo_url as companyLogoUrl',
        'com.slug as companySlug',
        't.start_date as dueDate',
        't.due_reminder as dueReminder',
        'tb.category as category',
        knex.raw(
          `IF(cmp.default_timezone is null, '${DEFAULT_LOCAL_TIME}', cmp.default_timezone) as defaultTimezone`,
        ),
      )
      .select(
        knex.raw(`IF(tb.name = '', con.name, tb.name) as taskBoardName`),
        knex.raw(
          `DATE_FORMAT(t.start_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d') as isOnDue`,
        ),
      )) as TaskNotificationReminderModel[];

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getReminderTasks,
  getOnDueTasks,
  getOnDueProjectTasks,
  getOverdueTasks,
  updateLastRemindOnTask,
  getWeeklyReminders,
  getMonthlyReminders,
  getYearlyReminders,
  getOnDueResults,
  getOverdueResults,
  getOnDueTasksTimezone,
  getReminderTasksTimezone,
  getOverdueTasksTimezone,
  getOnDueProjectTasksTimezone,
};
