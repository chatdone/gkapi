import { createLoaders, UserStore } from '@data-access';
import { ToolTipsStatus, UpdateProfileInput } from '@generated/graphql-types';

import {
  Auth0TokenPayload,
  RequestAccountDeletionResponse,
  UserId,
  UserModel,
  UserOnboardingModel,
  UserSettingsModel,
  UserSignUpDataModel,
  UserViewOptionsModel,
} from '@models/user.model';
import {
  EmailService,
  StorageService,
  StripeService,
  SubscriptionService,
} from '@services';
import _ from 'lodash';
import Stripe from 'stripe';
import s3, { AfterUpload, S3OjectResponse } from '@tools/s3';
import { ImageGroupModel, UploadImagePayload } from '@models/common.model';
import { CompanyId, CompanyModel } from '@models/company.model';
import logger from '@tools/logger';
import path from 'path';

import { getImageSizes } from '@utils/image.util';

const dir = __dirname;
const service = dir.split('/')[dir.split('/').length - 1];

type UserServiceCreateUserForPicInput = {
  created_by: UserId;
  email: string;
  name: string;
  contact_no?: string;
  signupData?: string;
  customerId?: string;
};

type UserServiceCreateImageResizerBodyInput = {
  bucket: string | undefined;
  fileName: string;
  env: string;
  userId: string;
  image: string;
};

type UserServicePaymentMethodsInput = {
  customerId?: string | null;
  email: string;
  userId: UserId;
  name: string;
};

const createUserFromAuth0Payload = async ({
  authPayload,
}: {
  authPayload: Auth0TokenPayload;
}) => {
  try {
    const { name, email, picture, sub, email_verified } = authPayload;
    const user = (await UserStore.createUser({
      payload: {
        name,
        email,
        profile_image: picture,
        auth0_id: sub,
        email_verified,
        active: 1,
      },
    })) as UserModel;

    const stripeCustomer = (await StripeService.createCustomer({
      email,
      name,
    })) as Stripe.Customer;

    const updatedUser = await UserStore.updateCustomerId({
      userId: user.id,
      customerId: stripeCustomer.id,
    });

    return updatedUser;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createUserFromAuth0Payload',
        authPayload,
      },
    });

    return Promise.reject(error);
  }
};

const createUserByEmail = async ({
  email,
  currentUserId,
  signUpData,
}: {
  email: string;
  currentUserId: UserId;
  signUpData?: string;
}): Promise<UserModel | Error> => {
  try {
    const res = (await UserStore.createUser({
      payload: {
        email,
        active: 0,
        created_by: currentUserId,
        signup_data: signUpData,
      },
    })) as UserModel;
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createUserByEmail',
        email,
        currentUserId,
        signUpData,
      },
    });
    return Promise.reject(error);
  }
};

const linkAuth0User = async ({
  authPayload,
  user,
}: {
  authPayload: Auth0TokenPayload;
  user: UserModel;
}) => {
  let currentUser = null;
  if (user.auth0_id) {
    const updatedUser = (await UserStore.updateLastLoginTimestamp(
      user.id,
    )) as UserModel;
    currentUser = updatedUser;
  } else {
    const linkedUser = (await UserStore.linkAuth0Id({
      userId: user.id,
      auth0Id: authPayload.sub,
    })) as UserModel;

    currentUser = linkedUser;
  }
  return currentUser;
};

const loginUser = async ({
  authPayload,
}: {
  authPayload: Auth0TokenPayload;
}): Promise<UserModel | null> => {
  try {
    if (!authPayload || !authPayload.sub) {
      return Promise.reject('Invalid auth token');
    }

    if (!authPayload.email_verified) {
      return Promise.reject('Email not verified');
    }

    const userAccounts = (await UserStore.getUsersByEmail(
      authPayload.email,
    )) as UserModel[];
    if (userAccounts.length === 0) {
      // TODO: create stripe customer id
      return (await createUserFromAuth0Payload({
        authPayload,
      })) as UserModel;
    } else {
      const userAccount = _.head(userAccounts) as UserModel;
      if (!userAccount.auth0_id) {
        return (await linkAuth0User({
          authPayload,
          user: userAccount,
        })) as UserModel;
      } else {
        if (userAccount.active !== 1) {
          await UserStore.updateUserActiveStatus({
            userId: userAccount.id,
            active: 1,
          });
        }

        return userAccount;
      }
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'loginUser',
        authPayload,
      },
    });
    return Promise.reject(error);
  }
};

