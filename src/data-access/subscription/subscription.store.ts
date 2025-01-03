import { camelize } from '@data-access/utils';
import { TableNames } from '@db-tables';
import knex from '@db/knex';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
} from '@models/company.model';
import {
  CompanySubscriptionId,
  CompanySubscriptionModel,
  CompanySubscriptionWithPackageModel,
  CompanySubscriptionWithQuotaRefreshModel,
  InsertDedocoSubscriptionPayload,
  InsertOmniSubscriptionPayload,
  InsertSubscriptionPayload,
  QuotaPayload,
  SubscriptionPackageId,
  SubscriptionPackageModel,
  SubscriptionPackagePriceModel,
  UpdateSubscriptionQuotaPayload,
} from '@models/subscription.model';
import SubscriptionNewStore from './subscription-new.store';
import _ from 'lodash';

export const PACKAGES_TYPES = {
  BASIC: 1,
  TIME_ATTENDANCE: 2,
  PMT: 3, //project management tool
  DEDOCO: 5,
};

const consumeQuotas = async ({
  quotas,
  companyId,
}: {
  quotas: QuotaPayload;
  companyId: CompanyId;
}): Promise<number | Error> => {
  const { whatsApp_quota, email_quota } = quotas;

  try {
    const res = await knex
      .from('company_subscriptions')
      .where({ id: quotas.id })
      .update({ whatsApp_quota, email_quota });
    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

const decrementQuotaByOne = async ({
  subscriptionId,
  services,
}: {
  subscriptionId: CompanySubscriptionId;
  services: { email?: boolean; whatsapp?: boolean };
}): Promise<CompanySubscriptionModel | Error> => {
  try {
    if (services?.email) {
      await knex
        .from('company_subscriptions')
        .where({ id: subscriptionId })
        .decrement('email_quota', 1);
    }

    if (services?.whatsapp) {
      await knex
        .from('company_subscriptions')
        .where({ id: subscriptionId })
        .decrement('whatsApp_quota', 1);
    }

    const sub = await knex
      .from('company_subscriptions')
      .where({ id: subscriptionId })
      .select();

    return camelize(_.head(sub));
  } catch (err) {
    return Promise.reject(err);
  }
};

const getPackages = async (): Promise<(SubscriptionPackageModel | Error)[]> => {
  try {
    const res = await knex
      .from('packages')
      .where({
        active: 1,
        published: 1,
      })
      .whereNull('deleted_at')
      .whereNot({ type: 5 })
      .orderBy('email_quota')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDedocoPackages = async (): Promise<
  (SubscriptionPackageModel | Error)[]
> => {
  try {
    const res = await knex
      .from('packages')
      .where({
        active: 1,
        published: 1,
        type: 5,
      })
      .whereNull('deleted_at')
      .orderBy('signature_quota')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getPackagePrices = async (
  packageId: SubscriptionPackageId,
): Promise<(SubscriptionPackagePriceModel | Error)[]> => {
  try {
    const res = await knex
      .from('package_prices')
      .where({
        active: 1,
        package_id: packageId,
      })
      .whereNull('deleted_at')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const isSubscriptionActive = async (companyId: CompanyId): Promise<boolean> => {
  try {
    const rawResult = await knex.raw(`
		SELECT
				*
		FROM
				company_subscriptions
		WHERE
				company_id = ${companyId} AND start_date < NOW()
						AND end_date > NOW()
						AND active IS TRUE
		`);

    const res = _.head(rawResult) as CompanySubscriptionModel[];
    return res.length > 0;
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateSubscriptionStatus = async ({
  id,
  subscriptionId,
  status,
  activeStatus,
  cancelDate,
  cancelAtEnd,
}: {
  id: CompanySubscriptionId[];
  subscriptionId: string;
  status: number;
  activeStatus: number;
  cancelDate?: boolean;
  cancelAtEnd?: boolean;
}): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    await knex('company_subscriptions')
      .update({
        status: status,
        subscription_id: subscriptionId,
        active: activeStatus,
        updated_at: knex.fn.now(),
        cancel_date: cancelDate ? knex.fn.now() : null,
        cancel_at_period_end: cancelAtEnd ? true : false,
      })
      .whereIn('id', id);

    const res = await knex
      .from('company_subscriptions')
      .whereIn('id', id)
      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateSubscriptionStatusByStripeSubId = async ({
  subscriptionId,
  status,
  activeStatus,
  cancelAtEnd,
  cancelDate,
}: {
  subscriptionId: string;
  status: number;
  activeStatus: number;
  cancelAtEnd?: boolean;
  cancelDate?: boolean;
}): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    await knex('company_subscriptions')
      .update({
        status: status,
        subscription_id: subscriptionId,
        active: activeStatus,
        updated_at: knex.fn.now(),
        cancel_date: cancelDate ? knex.fn.now() : null,
        cancel_at_period_end: cancelAtEnd,
      })
      .where('subscription_id', subscriptionId);

    const res = await knex
      .from('company_subscriptions')
      .where('subscription_id', subscriptionId)
      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateSubscriptionStatusLegacy = async ({
  id,
  subscriptionId,
  status,
  activeStatus,
}: {
  id: CompanySubscriptionId;
  subscriptionId: string;
  status: number;
  activeStatus: number;
}): Promise<CompanySubscriptionModel | Error> => {
  try {
    await knex('company_subscriptions')
      .update({
        status: status,
        subscription_id: subscriptionId,
        active: activeStatus,
      })
      .where('id', id);

    const res = await knex
      .from('company_subscriptions')
      .where('id', id)
      .select();
    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const updatePaymentSuccess = async (
  subscriptionId: string,
): Promise<boolean | Error> => {
  try {
    await knex('company_subscriptions')
      .update({
        status: 1,
        active: 1,
      })
      .where('subscription_id', subscriptionId);

    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateSubscriptionPeriodDates = async ({
  subscriptionId,
  startDate,
  endDate,
}: {
  subscriptionId: string;
  startDate: string;
  endDate: string;
}): Promise<boolean | Error> => {
  try {
    await knex('company_subscriptions')
      .update({
        start_date: startDate,
        end_date: endDate,
      })
      .where('subscription_id', subscriptionId);
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

// NOTE: Deprecated early because conflicts with new function
const updateSubscriptionQuotaLegacy = async ({
  subscriptionId,
  payload,
}: {
  subscriptionId: string;
  payload: UpdateSubscriptionQuotaPayload[];
}): Promise<boolean | Error> => {
  try {
    for (const item of payload) {
      await knex('company_subscriptions')
        .update({
          whatsApp_quota: item.whatsApp_quota | 0,
          email_quota: item.email_quota | 0,
        })
        .where({
          subscription_id: subscriptionId,
          product_id: item.product_id,
        });
    }
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertSubscription = async (
  insertOptions: InsertOmniSubscriptionPayload[],
): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const insertRes = await Promise.all(
      insertOptions.map((item) =>
        knex(TableNames.COMPANY_SUBSCRIPTIONS).insert({
          ...item,
          created_at: knex.fn.now(),
        }),
      ),
    );

    const res = await knex
      .from(TableNames.COMPANY_SUBSCRIPTIONS)
      .whereIn('id', insertRes)
      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const insertDedocoSubscription = async (
  payload: InsertDedocoSubscriptionPayload,
): Promise<CompanySubscriptionModel | Error> => {
  try {
    const insertedId = await knex('company_subscriptions').insert({
      ...payload,
      created_at: knex.fn.now(),
    });

    const res = await knex
      .from('company_subscriptions')
      .where('id', insertedId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertSubscriptionLegacy = async ({
  companyId,
  packageId,
  productId,
  priceId,
  packageTitle,
  packageDescription,
  smsQuota,
  phoneCallQuota,
  emailQuota,
  whatsAppQuota,
  price,
  interval,
  intervalCount,
  startDate,
  endDate,
  createdBy,
  packageData,
  status,
  promo,
}: InsertSubscriptionPayload): Promise<CompanySubscriptionModel | Error> => {
  try {
    const insertRes = await knex('company_subscriptions').insert({
      company_id: companyId,
      package_id: packageId,
      product_id: productId,
      price_id: priceId,
      package_title: packageTitle,
      package_description: packageDescription,
      sms_quota: smsQuota,
      phone_call_quota: phoneCallQuota,
      email_quota: emailQuota,
      whatsApp_quota: whatsAppQuota,
      price: price,
      interval: interval,
      interval_count: intervalCount,
      start_date: startDate,
      end_date: endDate,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      created_by: createdBy,
      updated_by: createdBy,
      status,
      data: packageData,
    });

    if (promo) {
      await knex('subscription_promo_codes').insert({
        subscription_id: insertRes[0],
        promo_code_id: promo.id,
        code: promo.code,
        percent_off: promo.coupon.percent_off,
        amount_off: promo.coupon.amount_off,
        created_at: knex.fn.now(),
      });
    }

    const res = await knex
      .from('company_subscriptions')
      .where('id', insertRes[0])
      .select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const upgradeCompanySub = async (
  companyId: CompanyId,
): Promise<CompanySubscriptionModel> => {
  if (process.env.NODE_ENV !== 'development') {
    return Promise.reject('Not authorized in this environment');
  }

  try {
    const insertRes = await knex('company_subscriptions').insert({
      company_id: companyId,
      package_id: 5,
      product_id: 'prod_HUBUYINmBWEyM6',
      price_id: 'prod_HUBUYINmBWEyM6',
      package_title: 'Premium',
      sms_quota: 300,
      phone_call_quota: 0,
      email_quota: 1200,
      whatsApp_quota: 500,
      price: 369,
      interval: 'month',
      interval_count: 1,
      start_date: '2021-01-01 10:30:28',
      end_date: '2028-01-01 10:30:28',
      status: 1,
      active: 1,
      created_by: 768,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from('company_subscriptions')
      .where('id', insertRes[0])
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeSubscriptionByCompanyId = async (
  companyId: CompanyId,
): Promise<number> => {
  if (process.env.NODE_ENV !== 'development') {
    return Promise.reject('Not authorized in this environment');
  }

  try {
    const deleteRes = await knex('company_subscriptions')
      .where('company_id', companyId)
      .del();

    return deleteRes;
  } catch (error) {
    return Promise.reject(error);
  }
};

const incrementSubscriptionQuotas = async ({
  subId,
  whatsapp_quota = 0,
  sms_quota = 0,
  email_quota = 0,
  phone_quota = 0,
}: {
  subId: CompanySubscriptionId;
  whatsapp_quota: number;
  sms_quota: number;
  email_quota: number;
  phone_quota: number;
}): Promise<CompanySubscriptionModel | Error> => {
  try {
    await knex('company_subscriptions')
      .where('id', subId)
      .increment({
        sms_quota: sms_quota,
        phone_call_quota: phone_quota,
        email_quota: email_quota,
        whatsApp_quota: whatsapp_quota,
      });

    const res = await knex
      .from('company_subscriptions')
      .where('id', subId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

//get single company's all active subscriptions
const getActiveCompanySubscriptions = async (
  companyId: CompanyId,
): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const res = await knex
      .from('company_subscriptions')
      .where(
        knex.raw(`
          company_id = ${companyId}
          AND active IS TRUE
          AND end_date >= NOW()
          AND start_date <= NOW()
        `),
      )
      .orderBy('start_date', 'desc')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

//get companies' all active subscriptions
const getActiveCompaniesSubscriptions = async (
  companyId: CompanyId[],
): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const res = await knex
      .from('company_subscriptions')
      .where(
        knex.raw(`
          company_id in (${companyId})
          AND active IS TRUE
          AND end_date >= NOW()
          AND start_date <= NOW()
        `),
      )
      .orderBy('start_date', 'desc')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanySubscriptionWithPackage = async (
  companySubscriptionId: CompanySubscriptionId,
): Promise<CompanySubscriptionWithPackageModel | Error> => {
  try {
    const res = await knex
      .from({ cs: 'company_subscriptions' })
      .leftJoin({ p: 'packages' }, 'cs.package_id', 'p.id')
      .where('cs.id', companySubscriptionId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getPackagePriceByStripeId = async (
  stripePriceId: string,
): Promise<SubscriptionPackagePriceModel | Error> => {
  try {
    const res = await knex('package_prices')
      .where({ stripe_price_id: stripePriceId })
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const verifySubscriptionExistence = async ({
  companyId,
  priceIds,
}: {
  companyId: CompanyId;
  priceIds: string[];
}): Promise<boolean | Error> => {
  try {
    const res = await knex
      .from('company_subscriptions')
      .whereIn('price_id', priceIds)
      .where({
        company_id: companyId,
        active: true,
      })
      .andWhere(
        knex.raw(`
      start_date < NOW() AND end_date > NOW()
      `),
      )
      .select();

    if (res.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCurrentAnnualSubscriptions = async (): Promise<
  CompanySubscriptionWithQuotaRefreshModel[] | Error
> => {
  try {
    const rawResult = await knex.raw(`
		SELECT
			cs.id,
			cs.start_date,
			cs.interval,
			cs.end_date,
			cs.sms_quota,
			cs.phone_call_quota,
			cs.email_quota,
			cs.whatsApp_quota,
			p.title as package_title,
			p.sms_quota as add_sms,
			p.phone_call_quota as add_phone,
			p.email_quota as add_email,
			p.whatsapp_quota as add_whatsapp
		FROM
			company_subscriptions cs
		INNER JOIN
			packages p
			ON
			cs.package_id = p.id
		WHERE
			cs.end_date > NOW()
			AND cs.start_date < NOW()
			AND cs.interval = 'year'
			AND cs.active = 1
			AND cs.status = 1
		`);
    const result = _.head(
      rawResult,
    ) as CompanySubscriptionWithQuotaRefreshModel[];

    return camelize(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubscriptionQuantity = async ({
  companySubscription,
  quantity,
}: {
  companySubscription: CompanySubscriptionModel;
  quantity: number;
}): Promise<CompanySubscriptionModel | Error> => {
  try {
    await knex('company_subscriptions')
      .where('id', companySubscription.id)
      .update({ quantity: quantity, updated_at: knex.fn.now() });

    const res = await knex
      .from('company_subscriptions')
      .where('id', companySubscription.id)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubscriptionQuantityAssignments = async (
  subscriptionId: CompanySubscriptionId,
): Promise<CompanyMemberModel[]> => {
  try {
    const res = await knex
      .from({
        sqa: TableNames.SUBSCRIPTION_QUANTITY_ASSIGNMENTS,
      })
      .innerJoin(
        { cm: TableNames.COMPANY_MEMBERS },
        'sqa.company_member_id',
        'cm.id',
      )
      .where('subscription_id', subscriptionId)
      .select('cm.*');
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignSubscriptionQuantityToMember = async ({
  subscriptionId,
  companyMemberId,
}: {
  subscriptionId: CompanySubscriptionId;
  companyMemberId: CompanyMemberId;
}): Promise<CompanyMemberModel | Error> => {
  try {
    await knex(TableNames.SUBSCRIPTION_QUANTITY_ASSIGNMENTS).insert({
      subscription_id: subscriptionId,
      company_member_id: companyMemberId,
    });

    const res = await knex
      .from(TableNames.COMPANY_MEMBERS)
      .where({
        id: companyMemberId,
      })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeSubscriptionQuantityFromMember = async ({
  subscriptionId,
  companyMemberId,
}: {
  subscriptionId: CompanySubscriptionId;
  companyMemberId: CompanyMemberId;
}): Promise<CompanyMemberModel | Error> => {
  try {
    await knex(TableNames.SUBSCRIPTION_QUANTITY_ASSIGNMENTS)
      .where({
        subscription_id: subscriptionId,
        company_member_id: companyMemberId,
      })
      .del();

    const res = await knex
      .from(TableNames.COMPANY_MEMBERS)
      .where({
        id: companyMemberId,
      })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSubscriptionByMemberId = async (
  memberId: CompanyMemberId,
): Promise<CompanySubscriptionModel[]> => {
  try {
    const res = await knex
      .from({
        sqa: TableNames.SUBSCRIPTION_QUANTITY_ASSIGNMENTS,
      })
      .innerJoin(
        { sub: TableNames.COMPANY_SUBSCRIPTIONS },
        'sqa.subscription_id',
        'sub.id',
      )
      .where('company_member_id', memberId)
      .select('sub.*');
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

//fetches product ids of the packages which has quantity
const getStripeProductIds = async (): Promise<(string | Error)[]> => {
  try {
    const productIds = await knex('packages')
      .whereIn('type', [
        PACKAGES_TYPES.PMT,
        PACKAGES_TYPES.DEDOCO,
        PACKAGES_TYPES.TIME_ATTENDANCE,
      ])
      .select('product_id');

    const res = productIds.map((pd) => {
      return pd.product_id;
    }) as string[];
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getExpiredCompanySubscriptions = async (
  companyId: CompanyId,
): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const res = await knex
      .from('company_subscriptions')
      .where(
        knex.raw(`
          company_id = ${companyId}
          AND (active = 0 OR end_date < NOW())
        `),
      )
      .orderBy('start_date', 'desc')
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getActiveTrialSubscriptions = async (): Promise<
  {
    id: number;
    company_id: number;
    package_title: string;
    start_date: string;
    end_date: string;
    companyId: number;
    packageTitle: string;
    startDate: string;
    endDate: string;
  }[]
> => {
  try {
    const rawResult = await knex.raw(`
      SELECT
        id,
        company_id,
        package_title,
        start_date,
        end_date
      FROM
        company_subscriptions
      WHERE
        end_date > NOW()
        AND start_date < NOW()
        AND (subscription_id like "%test%"
        OR subscription_id like "%trial%" 
        OR subscription_id is NULL)
		`);

    const res = _.head(rawResult);

    return camelize(res) as {
      id: number;
      company_id: number;
      package_title: string;
      start_date: string;
      end_date: string;
      companyId: number;
      packageTitle: string;
      startDate: string;
      endDate: string;
    }[];
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanyInactiveSubscriptions = async ({
  packageId,
  companyId,
}: {
  packageId: number;
  companyId: CompanyId;
}) => {
  try {
    const res = await knex
      .from(TableNames.COMPANY_SUBSCRIPTIONS)
      .where({ company_id: companyId, package_id: packageId, status: 3 })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  getStripeProductIds,
  consumeQuotas,
  getActiveCompaniesSubscriptions,
  getActiveCompanySubscriptions,
  getCurrentAnnualSubscriptions,
  getPackagePrices,
  getPackages,
  getDedocoPackages,
  incrementSubscriptionQuotas,
  insertSubscription,
  insertSubscriptionLegacy,
  isSubscriptionActive,
  removeSubscriptionByCompanyId,
  updatePaymentSuccess,
  updateSubscriptionStatus,
  updateSubscriptionPeriodDates,
  updateSubscriptionStatusLegacy,
  updateSubscriptionStatusByStripeSubId,
  updateSubscriptionQuantity,
  upgradeCompanySub,
  verifySubscriptionExistence,
  getPackagePriceByStripeId,
  getCompanySubscriptionWithPackage,
  decrementQuotaByOne,
  getSubscriptionQuantityAssignments,
  assignSubscriptionQuantityToMember,
  removeSubscriptionQuantityFromMember,
  getSubscriptionByMemberId,
  insertDedocoSubscription,
  getExpiredCompanySubscriptions,
  getActiveTrialSubscriptions,
  getCompanyInactiveSubscriptions,
  updateSubscriptionQuotaLegacy,
  ...SubscriptionNewStore,
};
