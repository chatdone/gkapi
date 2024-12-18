import { UserInputError, AuthenticationError } from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { UserService, StripeService, CompanyService } from '@services';
import { GraphQLUpload } from 'graphql-upload';
import { withAuth, withUserAuth } from '@graphql/wrappers';
import { CompanyModel } from '@models/company.model';
import { subject } from '@casl/ability';
import { defineAbilityFor } from '@permissions/abilities';
import { handleResolverError } from '@graphql/errors';
import Joi from 'joi';
import _ from 'lodash';

import { UserStore } from '@data-access';
import Stripe from 'stripe';
import { UserModel } from '@models/user.model';

export const resolvers: Resolvers = {
  Query: {
    currentUser: withAuth(async (root, args, { auth: { user } }) => {
      return user;
    }),
    redisTest: async () => {
      // const result = (await redis.getKeysByPattern('*')) as string[];
      // console.log('results', result);
      UserStore.invalidateCachedUser(1);
      return [];
    },

    me: async (root, args, { auth: { user } }) => {
      // console.log('current user', user);

      const ability = await defineAbilityFor(user);

      console.log(
        'possible',
        ability.can('update', subject('Company', { name: 'Mechacorp' })),
      );
      return user;
    },
    //     users: async (root, options, { isAuth }) => {
    //       // if (!isAuth) {
    //       //   throw new AuthenticationError('Not logged in');
    //       // }
    //       return await UserService.getUsers(options);
    //     },
  },
  User: {
    id: ({ id_text }) => id_text,
    profileImages: async ({ profileImage }, args, { isAuth }) => {
      const res = await UserService.getUserProfileImages(profileImage);

      return res;
    },
    //deprecated
    // @ts-ignore
    payment_methods: async ({ customer_id, email, id, name }) => {
      try {
        const data = await UserService.getPaymentMethods({
          customerId: customer_id,
          email,
          name,
          userId: id,
        });

        return data;
      } catch (error) {
        handleResolverError(error);
      }
    },
    // @ts-ignore
    paymentMethods: async ({ customer_id, email, name, id }) => {
      try {
        const data = await UserService.getPaymentMethods({
          customerId: customer_id,
          email,
          name,
          userId: id,
        });

        return data;
      } catch (error) {
        handleResolverError(error);
      }
    },
    // @ts-ignore
    stripeCustomerDetails: async ({ customer_id }: { customer_id: string }) => {
      try {
        if (customer_id) {
          const customer = await StripeService.getCustomer(customer_id);
          return customer;
        }
        return null;
      } catch (error) {
        handleResolverError(error);
      }
    },

    //deprecated
    tooltips_status: ({ tooltips_status }) => {
      return typeof tooltips_status === 'string'
        ? JSON.parse(tooltips_status)
        : tooltips_status;
    },
    tooltipsStatus: ({ tooltips_status }) => {
      return typeof tooltips_status === 'string'
        ? JSON.parse(tooltips_status)
        : tooltips_status;
    },
    //     id: async (user, args, context) => {
    //       return user.id_text;
    //     },
    //     email: async (user, args, context) => {
    //       return user.email;
    //     },
    //     created_by: async ({ created_by }, args, context) => {
    //       if (created_by) {
    //         const user = await UserService.getById(created_by);
    //         return user;
    //       }
    //     },
    //     updated_by: async ({ updated_by }, args, context) => {
    //       if (updated_by) {
    //         const user = await UserService.getById(updated_by);
    //         return user;
    //       }
    //     },
    //     deleted_by: async ({ deleted_by }, args, context) => {
    //       if (deleted_by) {
    //         const user = await UserService.getById(deleted_by);
    //         return user;
    //       }
    //     },
    companies: async ({ id }) => {
      const res = (await CompanyService.getCompanies(id)) as CompanyModel[];

      return res;
    },
    //deprecated
    default_company: async ({ id }) => {
      const res = (await UserService.getDefaultCompany(id)) as CompanyModel;

      return res;
    },
    defaultCompany: async ({ id }) => {
      const res = (await UserService.getDefaultCompany(id)) as CompanyModel;

      return res;
    },
    //deprecated
    default_timezone: async ({ id }) => {
      const res = await UserService.getUserDefaultTimezone(id);

      return res;
    },
    defaultTimezone: async ({ id }) => {
      const res = await UserService.getUserDefaultTimezone(id);

      return res;
    },

    viewOptions: async ({ id }, {}, { auth: { user } }) => {
      const res = await UserService.getUserViewOptions({
        userId: id,
        currentUser: user,
      });

      return res;
    },
    onboarding: async ({ id }, {}, { auth: { user } }) => {
      const res = await UserService.getUserOnboarding({
        userId: id,
        currentUser: user,
      });

      return res;
    },
    signUpData: async ({ id }, {}, { auth: { user } }) => {
      const res = await UserService.getUserSignUpData({
        userId: id,
        currentUser: user,
      });

      return res;
    },
  },
  Upload: GraphQLUpload,
  Mutation: {
    loginUser: withAuth(async (root, args, { auth: { authPayload } }) => {
      try {
        const res = await UserService.loginUser({ authPayload });
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    }),
    updateProfile: withUserAuth(async (root, { input }, { auth: { user } }) => {
      try {
        if (!user) {
          throw new UserInputError('No user');
        }

        const res = await UserService.updateProfile({
          userId: user.id,
          payload: input,
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    }),
    uploadProfileImage: withAuth(
      async (_, { attachment }, { auth: { user } }) => {
        const res = await UserService.uploadProfileImage({ attachment, user });
        return res;
      },
    ),
    updateToolTipsStatus: withUserAuth(
      async (root, { input }, { auth: { user } }) => {
        if (!user) {
          throw new AuthenticationError('Missing user');
        }
        try {
          const res = await UserService.updateToolTipsStatus({
            userId: user.id,
            payload: input,
            currentToolTipsStatus: user.tooltips_status,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updatePaymentMethodId: withAuth(
      async (root, { paymentMethodId }, { auth: { authPayload, user } }) => {
        try {
          const res = await UserService.updatePaymentMethod({
            authPayload,
            user,
            paymentMethodId,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    attachPaymentMethod: withAuth(
      async (root, { paymentMethodId }, { auth: { user } }) => {
        try {
          await StripeService.attachPaymentMethodToCustomer({
            paymentMethodId,
            customerId: user.customer_id,
          });

          const userResult = await UserStore.getUser(user.id);
          return userResult;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    detachPaymentMethod: withAuth(
      async (
        root,
        { paymentMethodId, companyId },
        { loaders, auth: { user } },
      ) => {
        try {
          if (!user.payment_method_id || !paymentMethodId) {
            throw new UserInputError('No payment method attached to this user');
          }

          const company = await loaders.companies.load(companyId);
          if (!company) {
            throw new UserInputError('That company does not exist');
          }
          const res = await UserService.detachPaymentMethodFromCustomer({
            user,
            paymentMethodId,
            companyId: company.id,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    setDefaultCompany: withAuth(
      async (root, { companyId }, { loaders, auth: { user } }) => {
        try {
          let company;
          if (companyId) {
            company = await loaders.companies.load(companyId);
            if (!company) {
              throw new UserInputError('That company does not exist');
            }
          }
          const res = await UserService.setDefaultCompany({
            userId: user.id,
            companyId: company?.id,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    setDefaultUserTimezone: withAuth(
      async (root, { timezone }, { auth: { user } }) => {
        try {
          const res = await UserService.setDefaultUserTimezone({
            userId: user.id,
            timezone,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    addExpoPushToken: withAuth(async (root, { token }, { auth: { user } }) => {
      try {
        const res = await UserService.addExpoPushToken({
          userId: user.id,
          token,
        });

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    }),
    removeExpoPushToken: withAuth(
      async (root, { token }, { auth: { user } }) => {
        try {
          const res = await UserService.removeExpoPushTokens({
            userId: user.id,
            tokens: [token],
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateUserViewOptions: async (root, { payload }, { auth: { user } }) => {
      try {
        // NOTE: We need to use Joi and the TS model to validate the JSON because we're using
        // graphql-scalars to have a JSON type
        // Technically untyped JSON response is an anti-pattern for GraphQL but this lets us
        // have the flexibility with some level of type safety.
        const schema = Joi.object({
          homePageMode: Joi.string(),
        });

        const { error, value } = schema.validate(payload);
        if (error) {
          throw new UserInputError(
            `Invalid view options payload: ${_.head(error.details)?.message}`,
          );
        }

        const res = await UserService.updateUserViewOptions({
          userId: user.id,
          currentUser: user,
          payload: value,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    updateUserOnboarding: async (root, { payload }, { auth: { user } }) => {
      try {
        const schema = Joi.object({
          hasCompletedOnboarding: Joi.boolean().optional(),
          hasCompletedTutorial: Joi.boolean().optional(),
        });

        const { error, value } = schema.validate(payload);
        if (error) {
          throw new UserInputError(
            `Invalid view options payload: ${_.head(error.details)?.message}`,
          );
        }

        const res = await UserService.updateUserOnboarding({
          userId: user.id,
          currentUser: user,
          payload: value,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    requestAccountDeletion: async (root, { input }, { auth: { user } }) => {
      try {
        const { reason, alternateEmail } = input;
        const res = await UserService.requestAccountDeletion({
          user,
          reason,
          ...(alternateEmail && { alternateEmail }),
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
  },
};