const getUserByEmail = async (
  email: string,
): Promise<UserModel | Error | undefined> => {
  try {
    // NOTE: Intentionally returns the first if there are dupes because
    // of legacy system that had different user accounts for separate
    // login methods (email/pass, social, etc)
    const res = (await UserStore.getUsersByEmail(email)) as UserModel[];
    return _.head(res);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserByEmail',
        email,
      },
    });
    return Promise.reject(error);
  }
};

const updatePaymentMethod = async ({
  authPayload,
  user,
  paymentMethodId,
}: {
  authPayload: Auth0TokenPayload;
  user: UserModel;
  paymentMethodId: string;
}): Promise<UserModel | Error> => {
  try {
    if (authPayload.email !== user.email) {
      return Promise.reject(
        'Trying to update user that is not authorized by this token',
      );
    }

    let customerId = user.customer_id;

    if (!customerId) {
      const stripeCustomer = (await StripeService.createCustomer({
        email: user.email,
        name: user.name || user.email,
      })) as Stripe.Customer;

      await UserStore.updateCustomerId({
        userId: user.id,
        customerId: stripeCustomer.id,
      });

      customerId = stripeCustomer.id;
    }

    const res = (await UserStore.updatePaymentMethod({
      userId: user.id,
      paymentMethodId,
    })) as UserModel;

    await StripeService.attachPaymentMethodToCustomer({
      customerId: res.customer_id,
      paymentMethodId: res.payment_method_id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updatePaymentMethod',
        authPayload,
        userId: user?.id,
        paymentMethodId,
      },
    });
    return Promise.reject(error);
  }
};

const detachPaymentMethodFromCustomer = async ({
  user,
  paymentMethodId,
  companyId,
}: {
  user: UserModel;
  paymentMethodId: string;
  companyId: CompanyId;
}): Promise<UserModel | Error> => {
  try {
    const activeSubscriptions =
      await SubscriptionService.getActiveCompanySubscriptions(companyId);
    if (activeSubscriptions.length > 0) {
      throw new Error(
        'Cannot remove payment method while having active subscription',
      );
    }
    const stripeRes = await StripeService.detachPaymentMethodFromCustomer({
      paymentMethodId,
    });
    const res = await UserStore.removePaymentMethodId(user.id);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'detachPaymentMethodFromCustomer',
        userId: user?.id,
        paymentMethodId,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const createUserForPic = async ({
  payload,
}: {
  payload: UserServiceCreateUserForPicInput;
}): Promise<UserModel | Error> => {
  try {
    const res = await UserStore.createUserForPic({ payload });

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getUser = async (id: UserId): Promise<Error | UserModel> => {
  try {
    const res = UserStore.getUser(id);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUser',
        userId: id,
      },
    });
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
    const res = await UserStore.updateProfile({
      userId,
      payload,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateProfile',
        userId,
      },
    });
    return Promise.reject(error);
  }
};

const getDuplicateUsersByEmail = async (
  email: string,
): Promise<(UserModel | Error)[]> => {
  try {
    const res = await UserStore.getDuplicateUsersByEmail(email);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getDuplicateUsersByEmail',
        email,
      },
    });
    return Promise.reject(error);
  }
};

const uploadProfileImage = async ({
  attachment,
  user,
}: {
  attachment: UploadImagePayload;
  user: UserModel;
}): Promise<UserModel | Error> => {
  try {
    const s3Directory = `images/${process.env.GK_ENVIRONMENT}/${user?.id_text}/`;
    const uploaded = (await s3.processUploadToS3({
      attachment,
      s3Directory,
      isPublicAccess: true,
    })) as AfterUpload;

    if (!uploaded.success) {
      throw new Error('Upload failed');
    }

    const payload = {
      profile_image_size: uploaded.file_size,
      profile_image: uploaded.url,
      updated_by: user.id,
    };

    const bucketName = process.env.AWS_S3_BUCKET_PUBLIC || 'gokudos-dev-public';

    if (uploaded?.bufferFile && process.env.IMAGE_RESIZER_FEATURE) {
      const generateResizeBody = createImageResizerBody({
        destinationPath: uploaded?.path,
        bucketName,
        fileBuffer: uploaded?.bufferFile,
      });

      if (generateResizeBody) {
        StorageService.generateResizedImages({
          body: generateResizeBody,
        });
      }
    }

    const res = await UserStore.updateProfileImage({
      payload,
      userId: user.id,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'uploadProfileImage',
        userId: user?.id,
        attachment,
      },
    });
    return Promise.reject(error);
  }
};

