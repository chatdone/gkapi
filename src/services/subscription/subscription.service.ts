import dayjs from 'dayjs';
import _ from 'lodash';
import Stripe from 'stripe';
import { createLoaders, SubscriptionStore, UserStore } from '@data-access';
import SubscriptionNewService from './subscription-new.service';
import {
  CompanyId,
  CompanyMemberId,
  CompanyModel,
  CompanyMemberModel,
} from '@models/company.model';
import {
  CompanySubscriptionId,
  CompanySubscriptionModel,
  CompanySubscriptionWithPackageModel,
  CompanySubscriptionWithQuotaRefreshModel,
  CreateInsertSubscriptionPayload,
  DiscountedPriceModel,
  InsertOmniSubscriptionPayload,
  InsertSubscriptionPayload,
  PricesWithProductIdModel,
  QuotaPayload,
  StripeInvoiceModel,
  StripePromoCodeModel,
  SubscriptionPackageId,
  SubscriptionPackageModel,
  SubscriptionPackagePriceModel,
  UpdateSubscriptionQuotaPayload,
  SubscriptionQuantityResultModel,
  InsertDedocoSubscriptionPayload,
} from '@models/subscription.model';
import { UserId, UserModel } from '@models/user.model';
import { CompanyService, StripeService, SubscriptionService } from '@services';
import logger from '@tools/logger';
import { CreateSubscriptionInput } from '@generated/graphql-types';
import { PACKAGES_TYPES } from '@data-access/subscription/subscription.store';

const getCurrentDate = (): dayjs.Dayjs => dayjs.utc();

export const PACKAGE_INTERVAL = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 1,
  OVERDUE: 2,
  CANCELLED: 3,
  INCOMPLETE: 4,
  TRIAL: 5,
};

export const INVOICE_STATUS = {
  PAID: 1,
  OPEN: 2,
  UNCOLLECTIBLE: 3,
  VOID: 4,
  DRAFT: 5,
};

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];

const getPackages = async (): Promise<(SubscriptionPackageModel | Error)[]> => {
  try {
    const res = await SubscriptionStore.getPackages();
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service,
        fnName: 'getPackages',
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getDedocoPackages = async (): Promise<
  (SubscriptionPackageModel | Error)[]
> => {
  try {
    const res = await SubscriptionStore.getDedocoPackages();
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service,
        fnName: 'getDedocoPackages',
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getPackagePrices = async (
  packageId: SubscriptionPackageId,
): Promise<(SubscriptionPackagePriceModel | Error)[]> => {
  try {
    const res = await SubscriptionStore.getPackagePrices(packageId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'getPackagePrices', packageId },
    });
    return Promise.reject(error);
  }
};

const getSubscriptionsByUser = async (
  userId: UserId,
): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const companies = (await CompanyService.getCompanies(
      userId,
    )) as CompanyModel[];
    const companyIds = companies.map((c) => c.id);

    const res = await SubscriptionStore.getActiveCompaniesSubscriptions(
      companyIds,
    );
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'getSubscriptionsByUser', userId },
    });
    return Promise.reject(error);
  }
};

const isOmniSubscriptionRequestValid = async ({
  user,
  company,
  pricesWithQuantity,
  subscriptionPackages,
  trial,
}: {
  user: UserModel;
  company: CompanyModel;
  pricesWithQuantity: SubscriptionPackagePriceModel[];
  subscriptionPackages: SubscriptionPackageModel[];
  promo?: StripePromoCodeModel;
  trial?: boolean;
}): Promise<boolean | Error> => {
  try {
    if (!user || !company || !pricesWithQuantity || !subscriptionPackages) {
      throw new Error('Missing required parameters');
    }

    const activeSubscriptions =
      (await SubscriptionStore.getActiveCompanySubscriptions(
        company.id,
      )) as CompanySubscriptionModel[];

    if (trial) {
      if (user.signup_data?.trial === true) {
        const exisitingTrialPackageIds = user?.signup_data?.packageIds;

        const newTrialPackageIds = subscriptionPackages.map((sub) => sub.id);

        const hasExistingPackage = exisitingTrialPackageIds.filter((sub) => {
          if (newTrialPackageIds.includes(sub)) {
            throw new Error(
              'User have already used trial quota for the requested subscription package',
            );
          }
        });
      }

      const nonTrialActiveSubscription = activeSubscriptions.filter((sub) => {
        if (sub.status !== SUBSCRIPTION_STATUS.TRIAL) {
          return sub;
        }
      });

      if (nonTrialActiveSubscription.length > 0) {
        throw new Error(
          'You currently have active subscription, please cancel it to use trial option',
        );
      }
    }

    //disallow user from subscribing to the same type of package if it exists
    const hasSamePackageType = activeSubscriptions?.forEach((sub) => {
      subscriptionPackages.forEach((newSub) => {
        if (newSub?.type === sub?.data?.type) {
          throw new Error('Active subscription of the same type exist');
        }
      });
    });

    //filter out dedoco package
    const filteredSubscriptions = activeSubscriptions.filter(
      (sub: CompanySubscriptionModel) => {
        sub.data.type !== 5;
      },
    ) as CompanySubscriptionModel[];

    if (!trial && filteredSubscriptions.length > 0) {
      throw new Error(
        'Cannot create new subscription without cancelling existing subscription',
      );
    }

    const projectManagementPackage = subscriptionPackages.find(
      (p) => p.type === 3,
    );

    const basicPackage = subscriptionPackages.find((p) => p.type === 1);

    if (projectManagementPackage) {
      if (!basicPackage) {
        throw new Error(
          'Cannot subscribe to project management package without any basic package in the list',
        );
      }
    }

    if (!trial) {
      if (!user.customer_id) {
        throw new Error('Stripe customer id is missing');
      }
      const paymentMethodId = _.get(user, 'payment_method_id');
      if (!paymentMethodId) {
        throw new Error('Please add a payment method');
      }
    }

    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        user,
        company,
        pricesWithQuantity,
        subscriptionPackages,
        trial,
      },
    });
    return Promise.reject(error);
  }
};

const isSubscriptionRequestValid = async ({
  user,
  company,
  price,
  pkg,
}: {
  user: UserModel;
  company: CompanyModel;
  price: SubscriptionPackagePriceModel;
  pkg: SubscriptionPackageModel;
  promo?: StripePromoCodeModel;
}): Promise<boolean | Error> => {
  try {
    if (!user || !company || !price || !pkg) {
      throw new Error('Missing parameters');
    }

    const isSubActive = await SubscriptionStore.isSubscriptionActive(
      company.id,
    );

    if (isSubActive) {
      throw new Error(
        `${company.name} is already subscribed to the ${pkg.title} package`,
      );
    }

    if (!user.customer_id) {
      throw new Error('Customer id is missing');
    }

    const paymentMethodId = _.get(user, 'payment_method_id');
    if (!paymentMethodId) {
      throw new Error('Please add a payment method');
    }

    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'isSubscriptionRequestValid',
        userId: user?.id,
        company: company?.id,
        price,
        pkg,
      },
    });
    return Promise.reject(error);
  }
};

const getSubscriptionStatusForStripeStatus = (stripeStatus: string): number => {
  const mapping: Record<string, number> = {
    active: SUBSCRIPTION_STATUS.ACTIVE,
    past_due: SUBSCRIPTION_STATUS.OVERDUE,
    unpaid: SUBSCRIPTION_STATUS.OVERDUE,
    canceled: SUBSCRIPTION_STATUS.CANCELLED,
    incomplete: SUBSCRIPTION_STATUS.INCOMPLETE,
    incomplete_expired: SUBSCRIPTION_STATUS.INCOMPLETE,
    trialing: SUBSCRIPTION_STATUS.TRIAL,
  };
  return mapping[stripeStatus] || 0;
};

const getSubscriptionActiveStatus = (status: number): boolean => {
  if (status === SUBSCRIPTION_STATUS.ACTIVE || SUBSCRIPTION_STATUS.TRIAL) {
    return true;
  } else {
    return false;
  }
};

const getActiveCompanySubscriptions = async (companyId: CompanyId) => {
  try {
    const res = await SubscriptionStore.getActiveCompanySubscriptions(
      companyId,
    );
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'getActiveCompanySubscriptions', companyId },
    });

    return Promise.reject(error);
  }
};

const getSubscriptionEndDateString = async ({
  currentDate,
  interval,
  duration,
}: {
  currentDate: dayjs.Dayjs;
  interval: string;
  duration: number;
}): Promise<string> => {
  try {
    let endDate;
    switch (interval) {
      case PACKAGE_INTERVAL.DAY:
        endDate = currentDate
          .add(duration, 'day')
          .toISOString()
          .replace('Z', '');
        break;
      case PACKAGE_INTERVAL.WEEK:
        endDate = currentDate
          .add(duration, 'week')
          .toISOString()
          .replace('Z', '');
        break;
      case PACKAGE_INTERVAL.MONTH:
        endDate = currentDate
          .add(duration, 'month')
          .toISOString()
          .replace('Z', '');
        break;
      case PACKAGE_INTERVAL.YEAR:
        endDate = currentDate
          .add(duration, 'year')
          .toISOString()
          .replace('Z', '');
        break;
      default:
        throw new Error('Invalid package duration type');
    }
    return endDate;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getSubscriptionEndDateString',
        currentDate,
        interval,
        duration,
      },
    });
    return Promise.reject(error);
  }
};

