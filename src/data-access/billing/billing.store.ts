import { CompanyStore } from '@data-access';
import { camelize } from '@data-access/utils';
import knex from '@db/knex';
import {
  BillingInvoiceHistoryModel,
  BillingInvoiceId,
  BillingInvoiceItemId,
  BillingInvoiceItemModel,
  BillingInvoiceModel,
} from '@models/billing.model';
import { CompanyId, CompanyModel } from '@models/company.model';
import { ContactPicId } from '@models/contact.model';
import {
  AffectedRowsResult,
  ProjectId,
  ProjectModel,
  TaskId,
} from '@models/task.model';
import { UserId } from '@models/user.model';
import { CompanyService } from '@services';
import { TableNames } from '@db-tables';
import _ from 'lodash';

export type CreateBillingInvoiceInputStore = {
  projectId: ProjectId;
  docNo: string;
  docDate: string;
  picId: ContactPicId;
  terms?: number;
  remarks?: string;
  createdBy: UserId;
};

export type CreateBillingInvoiceItemInputStore = {
  invoiceId: BillingInvoiceId;
  descriptionHdr?: string; // By default "Sales"
  sequence: number;
  taskId?: TaskId;
  descriptionDtl: string; // Name or task or custom name
  qty?: number; // Default 1
  uom?: string; // Default "UNIT"
  unitPrice: number;
  discountPercentage: number;
  tax?: string; // DEFAULT "SV"
  taxInclusive?: boolean; // DEFAULT false
  taxPercentage: number;
  taxAmount: number;
  amount: number;
  createdBy: UserId;
};

export type UpdateBillingInvoiceInputStore = {
  billingInvoiceId: BillingInvoiceId;
  docNo?: string;
  docDate?: string;
  picId?: ContactPicId;
  terms?: number;
  remarks?: string;
  updatedBy: UserId;
};

export type UpdateBillingInvoiceItemInputStore = {
  invoiceItemId: BillingInvoiceItemId;
  descriptionHdr?: string; // By default "Sales"
  sequence?: number;
  taskId?: TaskId | null;
  descriptionDtl?: string;
  unitPrice?: number;
  discountPercentage?: number;
  taxInclusive?: boolean; // DEFAULT false
  taxPercentage?: number;
  taxAmount?: number;
  amount?: number;
  updatedBy?: number;
};