const updateToolTipsStatus = async ({
  userId,
  payload,
  currentToolTipsStatus,
}: {
  userId: UserId;
  payload: ToolTipsStatus;
  currentToolTipsStatus: string;
}): Promise<UserModel | Error> => {
  try {
    const currentStatus =
      typeof currentToolTipsStatus === 'string'
        ? JSON.parse(currentToolTipsStatus)
        : {};

    const updatedStatus = Object.assign(currentStatus, payload);

    const res = await UserStore.updateToolTipsStatus({
      userId,
      payload: updatedStatus,
    });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateToolTipsStatus',
        userId,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const getDefaultCompany = async (
  userId: UserId,
): Promise<CompanyModel | null | Error> => {
  try {
    const loaders = createLoaders();

    const res = (await UserStore.getUserSettings(userId)) as UserSettingsModel;
    if (!res || !res.default_company_id) {
      return null;
    }
    const company = (await loaders.companies.load(
      res.default_company_id,
    )) as CompanyModel;
    return company;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getDefaultCompany',
        userId,
      },
    });
    return Promise.reject(error);
  }
};

const setDefaultCompany = async ({
  userId,
  companyId,
}: {
  userId: UserId;
  companyId: CompanyId | null;
}): Promise<UserModel | Error> => {
  try {
    const loaders = createLoaders();

    await UserStore.setDefaultCompany({ userId, companyId });

    const user = (await loaders.users.load(userId)) as UserModel;
    return user;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'setDefaultCompany',
        userId,
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const setDefaultUserTimezone = async ({
  userId,
  timezone,
}: {
  userId: UserId;
  timezone: string;
}): Promise<UserModel | Error> => {
  try {
    const loaders = createLoaders();
    await UserStore.setDefaultUserTimezone({ userId, timezone });
    const user = (await loaders.users.load(userId)) as UserModel;
    return user;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'setDefaultUserTimezone',
        userId,
        timezone,
      },
    });
    return Promise.reject(error);
  }
};

const getUserDefaultTimezone = async (userId: UserId): Promise<string> => {
  try {
    const res = (await UserStore.getUserSettings(userId)) as UserSettingsModel;
    if (!res || !res.default_timezone) {
      return (process.env.LOCAL_TIMEZONE as string) || 'Asia/Kuala_Lumpur';
    } else {
      return res?.default_timezone;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserDefaultTimezone',
        userId,
      },
    });
    return (process.env.LOCAL_TIMEZONE as string) || 'Asia/Kuala_Lumpur';
  }
};

const getUserExpoPushTokens = async (userId: UserId): Promise<string[]> => {
  try {
    const res = await UserStore.getUserSettings(userId);

    const jsonTokens = _.get(res, 'expo_push_tokens');

    let tokens: string[] = [];

    if (typeof jsonTokens === 'string') {
      tokens = JSON.parse(jsonTokens || '[]');
    } else {
      tokens = jsonTokens || [];
    }

    return tokens;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserExpoPushTokens',
        userId,
      },
    });
    return [];
  }
};

const addExpoPushToken = async ({
  userId,
  token,
}: {
  userId: UserId;
  token: string;
}): Promise<UserModel | Error> => {
  try {
    const userSettingsRes = await UserStore.getUserSettings(userId);
    const jsonTokens = _.get(userSettingsRes, 'expo_push_tokens');

    let parsedData: string[] = [];

    if (typeof jsonTokens === 'string') {
      parsedData = JSON.parse(jsonTokens || '[]');
    } else {
      parsedData = jsonTokens || [];
    }

    if (!parsedData.includes(token)) {
      parsedData.push(token);

      await UserStore.upsertExpoPushTokens({ userId, tokens: parsedData });
    }

    const loaders = createLoaders();
    const user = (await loaders.users.load(userId)) as UserModel;

    return user;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'addExpoPushToken',
        userId,
        token,
      },
    });
    return Promise.reject(error);
  }
};

const removeExpoPushTokens = async ({
  userId,
  tokens,
}: {
  userId: UserId;
  tokens: string[];
}): Promise<UserModel | Error> => {
  try {
    const userSettingsRes = await UserStore.getUserSettings(userId);
    const jsonTokens = _.get(userSettingsRes, 'expo_push_tokens');

    let parsedData: string[] = [];

    if (typeof jsonTokens === 'string') {
      parsedData = JSON.parse(jsonTokens || '[]');
    } else {
      parsedData = jsonTokens || [];
    }

    parsedData = parsedData.filter((token) => !tokens.includes(token));

    await UserStore.upsertExpoPushTokens({ userId, tokens: parsedData });

    const loaders = createLoaders();
    const user = (await loaders.users.load(userId)) as UserModel;

    return user;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'removeExpoPushTokens',
        userId,
        tokens,
      },
    });
    return Promise.reject(error);
  }
};

