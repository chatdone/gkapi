import { ContactPicId } from './contact.model';
import { TaskId } from './task.model';
import { UserId } from './user.model';

export type BillingInvoiceId = number;
export type BillingInvoiceIdText = string;

export type BillingInvoiceItemId = number;
export type BillingInvoiceItemIdText = string;

export type BillingInvoiceModel = {
  id: BillingInvoiceId;
  projectId: number;
  docNo: string;
  docDate: string;
  picId: ContactPicId;
  terms: string;
  remarks: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  totalReceived: number;
  idText: BillingInvoiceIdText;
  void: boolean;
  voidedAt: string;
  voidedBy: UserId;
};

export type BillingInvoiceItemModel = {
  id: BillingInvoiceItemId;
  invoiceId: BillingInvoiceId;
  descriptionHdr: string; // By default "Sales"
  sequence: number;
  taskId: TaskId;
  descriptionDtl: string;
  qty: number; // Default 1
  uom: string; // Default "UNIT"
  unitPrice: number;
  discountPercentage: number;
  tax: string; // DEFAULT "SV"
  taxInclusive: boolean; // DEFAULT false
  taxPercentage: number;
  taxAmount: number;
  amount: number;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  idText: BillingInvoiceItemIdText;
};

export type BillingInvoiceHistoryModel = {
  id: number;
  invoiceId: BillingInvoiceId;
  totalReceived: number;
  createdAt: string;
  createdBy: number;
};