const createSubscriptionInsertOptions = ({
  company,
  pkg,
  price,
  startDate,
  endDate,
  user,
  status,
  promo,
}: {
  company: CompanyModel;
  pkg: SubscriptionPackageModel;
  price: SubscriptionPackagePriceModel;
  startDate: string;
  endDate: string;
  user: UserModel;
  status: number;
  promo?: StripePromoCodeModel;
}): InsertSubscriptionPayload => {
  return {
    companyId: company.id,
    packageId: pkg.id,
    productId: pkg.product_id,
    priceId: price.stripe_price_id,
    packageTitle: pkg.title,
    packageDescription: pkg.description,
    smsQuota: pkg.sms_quota || 0,
    phoneCallQuota: pkg.phone_call_quota || 0,
    emailQuota: pkg.email_quota || 0,
    whatsAppQuota: pkg.whatsapp_quota || 0,
    price: price.price,
    interval: price.interval,
    intervalCount: price.interval_count,
    startDate,
    endDate,
    createdBy: user.id,
    packageData: JSON.stringify(pkg),
    status,
    promo,
  };
};

const getOmniSubscriptionInsertOptions = async ({
  stripeSubscription,
  dataToInsert,
  company,
  updatedStatus,
  user,
  startDate,
}: {
  stripeSubscription: Stripe.Subscription;
  dataToInsert: CreateInsertSubscriptionPayload[];
  company: CompanyModel;
  updatedStatus: number;
  user: UserModel;
  startDate: string;
}): Promise<InsertOmniSubscriptionPayload[] | Error> => {
  try {
    const rowsToInsert = (await Promise.all(
      stripeSubscription.items.data.map(async (sub_item) => {
        const currentPackage = (await getCorrespondingPackage({
          dataToInsert,
          sub_item,
        })) as CreateInsertSubscriptionPayload;

        if (currentPackage) {
          return {
            company_id: company.id,
            package_id: currentPackage.subscriptionPackage.id,
            subscription_id: stripeSubscription.id,
            product_id: sub_item.price.product,
            item_id: sub_item.id,
            price_id: sub_item.price.id,
            package_title: currentPackage.subscriptionPackage.title,
            package_description: currentPackage.subscriptionPackage.description,
            sms_quota: currentPackage.subscriptionPackage.sms_quota || 0,
            phone_call_quota:
              currentPackage.subscriptionPackage.phone_call_quota || 0,
            email_quota: currentPackage.subscriptionPackage.email_quota || 0,
            whatsApp_quota:
              currentPackage.subscriptionPackage.whatsapp_quota || 0,
            price: currentPackage.price.price,
            interval: currentPackage.price.interval,
            interval_count: currentPackage.price.interval_count,
            start_date: startDate,
            end_date: currentPackage.endDate,
            created_by: user.id,
            quantity: currentPackage.quantity,
            data: JSON.stringify(currentPackage.subscriptionPackage),
            status: updatedStatus,
          };
        }
      }),
    )) as InsertOmniSubscriptionPayload[];

    return rowsToInsert.filter((row) => row !== undefined);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        stripeSubscription,
        dataToInsert,
        company: company.id,
        updatedStatus,
        user: user?.id,
        startDate,
      },
    });
    return Promise.reject(error);
  }
};

const getTrialOmniSubscriptionInsertOptions = async ({
  dataToInsert,
  company,
  updatedStatus,
  user,
  startDate,
}: {
  dataToInsert: CreateInsertSubscriptionPayload[];
  company: CompanyModel;
  updatedStatus: number;
  user: UserModel;
  startDate: string;
}): Promise<InsertOmniSubscriptionPayload[] | Error> => {
  try {
    const insertOptions = dataToInsert.map(
      (data: CreateInsertSubscriptionPayload) => ({
        company_id: company.id,
        package_id: data.subscriptionPackage.id,
        subscription_id: 'Trial',
        product_id: data.subscriptionPackage.product_id,
        item_id: 'Trial',
        price_id: data.price.stripe_price_id,
        package_title: data.subscriptionPackage.title,
        package_description: data.subscriptionPackage.description,
        sms_quota: data.subscriptionPackage.sms_quota || 0,
        phone_call_quota: data.subscriptionPackage.phone_call_quota || 0,
        email_quota: data.subscriptionPackage.email_quota || 0,
        whatsApp_quota: data.subscriptionPackage.whatsapp_quota || 0,
        price: data.price.price,
        interval: data.price.interval,
        interval_count: data.price.interval_count,
        start_date: startDate,
        end_date: data.endDate,
        created_by: user.id,
        quantity: data.quantity,
        data: JSON.stringify(data.subscriptionPackage),
        status: updatedStatus,
        active: true,
      }),
    );
    return insertOptions;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        dataToInsert,
        company: company?.id,
        updatedStatus,
        user: user?.id,
        startDate,
      },
    });
    return Promise.reject(error);
  }
};

const listUserInvoices = async ({
  user,
}: {
  user: UserModel;
}): Promise<(StripeInvoiceModel | Error)[]> => {
  try {
    if (user?.customer_id) {
      const res = await StripeService.getCustomerInvoices(user?.customer_id);
      return res;
    } else {
      const stripeCustomer = (await StripeService.createCustomer({
        email: user?.email,
        name: user?.name,
      })) as Stripe.Customer;

      const updatedUser = (await UserStore.updateCustomerId({
        userId: user?.id,
        customerId: stripeCustomer.id,
      })) as UserModel;

      const res = (await StripeService.getCustomerInvoices(
        updatedUser?.customer_id,
      )) as StripeInvoiceModel[];
      return res;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'listUserInvoices', user: user?.id },
    });
    return Promise.reject(error);
  }
};

const invoicePaymentCompleted = async (
  event: Stripe.Event,
): Promise<boolean | Error> => {
  try {
    // @ts-ignore
    const { object } = event.data;
    // console.log('data', object);
    const updateRes = await SubscriptionStore.updatePaymentSuccess(
      // @ts-ignore
      object.subscription,
    );
    return updateRes;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'invoicePaymentCompleted', event },
    });
    return Promise.reject(error);
  }
};

const subscriptionUpdated = async (
  event: Stripe.Event,
): Promise<boolean | Error> => {
  try {
    const { object } = event.data;
    // @ts-ignore
    const subscriptionItems = object?.items?.data?.map(
      // @ts-ignore
      (item: any) => item.plan.product,
    );

    const products = (await StripeService.getStripeProduct(
      subscriptionItems,
    )) as Stripe.Product[];

    // @ts-ignore
    const subscriptionId = object?.id as string;
    // @ts-ignore

    const status = getSubscriptionStatusForStripeStatus(object?.status);

    const startDate = dayjs
      // @ts-ignore
      .unix(object?.current_period_start)
      .format('YYYY-MM-DD');
    const endDate = dayjs
      // @ts-ignore
      .unix(object?.current_period_end)
      .format('YYYY-MM-DD');

    const updateRes = await SubscriptionStore.updateSubscriptionPeriodDates({
      subscriptionId,
      startDate,
      endDate,
    });

    const payload = products.map((product) => ({
      product_id: product.id,
      whatsApp_quota: _.toNumber(product?.metadata?.whatsAppQuota),
      email_quota: _.toNumber(product?.metadata?.emailQuota),
    })) as UpdateSubscriptionQuotaPayload[];

    const updateQuotaRes =
      await SubscriptionStore.updateSubscriptionQuotaLegacy({
        subscriptionId,
        payload,
      });

    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'subscriptionUpdated', event },
    });
    return Promise.reject(error);
  }
};

const subscriptionDeleted = async (event: Stripe.Event) => {
  try {
    const { object } = event.data;
    // @ts-ignore
    const status = getSubscriptionStatusForStripeStatus(object?.status);
    const active = getSubscriptionActiveStatus(status);

    const canceledDate = dayjs
      // @ts-ignore
      .unix(object?.canceled_at)
      .format('YYYY-MM-DDTHH:mm:ss') as string;
    // @ts-ignore

    const cancelAtPeriodEnd = object?.cancel_at_period_end;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'subscriptionDeleted', event },
    });
    return Promise.reject(error);
  }
};

