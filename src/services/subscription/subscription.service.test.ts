import { SubscriptionStore } from '@data-access';
import { CompanyModel } from '@models/company.model';
import { SubscriptionPackageModel } from '@models/subscription.model';
import SubscriptionService from './subscription.service';
jest.mock('@data-access/subscription/subscription.store');

describe('subscription.service', () => {
  describe('hasCompanyUsedFreeTrialBefore', () => {
    test('should return true if company has used free trial before', async () => {
      const freeTrialPackage = { id: 2 } as SubscriptionPackageModel;
      const company = { id: 1 } as CompanyModel;

      (
        SubscriptionStore.getCompanyInactiveSubscriptions as jest.Mock
      ).mockResolvedValue([{ something: 1 }]);

      const res = await SubscriptionService.hasCompanyUsedFreeTrialBefore({
        company,
        freeTrialPackage,
      });

      expect(res).toBe(true);
    });
  });
});
// /* eslint-disable @typescript-eslint/no-unused-vars */
// // import _ from 'lodash';
// import MockDate from 'mockdate';
// import dayjs from 'dayjs';
// import SubscriptionService, {
//   SUBSCRIPTION_STATUS,
// } from './subscription.service';
// import StripeMockData from '../../jest/mockData/stripe';
// import fixtures from '../../jest/fixtures';
// import { faker } from '@faker-js/faker';
// import { StripeService } from '@services';
// import {
//   CompanySubscriptionModel,
//   CompanySubscriptionWithQuotaRefreshModel,
// } from '@models/subscription.model';
// // @ts-ignore
// import SubscriptionStore from '@data-access/subscription/subscription.store';
// import utc from 'dayjs/plugin/utc';
// import { CompanyModel } from '@models/company.model';
// dayjs.extend(utc);

// // import CollectionService from '../collection/collection.service';
// // import CompanyStore from '@data-access/companies/company.store';
// // import { getSecretValue } from '@utils/secret.utils';

// jest.mock('twilio');

// jest.mock('@data-access/subscription/subscription.store');
// // jest.mock('../collection/collection.service');
// jest.mock('../company/company.service');
// jest.mock('../stripe/stripe.service');
// jest.mock('@data-access/loaders', () => ({
//   createLoaders: jest.fn(() => ({
//     subscriptionPackages: {
//       load: jest.fn().mockImplementation(() => {
//         return fixtures.generate('package');
//       }),
//     },
//   })),
// }));
// // jest.mock('knex');
// // jest.mock('@utils/secret.utils', () => ({
// //   getSecretValue: jest
// //     .fn()
// //     .mockResolvedValue(
// //       '{"SENANGPAY_CIPHER_KEY":"9K8fZmYi0m1vLhe2AdpkpUlk9dkXFVYyCn7GCK/dArE="}',
// //     ),
// // }));

// describe('subscription.service', () => {
//   const currentDate = dayjs.utc();

//   describe('isSubscriptionRequestValid', () => {
//     const user = fixtures.generate('user');
//     const company = fixtures.generate('company');
//     const price = fixtures.generate('generic');
//     const pkg = fixtures.generate('package');
//     test('should return true for a valid request', async () => {
//       (SubscriptionStore.isSubscriptionActive as jest.Mock).mockResolvedValue(
//         false,
//       );

//       const valid = await SubscriptionService.isSubscriptionRequestValid({
//         user,
//         company,
//         price,
//         pkg,
//       });

//       expect(valid).toBe(true);
//     });
//     test('should throw error for missing customer id', async () => {
//       const user = fixtures.generate('user');
//       const { customer_id, ...mockUser } = user;

//       (SubscriptionStore.isSubscriptionActive as jest.Mock).mockResolvedValue(
//         false,
//       );

//       try {
//         await SubscriptionService.isSubscriptionRequestValid({
//           user: mockUser,
//           company,
//           price,
//           pkg,
//         });
//       } catch (error) {
//         expect((error as Error).message).toBe('Customer id is missing');
//       }

