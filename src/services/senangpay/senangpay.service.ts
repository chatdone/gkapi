import _ from 'lodash';
import crypto from 'crypto';
import axios from 'axios';
import dayjs from 'dayjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import {
  CollectionService,
  CollectorService,
  EventManagerService,
  // CompanyService,
  // EventManagerService,
} from '@services';
import { CollectionStore, CompanyStore, createLoaders } from '@data-access';
import { customAlphabet } from 'nanoid';
// import { createProduct } from '@workers/puppeteer/create-product';
// import { setupDashboard } from '@workers/puppeteer/setup-dashboard';
import logger from '@tools/logger';
// import { formatResponse } from '@utils/response.util';
// import { CollectionStore, CompanyStore } from '@data-access';
import { SHA256 } from '@tools/sha256';
import CryptoUtils from '@utils/crypto.util';
import { getSecretValue } from '@utils/secret.util';
const nanoid = customAlphabet('1234567890abcdef', 10);
import {
  CollectionId,
  CollectionModel,
  CollectionPaymentModel,
  CollectionPaymentSummaryModel,
  CollectionPeriodModel,
  CompletePaymentTransactionResult,
  CreateCollectionPaymentPayload,
} from '@models/collection.model';
import { formatResponse } from '@utils/response.util';
import {
  CompanyId,
  CompanyMemberModel,
  CompanyModel,
} from '@models/company.model';
import {
  CompanySenangPayCredentialsDataModel,
  CompanySenangPayCredentialsModel,
  CompleteSenangPayTransactionPayload,
  CreateRecurringProductPayload,
  CreateSenangPayDashboardProductPayload,
  RecurringWebhookPaymentDetailsItem,
} from '@models/senangpay.model';
import { UserId } from '@models/user.model';
import { ContactId } from '@models/contact.model';
import { CollectorMemberModel } from '@models/collector.model';

