import { BillingStore } from '@data-access';
import {
  getBillingInvoice,
  getBillingInvoiceItem,
  getBillingInvoiceItems,
  getBillingInvoices,
  getContactPic,
  getProject,
  getTask,
} from '@data-access/getters';
import { Resolvers } from '@generated/graphql-types';
import { CompanyModel, CompanyProfileModel } from '@models/company.model';
import { ContactPicModel } from '@models/contact.model';
import { ProjectModel } from '@models/task.model';
import { BillingService, CompanyService } from '@services';
import { ApolloError } from 'apollo-server-express';

export const resolvers: Resolvers = {
  Query: {
    billingInvoice: async (root, { id }, { loaders, auth: { user } }) => {
      const res = await getBillingInvoice(id);
      return res;
    },
    billingInvoices: async (
      root,
      { projectId },
      { loaders, auth: { user } },
    ) => {
      const project = await getProject(projectId);

      const res = await BillingStore.getBillingInvoicesByProjectId(project.id);

      return res;
    },
    billingInvoiceItem: async (root, { id }, { loaders, auth: { user } }) => {
      const res = await getBillingInvoiceItem(id);
      return res;
    },
    billingInvoiceItems: async (
      root,
      { invoiceId },
      { loaders, auth: { user } },
    ) => {
      const invoice = await getBillingInvoice(invoiceId);

      const res = await BillingStore.getBillingInvoiceItemsByInvoiceId(
        invoice.id,
      );

      return res;
    },
  },
  BillingInvoice: {
    id: ({ id_text, idText }) => id_text || idText,
    project: async ({ projectId }, args, { loaders }) => {
      const project = await loaders.taskBoards.load(projectId);

      return project;
    },
    docNo: async ({ projectId, docNo }, args, { loaders }) => {
      const project = await loaders.projects.load(projectId);

      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: project.companyId,
      })) as CompanyProfileModel;
      if (!companyProfile || !companyProfile.invoicePrefix) {
        return `IV-${docNo}`;
      }

      return `${companyProfile.invoicePrefix}-${docNo}`;
    },

    items: async ({ id }, args, { loaders }) => {
      const res = await BillingStore.getBillingInvoiceItemsByInvoiceId(id);

      return res;
    },
    totalDiscounted: async ({ id }, args, { loaders }) => {
      const res = await BillingStore.getBillingInvoiceItemsByInvoiceId(id);
      const totalDiscounted = res.reduce((acc, item) => {
        const discountedAmount = item.amount * (item.discountPercentage / 100);
        return acc + discountedAmount;
      }, 0);
      return totalDiscounted;
    },
    totalTaxed: async ({ id }, args, { loaders }) => {
      const res = await BillingStore.getBillingInvoiceItemsByInvoiceId(id);
      const totalTaxed = res.reduce((acc, item) => {
        const discountAmount = item.amount * (item.discountPercentage / 100);
        const discountedAmount = item.amount - discountAmount;
        const taxedAmount = discountedAmount * (item.taxPercentage / 100);
        return acc + taxedAmount;
      }, 0);
      return totalTaxed;
    },
    contactPic: async ({ picId }, args, { loaders }) => {
      try {
        const res = await loaders.contactPics.load(picId);

        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    createdBy: async ({ createdBy }, args, { loaders }) => {
      try {
        const res = await loaders.users.load(createdBy);

        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    voidedBy: async ({ voidedBy }, args, { loaders }) => {
      try {
        const res = await loaders.users.load(voidedBy);

        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    updatedBy: async ({ updatedBy }, args, { loaders }) => {
      try {
        const res = await loaders.users.load(updatedBy);

        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },
  BillingInvoiceItem: {
    id: ({ id_text, idText }) => idText,
    billingInvoice: async ({ invoiceId }, args, { loaders }) => {
      try {
        const res = await loaders.billingInvoices.load(invoiceId);

        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    task: async ({ taskId }, args, { loaders }) => {
      if (taskId) {
        return await loaders.tasks.load(taskId);
      }

      return null;
    },
    billed: async ({ amount, taxPercentage, discountPercentage }) => {
      const discountAmount = amount * (discountPercentage / 100);
      const discountedAmount = amount - discountAmount;

      const taxAmount = discountedAmount * (taxPercentage / 100);
      const taxedAmount = discountedAmount + taxAmount;

      return taxedAmount;
    },
    itemName: async ({ taskId, descriptionDtl }, args, { loaders }) => {
      if (taskId) {
        const task = await loaders.tasks.load(taskId);

        return task.name;
      }

      return descriptionDtl;
    },
    createdBy: async ({ createdBy }, args, { loaders }) => {
      try {
        const res = await loaders.users.load(createdBy);

        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    updatedBy: async ({ updatedBy }, args, { loaders }) => {
      try {
        const res = await loaders.users.load(updatedBy);

        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },
  Mutation: {
    createBillingInvoice: async (root, { input }, { auth: { user } }) => {
      try {
        const { projectId, docDate, picId, terms, remarks } = input;
        const pic = await getContactPic(picId);
        const project = await getProject(projectId);

        const res = await BillingService.createBillingInvoice({
          projectId: project.id,
          docDate,
          picId: pic.id,
          ...(terms && { terms }),
          ...(remarks && { remarks }),
          createdBy: user.id,
          companyId: project.companyId,
        });
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateBillingInvoice: async (root, { input }, { auth: { user } }) => {
      try {
        const { billingInvoiceId, docNo, docDate, picId, terms, remarks } =
          input;

        let picPrivateId;

        if (picId) {
          const pic = await getContactPic(picId);
          picPrivateId = pic.id;
        }

        const billingInvoice = await getBillingInvoice(billingInvoiceId);

        const res = await BillingService.updateBillingInvoice({
          billingInvoiceId: billingInvoice.id,
          ...(docNo && { docNo }),
          ...(docDate && { docDate }),
          ...(picPrivateId && { picId: picPrivateId }),
          ...(terms && { terms }),
          ...(remarks && { remarks }),
          updatedBy: user.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createBillingInvoiceItem: async (root, { input }, { auth: { user } }) => {
      try {
        const {
          invoiceId,
          taskId,
          customName,
          unitPrice,
          discountPercentage,
          taxPercentage,
        } = input;

        const billingInvoice = await getBillingInvoice(invoiceId);
        let name;
        let taskPrivateId;
        if (taskId) {
          const task = await getTask(taskId);
          name = task.name;
          taskPrivateId = task.id;
        } else if (customName) {
          name = customName;
        } else if (taskId && customName) {
          throw new ApolloError('Cannot have both taskId and customName');
        } else {
          throw new ApolloError('Must select either a task or a custom name');
        }

        const res = await BillingService.createBillingItemInvoice({
          invoiceId: billingInvoice.id,
          unitPrice: unitPrice || 0,
          discountPercentage: discountPercentage || 0,
          taxPercentage: taxPercentage || 0,
          createdBy: user.id,
          name,
          ...(taskId && { taskId: taskPrivateId }),
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateBillingInvoiceItem: async (root, { input }, { auth: { user } }) => {
      try {
        const {
          invoiceItemId,
          descriptionHdr,
          sequence,
          taskId,
          itemName,
          unitPrice,
          discountPercentage,
          taxPercentage,
        } = input;

        const invoiceItem = await getBillingInvoiceItem(invoiceItemId);
        const isTask = invoiceItem?.taskId;
        const isCustom =
          invoiceItem?.taskId === null && invoiceItem?.descriptionDtl;
        let newName;
        let taskPrivateId;

        if (taskId && itemName) {
          throw new ApolloError('Cannot have both taskId and itemName');
        } else if (taskId) {
          const task = await getTask(taskId);
          newName = task.name;
          taskPrivateId = task.id;
        } else if (itemName) {
          newName = itemName;

          if (isTask) {
            taskPrivateId = null;
          }
        }

        const res = await BillingService.updateBillingInvoiceItem({
          invoiceItemId: invoiceItem.id,
          ...(descriptionHdr && { descriptionHdr }),
          ...(sequence && { sequence }),
          ...(taskPrivateId !== undefined && { taskId: taskPrivateId }),
          ...(newName && { descriptionDtl: newName }),
          ...(unitPrice && { unitPrice }),
          ...(unitPrice && { amount: unitPrice }),
          ...(discountPercentage && { discountPercentage }),
          ...(taxPercentage && { taxPercentage }),
          updatedBy: user.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteBillingInvoiceItems: async (root, { ids }, { auth: { user } }) => {
      try {
        const billingInvoiceItems = await getBillingInvoiceItems(ids);

        const invoiceItemIds = billingInvoiceItems.map((b) => b.id);

        await BillingService.deleteBillingInvoiceItems(invoiceItemIds);

        return billingInvoiceItems;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteBillingInvoices: async (root, { ids }, { auth: { user } }) => {
      try {
        const billingInvoices = await getBillingInvoices(ids);

        const invoiceIds = billingInvoices.map((b) => b.id);

        await BillingService.deleteBillingInvoices(invoiceIds, user.id);

        return billingInvoices;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    receivePaymentInvoice: async (root, { input }, { auth: { user } }) => {
      try {
        const { invoiceId, received, date } = input;

        const billingInvoice = await getBillingInvoice(invoiceId);

        const res = await BillingService.updateTotalReceivedAmount({
          invoice: billingInvoice,
          received,
          ...(date && { date }),
          updatedBy: user.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },

    voidInvoice: async (root, { input }, { auth: { user } }) => {
      try {
        const { invoiceId } = input;

        const billingInvoice = await getBillingInvoice(invoiceId);

        const res = await BillingService.voidInvoice({
          userId: user.id,
          invoiceId: billingInvoice.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    sendInvoice: async (root, { input }, { loaders, auth: { user } }) => {
      try {
        const { invoiceId, emails } = input;

        const billingInvoice = await getBillingInvoice(invoiceId);
        const project = (await loaders.taskBoards.load(
          billingInvoice.projectId,
        )) as ProjectModel;
        const company = (await loaders.companies.load(
          project.companyId,
        )) as CompanyModel;
        const pic = (await loaders.contactPics.load(
          billingInvoice.picId,
        )) as ContactPicModel;

        await BillingService.sendBillingInvoice({
          invoice: billingInvoice,
          company,
          pic,
          user,
        });

        return billingInvoice;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
  },
};
