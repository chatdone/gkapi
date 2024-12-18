import knex from '@db/knex';
import _ from 'lodash';
import {
  UserModel,
  UserId,
  CreateUserPayload,
  UserSettingsModel,
  UserViewOptionsModel,
  UserOnboardingModel,
  UserSignUpDataPayload,
  UserSignUpDataModel,
} from '@models/user.model';
import { ToolTipsStatus, UpdateProfileInput } from '@generated/graphql-types';
import { CompanyId } from '@models/company.model';
import { camelize } from '@data-access/utils';
import { TableNames } from '@db-tables';
import { redis } from '@data-access';

type UserStoreCreateUserForPicInput = {
  created_by: UserId;
  email: string;
  name: string;
  contact_no?: string;
  signupData?: string;
  customerId?: string;
};

const invalidateCachedUser = (userId: UserId) => {
  /* NOTE: We need to get the user from the cache to invalidate
	by email as well, because user data is cached both by ID and email */
  redis
    .get(`user:${userId}`)
    .then((user) => {
      if (user?.email) {
        redis.deleteKeysByPattern(`*user:*${user?.email}*`);
      }
      redis.deleteKeysByPattern(`*user:*${userId}*`);
    })
    .catch((err) => {
      console.error(err);
    });
};

const setUserCache = async (user: UserModel) => {
  if (user?.id) {
    await redis.set(`user:${user?.id}`, user);
    if (user?.email) {
      await redis.set(`user:${user?.email}`, user);
    }
  }
};

