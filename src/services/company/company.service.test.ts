import { CompanyStore, SubscriptionStore } from '@data-access';
import fixtures from '@test/fixtures';
import { faker } from '@faker-js/faker';
import CompanyService, {
  PARENT_STATUSES,
  STATUS_STAGES,
} from './company.service';
import { CompanyModel, CompanyPaymentMethodModel } from '@models/company.model';
import { StripeService, UrlService } from '@services';
import { TaskId } from '@models/task.model';
import serviceFixtures from '@test/fixtures/service.fixtures';
import { UserModel } from '@models/user.model';
import {
  PaymentMethodModel,
  SubscriptionModel,
} from '@models/subscription.model';

jest.mock('@services');
jest.mock('@data-access');

describe('company.service', () => {
  describe('submitCompanyMemberVerificationImage', () => {
    test.todo('it should insert a new record');
    test.todo('it should invalidate the previous record');
  });

  describe('approveCompanyMemberVerificationImage', () => {
    test.todo(
      'it should throw an error if the company member does not have manager permissions',
    );
    test.todo('it should throw an error if the verification does not exist');
    test.todo(
      'it should throw an error if the verification is already approved',
    );
    test.todo('it should invalidate the previous image');
  });

  describe('rejectCompanyMemberVerificationImage', () => {
    test.todo('it should throw an error if the verification does not exist');
    test.todo(
      'it should throw an error if the verification is not pending approval',
    );
    test.todo('it should ');
  });

  describe('insertSlugForCompany', () => {
    test('it should insert slug for a company', async () => {
      const slug = 'abcd-1234'; //will be actual slug in the future
      const company = fixtures.generate('company');
      const mockCompany = {
        ...company,
        name: 'Techno Viking sdn. bhd.',
      } as CompanyModel;

      (UrlService.getShortId as jest.Mock).mockResolvedValue('abcd-1234');
      (CompanyStore.insertSlugForCompany as jest.Mock).mockResolvedValue({
        ...mockCompany,
        slug: 'abcd-1234',
      });

      const res = await CompanyService.insertSlugForCompany({
        company: mockCompany,
      });

      expect(CompanyStore.insertSlugForCompany).toBeCalledWith({
        companyId: mockCompany.id,
        slug,
      });

      expect(res).toEqual({ ...mockCompany, slug });
    });

    test.todo('it should check if the generate slug to be unique or not');
  });

  describe('setCompanyMemberReferenceImageStatus', () => {
    test('it should set the status for a company member', async () => {
      const mockInput = {
        companyId: faker.datatype.number(),
        companyMemberIds: [faker.datatype.number()],
        status: 1,
        userId: faker.datatype.number(),
        remark: '',
      };
      (
        CompanyStore.setCompanyMemberReferenceImageStatus as jest.Mock
      ).mockResolvedValue(fixtures.generate('companyMember'));

      await CompanyService.setCompanyMemberReferenceImageStatus(mockInput);

      const { companyId, ...expectedResult } = mockInput;

      expect(CompanyStore.setCompanyMemberReferenceImageStatus).toBeCalledWith(
        expectedResult,
      );
    });
  });

  describe('updateCompanyTeamStatus', () => {
    test('it should call store layer with correct parent_status according to the stage is PENDING', async () => {
      const userId = 4;
      const statusId = 1;
      const taskIds: TaskId[] = [];
      const payload = {
        team_id: 6,
        label: 'Test Status',
        percentage: 0,
        color: 'blank',
        stage: STATUS_STAGES.PENDING,
      };

      await CompanyService.updateCompanyTeamStatus({
        userId,
        payload,
        taskIds,
        statusId,
      });

      expect(CompanyStore.updateCompanyTeamStatus).toBeCalledWith({
        userId,
        payload: {
          ...payload,
          parent_status: PARENT_STATUSES.PENDING,
        },
        statusId,
        taskIds,
      });
    });

    test('it should call store layer with correct parent_status according to the stage is CLOSED', async () => {
      const mockCompanyStatusRow = fixtures.generate('teamStatus');
      const userId = 4;
      const statusId = 1;
      const taskIds: TaskId[] = [];
      const payload = {
        team_id: 6,
        label: 'Test Stage Done',
        percentage: 0,
        color: 'blank',
        stage: STATUS_STAGES.CLOSED,
      };

      await CompanyService.updateCompanyTeamStatus({
        userId,
        payload,
        statusId,
        taskIds,
      });

      expect(CompanyStore.updateCompanyTeamStatus).toBeCalledWith({
        userId,
        payload: {
          ...payload,
          parent_status: PARENT_STATUSES.DONE,
        },
        taskIds,
        statusId,
      });
    });
  });

  describe('createCompanyPaymentMethod', () => {
    const mockUser = serviceFixtures.generate('user') as UserModel;

    beforeEach(() => {
      (StripeService.searchCustomerEmail as jest.Mock).mockResolvedValue(null);

      (StripeService.createCustomer as jest.Mock).mockResolvedValue({
        id: 'cus_123',
      });
      (
        StripeService.attachPaymentMethodToCustomer as jest.Mock
      ).mockResolvedValue({
        id: 'pm_123',
      });
    });

    test('it should create a stripe customer if not existing', async () => {
      const mockPaymentMethod = serviceFixtures.generate(
        'companyPaymentMethod',
      );

      (CompanyStore.getCompanyPaymentMethods as jest.Mock).mockResolvedValue(
        [],
      );

      (CompanyStore.createCompanyPaymentMethod as jest.Mock).mockResolvedValue(
        mockPaymentMethod,
      );

      const res = await CompanyService.createCompanyPaymentMethod({
        user: mockUser,
        companyId: 123,
        stripePaymentMethodId: 'pm_123',
      });

      expect(StripeService.createCustomer).toBeCalledWith({
        email: mockUser.email,
        name: mockUser.name,
      });

      expect(StripeService.attachPaymentMethodToCustomer).toBeCalledWith({
        customerId: 'cus_123',
        paymentMethodId: 'pm_123',
      });

      expect(CompanyStore.createCompanyPaymentMethod).toBeCalledWith({
        companyId: 123,
        isDefault: true,
        userId: mockUser.id,
        stripeCustomerId: 'cus_123',
        stripePaymentMethodId: 'pm_123',
      });

      expect(res).toEqual(mockPaymentMethod);
    });
  });

  describe('getCompanyPaymentMethods', () => {
    test('it should return the payment options for a company', async () => {
      const mockPaymentMethods = serviceFixtures.generate(
        'companyPaymentMethod',
        4,
      ) as PaymentMethodModel[];

      (CompanyStore.getCompanyPaymentMethods as jest.Mock).mockResolvedValue(
        mockPaymentMethods,
      );
      (StripeService.getPaymentMethod as jest.Mock).mockResolvedValue({
        card: {},
      });

      const res = await CompanyService.getCompanyPaymentMethods({
        companyId: 346,
      });

      expect(CompanyStore.getCompanyPaymentMethods).toBeCalledWith({
        companyId: 346,
      });

      expect(res).toEqual(
        mockPaymentMethods.map((paymentMethod) => ({
          ...paymentMethod,
          card: {},
        })),
      );
    });
  });

  describe('deleteCompanyPaymentMethod', () => {
    const mockUser = serviceFixtures.generate('user') as UserModel;

    test('it should remove the stripe payment option and delete the db entry', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
      ) as SubscriptionModel;

      (
        SubscriptionStore.getSubscriptionForCompanyId as jest.Mock
      ).mockResolvedValue(mockSubscription);

      (StripeService.getSubscription as jest.Mock).mockResolvedValue({
        default_payment_method: 'pm_124 ',
      });
      (
        StripeService.detachPaymentMethodFromCustomer as jest.Mock
      ).mockResolvedValue({
        id: 'pm_123',
      });

      const mockPaymentMethod = serviceFixtures.generate(
        'companyPaymentMethod',
      );

      (CompanyStore.deleteCompanyPaymentMethod as jest.Mock).mockResolvedValue(
        mockPaymentMethod,
      );

      const res = await CompanyService.deleteCompanyPaymentMethod({
        user: mockUser,
        companyId: 123,
        stripePaymentMethodId: 'pm_123',
      });

      expect(StripeService.detachPaymentMethodFromCustomer).toBeCalledWith({
        paymentMethodId: 'pm_123',
      });

      expect(CompanyStore.deleteCompanyPaymentMethod).toBeCalledWith({
        companyId: 123,
        stripePaymentMethodId: 'pm_123',
      });

      expect(res).toEqual(mockPaymentMethod);
    });

    test('it should reject if trying to delete the current active payment method', async () => {
      const mockSubscription = serviceFixtures.generate(
        'subscription',
      ) as SubscriptionModel;

      (
        SubscriptionStore.getSubscriptionForCompanyId as jest.Mock
      ).mockResolvedValue(mockSubscription);

      (StripeService.getSubscription as jest.Mock).mockResolvedValue({
        default_payment_method: 'pm_777',
      });
      (
        StripeService.detachPaymentMethodFromCustomer as jest.Mock
      ).mockResolvedValue({
        id: 'pm_777',
      });

      const mockPaymentMethod = serviceFixtures.generate(
        'companyPaymentMethod',
      );

      (CompanyStore.deleteCompanyPaymentMethod as jest.Mock).mockResolvedValue(
        mockPaymentMethod,
      );

      try {
        const res = await CompanyService.deleteCompanyPaymentMethod({
          user: mockUser,
          companyId: 123,
          stripePaymentMethodId: 'pm_777',
        });
      } catch (error) {
        expect((error as Error).message).toEqual(
          'Cannot delete payment method as it is currently the active payment method for the company subscription',
        );
      }

      expect.assertions(1);
    });
  });

  describe('setDefaultCompanyPaymentMethod', () => {
    test('it should set the default payment option for a company', async () => {
      const mockPaymentMethods = serviceFixtures.generate(
        'companyPaymentMethod',
        3,
        [{ isDefault: false }, { isDefault: true }, { isDefault: false }],
      ) as CompanyPaymentMethodModel[];

      const mockSubscription = serviceFixtures.generate(
        'subscription',
      ) as SubscriptionModel;

      (
        CompanyStore.getCompanyDefaultPaymentMethod as jest.Mock
      ).mockResolvedValue(mockPaymentMethods[1]);

      (
        StripeService.updateSubscriptionPaymentMethod as jest.Mock
      ).mockResolvedValue(true);

      const mockInput = {
        companyId: 123,
        stripePaymentMethodId: mockPaymentMethods[2].stripePaymentMethodId,
      };

      (CompanyStore.setCompanyPaymentMethodIsDefault as jest.Mock)
        .mockResolvedValueOnce(mockPaymentMethods[1])
        .mockResolvedValueOnce({ ...mockPaymentMethods[2], isDefault: true });

      const res = await CompanyService.setDefaultCompanyPaymentMethod(
        mockInput,
      );

      expect(CompanyStore.getCompanyDefaultPaymentMethod).toBeCalledWith({
        companyId: 123,
      });

      expect(
        CompanyStore.setCompanyPaymentMethodIsDefault,
      ).toHaveBeenNthCalledWith(1, {
        companyId: mockInput.companyId,
        stripePaymentMethodId: mockPaymentMethods[1].stripePaymentMethodId,
        isDefault: false,
      });
      expect(
        CompanyStore.setCompanyPaymentMethodIsDefault,
      ).toHaveBeenNthCalledWith(2, {
        companyId: mockInput.companyId,
        stripePaymentMethodId: mockPaymentMethods[2].stripePaymentMethodId,
        isDefault: true,
      });

      expect(res).toEqual({ ...mockPaymentMethods[2], isDefault: true });
    });
  });
});
