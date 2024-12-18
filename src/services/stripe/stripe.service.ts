// NOTE: Legacy code, only reenable functions as they are used and updated to TS
import Stripe from 'stripe';
import _ from 'lodash';
import {
  CompanySubscriptionModel,
  StripePromoCodeModel,
  SubscriptionPackagePriceModel,
  SubscriptionProductId,
} from '@models/subscription.model';
import logger from '@tools/logger';
import { UserStore } from '@data-access';
import { UserModel } from '@models/user.model';

export const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2020-08-27',
});

const endpointSecret = process.env.STRIPE_END_POINT_SECRET || '';

const constructEvent = async (
  body: string | Buffer,
  signature: string | Buffer | string[],
): Promise<Stripe.Event> => {
  const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  return event;
};

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];
//Not sure where to get Stripe's Error type, so I just made my own for now
type StripeServiceError = {
  type: string;
  raw: {
    code: string;
    doc_url: string;
    message: string;
    param: string;
    type: string;
    headers: {
      server: string;
      date: string;
      'content-type': string;
      'content-length': string;
      connection: string;
      'access-control-allow-credentials': string;
      'access-control-allow-methods': string;
      'access-control-allow-origin': string;
      'access-control-expose-headers': string;
      'access-control-max-age': string;
      'cache-control': string;
      'request-id': string;
      'stripe-version': string;
      'strict-transport-security': string;
    };
    statusCode: number;
    requestId: string;
  };
  rawType: string;
  code: string;
  doc_url: string;
  param: string;
  detail: any;
  headers: {
    server: string;
    date: string;
    'content-type': string;
    'content-length': string;
    connection: string;
    'access-control-allow-credentials': string;
    'access-control-allow-methods': string;
    'access-control-allow-origin': string;
    'access-control-expose-headers': string;
    'access-control-max-age': string;
    'cache-control': string;
    'request-id': string;
    'stripe-version': string;
    'strict-transport-security': string;
  };
  requestId: string;
  statusCode: number;
  charge: any;
  decline_code: any;
  payment_intent: any;
  payment_method: any;
  payment_method_type: any;
  setup_intent: any;
  source: any;
};

type StripeServiceOptions = {
  customer: string;
  items: {
    price: string;
    quantity: number | undefined;
  }[];
  expand: string[];
  default_payment_method: string;
  promotion_code?: string;
};

const createCustomer = async (input: {
  email: string;
  name: string;
}): Promise<Stripe.Response<Stripe.Customer>> => {
  try {
    const { email, name } = input;

    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createCustomer',
        input,
      },
    });

    return Promise.reject(error);
  }
};

const getCustomer = async (
  id: string,
): Promise<Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>> =>
  await stripe.customers.retrieve(id);

const attachPaymentMethodToCustomer = async (input: {
  paymentMethodId: string;
  customerId: string;
}): Promise<Stripe.Response<Stripe.PaymentMethod>> => {
  try {
    const { paymentMethodId, customerId } = input;
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    return paymentMethod;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'attachPaymentMethodToCustomer',
        input,
      },
    });
    return Promise.reject(error);
  }
};

const detachPaymentMethodFromCustomer = async (input: {
  paymentMethodId: string;
}): Promise<Stripe.Response<Stripe.PaymentMethod>> => {
  try {
    const { paymentMethodId } = input;
    const res = await stripe.paymentMethods.detach(paymentMethodId);
    return res;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: detachPaymentMethodFromCustomer.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const getPaymentMethods = async (
  customerId: string,
): Promise<Stripe.ApiList<Stripe.PaymentMethod>> => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods;
  } catch (error) {
    const err = error as StripeServiceError;

    //If customer id provided is invalid, create a new one and replace the old customer id on user's customer_id column
    const message = err?.raw?.message;

    const type = err?.raw?.type;
    const isCustomerIdExists =
      !message.includes('No such customer') && type !== 'invalid_request_error';

    if (!isCustomerIdExists) {
      const user = (await UserStore.getUserByCustomerId(
        customerId,
      )) as UserModel;

      const customer = (await createCustomer({
        email: user?.email,
        name: user?.name,
      })) as Stripe.Response<Stripe.Customer>;

      if (customer) {
        const updatedUser = (await UserStore.updateCustomerId({
          userId: user?.id,
          customerId: customer.id,
        })) as UserModel;

        const paymentMethods = await getPaymentMethods(
          updatedUser?.customer_id,
        );

        return paymentMethods;
      }
    }

    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getPaymentMethods.name,
        customerId,
      },
    });
    return Promise.reject(error);
  }
};

