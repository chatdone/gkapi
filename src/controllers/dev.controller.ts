import { StatusCodes } from 'http-status-codes';
import express from 'express';
import dotenv from 'dotenv';
import { createLoaders, SubscriptionStore, UserStore } from '@data-access';
import {
  SocketService,
  ReportService,
  StorageService,
  SubscriptionService,
  StripeService,
} from '@services';
import { UserModel } from '@models/user.model';
import _ from 'lodash';
dotenv.config();

const upgradeCompanySub = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response> => {
  try {
    const { companyId } = req.params;

    const result = await SubscriptionStore.upgradeCompanySub(+companyId);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

/* This will delete the subscription for the user's company id, and remove the customer id on the user
 *	Use carefully, it deletes stuff
 */
const removeCompanySubscription = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response> => {
  try {
    const { company_id, user_id, remove_customer_id } = req.body;
    if (!company_id || !user_id) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing inputs' });
    }

    await SubscriptionStore.removeSubscriptionByCompanyId(+company_id);

    if (remove_customer_id) {
      await UserStore.removeUserCustomerId(+user_id);
    }

    return res.status(StatusCodes.OK).json({ company_id, user_id });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

/*
 *	This will run the refresh sub service function to replenish a new month's quota
 */
// const refreshSubscription = async (
//   req: express.Request,
//   res: express.Response,
// ): Promise<express.Response> => {
//   try {
//     const { companyId } = req.params;
//     if (!companyId) {
//       res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing inputs' });
//     }

//     const result = await SubscriptionService.refreshSubscription(+companyId);

//     return res.status(StatusCodes.OK).json(result);
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// };

const triggerRefreshSubscriptionJob = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response> => {
  try {
    const result =
      await SubscriptionService.handleRenewAnnualSubscriptionsTrigger();

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const getPresignedUrl = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response> => {
  try {
    const options = {
      bucketName: 'gokudos-assets',
      filePath: `${process.env.GK_ENVIRONMENT}/verification/tester.jpg`,
    };
    const result = await StorageService.generatePresignedS3Url(options);

    return res.status(StatusCodes.OK).json({ result });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const testExcel = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response | undefined> => {
  try {
    const result = await ReportService.exportContactGroupsAsExcel({
      companyId: 1,
      res,
    });
    //const workbook = new Excel.Workbook();
    //workbook.created = new Date();
    //workbook.addWorksheet('Yae Miko');
    //workbook.addWorksheet('Shogun');

    //setFileResHeader({ res, fileName: 'ahoy.xlsx' });
    //console.log(workbook);
    //const result = await workbook.xlsx.writeFile('ahoy.xlsx');
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const testPermissions = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response | undefined> => {
  try {
    const loaders = createLoaders();
    const user = (await loaders.users.load(1)) as UserModel;
    console.log(req);

    // const ability = await createUserAbility({ userId: 1 });
    // const taskComment = (await loaders.taskComments.load(
    //   5,
    // )) as TaskCommentModel;

    // const permissions = JSON.stringify([
    //   {
    //     action: 'update',
    //     subject: 'User',
    //     conditions: {
    //       user_id: '${user.id}',
    //     },
    //   },
    // ]);
    // const interpolatedPermissions = interpolate(permissions, {});

    // console.log('interpolated', interpolatedPermissions);

    // const ability = createAbility(interpolatedPermissions);

    // 1. Get the permissions object
    // 2. Create the ability
    // 3. Check against the ability

    // CHECK
    // ForbiddenError.from(ability).throwUnlessCan(
    //   'update',
    //   subject('User', user),
    // );

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const socketTest = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response | undefined> => {
  try {
    const { body } = req;
    const { event, data, email } = body;

    // await SocketService.notifyTaskUpdated({
    //   taskId: 29,
    // });

    const sockets = await SocketService.getSocketsForUserEmail(email);
    console.log(sockets.length);

    // if (socket) {
    //   console.log(`Found socket for ${email}`);
    // }

    // console.log(socket?.data);

    _.forEach(sockets, (socket) => {
      // @ts-ignore
      socket?.emit(event, JSON.stringify(data));
    });

    res.sendStatus(200);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const testSubs = async (req: express.Request, res: express.Response) => {
  try {
    const { query } = req.body;
    // const result = await StripeService.getSubscriptionProducts(query);

    // return res.status(200).json(result);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

// const testCollectionPermission = async (req: Request, res: Response) => {
//   try {
//     const loaders = createLoaders();
//     const user = (await loaders.users.load(3)) as UserModel;
//     const contact = (await loaders.contacts.load(2)) as ContactModel;
//     const company = (await loaders.companies.load(3)) as CompanyModel;

//     const permissions = JSON.stringify(
//       member.find((member) => member.action === 'create'),
//     );

//     const interpolatedPermissions = interpolate(permissions, {
//       user,
//       company,
//       contact,
//     });

//     console.log(interpolatedPermissions);

//     const ability = createAbility(interpolatedPermissions);

//     console.log(ability);

//     // 1. Get the permissions object
//     // 2. Create the ability
//     // 3. Check against the ability

//     // CHECK
//     // ForbiddenError.from(ability).throwUnlessCan(
//     //   'create',
//     //   subject('Collection', user),
//     // );

//     res.sendStatus(200);
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
//   }
// };

// const updateAttendanceDailyMv = async (
//   req: express.Request,
//   res: express.Response,
// ): Promise<express.Response> => {
//   try {
//     const result = await AttendanceService.updateMemberDailySummary({
//       companyMemberId: 1,
//     });
//     return res.status(StatusCodes.OK).json({ result });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// };

const getActiveTrialSubscriptionCompanies = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    await ReportService.exportActiveTrialSubscriptionCompaniesAsExcel({ res });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const testOpaqueAuth0Token = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    console.log('testOpaqueAuth0Token');
    return res.status(StatusCodes.OK).json({ result: 'testOpaqueAuth0Token' });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export default {
  getPresignedUrl,
  upgradeCompanySub,
  removeCompanySubscription,
  //refreshSubscription,
  triggerRefreshSubscriptionJob,
  testExcel,
  testPermissions,
  socketTest,
  getActiveTrialSubscriptionCompanies,
  testOpaqueAuth0Token,
  testSubs,
  // testCollectionPermission,
  // updateAttendanceDailyMv,
};
