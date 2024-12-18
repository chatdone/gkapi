import knex from '@db/knex';
import {
  CollectionId,
  CollectionModel,
  CollectionPaymentId,
  CollectionPaymentModel,
  CollectionPaymentSummaryModel,
  CollectionPeriodId,
  CollectionPeriodModel,
  CollectionReminderReadId,
  CollectionReminderReadModel,
  CollectionRemindOnDaysModel,
  CreateCollectionPayload,
  CreateCollectionPaymentPayload,
  CreateCollectionPaymentReceiptPayload,
  PaymentOrderId,
  PaymentOrderDetailModel,
  UpdateCollectionPayload,
  UpdateCollectionPaymentTypePayload,
  UpdatePaymentStatusApprovedPayload,
  UpdatePaymentStatusRejectedPayload,
  CompletePaymentTransactionResult,
  CollectionMessageLogModel,
  CollectionPaymentLinkModel,
  CreateReceivablePeriodPayload,
} from '@models/collection.model';
import dayjs from 'dayjs';
import { AuditLogModel, ContactId } from '@models/contact.model';
import { AffectedRowsResult } from '@models/task.model';
import { UserId } from '@models/user.model';
import _ from 'lodash';
import { EventCollectionPayload } from '@models/event-manager.model';
import { SenangPayTransactionModel } from '@models/senangpay.model';
import {
  currentDay,
  getCurrentMonth,
} from '../../services/event-manager/event-manager.helper';
import { TransactionId } from 'aws-sdk/clients/qldbsession';
import { camelize } from '@data-access/utils';
import { TableNames } from '@db-tables';
import { CompanyMemberId } from '@models/company.model';

export const PAYMENT_METHODS = {
  MANUAL: 0,
  SENANGPAY: 1,
};

export const CollectionPeriodStatusTypes = {
  PENDING: 1,
  PAID: 2,
};

export const CollectionPaymentStatusTypes = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
};

export const CollectionStatusTypes = {
  PENDING: 1,
  PAID: 2,
};

