import Joi from 'joi';
import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import _ from 'lodash';
// import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import {
  CollectionService,
  //   // CompanyService,
  SenangPayService,
  //   // UserService,
} from '@services';
import {
  //   CollectionModel,
  PaymentOrderDetailModel,
} from '@models/collection.model';

// import { formatResponse } from '@utils/response.util';
import logger from '@tools/logger';

// dotenv.config();

const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
    });

    const payload = await schema.validateAsync(req.body);
    const loginResult = await SenangPayService.login(req.ip ?? '', payload);

    return res.status(200).json(loginResult);
  } catch (err) {
    console.log(err);
    if (err instanceof Error && err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    return res.status(500).json({ error: err });
  }
};

const initiatePayment = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const authHeader = _.get(req, 'headers.authorization');
  if (!authHeader) {
    return Promise.reject('Invalid token');
  }

  const bearerToken = authHeader.split(' ')[1];

  try {
    jwt.verify(bearerToken, process.env.JWT_SECRET || '');

    const schema = Joi.object({
      token: Joi.string().required(),
      period_id: Joi.string(), // FIXME: To be removed after frontend stops sending
    });
    const payload = await schema.validateAsync(req.body);
    const initPaymentResult = await SenangPayService.initiatePayment({
      token: payload.token,
    });

    return res.status(200).json(initPaymentResult);
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error });
  }
};

// const getTransactionList = async (req, res, next) => {
//   // const authHeader = _.get(req, 'headers.authorization');
//   // if (!authHeader) {
//   //   return Promise.reject('Invalid token');
//   // }

//   // const bearerToken = authHeader.split(' ')[1];

//   try {
//     // jwt.verify(bearerToken, process.env.JWT_SECRET);

//     const schema = Joi.object({
//       timestamp_start: Joi.date().timestamp('unix').required(),
//       timestamp_end: Joi.date().timestamp('unix').required(),
//     });
//     await schema.validateAsync(req.query);
//     const result = await SenangPayService.getTransactionList(req.query);

//     return res.status(200).json(result);
//   } catch (err) {
//     console.log(err);
//     if (err.name === 'JsonWebTokenError') {
//       return res.status(401).json({ error: 'Invalid token' });
//     }
//     return res.status(500).json({ error: err });
//   }
// };

// const paymentComplete = async (req, res, next) => {
//   try {
//     // TODO: implement payload validation
//     // jwt.verify(bearerToken, process.env.JWT_SECRET);

//     // TODO: check if the transaction exists
//     // const result = await SenangPayService.getTransactionList(req.query);
//     const { status_id, order_id, transaction_id, msg, hash } = req.body;
//     const result = await SenangPayService.completePaymentTransaction({
//       statusId: parseInt(status_id, 10),
//       orderId: order_id,
//       transactionId: transaction_id,
//       message: msg,
//       hash,
//       data: req.body,
//     });

//     return res.status(200).json(result);
//   } catch (err) {
//     console.log(err);
//     if (err.name === 'JsonWebTokenError') {
//       return res.status(401).json({ error: 'Invalid token' });
//     }
//     return res.status(500).json({ error: err });
//   }
// };

// const getSenangPayUsers = async (req, res) => {
//   try {
//     const company_id = req.query.company_id;
//     Joi.assert(company_id, Joi.string().required());

//     const company = await CompanyService.getByPublicId(company_id);
//     if (!company) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: 'That company does not exist' });
//     }

//     const result = await SenangPayService.getSenangPayUsers(company.id);
//     if (result) {
//       const formattedResult = result.map((n) =>
//         formatResponse(n, ['password', 'user_id']),
//       );
//       return res.status(StatusCodes.OK).json(formattedResult);
//     }
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
//   }
// };

// const addSenangPayUsers = async (req, res) => {
//   try {
//     const schema = Joi.object({
//       company_id: Joi.string().required(),
//       //user_ids: Joi.string().required()
//       user_ids: Joi.array().items(Joi.string().required()),
//     });
//     await schema.validateAsync(req.body);
//     const company_id = req.body.company_id;
//     const user_ids = req.body.user_ids;

//     const company = await CompanyService.getByPublicId(company_id);
//     if (!company) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: 'That company does not exist' });
//     }

//     let users = await UserService.getByPublicIds(user_ids);
//     users = users.map((user) => user.id);

//     if (!users) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: 'Users does not exist' });
//     }

//     const result = await SenangPayService.addSenangPayUsers(company.id, users);
//     if (result) {
//       return res.status(StatusCodes.OK).json({ message: 'Success' });
//     }
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
//   }
// };

// const removeSenangPayUsers = async (req, res) => {
//   try {
//     const schema = Joi.object({
//       company_id: Joi.string().required(),
//       user_ids: Joi.array().items(Joi.string().required()),
//     });
//     await schema.validateAsync(req.body);
//     const company_id = req.body.company_id;
//     const user_ids = req.body.user_ids;

//     const company = await CompanyService.getByPublicId(company_id);
//     if (!company) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: 'That company does not exist' });
//     }

//     let users = await UserService.getByPublicIds(user_ids);
//     users = users.res.map((user) => user.id);