//       expect.assertions(1);
//     });
//     test('should throw error for existing subscription', async () => {
//       (SubscriptionStore.isSubscriptionActive as jest.Mock).mockResolvedValue(
//         true,
//       );

//       try {
//         await SubscriptionService.isSubscriptionRequestValid({
//           user,
//           company,
//           price,
//           pkg,
//         });
//       } catch (error) {
//         expect((error as Error).message).toBe(
//           `${company.name} is already subscribed to the ${pkg.title} package`,
//         );
//       }

//       expect.assertions(1);
//     });
//     test('should throw error for missing user payment method', async () => {
//       const { payment_method_id, ...user } = fixtures.generate('user');

//       (SubscriptionStore.isSubscriptionActive as jest.Mock).mockResolvedValue(
//         false,
//       );

//       try {
//         await SubscriptionService.isSubscriptionRequestValid({
//           user,
//           company,
//           price,
//           pkg,
//         });
//       } catch (error) {
//         expect((error as Error).message).toBe(`Please add a payment method`);
//       }

//       expect.assertions(1);
//     });
//   });

//   describe('getSubscriptionEndDateString', () => {
//     test('it should return the correct date and time for a day interval', async () => {
//       const res = await SubscriptionService.getSubscriptionEndDateString({
//         currentDate,
//         interval: 'day',
//         duration: 2,
//       });

//       const expectedEndDate = currentDate
//         .add(2, 'day')
//         .toISOString()
//         .replace('Z', '');

//       expect(res).toBe(expectedEndDate);
//     });

//     test('it should return the correct date and time for a week interval', async () => {
//       const res = await SubscriptionService.getSubscriptionEndDateString({
//         currentDate,
//         interval: 'week',
//         duration: 1,
//       });

//       const expectedEndDate = currentDate
//         .add(1, 'week')
//         .toISOString()
//         .replace('Z', '');

//       expect(res).toBe(expectedEndDate);
//     });

//     test('it should return the correct date and time for a month interval', async () => {
//       const res = await SubscriptionService.getSubscriptionEndDateString({
//         currentDate,
//         interval: 'month',
//         duration: 1,
//       });

//       const expectedEndDate = currentDate
//         .add(1, 'month')
//         .toISOString()
//         .replace('Z', '');

//       expect(res).toBe(expectedEndDate);
//     });

//     test('it should return the correct date and time for a year interval', async () => {
//       const res = await SubscriptionService.getSubscriptionEndDateString({
//         currentDate,
//         interval: 'year',
//         duration: 1,
//       });

//       const expectedEndDate = currentDate
//         .add(1, 'year')
//         .toISOString()
//         .replace('Z', '');

//       expect(res).toBe(expectedEndDate);
//     });

//     test('it should throw on unsupported interval', async () => {
//       try {
//         const res = await SubscriptionService.getSubscriptionEndDateString({
//           currentDate,
//           interval: 'mayan calendar year',
//           duration: 666,
//         });
//       } catch (error) {
//         expect((error as Error).message).toBe('Invalid package duration type');
//       }
//     });
//   });

//   describe('requestSubscription', () => {
//     const user = fixtures.generate('user');
//     const company = fixtures.generate('company');
//     const price = fixtures.generate('generic');
//     const pkg = fixtures.generate('package');
//     let endDateSpy;

//     // beforeEach(() => {
//     //   currentDate = dayjs.utc();
//     //   endDateSpy = jest
//     //     .spyOn(SubscriptionService.getSubscriptionEndDateString)
//     //     .mockResolvedValue(faker.datatype.datetime);
//     // });
//     // afterEach(() => {
//     //   endDateSpy.mockRestore();
//     // });

//     // test('it should throw an error if the subscription request is not valid', async () => {
//     //   jest
//     //     .spyOn(SubscriptionService, 'isSubscriptionRequestValid')
//     //     .mockResolvedValue(false);

//     //   try {
//     //     const res = await SubscriptionService.requestSubscription({
//     //       user,
//     //       company,
//     //       price,
//     //       pkg,
//     //     });
//     //     expect(res).toBe(false);
//     //   } catch (error) {
//     //     expect((error as Error).message).toBe(
//     //       'Subscription request is not valid, please contact support.',
//     //     );
//     //   }