export const CollectionRemindTypes = {
  FULL: 1,
  INSTALMENT: 2,
};
const modifyPaymentType = async ({
  id,
  payload,
}: {
  id: CollectionId;
  payload: UpdateCollectionPaymentTypePayload;
}): Promise<CollectionModel | Error> => {
  try {
    const updateRow = await knex('receivable_reminders')
      .where('id', id)
      .update(payload);

    const res = await knex('receivable_reminders').where('id', id).select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollection = async ({
  dbPayload,
  contactId,
}: {
  dbPayload: CreateCollectionPayload;
  contactId: ContactId;
}): Promise<CollectionModel | Error> => {
  try {
    const payload = {
      ...dbPayload,
      contact_id: contactId,
      status: 1,
      created_at: knex.fn.now(),
    };
    const insertedRow = await knex('receivable_reminders')
      .insert(payload)
      .select(knex.raw(`LAST_INSERT_ID()`));
    const res = await knex('receivable_reminders')
      .where('id', insertedRow)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCollections = async ({
  collectionIds,
  userId,
}: {
  collectionIds: CollectionId[];
  userId: UserId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('receivable_reminders')
      .whereIn('id', collectionIds)
      .update({ deleted_at: knex.fn.now(), deleted_by: userId });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollection = async ({
  collectionId,
  payload,
}: {
  collectionId: CollectionId;
  payload: UpdateCollectionPayload | any;
}): Promise<CollectionModel | Error> => {
  try {
    await knex('receivable_reminders')
      .where('id', collectionId)
      .update({ ...payload, updated_at: knex.fn.now() });

    const res = await knex('receivable_reminders')
      .where('id', collectionId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createRemindOnDays = async ({
  payload,
}: {
  payload: any;
}): Promise<void | Error> => {
  try {
    Promise.all(
      _.map(payload, async (p) => {
        await knex('remind_on_days').insert({
          ...p,
          created_at: knex.fn.now(),
        });
      }),
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteRemindOnDays = async (
  collectionId: CollectionId,
): Promise<void | Error> => {
  try {
    const res = await knex('remind_on_days')
      .where('receivable_id', collectionId)
      .del();
  } catch (error) {
    return Promise.reject(error);
  }
};

const createReceivablePeriods = async (
  payload: CreateReceivablePeriodPayload,
): Promise<void | Error> => {
  try {
    const res = await knex('receivable_periods').insert({
      receivable_id: payload.receivableId,
      period: payload.period,
      month: payload.month,
      amount: payload.amount,
      due_date: payload.dueDate,
      status: payload.status,
      created_at: knex.fn.now(),
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateDueDate = async ({
  dueDate,
  collectionId,
}: {
  dueDate: string;
  collectionId: CollectionId;
}): Promise<void | Error> => {
  try {
    const res = await knex('receivable_reminders')
      .where('id', collectionId)
      .update({
        due_date: dueDate,
        updated_at: knex.fn.now(),
      });
  } catch (error) {
    return Promise.reject(error);
  }
};
const deactivateCollections = async ({
  userId,
  collectionIds,
}: {
  userId: UserId;
  collectionIds: CollectionId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('receivable_reminders')
      .whereIn('id', collectionIds)
      .update({ active: 0, updated_by: userId, updated_at: knex.fn.now() });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const activateCollections = async ({
  userId,
  collectionIds,
}: {
  userId: UserId;
  collectionIds: CollectionId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('receivable_reminders')
      .whereIn('id', collectionIds)
      .update({ active: 1, updated_by: userId, updated_at: knex.fn.now() });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const archiveCollections = async ({
  userId,
  collectionIds,
}: {
  userId: UserId;
  collectionIds: CollectionId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('receivable_reminders')
      .whereIn('id', collectionIds)
      .update({
        archive: 1,
        updated_by: userId,
        updated_at: knex.fn.now(),
        archived_at: knex.fn.now(),
      });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const unarchiveCollections = async ({
  userId,
  collectionIds,
}: {
  userId: UserId;
  collectionIds: CollectionId[];
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('receivable_reminders')
      .whereIn('id', collectionIds)
      .update({
        archive: 0,
        updated_by: userId,
        updated_at: knex.fn.now(),
        archived_at: knex.raw(`NULL`),
      });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const collectionReminderRead = async ({
  userId,
  collectionId,
}: {
  userId: UserId;
  collectionId: CollectionId;
}): Promise<CollectionReminderReadModel | Error> => {
  try {
    const createdRow = (await knex('reminder_read')
      .insert({
        reminder_id: collectionId,
        user_id: userId,
        created_at: knex.fn.now(),
      })
      .select(knex.raw(`LAST_INSERT_ID()`))) as CollectionReminderReadId;

    const res = await knex('reminder_read').where('id', createdRow).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPeriods = async (
  collectionId: CollectionId,
): Promise<(CollectionPeriodModel | Error)[]> => {
  try {
    const res = await knex('receivable_periods')
      .where('receivable_id', collectionId)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPeriod = async (
  collectionPeriodId: CollectionPeriodId,
): Promise<CollectionPeriodModel | Error> => {
  try {
    const res = await knex('receivable_periods')
      .where('id', collectionPeriodId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionRemindOnDays = async ({
  queryBy,
}: {
  queryBy: any;
}): Promise<(CollectionRemindOnDaysModel | Error)[]> => {
  try {
    const res = await knex('remind_on_days').where(queryBy).select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollectionPeriodStatus = async ({
  collectionPeriodId,
  status,
}: {
  collectionPeriodId: CollectionPeriodId;
  status: number;
}): Promise<CollectionPeriodModel | Error> => {
  try {
    const row = (await knex('receivable_periods')
      .where('id', collectionPeriodId)
      .update('status', status)) as number;

    const res = await knex('receivable_periods')
      .where('id', collectionPeriodId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeCollectionDraftStatus = async ({
  collectionId,
  userId,
}: {
  collectionId: CollectionId;
  userId: UserId;
}): Promise<AffectedRowsResult | Error> => {
  try {
    const res = await knex('receivable_reminders')
      .where('id', collectionId)
      .update({ is_draft: 0, updated_by: userId, updated_at: knex.fn.now() });
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollectionPaymentRecord = async (
  payload: CreateCollectionPaymentPayload,
): Promise<CollectionPaymentModel | Error> => {
  try {
    const insert = await knex('receivable_payments').insert({
      ...payload,
      created_at: knex.fn.now(),
    });

    const res = await knex('receivable_payments')
      .where('id', _.head(insert))
      .select();
    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCollectionPaymentRecord = async ({
  collectionPaymentId,
  userId,
}: {
  collectionPaymentId: CollectionPaymentId;
  userId: UserId;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    await knex('receivable_payments')
      .where('id', collectionPaymentId)
      .update({ deleted_at: knex.fn.now(), deleted_by: userId });

    const res = await knex('receivable_payments').where(
      'id',
      collectionPaymentId,
    );

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updatePaymentStatusApproved = async ({
  payload,
  userId,
  collectionPeriodId,
  collectionPaymentId,
}: {
  payload: UpdatePaymentStatusApprovedPayload;
  userId: UserId;
  collectionPeriodId: CollectionPeriodId;
  collectionPaymentId: CollectionPaymentId;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    await knex('receivable_payments')
      .where('id', collectionPaymentId)
      .update({
        ...payload,
        updated_by: userId,
        updated_at: knex.fn.now(),
      });

    await knex('receivable_periods')
      .where('id', collectionPeriodId)
      .update({ status: 2, updated_at: knex.fn.now() });

    const res = await knex('receivable_payments')
      .where('id', collectionPaymentId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updatePaymentStatusRejected = async ({
  payload,
  userId,
  collectionPaymentId,
}: {
  payload: UpdatePaymentStatusRejectedPayload;
  userId: UserId;
  collectionPaymentId: CollectionPaymentId;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    await knex('receivable_payments')
      .where('id', collectionPaymentId)
      .update({
        ...payload,
        updated_by: userId,
        updated_at: knex.fn.now(),
      });

    const res = await knex('receivable_payments')
      .where('id', collectionPaymentId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPaymentByCollectionIdPeriodId = async ({
  collectionId,
  collectionPeriodId,
}: {
  collectionId: CollectionId;
  collectionPeriodId: CollectionPeriodId;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    const res = await knex('receivable_payments')
      .where({
        receivable_id: collectionId,
        receivable_period_id: collectionPeriodId,
      })
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const listCollectionsByContactId = async (
  contactId: ContactId,
): Promise<(CollectionModel | Error)[]> => {
  try {
    const res = await knex('receivable_reminders')
      .where('contact_id', contactId)
      .whereNull('deleted_at')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPeriodPayments = async ({
  collectionId,
  periodId,
}: {
  collectionId: CollectionId;
  periodId: CollectionPeriodId;
}): Promise<(CollectionPaymentModel | Error)[]> => {
  try {
    const res = await knex('receivable_payments')
      .where({ receivable_id: collectionId, receivable_period_id: periodId })
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollectionPaymentReceipt = async ({
  collectionPaymentId,
  collectionPeriodId,
  payload,
}: {
  collectionPaymentId: CollectionPaymentId;
  collectionPeriodId: CollectionPeriodId;
  payload: CreateCollectionPaymentReceiptPayload;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    await knex('receivable_payments')
      .where('id', collectionPaymentId)
      .update({ ...payload, updated_at: knex.fn.now() });

    await knex('receivable_periods')
      .where('id', collectionPeriodId)
      .update({ status: 2, updated_at: knex.fn.now() });

    const res = await knex('receivable_payments')
      .where('id', collectionPaymentId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCollectionPeriodDueDate = async ({
  collectionId,
  dueDate,
}: {
  collectionId: CollectionId;
  dueDate: string;
}): Promise<void | Error> => {
  try {
    const res = await knex('receivable_periods')
      .where('receivable_id', collectionId)
      .update('due_date', dueDate);
  } catch (error) {
    Promise.reject('error');
  }
};

const getWeeklyReminders = async ({
  remindType,
}: {
  remindType: number;
}): Promise<(EventCollectionPayload | Error)[]> => {
  try {
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
        'rr.id as id',
        'rr.ref_no as ref_no',
        'rr.title as title',
        'rp.due_date as due_date',
        'rr.remind_type as remind_type',
        'rr.payable_amount as payable_amount',
        'rr.sms_notify as sms_notify',
        'rr.whatsapp_notify as whatsapp_notify',
        'rr.voice_notify as voice_notify',
        'rr.email_notify as email_notify',
        'rr.id_text as id_text',
        'rr.payment_type as payment_type',
        'rr.description as description',
        'rr.notify_pics as notify_pics',
        'rr.invoice as invoice',
        'rr.file_name as file_name',
        'rr.last_remind_on as last_remind_on',
        'rr.contact_id as contact_id',
        'rr.created_by as created_by',
        'rr.remind_interval as remind_interval',

        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
        `days.day as day`,
      )
      .select(knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'))
      .select(
        knex.raw(
          `IF(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
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
    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')
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
        'rr.remind_interval': 'Month',
      })

      .select(
        'rr.id as id',
        'rr.ref_no as ref_no',
        'rr.title as title',
        'rp.due_date as due_date',
        'rr.remind_type as remind_type',
        'rr.payable_amount as payable_amount',
        'rr.sms_notify as sms_notify',
        'rr.whatsapp_notify as whatsapp_notify',
        'rr.voice_notify as voice_notify',
        'rr.email_notify as email_notify',
        'rr.id_text as id_text',
        'rr.payment_type as payment_type',
        'rr.description as description',
        'rr.notify_pics as notify_pics',
        'rr.invoice as invoice',
        'rr.file_name as file_name',
        'rr.last_remind_on as last_remind_on',
        'rr.contact_id as contact_id',
        'rr.created_by as created_by',
        'rr.remind_interval as remind_interval',

        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
      )

      .select(knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'))
      .select(
        knex.raw(
          `IF(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
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
    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')

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
        'rr.id as id',
        'rr.ref_no as ref_no',
        'rr.title as title',
        'rp.due_date as due_date',
        'rr.remind_type as remind_type',
        'rr.payable_amount as payable_amount',
        'rr.sms_notify as sms_notify',
        'rr.whatsapp_notify as whatsapp_notify',
        'rr.voice_notify as voice_notify',
        'rr.email_notify as email_notify',
        'rr.id_text as id_text',
        'rr.payment_type as payment_type',
        'rr.description as description',
        'rr.notify_pics as notify_pics',
        'rr.invoice as invoice',
        'rr.file_name as file_name',
        'rr.last_remind_on as last_remind_on',
        'rr.contact_id as contact_id',
        'rr.created_by as created_by',
        'rr.remind_interval as remind_interval',

        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
      )
      .select(knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'))
      .select(
        knex.raw(
          `IF(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
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
    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')

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
        `DATE_FORMAT(${
          remindType === 2 ? 'rp' : 'rr'
        }.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(),'%Y-%m-%d')`,
      )
      .select(
        'rr.id as id',
        'rr.ref_no as ref_no',
        'rr.title as title',
        'rp.due_date as due_date',
        'rr.remind_type as remind_type',
        'rr.payable_amount as payable_amount',
        'rr.sms_notify as sms_notify',
        'rr.whatsapp_notify as whatsapp_notify',
        'rr.voice_notify as voice_notify',
        'rr.email_notify as email_notify',
        'rr.id_text as id_text',
        'rr.payment_type as payment_type',
        'rr.description as description',
        'rr.notify_pics as notify_pics',
        'rr.invoice as invoice',
        'rr.file_name as file_name',
        'rr.last_remind_on as last_remind_on',
        'rr.contact_id as contact_id',
        'rr.created_by as created_by',
        'rr.remind_interval as remind_interval',

        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
      )
      .select(knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'))
      .select(
        knex.raw(
          `IF(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
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
    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .leftJoin({ rp: 'receivable_periods' }, 'rp.receivable_id', 'rr.id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ com: 'companies' }, 'com.id', 'c.company_id')

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
        `DATE_ADD(DATE_FORMAT(${
          remindType === 2 ? 'rp' : 'rr'
        }.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(),'%Y-%m-%d')`,
      )
      .select(
        'rr.id as id',
        'rr.ref_no as ref_no',
        'rr.title as title',
        'rp.due_date as due_date',
        'rr.remind_type as remind_type',
        'rr.payable_amount as payable_amount',
        'rr.sms_notify as sms_notify',
        'rr.whatsapp_notify as whatsapp_notify',
        'rr.voice_notify as voice_notify',
        'rr.email_notify as email_notify',
        'rr.id_text as id_text',
        'rr.payment_type as payment_type',
        'rr.description as description',
        'rr.notify_pics as notify_pics',
        'rr.invoice as invoice',
        'rr.file_name as file_name',
        'rr.last_remind_on as last_remind_on',
        'rr.contact_id as contact_id',
        'rr.created_by as created_by',
        'rr.remind_interval as remind_interval',

        'rr.id as collection_id',
        'com.id as company_id',
        'com.name as company_name',
        'rp.amount as total_due',
      )
      .select(knex.raw('CONCAT("[", GROUP_CONCAT(rp.id),"]") as period_ids'))
      .select(
        knex.raw(
          `IF(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_on_due`,
        ),
        knex.raw(
          `IF(DATE_ADD(DATE_FORMAT(${
            remindType === 2 ? 'rp' : 'rr'
          }.due_date, '%Y-%m-%d'), INTERVAL 1 DAY) = DATE_FORMAT(NOW(), '%Y-%m-%d'), true, false) as is_overdue`,
        ),
      );

    const filtered = _.filter(res, (r) => r.id !== null);

    return filtered;
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateLastRemindOn = async (record: EventCollectionPayload) => {
  try {
    await knex('receivable_reminders')
      .where({ id: record.id })
      .update({ last_remind_on: new Date() });
    if (record.period_ids) {
      const periodIds = JSON.parse(record.period_ids);
      for (let i = 0; i < periodIds.length; i++) {
        await knex('receivable_periods')
          .where({ id: periodIds[i] })
          .update({ last_remind_on: new Date() });
      }
    }

    return null;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionForPayment = async (
  id: number,
): Promise<CollectionPaymentSummaryModel | Error> => {
  try {
    const res = await knex
      .from({ rr: 'receivable_reminders' })
      .innerJoin({ c: 'contacts' }, 'rr.contact_id', 'c.id')
      .innerJoin({ co: 'companies' }, 'c.company_id', 'co.id')
      .where('rr.id', id)
      .select([
        'rr.id',
        'rr.id_text',
        'rr.ref_no',
        'rr.title',
        'rr.description',
        'rr.payable_amount',
        'rr.due_date',
        'rr.periods',
        'rr.sp_recurring_id',
        'c.name as contact_name',
        'co.name as company_name',
      ]);
    return _.head(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getPaymentOrderDetail = async (
  orderId: PaymentOrderId,
): Promise<PaymentOrderDetailModel | Error> => {
  try {
    const res = await knex
      .from({ po: 'payment_orders' })
      .innerJoin({ rr: 'receivable_reminders' }, 'po.collection_id', 'rr.id')
      .innerJoin({ ct: 'contacts' }, 'rr.contact_id', 'ct.id')
      .innerJoin({ cc: 'companies' }, 'ct.company_id', 'cc.id')
      .where('po.id_text', orderId)
      .select(
        'po.*',
        'cc.id as company_id',
        'rr.id as collection_id',
        'ct.id as contact_id',
      );

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createPaymentOrder = async ({
  collectionId,
  jsonDataString,
  orderId,
}: {
  collectionId: CollectionId;
  orderId: string;
  jsonDataString: string;
}): Promise<number[]> => {
  try {
    const res = await knex('payment_orders').insert({
      collection_id: collectionId,
      id_text: orderId,
      data: jsonDataString,
    });

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

const completePaymentTransaction = async ({
  statusId,
  orderId,
  transactionId,
  data,
}: {
  statusId: number;
  orderId: string;
  transactionId: string;
  data: SenangPayTransactionModel;
}): Promise<CompletePaymentTransactionResult | Error> => {
  try {
    const updateRes = await knex('payment_orders')
      .update({
        status: statusId,
        transaction_id: transactionId,
        data: JSON.stringify(data),
      })
      .where('id_text', orderId);
    if (updateRes === 0) {
      throw new Error('Error updating transaction');
    }

    const res = await knex
      .from({ po: 'payment_orders' })
      .leftJoin({ rr: 'receivable_reminders' }, 'rr.id', 'po.collection_id')
      .leftJoin({ c: 'contacts' }, 'c.id', 'rr.contact_id')
      .leftJoin({ cp: 'companies' }, 'cp.id', 'c.company_id')
      .where('po.id_text', orderId)
      .select(
        'po.id_text as order_id',
        'po.status',
        'po.transaction_id',
        'rr.ref_no',
        'rr.title',
        'rr.description',
        'rr.payable_amount',
        'rr.due_date',
        'rr.periods',
        'c.name as contact_name',
        'cp.name as company_name',
      );

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCollectionByTransactionId = async (
  transactionId: string,
): Promise<CollectionModel> => {
  try {
    const res = await knex
      .from({ po: 'payment_orders' })
      .innerJoin({ rr: 'receivable_reminders' }, 'po.collection_id', 'rr.id')
      .where('po.transaction_id', transactionId)
      .select('rr.*');
    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const setCollectionPeriodStatus = async ({
  collectionId,
  period,
  status,
}: {
  collectionId: CollectionId;
  period: number;
  status: number;
}): Promise<number> => {
  try {
    const update = await knex('receivable_periods')
      .update({
        status,
      })
      .where({ receivable_id: collectionId, period });

    return update;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const setCollectionStatus = async ({
  collectionId,
  status,
}: {
  collectionId: CollectionId;
  status: number;
}): Promise<number> => {
  try {
    const update = await knex('receivable_reminders')
      .update({
        status,
      })
      .where('id', collectionId);
    return update;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createCollectionPayment = async ({
  collectionId,
  periodId,
  contactId,
  status,
  transactionId,
}: {
  collectionId: CollectionId;
  periodId: CollectionPeriodId;
  contactId: ContactId;
  status: number;
  transactionId: string;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    const insert = await knex('receivable_payments').insert({
      receivable_id: collectionId,
      receivable_period_id: periodId,
      contact_id: contactId,
      status,
      transaction_id: transactionId,
    });

    const res = await knex
      .from('receivable_payments')
      .where('id', _.head(insert))
      .select();
    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateCollectionPeriod = async ({
  periodId,
  dueDate,
  status,
  webhookData,
}: {
  periodId: CollectionPeriodId;
  dueDate: string;
  status: number;
  webhookData: Record<string, unknown>;
}): Promise<number> => {
  try {
    const update = await knex('receivable_periods')
      .update({
        due_date: dueDate,
        status,
        updated_at: knex.fn.now(),
        webhook_data: JSON.stringify(webhookData),
      })
      .where('id', periodId);
    return update;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPaymentByTransactionId = async ({
  transactionId,
}: {
  transactionId: TransactionId;
}): Promise<CollectionPaymentModel | Error> => {
  try {
    const res = await knex('receivable_payments')
      .where({
        transaction_id: transactionId,
      })
      .select();
    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionMessageLogs = async (
  collectionId: CollectionId,
): Promise<(CollectionMessageLogModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.MESSAGE_LOGS)
      .where({ collection_id: collectionId })
      .select();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollectionMessageLog = async (payload: {
  collection_id: CollectionId;
  type: string;
  email_address?: string;
  phone?: string;
  status: number;
}): Promise<CollectionMessageLogModel | Error> => {
  try {
    const insert = await knex
      .from(TableNames.MESSAGE_LOGS)
      .insert({ ...payload, timestamp: knex.fn.now() });

    const res = await knex
      .from(TableNames.MESSAGE_LOGS)
      .where('id', _.head(insert))
      .select();

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionPaymentLink = async (
  collectionId: CollectionId,
): Promise<CollectionPaymentLinkModel | Error> => {
  try {
    const res = await knex
      .from({ cpl: TableNames.PAYMENT_LINKS })
      .leftJoin({ su: 'short_urls' }, 'su.id', 'cpl.short_url_id')
      .where({ collection_id: collectionId })
      .select('su.short_id', 'cpl.collection_id', 'cpl.short_url_id');

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createCollectionPaymentLink = async (
  collectionId: CollectionId,
  shortUrlId: number,
) => {
  try {
    await knex
      .from(TableNames.PAYMENT_LINKS)
      .insert({ collection_id: collectionId, short_url_id: shortUrlId });

    const res = await knex
      .from(TableNames.PAYMENT_LINKS)
      .where({ collection_id: collectionId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject();
  }
};

const getCollectionAssignees = async ({
  collectionId,
}: {
  collectionId: CollectionId;
}) => {
  try {
    const res = await knex
      .from({ ca: TableNames.COLLECTION_ASSIGNEES })
      .innerJoin({ cm: TableNames.COMPANY_MEMBERS }, 'ca.member_id', 'cm.id')
      .where('ca.collection_id', collectionId)
      .select('cm.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignMembersToCollection = async ({
  collectionId,
  memberIds,
}: {
  collectionId: CollectionId;
  memberIds: CompanyMemberId[];
}): Promise<CollectionModel> => {
  try {
    await knex(TableNames.COLLECTION_ASSIGNEES)
      .insert(
        memberIds.map((mid) => ({
          member_id: mid,
          collection_id: collectionId,
        })),
      )
      .onConflict(['member_id', 'collection_id'])
      .merge();

    const res = await knex
      .from(TableNames.COLLECTIONS)
      .where('id', collectionId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeMembersFromCollection = async ({
  collectionId,
  memberIds,
}: {
  collectionId: CollectionId;
  memberIds: CompanyMemberId[];
}): Promise<CollectionModel> => {
  try {
    await knex(TableNames.COLLECTION_ASSIGNEES)
      .whereIn('member_id', memberIds)
      .del();

    const res = await knex
      .from(TableNames.COLLECTIONS)
      .where('id', collectionId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionActivityLogs = async (
  collectionId: CollectionId,
): Promise<AuditLogModel[]> => {
  const res = await knex
    .from(TableNames.AUDIT_LOGS)
    .where('table_row_id', collectionId)
    .whereIn('table_name', [
      'collections',
      'receivable_reminders',
      'collection_payments',
    ])
    .select();

  return camelize(res);
};

// Need collections that are deleted too, so it's not the same as listCollectionsByContactId
const getAllCollectionsByContactId = async (
  contactId: ContactId,
): Promise<(CollectionModel | Error)[]> => {
  try {
    const res = await knex('receivable_reminders')
      .where('contact_id', contactId)

      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  modifyPaymentType,
  createCollection,
  createRemindOnDays,
  createReceivablePeriods,
  updateDueDate,
  deleteCollections,
  updateCollection,
  deactivateCollections,
  activateCollections,
  archiveCollections,
  unarchiveCollections,
  collectionReminderRead,
  getCollectionPeriods,
  getCollectionPeriod,
  getCollectionRemindOnDays,
  updateCollectionPeriodStatus,
  removeCollectionDraftStatus,
  createCollectionPaymentRecord,
  deleteCollectionPaymentRecord,
  updatePaymentStatusApproved,
  updatePaymentStatusRejected,
  getCollectionPaymentByCollectionIdPeriodId,
  listCollectionsByContactId,
  getCollectionPeriodPayments,
  createCollectionPaymentReceipt,
  updateCollectionPeriodDueDate,
  deleteRemindOnDays,
  getWeeklyReminders,
  getMonthlyReminders,
  getYearlyReminders,
  getOnDueResults,
  updateLastRemindOn,
  getCollectionForPayment,
  getPaymentOrderDetail,
  createPaymentOrder,
  completePaymentTransaction,
  getCollectionByTransactionId,
  setCollectionStatus,
  setCollectionPeriodStatus,
  createCollectionPayment,
  updateCollectionPeriod,
  getOverdueResults,
  getCollectionPaymentByTransactionId,
  getCollectionMessageLogs,
  createCollectionMessageLog,
  getCollectionPaymentLink,
  createCollectionPaymentLink,

  getCollectionAssignees,
  assignMembersToCollection,
  removeMembersFromCollection,
  getCollectionActivityLogs,
  getAllCollectionsByContactId,
};