const getUserViewOptions = async ({
  userId,
  currentUser,
}: {
  userId: UserId;
  currentUser: UserModel;
}) => {
  try {
    if (userId !== currentUser.id) {
      return {};
    }
    const res = await UserStore.getUserViewOptions({ userId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserViewOptions',
        userId,
        currentUserId: currentUser?.id,
      },
    });
    return Promise.reject(error);
  }
};

const updateUserViewOptions = async ({
  userId,
  currentUser,
  payload,
}: {
  userId: UserId;
  currentUser: UserModel;
  payload: UserViewOptionsModel;
}) => {
  try {
    if (userId !== currentUser.id) {
      throw new Error('Unauthorized');
    }

    const options = await UserStore.getUserViewOptions({ userId });

    const updatedOptions = _.merge(options, payload);

    const res = await UserStore.updateUserViewOptions({
      userId,
      payload: updatedOptions,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateUserViewOptions',
        userId,
        currentUserId: currentUser?.id,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const getUserOnboarding = async ({
  userId,
  currentUser,
}: {
  userId: UserId;
  currentUser: UserModel;
}) => {
  try {
    if (userId !== currentUser?.id) {
      return {};
    }
    const res = await UserStore.getUserOnboarding({ userId });
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserOnboarding',
        userId,
        currentUserId: currentUser?.id,
      },
    });
    return Promise.reject(error);
  }
};

const getUserSignUpData = async ({
  userId,
  currentUser,
}: {
  userId: UserId;
  currentUser: UserModel;
}): Promise<UserSignUpDataModel | Error | {}> => {
  try {
    if (userId !== currentUser?.id) {
      return {};
    }

    const res = await UserStore.getUserSignUpData(userId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserSignUpData',
        userId,
        currentUserId: currentUser?.id,
      },
    });
    return Promise.reject(error);
  }
};