const spWorker = axios.create({
  baseURL: process.env.SENANGPAY_WORKER_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type TransactionStringSequenceInput = {
  secretKey: string;
  detail: string;
  amount: number;
  orderId: string;
};

export type TransactionListSequenceInput = {
  merchantId: string;
  secretKey: string;
  timestampStart: number;
  timestampEnd: number;
};

const generateToken = (payload: Record<string, unknown>) => {
  return jwt.sign(payload, process.env.JWT_SECRET || '', {
    // expiresIn: '15m'
  });
};

const login = async (
  ip: string,
  input: { token: string },
): Promise<Record<string, unknown>> => {
  const loaders = createLoaders();
  const { token } = input;
  try {
    const verifyResult = jwt.verify(token, process.env.JWT_SECRET || '');

    const schema = Joi.object({
      sub: Joi.string(),
      name: Joi.string(),
      iat: Joi.number().required(),
      ref_no: Joi.string().required(),
      rr_id: Joi.string().required(),
      contact_id: Joi.string().required(),
      company_id: Joi.string().required(),
    });

    const payload = await schema.validateAsync(verifyResult);

    const transactionToken = generateToken({ origin: ip });

    const collectionData = (await loaders.collections.load(
      payload.rr_id,
    )) as CollectionModel;

    const collection = await CollectionService.getCollectionForPayment(
      collectionData.id,
    );

    if (!collection) {
      return Promise.reject(
        'There appears to be incorrect payment information. Please contact support.',
      );
    }

    const periods = await CollectionService.getCollectionPeriods({
      collectionId: collectionData.id,
    });

    const formattedPeriods = periods.map((e) => {
      return formatResponse(e as { [key: string]: unknown }, ['receivable_id']);
    });
    return {
      data: collection,
      periods: formattedPeriods,
      token: transactionToken,
    };
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const initiatePayment = async ({
  token,
}: {
  token: string;
}): Promise<unknown> => {
  const loaders = createLoaders();

  try {
    // logger.common.log('info', 'initiatePayment', {
    //   message: 'payment initated',
    //   token,
    // });
    const verifyResult = jwt.verify(token, process.env.JWT_SECRET || '');

    const schema = Joi.object({
      sub: Joi.string(),
      name: Joi.string(),
      iat: Joi.number().required(),
      ref_no: Joi.string().required(),
      rr_id: Joi.string().required(),
      contact_id: Joi.string().required(),
      company_id: Joi.string().required(),
    });

    const payload = await schema.validateAsync(verifyResult);
    const collectionData = (await loaders.collections.load(
      payload.rr_id,
    )) as CollectionModel;

    const collection = (await CollectionService.getCollectionForPayment(
      collectionData.id,
    )) as CollectionPaymentSummaryModel;

    if (!collection) {
      logger.common.log('error', 'initiatePayment', {
        error: 'collection returned null',
        token,
      });
      return Promise.reject(
        'There appears to be incorrect payment information. Please contact support.',
      );
    }

    const company = (await loaders.companies.load(
      payload.company_id,
    )) as CompanyModel;
    if (!company) {
      logger.common.log('error', 'initiatePayment', {
        error: 'company returned null',
        token,
      });
      return Promise.reject(
        'There appears to be incorrect payment information. Please contact support.',
      );
    }

    const credentials = (await getCompanySenangPayCredentials(
      company.id,
    )) as CompanySenangPayCredentialsDataModel;
    const merchantId = credentials.merchant_id;
    const secretKey = credentials.secret_key;
    // logger.common.log('info', 'initiatePayment', { credentials });

    const orderId = nanoid();

    let paymentUrl;
    let jsonData;

    if (collection.periods > 1) {
      if (!collection.sp_recurring_id) {
        logger.common.log('error', 'initiatePayment', {
          error: 'no sp_recurring_id',
          token,
        });
        throw new Error(
          'There appears to be incorrect payment information. Please contact support.',
        );
      }
      paymentUrl = `${process.env.SENANGPAY_API_URL}/recurring/payment/${merchantId}`;
      const hashedSequence = await createRecurringTransactionHash({
        secretKey,
        orderId,
        recurringId: collection.sp_recurring_id,
      });
      const transactionPayload = {
        order_id: orderId,
        recurring_id: collection.sp_recurring_id,
        hash: hashedSequence,
      };
      jsonData = {
        payload: transactionPayload,
        merchant_id: merchantId,
        PAYMENT_PATH: paymentUrl,
        order_id: orderId,
      };
    } else {
      const sequence = await createTransactionStringSequence({
        // TODO: Replace with customer-specific credentials
        secretKey,
        detail: collection.title || 'Payment for transaction',
        amount: collection.payable_amount,
        orderId: orderId,
      });
      // console.log('sequence', sequence);
      const hashedSequence = await generateSHA256Hash(sequence, secretKey);
      // console.log('old hash', hashedSequence);

      const transactionPayload = {
        detail: collection.title || 'Payment for transaction',
        amount: collection.payable_amount,
        order_id: orderId,
        name: collection.contact_name,
        hash: hashedSequence,
      };
      paymentUrl = `${process.env.SENANGPAY_DASHBOARD_URL}/payment/${merchantId}`;
      jsonData = {
        payload: transactionPayload,
        merchant_id: merchantId,
        PAYMENT_PATH: paymentUrl,
        order_id: orderId,
      };
    }

    console.log('jsonData', jsonData);

    // logger.common.log('info', 'initiatePayment', {
    //   message: 'payment order data',
    //   jsonData,
    // });

    await CollectionService.createPaymentOrder({
      collectionId: collection.id,
      orderId: orderId,
      jsonDataString: JSON.stringify(jsonData),
    });

    return jsonData;
  } catch (error) {
    console.log(error);
    logger.common.log('error', 'initiatePayment', {
      error,
      token,
    });
    return Promise.reject(error);
  }
};

const createTransactionStringSequence = async (
  input: TransactionStringSequenceInput,
): Promise<string> => {
  try {
    const schema = Joi.object({
      secretKey: Joi.string().required(),
      detail: Joi.string().allow('').required(),
      amount: Joi.number().required(),
      orderId: Joi.string().required(),
    });
    const payload = await schema.validateAsync(input);
    const { secretKey, detail, amount, orderId } = payload;
    const sequence = `${secretKey}${detail}${amount.toFixed(2)}${orderId}`;
    return sequence;
  } catch (err) {
    return Promise.reject(err);
  }
};

const createTransactionListSequence = async (
  input: TransactionListSequenceInput,
): Promise<string> => {
  try {
    const schema = Joi.object({
      merchantId: Joi.string().required(),
      secretKey: Joi.string().required(),
      timestampStart: Joi.date().timestamp('unix').required(),
      timestampEnd: Joi.date().timestamp('unix').required(),
    });
    await schema.validateAsync(input);
    const { merchantId, secretKey, timestampStart, timestampEnd } = input;
    const sequence = `${merchantId}${secretKey}${timestampStart}${timestampEnd}`;
    return sequence;
  } catch (err) {
    return Promise.reject(err);
  }
};

// const getTransactionList = async (params) => {
//   try {
//     // TODO: Replace with customer-specific credentials
//     const merchantId = process.env.SENANGPAY_MERCHANT_ID;
//     const secretKey = process.env.SENANGPAY_SECRET_KEY;

//     const sequence = await createTransactionListSequence({
//       merchantId,
//       secretKey,
//       timestampStart: params.timestamp_start,
//       timestampEnd: params.timestamp_end,
//     });

//     const hash = await generateSHA256Hash(sequence, secretKey);
//     const requestParams = {
//       merchant_id: parseInt(merchantId, 10),
//       timestamp_start: parseInt(params.timestamp_start, 10),
//       timestamp_end: parseInt(params.timestamp_end, 10),
//       hash,
//     };
//     const response = await api.get(
//       `/apiv1/get_transaction_list`,
//       requestParams,
//     );

//     return response;
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

const generateSHA256Hash = (str: string, secret: string): string => {
  const hash = crypto.createHmac('sha256', secret).update(str).digest('hex');
  return hash;
};

const isHashValid = (reference: string, target: string): boolean => {
  return crypto.timingSafeEqual(Buffer.from(reference), Buffer.from(target));
};

const getSenangPayUsers = async (
  companyId: CompanyId,
): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const users = await CompanyStore.getSenangPayUsers(companyId);
    return users;
  } catch (error) {
    console.log('Error in service', error);
    return Promise.reject(error);
  }
};

const addSenangPayUsers = async ({
  companyId,
  userIds,
}: {
  companyId: CompanyId;
  userIds: UserId[];
}): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const users = await CompanyStore.addSenangPayUsers({ companyId, userIds });

    return users;
  } catch (error) {
    console.log('Error in service', error);
    return Promise.reject(error);
  }
};