//     //   expect.assertions(1);
//     //   jest.restoreAllMocks();
//     // });

//     // test('it should return a valid subscription result for a request', async () => {
//     //   const insertedId = faker.datatype.uuid();
//     //   jest
//     //     .spyOn(SubscriptionService, 'isSubscriptionRequestValid')
//     //     .mockResolvedValue(true);
//     //   jest
//     //     .spyOn(SubscriptionService, 'getSubscriptionEndDateString')
//     //     .mockResolvedValue(faker.datatype.string());
//     //   jest
//     //     .spyOn(StripeService, 'createSubscription')
//     //     .mockResolvedValue(fixtures.generate('companySubscription'));
//     //   jest
//     //     .spyOn(SubscriptionService, 'getSubscriptionStatusForStripeStatus')
//     //     .mockReturnValue(1);

//     //   jest.spyOn(SubscriptionStore, 'insertSubscription').mockResolvedValue({
//     //     ...fixtures.generate('companySubscription'),
//     //     id_text: insertedId,
//     //   });

//     //   jest
//     //     .spyOn(SubscriptionStore, 'updateSubscriptionStatus')
//     //     .mockResolvedValue({
//     //       ...fixtures.generate('companySubscription'),
//     //       id_text: insertedId,
//     //     });

//     //   const res = (await SubscriptionService.requestSubscription({
//     //     user,
//     //     company,
//     //     price,
//     //     pkg,
//     //   })) as CompanySubscriptionModel;
//     //   expect(res.id_text).toBe(insertedId);
//     //   // expect(res).toBe(true);

//     //   jest.restoreAllMocks();
//     // });
//   });

//   describe('getSubscriptionStatusForStripeStatus', () => {
//     test('should return the correct status for the stripe sub status', async () => {
//       let inputStatus = 'active';
//       expect(
//         SubscriptionService.getSubscriptionStatusForStripeStatus(inputStatus),
//       ).toBe(SUBSCRIPTION_STATUS.ACTIVE);

//       inputStatus = 'past_due';
//       expect(
//         SubscriptionService.getSubscriptionStatusForStripeStatus(inputStatus),
//       ).toBe(SUBSCRIPTION_STATUS.OVERDUE);

//       inputStatus = 'unpaid';
//       expect(
//         SubscriptionService.getSubscriptionStatusForStripeStatus(inputStatus),
//       ).toBe(SUBSCRIPTION_STATUS.OVERDUE);

//       inputStatus = 'canceled';
//       expect(
//         SubscriptionService.getSubscriptionStatusForStripeStatus(inputStatus),
//       ).toBe(SUBSCRIPTION_STATUS.CANCELLED);

//       inputStatus = 'incomplete';
//       expect(
//         SubscriptionService.getSubscriptionStatusForStripeStatus(inputStatus),
//       ).toBe(SUBSCRIPTION_STATUS.INCOMPLETE);

//       inputStatus = 'incomplete_expired';
//       expect(
//         SubscriptionService.getSubscriptionStatusForStripeStatus(inputStatus),
//       ).toBe(SUBSCRIPTION_STATUS.INCOMPLETE);

//       inputStatus = 'trialing';
//       expect(
//         SubscriptionService.getSubscriptionStatusForStripeStatus(inputStatus),
//       ).toBe(SUBSCRIPTION_STATUS.TRIAL);
//     });
//   });

//   describe('createSubscriptionInsertOptions', () => {
//     const user = fixtures.generate('user');
//     const company = fixtures.generate('company');
//     const price = fixtures.generate('generic');
//     const pkg = fixtures.generate('package');
//     const startDate = faker.datatype.string();
//     const endDate = faker.datatype.string();

//     test('should format the subscription options correctly', async () => {
//       const res = SubscriptionService.createSubscriptionInsertOptions({
//         company,
//         pkg,
//         price,
//         startDate,
//         endDate,
//         user,
//         status: 1,
//       });