const getPromoCodeInfo = async ({
  code,
  prices,
  createSubscriptionInput,
  subscriptionPackages,
}: {
  code: string;
  prices: SubscriptionPackagePriceModel[];
  createSubscriptionInput: CreateSubscriptionInput[];
  subscriptionPackages: SubscriptionPackageModel[];
}): Promise<(DiscountedPriceModel | Error)[]> => {
  try {
    const pricesWithProductId = prices.map((price) => ({
      ...price,
      quantity: createSubscriptionInput.find(
        (cs: CreateSubscriptionInput) => cs.package_price_id === price.id_text,
      )?.quantity,
      productId: subscriptionPackages.find((s) => s.id === price.package_id)
        ?.product_id,
    })) as PricesWithProductIdModel[];

    const promoCode = await StripeService.getPromoCode(code);

    const applicableProductIds = promoCode.coupon.applies_to?.products || [];

    const res = getCalculatedPrice({
      pricesWithProductId,
      applicableProductIds,
      promoCode,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        code,
        prices,
        createSubscriptionInput,
        subscriptionPackages,
      },
    });
    return Promise.reject(error);
  }
};

const getCalculatedPrice = async ({
  pricesWithProductId,
  applicableProductIds,
  promoCode,
}: {
  pricesWithProductId: PricesWithProductIdModel[];
  applicableProductIds: string[];
  promoCode: StripePromoCodeModel;
}): Promise<DiscountedPriceModel[]> => {
  const arr: DiscountedPriceModel[] = [];

  pricesWithProductId.forEach((priceObj) => {
    const product = applicableProductIds.find(
      (id) => priceObj.productId === id,
    );
    if (product) {
      arr.push({
        ...priceObj,
        discounted_price: calculateDiscountedPrice({
          quantity: priceObj.quantity,
          priceValue: priceObj.price,
          promoCode,
        }),
        price: priceObj.price * priceObj.quantity,
        price_per_unit: priceObj.price,
      });
    } else {
      arr.push({
        ...priceObj,
        price: priceObj.price * priceObj.quantity,
        price_per_unit: priceObj.price,
      });
    }
  });
  return arr;
};

const calculateDiscountedPrice = ({
  priceValue,
  promoCode,
  quantity,
}: {
  priceValue: number;
  promoCode: StripePromoCodeModel;
  quantity: number;
}): number => {
  if (promoCode.coupon?.amount_off) {
    return priceValue * quantity - promoCode.coupon?.amount_off;
  } else if (promoCode.coupon?.percent_off) {
    return (
      priceValue * quantity -
      priceValue * (promoCode.coupon?.percent_off / 100) * quantity
    );
  } else {
    return priceValue;
  }
};

const consumeQuotas = async ({
  quotas,
  companyId,
}: {
  quotas: QuotaPayload;
  companyId: CompanyId;
}): Promise<number | Error> => {
  try {
    const res = await SubscriptionStore.consumeQuotas({ quotas, companyId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'consumeQuotas', quotas, companyId },
    });
    return Promise.reject(error);
  }
};

const isPaidCompany = async (
  companyId: CompanyId,
): Promise<boolean | Error> => {
  const companySubscriptions = (await getActiveCompanySubscriptions(
    companyId,
  )) as CompanySubscriptionModel[];

  //filter for PaymentCollectionReminder package from the list of subscriptions

  let paymentCollectionReminderPackage = [];

  if (_.isEmpty(companySubscriptions)) {
    return false;
  } else {
    paymentCollectionReminderPackage = companySubscriptions.filter(
      (companySubscription) => companySubscription.data?.type === 4,
    );
  }

  return !_.isEmpty(paymentCollectionReminderPackage);
};

const getCorrespondingPackage = async ({
  sub_item,
  dataToInsert,
}: {
  sub_item: Stripe.SubscriptionItem;
  dataToInsert: CreateInsertSubscriptionPayload[];
}): Promise<any | Error> => {
  try {
    const subscriptionPackage = dataToInsert.find(
      (data) => sub_item.price.product === data.subscriptionPackage.product_id,
    ) as CreateInsertSubscriptionPayload;

    return subscriptionPackage;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getCorrespondingPackage',
        sub_item,
        dataToInsert,
      },
    });
    return Promise.reject(error);
  }
};

const createDedocoSubscription = async ({
  user,
  company,
  priceWithQuantity,
  subscriptionPackage,
}: {
  user: UserModel;
  company: CompanyModel;
  priceWithQuantity: SubscriptionPackagePriceModel;
  subscriptionPackage: SubscriptionPackageModel;
}) => {
  try {
    const valid = await isDedocoSubscriptionRequestValid({
      user,
      company,
      priceWithQuantity,
      subscriptionPackage,
    });

    if (!valid) {
      throw new Error('Subscription request is invalid.');
    }

    const startDate = dayjs().utc().toISOString().replace('Z', '');

    const endDate = await getSubscriptionEndDateString({
      currentDate: getCurrentDate(),
      interval: priceWithQuantity.interval,
      duration: priceWithQuantity.interval_count,
    });

    if (subscriptionPackage?.product_id?.includes('prod_free_dedoco')) {
      const hasUsedFreeTrialBefore = await hasCompanyUsedFreeTrialBefore({
        freeTrialPackage: subscriptionPackage,
        company,
      });

      if (hasUsedFreeTrialBefore) {
        throw new Error('Company has already used free trial before.');
      }
      const payload = getDedocoSubscriptionInsertPayload({
        stripeInvoiceItem: {
          id: 'trial',
          price: { id: 'trial' },
        } as Stripe.InvoiceItem,
        stripeInvoiceStatus: 1,
        subscriptionPackage,
        priceWithQuantity,
        startDate,
        endDate,
        companyId: company?.id,
        userId: user?.id,
      });

      const res = (await SubscriptionStore.insertDedocoSubscription(
        payload,
      )) as CompanySubscriptionModel;

      return res;
    }

    //create stripe invoice to charge the customer
    const stripeInvoice = (await StripeService.createStripeInvoice(
      user.customer_id,
    )) as Stripe.Invoice;

    //create stripe invoice item and attach it to the created invoice
    const stripeInvoiceItem = (await StripeService.createStripeInvoiceItem({
      customerId: user.customer_id,
      invoiceId: stripeInvoice.id,
      payload: {
        priceId: priceWithQuantity.stripe_price_id,
        quantity: priceWithQuantity.quantity as number,
      },
    })) as Stripe.InvoiceItem;

    //update the invoice to automatically collect payment for the invoice
    const updatedStripeInvoice =
      (await StripeService.updateInvoiceToChargeAutomatically(
        stripeInvoiceItem.invoice as string,
      )) as Stripe.Invoice;

    const paidStripeInvoice = await StripeService.payStripeInvoice({
      invoiceId: updatedStripeInvoice.id as string,
      paymentMethodId: user.payment_method_id,
    });

    const stripeInvoiceStatus = getStripeInvoiceStatus(
      paidStripeInvoice?.status as string,
    );

    if (stripeInvoiceStatus !== INVOICE_STATUS.PAID) {
      throw new Error(
        'Payment is pending, please check your invoice list to make payment',
      );
    }

    const payload = getDedocoSubscriptionInsertPayload({
      stripeInvoiceItem,
      stripeInvoiceStatus,
      subscriptionPackage,
      priceWithQuantity,
      startDate,
      endDate,
      companyId: company.id,
      userId: user.id,
    });

    const res = (await SubscriptionStore.insertDedocoSubscription(
      payload,
    )) as CompanySubscriptionModel;

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        user: user?.id,
        company: company?.id,
        priceWithQuantity,
        subscriptionPackage,
      },
    });
    return Promise.reject(error);
  }
};

const hasCompanyUsedFreeTrialBefore = async ({
  freeTrialPackage,
  company,
}: {
  freeTrialPackage: SubscriptionPackageModel;
  company: CompanyModel;
}): Promise<boolean> => {
  try {
    const subs = await SubscriptionStore.getCompanyInactiveSubscriptions({
      companyId: company?.id,
      packageId: freeTrialPackage?.id,
    });

    if (!_.isEmpty(subs)) {
      return true;
    }

    return false;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        freeTrialPackage,
        company,
      },
    });
    return true;
  }
};

const getStripeInvoiceStatus = (stripeInvoiceStatus: string): number => {
  const mapping: Record<string, number> = {
    paid: INVOICE_STATUS.PAID,
    open: INVOICE_STATUS.OPEN,
    uncollectible: INVOICE_STATUS.UNCOLLECTIBLE,
    void: INVOICE_STATUS.VOID,
    draft: INVOICE_STATUS.DRAFT,
  };
  return mapping[stripeInvoiceStatus] || 0;
};

const getDedocoSubscriptionInsertPayload = ({
  stripeInvoiceItem,
  stripeInvoiceStatus,
  subscriptionPackage,
  priceWithQuantity,
  startDate,
  endDate,
  companyId,
  userId,
}: {
  stripeInvoiceItem: Stripe.InvoiceItem;
  stripeInvoiceStatus: number;
  subscriptionPackage: SubscriptionPackageModel;
  priceWithQuantity: SubscriptionPackagePriceModel;
  startDate: string;
  endDate: string;
  companyId: CompanyId;
  userId: UserId;
}): InsertDedocoSubscriptionPayload => {
  const payload = {
    company_id: companyId,
    package_id: subscriptionPackage.id,
    product_id: subscriptionPackage.product_id,
    price_id: stripeInvoiceItem.price?.id,
    package_title: subscriptionPackage.title,
    item_id: stripeInvoiceItem.id,
    sms_quota: 0,
    phone_call_quota: 0,
    email_quota: 0,
    whatsApp_quota: 0,
    signature_quota: subscriptionPackage.signature_quota,
    price: priceWithQuantity.price,
    interval: priceWithQuantity.interval,
    interval_count: priceWithQuantity.interval_count,
    start_date: startDate,
    end_date: endDate,
    status: stripeInvoiceStatus,
    created_by: userId,
    data: JSON.stringify(subscriptionPackage),
  } as InsertDedocoSubscriptionPayload;

  return payload;
};