const removeSenangPayUsers = async ({
  companyId,
  userIds,
}: {
  companyId: CompanyId;
  userIds: UserId[];
}): Promise<(CompanyMemberModel | Error)[]> => {
  try {
    const result = await CompanyStore.removeSenangPayUsers({
      companyId,
      userIds,
    });
    return result;
  } catch (error) {
    console.log('Error in service', error);
    return Promise.reject(error);
  }
};

// const getSenangPayStatus = async (id) => {
//   try {
//     const res = await CompanyService.getCompanySettingsByPublicId(id);
//     let settings;

//     if (!res.settings) {
//       settings = null;
//     } else {
//       settings = JSON.parse(res.settings);
//     }

//     return settings;
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };

// const updateSenangPayStatus = async (id, payload) => {
//   try {
//     const res = await CompanyService.updateCompanySettingsByPublicId(
//       id,
//       payload,
//     );

//     return JSON.parse(res.settings);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };

// const updateSenangPayAsDefaultStatus = async (id, payload) => {
//   try {
//     const res = await CompanyService.updateCompanyDefaultPaymentStatus(
//       id,
//       payload,
//     );

//     return JSON.parse(res.settings);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };
const generateGenericSHA256Hash = async (input: string): Promise<string> => {
  const hash = await SHA256(input);
  return hash;
};