//       expect(res).toStrictEqual({
//         companyId: company.id,
//         packageId: pkg.id,
//         productId: pkg.product_id,
//         priceId: price.stripe_price_id,
//         packageTitle: pkg.title,
//         packageDescription: pkg.description,
//         smsQuota: pkg.sms_quota,
//         phoneCallQuota: pkg.phone_call_quota,
//         emailQuota: pkg.email_quota,
//         whatsAppQuota: pkg.whatsapp_quota,
//         price: price.price,
//         interval: price.interval,
//         intervalCount: price.interval_count,
//         startDate,
//         endDate,
//         createdBy: user.id,
//         packageData: JSON.stringify(pkg),
//         status: 1,
//         promo: undefined,
//       });

//       jest.restoreAllMocks();
//     });

//     test('should format the subscription options with promo code correctly', async () => {
//       const utcDate = dayjs.utc();
//       // @ts-ignore
//       jest.spyOn(dayjs, 'utc').mockResolvedValue(utcDate);

//       const promo = faker.datatype.uuid();
//       const res = SubscriptionService.createSubscriptionInsertOptions({
//         company,
//         pkg,
//         price,
//         startDate,
//         endDate,
//         user,
//         status: 2,
//         // @ts-ignore
//         promo,
//       });

//       expect(res).toStrictEqual({
//         companyId: company.id,
//         packageId: pkg.id,
//         productId: pkg.product_id,
//         priceId: price.stripe_price_id,
//         packageTitle: pkg.title,
//         packageDescription: pkg.description,
//         smsQuota: pkg.sms_quota,
//         phoneCallQuota: pkg.phone_call_quota,
//         emailQuota: pkg.email_quota,
//         whatsAppQuota: pkg.whatsapp_quota,
//         price: price.price,
//         interval: price.interval,
//         intervalCount: price.interval_count,
//         startDate,
//         endDate,
//         createdBy: user.id,
//         packageData: JSON.stringify(pkg),
//         status: 2,
//         promo,
//       });

//       jest.restoreAllMocks();
//     });
//   });

//   // describe('refreshSubscription', () => {
//   //   test('should increment quotas correctly', async () => {
//   //     const activeSub = fixtures.generate('companySubscription');
//   //     const inputs = {
//   //       whatsapp: faker.datatype.number(),
//   //       email: faker.datatype.number(),
//   //       sms: faker.datatype.number(),
//   //       phone: faker.datatype.number(),
//   //       subId: activeSub.id,
//   //     };

//   //     (
//   //       SubscriptionStore.getActiveCompanySubscription as jest.Mock
//   //     ).mockResolvedValue(activeSub);
//   //     (
//   //       SubscriptionStore.incrementSubscriptionQuotas as jest.Mock
//   //     ).mockResolvedValue(fixtures.generate('companySubscription'));

//   //     const companyId = faker.datatype.number();

//   //     const res = await SubscriptionService.refreshSubscription(companyId);

//   //     expect(SubscriptionStore.incrementSubscriptionQuotas).toHaveBeenCalled();
//   //   });

//   //   // test('should not increment quotas if input values are 0', async () => {
//   //   //   (
//   //   //     SubscriptionStore.getActiveCompanySubscription as jest.Mock
//   //   //   ).mockResolvedValue(fixtures.generate('companySubscription'));
//   //   //   (
//   //   //     SubscriptionStore.incrementSubscriptionQuotas as jest.Mock
//   //   //   ).mockResolvedValue(fixtures.generate('companySubscription'));

//   //   //   const inputs = {
//   //   //     whatsapp: 0,
//   //   //     email: 0,
//   //   //     sms: 0,
//   //   //     phone: 0,
//   //   //   };

//   //   //   const companyId = faker.datatype.number();

//   //   //   const res = await SubscriptionService.refreshSubscription(companyId);

//   //   //   expect(SubscriptionStore.incrementSubscriptionQuotas).toBeCalledWith(
//   //   //     inputs,
//   //   //   );
//   //   // });

//   //   test('should throw if no active subscription found', async () => {
//   //     (
//   //       SubscriptionStore.getActiveCompanySubscription as jest.Mock
//   //     ).mockResolvedValue(undefined);