const isDedocoSubscriptionRequestValid = async ({
  user,
  company,
  priceWithQuantity,
  subscriptionPackage,
}: {
  user: UserModel;
  company: CompanyModel;
  priceWithQuantity: SubscriptionPackagePriceModel;
  subscriptionPackage: SubscriptionPackageModel;
  promo?: StripePromoCodeModel;
}): Promise<boolean | Error> => {
  try {
    if (!user || !company || !priceWithQuantity || !subscriptionPackage) {
      throw new Error('Missing required parameters');
    }

    if (subscriptionPackage.type !== 5) {
      throw new Error('This is not a dedoco package');
    }

    const activeSubscriptions =
      (await SubscriptionStore.getActiveCompanySubscriptions(
        company.id,
      )) as CompanySubscriptionModel[];

    const dedocoPackageExist = activeSubscriptions.filter(
      (subscription: CompanySubscriptionModel) => {
        if (subscription.product_id === subscriptionPackage.product_id) {
          return subscription;
        }
      },
    );

    if (!_.isEmpty(dedocoPackageExist)) {
      throw new Error('You are already subscribed to dedoco package');
    }

    if (!user.customer_id) {
      throw new Error('Stripe customer id is missing');
    }
    const paymentMethodId = _.get(user, 'payment_method_id');
    if (!paymentMethodId) {
      throw new Error('Please add a payment method');
    }

    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        user: user?.id,
        company: company?.id,
        priceWithQuantity,
        subscriptionPackage,
      },
    });
    return Promise.reject(error);
  }
};

const createTrialOmniSubscription = async ({
  user,
  company,
  pricesWithQuantity,
  subscriptionPackages,
  trialDays,
}: {
  user: UserModel;
  company: CompanyModel;
  pricesWithQuantity: SubscriptionPackagePriceModel[];
  subscriptionPackages: SubscriptionPackageModel[];
  trialDays: number;
}): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const valid = await isOmniSubscriptionRequestValid({
      user,
      company,
      pricesWithQuantity,
      subscriptionPackages,
      trial: true,
    });

    if (!valid) {
      throw new Error('Trial subscription request is invalid.');
    }

    const startDate = dayjs().utc().toISOString().replace('Z', '');

    const dataToInsert = [] as CreateInsertSubscriptionPayload[];

    for (const price of pricesWithQuantity) {
      const endDate = await getSubscriptionEndDateString({
        currentDate: getCurrentDate(),
        interval: PACKAGE_INTERVAL.DAY,
        duration: trialDays,
      });

      dataToInsert.push({
        price,
        quantity: price.quantity,
        endDate,
        //@ts-ignore
        subscriptionPackage: subscriptionPackages.find(
          (sp) => sp.id === price.package_id,
        ),
      });
    }

    const updatedStatus = SUBSCRIPTION_STATUS.TRIAL;

    const insertOptions = (await getTrialOmniSubscriptionInsertOptions({
      dataToInsert,
      company,
      updatedStatus,
      user,
      startDate,
    })) as InsertOmniSubscriptionPayload[];

    const insertResult = (await SubscriptionStore.insertSubscription(
      insertOptions,
    )) as CompanySubscriptionModel[];

    if (insertResult) {
      await insertUserTrialSubscriptionData({ user, subscriptionPackages });
    }

    return insertResult;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        user: user?.id,
        company: company?.id,
        pricesWithQuantity,
        subscriptionPackages,
      },
    });
    return Promise.reject(error);
  }
};

const insertUserTrialSubscriptionData = async ({
  user,
  subscriptionPackages,
}: {
  user: UserModel;
  subscriptionPackages: SubscriptionPackageModel[];
}): Promise<Error | void> => {
  try {
    const existingPackageIds = user?.signup_data?.packageIds;

    let newPackageIds = subscriptionPackages.map((pckg) => pckg.id);

    if (existingPackageIds?.length > 0) {
      newPackageIds = newPackageIds.concat(existingPackageIds);
    }

    await UserStore.updateUserSignUpData({
      userId: user.id,
      payload: { trial: true, packageIds: newPackageIds },
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'insertUserTrialSubscriptionData',
        user: user?.id,
        subscriptionPackages,
      },
    });
    return Promise.reject(error);
  }
};

const createOmniSubscription = async ({
  user,
  company,
  pricesWithQuantity,
  subscriptionPackages,
  promo,
}: {
  user: UserModel;
  company: CompanyModel;
  pricesWithQuantity: SubscriptionPackagePriceModel[];
  subscriptionPackages: SubscriptionPackageModel[];
  promo?: StripePromoCodeModel;
}): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const valid = await isOmniSubscriptionRequestValid({
      user,
      company,
      pricesWithQuantity,
      subscriptionPackages,
    });

    if (!valid) {
      throw new Error('Subscription request is invalid.');
    }

    const startDate = dayjs().utc().toISOString().replace('Z', '');

    const dataToInsert = [] as CreateInsertSubscriptionPayload[];

    for (const price of pricesWithQuantity) {
      const endDate = await getSubscriptionEndDateString({
        currentDate: getCurrentDate(),
        interval: price.interval,
        duration: price.interval_count,
      });

      dataToInsert.push({
        price,
        quantity: price.quantity,
        endDate,
        //@ts-ignore
        subscriptionPackage: subscriptionPackages.find(
          (sp) => sp.id === price.package_id,
        ),
      });
    }

    const stripeSubscription = (await StripeService.createStripeSubscription({
      customerId: user.customer_id,
      pricesWithQuantity,
      promoId: promo?.id,
      defaultPaymentMethod: user.payment_method_id,
    })) as Stripe.Subscription;

    const updatedStatus = exportFunctions.getSubscriptionStatusForStripeStatus(
      stripeSubscription.status,
    );

    const insertOptions = (await getOmniSubscriptionInsertOptions({
      stripeSubscription,
      dataToInsert,
      company,
      updatedStatus,
      user,
      startDate,
    })) as InsertOmniSubscriptionPayload[];

    const insertResult = (await SubscriptionStore.insertSubscription(
      insertOptions,
    )) as CompanySubscriptionModel[];

    const updateRes = (await SubscriptionStore.updateSubscriptionStatus({
      id: insertResult.map((res) => res.id),
      subscriptionId: stripeSubscription.id,
      status: updatedStatus,
      activeStatus: 1,
    })) as CompanySubscriptionModel[];

    if (
      updatedStatus !== SUBSCRIPTION_STATUS.TRIAL &&
      updatedStatus !== SUBSCRIPTION_STATUS.ACTIVE
    ) {
      throw new Error(
        'Your payment is pending. Please view the invoice details in the Settings > Payment tab for further action.',
      );
    } else {
      return updateRes;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        user: user?.id,
        company: company?.id,
        pricesWithQuantity,
        subscriptionPackages,
        promo,
      },
    });
    return Promise.reject(error);
  }
};

const cancelOmniTrialSubscription = async ({
  companySubscription,
}: {
  companyId: CompanyId;
  companySubscription: CompanySubscriptionModel;
}): Promise<CompanySubscriptionModel | Error> => {
  try {
    const valid = await isCancelTrialSubscriptionValid({ companySubscription });
    if (!valid) {
      throw new Error('Subscription cancellation request is invalid');
    }
    const updateRes = await SubscriptionStore.updateSubscriptionStatus({
      id: [companySubscription.id],
      subscriptionId: companySubscription.subscription_id,
      status: SUBSCRIPTION_STATUS.CANCELLED,
      activeStatus: 1,
      cancelDate: true,
      cancelAtEnd: true,
    });
    return _.head(updateRes) as CompanySubscriptionModel;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'cancelOmniTrialSubscription',
        companySubscription,
      },
    });
    return Promise.reject(error);
  }
};

const isCancelTrialSubscriptionValid = ({
  companySubscription,
}: {
  companySubscription: CompanySubscriptionModel;
}) => {
  try {
    if (companySubscription.active === 0) {
      throw new Error('The selected subscription package is not active');
    }
    if (companySubscription.status !== SUBSCRIPTION_STATUS.TRIAL) {
      throw new Error('The selected package is not a trial package');
    }
    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'isCancelTrialSubscriptionValid',
        companySubscription,
      },
    });
    return Promise.reject(error);
  }
};