const updateUserOnboarding = async ({
  userId,
  currentUser,
  payload,
}: {
  userId: UserId;
  currentUser: UserModel;
  payload: UserOnboardingModel;
}) => {
  try {
    if (userId !== currentUser.id) {
      throw new Error('Unauthorized');
    }

    const options = await UserStore.getUserOnboarding({ userId });

    const updatedOptions = _.merge(options, payload);

    const res = await UserStore.updateUserOnboarding({
      userId,
      payload: updatedOptions,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'updateUserOnboarding',
        userId,
        currentUserId: currentUser?.id,
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const requestAccountDeletion = async ({
  user,
  reason,
  alternateEmail,
}: {
  user: UserModel;
  reason: string;
  alternateEmail?: string;
}): Promise<RequestAccountDeletionResponse> => {
  try {
    if (!user.email) {
      throw new Error('User does not have a primary email address');
    }

    const payload = {
      to: 'ray@6biz.ai',
      from: 'no-reply@gokudos.io',
      subject: `[System] Account Deletion Request <${user.email}>`,
      text: `User ${
        user.email
      } has requested their account be deleted. \n\nTheir reason for deletion is: ${reason}. \n\nTheir alternate email is ${
        alternateEmail ? alternateEmail : '-not given-'
      }\n\nUser Id: ${user.id}`,
    };

    const res = await EmailService.sendBasicEmail(payload);

    if (res) {
      return {
        success: true,
        message: `Account deletion requested. We will contact you at <${user.email}> shortly. If you have any questions, please contact us at <support@gokudos.io>.`,
      };
    }
    return {
      success: false,
      message: `Account deletion request failed. Please try again. If you have any questions, please contact us at <support@gokudos.io>`,
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

const getUserProfileImages = async (
  profileImage: string,
): Promise<ImageGroupModel> => {
  try {
    if (!process.env.IMAGE_RESIZER_FEATURE) {
      return {
        small: '',
        medium: '',
        large: '',
        original: profileImage,
      };
    }

    const S3_LINK =
      'https://gokudos-dev-public.s3.ap-southeast-1.amazonaws.com/';

    const isFromGkDevPublic = profileImage?.includes(S3_LINK);

    const ext =
      path.extname(profileImage) === '.jpg'
        ? '.jpeg'
        : path.extname(profileImage);

    if (isFromGkDevPublic) {
      const key = profileImage.split(S3_LINK);
      const destinationPath = key[1];

      const destinationPaths = getImageSizes({
        originalPath: destinationPath,
        ext,
      });

      const bucketName =
        (isFromGkDevPublic
          ? process.env.AWS_S3_BUCKET_PUBLIC
          : process.env.AWS_S3_BUCKET) || 'gokudos-dev-public';

      const isObjectsExist = await StorageService.isS3ObjectsExist({
        bucketName,
        destinationPaths,
      });

      if (isObjectsExist) {
        return {
          small: destinationPaths[0],
          medium: destinationPaths[1],
          large: destinationPaths[2],
          original: profileImage,
        };
      } else {
        const file = (await s3.getObjectFromS3({
          isPublicAccess: isFromGkDevPublic,
          filePath: destinationPath,
        })) as S3OjectResponse;

        if (file) {
          const body = createImageResizerBody({
            destinationPath,
            bucketName,
            fileBuffer: file?.Body,
          });

          if (body) {
            StorageService.generateResizedImages({
              body,
            });
          }
        }

        return { small: '', medium: '', large: '', original: profileImage };
      }
    } else {
      return { small: '', medium: '', large: '', original: profileImage };
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'getUserProfileImages',
        profileImage,
      },
    });
    return { small: '', medium: '', large: '', original: profileImage };
  }
};

//This fn assumes destinationPath: 'images/sandbox/your-user-id/file-uuid.jpeg';
const createImageResizerBody = (input: {
  destinationPath: string;
  bucketName: string;
  fileBuffer: Buffer;
}): UserServiceCreateImageResizerBodyInput | undefined => {
  try {
    const { destinationPath, bucketName, fileBuffer } = input;
    const ALL_ENVS = ['sandbox', 'staging', 'production'];
    const arrayDest = destinationPath.split('/');
    const fileNameArray = (_.last(arrayDest) || '').split('.');
    const env = arrayDest.find((item) => ALL_ENVS.includes(item)) || 'sandbox';
    const userId = arrayDest.reverse()[1]; // get the second last item, which is usually the user id
    const fileName = fileNameArray[0];
    const extension = fileNameArray[1] === 'jpg' ? 'jpeg' : fileNameArray[1];

    const base64File = Buffer.from(fileBuffer).toString('base64');

    const body = {
      bucket: bucketName,
      fileName,
      env,
      userId,
      image: `data:image/${extension};base64,${base64File}`,
    };

    return body;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: 'createImageResizerBody',
        input,
      },
    });
  }
};

const getPaymentMethods = async (
  input: UserServicePaymentMethodsInput,
): Promise<Stripe.PaymentMethod[] | void> => {
  try {
    const { customerId, email, userId, name } = input;

    if (!customerId) {
      const stripeId = await StripeService.getStripeId({ email });

      if (stripeId) {
        const updatedUser = (await UserStore.updateCustomerId({
          userId,
          customerId: stripeId,
        })) as UserModel;

        const { data } = await StripeService.getPaymentMethods(
          updatedUser?.customer_id,
        );

        return data;
      } else {
        const customer = (await StripeService.createCustomer({
          email,
          name,
        })) as Stripe.Response<Stripe.Customer>;

        if (customer) {
          const updatedUser = (await UserStore.updateCustomerId({
            userId,
            customerId: customer.id,
          })) as UserModel;

          const { data } = await StripeService.getPaymentMethods(
            updatedUser?.customer_id,
          );

          return data;
        }
      }
    } else {
      const res = await StripeService.getPaymentMethods(customerId);

      return res.data;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service,
        fnName: getPaymentMethods.name,
        input,
      },
    });
  }
};

export default {
  loginUser,
  updatePaymentMethod,
  detachPaymentMethodFromCustomer,
  createUserForPic,
  getUserByEmail,
  createUserByEmail,
  getUser,
  updateProfile,
  getDuplicateUsersByEmail,
  uploadProfileImage,
  updateToolTipsStatus,
  getDefaultCompany,
  setDefaultCompany,
  setDefaultUserTimezone,
  getUserDefaultTimezone,
  addExpoPushToken,
  removeExpoPushTokens,
  getUserExpoPushTokens,
  getUserViewOptions,
  updateUserViewOptions,
  getUserOnboarding,
  updateUserOnboarding,
  getUserSignUpData,
  requestAccountDeletion,
  getUserProfileImages,
  createImageResizerBody,
  getPaymentMethods,
};