const createStripeSubscription = async (input: {
  customerId: string;
  pricesWithQuantity: SubscriptionPackagePriceModel[];
  promoId?: string;
  defaultPaymentMethod: string;
}): Promise<Stripe.Response<Stripe.Subscription> | void> => {
  try {
    const { customerId, pricesWithQuantity, promoId, defaultPaymentMethod } =
      input;
    const options = {
      customer: customerId,
      items: pricesWithQuantity.map((price) => ({
        price: price.stripe_price_id,
        quantity: price.quantity,
      })),
      expand: ['latest_invoice.payment_intent'],
      default_payment_method: defaultPaymentMethod,
    } as StripeServiceOptions;
    if (promoId) {
      options.promotion_code = promoId;
    }

    const res = await stripe.subscriptions.create(options);

    return res;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createStripeSubscription.name,
        input,
      },
    });
  }
};

const createStripeInvoice = async (
  customerId: string,
): Promise<Stripe.Response<Stripe.Invoice> | void> => {
  try {
    const res = await stripe.invoices.create({
      customer: customerId,
    });

    return res;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createStripeInvoice.name,
        customerId,
      },
    });
  }
};

const createStripeInvoiceItem = async (input: {
  customerId: string;
  invoiceId: string;
  payload: { priceId: string; quantity: number };
}): Promise<Stripe.Response<Stripe.InvoiceItem> | void> => {
  try {
    const { customerId, invoiceId, payload } = input;
    const res = await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoiceId,
      price: payload.priceId,
      quantity: payload.quantity,
    });

    return res;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: createStripeInvoiceItem.name,
        input,
      },
    });
  }
};

const updateInvoiceToChargeAutomatically = async (
  invoiceId: string,
): Promise<Stripe.Response<Stripe.Invoice> | void> => {
  try {
    const res = await stripe.invoices.update(invoiceId, {
      auto_advance: true,
      collection_method: 'charge_automatically',
    });

    return res;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: updateInvoiceToChargeAutomatically.name,
        invoiceId,
      },
    });
  }
};

const payStripeInvoice = async (input: {
  invoiceId: string;
  paymentMethodId: string;
}): Promise<Stripe.Response<Stripe.Invoice> | void> => {
  try {
    const { invoiceId, paymentMethodId } = input;
    const res = await stripe.invoices.pay(invoiceId, {
      payment_method: paymentMethodId,
    });
    return res;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: payStripeInvoice.name,
        input,
      },
    });
  }
};

const addStripeProductsToSubscription = async (input: {
  subscriptionId?: string;
  pricesWithQuantity: SubscriptionPackagePriceModel[];
}): Promise<Stripe.Response<Stripe.Subscription> | void> => {
  try {
    const { subscriptionId, pricesWithQuantity } = input;
    const options = {
      items: pricesWithQuantity.map((price) => ({
        price: price.stripe_price_id,
        quantity: price.quantity,
      })),
    };

    if (subscriptionId) {
      const res = await stripe.subscriptions.update(subscriptionId, options);

      return res;
    }
  } catch (error) {
    const err = error as StripeServiceError;

    if (err?.raw?.message?.includes('test')) {
      throw new Error('Test subscriptions cannot be updated');
    }
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: addStripeProductsToSubscription.name,
        input,
      },
    });
    return Promise.reject(error);
  }
};