//   //     const companyId = faker.datatype.number();

//   //     try {
//   //       const res = await SubscriptionService.refreshSubscription(companyId);
//   //     } catch (error) {
//   //       expect((error as Error).message).toBe(
//   //         'No active subscription for this company',
//   //       );
//   //     }
//   //   });
//   // });

//   describe('handleRenewAnnualSubscriptionsTrigger', () => {
//     const subs = fixtures.generate('companySubscription', 5);
//     test('it should filter the subscriptions that are due for quota refresh', async () => {
//       const subs = fixtures
//         .generate('companySubscription', 20)
//         .map((cm: CompanySubscriptionModel) => {
//           const start_date = dayjs()
//             .subtract(1, 'year')
//             .add(Math.floor(Math.random() * 365 + 1), 'day');
//           const end_date = start_date.add(1, 'year');
//           return {
//             ...cm,
//             status: 1,
//             active: 1,
//             interval: 'year',
//             start_date: start_date.toISOString(),
//             end_date: end_date.toISOString(),
//           };
//         });

//       MockDate.set('2020-10-1');

//       (
//         SubscriptionStore.getCurrentAnnualSubscriptions as jest.Mock
//       ).mockResolvedValue(subs);

//       const expectedSubs = subs.filter((cm: CompanySubscriptionModel) => {
//         const { start_date } = cm;
//         const dayOfMonth = dayjs(start_date).date();
//         if (dayOfMonth in [31, 1]) {
//           return true;
//         }
//       });

//       const res =
//         await SubscriptionService.handleRenewAnnualSubscriptionsTrigger();
//       // console.log('res', res);

//       // expect(
//       //   SubscriptionStore.getAnnualSubscriptionsWithinPeriod,
//       // ).toBeCalledWith({
//       //   fromDate: '2020-11-11',
//       //   toDate: '2020-11-12',
//       // });

//       expect(res).toHaveLength(expectedSubs.length);
//       MockDate.reset();
//     });
//   });

//   describe('getAnnualSubscriptionsQueryOptions', () => {
//     test('it should return the normal interval for days 1-28', async () => {
//       MockDate.set('2020-11-11');

//       const res =
//         await SubscriptionService.getAnnualSubscriptionsQueryOptions();

//       const expectedResult = [11];

//       expect(res).toEqual(expectedResult);

//       MockDate.reset();
//     });

//     test('it should return missed days last month if checking on the 1st', async () => {
//       MockDate.set('2020-10-1');

//       const res =
//         await SubscriptionService.getAnnualSubscriptionsQueryOptions();

//       const expectedResult = [31, 1];

//       expect(res).toStrictEqual(expectedResult);

//       MockDate.reset();
//     });

//     test('it should handle normal February with 28 days', async () => {
//       MockDate.set('2021-3-1');

//       const res =
//         await SubscriptionService.getAnnualSubscriptionsQueryOptions();

//       const expectedResult = [29, 30, 31, 1];

//       expect(res).toStrictEqual(expectedResult);

//       MockDate.reset();
//     });

//     test('it should handle February with leap day 29 days', async () => {
//       MockDate.set('2020-3-1');

//       const res =
//         await SubscriptionService.getAnnualSubscriptionsQueryOptions();

//       const expectedResult = [30, 31, 1];

//       expect(res).toStrictEqual(expectedResult);

//       MockDate.reset();
//     });
//   });

//   describe('createTrialSubscription', () => {
//     test('It should throw error if there is existing subscription', async () => {
//       const mockUserModel = fixtures.generate('user');
//       const mockCompanyModel = fixtures.generate('company');
//       const mockCreateResponse = fixtures.generate('companySubscription');

//       (SubscriptionStore.insertSubscription as jest.Mock).mockResolvedValue({
//         mockCreateResponse,
//       });

//       (
//         SubscriptionStore.getActiveCompanySubscriptions as jest.Mock
//       ).mockResolvedValue([mockCreateResponse]);

