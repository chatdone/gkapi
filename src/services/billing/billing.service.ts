import { generateHtml, generatePdf } from '@controllers/billing.controller';
import { BillingStore, CompanyStore, createLoaders } from '@data-access';
import {
  UpdateBillingInvoiceInputStore,
  UpdateBillingInvoiceItemInputStore,
} from '@data-access/billing/billing.store';
import {
  BillingInvoiceHistoryModel,
  BillingInvoiceId,
  BillingInvoiceItemId,
  BillingInvoiceModel,
} from '@models/billing.model';
import {
  CompanyId,
  CompanyModel,
  CompanyProfileModel,
} from '@models/company.model';
import { ContactPicId, ContactPicModel } from '@models/contact.model';
import { AffectedRowsResult, ProjectId, TaskId } from '@models/task.model';
import { UserId, UserModel } from '@models/user.model';
import { CompanyService, EmailService, SubscriptionService } from '@services';
import { createEmailOption } from '@services/event-manager/event-manager.helper';
import { BILLING_INVOICE_SENT } from '@tools/email-templates';

const createBillingInvoice = async (input: {
  projectId: ProjectId;
  docDate: string;
  picId: ContactPicId;
  terms?: number;
  remarks?: string;
  createdBy: UserId;
  companyId: CompanyId;
}): Promise<BillingInvoiceModel> => {
  try {
    const { companyId, projectId } = input;

    await SubscriptionService.handleSubscriptionQuota({
      companyId,
      quotaType: 'invoice',
      isDecrement: true,
    });

    const docNo = await exportFunctions.getDocNo(companyId);
    const res = await BillingStore.createBillingInvoice({
      ...input,
      docNo,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDocNo = async (companyId: CompanyId) => {
  const res = await BillingStore.getNumberOfBillingInvoicesByCompanyId(
    companyId,
  );
  const no = res + 1;

  const invoiceStart = await BillingStore.getInvoiceStartForCompany(companyId);
  const countLeadingZeros = (str: string) => {
    const match = str.match(/^0+/);
    if (!match) {
      return 0;
    }

    const allZeros = str.split('').every((char) => char === '0');
    const count = match[0].length;

    return allZeros ? count - 1 : count;
  };

  const leadingZeros = countLeadingZeros(invoiceStart.toString());
  if (invoiceStart) {
    const newTotal = +invoiceStart + no;

    return newTotal.toString().padStart(leadingZeros, '0');
  }

  return no.toString().padStart(leadingZeros, '0');
};

const createBillingItemInvoice = async (input: {
  invoiceId: BillingInvoiceId;
  taskId?: TaskId;
  name: string;
  unitPrice: number;
  discountPercentage: number;
  taxPercentage: number;
  createdBy: UserId;
}): Promise<BillingInvoiceModel> => {
  try {
    const {
      invoiceId,
      taskId,
      name,
      unitPrice,
      discountPercentage,
      taxPercentage,
      createdBy,
    } = input;

    const sequence = await billingItemSequence(invoiceId);

    const taxAmount = (unitPrice * taxPercentage) / 100;

    const res = await BillingStore.createBillingInvoiceItem({
      invoiceId,
      taskId,
      unitPrice,
      discountPercentage,
      taxPercentage,
      createdBy,
      taxAmount: taxAmount,
      amount: unitPrice,
      descriptionDtl: name,
      sequence,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const billingItemSequence = async (
  invoiceId: BillingInvoiceId,
): Promise<number> => {
  try {
    const loaders = createLoaders();
    const invoice = (await loaders.billingInvoices.load(
      invoiceId,
    )) as BillingInvoiceModel;

    const res = await BillingStore.getBillingInvoiceItemsByInvoiceId(
      invoice.id,
    );

    return (res?.length || 0) + 1;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateBillingInvoice = async (input: UpdateBillingInvoiceInputStore) => {
  try {
    const res = await BillingStore.updateBillingInvoice(input);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateBillingInvoiceItem = async (
  input: UpdateBillingInvoiceItemInputStore,
) => {
  try {
    const res = await BillingStore.updateBillingInvoiceItem(input);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteBillingInvoices = async (
  invoiceIds: BillingInvoiceId[],
  userId: UserId,
): Promise<AffectedRowsResult> => {
  try {
    const res = await BillingStore.deleteBillingInvoices(invoiceIds, userId);

    return res;

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteBillingInvoiceItems = async (
  itemIds: BillingInvoiceItemId[],
): Promise<AffectedRowsResult> => {
  try {
    const res = await BillingStore.deleteBillingInvoiceItems(itemIds);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTotalReceivedAmount = async (input: {
  received: number;
  invoice: BillingInvoiceModel;
  updatedBy: UserId;
  date?: string;
}): Promise<BillingInvoiceModel> => {
  try {
    const { received, invoice, updatedBy, date } = input;

    const res = await BillingStore.updateTotalReceivedAmount({
      received: received + (+invoice?.totalReceived || 0),
      invoiceId: invoice?.id,
      updatedBy,
    });

    await createBillingInvoiceHistory({
      invoiceId: invoice?.id,
      totalReceived: received,
      createdBy: updatedBy,
      date,
    });

    return res;
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
    const res = await BillingStore.createBillingInvoiceHistory(input);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getInvoiceCode = async (input: {
  companyId: CompanyId;
  invoice: BillingInvoiceModel;
}) => {
  try {
    const { companyId, invoice } = input;
    const companyProfile = (await CompanyStore.getCompanyProfile({
      companyId,
    })) as CompanyProfileModel;
    const companyPrefix =
      companyProfile && companyProfile?.invoicePrefix
        ? companyProfile?.invoicePrefix
        : 'IV';
    const invoiceCode = `${companyPrefix}-${invoice.docNo}`;

    return invoiceCode;
  } catch (error) {
    return Promise.reject(error);
  }
};

const voidInvoice = async (input: {
  userId: UserId;
  invoiceId: BillingInvoiceId;
}): Promise<BillingInvoiceModel> => {
  try {
    const res = await BillingStore.voidInvoice(input);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const sendBillingInvoice = async (input: {
  invoice: BillingInvoiceModel;
  company: CompanyModel;
  pic: ContactPicModel;
  user: UserModel;
}) => {
  try {
    const { invoice, company, pic, user } = input;
    const loaders = createLoaders();

    if (!pic.user_id) {
      throw new Error('External party has no email attached');
    }
    const picUser = (await loaders.users.load(pic.user_id)) as UserModel;

    if (!picUser.email) {
      throw new Error('External Party has no email');
    }

    const invoiceCode = await getInvoiceCode({
      invoice,
      companyId: company.id,
    });

    const companyProfile = (await CompanyStore.getCompanyProfile({
      companyId: company.id,
    })) as CompanyProfileModel;
    const items = await BillingStore.getBillingInvoiceItemsByInvoiceId(
      invoice.id,
    );

    const totalBilled = items.reduce((acc, item) => {
      const discountAmount = item.amount * (item.discountPercentage / 100);
      const discountedAmount = item.amount - discountAmount;

      const taxAmount = discountedAmount * (item.taxPercentage / 100);
      const billedAmount = discountedAmount + taxAmount;

      return acc + billedAmount;
    }, 0);

    const totalBilledFixed = totalBilled.toFixed(2);

    const balanceDue = (totalBilled - (+invoice.totalReceived || 0)).toFixed(2);

    const html = await generateHtml(invoice, user);

    const pdf = await generatePdf({ body: { html } });

    if (pdf) {
      const attachments = [
        {
          filename: `${invoiceCode}.pdf`,
          content: pdf.toString('base64') as string,
          type: 'pdf',
        },
      ];

      const option = await createEmailOption({
        templateId: BILLING_INVOICE_SENT,
        receiverName: picUser?.name || picUser?.email,
        companyName: company?.name,
        email: picUser?.email,
        companyLogoUrl: company?.logo_url,
        invoiceNo: invoiceCode,
        balanceDue,
        invoiceAmount: totalBilledFixed,
        attachments,
        companyPhone: companyProfile?.phone || user?.contact_no,
        companyEmail: companyProfile?.email || user?.email,
      });

      const isEmailSent = await EmailService.sendEmail(option);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const exportFunctions = {
  createBillingInvoice,
  createBillingItemInvoice,
  updateBillingInvoice,
  updateBillingInvoiceItem,
  deleteBillingInvoiceItems,
  deleteBillingInvoices,
  getDocNo,
  updateTotalReceivedAmount,
  createBillingInvoiceHistory,
  getInvoiceCode,
  voidInvoice,
  sendBillingInvoice,
};

export default exportFunctions;
