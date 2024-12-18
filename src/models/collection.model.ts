import { ContactId, ContactPicId } from './contact.model';
import { UserId } from './user.model';
import { CompanyId, CompanyMemberId } from './company.model';
import {
  CollectionPaymentTypes,
  CollectionStatusTypes,
  UpdateCollectionPaymentTypeInput,
  CreateCollectionInput,
  CollectionRemindIntervalTypes,
} from '@generated/graphql-types';

export type CollectionPublicId = string;
export type CollectionId = number;
export type CollectionPeriodPublicId = string;
export type CollectionPeriodId = number;
export type CollectionPaymentPublicId = string;
export type CollectionPaymentId = number;
export type CollectionReminderReadPublicId = string;
export type CollectionReminderReadId = number;
export type CollectionRemindOnDaysPublicId = string;
export type CollectionRemindOnDaysId = number;
export type PaymentOrderId = string;

export type CollectionModel = {
  id: CollectionId;
  id_text: CollectionPublicId;
  ref_no: string;
  contact_id: ContactId;
  title: string;
  description: string;
  payable_amount: number;
  periods: number;
  remind_type: number;
  due_date: string;
  invoice: string;
  file_name: string;
  invoice_file_size: number;
  start_month: string;
  end_month: string;
  remind_interval: string;
  remind_on_date: number;
  remind_on_month: number;
  remind_end_on: string;
  sms_notify: boolean;
  whatsapp_notify: boolean;
  voice_notify: boolean;
  email_notify: boolean;
  notify_pics: string | number[];
  status: CollectionStatusTypes;
  is_draft: boolean;
  active: boolean;
  archive: boolean;
  archive_at: string;
  created_by: UserId;
  updated_by: UserId;
  deleted_by: UserId;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  payment_type: CollectionPaymentTypes;
  sp_recurring_id: string;
  last_remind_on: string;
};

export type CollectionPeriodModel = {
  id: CollectionPeriodId;
  id_text: CollectionPeriodPublicId;
  receivable_id: CollectionId;
  period: number;
  month: string;
  amount: number;
  due_date: string;
  last_remind_on: string;
  payment_accept_at: string;
  status: number;
  created_at: string;
  updated_at: string;
  webhook_data: string;
  deleted_at: string;
};

export type CollectionPaymentModel = {
  id: CollectionPaymentId;
  id_text: CollectionPaymentPublicId;
  receivable_id: CollectionId;
  receivable_period_id: CollectionPeriodId;
  contact_id: ContactId;
  pic_id: ContactPicId;
  member_id: CompanyMemberId;
  payment_proof: string;
  payment_proof_file_name: string;
  payment_proof_file_size: number;
  receipt: string;
  receipt_file_name: string;
  receipt_file_size: number;
  remarks: string;
  status: number;
  created_by: UserId;
  updated_by: UserId;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  deleted_by: UserId;
};

export type CollectionReminderReadModel = {
  id: CollectionReminderReadId;
  id_text: CollectionReminderReadPublicId;
  user_id: UserId;
  reminder_id: CollectionId;
  created_at: string;
};

export type CollectionRemindOnDaysModel = {
  id: CollectionRemindOnDaysId;
  id_text: CollectionRemindOnDaysPublicId;
  receivable_id: CollectionId;
  day: number;
  created_at: string;
  updated_at: string;
};
export type CollectionMessageLogModel = {
  id: number;
  id_text: string;
  collection_id: CollectionId;
  type: string;
  email_address: string;
  phone: string;
  timestamp: string;
};

export type CollectionPaymentLinkModel = {
  collectionId: CollectionId;
  shortUrlId: number;
  shortId: string;
};

export interface UpdateCollectionPaymentTypePayload
  extends UpdateCollectionPaymentTypeInput {}

export interface CreateCollectionPayload extends CreateCollectionInput {
  file_name: string;
  invoice_file_size: number;
  invoice: string;
}

export interface UpdateCollectionPayload {
  ref_no: string;
  title: string;
  description: string;
  due_date: string;
  remind_interval: CollectionRemindIntervalTypes;
  start_month: string;
  sms_notify: boolean;
  whatsapp_notify: boolean;
  voice_notify: boolean;
  email_notify: boolean;
  notify_pics: UserId[];
  remind_end_on: string;
  remind_on_date: number;
  remind_on_month: number;
}

export interface CreateReceivablePeriodPayload {
  receivableId: CollectionId;
  period: number;
  month: string;
  amount: number;
  dueDate: string;
  status: number;
}

// const receivablePeriodsPayload = {
//   receivable_id: collection.id,
//   period,
//   month: periodDue.format('YYYY-MM-01'),
//   amount: monthAmount[periodKey],
//   due_date: periodDue.format(`YYYY-MM-${due}`),
//   status: 1,
// };

export interface CreateCollectionPaymentPayload {
  receivable_id: CollectionId;
  receivable_period_id: CollectionPeriodId;
  contact_id: ContactId;
  pic_id: ContactPicId;
  payment_proof: string;
  payment_proof_file_name: string;
  payment_proof_file_size: number;
  created_by: UserId;
  status: number;
}

export interface UpdatePaymentStatusApprovedPayload {
  status: number;
  member_id: CompanyMemberId;
}

export interface UpdatePaymentStatusRejectedPayload
  extends UpdatePaymentStatusApprovedPayload {
  remarks: string;
}

export interface CreateCollectionPaymentReceiptPayload {
  receipt: string;
  receipt_file_name: string;
  receipt_file_size: number;
  status: number;
  updated_by: UserId;
}

export type CollectionPaymentSummaryModel = {
  id: number;
  id_text: string;
  ref_no: string;
  title: string;
  description: string;
  payable_amount: number;
  due_date: string;
  periods: number;
  sp_recurring_id: string;
  contact_name: string;
  company_name: string;
};

export type PaymentOrderModel = {
  id_text: string;
  status: number;
  transaction_id: string;
  collection_id: CollectionId;
  created_at: string;
  modified_at: string;
  data: string;
};

export interface PaymentOrderDetailModel extends PaymentOrderModel {
  company_id: CompanyId;
  collection_id: CollectionId;
  contact_id: ContactId;
}

export type CompletePaymentTransactionResult = {
  order_id: string;
  status: number;
  transaction_id: string;
  ref_no: string;
  title: string;
  description: string;
  payable_amount: number;
  due_date: string;
  periods: number;
  contact_name: string;
  company_name: string;
};

export type CollectionActivityLogModel = {
  actionType: string;
  createdBy: UserId;
  createdAt: string;
  collectionId: CollectionId;
  currentValues: JSON;
  previousValues: JSON;
  changedValues: JSON;
};