const removeProductsFromSubscription = async (input: {
  subscriptionId?: string;
  companySubscriptions: CompanySubscriptionModel[];
}): Promise<Stripe.Response<Stripe.Subscription> | void> => {
  try {
    const { subscriptionId, companySubscriptions } = input;
    const params = {
      items: companySubscriptions.map((s) => ({
        id: s.item_id,
        deleted: true,
      })),
      proration_behavior: 'none',
    } as Stripe.SubscriptionUpdateParams;

    if (subscriptionId) {
      const res = await stripe.subscriptions.update(subscriptionId, params);

      return res;
    }
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: removeProductsFromSubscription.name,
        input,
      },
    });

    return Promise.reject(error);
  }
};

const editPackageQuantity = async (input: {
  companySubscription: CompanySubscriptionModel;
  quantity: number;
}): Promise<Stripe.Response<Stripe.Subscription>> => {
  try {
    const { companySubscription, quantity } = input;
    const options = {
      items: [
        {
          id: companySubscription.item_id,
          quantity,
        },
      ],
    };

    const res = await stripe.subscriptions.update(
      companySubscription.subscription_id,
      options,
    );

    return res;
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: editPackageQuantity.name,
        input,
      },
    });

    throw new Error('Could not edit package quantity for test subscriptions.');
  }
};

const getSubscription = async (
  id: string,
): Promise<Stripe.Response<Stripe.Subscription>> => {
  const res = await stripe.subscriptions.retrieve(id);
  return res;
};

const getCustomerInvoices = async (
  customerId: string,
): Promise<Stripe.Invoice[]> => {
  const res = await stripe.invoices.list({ customer: customerId });
  return res.data;
};
const upcomingInvoices = (customerId: string) =>
  stripe.invoices.retrieveUpcoming({ customer: customerId });

const cancelSubscription = async (
  subscriptionId: string,
): Promise<Stripe.Response<Stripe.Subscription>> => {
  const res = await stripe.subscriptions.del(subscriptionId);
  return res;
};