const cancelOmniSubscription = async ({
  companyId,
  companySubscription,
  stripeSubscriptionId,
}: {
  companyId: CompanyId;
  companySubscription: CompanySubscriptionModel;
  stripeSubscriptionId: string;
}): Promise<CompanySubscriptionModel | Error> => {
  try {
    /*
     * check if the request is valid
     * if valid, continue to request for cancellation with stripe
     * update local database
     * return updated object
     */
    const valid = await isCancelOmniSubscriptionValid({
      companyId,
      companySubscription,
      stripeSubscriptionId,
    });

    if (!valid) {
      throw new Error('Subscription cancellation request is invalid');
    }

    const stripeRes = await StripeService.cancelSubscription(
      stripeSubscriptionId,
    );

    const updatedStatus = getSubscriptionStatusForStripeStatus(
      stripeRes.status,
    );

    if (updatedStatus !== SUBSCRIPTION_STATUS.CANCELLED) {
      throw new Error('Failed to cancel subscription');
    }

    const updateRes = await SubscriptionStore.updateSubscriptionStatus({
      id: [companySubscription.id],
      subscriptionId: stripeRes.id,
      status: updatedStatus,
      activeStatus: 1,
      cancelDate: true,
      cancelAtEnd: true,
    });

    return updateRes[0];
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        companyId,
        companySubscription,
        stripeSubscriptionId,
      },
    });
    return Promise.reject(error);
  }
};

const cancelAllSubscriptions = async ({
  companyId,
  subscriptions,
}: {
  companyId: CompanyId;
  subscriptions: CompanySubscriptionModel[];
}): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const isValid = isCancelAllSubscriptionRequestValid({
      companyId,
      subscriptions,
    });
    if (!isValid) {
      throw new Error('Invalid parameters to cancel all subscriptions');
    }
    const stripeSubscriptionIds = _.uniq(
      subscriptions.map((subscription) => subscription.subscription_id),
    );

    const res = (await cancelSequentially(
      stripeSubscriptionIds,
    )) as CompanySubscriptionModel[];

    return subscriptions;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        companyId,
        subscriptionIds: subscriptions.map((subscription) => subscription?.id),
      },
    });
    return Promise.reject(error);
  }
};

const cancelSequentially = async (
  stripeSubscriptionIds: string[],
): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    let res = [] as CompanySubscriptionModel[];

    for (const index in stripeSubscriptionIds) {
      const stripeRes = await StripeService.cancelSubscription(
        stripeSubscriptionIds[index],
      );

      const updatedStatus = getSubscriptionStatusForStripeStatus(
        stripeRes.status,
      );

      if (updatedStatus !== SUBSCRIPTION_STATUS.CANCELLED) {
        throw new Error('Failed to cancel subscription');
      }

      const updateRes =
        (await SubscriptionStore.updateSubscriptionStatusByStripeSubId({
          subscriptionId: stripeRes.id,
          status: updatedStatus,
          activeStatus: 1,
          cancelAtEnd: true,
          cancelDate: true,
        })) as CompanySubscriptionModel[];

      res = res.concat(updateRes);
    }
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'cancelSequentially', stripeSubscriptionIds },
    });
    return Promise.reject(error);
  }
};

const isCancelAllSubscriptionRequestValid = async ({
  companyId,
  subscriptions,
}: {
  companyId: CompanyId;
  subscriptions: CompanySubscriptionModel[];
}): Promise<boolean | Error> => {
  try {
    const stripeSubscriptionIds = _.uniq(
      subscriptions.map((subscription) => subscription.subscription_id),
    );

    const hasActiveIds = _.some(
      stripeSubscriptionIds,
      (s) => s !== undefined || null,
    );

    if (!companyId || !hasActiveIds) {
      throw new Error('Invalid parameters to cancel all subscriptions');
    }
    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'isCancelAllSubscriptionRequestValid',
        companyId,
      },
    });
    return false;
  }
};

const isCancelOmniSubscriptionValid = async ({
  companyId,
  companySubscription,
  stripeSubscriptionId,
}: {
  companyId: CompanyId;
  companySubscription: CompanySubscriptionModel;
  stripeSubscriptionId: string;
}): Promise<boolean | Error> => {
  try {
    if (!companyId || !companySubscription || !stripeSubscriptionId) {
      throw new Error('Missing required parameterse');
    }
    const subscription = await StripeService.getSubscription(
      stripeSubscriptionId,
    );
    if (subscription.canceled_at) {
      throw new Error('Subscription has already been cancelled.');
    }
    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'isCancelOmniSubscriptionValid', companyId },
    });
    return Promise.reject(error);
  }
};

const handleStripeWebhookEvent = async (
  event: Stripe.Event,
): Promise<boolean | Error> => {
  try {
    // Return a 200 response to acknowledge receipt of the event.
    // const dataObject = event.data.object;
    // console.log(dataObject);

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    // switch (event.type) {
    //   // case 'invoice.payment_succeeded':
    //   //   if (dataObject['billing_reason'] == 'subscription_create') {
    //   //     // The subscription automatically activates after successful payment
    //   //     // Set the payment method used to pay the first invoice
    //   //     // as the default payment method for that subscription
    //   //     const subscription_id = dataObject['subscription'];
    //   //     const payment_intent_id = dataObject['payment_intent'];

    //   //     // Retrieve the payment intent used to pay the subscription
    //   //     const payment_intent = await stripe.paymentIntents.retrieve(
    //   //       payment_intent_id,
    //   //     );

    //   //     const subscription = await stripe.subscriptions.update(
    //   //       subscription_id,
    //   //       {
    //   //         default_payment_method: payment_intent.payment_method,
    //   //       },
    //   //     );

    //   //     console.log(
    //   //       'Default payment method set for subscription:' +
    //   //         payment_intent.payment_method,
    //   //     );
    //   //   }

    //   //   break;
    //   case 'invoice.payment_failed':
    //     // If the payment fails or the customer does not have a valid payment method,
    //     //  an invoice.payment_failed event is sent, the subscription becomes past_due.
    //     // Use this webhook to notify your user that their payment has
    //     // failed and to retrieve new card details.
    //     break;
    //   case 'invoice.finalized':
    //     // If you want to manually send out invoices to your customers
    //     // or store them locally to reference to avoid hitting Stripe rate limits.
    //     break;
    //   case 'customer.subscription.deleted':
    //     if (event.request != null) {
    //       // handle a subscription cancelled by your request
    //       // from above.
    //     } else {
    //       // handle subscription cancelled automatically based
    //       // upon your subscription settings.
    //     }
    //     break;
    //   case 'customer.subscription.trial_will_end':
    //     // Send notification to your user that the trial will end
    //     break;
    //   default:
    //   // Unexpected event type
    // }

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded':
        // console.log(event);
        await exportFunctions.invoicePaymentCompleted(event);
        break;

      case 'customer.subscription.updated':
        await subscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await subscriptionDeleted(event);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return true;
  } catch (error) {
    const err = error as Error;
    return Promise.reject(error);
  }
};

const getAnnualSubscriptionsQueryOptions = (): number[] => {
  /* Subscriptions are to renew on the day of the month 
	that the sub was started, e.g. start date of 7th March
	will refresh quota on the 7th of every month

	If the month has fewer days than the renewal day, e.g. 
	31st but in February, then we will renew on the 1st of
	the next month */

  const lastMonth = dayjs().subtract(1, 'month');
  const daysInLastMonth = lastMonth.daysInMonth();

  const dateOfThisMonth = dayjs().date();

  if (dateOfThisMonth === 1) {
    /* If last month had fewer than 31 days then we need to add
		quota for those with renewal dates in 29th and/or 30th 

		NOTE: I'm too tired to think up a better way of doing this so if
		you can refactor this to a better way but maintain tests
	 	passing then go ahead :/ - Enoch */

    if (daysInLastMonth === 30) {
      return [31, 1];
    } else if (daysInLastMonth === 29) {
      // this case is Feb on leap year
      return [30, 31, 1];
    } else if (daysInLastMonth === 28) {
      // this case is normal Feb
      return [29, 30, 31, 1];
    } else {
      return [dateOfThisMonth];
    }
  } else {
    return [dateOfThisMonth];
  }
};

const handleRenewAnnualSubscriptionsTrigger = async (): Promise<
  CompanySubscriptionModel[] | void
> => {
  try {
    const dayOptions = exportFunctions.getAnnualSubscriptionsQueryOptions();

    const subList =
      (await SubscriptionStore.getCurrentAnnualSubscriptions()) as CompanySubscriptionWithQuotaRefreshModel[];

    //Sorry, literally the only way I know for me to find the legacy subscriptions - Gerard
    const LEGACY_SUBSCRIPTIONS = ['Starter', 'Pro', 'Premium'];

    const subscriptionsToRenew = subList.filter((sub) =>
      LEGACY_SUBSCRIPTIONS.includes(sub.packageTitle),
    );

    const filteredSubs = subscriptionsToRenew.filter((cm) => {
      const { start_date } = cm;
      const dayOfMonth = dayjs(start_date).date();
      if (dayOfMonth in dayOptions) {
        return true;
      }
    });

    if (filteredSubs.length === 0) {
      return [];
    }

    const res = (await Promise.all(
      filteredSubs.map((sub) => {
        return SubscriptionStore.incrementSubscriptionQuotas({
          subId: sub.id,
          whatsapp_quota: sub.add_whatsapp,
          sms_quota: sub.add_sms,
          email_quota: sub.add_email,
          phone_quota: sub.add_phone,
        });
      }),
    )) as CompanySubscriptionModel[];

    logger.subscriptions.log('info', 'handleRenewAnnualSubscriptionsTrigger', {
      subscriptionIds: res.map((sub) => sub?.id),
      companyIds: res.map((sub) => sub?.company_id),
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'handleRenewAnnualSubscriptionsTrigger',
      },
    });
  }
};

