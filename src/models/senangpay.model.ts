import { CollectionId } from './collection.model';
import { CompanyId } from './company.model';

export type CompanySenangPayCredentialsModel = {
  id: number;
  company_id: CompanyId;
  credentials: Buffer;
};

export type CompanySenangPayCredentialsDataModel = {
  merchant_id: string;
  secret_key: string;
  email: string;
  password: string;
};

export type CompleteSenangPayTransactionPayload = {
  statusId: number;
  orderId: string;
  transactionId: string;
  message: string;
  hash: string;
  data: SenangPayTransactionModel;
  next_payment_date?: string;
};

export type SenangPayTransactionModel = {
  hash: string;
  msg: string;
  order_id: number;
  next_payment_date: number;
  transaction_id: number;
};
export type RecurringWebhookPaymentBodyPayload = {
  recurring_id: string;
  status_id: number;
  order_id: string;
  transaction_id: string;
  msg: string;
  hash: string;
  next_payment_date: number;
  payment_details: RecurringWebhookPaymentDetailsItem[];
};

export type RecurringWebhookPaymentDetailsItem = {
  payment_date: string;
  payment_date_timestamp: string; // NOTE: this is a string representation of the unix INTEGER timestamp
  payment_status: string;
  payment_transaction_reference: string;
};

export type CreateRecurringProductPayload = {
  name: string;
  price: number;
  code: string;
  recurringType: string;
  repetition: number;
  companyId: CompanyId;
  collectionId: CollectionId;
};

export interface CreateSenangPayDashboardProductPayload
  extends CreateRecurringProductPayload {
  email: string;
  password: string;
}
