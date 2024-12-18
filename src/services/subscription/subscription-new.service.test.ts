import SubscriptionService from './subscription-new.service';
import { StripeService } from '@services';
import { CompanyStore, SubscriptionStore, UserStore } from '@data-access';
import serviceFixtures from '@test/fixtures/service.fixtures';
import { UserModel } from '@models/user.model';
import {
  SubscriptionModel,
  SubscriptionProductModel,
} from '@models/subscription.model';
import Stripe from 'stripe';
import { CompanyModel } from '@models/company.model';

jest.mock('@services');
jest.mock('@data-access');

// TODO: Rename once old file deprecated
describe('subscription-new.service', () => {
  const mockUser = serviceFixtures.generate('user', 1) as UserModel;
  // describe('startSubscription', () => {
  //   test('it should reject if the company already has an active subscription', async () => {
  //     const mockSubscription = serviceFixtures.generate(
  //       'subscription',
  //       1,
  //     ) as SubscriptionModel;

  //     (
  //       SubscriptionStore.getSubscriptionForCompanyId as jest.Mock
  //     ).mockResolvedValue(mockSubscription);

  //     try {
  //       const res = await SubscriptionService.startSubscription({
  //         companyId: 234,
  //         packageId: 2,
  //         interval: 'month',
  //       });
  //     } catch (error) {
  //       expect((error as Error).message).toEqual(
  //         'Company already has an active subscription',
  //       );
  //       expect.assertions(1);
  //     }
  //   });

  //   test('it should create a new subscription if the company does not have an active subscription', async () => {
  //     (
  //       SubscriptionStore.getSubscriptionForCompanyId as jest.Mock
  //     ).mockResolvedValue(null);

  //     const res = await SubscriptionService.startSubscription({
  //       companyId: 234,
  //       packageId: 2,
  //       interval: 'month',
  //     });
  //   });
  // });

  describe('getSubscriptionProducts', () => {
    test('it should get all subscription products from stripe matching the database list', async () => {
      const mockProducts = serviceFixtures.generate(
        'subscriptionProduct',
        3,
      ) as SubscriptionProductModel[];

      (
        SubscriptionStore.getSubscriptionProducts as jest.Mock
      ).mockResolvedValueOnce(mockProducts);

      const mockStripeProducts = serviceFixtures.generate(
        'stripeProduct',
        5,
      ) as Stripe.Product[];
      // making some of the stripe products the ones we have in the mock db
      mockStripeProducts[0].id = mockProducts[0].stripeProductId;
      mockStripeProducts[2].id = mockProducts[1].stripeProductId;
      mockStripeProducts[4].id = mockProducts[2].stripeProductId;

      (StripeService.getProducts as jest.Mock).mockResolvedValueOnce(
        mockStripeProducts,
      );

      const res = await SubscriptionService.getSubscriptionProducts();

      expect(res).toHaveLength(3);
    });
  });

  describe('createSubscriptionProduct', () => {
    test('it should create the product on stripe then locally', async () => {
      const mockStripeProduct = serviceFixtures.generate('stripeProduct', 1);

      (StripeService.createProduct as jest.Mock).mockResolvedValue(
        mockStripeProduct,
      );

      const mockSubscriptionProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      );

      (
        SubscriptionStore.createSubscriptionProduct as jest.Mock
      ).mockResolvedValue(mockSubscriptionProduct);

      const mockInput = {
        name: 'Gold Special',
        user: mockUser,
      };

      const res = await SubscriptionService.createSubscriptionProduct(
        mockInput,
      );

      expect(StripeService.createProduct).toHaveBeenCalledWith({
        name: mockInput.name,
      });

      expect(res).toEqual(mockSubscriptionProduct);
    });
  });

  describe('updateSubscriptionProduct', () => {
    test('it should update the product on stripe then locally', async () => {
      const mockStripeProduct = serviceFixtures.generate('stripeProduct', 1);

      (StripeService.updateProduct as jest.Mock).mockResolvedValue(
        mockStripeProduct,
      );

      const mockSubscriptionProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      );

      (
        SubscriptionStore.updateSubscriptionProduct as jest.Mock
      ).mockResolvedValue(mockSubscriptionProduct);

      const mockInput = {
        id: 234,
        stripeProductId: 'prod_LZWByAJ6iA4YZJ',
        name: 'Gold Special',
        user: mockUser,
      };

      const res = await SubscriptionService.updateSubscriptionProduct(
        mockInput,
      );

      expect(StripeService.updateProduct).toHaveBeenCalledWith({
        productId: mockInput.stripeProductId,
        name: mockInput.name,
      });

      expect(res).toEqual(mockSubscriptionProduct);
    });
  });

  describe('createSubscriptionPrice', () => {
    test('it should create the price for a given product on stripe', async () => {
      const mockStripePrice = serviceFixtures.generate('stripePrice', 1);

      (StripeService.createPrice as jest.Mock).mockResolvedValue(
        mockStripePrice,
      );

      const mockProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      ) as SubscriptionProductModel;

      (
        SubscriptionStore.getSubscriptionProducts as jest.Mock
      ).mockResolvedValueOnce([mockProduct]);

      const mockInput = {
        productId: mockProduct.id,
        stripeProductId: 'prod_LZWByAJ6iA4YZJ',
        amount: 783,
        interval: 'month',
        user: mockUser,
      };

      const res = await SubscriptionService.createSubscriptionPrice(mockInput);

      expect(StripeService.createPrice).toHaveBeenCalledWith({
        productId: mockInput.stripeProductId,
        amount: mockInput.amount,
        currency: 'myr',
        interval: mockInput.interval,
      });

      expect(res).toEqual(mockProduct);
    });
  });

  describe('isCompanyQuotaAvailable', () => {
    test('it should return object user true if the company has quota', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
        1,
      ) as SubscriptionModel;

      const res = await SubscriptionService.isCompanyQuotaAvailable({
        subscription: mockSubscription,
        quotaType: { user: true },
      });

      expect(res).toEqual({
        user: true,
        task: false,
        invoice: false,
        report: false,
        team: false,
        storage: false,
      });
    });
  });

  describe('handleSubscriptionQuota', () => {
    test('it should return -1 if quota is unlimited', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
        1,
      ) as SubscriptionModel;
      const mockCompany = serviceFixtures.generate(
        'company',
        1,
      ) as CompanyModel;

      const mockUser = serviceFixtures.generate('user', 1) as UserModel;

      const mockSubProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      ) as SubscriptionProductModel;

      (CompanyStore.getCompaniesById as jest.Mock).mockResolvedValueOnce(
        mockCompany,
      );
      (UserStore.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      jest
        .spyOn(SubscriptionService, 'getSubscriptionForCompanyId')
        .mockResolvedValue({
          ...mockSubscription,
        });

      (
        SubscriptionStore.getSubscriptionPackagesById as jest.Mock
      ).mockResolvedValueOnce({
        ...mockSubProduct,
        taskQuota: -1,
      });

      const res = await SubscriptionService.handleSubscriptionQuota({
        companyId: mockCompany.id,
        isDecrement: true,
        quotaType: 'task',
      });

      expect(res).toEqual(-1);

      jest.restoreAllMocks();
    });

    test('it should return deduct quota by one if there is quota left', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
        1,
      ) as SubscriptionModel;
      const mockCompany = serviceFixtures.generate(
        'company',
        1,
      ) as CompanyModel;

      const mockUser = serviceFixtures.generate('user', 1) as UserModel;

      const mockSubProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      ) as SubscriptionProductModel;

      (CompanyStore.getCompaniesById as jest.Mock).mockResolvedValueOnce(
        mockCompany,
      );
      (UserStore.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      jest
        .spyOn(SubscriptionService, 'getSubscriptionForCompanyId')
        .mockResolvedValue({
          ...mockSubscription,
          taskQuota: 24,
        });

      (
        SubscriptionStore.getSubscriptionPackagesById as jest.Mock
      ).mockResolvedValueOnce({
        ...mockSubProduct,
        taskQuota: 50,
      });

      (SubscriptionStore.getTaskCount as jest.Mock).mockResolvedValueOnce(25);

      (SubscriptionStore.updateSubscription as jest.Mock).mockResolvedValueOnce(
        {
          ...mockSubscription,
          taskQuota: 24,
        },
      );

      const res = await SubscriptionService.handleSubscriptionQuota({
        companyId: mockCompany.id,
        isDecrement: true,
        quotaType: 'task',
      });

      expect(res).toEqual(24);

      jest.restoreAllMocks();
    });

    test('it should throw an error if there is not enough', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
        1,
      ) as SubscriptionModel;
      const mockCompany = serviceFixtures.generate(
        'company',
        1,
      ) as CompanyModel;

      const mockUser = serviceFixtures.generate('user', 1) as UserModel;

      const mockSubProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      ) as SubscriptionProductModel;

      (CompanyStore.getCompaniesById as jest.Mock).mockResolvedValueOnce(
        mockCompany,
      );
      (UserStore.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      jest
        .spyOn(SubscriptionService, 'getSubscriptionForCompanyId')
        .mockResolvedValue({
          ...mockSubscription,
          taskQuota: 0,
        });

      (
        SubscriptionStore.getSubscriptionPackagesById as jest.Mock
      ).mockResolvedValueOnce({
        ...mockSubProduct,
        taskQuota: 50,
      });

      (SubscriptionStore.getTaskCount as jest.Mock).mockResolvedValueOnce(50);

      (SubscriptionStore.updateSubscription as jest.Mock).mockResolvedValueOnce(
        {
          ...mockSubscription,
          taskQuota: -1,
        },
      );

      try {
        await SubscriptionService.handleSubscriptionQuota({
          companyId: mockCompany.id,
          isDecrement: true,
          quotaType: 'task',
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).toBe('You are out of quota for task.');
      }

      jest.restoreAllMocks();
    });

    test('it should change teamQuota from -5 to -4 if a team is deleted', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
        1,
      ) as SubscriptionModel;
      const mockCompany = serviceFixtures.generate(
        'company',
        1,
      ) as CompanyModel;

      const mockUser = serviceFixtures.generate('user', 1) as UserModel;

      const mockSubProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      ) as SubscriptionProductModel;

      (CompanyStore.getCompaniesById as jest.Mock).mockResolvedValueOnce(
        mockCompany,
      );
      (UserStore.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      jest
        .spyOn(SubscriptionService, 'getSubscriptionForCompanyId')
        .mockResolvedValue({
          ...mockSubscription,
          teamQuota: 0,
        });

      (
        SubscriptionStore.getSubscriptionPackagesById as jest.Mock
      ).mockResolvedValueOnce({
        ...mockSubProduct,
        teamQuota: 1,
      });

      (
        SubscriptionStore.getCompanyTeamCount as jest.Mock
      ).mockResolvedValueOnce(5);

      (SubscriptionStore.updateSubscription as jest.Mock).mockResolvedValueOnce(
        {
          ...mockSubscription,
          taskQuota: -4,
        },
      );

      const res = await SubscriptionService.handleSubscriptionQuota({
        companyId: mockCompany.id,
        quotaType: 'team',
      });

      expect(res).toEqual(-4);

      jest.restoreAllMocks();
    });

    test('it should change userQuota from -5 to -4 if a user is deleted', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
        1,
      ) as SubscriptionModel;
      const mockCompany = serviceFixtures.generate(
        'company',
        1,
      ) as CompanyModel;

      const mockUser = serviceFixtures.generate('user', 1) as UserModel;

      const mockSubProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      ) as SubscriptionProductModel;

      (CompanyStore.getCompaniesById as jest.Mock).mockResolvedValueOnce(
        mockCompany,
      );
      (UserStore.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      jest
        .spyOn(SubscriptionService, 'getSubscriptionForCompanyId')
        .mockResolvedValue({
          ...mockSubscription,
          userQuota: 0,
        });

      (
        SubscriptionStore.getSubscriptionPackagesById as jest.Mock
      ).mockResolvedValueOnce({
        ...mockSubProduct,
        userQuota: 1,
      });

      (
        SubscriptionStore.getCompanyUserCount as jest.Mock
      ).mockResolvedValueOnce(5);

      (SubscriptionStore.updateSubscription as jest.Mock).mockResolvedValueOnce(
        {
          ...mockSubscription,
          userQuota: -4,
        },
      );

      const res = await SubscriptionService.handleSubscriptionQuota({
        companyId: mockCompany.id,
        quotaType: 'user',
      });

      expect(res).toEqual(-4);

      jest.restoreAllMocks();
    });

    test('it should change invoiceQuota from -5 to -4 if a invoice is deleted', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
        1,
      ) as SubscriptionModel;
      const mockCompany = serviceFixtures.generate(
        'company',
        1,
      ) as CompanyModel;

      const mockUser = serviceFixtures.generate('user', 1) as UserModel;

      const mockSubProduct = serviceFixtures.generate(
        'subscriptionProduct',
        1,
      ) as SubscriptionProductModel;

      (CompanyStore.getCompaniesById as jest.Mock).mockResolvedValueOnce(
        mockCompany,
      );
      (UserStore.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      jest
        .spyOn(SubscriptionService, 'getSubscriptionForCompanyId')
        .mockResolvedValue({
          ...mockSubscription,
          userQuota: 0,
        });

      (
        SubscriptionStore.getSubscriptionPackagesById as jest.Mock
      ).mockResolvedValueOnce({
        ...mockSubProduct,
        invoiceQuota: 1,
      });

      (SubscriptionStore.getInvoiceCount as jest.Mock).mockResolvedValueOnce(5);

      (SubscriptionStore.updateSubscription as jest.Mock).mockResolvedValueOnce(
        {
          ...mockSubscription,
          invoiceQuota: -4,
        },
      );

      const res = await SubscriptionService.handleSubscriptionQuota({
        companyId: mockCompany.id,
        quotaType: 'invoice',
      });

      expect(res).toEqual(-4);

      jest.restoreAllMocks();
    });
  });
});