const calculateUpdatedQuotas = (
  baseSub: CompanySubscriptionWithQuotaRefreshModel,
): CompanySubscriptionModel => {
  const updatedSub = {
    ...baseSub,
    sms_quota: baseSub.sms_quota + baseSub.add_sms,
    phone_call_quota: baseSub.phone_call_quota + baseSub.add_phone,
    email_quota: baseSub.email_quota + baseSub.add_email,
    whatsApp_quota: baseSub.whatsApp_quota + baseSub.add_whatsapp,
  };

  return updatedSub;
};

const verifySubscriptionExistence = async ({
  companyId,
  priceIds,
}: {
  companyId: CompanyId;
  priceIds: string[];
}): Promise<boolean | Error> => {
  try {
    const res = await SubscriptionStore.verifySubscriptionExistence({
      companyId,
      priceIds,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'verifySubscriptionExistence',
        companyId,
        priceIds,
      },
    });
    return Promise.reject(error);
  }
};

const removePackagesFromSubscription = async ({
  company,
  user,
  companySubscriptions,
}: {
  company: CompanyModel;
  user: UserModel;
  companySubscriptions: CompanySubscriptionModel[];
}): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const valid = await isremovePackagesRequestValid({
      company,
      user,
      companySubscriptions,
    });

    if (!valid) {
      throw new Error('Invalid request to remove package');
    }

    const subscriptionId = _.head(
      companySubscriptions.map((s) => s.subscription_id),
    ) as string;
    const stripeRes = await StripeService.removeProductsFromSubscription({
      companySubscriptions,
      subscriptionId,
    });

    const updateRes = (await SubscriptionStore.updateSubscriptionStatus({
      id: companySubscriptions.map((s) => s.id),
      subscriptionId,
      status: SUBSCRIPTION_STATUS.CANCELLED,
      activeStatus: 1,
      cancelDate: true,
      cancelAtEnd: true,
    })) as CompanySubscriptionModel[];

    return updateRes;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        companyId: company.id,
        userId: user.id,
        companySubscriptionIds: companySubscriptions.map((s) => s.id),
      },
    });
    return Promise.reject(error);
  }
};

const isremovePackagesRequestValid = async ({
  company,
  user,
  companySubscriptions,
}: {
  company: CompanyModel;
  user: UserModel;
  companySubscriptions: CompanySubscriptionModel[];
}) => {
  try {
    const loaders = await createLoaders();
    if (!user || !company || companySubscriptions.length === 0) {
      throw new Error('Missing required parameters');
    }
    if (
      companySubscriptions.some(
        (subscription) => subscription.status !== SUBSCRIPTION_STATUS.ACTIVE,
      )
    ) {
      throw new Error('One or more package requested to cancel is inactive');
    }
    const subscriptions =
      (await SubscriptionStore.getActiveCompanySubscriptions(
        company.id,
      )) as CompanySubscriptionModel[];

    if (
      subscriptions.some((subscription) => subscription === undefined) ||
      subscriptions.length === 0
    ) {
      throw new Error('No active subscription exist for this company');
    }

    const companySubscriptionIds = companySubscriptions.map((c) => c.id);
    const currentSubscriptionIds = subscriptions.map((s) => s.id);

    const companySubscriptionPackageIds = companySubscriptions.map(
      (c) => c.package_id,
    );

    const companyPackages = (await loaders.subscriptionPackages.loadMany(
      companySubscriptionPackageIds,
    )) as SubscriptionPackageModel[];

    const basicPackage = companyPackages.find(
      (companyPackage) => companyPackage.type === 1,
    );

    const activeSubscriptions = subscriptions.filter((s) => !s.cancel_date);

    if (basicPackage) {
      const currentSubscribedPackageIds = activeSubscriptions.map(
        (subscription) => subscription.package_id,
      );
      const currentPackages = (await loaders.subscriptionPackages.loadMany(
        currentSubscribedPackageIds,
      )) as SubscriptionPackageModel[];

      currentPackages.forEach((p) => {
        if (p.type === 3) {
          throw new Error(
            'Cannot remove basic package if you are subscribed to Project Management Package. Remove Project Management Package first in order to remove basic package.',
          );
        }
      });
    }

    if (
      JSON.stringify(companySubscriptionIds) ===
      JSON.stringify(currentSubscriptionIds)
    ) {
      throw new Error(
        'Cannot remove all packages from subscription. Please cancel the subscription instead',
      );
    }
    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        companyId: company.id,
        userId: user.id,
        companySubscriptionIds: companySubscriptions.map((s) => s.id),
      },
    });
    return Promise.reject(error);
  }
};

const getPackagePriceByStripeId = async (
  stripePriceId: string,
): Promise<SubscriptionPackagePriceModel | Error> => {
  try {
    const res = await SubscriptionStore.getPackagePriceByStripeId(
      stripePriceId,
    );
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'getPackagePriceByStripeId', stripePriceId },
    });
    return Promise.reject(error);
  }
};

const switchSubscriptionPackage = async ({
  company,
  price,
  quantity,
  subscriptionPackage,
  companySubscription,
  user,
}: {
  company: CompanyModel;
  price: SubscriptionPackagePriceModel;
  quantity: number;
  subscriptionPackage: SubscriptionPackageModel;
  companySubscription: CompanySubscriptionModel;
  user: UserModel;
}): Promise<CompanySubscriptionModel | Error> => {
  try {
    const valid = await isSwitchSubscriptionPackageRequestValid({
      companyId: company.id,
      price,
      quantity,
      subscriptionPackage,
      companySubscription,
    });

    if (!valid) {
      throw new Error('Invalid upgrade request');
    }

    const startDate = dayjs().utc().toISOString().replace('Z', '');
    const endDate = await getSubscriptionEndDateString({
      currentDate: getCurrentDate(),
      interval: price.interval,
      duration: price.interval_count,
    });

    const dataToInsert = [
      { price, quantity, endDate, subscriptionPackage },
    ] as CreateInsertSubscriptionPayload[];

    const pricesWithQuantity = { ...price, quantity: quantity };

    const stripeAddRes = (await StripeService.addStripeProductsToSubscription({
      subscriptionId: companySubscription.subscription_id,
      pricesWithQuantity: [pricesWithQuantity],
    })) as Stripe.Subscription;

    const updatedStatus = exportFunctions.getSubscriptionStatusForStripeStatus(
      stripeAddRes.status,
    );

    const insertOptions = (await getOmniSubscriptionInsertOptions({
      stripeSubscription: stripeAddRes,
      dataToInsert,
      company,
      updatedStatus,
      user,
      startDate,
    })) as InsertOmniSubscriptionPayload[];

    const insertResult = (await SubscriptionStore.insertSubscription(
      insertOptions,
    )) as CompanySubscriptionModel[];

    await StripeService.removeProductsFromSubscription({
      companySubscriptions: [companySubscription],
      subscriptionId: companySubscription.subscription_id,
    });

    (await SubscriptionStore.updateSubscriptionStatus({
      id: [companySubscription.id],
      subscriptionId: companySubscription.subscription_id,
      status: SUBSCRIPTION_STATUS.CANCELLED,
      activeStatus: 0,
      cancelDate: true,
    })) as CompanySubscriptionModel[];

    if (
      updatedStatus !== SUBSCRIPTION_STATUS.TRIAL &&
      updatedStatus !== SUBSCRIPTION_STATUS.ACTIVE
    ) {
      throw new Error(
        'Your payment is pending. Please view the invoice details in the Settings > Payment tab for further action.',
      );
    } else {
      return _.head(insertResult) as CompanySubscriptionModel;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'switchSubscriptionPackage',
        companyId: company.id,
        userId: user.id,
      },
    });
    return Promise.reject(error);
  }
};