const verifyRecurringTransaction = async (
  {
    secretKey,
    statusId,
    orderId,
    transactionId,
    message,
  }: {
    secretKey: string;
    statusId: string;
    orderId: string;
    transactionId: string;
    message: string;
  },
  targetHash: string,
): Promise<boolean> => {
  const inputString = `${secretKey}${statusId}${orderId}${transactionId}${message}`;
  const generatedHash = await SHA256(inputString);
  const compareResult = await isHashValid(generatedHash, targetHash);
  return compareResult;
};

const createRecurringTransactionHash = async ({
  secretKey,
  recurringId,
  orderId,
}: {
  secretKey: string;
  recurringId: string;
  orderId: string;
}): Promise<string> => {
  const inputString = `${secretKey}${recurringId}${orderId}`;

  const hash = await generateGenericSHA256Hash(inputString);
  return hash;
};

const completeRecurringTransaction = async ({
  orderId,
  statusId,
  recurringId,
  nextPaymentDate,
  paymentDetails,
  message,
  hash,
  collectionId,
  contactId,
}: {
  orderId: string;
  statusId: number;
  recurringId: number;
  nextPaymentDate: string;
  paymentDetails: RecurringWebhookPaymentDetailsItem[];
  message: string;
  hash: string;
  collectionId: CollectionId;
  contactId: ContactId;
}): Promise<boolean | Error> => {
  try {
    const collectionPeriods = (await CollectionStore.getCollectionPeriods(
      collectionId,
    )) as CollectionPeriodModel[];

    if (collectionPeriods.length != paymentDetails.length) {
      return Promise.reject('Instalment periods do not match');
    }

    await Promise.all(
      paymentDetails.map((detail, index) => {
        let status = 3;
        if (detail.payment_status === 'pending payment') {
          status = 1;
        } else if (detail.payment_status === 'paid') {
          status = 2;
        }

        const paymentDate = dayjs.unix(
          parseInt(detail.payment_date_timestamp, 10),
        );
        const periodId = collectionPeriods[index].id;
        console.log(periodId, detail.payment_status);

        return CollectionStore.updateCollectionPeriod({
          periodId,
          dueDate: paymentDate.utc().format(),
          status,
          webhookData: detail,
        });
      }),
    );

    // TODO: @gerard
    // EventManagerService.completeRecurringTransaction({
    //   orderId,
    //   statusId,
    //   recurringId,
    //   nextPaymentDate,
    //   paymentDetails,
    //   message,
    //   hash,
    //   collectionId,
    //   contactId,
    // });
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateCompanySenangPayCredentials = async ({
  companyId,
  credentialData,
}: {
  companyId: CompanyId;
  credentialData: Buffer;
}): Promise<void | Error> => {
  try {
    const jsonStringData = await getSecretValue(
      process.env.SENANGPAY_CREDENTIALS_KEY || '',
    );
    const parsedData = JSON.parse(jsonStringData);
    if (!parsedData) {
      return Promise.reject('No valid JSON data');
    }

    const cipherKeyString = _.get(parsedData, 'SENANGPAY_CIPHER_KEY');
    if (!cipherKeyString) {
      return Promise.reject('No valid key');
    }

    const cipherKey = Buffer.from(cipherKeyString, 'base64');

    const encodedData = CryptoUtils.encrypt(
      JSON.stringify(credentialData),
      cipherKey,
    );

    const insert = await CompanyStore.updateCompanySenangPayCredentials({
      companyId,
      binaryCredentialData: encodedData,
    });

    return insert;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCompanySenangPayCredentials = async (
  companyId: number,
): Promise<CompanySenangPayCredentialsDataModel> => {
  // logger.common.log('info', 'getCompanySenangPayCredentials', { companyId });
  try {
    const cipherKey = await getSenangPayCipherKey();
    // logger.common.log('info', 'getCompanySenangPayCredentials', { cipherKey });

    const credentialsResult =
      (await CompanyStore.getCompanySenangPayCredentials(
        companyId,
      )) as CompanySenangPayCredentialsModel;
    // logger.common.log('info', 'getCompanySenangPayCredentials', {
    //   credentialsResult,
    // });

    const decodedData = CryptoUtils.decrypt(
      credentialsResult.credentials,
      cipherKey,
    );

    // logger.common.log('info', 'getCompanySenangPayCredentials', {
    //   decodedData,
    // });
    const parsedResult = JSON.parse(decodedData);
    // logger.common.log('info', 'getCompanySenangPayCredentials', {
    //   parsedResult,
    // });
    return parsedResult;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const getSenangPayCipherKey = async (): Promise<Buffer> => {
  // logger.common.info('getSenangPayCipherKey', {
  //   key: process.env.SENANGPAY_CREDENTIALS_KEY,
  // });
  // console.log('key', process.env.SENANGPAY_CREDENTIALS_KEY);
  const jsonStringData = await getSecretValue(
    process.env.SENANGPAY_CREDENTIALS_KEY as string,
  );
  const parsedData = JSON.parse(jsonStringData);
  if (!parsedData) {
    return Promise.reject('No valid JSON data');
  }
  const cipherKeyString = _.get(parsedData, 'SENANGPAY_CIPHER_KEY');
  const cipherKey = Buffer.from(cipherKeyString, 'base64');
  return cipherKey;
};

const completePaymentTransaction = async ({
  statusId,
  orderId,
  transactionId,
  message,
  hash,
  data,
}: CompleteSenangPayTransactionPayload): Promise<
  CompletePaymentTransactionResult | Error
> => {
  try {
    logger.common.log('info', 'completePaymentTransaction', {
      statusId,
      orderId,
      transactionId,
      message,
      hash,
      data,
    });
    // TODO: move hash check here instead of in controller

    const res = (await CollectionStore.completePaymentTransaction({
      statusId,
      orderId,
      transactionId,
      data,
    })) as CompletePaymentTransactionResult;

    const collection = (await CollectionStore.getCollectionByTransactionId(
      transactionId,
    )) as CollectionModel;

    const collectionId = collection.id;
    const periods = (await CollectionStore.getCollectionPeriods(
      collectionId,
    )) as CollectionPeriodModel[];
    let collectionPayment;

    if (periods.length > 1) {
      // recurring

      const payment = await CollectionStore.getCollectionPaymentByTransactionId(
        { transactionId },
      );
      if (!payment) {
        const sortedPeriods = _.sortBy(periods, (e) => e.period);
        const filteredPeriods = sortedPeriods.filter((e) => e.status === 1);

        if (filteredPeriods.length === 0) {
          throw new Error('All periods already paid for');
        }

        const periodToPay = _.head(filteredPeriods);
        if (!periodToPay) {
          throw new Error('Error getting correct period');
        }

        const periodId = periodToPay.id;
        if (statusId !== 1) {
          logger.common.log('info', 'completePaymentTransaction', {
            message: 'status is not complete',
            statusId,
          });
          return res;
        }

        if (filteredPeriods.length === 1) {
          await CollectionStore.setCollectionStatus({
            collectionId: collection.id,
            status: 2,
          });
        }

        await CollectionStore.setCollectionPeriodStatus({
          collectionId: periodToPay.receivable_id,
          period: periodToPay.period,
          status: 2,
        });

        collectionPayment = (await CollectionStore.createCollectionPayment({
          collectionId,
          periodId,
          contactId: collection.contact_id,
          status: 2,
          transactionId,
        })) as CollectionPaymentModel;
      }
    } else {
      // TODO: Handle other failure status
      const periodId = _.get(periods, '[0].id') as number;
      if (statusId !== 1) {
        logger.common.log('info', 'completePaymentTransaction', {
          message: 'status is not complete',
          statusId,
        });
        return res;
      }

      await CollectionStore.setCollectionStatus({
        collectionId,
        status: 2,
      });
      // single
      await CollectionStore.setCollectionPeriodStatus({
        collectionId,
        period: 1,
        status: 2,
      });

      collectionPayment = (await CollectionStore.createCollectionPayment({
        collectionId,
        periodId,
        contactId: collection.contact_id,
        status: 2,
        transactionId,
      })) as CollectionPaymentModel;
    }

    if (collectionPayment) {
      const collectorMembers =
        (await CollectorService.getCollectorMembersByCollectorId({
          collectorId: collectionPayment?.contact_id,
        })) as CollectorMemberModel[];

      await EventManagerService.handleCollectionPaymentComplete({
        event: {
          statusId,
          orderId,
          transactionId,
          message,
          hash,
          data,
        },
        collection,
        periods,
        collectorMembers,
        collectionPayment,
      });
    }

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createRecurringProduct = async (
  payload: CreateRecurringProductPayload,
): Promise<boolean | void> => {
  const { companyId, collectionId } = payload;
  logger.common.log('info', 'createRecurringProduct', {
    payload,
  });

  try {
    const jsonStringData = await getSecretValue(
      process.env.SENANGPAY_CREDENTIALS_KEY || '',
    );
    const parsedData = JSON.parse(jsonStringData);
    if (!parsedData) {
      console.error('No valid JSON data for SP credentials');
      return;
    }

    const credentials = await getCompanySenangPayCredentials(companyId);
    logger.common.log('info', 'createRecurringProduct', {
      credentials,
    });

    const updatedParams = {
      ...payload,
      email: credentials.email,
      password: credentials.password,
    };
    logger.common.log('info', 'createRecurringProduct', {
      updatedParams,
    });

    createSenangPayDashboardProduct(updatedParams);
  } catch (error) {
    console.log(error);
    logger.common.log('error', 'createRecurringProduct', {
      companyId,
      collectionId,
    });
  }

  return true;
};

const createSenangPayDashboardProduct = async (
  params: CreateSenangPayDashboardProductPayload,
) => {
  try {
    const res = await spWorker.post(
      `/collection/${params.collectionId}/recurring`,
      params,
    );
    console.log(res);
  } catch (error) {
    console.log('error', error);
  }
};

// const setupSenangPayDashboard = async ({ companyId }) => {
//   try {
//     let jsonStringData;
//     if (process.env.USE_PRODUCTION_SECRETS) {
//       jsonStringData = await getSecretValue('prod/senangpay/credentials');
//     } else {
//       jsonStringData = await getSecretValue('dev/senangpay/credentials');
//     }
//     const parsedData = JSON.parse(jsonStringData);
//     if (!parsedData) {
//       return Promise.reject('No valid JSON data');
//     }

//     const credentials = await getCompanySenangPayCredentials(companyId);

//     const updatedParams = {
//       email: credentials.email,
//       password: credentials.password,
//       companyId,
//       return_url: 'https://dashboard.staging.gokudos.io/payment/complete',
//       recurring_return_url:
//         'https://dashboard.staging.gokudos.io/payment/complete',
//       callback_url: 'https://api.gokudos.io/api/integrations/senangpay/webhook',
//       recurring_callback_url:
//         'https://api.gokudos.io/api/integrations/senangpay/webhook-recurring',
//     };

//     setupDashboard(updatedParams);
//   } catch (error) {
//     console.log(error);
//     logger.common.log('error', 'setupSenangPayDashboard', { companyId });
//   }

//   return true;
// };

const exportFunctions = {
  login,
  initiatePayment,
  generateSHA256Hash,
  generateGenericSHA256Hash,
  isHashValid,
  createTransactionStringSequence,
  createTransactionListSequence,
  // getTransactionList,
  getSenangPayUsers,
  addSenangPayUsers,
  removeSenangPayUsers,
  // getSenangPayStatus,
  // updateSenangPayStatus,
  // updateSenangPayAsDefaultStatus,
  verifyRecurringTransaction,
  updateCompanySenangPayCredentials,
  getCompanySenangPayCredentials,
  getSenangPayCipherKey,
  completePaymentTransaction,
  // createRecurringProduct,
  // createRecurringTransactionHash,
  // setupSenangPayDashboard,
  completeRecurringTransaction,
  createRecurringProduct,
};

export default exportFunctions;
