import {
  camelizeOnly as camelize,
  camelizeOnly,
  verifyMatchingIds,
} from '@data-access/utils';
import DataLoader from 'dataloader';
import { TableNames } from '@db-tables';
import knex from '@db/knex';
import { UserId } from '@models/user.model';
import {
  SubscriptionChangeModel,
  SubscriptionId,
  SubscriptionModel,
  SubscriptionPackageId,
  SubscriptionPackageNewModel,
  SubscriptionProductId,
  SubscriptionProductPublicId,
} from '@models/subscription.model';
import _ from 'lodash';
import { CompanyId } from '@models/company.model';
import { PrivateOrPublicId } from '@models/common.model';
import { QuotaType } from '@services/subscription/subscription-new.service';
import { SUBSCRIPTION_CHANGE_ACTIONS } from '@constants';
import dayjs from 'dayjs';

const createLoaders = () => {
  return {
    subscriptions: new DataLoader((keys) =>
      exportFunctions.batchGetSubscriptions(keys as PrivateOrPublicId[]),
    ),
    subscriptionPackages: new DataLoader((keys) =>
      exportFunctions.batchGetSubscriptionPackages(keys as PrivateOrPublicId[]),
    ),
  };
};

const batchGetSubscriptions = async (ids: PrivateOrPublicId[]) => {
  try {
    const res = await knex
      .from(TableNames.SUBSCRIPTIONS)
      .where((builder) => {
        if (typeof ids[0] === 'number') {
          builder.whereIn('id', ids);
        } else {
          builder.orWhereIn(
            'id_text',
            ids.map((id) => id.toString()),
          );
        }
      })
      .select();

    verifyMatchingIds(res, ids);

    return camelizeOnly(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const batchGetSubscriptionPackages = async (ids: PrivateOrPublicId[]) => {
  try {
    const res = await knex
      .from(TableNames.SUBSCRIPTION_PACKAGES)
      .where((builder) => {
        if (typeof ids[0] === 'number') {
          builder.whereIn('id', ids);
        } else {
          builder.orWhereIn(
            'id_text',
            ids.map((id) => id.toString()),
          );
        }
      })
      .select();

    verifyMatchingIds(res, ids);

    return camelizeOnly(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubscriptionsById = async (
  input: PrivateOrPublicId | PrivateOrPublicId[],
) => {
  try {
    const loaders = createLoaders();

    if (Array.isArray(input)) {
      return await loaders.subscriptions.loadMany(input);
    } else {
      return await loaders.subscriptions.load(input);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubscriptionPackagesById = async (
  input: PrivateOrPublicId | PrivateOrPublicId[],
) => {
  try {
    const loaders = createLoaders();

    if (Array.isArray(input)) {
      return await loaders.subscriptionPackages.loadMany(input);
    } else {
      return await loaders.subscriptionPackages.load(input);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubscriptionProducts = async (input?: {
  ids?: SubscriptionProductId[];
  publicIds?: SubscriptionProductPublicId[];
}) => {
  try {
    const { ids, publicIds } = input || {};

    const res = await knex
      .from(TableNames.SUBSCRIPTION_PRODUCTS)
      .where((builder) => {
        if (ids) {
          builder.whereIn('id', ids);
        }
        if (publicIds) {
          builder.whereIn('id_text', publicIds);
        }
      })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createSubscriptionProduct = async (input: {
  name: string;
  stripeProductId: string;
  userId: UserId;
}) => {
  try {
    const { name, userId, stripeProductId } = input;
    const insertRes = await knex(TableNames.SUBSCRIPTION_PRODUCTS).insert({
      name,
      stripe_product_id: stripeProductId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      created_by: userId,
      updated_by: userId,
    });

    const res = await knex
      .from(TableNames.SUBSCRIPTION_PRODUCTS)
      .where({ id: insertRes[0] })
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubscriptionProduct = async (input: {
  id: SubscriptionProductId;
  name: string;
  stripeProductId: string;
  userId: UserId;
}) => {
  try {
    const { id, name, userId, stripeProductId } = input;
    await knex(TableNames.SUBSCRIPTION_PRODUCTS)
      .update({
        name,
        stripe_product_id: stripeProductId,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', id);

    const res = await knex
      .from(TableNames.SUBSCRIPTION_PRODUCTS)
      .where('id', id)
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubscriptionForCompanyId = async (input: {
  companyId: CompanyId;
}): Promise<SubscriptionModel> => {
  try {
    const { companyId } = input;
    const res = await knex
      .from(TableNames.SUBSCRIPTIONS)
      .where('company_id', companyId)
      .select()
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getProductsInSubscriptionPackage = async (input: {
  packageId: SubscriptionPackageId;
}) => {
  try {
    const { packageId } = input;

    const res = await knex
      .from({ pp: TableNames.SUBSCRIPTION_PACKAGE_PRODUCTS })
      .innerJoin(
        { sp: TableNames.SUBSCRIPTION_PRODUCTS },
        'pp.product_id',
        'sp.id',
      )
      .where('pp.package_id', packageId)
      .select('sp.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createSubscription = async (input: {
  companyId: CompanyId;
  stripeSubscriptionId: string | null;
  packageId: SubscriptionPackageId;
  intervalType: string;
  userId: UserId;
}) => {
  try {
    const { companyId, stripeSubscriptionId, packageId, userId, intervalType } =
      input;
    const insertRes = await knex(TableNames.SUBSCRIPTIONS).insert({
      company_id: companyId,
      stripe_subscription_id: stripeSubscriptionId,
      package_id: packageId,
      interval_type: intervalType,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      created_by: userId,
      updated_by: userId,
    });

    const res = await exportFunctions.getSubscriptionsById(
      _.head(insertRes) as number,
    );

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubscription = async (input: {
  subscriptionId: SubscriptionId;
  stripeSubscriptionId: string | null;
  packageId: SubscriptionPackageId;
  intervalType: string;
  userId: UserId;
}) => {
  try {
    const {
      stripeSubscriptionId,
      packageId,
      userId,
      subscriptionId,
      intervalType,
    } = input;
    const updateRes = await knex(TableNames.SUBSCRIPTIONS)
      .update({
        stripe_subscription_id: stripeSubscriptionId,
        package_id: packageId,
        interval_type: intervalType,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', subscriptionId);

    const res = await exportFunctions.getSubscriptionsById(subscriptionId);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createSubscriptionPackage = async (input: {
  userId: UserId;
  name: string;
  userQuota?: number | null;
  taskQuota?: number | null;
  invoiceQuota?: number | null;
  reportQuota?: number | null;
  teamQuota?: number | null;
  storageQuota?: number | null;
}): Promise<SubscriptionPackageNewModel> => {
  try {
    const {
      userId,
      name,
      userQuota,
      taskQuota,
      invoiceQuota,
      reportQuota,
      teamQuota,
      storageQuota,
    } = input;

    const insert = await knex(TableNames.SUBSCRIPTION_PACKAGES).insert({
      name,
      ...(userQuota &&
        typeof userQuota === 'number' && { user_quota: userQuota }),
      ...(taskQuota &&
        typeof taskQuota === 'number' && { task_quota: taskQuota }),
      ...(invoiceQuota &&
        typeof invoiceQuota === 'number' && { invoice_quota: invoiceQuota }),
      ...(reportQuota &&
        typeof reportQuota === 'number' && { report_quota: reportQuota }),
      ...(teamQuota &&
        typeof teamQuota === 'number' && { team_quota: teamQuota }),
      ...(storageQuota &&
        typeof storageQuota === 'number' && { storage_quota: storageQuota }),
      created_by: userId,
      created_at: knex.fn.now(),
      updated_by: userId,
      updated_at: knex.fn.now(),
    });

    const res = await knex(TableNames.SUBSCRIPTION_PACKAGES)
      .where({ id: insert[0] })
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanySubscribedPackage = async (input: {
  subscriptionId: SubscriptionId;
  packageId: SubscriptionPackageId;
  intervalType: string;
  userId: UserId;
  stripeSubscriptionId?: string | null;
}) => {
  try {
    const {
      subscriptionId,
      packageId,
      userId,
      intervalType,
      stripeSubscriptionId,
    } = input;
    const updateRes = await knex(TableNames.SUBSCRIPTIONS)
      .update({
        package_id: packageId,
        interval_type: intervalType,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', subscriptionId);

    if (updateRes !== 1) {
      throw new Error('Unable to update subscription');
    }

    const subscription = await getSubscriptionsById(subscriptionId);
    return subscription;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAllSubscriptions = async (): Promise<SubscriptionModel[]> => {
  try {
    const res = await knex(TableNames.SUBSCRIPTIONS).select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

type UpdateSubscriptionQuotaInput = {
  userQuota?: number | null;
  taskQuota?: number | null;
  invoiceQuota?: number | null;
  reportQuota?: number | null;
  teamQuota?: number | null;
  storageQuota?: number | null;
  companyId: CompanyId;
};

const updateSubscriptionQuota = async (input: UpdateSubscriptionQuotaInput) => {
  try {
    const {
      companyId,
      userQuota,
      taskQuota,
      invoiceQuota,
      reportQuota,
      teamQuota,
      storageQuota,
    } = input;

    await knex
      .from(TableNames.SUBSCRIPTIONS)
      .where('company_id', companyId)
      .update({
        user_quota: userQuota,
        task_quota: taskQuota,
        invoice_quota: invoiceQuota,
        report_quota: reportQuota,
        team_quota: teamQuota,
        storage_quota: storageQuota,
      });

    const res = await knex
      .from(TableNames.SUBSCRIPTIONS)
      .where('company_id', companyId)
      .select()
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const addProductToPackage = async (input: {
  packageId: SubscriptionPackageId;
  productId: SubscriptionProductId;
}) => {
  try {
    const { packageId, productId } = input;
    await knex(TableNames.SUBSCRIPTION_PACKAGE_PRODUCTS)
      .insert({
        package_id: packageId,
        product_id: productId,
      })
      .onConflict(['package_id', 'product_id'])
      .merge();

    const pkg = await knex
      .from(TableNames.SUBSCRIPTION_PACKAGES)
      .where('id', packageId)
      .select();

    return camelize(_.head(pkg));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeProductFromPackage = async (input: {
  packageId: SubscriptionPackageId;
  productId: SubscriptionProductId;
}) => {
  try {
    const { packageId, productId } = input;
    await knex(TableNames.SUBSCRIPTION_PACKAGE_PRODUCTS)
      .where({
        package_id: packageId,
        product_id: productId,
      })
      .del();

    const pkg = await knex
      .from(TableNames.SUBSCRIPTION_PACKAGES)
      .where('id', packageId)
      .select();

    return camelize(_.head(pkg));
  } catch (error) {
    return Promise.reject(error);
  }
};

const listSubscriptionPackages = async (input?: { orderBy: string }) => {
  try {
    const { orderBy } = input || { orderBy: 'name' };

    const res = await knex
      .from(TableNames.SUBSCRIPTION_PACKAGES)
      .where({ is_custom: false })
      .select()
      .orderBy(orderBy);

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Default subscription means the basic/free tier one. There should only be one set as default
const getDefaultSubscriptionPackage = async () => {
  try {
    const res = await knex
      .from(TableNames.SUBSCRIPTION_PACKAGES)
      .where('is_default', true)
      .select()
      .first();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertSubscriptionChangeAction = async (input: {
  subscriptionId: SubscriptionId;
  companyId: CompanyId;
  action: string;
  actionData: { [key: string]: any };
  userId?: UserId | null;
  runAt: String;
}) => {
  try {
    const { subscriptionId, companyId, action, actionData, userId, runAt } =
      input;
    const res = await knex(TableNames.SUBSCRIPTION_CHANGES).insert({
      subscription_id: subscriptionId,
      company_id: companyId,
      action,
      action_data: JSON.stringify(actionData),
      created_at: knex.fn.now(),
      created_by: userId,
      run_at: runAt,
    });

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubscriptionChangesForCompanyId = async (companyId: CompanyId) => {
  try {
    const res = await knex
      .from(TableNames.SUBSCRIPTION_CHANGES)
      .where({ company_id: companyId, completed_at: null });

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyUserCount = async (companyId: CompanyId) => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_MEMBERS)
      .where({
        company_id: companyId,
        deleted_at: null,
        active: 1,
      })
      .count('id as count');

    return _.get(res, '0.count', 0);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyTeamCount = async (companyId: CompanyId) => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_TEAMS)
      .where({
        company_id: companyId,
        deleted_at: null,
      })
      .count('id as count');

    return _.get(res, '0.count', 0);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskCount = async (companyId: CompanyId) => {
  try {
    const res = await knex({ t: TableNames.TASKS })
      .join({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .where({ 'p.company_id': companyId })
      .count('t.id as count');

    return _.get(res, '0.count', 0);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTotalStorageByCompanyId = async (companyId: CompanyId) => {
  try {
    const res = await knex({ ta: TableNames.TASK_ATTACHMENTS })
      .join({ t: TableNames.TASKS }, 't.id', 'ta.card_id')
      .join({ p: TableNames.PROJECTS }, 'p.id', 't.job_id')
      .where({
        'p.company_id': companyId,
        't.deleted_at': null,
        'p.deleted_at': null,
        'ta.deleted_at': null,
      })
      .sum('ta.file_size as size')
      .first();

    return +res?.size || 0;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getInvoiceCount = async (companyId: CompanyId) => {
  try {
    const res = await knex
      .from({ i: TableNames.BILLING_INVOICES })
      .join({ p: TableNames.PROJECTS }, 'p.id', 'i.project_id')
      .where({ 'p.company_id': companyId })
      .count('i.id as count');

    return _.get(res, '0.count', 0);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCurrentHourSubscriptionChanges = async (): Promise<
  SubscriptionChangeModel[]
> => {
  try {
    const nowInHour = dayjs().format('YYYY-MM-DD HH:00:00');
    const oneHourLater = dayjs().add(1, 'hour').format('YYYY-MM-DD HH:59:59');

    const res = await knex
      .from(TableNames.SUBSCRIPTION_CHANGES)
      .whereBetween('run_at', [nowInHour, oneHourLater])
      .where({ completed_at: null })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubscriptionChanges = async (input: { subChangeId: number }) => {
  try {
    const { subChangeId } = input;
    await knex
      .from(TableNames.SUBSCRIPTION_CHANGES)
      .where({ id: subChangeId })
      .update({ completed_at: knex.fn.now(), completed_by: 'SYSTEM' });

    const res = await knex
      .from(TableNames.SUBSCRIPTION_CHANGES)
      .where({ id: subChangeId })
      .select()
      .first();

    return camelize(res);
  } catch (error) {
    console.error(error);
  }
};

const exportFunctions = {
  createLoaders,
  getSubscriptionsById,
  batchGetSubscriptions,
  batchGetSubscriptionPackages,
  createSubscription,
  updateSubscription,
  getSubscriptionProducts,
  createSubscriptionProduct,
  updateSubscriptionProduct,
  getSubscriptionForCompanyId,
  getSubscriptionPackagesById,
  getProductsInSubscriptionPackage,
  createSubscriptionPackage,
  updateCompanySubscribedPackage,
  getAllSubscriptions,
  updateSubscriptionQuota,
  addProductToPackage,
  removeProductFromPackage,
  listSubscriptionPackages,
  getDefaultSubscriptionPackage,
  insertSubscriptionChangeAction,
  getSubscriptionChangesForCompanyId,
  getCompanyUserCount,
  getCompanyTeamCount,
  getTaskCount,
  getTotalStorageByCompanyId,
  getInvoiceCount,
  getCurrentHourSubscriptionChanges,
  updateSubscriptionChanges,
};

export default exportFunctions;