const isSwitchSubscriptionPackageRequestValid = async ({
  companyId,
  price,
  quantity,
  subscriptionPackage,
  companySubscription,
}: {
  companyId: CompanyId;
  price: SubscriptionPackagePriceModel;
  quantity: number;
  subscriptionPackage: SubscriptionPackageModel;
  companySubscription: CompanySubscriptionModel;
}) => {
  try {
    if (
      !companyId ||
      !price ||
      !quantity ||
      !subscriptionPackage ||
      !companySubscription
    ) {
      throw new Error('Required parameters are missing');
    }

    const companySubscriptions =
      (await SubscriptionStore.getActiveCompanySubscriptions(
        companyId,
      )) as CompanySubscriptionModel[];

    if (companySubscriptions.length === 0) {
      throw new Error('No subscription exist for this company');
    }

    const existingSubscriptionWithPackage =
      (await SubscriptionStore.getCompanySubscriptionWithPackage(
        companySubscription.id,
      )) as CompanySubscriptionWithPackageModel;

    if (existingSubscriptionWithPackage.type !== subscriptionPackage.type) {
      throw new Error(
        'Mismatching type of existing package and package to be upgraded',
      );
    }
    //temporary solution
    // if (existingSubscriptionWithPackage.type === subscriptionPackage.type) {
    //   throw new Error(
    //     'Cannot switch to another package while having active package of the same type. Please contact our support',
    //   );
    // }

    if (
      companySubscription.data?.type === PACKAGES_TYPES.TIME_ATTENDANCE ||
      companySubscription.data?.type === PACKAGES_TYPES.PMT ||
      companySubscription.data?.type === PACKAGES_TYPES.DEDOCO
    ) {
      throw new Error(
        'Cannot switch package of type Project Management Tool, Time Attendance or Dedoco',
      );
    }

    if (
      existingSubscriptionWithPackage.product_id ===
      subscriptionPackage.product_id
    ) {
      throw new Error('Already subscribed to this package');
    }

    if (subscriptionPackage.type === 1 && quantity !== 1) {
      throw new Error('Quantity should only be 1 for this type of package');
    }

    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'isSwitchSubscriptionPackageRequestValid',
        companyId,
        price,
      },
    });
    return Promise.reject(error);
  }
};

const addPackageToSubscription = async ({
  user,
  company,
  prices,
  subscriptionPackages,
  addPackageInput,
}: {
  user: UserModel;
  company: CompanyModel;
  prices: SubscriptionPackagePriceModel[];
  subscriptionPackages: SubscriptionPackageModel[];
  addPackageInput: any[];
}): Promise<(CompanySubscriptionModel | Error)[]> => {
  try {
    const valid = await isAddPackageRequestValid({
      user,
      company,
      prices,
      subscriptionPackages,
    });

    if (!valid) {
      throw new Error('Adding package request is invalid');
    }

    const startDate = dayjs().utc().toISOString().replace('Z', '');

    const pricesWithQuantity = prices.map((price) => ({
      ...price,
      quantity: addPackageInput.find(
        (cs: any) => cs.package_price_id === price.id_text,
      )['quantity'],
    }));

    const dataToInsert = [] as CreateInsertSubscriptionPayload[];

    for (const price of pricesWithQuantity) {
      const endDate = await getSubscriptionEndDateString({
        currentDate: getCurrentDate(),
        interval: price.interval,
        duration: price.interval_count,
      });

      dataToInsert.push({
        price,
        quantity: price.quantity,
        endDate,
        //@ts-ignore
        subscriptionPackage: subscriptionPackages.find(
          (sp) => sp.id === price.package_id,
        ),
      });
    }

    const companySubscriptions =
      (await SubscriptionService.getActiveCompanySubscriptions(
        company.id,
      )) as CompanySubscriptionModel[];

    const activeSubscriptions = companySubscriptions.filter(
      (sub) => sub.active,
    );

    if (
      companySubscriptions.some((subscription) => subscription === undefined)
    ) {
      throw new Error('No active subscription exist for this company');
    }

    const subscriptionId = _.head(
      activeSubscriptions.map((sub) => sub.subscription_id),
    );

    const stripeSubscription =
      (await StripeService.addStripeProductsToSubscription({
        subscriptionId,
        pricesWithQuantity,
      })) as Stripe.Subscription;

    const updatedStatus = exportFunctions.getSubscriptionStatusForStripeStatus(
      stripeSubscription.status,
    );

    const insertOptions = (await getOmniSubscriptionInsertOptions({
      stripeSubscription,
      dataToInsert,
      company,
      updatedStatus,
      user,
      startDate,
    })) as InsertOmniSubscriptionPayload[];

    const insertResult = (await SubscriptionStore.insertSubscription(
      insertOptions,
    )) as CompanySubscriptionModel[];

    const updateRes = (await SubscriptionStore.updateSubscriptionStatus({
      id: insertResult.map((res) => res.id),
      subscriptionId: stripeSubscription.id,
      status: updatedStatus,
      activeStatus: 1,
    })) as CompanySubscriptionModel[];

    if (
      updatedStatus !== SUBSCRIPTION_STATUS.TRIAL &&
      updatedStatus !== SUBSCRIPTION_STATUS.ACTIVE
    ) {
      throw new Error(
        'Your payment is pending. Please view the invoice details in the Settings > Payment tab for further action.',
      );
    } else {
      return updateRes;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'addPackageToSubscription',
        user: user?.id,
        company: company?.id,
        prices,
      },
    });
    return Promise.reject(error);
  }
};

const isAddPackageRequestValid = async ({
  user,
  company,
  prices,
  subscriptionPackages,
}: {
  user: UserModel;
  company: CompanyModel;
  prices: SubscriptionPackagePriceModel[];
  subscriptionPackages: SubscriptionPackageModel[];
}): Promise<boolean | Error> => {
  try {
    const loaders = await createLoaders();
    if (
      !user ||
      !company ||
      !prices.some((price) => price !== undefined) ||
      !subscriptionPackages.some((subscription) => subscription !== undefined)
    ) {
      throw new Error('Missing required parameter');
    }
    const hasIdenticalActiveSubscription = await verifySubscriptionExistence({
      companyId: company.id,
      priceIds: prices.map((price) => price.stripe_price_id),
    });

    if (hasIdenticalActiveSubscription) {
      throw new Error('This company is already subscribed to this package');
    }

    const companySubscriptions =
      (await SubscriptionService.getActiveCompanySubscriptions(
        company.id,
      )) as CompanySubscriptionModel[];

    const activeSubscriptions = companySubscriptions.filter(
      (sub) => sub.active,
    );

    if (
      companySubscriptions.some((subscription) => subscription === undefined) ||
      companySubscriptions.some(
        (subscription) => subscription.subscription_id === 'Trial',
      ) ||
      companySubscriptions.length === 0
    ) {
      throw new Error('No active subscription exist for this company');
    }

    const subscribedPackageIds = activeSubscriptions.map(
      (sub) => sub.package_id,
    );

    const subscribedPackages = (await loaders.subscriptionPackages.loadMany(
      subscribedPackageIds,
    )) as SubscriptionPackageModel[];

    const hasSamePackageType = subscribedPackages.some((subscribedPackage) =>
      subscriptionPackages.some(
        (reqSub) => reqSub.type === subscribedPackage.type,
      ),
    );

    if (hasSamePackageType) {
      throw new Error(
        'You are already subscribed to a package with the same type. Please unsubscribe the package first to change package in subscription',
      );
    }

    const projectManagementPackage = subscriptionPackages.find(
      (p) => p.type === 3,
    );

    const basicPackage = subscribedPackages.find((p) => p.type === 1);

    if (projectManagementPackage) {
      if (!basicPackage) {
        throw new Error(
          'Cannot subscribe to project management package without any basic package in the list',
        );
      }
    }

    if (!user.customer_id) {
      throw new Error('Stripe customer id is missing');
    }

    const paymentMethodId = _.get(user, 'payment_method_id');

    if (!paymentMethodId) {
      throw new Error('Please add a payment method');
    }
    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'isAddPackageRequestValid',
        user: user?.id,
        company: company?.id,
        prices,
      },
    });
    return Promise.reject(error);
  }
};

const editPackageQuantity = async ({
  company,
  companySubscription,
  quantity,
}: {
  company: CompanyModel;
  companySubscription: CompanySubscriptionModel;
  quantity: number;
}) => {
  try {
    const isValid = await isEditPackageQuantityRequestValid({
      company,
      companySubscription,
      quantity,
    });

    if (!isValid) {
      throw new Error('Invalid request to edit package quantity');
    }
    await StripeService.editPackageQuantity({
      companySubscription,
      quantity,
    });

    const res = await SubscriptionStore.updateSubscriptionQuantity({
      companySubscription,
      quantity,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        company: company?.id,
        companySubscription: companySubscription?.id,
        quantity,
      },
    });
    return Promise.reject(error);
  }
};

const isEditPackageQuantityRequestValid = async ({
  company,
  companySubscription,
  quantity,
}: {
  company: CompanyModel;
  companySubscription: CompanySubscriptionModel;
  quantity: number;
}): Promise<boolean | Error> => {
  try {
    if (!company || !companySubscription || !quantity) {
      throw new Error('Missing required parameters');
    }

    if (!companySubscription.active) {
      throw new Error('That company subscription package is inactive');
    }

    const existingSubscriptionWithPackage =
      (await SubscriptionStore.getCompanySubscriptionWithPackage(
        companySubscription.id,
      )) as CompanySubscriptionWithPackageModel;

    if (
      existingSubscriptionWithPackage.type !== 3 &&
      existingSubscriptionWithPackage.type !== 2
    ) {
      throw new Error('Invalid type of package to edit quantity');
    }
    return true;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        company: company?.id,
        companySubscription: companySubscription?.id,
        quantity,
      },
    });
    return Promise.reject(error);
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
    const res = await SubscriptionStore.decrementQuotaByOne({
      subscriptionId,
      services,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'decrementQuotaByOne',
        subscriptionId,
        services,
      },
    });
    return Promise.reject(err);
  }
};