const getPromoCode = async (code: string) => {
  try {
    const allCodes = await stripe.promotionCodes.list({
      expand: ['data.coupon.applies_to'],
    });
    const selectedCode = _.find(allCodes.data, {
      code,
    }) as StripePromoCodeModel;
    return selectedCode;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getStripeProduct = async (
  productIds: string[],
): Promise<(Stripe.Product | Error)[]> => {
  try {
    let productsList: Stripe.Product[] = [];

    for (const p of productIds) {
      const product = (await stripe.products.retrieve(p)) as Stripe.Product;
      productsList.push(product);
    }

    return productsList;
  } catch (error) {
    return Promise.reject(error);
  }
};

const retrieveCoupon = async (code: string) => stripe.coupons.retrieve(code);

const getStripeId = async ({
  email,
  customerId,
}: {
  email: string;
  customerId?: string;
}) => {
  try {
    const customers = await stripe.customers.list({
      email,
    });

    const { data } = customers;

    if (data?.length > 1 && customerId) {
      const stripeIds = data.map((c) => c.id);
      const unusedStripeIds = stripeIds.filter((id) => id !== customerId);

      logger.logStripe({ email, payload: unusedStripeIds });
    }

    const isFirstCustomerExists = !_.isEmpty(_.head(data));

    if (isFirstCustomerExists) {
      return _.head(data)?.id;
    }
  } catch (error) {
    const err = error as StripeServiceError;
    logger.logError({
      payload: {
        service: 'stripe',
        fnName: 'getStripeId',
        email,
      },
      error: err,
    });
  }
};

/* NEW CODE for new subscriptions */

const getProducts = async () => {
  try {
    const products = await stripe.products.list({});
    return products.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getRecurringPrices = async () => {
  try {
    const prices = await stripe.prices.search({
      query: 'active:"true" AND currency:"myr" AND type:"recurring"',
      limit: 100,
    });
    return prices.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createProduct = async (input: { name: string }) => {
  const { name } = input;

  try {
    const product = await stripe.products.create({
      name,
    });

    return product;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProduct = async (input: {
  productId: string;
  name?: string;
  active?: boolean;
}) => {
  const { productId, name, active } = input;

  try {
    const product = await stripe.products.update(productId, {
      ...(name && { name }),
      ...(active && { active }),
    });

    return product;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createPrice = async (input: {
  productId: string;
  amount: number;
  currency: string;
  interval?: string;
}) => {
  try {
    const { productId, amount, currency, interval } = input;

    const price = await stripe.prices.create({
      unit_amount: amount,
      currency,
      ...(interval && {
        recurring: { interval: interval as Stripe.Price.Recurring.Interval },
      }),
      product: productId,
    });

    return price;
  } catch (error) {
    return Promise.reject(error);
  }
};

const searchCustomerEmail = async (input: { email: string }) => {
  try {
    const { email } = input;

    const customer = await stripe.customers.search({
      query: `email:'${email}'`,
    });
    console.log('customer', customer);

    return customer.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createSubscription = async (input: {
  customerId: string;
  items: { price: string; quantity: number }[];
  paymentMethodId: string;
}) => {
  try {
    const { customerId, items, paymentMethodId } = input;

    const subscriptionOptions = {
      customer: customerId,
      items,
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    };

    const subscription = await stripe.subscriptions.create(subscriptionOptions);

    return subscription;
  } catch (error) {
    return Promise.reject(error);
  }
};

const addSubscriptionItems = async (input: {
  subscriptionId: string;
  priceIds: string[];
  shouldProrate?: boolean;
}) => {
  try {
    const { subscriptionId, priceIds, shouldProrate = true } = input;

    const subscriptionOptions = {
      items: priceIds.map((price) => ({ price, quantity: 1 })),
      proration_behavior: shouldProrate ? 'always_invoice' : 'none',
    };

    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      // @ts-ignore
      subscriptionOptions,
    );

    return subscription;
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeSubscriptionItems = async (input: {
  subscriptionId: string;
  itemIds: string[];
  shouldProrate?: boolean;
}) => {
  try {
    const { subscriptionId, itemIds, shouldProrate = false } = input;

    const subscriptionOptions = {
      items: itemIds.map((id) => ({ id, deleted: true })),
      proration_behavior: shouldProrate ? 'always_invoice' : 'none',
    };

    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      // @ts-ignore
      subscriptionOptions,
    );

    return subscription;
  } catch (error) {
    return Promise.reject(error);
  }
};

const listSubscriptionItems = async (subscriptionId: string) => {
  try {
    const items = await stripe.subscriptionItems.list({
      subscription: subscriptionId,
    });

    return items.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubscriptionPaymentMethod = async (input: {
  subscriptionId: string;
  paymentMethodId: string;
}) => {
  try {
    const { subscriptionId, paymentMethodId } = input;
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
    });

    console.log('updated', subscription);

    return subscription;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getPaymentMethod = async (paymentMethodId: string) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  createCustomer,
  createStripeInvoice,
  createStripeInvoiceItem,
  createStripeSubscription,
  getCustomer,
  attachPaymentMethodToCustomer,
  detachPaymentMethodFromCustomer,
  getPaymentMethods,
  getCustomerInvoices,
  upcomingInvoices,
  cancelSubscription,
  getSubscription,
  getPromoCode,
  addStripeProductsToSubscription,
  removeProductsFromSubscription,
  editPackageQuantity,
  retrieveCoupon,
  constructEvent,
  getStripeProduct,
  updateInvoiceToChargeAutomatically,
  payStripeInvoice,
  getStripeId,

  /* ABOVE ARE LEGACY FUNCTIONS */
  getProducts,
  getRecurringPrices,
  createProduct,
  updateProduct,
  createPrice,
  searchCustomerEmail,
  createSubscription,
  listSubscriptionItems,
  addSubscriptionItems,
  removeSubscriptionItems,
  updateSubscriptionPaymentMethod,
  getPaymentMethod,
};
