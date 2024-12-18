import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { CompanyService, StripeService, SubscriptionService } from '@services';
import { CompanyModel, CompanyMemberModel } from '@models/company.model';
import { withAuth, withUserAuth } from '@graphql/wrappers';
import {
  CompanySubscriptionModel,
  DiscountedPriceModel,
  StripeInvoiceModel,
  SubscriptionModel,
  SubscriptionPackageModel,
  SubscriptionPackagePriceModel,
  SubscriptionProductModel,
} from '@models/subscription.model';

import _ from 'lodash';
import {
  getCompany,
  getCompanyMember,
  getCompanySubscription,
  getCompanySubscriptions,
  getSubscriptionPackagePrice,
  getSubscriptionPackagePrices,
  getSubscriptionProduct,
} from '@data-access/getters';
import { handleResolverError } from '@graphql/errors';
import { CompanyStore, SubscriptionStore } from '@data-access';
import { camelizeOnly as camelize } from '@data-access/utils';

export const resolvers: Resolvers = {
  Subscription: {
    id: ({ idText }) => idText,
    // @ts-ignore -- FIXME: figure out why ts is complaining about this
    company: async ({ companyId }) => {
      try {
        const company = await CompanyStore.getCompaniesById(companyId);
        return company;
      } catch (error) {
        return null;
      }
    },
    // @ts-ignore -- FIXME: figure out why ts is complaining about this
    package: async ({ packageId }) => {
      try {
        const subscriptionPackage =
          await SubscriptionStore.getSubscriptionPackagesById(packageId);

        return subscriptionPackage;
      } catch (error) {
        return null;
      }
    },
    // @ts-ignore -- FIXME: figure out why ts is complaining about this
    upcomingChanges: async ({ companyId }) => {
      try {
        const changes =
          await SubscriptionStore.getSubscriptionChangesForCompanyId(companyId);
        return changes;
      } catch (error) {
        return [];
      }
    },
  },
  SubscriptionProduct: {
    id: ({ idText }) => idText,
    prices: async ({ stripeProductId }) => {
      const ps = camelize(await StripeService.getRecurringPrices());
      return ps.filter((p) => p.product === stripeProductId);
    },
  },
  SubscriptionPrice: {
    amount: ({ unitAmount }) => unitAmount,
    interval: ({ recurring: { interval } }) => interval,
    stripePriceId: ({ id }) => id,
    stripeProductId: ({ product }) => product,
  },
  Query: {
    subscription: async (root, { id }, { auth: { user } }) => {
      try {
        if (id) {
          if (!user.isAdmin) {
            throw new AuthenticationError('Not authorized');
          }
          const subscription = (await SubscriptionStore.getSubscriptionsById(
            id,
          )) as SubscriptionModel;
          return subscription;
        }

        if (!user.isAdmin && !user.activeCompany) {
          throw new AuthenticationError('Not authorized');
        }

        const subscription =
          await SubscriptionStore.getSubscriptionForCompanyId({
            companyId: user.activeCompany,
          });

        return subscription;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    subscriptionProduct: async (root, { productId }, { auth: { user } }) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const products =
          (await SubscriptionStore.getSubscriptionProducts()) as SubscriptionProductModel[];
        const product = products.find((p) => p.idText === productId);
        if (!product) {
          throw new ApolloError('Product not found');
        }

        return product;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    subscriptionProducts: async (root, args, { auth: { user } }) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const res = await SubscriptionService.getSubscriptionProducts();
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    subscriptionPackageV2: async (root, { packageId }, { auth: { user } }) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const res = await SubscriptionStore.listSubscriptionPackages();

        return res.find((p) => p.idText === packageId);
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    subscriptionPackagesV2: async (root, { listAll }, { auth: { user } }) => {
      try {
        if (listAll) {
          if (!user.isAdmin) {
            throw new AuthenticationError('Not authorized');
          }

          const res = await SubscriptionStore.listSubscriptionPackages();
          return res;
        }

        const res = await SubscriptionStore.listSubscriptionPackages({
          orderBy: 'sequence',
        });
        const filteredPackages = res.filter((p) => p.published);
        return filteredPackages;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    /* ------------ LEGACY */
    companySubscription: withAuth(async (root, { subscriptionId }) => {
      const res = await getCompanySubscription(subscriptionId);

      return res;
    }),
    companySubscriptions: withAuth(async (root, { companyId }) => {
      const company = await getCompany(companyId);
      const res = await SubscriptionService.getActiveCompanySubscriptions(
        company.id,
      );
      return res;
    }),
    userSubscriptions: withUserAuth(async (root, args, { auth: { user } }) => {
      if (!user) {
        throw new AuthenticationError('Invalid user');
      }
      const res = await SubscriptionService.getSubscriptionsByUser(user.id);
      return res;
    }),
    subscriptionPackages: async () => {
      try {
        const res =
          (await SubscriptionService.getPackages()) as SubscriptionPackageModel[];
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    dedocoPackages: async () => {
      try {
        const res =
          (await SubscriptionService.getDedocoPackages()) as SubscriptionPackageModel[];
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    userInvoices: withUserAuth(
      async (root, args, { loaders, auth: { user } }) => {
        try {
          if (!user) {
            throw new AuthenticationError('No user');
          }
          const res = (await SubscriptionService.listUserInvoices({
            user,
          })) as StripeInvoiceModel[];
          return res || [];
        } catch (error) {
          throw new ApolloError(error as string);
        }
      },
    ),
    promoCodeInfo: withUserAuth(
      async (
        root,
        { code, createSubscriptionInput },
        { loaders, auth: { user } },
      ) => {
        try {
          if (!user) {
            throw new AuthenticationError('No user');
          }
          const packagePriceIds = createSubscriptionInput.map(
            (cs: any) => cs.package_price_id,
          );
          const prices = (await loaders.subscriptionPackagePrices.loadMany(
            packagePriceIds,
          )) as SubscriptionPackagePriceModel[];

          if (prices.some((price) => price === undefined)) {
            throw new UserInputError('Price id does not exist');
          }

          const packageIds = prices.map((price) => price.package_id);
          const subscriptionPackages =
            (await loaders.subscriptionPackages.loadMany(
              packageIds,
            )) as SubscriptionPackageModel[];
          const res = await SubscriptionService.getPromoCodeInfo({
            code,
            prices,
            createSubscriptionInput,
            subscriptionPackages,
          });

          return res as DiscountedPriceModel[];
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    subscriptionQuantitiesAssigned: withAuth(
      async (root, { stripeProductId, companyId }) => {
        const company = await getCompany(companyId);

        const res = await SubscriptionService.getSubscriptionQuantities({
          companyId: company.id,
          stripeProductId,
        });
        return res;
      },
    ),
  },
  SubscriptionPriceInterval: {
    MONTH: 'month',
    YEAR: 'year',
  },
  PackageTypes: {
    BASIC: 1,
    TIME_ATTENDANCE: 2,
    PROJECT_MANAGEMENT_TOOL: 3,
    PAYMENT_COLLECTION_REMINDER: 4,
    DEDOCO: 5,
    LEGACY: 0,
  },
  SubscriptionStatuses: {
    ACTIVE: 1,
    OVERDUE: 2,
    CANCELLED: 3,
    INCOMPLETE: 4,
    TRIAL: 5,
  },
  DiscountedPrice: {
    package: async ({ id }, args, { loaders }) => {
      try {
        const res = await loaders.subscriptionPackages.load(id);
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
  },
  CompanySubscription: {
    id: ({ id_text }) => id_text,
    package: async ({ package_id }, args, { loaders }) => {
      try {
        const res = await loaders.subscriptionPackages.load(package_id);
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
    type: ({ data, packageTitle }) => {
      // FIXME: This is a hack to get the type of the subscription
      // need to fix this in the future (Enoch)
      if (data && typeof data.type === 'number') {
        return data.type;
      } else {
        switch (packageTitle) {
          case 'Omni Starter':
            return 1;
          case 'Omni Time Attendance':
            return 2;
          case 'Omni Project Management Tool':
            return 3;
          default:
            return 1;
        }
      }
    },
    productId: ({ product_id }) => {
      return product_id ? product_id : null;
    },
    company: async ({ company_id }, args, { loaders }) => {
      return await loaders.companies.load(company_id);
    },
    //deprecated
    whatsapp_quota: async ({ whatsApp_quota }) => whatsApp_quota,
    //deprecated
    stripe_subscription_id: ({ subscription_id }) => subscription_id,

    whatsappQuota: async ({ whatsAppQuota }) => whatsAppQuota,
    stripeSubscriptionId: ({ subscriptionId }) => subscriptionId,
    // @ts-ignore
    discount: async ({ subscription_id, product_id }) => {
      if (subscription_id) {
        const res = await StripeService.getSubscription(subscription_id);
        const applicableProductIds =
          res?.discount?.coupon?.metadata?.applicable_products;

        const parsed = applicableProductIds?.trim().split(',');
        const isApplicable = _.find(parsed, (apId) => apId === product_id);

        if (isApplicable) {
          return res.discount;
        }
      }

      return null;
    },
    whiteListedMembers: async (
      { company_id, product_id },
      args,
      { loaders },
    ) => {
      const res = await SubscriptionService.getSubscriptionQuantities({
        companyId: company_id,
        stripeProductId: product_id,
      });
      return res;
    },

    subscriptionPackagePrice: async ({ price_id }) => {
      try {
        return await SubscriptionService.getPackagePriceByStripeId(price_id);
      } catch (error) {
        handleResolverError(error);
      }
    },
  },
  SubscriptionPackage: {
    // FIXME: remove underscores when possible
    id: ({ id_text, idText }) => id_text || idText,
    // NOTE: ----------BELOW ARE ALL DEPRECATED
    productId: ({ product_id }) => {
      return product_id ? product_id : null;
    },
    //deprecated
    package_prices: async ({ id }) => {
      return await SubscriptionService.getPackagePrices(id);
    },
    packagePrices: async ({ id }) => {
      return await SubscriptionService.getPackagePrices(id);
    },
    products: async ({ id }) => {
      return await SubscriptionStore.getProductsInSubscriptionPackage({
        packageId: id,
      });
    },
  },
  SubscriptionPackagePrice: {
    id: ({ id_text }) => id_text,
  },
  SubscriptionPromoCode: {
    subscription: async ({ subscription_id }, args, { loaders }) => {
      return await loaders.companySubscriptions.load(subscription_id);
    },
  },
  SubscriptionQuantityResult: {
    companyMembers: ({ company_members }) => {
      return company_members ? company_members : null;
    },
  },
  Mutation: {
    startSubscription: async (root, { input }, { auth: { user } }) => {
      const { companyId, packageId, interval } = input;

      const company = await getCompany(companyId);
      const companyMember = await CompanyService.getMemberByUserIdAndCompanyId({
        companyId: company.id,
        userId: user.id,
      });

      const subPackage = await SubscriptionStore.getSubscriptionPackagesById(
        packageId,
      );

      const isMember = await CompanyService.validateUserInCompany({
        userId: user.id,
        companyId: company.id,
      });

      if (!companyMember || !isMember || companyMember.type !== 1) {
        throw new AuthenticationError(
          'You are not authorized to perform this action. Please contact your company administrator.',
        );
      }

      const subscription = await SubscriptionService.startSubscription({
        companyId: company.id,
        packageId: subPackage.id,
        interval,
        user,
      });

      return subscription;
    },
    upgradeSubscription: async (root, { input }, { auth: { user } }) => {
      try {
        const { subscriptionId, companyId, packageId, interval } = input;

        const company = await getCompany(companyId);
        const companyMember =
          await CompanyService.getMemberByUserIdAndCompanyId({
            companyId: company.id,
            userId: user.id,
          });

        const subPackage = await SubscriptionStore.getSubscriptionPackagesById(
          packageId,
        );

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!companyMember || !isMember || companyMember.type !== 1) {
          throw new AuthenticationError(
            'You are not authorized to perform this action. Please contact your company administrator.',
          );
        }

        const currentSubscription =
          await SubscriptionStore.getSubscriptionsById(subscriptionId);

        const subscription = await SubscriptionService.upgradeSubscription({
          subscription: currentSubscription,
          companyId: company.id,
          packageId: subPackage.id,
          interval,
          user,
        });

        return subscription;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    downgradeSubscription: async (root, { input }, { auth: { user } }) => {
      try {
        const { subscriptionId, companyId, packageId, interval } = input;

        const company = await getCompany(companyId);
        const companyMember =
          await CompanyService.getMemberByUserIdAndCompanyId({
            companyId: company.id,
            userId: user.id,
          });

        const subPackage = await SubscriptionStore.getSubscriptionPackagesById(
          packageId,
        );

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!companyMember || !isMember || companyMember.type !== 1) {
          throw new AuthenticationError(
            'You are not authorized to perform this action. Please contact your company administrator.',
          );
        }

        const currentSubscription =
          await SubscriptionStore.getSubscriptionsById(subscriptionId);

        const subscription = await SubscriptionService.downgradeSubscription({
          subscription: currentSubscription,
          companyId: company.id,
          packageId: subPackage.id,
          interval,
          user,
        });

        return subscription;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    cancelSubscriptionV2: async (root, { input }, { auth: { user } }) => {
      try {
        const { subscriptionId, companyId, reason } = input;

        const company = await getCompany(companyId);
        const companyMember =
          await CompanyService.getMemberByUserIdAndCompanyId({
            companyId: company.id,
            userId: user.id,
          });

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!companyMember || !isMember || companyMember.type !== 1) {
          throw new AuthenticationError(
            'You are not authorized to perform this action. Please contact your company administrator.',
          );
        }

        const currentSubscription =
          await SubscriptionStore.getSubscriptionsById(subscriptionId);

        const subscription = await SubscriptionService.cancelSubscriptionV2({
          subscription: currentSubscription,
          companyId: company.id,
          reason: reason || '',
          user,
        });

        return subscription;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createSubscriptionProduct: async (root, { input }, { auth: { user } }) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const { name } = input;

        const res = await SubscriptionService.createSubscriptionProduct({
          name,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    updateSubscriptionProduct: async (
      root,
      { id, input },
      { auth: { user } },
    ) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const { name } = input;

        const products =
          (await SubscriptionStore.getSubscriptionProducts()) as SubscriptionProductModel[];
        const product = products.find((p) => p.idText === id);
        if (!product) {
          throw new ApolloError('Product not found');
        }

        const res = await SubscriptionService.updateSubscriptionProduct({
          id: product.id,
          name,
          stripeProductId: product.stripeProductId,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    addSubscriptionProductToPackage: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const { productId, packageId } = input;

        const products =
          (await SubscriptionStore.getSubscriptionProducts()) as SubscriptionProductModel[];
        const product = products.find((p) => p.idText === productId);
        if (!product) {
          throw new ApolloError('Product not found');
        }

        const pkg = await SubscriptionStore.getSubscriptionPackagesById(
          packageId,
        );
        if (!pkg) {
          throw new ApolloError('Package not found');
        }

        const res = await SubscriptionService.addProductToPackage({
          productId: product.id,
          packageId: pkg.id,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    removeSubscriptionProductFromPackage: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const { productId, packageId } = input;

        const products =
          (await SubscriptionStore.getSubscriptionProducts()) as SubscriptionProductModel[];
        const product = products.find((p) => p.idText === productId);
        if (!product) {
          throw new ApolloError('Product not found');
        }

        const pkg = await SubscriptionStore.getSubscriptionPackagesById(
          packageId,
        );
        if (!pkg) {
          throw new ApolloError('Package not found');
        }

        const res = await SubscriptionService.removeProductFromPackage({
          productId: product.id,
          packageId: pkg.id,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createSubscriptionPrice: async (root, { input }, { auth: { user } }) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const { amount, interval, productId } = input;
        const product = await getSubscriptionProduct(productId);

        const res = await SubscriptionService.createSubscriptionPrice({
          amount,
          ...(interval && { interval }),
          stripeProductId: product.stripeProductId,
          productId: product.id,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    createSubscriptionPackage: async (root, { input }, { auth: { user } }) => {
      try {
        if (!user.isAdmin) {
          throw new AuthenticationError('Not authorized');
        }

        const {
          name,
          userQuota,
          taskQuota,
          invoiceQuota,
          reportQuota,
          teamQuota,
          storageQuota,
        } = input;

        const res = await SubscriptionService.createSubscriptionPackage({
          userId: user.id,
          name,
          userQuota,
          taskQuota,
          invoiceQuota,
          reportQuota,
          teamQuota,
          storageQuota,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    /* BELOW ARE LEGACY to be deprecated */
    requestOmniSubscription: withUserAuth(
      async (
        root,
        { companyId, createSubscriptionInput, promoCode },
        { loaders, auth: { user } },
      ) => {
        const packagePriceIds = createSubscriptionInput.map(
          (cs: any) => cs.package_price_id,
        );

        if (!user) {
          throw new AuthenticationError('No user');
        }

        const company = await getCompany(companyId);

        const prices = (await loaders.subscriptionPackagePrices.loadMany(
          packagePriceIds,
        )) as SubscriptionPackagePriceModel[];

        if (prices.some((price) => price === undefined)) {
          throw new UserInputError('Price id does not exist');
        }

        const packageIds = prices.map((price) => price.package_id);
        const subscriptionPackages =
          (await loaders.subscriptionPackages.loadMany(
            packageIds,
          )) as SubscriptionPackageModel[];

        let promo;
        if (promoCode && promoCode.length > 0) {
          promo = await StripeService.getPromoCode(promoCode);
          if (!promo) {
            throw new UserInputError('That is not a valid promo code');
          }
        }
        //move this function to service level
        const pricesWithQuantity = prices.map((price) => ({
          ...price,
          quantity: createSubscriptionInput.find(
            (cs: any) => cs.package_price_id === price.id_text,
          )['quantity'],
        }));

        const res = (await SubscriptionService.createOmniSubscription({
          user,
          company,
          pricesWithQuantity,
          subscriptionPackages,
          promo,
        })) as CompanySubscriptionModel[];

        return res;
      },
    ),
    requestTrialOmniSubscription: withUserAuth(
      async (
        root,
        { companyId, createSubscriptionInput, trialDays },
        { loaders, auth: { user } },
      ) => {
        const packagePriceIds = createSubscriptionInput.map(
          (cs: any) => cs.package_price_id,
        );

        if (!user) {
          throw new AuthenticationError('No user');
        }

        const company = await getCompany(companyId);

        const prices = (await loaders.subscriptionPackagePrices.loadMany(
          packagePriceIds,
        )) as SubscriptionPackagePriceModel[];

        if (prices.some((price) => price === undefined)) {
          throw new UserInputError('Price id does not exist');
        }

        const packageIds = prices.map((price) => price.package_id);
        const subscriptionPackages =
          (await loaders.subscriptionPackages.loadMany(
            packageIds,
          )) as SubscriptionPackageModel[];

        const pricesWithQuantity = prices.map((price) => ({
          ...price,
          quantity: createSubscriptionInput.find(
            (cs: any) => cs.package_price_id === price.id_text,
          )['quantity'],
        }));

        const res = (await SubscriptionService.createTrialOmniSubscription({
          user,
          company,
          pricesWithQuantity,
          subscriptionPackages,
          trialDays,
        })) as CompanySubscriptionModel[];

        return res;
      },
    ),
    requestDedocoSubscription: withUserAuth(
      async (
        root,
        { companyId, packagePriceId },
        { loaders, auth: { user } },
      ) => {
        try {
          if (!user) {
            throw new AuthenticationError('No user');
          }

          const company = await getCompany(companyId);
          const price = await getSubscriptionPackagePrice(packagePriceId);

          const packageId = price?.package_id;
          const subscriptionPackage = (await loaders.subscriptionPackages.load(
            packageId,
          )) as SubscriptionPackageModel;

          const priceWithQuantity = { ...price, quantity: 1 };

          const res = (await SubscriptionService.createDedocoSubscription({
            user,
            company,
            priceWithQuantity,
            subscriptionPackage,
          })) as CompanySubscriptionModel;

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    addPackageToSubscription: withUserAuth(
      async (
        root,
        { companyId, addPackageInput },
        { loaders, auth: { user } },
      ) => {
        try {
          if (!user) {
            throw new AuthenticationError('No user');
          }

          const company = await getCompany(companyId);

          const packagePriceIds = addPackageInput.map(
            (cs: any) => cs.package_price_id,
          );

          const prices = await getSubscriptionPackagePrices(packagePriceIds);

          //deprecated
          const packageIds = prices.map((price) => price.package_id);

          //const packageIds = prices.map((price) => price.packageId);

          const subscriptionPackages =
            (await loaders.subscriptionPackages.loadMany(
              packageIds,
            )) as SubscriptionPackageModel[];

          if (!subscriptionPackages) {
            throw new Error(
              'No corresponding subscription package found for the price id',
            );
          }

          const res = await SubscriptionService.addPackageToSubscription({
            user,
            company,
            prices,
            subscriptionPackages,
            addPackageInput,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    switchSubscriptionPackage: withUserAuth(
      async (
        root,
        { companyId, switchSubscriptionPackageInput, companySubscriptionId },
        { loaders, auth: { user } },
      ) => {
        try {
          //deprecated
          const { package_price_id, quantity } = switchSubscriptionPackageInput;
          //const { packagePriceId, quantity } = switchSubscriptionPackageInput;

          const company = await getCompany(companyId);

          //deprecated
          const price = await getSubscriptionPackagePrice(package_price_id);
          // const price = await getSubscriptionPackagePrice(package_price_id);

          const subscriptionPackage = (await loaders.subscriptionPackages.load(
            price.package_id,
          )) as SubscriptionPackageModel;
          if (!subscriptionPackage) {
            throw new UserInputError(
              'That subscription package does not exist',
            );
          }

          const companySubscription = await getCompanySubscription(
            companySubscriptionId,
          );

          if (!companySubscription.active) {
            throw new Error('That company subscription is inactive');
          }

          const res = await SubscriptionService.switchSubscriptionPackage({
            company,
            price,
            quantity,
            subscriptionPackage,
            companySubscription,
            user,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    removePackagesFromSubscription: withUserAuth(
      async (
        root,
        { companyId, companySubscriptionIds },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const subscriptions = await getCompanySubscriptions(
            companySubscriptionIds,
          );

          const res = await SubscriptionService.removePackagesFromSubscription({
            company,
            user,
            companySubscriptions: subscriptions,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    cancelOmniTrialSubscription: withUserAuth(
      async (
        root,
        { companyId, companySubscriptionId },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const companySubscription = await getCompanySubscription(
            companySubscriptionId,
          );

          const res = await SubscriptionService.cancelOmniTrialSubscription({
            companyId: company.id,
            companySubscription,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    cancelSubscription: withUserAuth(
      async (
        root,
        { companyId, companySubscriptionId },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const companySubscription = await getCompanySubscription(
            companySubscriptionId,
          );

          const stripeSubscriptionId = companySubscription.subscription_id;

          const res = await SubscriptionService.cancelOmniSubscription({
            companyId: company.id,
            companySubscription,
            stripeSubscriptionId,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    //rename mutation
    cancelAllSubscriptions: withUserAuth(
      async (root, { companyId }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const subscriptions =
            (await SubscriptionService.getActiveCompanySubscriptions(
              company.id,
            )) as CompanySubscriptionModel[];

          if (
            subscriptions.some((subscription) => subscription === undefined) ||
            subscriptions.length === 0
          ) {
            throw new UserInputError(
              'No active subscription exist for this company',
            );
          }

          const res = await SubscriptionService.cancelAllSubscriptions({
            companyId: company.id,
            subscriptions,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    editPackageQuantity: withUserAuth(
      async (
        root,
        { companyId, companySubscriptionId, quantity },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const companySubscription = await getCompanySubscription(
            companySubscriptionId,
          );
          const res = await SubscriptionService.editPackageQuantity({
            company,
            companySubscription,
            quantity,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    assignSubscriptionQuantityToMember: withUserAuth(
      async (
        root,
        { companyMemberId, stripeProductId },
        { loaders, auth: { user } },
      ) => {
        try {
          if (!user) {
            throw new AuthenticationError('No user found');
          }

          const member = await getCompanyMember(companyMemberId);
          const company = (await loaders.companies.load(
            member.company_id,
          )) as CompanyModel;

          if (!company) {
            throw new UserInputError('That company does not exist');
          }

          const res =
            (await SubscriptionService.assignSubscriptionQuantityToMember({
              companyMemberId: member.id,
              companyId: company.id,
              stripeProductId,
            })) as CompanyMemberModel[];

          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
    removeSubscriptionQuantityFromMember: withUserAuth(
      async (
        root,
        { companyMemberId, stripeProductId },
        { loaders, auth: { user } },
      ) => {
        try {
          if (!user) {
            throw new AuthenticationError('No user found');
          }

          const member = await getCompanyMember(companyMemberId);

          const company = (await loaders.companies.load(
            member.company_id,
          )) as CompanyModel;

          if (!company) {
            throw new UserInputError('That company does not exist');
          }

          const res = (await SubscriptionService.removeSubscriptionQuantity({
            companyMemberId: member.id,
            companyId: company.id,
            stripeProductId,
          })) as CompanyMemberModel[];

          return res;
        } catch (error) {
          handleResolverError(error);
          return [];
        }
      },
    ),
  },
};
