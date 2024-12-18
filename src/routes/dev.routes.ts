import express, { Request, Response, NextFunction } from 'express';

import { DevController, HolidayController } from '@controllers';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

import { UserModel } from '@models/user.model';
import { redis, UserStore } from '@data-access';
import _ from 'lodash';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { fetchAuth0UserProfile } from '@utils/auth0.util';
dayjs.extend(duration);

const router = express.Router();

router.post('/upgrade-company-sub/:companyId', DevController.upgradeCompanySub);
router.post('/remove-company-sub', DevController.removeCompanySubscription);
router.post('/subs', DevController.testSubs);
//router.post('/refresh-sub/:companyId', DevController.refreshSubscription);
router.post(
  '/trigger-refresh-sub',
  DevController.triggerRefreshSubscriptionJob,
);
router.post('/update-public-holidays', HolidayController.updatePublicHolidays);
router.get('/presigned-url', DevController.getPresignedUrl);
router.get('/test-excel', DevController.testExcel);
router.get('/permissions', DevController.testPermissions);
router.post('/socket-test', DevController.socketTest);
router.get(
  '/trial-companies',
  DevController.getActiveTrialSubscriptionCompanies,
);

const checkOpaqueToken = async (
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
      userId: Joi.string().required(),
    });

    const userId = (req?.query?.userId || req?.query?.user_id) as string;

    await schema.validateAsync({ userId });

    const cachedToken = await redis.get(`access-token:${userId}`);
    if (!cachedToken) {
      console.log('not cached');
      await redis.set(`access-token:${userId}`, token); // TTL 5 mins
    } else if (cachedToken === token) {
      console.log('cached token matches');
      return next();
    }

    const auth0Profile = await fetchAuth0UserProfile(token);

    const userProfile = await UserStore.getUserWithCompaniesByEmail(
      auth0Profile?.email,
    );

    if (_.isEmpty(userProfile)) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User does not exist' });
    }

    const isAuthorized = userId === (userProfile as UserModel)?.id_text;

    if (!isAuthorized) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'User does not have permission for something something.',
      });
    }

    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

router.get(
  '/test-opaque-token',
  checkOpaqueToken,
  DevController.testOpaqueAuth0Token,
);

//router.get('/permissions/collection', DevController.testCollectionPermission);
// router.get('/attendance-daily-mv', DevController.updateAttendanceDailyMv);

export default router;