//       try {
//         const res = await SubscriptionService.createTrialOmniSubscription({
//           user: mockUserModel,
//           company: mockCompanyModel,
//           trialDays: 7,
//           pricesWithQuantity: [],
//           subscriptionPackages: [],
//         });
//       } catch (error) {
//         const err = error as Error;
//         expect(err.message).toBe(
//           'You currently have active subscription, please cancel it to use trial option',
//         );
//       }
//     });

//     test('It should create trial subscription', async () => {
//       const mockUserModel = fixtures.generate('user');
//       const mockCompanyModel = fixtures.generate('company');
//       const mockCreateResponse = fixtures.generate('companySubscription');

//       (SubscriptionStore.insertSubscription as jest.Mock).mockResolvedValue(
//         mockCreateResponse,
//       );

//       (
//         SubscriptionStore.getActiveCompanySubscriptions as jest.Mock
//       ).mockResolvedValue([]);

//       try {
//         const res = await SubscriptionService.createTrialOmniSubscription({
//           user: mockUserModel,
//           company: mockCompanyModel,
//           trialDays: 7,
//           pricesWithQuantity: [],
//           subscriptionPackages: [],
//         });

//         expect(res).toEqual(mockCreateResponse);
//       } catch (error) {
//         const err = error as Error;
//         expect(err.message).toBe(
//           'You currently have active subscription, please cancel it to use trial option',
//         );
//       }
//     });
//   });

//   describe('cancelOmniTrialSubscription', () => {
//     test('It should return error: Subscription is not active', async () => {
//       const mockCompanySubscriptionModel = fixtures.generate(
//         'companySubscription',
//       );
//       const mockCompanyModel = fixtures.generate('company') as CompanyModel;

//       try {
//         const res = await SubscriptionService.cancelOmniTrialSubscription({
//           companyId: mockCompanyModel.id,
//           companySubscription: {
//             ...mockCompanySubscriptionModel,
//             active: 0,
//             status: SUBSCRIPTION_STATUS.TRIAL,
//           },
//         });
//         expect(res).toBe(undefined);
//       } catch (error) {
//         const err = error as Error;
//         expect(err.message).toBe(
//           'The selected subscription package is not active',
//         );
//       }
//     });
//     test('It should return error: Subscription is not in trial status', async () => {
//       const mockCompanySubscriptionModel = fixtures.generate(
//         'companySubscription',
//       );
//       const mockCompanyModel = fixtures.generate('company') as CompanyModel;

//       try {
//         const res = await SubscriptionService.cancelOmniTrialSubscription({
//           companyId: mockCompanyModel.id,
//           companySubscription: {
//             ...mockCompanySubscriptionModel,
//             active: 1,
//             status: SUBSCRIPTION_STATUS.ACTIVE,
//           },
//         });
//         expect(res).toBe(undefined);
//       } catch (error) {
//         const err = error as Error;
//         expect(err.message).toBe('The selected package is not a trial package');
//       }
//     });
//     test('It should cancel the subscription and return the cancelled subscription model', async () => {
//       const mockCompanySubscriptionModel = fixtures.generate(
//         'companySubscription',
//       );
//       const mockCompanyModel = fixtures.generate('company') as CompanyModel;

//       (
//         SubscriptionStore.updateSubscriptionStatus as jest.Mock
//       ).mockResolvedValue([
//         {
//           ...mockCompanySubscriptionModel,
//           active: 1,
//           status: SUBSCRIPTION_STATUS.CANCELLED,
//         },
//       ]);

//       try {
//         const res = await SubscriptionService.cancelOmniTrialSubscription({
//           companyId: mockCompanyModel.id,
//           companySubscription: {
//             ...mockCompanySubscriptionModel,
//             active: 1,
//             status: SUBSCRIPTION_STATUS.TRIAL,
//           },
//         });
//         expect(res).toEqual({
//           ...mockCompanySubscriptionModel,
//           active: 1,
//           status: SUBSCRIPTION_STATUS.CANCELLED,
//         });
//       } catch (error) {
//         const err = error as Error;
//         console.log(error);
//       }
//     });
//   });
// });