//     if (!users) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: 'Users does not exist' });
//     }

//     const result = await SenangPayService.removeSenangPayUsers(
//       company.id,
//       users,
//     );
//     if (result) {
//       return res.status(StatusCodes.OK).json({ message: 'Success' });
//     }
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
//   }
// };

// const getSenangPayStatus = async (req, res) => {
//   try {
//     const result = await SenangPayService.getSenangPayStatus(
//       req.params.companyId,
//     );

//     return res.json(result);
//   } catch (error) {
//     return res.status(500).json({ error: error });
//   }
// };

// const updateSenangPayStatus = async (req, res) => {
//   try {
//     const result = await SenangPayService.updateSenangPayStatus(
//       req.params.companyId,
//       req.body,
//     );

//     return res.json(result);
//   } catch (error) {
//     return res.status(500).json({ error: error });
//   }
// };

// const updateSenangPayAsDefaultStatus = async (req, res) => {
//   try {
//     Joi.assert(req.body.default_payment, Joi.boolean().required());
//     const result = await SenangPayService.updateSenangPayAsDefaultStatus(
//       req.params.companyId,
//       req.body,
//     );

//     return res.status(StatusCodes.OK).json(result);
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
//   }
// };

const transactionComplete = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  // TODO: add log to cloudwatch
  try {
    const schema = Joi.object({
      status_id: Joi.string().required(),
      order_id: Joi.string().required(),
      transaction_id: Joi.string().required(),
      msg: Joi.string().required(),
      hash: Joi.string().required(),
      next_payment_date: Joi.string(),
    });

    await schema.validateAsync(req.body);
    const {
      order_id,
      status_id,
      transaction_id,
      msg,
      hash: incomingHash,
    } = req.body;
    const paymentOrder = (await CollectionService.getPaymentOrderDetail(
      order_id,
    )) as PaymentOrderDetailModel;
    if (!paymentOrder) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Order does not exist' });
    }

    const credentials = await SenangPayService.getCompanySenangPayCredentials(
      paymentOrder.company_id,
    );
    const secretKey = credentials.secret_key;

    const stringToHash = `${secretKey}${status_id}${order_id}${transaction_id}${msg}`;
    const generatedHash = await SenangPayService.generateGenericSHA256Hash(
      stringToHash,
    );

    const generatedSecondaryHash = await SenangPayService.generateSHA256Hash(
      stringToHash,
      secretKey,
    );

    const isGenericHashValid = await SenangPayService.isHashValid(
      generatedHash,
      incomingHash,
    );

    const isSecondaryHashValid = await SenangPayService.isHashValid(
      generatedSecondaryHash,
      incomingHash,
    );

    if (!isGenericHashValid && !isSecondaryHashValid) {
      return res.status(400).json({ error: 'hash is not valid' });
    }

    const transaction = await SenangPayService.completePaymentTransaction({
      statusId: parseInt(status_id, 10),
      orderId: order_id,
      transactionId: transaction_id,
      message: msg,
      hash: incomingHash,
      data: req.body,
    });

    return res.status(StatusCodes.OK).json(transaction);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
  }
};

// const webhook = async (req, res) => {
//   try {
//     logger.log('info', 'webhook', req.body);

//     res.send('OK');
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
//   }
// };

const webhookRecurring = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    logger.common.log('info', 'webhookRecurring', req.body);

    const {
      order_id,
      status_id,
      recurring_id,
      transaction_id,
      next_payment_date,
      payment_details,
      msg,
      hash: incomingHash,
    } = req.body;
    const paymentOrder = (await CollectionService.getPaymentOrderDetail(
      order_id,
    )) as PaymentOrderDetailModel;
    if (!paymentOrder) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Order does not exist' });
    }

    const credentials = await SenangPayService.getCompanySenangPayCredentials(
      paymentOrder.company_id,
    );

    const isHashValid = await SenangPayService.verifyRecurringTransaction(
      {
        secretKey: credentials.secret_key,
        statusId: status_id,
        orderId: order_id,
        transactionId: transaction_id,
        message: msg,
      },
      incomingHash,
    );

    if (!isHashValid) {
      return res.status(400).json({ error: 'hash is not valid' });
    }

    await SenangPayService.completeRecurringTransaction({
      orderId: order_id,
      statusId: status_id,
      recurringId: recurring_id,
      nextPaymentDate: next_payment_date,
      paymentDetails: payment_details,
      message: msg,
      hash: incomingHash,
      collectionId: paymentOrder.collection_id,
      contactId: paymentOrder.contact_id,
    });

    return res.send('OK');
  } catch (error) {
    console.log(error);
    logger.common.error('webhookRecurring', { error, body: req.body });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
  }
};

export default {
  login,
  initiatePayment,
  // getTransactionList,
  // paymentComplete,
  // getSenangPayUsers,
  // addSenangPayUsers,
  // removeSenangPayUsers,
  // getSenangPayStatus,
  // updateSenangPayStatus,
  transactionComplete,
  // updateSenangPayAsDefaultStatus,
  // webhook,
  webhookRecurring,
};