const getUserWithCompaniesByEmail = async (
  email: string,
): Promise<UserModel | Error | undefined> => {
  try {
    if (!email) {
      throw new Error('No email specified');
    }

    const cacheKey = `user:${email}`;
    const cacheResult = await redis.get(cacheKey);

    if (cacheResult) {
      return cacheResult;
    } else {
      const rawResult = await knex.raw(`
          SELECT
            u.*,
            JSON_ARRAYAGG(c.id_text) AS company_uuids,
            JSON_ARRAYAGG(c.id) AS company_ids
          FROM
            users u
          LEFT JOIN company_members cm ON
            u.id = cm.user_id
					LEFT JOIN companies c ON
						cm.company_id = c.id
          WHERE
            u.email = '${email}'
          GROUP BY
            u.id
        `);
      const res = _.head(rawResult) as UserModel[];

      const data = camelize(_.head(res));

      if (data) {
        await setUserCache(data);
      }

      return data;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

// NOTE: Legacy login had separate users for different login methods for same email
// so need to return all users with that email
const getUsersByEmail = async (email: string): Promise<UserModel[] | Error> => {
  try {
    const res = await knex
      .from(TableNames.USERS)
      .where('email', email)
      .orderBy('last_active_at')
      .select();

    return camelize(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const getUserById = async (id: UserId) => {
  try {
    const cacheResult = await redis.get(`user:${id}`);
    if (cacheResult) {
      return cacheResult;
    } else {
      const res = await knex.from(TableNames.USERS).where('id', id).select();

      return camelize(_.head(res));
    }
  } catch (error) {}
};

const getUsersById = async ({ ids }: { ids: UserId[] }) => {
  try {
    const res = await knex.from(TableNames.USERS).whereIn('id', ids).select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getByAuth0Id = async (auth0Id: string): Promise<UserModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.USERS)
      .where('auth0_id', auth0Id)
      .select();

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const createUser = async ({
  payload,
}: {
  payload: CreateUserPayload;
}): Promise<UserModel | Error> => {
  const payloadWithActivity = payload.active
    ? {
        ...payload,
        last_login: knex.fn.now(),
        last_active_at: knex.fn.now(),
      }
    : payload;
  try {
    const insert = await knex(TableNames.USERS).insert({
      ...payloadWithActivity,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    const res = await knex
      .from(TableNames.USERS)
      .where('id', _.head(insert))
      .select();
    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const linkAuth0Id = async ({
  userId,
  auth0Id,
}: {
  userId: UserId;
  auth0Id: string;
}): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS)
      .update({
        auth0_id: auth0Id,
        updated_at: knex.fn.now(),
        last_active_at: knex.fn.now(),
        last_login: knex.fn.now(),
        active: 1,
      })
      .where('id', userId);

    const res = await knex.from(TableNames.USERS).where('id', userId).select();

    invalidateCachedUser(userId);

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateLastLoginTimestamp = async (
  userId: UserId,
): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS)
      .update({
        last_active_at: knex.fn.now(),
        last_login: knex.fn.now(),
        active: 1,
      })
      .where('id', userId);

    const res = await knex.from(TableNames.USERS).where('id', userId).select();

    invalidateCachedUser(userId);

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateCustomerId = async ({
  userId,
  customerId,
}: {
  userId: UserId;
  customerId: string;
}): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS)
      .update({
        customer_id: customerId,
        updated_at: knex.fn.now(),
      })
      .where('id', userId);

    const res = await knex.from(TableNames.USERS).where('id', userId).select();

    invalidateCachedUser(userId);

    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const updatePaymentMethod = async ({
  userId,
  paymentMethodId,
}: {
  userId: UserId;
  paymentMethodId: string;
}): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS)
      .update({
        payment_method_id: paymentMethodId,
        updated_at: knex.fn.now(),
      })
      .where('id', userId);

    const res = await knex.from(TableNames.USERS).where('id', userId).select();

    invalidateCachedUser(userId);
    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const removePaymentMethodId = async (
  userId: UserId,
): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS)
      .where('id', userId)
      .update({ payment_method_id: null });

    const res = await knex(TableNames.USERS).where('id', userId).select();
    invalidateCachedUser(userId);
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

// const getUsers = async ({ limit }) => {
//   let query = knex.from(TableNames.USERS);
//   if (limit) {
//     query.limit(limit);
//   }
//   try {
//     const res = await query.select();
//     return res;
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

// const updateUser = async (userId, payload) => {
//   if (!userId) {
//     return Promise.reject('No user id specified');
//   }
//   try {
//     await knex(TableNames.USERS)
//       .where('id', userId)
//       .update({
//         ...payload,
//       });

//     return getById(userId);
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

const createUserForPic = async ({
  payload,
}: {
  payload: UserStoreCreateUserForPicInput;
}): Promise<UserModel | Error> => {
  try {
    const check = await knex
      .from(TableNames.USERS)
      .where({ email: payload.email })
      .select();

    if (check.length > 0) {
      return camelize(_.head(check));
    }

    const insert = await knex(TableNames.USERS).insert({
      email: payload.email,
      created_by: payload.created_by,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      signup_data: payload?.signupData,
    });

    const res = await knex
      .from(TableNames.USERS)
      .where('id', _.head(insert))
      .select();
    return camelize(_.head(res));
  } catch (err) {
    return Promise.reject(err);
  }
};

const getUser = async (id: UserId): Promise<UserModel | Error> => {
  try {
    const res = await knex.from(TableNames.USERS).where({ id }).select();

    const user = camelize(_.head(res));
    setUserCache(user);
    return user;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProfile = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: UpdateProfileInput;
}): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS)
      .update({
        name: payload.name,
        contact_no: payload.contact_no,
        profile_image: payload.profile_image,
        updated_at: knex.fn.now(),
        updated_by: userId,
      })
      .where('id', userId);
    invalidateCachedUser(userId);

    const res = await knex.from(TableNames.USERS).where('id', userId).select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getDuplicateUsersByEmail = async (
  email: string,
): Promise<(UserModel | Error)[]> => {
  try {
    const res = await knex
      .from(TableNames.USERS)
      .where('email', email)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateProfileImage = async ({
  payload,
  userId,
}: {
  payload: {
    profile_image: string;
    updated_by: UserId;
    profile_image_size: number;
  };
  userId: UserId;
}): Promise<UserModel | Error> => {
  try {
    await knex
      .from(TableNames.USERS)
      .where({
        id: userId,
      })
      .update({ ...payload, updated_at: knex.fn.now() });

    invalidateCachedUser(userId);
    const res = await knex
      .from(TableNames.USERS)
      .where({ id: userId })
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeUserCustomerId = async (userId: UserId): Promise<number> => {
  if (process.env.NODE_ENV !== 'development') {
    return Promise.reject('Not authorized in this environment');
  }

  try {
    const updateRes = await knex(TableNames.USERS)
      .update({ customer_id: null, payment_method_id: null })
      .where('id', userId);

    invalidateCachedUser(userId);
    return updateRes;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateToolTipsStatus = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: ToolTipsStatus;
}): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS)
      .where('id', userId)
      .update({
        tooltips_status: JSON.stringify(payload),
        updated_at: knex.fn.now(),
      });

    invalidateCachedUser(userId);
    const res = await knex(TableNames.USERS).where('id', userId).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateUserActiveStatus = async ({
  userId,
  active,
}: {
  userId: UserId;
  active: number;
}): Promise<UserModel | Error> => {
  try {
    await knex(TableNames.USERS).where('id', userId).update({
      active,
      updated_at: knex.fn.now(),
    });

    invalidateCachedUser(userId);
    const res = await knex(TableNames.USERS).where('id', userId).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getUserSettings = async (
  userId: UserId,
): Promise<UserSettingsModel | Error> => {
  try {
    const res = await knex
      .from(TableNames.USER_SETTINGS)
      .where('user_id', userId)
      .select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const setDefaultCompany = async ({
  userId,
  companyId,
}: {
  userId: UserId;
  companyId: CompanyId | null;
}): Promise<UserSettingsModel | Error> => {
  try {
    await knex(TableNames.USER_SETTINGS)
      .insert({
        user_id: userId,
        default_company_id: companyId,
      })
      .onConflict('user_id')
      .merge();
    invalidateCachedUser(userId);

    const res = await knex
      .from(TableNames.USER_SETTINGS)
      .where('user_id', userId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const setDefaultUserTimezone = async ({
  userId,
  timezone,
}: {
  userId: UserId;
  timezone: string;
}): Promise<UserSettingsModel | Error> => {
  try {
    await knex(TableNames.USER_SETTINGS)
      .insert({
        user_id: userId,
        default_timezone: timezone,
      })
      .onConflict('user_id')
      .merge();

    const res = await knex
      .from(TableNames.USER_SETTINGS)
      .where('user_id', userId)
      .select();

    invalidateCachedUser(userId);

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const upsertExpoPushTokens = async ({
  userId,
  tokens,
}: {
  userId: UserId;
  tokens: string[];
}): Promise<UserSettingsModel | Error> => {
  try {
    await knex(TableNames.USER_SETTINGS)
      .insert({
        user_id: userId,
        expo_push_tokens: JSON.stringify(tokens),
      })
      .onConflict('user_id')
      .merge();

    invalidateCachedUser(userId);

    const res = await knex
      .from(TableNames.USER_SETTINGS)
      .where('user_id', userId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getUserViewOptions = async ({
  userId,
}: {
  userId: UserId;
}): Promise<UserViewOptionsModel> => {
  try {
    const res = await knex
      .from(TableNames.USER_SETTINGS)
      .where('user_id', userId)
      .select();

    const userSettings = _.head(res);
    if (!userSettings) {
      await knex(TableNames.USER_SETTINGS).insert({
        user_id: userId,
        view_options: {},
      });

      return {};
    }
    const { view_options } = userSettings;
    return view_options || {};
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateUserViewOptions = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: UserViewOptionsModel;
}): Promise<UserViewOptionsModel> => {
  try {
    await knex(TableNames.USER_SETTINGS)
      .insert({
        user_id: userId,
        view_options: JSON.stringify(payload),
      })
      .onConflict('user_id')
      .merge();

    invalidateCachedUser(userId);

    const res = await knex.from(TableNames.USERS).where('id', userId).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getUserOnboarding = async ({
  userId,
}: {
  userId: UserId;
}): Promise<UserOnboardingModel> => {
  try {
    const res = await knex
      .from(TableNames.USER_SETTINGS)
      .where('user_id', userId)
      .select();

    const userSettings = _.head(res);
    if (!userSettings) {
      await knex(TableNames.USER_SETTINGS).insert({
        user_id: userId,
        onboarding: {},
      });

      return {};
    }
    const { onboarding } = userSettings;
    return onboarding || {};
  } catch (error) {
    return Promise.reject(error);
  }
};

const getUserSignUpData = async (
  userId: UserId,
): Promise<UserSignUpDataModel | Error> => {
  try {
    const res = await knex.from(TableNames.USERS).where('id', userId).select();

    return _.head(res)?.signup_data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateUserOnboarding = async ({
  userId,
  payload,
}: {
  userId: UserId;
  payload: UserOnboardingModel;
}): Promise<UserOnboardingModel> => {
  try {
    await knex(TableNames.USER_SETTINGS)
      .insert({
        user_id: userId,
        onboarding: JSON.stringify(payload),
      })
      .onConflict('user_id')
      .merge();

    const res = await knex.from(TableNames.USERS).where('id', userId).select();
    invalidateCachedUser(userId);

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateUserSignUpData = async ({
  payload,
  userId,
}: {
  payload: UserSignUpDataPayload;
  userId: UserId;
}): Promise<UserModel | Error> => {
  try {
    const updatedRow = await knex(TableNames.USERS)
      .where('id', userId)
      .update({ signup_data: JSON.stringify(payload) });

    const res = (await knex(TableNames.USERS)
      .where('id', userId)
      .select()) as UserModel[];
    invalidateCachedUser(userId);

    return camelize(_.head(res) as UserModel);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getUserByCustomerId = async (customerId: string) => {
  try {
    const res = await knex
      .from(TableNames.USERS)
      .where('customer_id', customerId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  // getUsers,
  createUser,
  createUserForPic,
  getUsersByEmail,
  getUserById,
  getByAuth0Id,
  linkAuth0Id,
  updateLastLoginTimestamp,
  updatePaymentMethod,
  removePaymentMethodId,
  updateCustomerId,
  getUser,
  updateProfile,
  getDuplicateUsersByEmail,
  updateProfileImage,
  removeUserCustomerId,
  updateToolTipsStatus,
  // updateUser,
  updateUserActiveStatus,
  getUserSettings,
  setDefaultCompany,
  setDefaultUserTimezone,
  upsertExpoPushTokens,
  getUserViewOptions,
  updateUserViewOptions,
  getUserOnboarding,
  updateUserOnboarding,
  updateUserSignUpData,
  getUserSignUpData,
  getUserWithCompaniesByEmail,
  getUserByCustomerId,
  getUsersById,
  invalidateCachedUser,
};