const createBillingInvoice = async (
  input: CreateBillingInvoiceInputStore,
): Promise<BillingInvoiceModel> => {
  try {
    const { projectId, docNo, docDate, picId, terms, remarks, createdBy } =
      input;
    const insert = await knex.from(TableNames.BILLING_INVOICES).insert({
      project_id: projectId,
      doc_no: docNo,
      doc_date: docDate,
      pic_id: picId,
      terms,
      remarks,
      created_by: createdBy,
      created_at: knex.fn.now(),
      updated_by: createdBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.BILLING_INVOICES)
      .where('id', _.head(insert))
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createBillingInvoiceItem = async (
  input: CreateBillingInvoiceItemInputStore,
): Promise<BillingInvoiceModel> => {
  try {
    const {
      invoiceId,
      descriptionHdr,
      sequence,
      taskId,
      descriptionDtl,
      qty,
      uom,
      unitPrice,
      discountPercentage,
      tax,
      taxInclusive,
      taxPercentage,
      taxAmount,
      amount,
      createdBy,
    } = input;

    const insert = await knex.from(TableNames.BILLING_INVOICE_ITEMS).insert({
      invoice_id: invoiceId,
      description_hdr: descriptionHdr,
      sequence,
      task_id: taskId ? taskId : null,
      description_dtl: descriptionDtl,
      qty,
      uom,
      unit_price: unitPrice,
      discount_percentage: discountPercentage,
      tax,
      tax_inclusive: taxInclusive,
      tax_percentage: taxPercentage,
      tax_amt: taxAmount,
      amount,
      created_by: createdBy,
      created_at: knex.fn.now(),
      updated_by: createdBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.BILLING_INVOICE_ITEMS)
      .where('id', _.head(insert))
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateBillingInvoice = async (
  input: UpdateBillingInvoiceInputStore,
): Promise<BillingInvoiceModel> => {
  try {
    const {
      billingInvoiceId,
      docNo,
      docDate,
      picId,
      terms,
      remarks,
      updatedBy,
    } = input;

    await knex
      .from(TableNames.BILLING_INVOICES)
      .where('id', billingInvoiceId)
      .update({
        ...(docNo && { doc_no: docNo }),
        ...(docDate && { doc_date: docDate }),
        ...(picId && { pic_id: picId }),
        ...(terms && { terms }),
        ...(remarks && { remarks }),
        updated_by: updatedBy,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.BILLING_INVOICES)
      .where('id', billingInvoiceId)
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getBillingInvoicesByProjectId = async (
  projectId: ProjectId,
): Promise<BillingInvoiceModel[]> => {
  try {
    const res = await knex
      .from(TableNames.BILLING_INVOICES)
      .where({ project_id: projectId, deleted_at: null })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getBillingInvoiceItemsByInvoiceId = async (
  invoiceId: BillingInvoiceId,
): Promise<BillingInvoiceItemModel[]> => {
  try {
    const res = await knex
      .from(TableNames.BILLING_INVOICE_ITEMS)
      .where({ invoice_id: invoiceId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateBillingInvoiceItem = async (
  input: UpdateBillingInvoiceItemInputStore,
): Promise<BillingInvoiceItemModel> => {
  try {
    const {
      invoiceItemId,
      descriptionHdr,
      sequence,
      taskId,
      descriptionDtl,
      unitPrice,
      discountPercentage,
      taxInclusive,
      taxPercentage,
      taxAmount,
      amount,
      updatedBy,
    } = input;

    await knex
      .from(TableNames.BILLING_INVOICE_ITEMS)
      .where('id', invoiceItemId)
      .update({
        ...(descriptionHdr && { description_hdr: descriptionHdr }),
        ...(sequence && { sequence }),
        ...(taskId !== undefined && { task_id: taskId }),
        ...(descriptionDtl && { description_dtl: descriptionDtl }),
        ...(unitPrice && { unit_price: unitPrice }),
        ...(discountPercentage && { discount_percentage: discountPercentage }),
        ...(taxInclusive && { tax_inclusive: taxInclusive }),
        ...(taxPercentage && { tax_percentage: taxPercentage }),
        ...(taxAmount && { tax_amount: taxAmount }),
        ...(amount && { amount }),

        updated_by: updatedBy,
        updated_at: knex.fn.now(),
      });

    const res = await knex
      .from(TableNames.BILLING_INVOICES)
      .where('id', invoiceItemId)
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteBillingInvoices = async (
  invoiceIds: BillingInvoiceId[],
  userId: UserId,
): Promise<AffectedRowsResult> => {
  try {
    const res = await knex
      .from(TableNames.BILLING_INVOICES)
      .whereIn('id', invoiceIds)
      .update({ deleted_at: knex.fn.now(), deleted_by: userId });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteBillingInvoiceItems = async (
  itemIds: BillingInvoiceItemId[],
): Promise<AffectedRowsResult> => {
  try {
    const res = await knex
      .from(TableNames.BILLING_INVOICE_ITEMS)
      .whereIn('id', itemIds)
      .del();

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getNumberOfBillingInvoicesByCompanyId = async (
  companyId: CompanyId,
): Promise<number> => {
  try {
    const projects = await knex
      .from(TableNames.PROJECTS)
      .where('company_id', companyId)
      .select('id');
    const projectIds = projects.map((project) => project.id);

    const res = await knex
      .from({ bi: TableNames.BILLING_INVOICES })
      .whereIn('bi.project_id', projectIds)
      .count('bi.id as count');

    //@ts-ignore
    return _.head(res)?.count || 0;
  } catch (error) {
    return Promise.reject(error);
  }
};

//launch once
const seedAllCompaniesWithInvoicePrefix = async () => {
  try {
    const res = (await knex
      .from(TableNames.COMPANIES)
      .select()) as CompanyModel[];

    for (let i = 0; i < res.length; i++) {
      const company = res[i];

      //get company acronym
      const stringArr = company.name.split(' ');
      const acronymArr = stringArr.map((str) => str[0]);
      const acronym = acronymArr.join('').substring(0, 3);
      // only letters and numbers
      const invoicePrefix = acronym.replace(/[^a-zA-Z0-9]/g, '');

      await knex
        .from(TableNames.COMPANY_PROFILES)
        .where('company_id', company.id)
        .update({ invoice_prefix: invoicePrefix.toUpperCase() });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTotalReceivedAmount = async (input: {
  received: number;
  invoiceId: BillingInvoiceId;
  updatedBy: UserId;
}): Promise<BillingInvoiceModel> => {
  try {
    const { received, invoiceId, updatedBy } = input;
    await knex.from(TableNames.BILLING_INVOICES).where('id', invoiceId).update({
      total_received: received,
      updated_by: updatedBy,
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.BILLING_INVOICES)
      .where('id', invoiceId)
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createBillingInvoiceHistory = async (input: {
  invoiceId: BillingInvoiceId;
  totalReceived: number;
  createdBy: UserId;
  date?: string;
}): Promise<BillingInvoiceHistoryModel> => {
  try {
    const { invoiceId, totalReceived, createdBy, date } = input;

    const insert = await knex.from('billing_invoice_histories').insert({
      invoice_id: invoiceId,
      total_received: totalReceived,
      created_by: createdBy,
      created_at: date || knex.fn.now(),
    });

    const res = await knex
      .from('billing_invoice_histories')
      .where('id', _.head(insert))
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getInvoiceStartForCompany = async (
  companyId: CompanyId,
): Promise<string> => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_PROFILES)
      .where('company_id', companyId)
      .first();
    return res?.invoice_start_string;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanyPrefix = async (company: CompanyModel): Promise<string> => {
  //get company acronym
  const stringArr = company.name.split(' ');
  const acronymArr = stringArr.map((str) => str[0]);
  const acronym = acronymArr.join('').substring(0, 3);
  // only letters and numbers
  const invoicePrefix = acronym.replace(/[^a-zA-Z0-9]/g, '');

  await knex
    .from(TableNames.COMPANY_PROFILES)
    .where('company_id', company.id)
    .insert({
      invoice_prefix: invoicePrefix.toUpperCase(),
      company_id: company.id,
    });

  return invoicePrefix.toUpperCase();
};

const voidInvoice = async (input: {
  userId: UserId;
  invoiceId: BillingInvoiceId;
}): Promise<BillingInvoiceModel> => {
  try {
    const { userId, invoiceId } = input;
    await knex
      .from(TableNames.BILLING_INVOICES)
      .where({
        id: invoiceId,
      })
      .update({ void: 1, voided_at: knex.fn.now(), voided_by: userId });

    const res = await knex
      .from(TableNames.BILLING_INVOICES)
      .where('id', invoiceId)
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  createBillingInvoice,
  createBillingInvoiceItem,
  updateBillingInvoice,
  updateBillingInvoiceItem,
  getBillingInvoicesByProjectId,
  getBillingInvoiceItemsByInvoiceId,
  deleteBillingInvoices,
  deleteBillingInvoiceItems,
  getNumberOfBillingInvoicesByCompanyId,
  seedAllCompaniesWithInvoicePrefix,
  updateTotalReceivedAmount,
  createBillingInvoiceHistory,
  getInvoiceStartForCompany,
  updateCompanyPrefix,
  voidInvoice,
};
