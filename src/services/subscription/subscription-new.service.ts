import { CompanyStore, SubscriptionStore, UserStore } from '@data-access';
import { CompanyId, CompanyModel } from '@models/company.model';
import {
  SubscriptionModel,
  SubscriptionPackageId,
  SubscriptionPackageNewModel,
  SubscriptionProductId,
} from '@models/subscription.model';
import { UserId, UserModel } from '@models/user.model';
import { CompanyService, EventManagerService, StripeService } from '@services';
import dayjs from 'dayjs';
import _ from 'lodash';
import tz from 'dayjs/plugin/timezone';
import { SUBSCRIPTION_CHANGE_ACTIONS } from '@constants';
dayjs.extend(tz);

const getSubscriptionProducts = async () => {
  try {
    const stripeProducts = await StripeService.getProducts();

    const dbProducts = await SubscriptionStore.getSubscriptionProducts();

    const res = dbProducts.filter((dbProduct) =>
      stripeProducts
        .map((stripeProduct) => stripeProduct.id)
        .includes(dbProduct.stripeProductId),
    );

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

// NOTE: This function has a bit more complex functionality
const getSubscriptionForCompanyId = async (input: {
  companyId: CompanyId;
  user: UserModel;
}) => {
  try {
    const { companyId, user } = input;

    const currentSub = await SubscriptionStore.getSubscriptionForCompanyId({
      companyId,
    });

    if (!currentSub) {
      // On the legacy system free plan companies would not have a subscription row, but in the
      // new system we will create a subscription row for them using free plan data + quotas

      const createdSub =
        await exportFunctions.createBasicSubscriptionForCompanyId({
          companyId,
          userId: user.id,
          intervalType: 'month',
        });
      return createdSub;
    }

    return currentSub;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Creates the free plan for the company id
const createBasicSubscriptionForCompanyId = async (input: {
  companyId: CompanyId;
  intervalType: string;
  userId: UserId;
}) => {
  try {
    const { companyId, userId, intervalType } = input;
    const defaultSubPackage =
      await SubscriptionStore.getDefaultSubscriptionPackage();

    const sub = await SubscriptionStore.createSubscription({
      companyId,
      stripeSubscriptionId: null,
      packageId: defaultSubPackage.id,
      intervalType,
      userId,
    });

    return sub;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createSubscriptionProduct = async (input: {
  name: string;
  user: UserModel;
}) => {
  try {
    const { name, user } = input;

    const stripeProduct = await StripeService.createProduct({
      name,
    });

    const res = await SubscriptionStore.createSubscriptionProduct({
      name,
      stripeProductId: stripeProduct.id,
      userId: user.id,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubscriptionProduct = async (input: {
  id: SubscriptionProductId;
  stripeProductId: string;
  name: string;
  user: UserModel;
}) => {
  try {
    const { id, stripeProductId, name, user } = input;

    const stripeProduct = await StripeService.updateProduct({
      productId: stripeProductId,
      name,
    });

    const res = await SubscriptionStore.updateSubscriptionProduct({
      id,
      name: stripeProduct.name, // use the one from the stripe product to ensure it's the same
      stripeProductId: stripeProduct.id,
      userId: user.id,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createSubscriptionPrice = async (input: {
  productId: SubscriptionProductId;
  stripeProductId: string;
  amount: number;
  interval?: string;
  user: UserModel;
}) => {
  try {
    const { productId, stripeProductId, amount, interval, user } = input;

    // TODO: Add audit log event

    const stripePrice = await StripeService.createPrice({
      productId: stripeProductId,
      amount: amount,
      currency: 'myr',
      ...(interval && { interval }),
    });

    const res = await SubscriptionStore.getSubscriptionProducts({
      ids: [productId],
    });

    return _.head(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getPackagePriceIds = async (input: {
  packageId: SubscriptionPackageId;
  interval: string;
}) => {
  try {
    const { packageId, interval } = input;

    // Get which products are included in this subscription package
    const subProducts =
      await SubscriptionStore.getProductsInSubscriptionPackage({
        packageId,
      });

    const subProductStripeIds = subProducts.map(
      (subProduct) => subProduct.stripeProductId,
    );

    if (_.isEmpty(subProducts)) {
      throw new Error('Subscription package has no products');
    }

    const stripePrices = await StripeService.getRecurringPrices();

    const selectedPrices = stripePrices.filter((price) => {
      return (
        subProductStripeIds.includes(price.product) &&
        price.recurring?.interval === interval
      );
    });

    if (selectedPrices.length !== subProducts.length) {
      throw new Error('Could not find all prices for subscription products');
    }

    const selectedPriceIds = selectedPrices.map((price) => price.id);
    return selectedPriceIds;
  } catch (error) {
    return Promise.reject(error);
  }
};

// This is a critical function so gonna comment it a bit more than usual
const startSubscription = async (input: {
  companyId: CompanyId;
  packageId: SubscriptionPackageId;
  interval: string;
  user: UserModel;
}) => {
  try {
    const { companyId, packageId, interval, user } = input;

    // In the current implementation, each company should only have a single row in the subscriptions table
    // If they have a basic plan the stripe subscription id should be null
    const activeSubscription =
      await exportFunctions.getSubscriptionForCompanyId({ companyId, user });

    if (activeSubscription.stripeSubscriptionId) {
      // New behaviour is that every company will have a subscription, the free plan is also a subscription

      throw new Error('Company already has an active subscription');
    }

    // Get all the prices from stripe for the products in the subscription package
    const selectedPriceIds = await getPackagePriceIds({
      packageId,
      interval,
    });

    // Get the company's payment method so we can create a subscription
    const paymentMethod = await CompanyStore.getCompanyDefaultPaymentMethod({
      companyId,
    });

    if (_.isEmpty(paymentMethod)) {
      throw new Error('Company does not have a default payment method');
    }

    // Create the subscription
    const stripeSubscription = await StripeService.createSubscription({
      customerId: paymentMethod.stripeCustomerId,
      items: selectedPriceIds.map((priceId) => ({
        price: priceId,
        quantity: 1,
      })),
      paymentMethodId: paymentMethod.stripePaymentMethodId,
    });

    // TODO: Update the company's quotas in the DB

    // Insert the subscription into the database
    const createdSubscription = await SubscriptionStore.updateSubscription({
      subscriptionId: activeSubscription.id,
      packageId,
      intervalType: interval,
      stripeSubscriptionId: stripeSubscription.id,
      userId: user.id,
    });

    // Notify event handler that a new subscription has been created
    const subscriptionAmount = stripeSubscription.items.data.reduce(
      (acc, item) => acc + (item?.price?.unit_amount || 0),
      0,
    );

    const oldPackage = await SubscriptionStore.getSubscriptionPackagesById(
      activeSubscription.packageId,
    );

    // Update the company's subscription quota
    await exportFunctions.updateSubscriptionQuota({
      companyId,
      oldPackage,
      newSubscription: createdSubscription,
    });

    await EventManagerService.notifySubscriptionStart({
      subscription: createdSubscription,
      companyId,
      userPayer: user,
      subscriptionAmount,
    });

    return createdSubscription;
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
    const res = await SubscriptionStore.createSubscriptionPackage(input);
    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

export type QuotaStatus = {
  user?: boolean;
  task?: boolean;
  invoice?: boolean;
  report?: boolean;
  team?: boolean;
  storage?: boolean;
};

export type QuotaType =
  | 'user'
  | 'task'
  | 'invoice'
  | 'report'
  | 'team'
  | 'storage';

const isCompanyQuotaAvailable = async (input: {
  quotaType: QuotaStatus;
  subscription: SubscriptionModel;
}): Promise<QuotaStatus> => {
  try {
    const { quotaType, subscription } = input;

    const sub = {
      user: false,
      task: false,
      invoice: false,
      report: false,
      team: false,
      storage: false,
    };

    for (const quota in quotaType) {
      //@ts-ignore
      if (quotaType[quota]) {
        //@ts-ignore
        const quotaValue = subscription[`${quota}Quota`];
        if (quotaValue >= 1) {
          //@ts-ignore
          sub[quota] = true;
        } else {
          //@ts-ignore
          sub[quota] = false;
        }
      }
    }

    return sub;
  } catch (error) {
    return Promise.reject(error);
  }
};

const handleSubscriptionQuota = async (input: {
  companyId: CompanyId;
  quotaType: QuotaType;
  quota?: number;
  isDecrement?: boolean;
}) => {
  try {
    const { companyId, quotaType, quota = 1, isDecrement = false } = input;
    if (!process.env.SUBSCRIPTION_REWORK) {
      return;
    }

    const company = (await CompanyStore.getCompaniesById(
      companyId,
    )) as CompanyModel;
    const user = (await UserStore.getUserById(company.userId)) as UserModel;

    const subscription = await exportFunctions.getSubscriptionForCompanyId({
      companyId,
      user,
    });

    const subscriptionPackage =
      await SubscriptionStore.getSubscriptionPackagesById(
        subscription.packageId,
      );
    const isUnlimited = subscriptionPackage[`${quotaType}Quota`] === -1;

    if (isUnlimited) {
      return subscriptionPackage[`${quotaType}Quota`];
    }

    const quotaLimit = subscriptionPackage[`${quotaType}Quota`];

    let newCount = 0;
    let isOverQuota = true;

    if (quotaType === 'user') {
      const count = await SubscriptionStore.getCompanyUserCount(companyId);

      const totalCount = isDecrement ? count + quota : count;

      newCount = quotaLimit - totalCount;

      isOverQuota = newCount < 0;
    } else if (quotaType === 'team') {
      const count = await SubscriptionStore.getCompanyTeamCount(companyId);
      const totalCount = isDecrement ? count + quota : count;
      newCount = quotaLimit - totalCount;
      isOverQuota = newCount < 0;
    } else if (quotaType === 'task') {
      const count = await SubscriptionStore.getTaskCount(companyId);
      const totalCount = isDecrement ? Number(count) + quota : Number(count) - 1;
      newCount = quotaLimit - totalCount;
      isOverQuota = newCount < 0;
    } else if (quotaType === 'storage') {
      const total = await SubscriptionStore.getTotalStorageByCompanyId(
        companyId,
      );
      newCount = isDecrement
        ? quotaLimit - (total + quota)
        : quotaLimit - total;
      isOverQuota = newCount < 0;
    } else if (quotaType === 'report') {
      const totalCount = isDecrement ? -quota : quota;
      const currentTotal = subscription[`${quotaType}Quota`];
      newCount = currentTotal + totalCount;
      isOverQuota = newCount < 0;
    } else if (quotaType === 'invoice') {
      const count = await SubscriptionStore.getInvoiceCount(companyId);
      const totalCount = isDecrement ? Number(count) + quota : Number(count);
      newCount = quotaLimit - totalCount;
      isOverQuota = newCount < 0;
    }

    if (!isOverQuota) {
      await SubscriptionStore.updateSubscriptionQuota({
        companyId,
        [`${quotaType}Quota`]: newCount,
      });

      return newCount;
    }
    if (isDecrement) {
      throw new Error(`You are out of quota for ${quotaType}.`);
    }

    return newCount;
  } catch (error) {
    return Promise.reject(error);
  }
};

const upgradeSubscription = async (input: {
  companyId: CompanyId;
  subscription: SubscriptionModel;
  packageId: SubscriptionPackageId;
  interval: string;
  user: UserModel;
}) => {
  try {
    const { companyId, subscription, packageId, interval, user } = input;
    if (subscription.packageId === packageId) {
      throw new Error('Cannot upgrade to the same subscription package');
    }
    // Get the current package
    const currentPackage = await SubscriptionStore.getSubscriptionPackagesById(
      subscription.packageId,
    );

    const currentPriceIds = await exportFunctions.getPackagePriceIds({
      packageId: currentPackage.id,
      interval,
    });

    // Get all the prices from stripe for the products in the subscription package
    const selectedPriceIds = await exportFunctions.getPackagePriceIds({
      packageId,
      interval,
    });

    // We need to compare and see which items need to be added or removed
    const subItems = await StripeService.listSubscriptionItems(
      subscription.stripeSubscriptionId,
    );

    const priceIdsToAdd = _.difference(selectedPriceIds, currentPriceIds);
    if (priceIdsToAdd.length > 0) {
      await StripeService.addSubscriptionItems({
        subscriptionId: subscription.stripeSubscriptionId,
        priceIds: priceIdsToAdd,
      });
    }

    // We need to handle removing items separately because we only want to
    // prorate for adding items and not removing items
    const pricesToRemove = _.difference(currentPriceIds, selectedPriceIds);
    if (pricesToRemove.length > 0) {
      const subItemIdsToRemove = subItems
        .filter((si) => pricesToRemove.includes(si.price.id))
        .map((si) => si.id);

      await StripeService.removeSubscriptionItems({
        subscriptionId: subscription.stripeSubscriptionId,
        itemIds: subItemIdsToRemove,
      });
    }

    // Update the company's record in the database
    const updatedSubscription =
      await SubscriptionStore.updateCompanySubscribedPackage({
        subscriptionId: subscription.id,
        intervalType: interval,
        packageId,
        userId: user.id,
      });

    // Update the company's subscription quota
    exportFunctions.updateSubscriptionQuota({
      companyId,
      oldPackage: currentPackage,
      newSubscription: updatedSubscription,
    });

    // Notify the event handler that the subscription has been updated

    const subscriptionAmount = subItems.reduce(
      (acc, item) => acc + (item?.price?.unit_amount || 0),
      0,
    );
    await EventManagerService.notifySubscriptionStart({
      subscription: updatedSubscription,
      companyId,
      userPayer: user,
      subscriptionAmount,
    });

    return updatedSubscription;
  } catch (error) {
    return Promise.reject(error);
  }
};

const downgradeSubscription = async (input: {
  companyId: CompanyId;
  subscription: SubscriptionModel;
  packageId: SubscriptionPackageId;
  interval: string;
  user: UserModel;
}) => {
  try {
    const { companyId, subscription, packageId, interval, user } = input;

    if (subscription.packageId === packageId) {
      throw new Error('Cannot downgrade to the same subscription package');
    }

    // Get the current package
    const currentPackage = await SubscriptionStore.getSubscriptionPackagesById(
      subscription.packageId,
    );

    const futurePackage = await SubscriptionStore.getSubscriptionPackagesById(
      packageId,
    );

    const currentPriceIds = await exportFunctions.getPackagePriceIds({
      packageId: currentPackage.id,
      interval,
    });

    // Get all the prices from stripe for the products in the subscription package
    const selectedPriceIds = await exportFunctions.getPackagePriceIds({
      packageId,
      interval,
    });

    const stripeSubscription = await StripeService.getSubscription(
      subscription.stripeSubscriptionId,
    );
    const subscriptionRenewDate = dayjs(
      stripeSubscription.current_period_end * 1000,
    ).format('YYYY-MM-DD HH:mm:ss');

    // We need to compare and see which items need to be added or removed
    const subItems = await StripeService.listSubscriptionItems(
      subscription.stripeSubscriptionId,
    );

    const priceIdsToAdd = _.difference(selectedPriceIds, currentPriceIds);
    if (priceIdsToAdd.length > 0) {
      await StripeService.addSubscriptionItems({
        subscriptionId: subscription.stripeSubscriptionId,
        priceIds: priceIdsToAdd,
        shouldProrate: false,
      });
    }

    // We need to handle removing items separately because we only want to
    // prorate for adding items and not removing items
    const pricesToRemove = _.difference(currentPriceIds, selectedPriceIds);
    if (pricesToRemove.length > 0) {
      const subItemIdsToRemove = subItems
        .filter((si) => pricesToRemove.includes(si.price.id))
        .map((si) => si.id);

      await StripeService.removeSubscriptionItems({
        subscriptionId: subscription.stripeSubscriptionId,
        itemIds: subItemIdsToRemove,
        shouldProrate: false,
      });
    }

    // Schedule the downgrade at the end of the billing cycle
    await SubscriptionStore.insertSubscriptionChangeAction({
      companyId,
      subscriptionId: subscription.id,
      action: SUBSCRIPTION_CHANGE_ACTIONS.DOWNGRADE,
      actionData: {
        packageId,
        packageName: futurePackage.name,
      },
      runAt: subscriptionRenewDate,
      userId: user.id,
    });

    return subscription;
  } catch (error) {
    return Promise.reject(error);
  }
};

const cancelSubscriptionV2 = async (input: {
  companyId: CompanyId;
  subscription: SubscriptionModel;
  reason: string;
  user: UserModel;
}) => {
  try {
    const { companyId, subscription, reason, user } = input;

    // Get the current package
    const currentPackage = await SubscriptionStore.getSubscriptionPackagesById(
      subscription.packageId,
    );

    const defaultPackage =
      await SubscriptionStore.getDefaultSubscriptionPackage();

    const stripeSubscription = await StripeService.getSubscription(
      subscription.stripeSubscriptionId,
    );
    const subscriptionRenewDate = dayjs(
      stripeSubscription.current_period_end * 1000,
    ).format('YYYY-MM-DD HH:mm:ss');

    const stripeCancelResult = await StripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
    );

    // Schedule the downgrade at the end of the billing cycle
    await SubscriptionStore.insertSubscriptionChangeAction({
      companyId,
      subscriptionId: subscription.id,
      action: SUBSCRIPTION_CHANGE_ACTIONS.CANCEL,
      actionData: {
        packageId: defaultPackage.id,
        packageName: defaultPackage.name,
        currentPackageId: currentPackage.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      },
      runAt: subscriptionRenewDate,
      userId: user.id,
    });

    // TODO: Notify the event handler that the subscription has been cancelled

    return subscription;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const refreshSubscriptionQuota = async () => {
  try {
    const isFirstDayOfMonth = dayjs().date() === 1;

    if (!isFirstDayOfMonth) {
      return;
    }

    const subscriptions = await SubscriptionStore.getAllSubscriptions();

    for (const subscription of subscriptions) {
      const companyTimezone = await CompanyService.getCompanyDefaultTimezone({
        companyId: subscription.companyId,
      });

      const isMidnight = dayjs().tz(companyTimezone).hour() === 0;

      if (isFirstDayOfMonth && isMidnight) {
        const subPackage = (await SubscriptionStore.getSubscriptionPackagesById(
          subscription.packageId,
        )) as SubscriptionPackageNewModel;

        const { invoiceQuota, reportQuota } = subPackage;

        await SubscriptionStore.updateSubscriptionQuota({
          companyId: subscription.companyId,
          invoiceQuota,
          reportQuota,
        });
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

// This function is used to change the payment method for a subscription
// when switching the active card on the account
const updateSubscriptionPaymentMethod = async (input: {
  companyId: CompanyId;
  stripePaymentMethodId: string;
}) => {
  try {
    const { companyId, stripePaymentMethodId } = input;
    // Get the company's subscription
    const subscription = await SubscriptionStore.getSubscriptionForCompanyId({
      companyId,
    });

    // if the user is on a free plan (no stripe subscription id) then we don't need to do anything
    if (!subscription || !subscription.stripeSubscriptionId) {
      return;
    }

    const updatedSub = await StripeService.updateSubscriptionPaymentMethod({
      subscriptionId: subscription.stripeSubscriptionId,
      paymentMethodId: stripePaymentMethodId,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const addProductToPackage = async (input: {
  productId: SubscriptionProductId;
  packageId: SubscriptionPackageId;
  user: UserModel;
}) => {
  try {
    const { productId, packageId } = input;

    const res = await SubscriptionStore.addProductToPackage({
      productId,
      packageId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeProductFromPackage = async (input: {
  productId: SubscriptionProductId;
  packageId: SubscriptionPackageId;
  user: UserModel;
}) => {
  try {
    const { productId, packageId } = input;

    const res = await SubscriptionStore.removeProductFromPackage({
      productId,
      packageId,
    });

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateSubscriptionQuota = async (input: {
  newSubscription: SubscriptionModel;
  oldPackage: SubscriptionPackageNewModel;
  companyId: CompanyId;
}) => {
  try {
    const { newSubscription, oldPackage, companyId } = input;

    const newPackage = (await SubscriptionStore.getSubscriptionPackagesById(
      newSubscription.packageId,
    )) as SubscriptionPackageNewModel;

    const {
      invoiceQuota,
      reportQuota,
      userQuota,
      storageQuota,
      teamQuota,
      taskQuota,
    } = newSubscription;

    const {
      invoiceQuota: oldInvoiceQuota,
      reportQuota: oldReportQuota,
      userQuota: oldUserQuota,
      storageQuota: oldStorageQuota,
      teamQuota: oldTeamQuota,
      taskQuota: oldTaskQuota,
    } = oldPackage;

    const {
      invoiceQuota: newInvoiceQuota,
      reportQuota: newReportQuota,
      userQuota: newUserQuota,
      storageQuota: newStorageQuota,
      teamQuota: newTeamQuota,
      taskQuota: newTaskQuota,
    } = newPackage;

    const isInvoiceQuotaUnlimited = newInvoiceQuota === -1;
    const isReportQuotaUnlimited = newReportQuota === -1;
    const isUserQuotaUnlimited = newUserQuota === -1;
    const isStorageQuotaUnlimited = newStorageQuota === -1;
    const isTeamQuotaUnlimited = newTeamQuota === -1;
    const isTaskQuotaUnlimited = newTaskQuota === -1;

    const numberOfUsers = await SubscriptionStore.getCompanyUserCount(
      companyId,
    );

    const totalBytes = await SubscriptionStore.getTotalStorageByCompanyId(
      companyId,
    );

    const numberOfTeams = await SubscriptionStore.getCompanyTeamCount(
      companyId,
    );
    
    const numberOfTasks = await SubscriptionStore.getTaskCount(companyId);

    const invoiceQuotaToAdd = isInvoiceQuotaUnlimited
      ? -1
      : newInvoiceQuota - (oldInvoiceQuota - invoiceQuota);

    const reportQuotaToAdd = isReportQuotaUnlimited
      ? -1
      : newReportQuota - (oldReportQuota - reportQuota);

    const userQuotaToAdd = isUserQuotaUnlimited
      ? -1
      : newUserQuota - numberOfUsers;

    const storageQuotaToAdd = isStorageQuotaUnlimited
      ? -1
      : newStorageQuota - totalBytes;

    const teamQuotaToAdd = isTeamQuotaUnlimited
      ? -1
      : newTeamQuota - numberOfTeams;

    const taskQuotaToAdd = isTaskQuotaUnlimited
      ? -1
      : newTaskQuota - Number(numberOfTasks);

    const res = await SubscriptionStore.updateSubscriptionQuota({
      companyId,
      invoiceQuota: invoiceQuotaToAdd,
      reportQuota: reportQuotaToAdd,
      userQuota: userQuotaToAdd,
      storageQuota: storageQuotaToAdd,
      teamQuota: teamQuotaToAdd,
      taskQuota: taskQuotaToAdd,
    });

    return res;
  } catch (error) {
    console.error(error);
  }
};

const runSubscriptionChanges = async () => {
  try {
    const subChanges =
      await SubscriptionStore.getCurrentHourSubscriptionChanges();

    for (const subChange of subChanges) {
      const {
        id,
        subscriptionId,
        companyId,
        action,
        actionData,
        createdAt,
        createdBy,
        runAt,
        completedAt,
        completedBy,
      } = subChange;

      const packageId = actionData?.packageId;

      //get subscription
      const subscription = (await SubscriptionStore.getSubscriptionsById(
        subscriptionId,
      )) as SubscriptionModel;

      if (action === SUBSCRIPTION_CHANGE_ACTIONS.DOWNGRADE) {
        // Update the company's record in the database
        const newSubscription =
          await SubscriptionStore.updateCompanySubscribedPackage({
            subscriptionId: subscription.id,
            intervalType: subscription?.intervalType,
            packageId,
            userId: createdBy,
          });

        const oldPackage = (await SubscriptionStore.getSubscriptionPackagesById(
          subscription.packageId,
        )) as SubscriptionPackageNewModel;

        // Update the company's subscription quota
        await exportFunctions.updateSubscriptionQuota({
          companyId,
          oldPackage,
          newSubscription,
        });

        await SubscriptionStore.updateSubscriptionChanges({ subChangeId: id });
      } else if (action === SUBSCRIPTION_CHANGE_ACTIONS.CANCEL) {
        const newSubscription =
          await SubscriptionStore.updateCompanySubscribedPackage({
            subscriptionId: subscription.id,
            stripeSubscriptionId: null,
            intervalType: 'month',
            packageId,
            userId: createdBy,
          });

        const oldPackage = (await SubscriptionStore.getSubscriptionPackagesById(
          subscription.packageId,
        )) as SubscriptionPackageNewModel;

        // Update the company's subscription quota
        await exportFunctions.updateSubscriptionQuota({
          companyId,
          oldPackage,
          newSubscription,
        });

        await SubscriptionStore.updateSubscriptionChanges({ subChangeId: id });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const exportFunctions = {
  getSubscriptionForCompanyId,
  getSubscriptionProducts,
  createSubscriptionProduct,
  updateSubscriptionProduct,
  createSubscriptionPrice,
  startSubscription,
  createSubscriptionPackage,
  isCompanyQuotaAvailable,
  handleSubscriptionQuota,
  upgradeSubscription,
  downgradeSubscription,
  getPackagePriceIds,
  refreshSubscriptionQuota,
  updateSubscriptionPaymentMethod,
  addProductToPackage,
  removeProductFromPackage,
  createBasicSubscriptionForCompanyId,
  updateSubscriptionQuota,
  runSubscriptionChanges,
  cancelSubscriptionV2,
};

export default exportFunctions;