const assignSubscriptionQuantityToMember = async ({
  companyMemberId,
  companyId,
  stripeProductId,
}: {
  companyMemberId: CompanyMemberId;
  companyId: CompanyId;
  stripeProductId: string;
}): Promise<CompanyMemberModel[] | Error> => {
  try {
    const stripeProductIds = await SubscriptionStore.getStripeProductIds();
    if (!_.includes(stripeProductIds, stripeProductId)) {
      throw new Error('That subscription does not have assignable quantity');
    }

    const subscriptions = await SubscriptionStore.getActiveCompanySubscriptions(
      companyId,
    );
    const selectedSubscription = _.find(
      subscriptions,
      (e: CompanySubscriptionModel) => e.product_id === stripeProductId,
    ) as CompanySubscriptionModel;

    if (!selectedSubscription) {
      throw new Error('Company does not have that subscription');
    }

    // get number of quantity consumed
    const quantityTotal = selectedSubscription.quantity;

    // check if the member is already assigned
    const assignments =
      await SubscriptionStore.getSubscriptionQuantityAssignments(
        selectedSubscription.id,
      );
    const existingMember = assignments.find(
      (member) => member.id === companyMemberId,
    );
    if (existingMember) {
      throw new Error('The member is already assigned to a seat');
    }

    if (selectedSubscription?.data?.type === PACKAGES_TYPES.DEDOCO) {
      await SubscriptionStore.assignSubscriptionQuantityToMember({
        subscriptionId: selectedSubscription.id,
        companyMemberId,
      });
    } else {
      // assign the member
      if (
        assignments.length < quantityTotal &&
        selectedSubscription?.data?.type !== PACKAGES_TYPES.DEDOCO
      ) {
        await SubscriptionStore.assignSubscriptionQuantityToMember({
          subscriptionId: selectedSubscription.id,
          companyMemberId,
        });
      } else {
        throw new Error('Please add more seats to add more members');
      }
    }

    const updatedAssignments =
      await SubscriptionStore.getSubscriptionQuantityAssignments(
        selectedSubscription.id,
      );

    return updatedAssignments;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'assignSubscriptionQuantityToMember',
        companyMemberId,
        companyId,
        stripeProductId,
      },
    });
    return Promise.reject(error);
  }
};

const removeSubscriptionQuantity = async ({
  companyMemberId,
  companyId,
  stripeProductId,
}: {
  companyMemberId: CompanyMemberId;
  companyId: CompanyId;
  stripeProductId: string;
}): Promise<CompanyMemberModel[] | Error> => {
  try {
    const stripeProductIds = await SubscriptionStore.getStripeProductIds();
    if (!_.includes(stripeProductIds, stripeProductId)) {
      throw new Error('That subscription does not have assignable quantity');
    }

    const subscriptions = await SubscriptionStore.getActiveCompanySubscriptions(
      companyId,
    );

    const selectedSubscription = _.find(
      subscriptions,
      (e: CompanySubscriptionModel) => e.product_id === stripeProductId,
    ) as CompanySubscriptionModel;

    if (!selectedSubscription) {
      throw new Error('Company does not have that subscription');
    }

    // check if the member is assigned
    const assignments =
      await SubscriptionStore.getSubscriptionQuantityAssignments(
        selectedSubscription.id,
      );
    const existingMember = assignments.find(
      (member) => member.id === companyMemberId,
    );
    if (!existingMember) {
      throw new Error('The member is not assigned to the subscription');
    }

    // remove the member
    await SubscriptionStore.removeSubscriptionQuantityFromMember({
      subscriptionId: selectedSubscription.id,
      companyMemberId,
    });

    const updatedAssignments =
      await SubscriptionStore.getSubscriptionQuantityAssignments(
        selectedSubscription.id,
      );

    return updatedAssignments;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'removeSubscriptionQuantity',
        companyMemberId,
        companyId,
        stripeProductId,
      },
    });
    return Promise.reject(error);
  }
};

const getMembersAssignedToSubscription = async ({
  stripeProductId,
  companyId,
}: {
  companyId: CompanyId;
  stripeProductId: string;
}): Promise<CompanyMemberModel[]> => {
  try {
    const stripeProductIds = await SubscriptionStore.getStripeProductIds();

    const subscriptions = await SubscriptionStore.getActiveCompanySubscriptions(
      companyId,
    );

    const filtered = _.filter(subscriptions, (s: CompanySubscriptionModel) =>
      _.includes(stripeProductIds, s.product_id),
    );

    const selectedSubscription = _.find(
      filtered,
      (e: CompanySubscriptionModel) => e.product_id === stripeProductId,
    ) as CompanySubscriptionModel;

    if (!selectedSubscription) {
      return [];
    }

    const assignedMembers =
      await SubscriptionStore.getSubscriptionQuantityAssignments(
        selectedSubscription.id,
      );

    return assignedMembers;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getMembersAssignedToSubscription',
        companyId,
        stripeProductId,
      },
    });
    return Promise.reject(error);
  }
};

const getSubscriptionQuantities = async ({
  companyId,
  stripeProductId,
}: {
  companyId: CompanyId;
  stripeProductId: string;
}): Promise<SubscriptionQuantityResultModel> => {
  try {
    const stripeProductIds = await SubscriptionStore.getStripeProductIds();

    const subscriptions = await SubscriptionStore.getActiveCompanySubscriptions(
      companyId,
    );

    const filtered = _.filter(subscriptions, (s: CompanySubscriptionModel) =>
      _.includes(stripeProductIds, s.product_id),
    );

    const selectedSubscription = _.find(
      filtered,
      (e: CompanySubscriptionModel) => e.product_id === stripeProductId,
    ) as CompanySubscriptionModel;

    if (!selectedSubscription) {
      return {
        total: 0,
        assigned: 0,
        company_members: [],
      };
    }

    const assignedMembers =
      await SubscriptionStore.getSubscriptionQuantityAssignments(
        selectedSubscription.id,
      );

    const res = {
      total: selectedSubscription.quantity,
      assigned: assignedMembers.length,
      company_members: assignedMembers,
    };

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getSubscriptionQuantities',
        companyId,
        stripeProductId,
      },
    });
    return Promise.reject(error);
  }
};

const isMemberWhitelistedToAttendance = async (
  memberId: CompanyMemberId,
): Promise<boolean | void> => {
  try {
    const res = await SubscriptionStore.getSubscriptionByMemberId(memberId);

    if (res?.length > 0) {
      const isWhitelistedToAttendance = res.some((sub) =>
        sub?.packageTitle?.includes('Attendance'),
      );

      return isWhitelistedToAttendance;
    } else {
      return false;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'isMemberWhitelistedToAttendance', memberId },
    });

    return;
  }
};

const getExpiredCompanySubscriptions = async (companyId: CompanyId) => {
  try {
    const res = await SubscriptionStore.getExpiredCompanySubscriptions(
      companyId,
    );
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: { service, fnName: 'getExpiredCompanySubscriptions', companyId },
    });
    return Promise.reject(error);
  }
};

const exportFunctions = {
  createTrialOmniSubscription,
  addPackageToSubscription,
  cancelOmniSubscription,
  cancelOmniTrialSubscription,
  cancelAllSubscriptions,
  calculateUpdatedQuotas,
  consumeQuotas,
  createSubscriptionInsertOptions,
  createOmniSubscription,
  decrementQuotaByOne,
  editPackageQuantity,
  getAnnualSubscriptionsQueryOptions,
  getCurrentDate,
  getPackagePrices,
  getPackages,
  getDedocoPackages,
  getPromoCodeInfo,
  getSubscriptionEndDateString,
  getSubscriptionsByUser,
  getSubscriptionStatusForStripeStatus,
  getCorrespondingPackage,
  getPackagePriceByStripeId,
  getActiveCompanySubscriptions,
  handleRenewAnnualSubscriptionsTrigger,
  handleStripeWebhookEvent,
  invoicePaymentCompleted,
  isPaidCompany,
  isSubscriptionRequestValid,
  isOmniSubscriptionRequestValid,
  listUserInvoices,
  removePackagesFromSubscription,
  switchSubscriptionPackage,
  verifySubscriptionExistence,
  assignSubscriptionQuantityToMember,
  removeSubscriptionQuantity,
  getSubscriptionQuantities,
  getMembersAssignedToSubscription,
  isMemberWhitelistedToAttendance,
  createDedocoSubscription,
  getExpiredCompanySubscriptions,
  hasCompanyUsedFreeTrialBefore,
  ...SubscriptionNewService,
};

export default exportFunctions;
