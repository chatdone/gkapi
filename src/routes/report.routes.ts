import { Router, Request, Response, NextFunction } from 'express';

import {
  generateTaskReport,
  generateCollectionReport,
  generateContactsExcel,
  generateProjectTasksReport,
  generateAttendanceReport,
  generatePaymentTransactionsExcel,
  generateInvoiceReport,
  generateReport,
} from '@controllers/reports.controller';
import { verifyToken } from '@utils/auth0.util';
import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { UserStore } from '@data-access';
import { Auth0TokenPayload, UserModel } from '@models/user.model';
import Joi from 'joi';

const router = new (Router as any)();

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';

    const token = authHeader?.replace('Bearer', '').replace(' ', '');

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Token is not provided',
      });
    }

    const schema = Joi.object({
      userId: Joi.string().required(),
    });

    const userId = (req?.query?.userId || req?.query?.user_id) as string;

    await schema.validateAsync({ userId });

    const authPayload = (await verifyToken(token)) as Auth0TokenPayload;

    const userProfile = await UserStore.getUserWithCompaniesByEmail(
      authPayload?.email,
    );

    if (_.isEmpty(userProfile)) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User does not exist' });
    }

    const isAuthorized = userId === (userProfile as UserModel)?.id_text;

    if (!isAuthorized) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message:
          "User does not have permission to download this user's transactions",
      });
    }

    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const checkIfInCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization || '';

    const token = authHeader?.replace('Bearer', '').replace(' ', '');

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Token is not provided',
      });
    }

    const schema = Joi.object({
      companyId: Joi.string().required(),
    });

    const companyId = (req?.query?.companyId ||
      req?.query?.company_id) as string;

    await schema.validateAsync({ companyId });

    const payload = await verifyToken(token);

    const authPayload = payload as Auth0TokenPayload;

    const userProfile = (await UserStore.getUserWithCompaniesByEmail(
      authPayload?.email,
    )) as UserModel;

    if (_.isEmpty(userProfile)) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User does not exist' });
    }

    const isAuthorized = userProfile.companyUuids?.includes(companyId);

    if (!isAuthorized) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message:
          'User does not have permission to download the report for this company',
      });
    }

    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

router.get('/tasks', checkIfInCompany, (req: Request, res: Response) => {
  generateTaskReport(req, res);
});

router.get('/collections', checkIfInCompany, (req: Request, res: Response) => {
  generateCollectionReport(req, res);
});

router.get(
  '/project-tasks',
  checkIfInCompany,
  (req: Request, res: Response) => {
    generateProjectTasksReport(req, res);
  },
);
router.get(
  '/time-attendances',
  checkIfInCompany,
  (req: Request, res: Response) => {
    generateAttendanceReport(req, res);
  },
);
router.get('/contacts', checkIfInCompany, (req: Request, res: Response) => {
  generateContactsExcel(req, res);
});
router.get(
  '/payment-transactions',
  checkAuth,
  (req: Request, res: Response) => {
    generatePaymentTransactionsExcel(req, res);
  },
);

router.get('/invoice', checkIfInCompany, (req: Request, res: Response) => {
  generateInvoiceReport(req, res);
});

router.get('/projects-v2', (req: Request, res: Response) => {
  generateReport(req, res);
});

export default router;
