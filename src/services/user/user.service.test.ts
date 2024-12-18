import { UserStore } from '@data-access';
import fixtures from '@test/fixtures';
import UserService from './user.service';
import _ from 'lodash';
import { UserOnboardingModel, UserViewOptionsModel } from '@models/user.model';
import { EmailService, StripeService } from '@services';

jest.mock('@data-access');
jest.mock('@services');
jest.mock('@tools/s3');
jest.mock('@tools/logger');
jest.mock('../../services/stripe/stripe.service');

describe('user.service', () => {
  const mockUser = fixtures.generate('user');
  describe('getUserViewOptions', () => {
    test('it should return a JSON object with the user view options', async () => {
      const mockInput = {
        userId: mockUser.id,
        currentUser: mockUser,
      };

      const mockResponse = fixtures.generate(
        'userViewOptions',
      ) as UserViewOptionsModel;

      (UserStore.getUserViewOptions as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await UserService.getUserViewOptions(mockInput);

      expect(UserStore.getUserViewOptions).toBeCalledWith({
        userId: mockUser.id,
      });
      expect(res).toEqual(mockResponse);
    });

    test('it should return an empty object if the requested user is not the current user', async () => {
      const mockInput = {
        userId: mockUser.id + 2,
        currentUser: mockUser,
      };

      const mockResponse = fixtures.generate(
        'userViewOptions',
      ) as UserViewOptionsModel;

      (UserStore.getUserViewOptions as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await UserService.getUserViewOptions(mockInput);

      expect(UserStore.getUserViewOptions).toBeCalledWith({
        userId: mockUser.id,
      });
      expect(res).toEqual({});
    });
  });

  describe('updateUserViewOptions', () => {
    test('it should update the user view options object', async () => {
      const mockInput = {
        userId: mockUser.id,
        currentUser: mockUser,
        payload: {
          homePageMode: 'list',
        },
      };

      const mockBaseOptions = fixtures.generate(
        'userViewOptions',
      ) as UserViewOptionsModel;

      const mockStoreInput = {
        ...mockBaseOptions,
        ...mockInput.payload,
      } as UserViewOptionsModel;

      (UserStore.getUserViewOptions as jest.Mock).mockResolvedValue(
        mockBaseOptions,
      );
      (UserStore.updateUserViewOptions as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const res = await UserService.updateUserViewOptions(mockInput);

      expect(UserStore.getUserViewOptions).toHaveBeenCalledWith({
        userId: mockUser.id,
      });

      expect(UserStore.updateUserViewOptions).toHaveBeenCalledWith({
        userId: mockUser.id,
        payload: mockStoreInput,
      });

      expect(res).toEqual(mockUser);
    });

    test('it should reject if the user is not the current user', async () => {
      const mockInput = {
        userId: mockUser.id + 23,
        currentUser: mockUser,
        payload: {
          homePageMode: 'list',
        },
      };

      const mockBaseOptions = fixtures.generate(
        'userViewOptions',
      ) as UserViewOptionsModel;

      (UserStore.getUserViewOptions as jest.Mock).mockResolvedValue(
        mockBaseOptions,
      );
      (UserStore.updateUserViewOptions as jest.Mock).mockResolvedValue(
        mockUser,
      );

      try {
        await UserService.updateUserViewOptions(mockInput);
      } catch (error) {
        expect((error as Error).message).toBe('Unauthorized');
        expect.assertions(1);
      }
    });
  });

  describe('getUserOnboarding', () => {
    test('it should return a JSON object with the user onboarding', async () => {
      const mockInput = {
        userId: mockUser.id,
        currentUser: mockUser,
      };

      const mockResponse = fixtures.generate(
        'userOnboarding',
      ) as UserOnboardingModel;

      (UserStore.getUserOnboarding as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await UserService.getUserOnboarding(mockInput);

      expect(UserStore.getUserOnboarding).toBeCalledWith({
        userId: mockUser.id,
      });
      expect(res).toEqual(mockResponse);
    });

    test('it should return an empty object if the requested user is not the current user', async () => {
      const mockInput = {
        userId: mockUser.id + 2,
        currentUser: mockUser,
      };

      const mockResponse = fixtures.generate(
        'userOnboarding',
      ) as UserOnboardingModel;

      (UserStore.getUserOnboarding as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await UserService.getUserOnboarding(mockInput);

      expect(UserStore.getUserOnboarding).toBeCalledWith({
        userId: mockUser.id,
      });
      expect(res).toEqual({});
    });
  });

  describe('updateUserViewOptions', () => {
    test('it should update the user onboarding object', async () => {
      const mockInput = {
        userId: mockUser.id,
        currentUser: mockUser,
        payload: {
          hasCompletedOnboarding: true,
        },
      };

      const mockBaseOptions = fixtures.generate(
        'userOnboarding',
      ) as UserOnboardingModel;

      const mockStoreInput = {
        ...mockBaseOptions,
        ...mockInput.payload,
      } as UserOnboardingModel;

      (UserStore.getUserOnboarding as jest.Mock).mockResolvedValue(
        mockBaseOptions,
      );
      (UserStore.updateUserOnboarding as jest.Mock).mockResolvedValue(mockUser);

      const res = await UserService.updateUserOnboarding(mockInput);

      expect(UserStore.getUserOnboarding).toHaveBeenCalledWith({
        userId: mockUser.id,
      });

      expect(UserStore.updateUserOnboarding).toHaveBeenCalledWith({
        userId: mockUser.id,
        payload: mockStoreInput,
      });

      expect(res).toEqual(mockUser);
    });

    test('it should reject if the user is not the current user', async () => {
      const mockInput = {
        userId: mockUser.id + 23,
        currentUser: mockUser,
        payload: {
          hasCompletedOnboarding: true,
        },
      };

      const mockBaseOptions = fixtures.generate(
        'userOnboarding',
      ) as UserOnboardingModel;

      (UserStore.getUserOnboarding as jest.Mock).mockResolvedValue(
        mockBaseOptions,
      );
      (UserStore.updateUserOnboarding as jest.Mock).mockResolvedValue(mockUser);

      try {
        await UserService.updateUserOnboarding(mockInput);
      } catch (error) {
        expect((error as Error).message).toBe('Unauthorized');
        expect.assertions(1);
      }
    });
  });
  describe('requestAccountDeletion', () => {
    test('it should send an email to support requesting account deletion', async () => {
      const mockInput = {
        user: mockUser,
        reason: `My cat hacked into my account and changed my logins and I can't get back in`,
        alternateEmail: `rasputin@boney.m`,
      };

      (EmailService.sendBasicEmail as jest.Mock).mockResolvedValue(true);

      const res = await UserService.requestAccountDeletion(mockInput);

      expect(EmailService.sendBasicEmail).toHaveBeenCalledWith({
        to: `ray@6biz.ai`,
        from: 'no-reply@gokudos.io',
        subject: `[System] Account Deletion Request <${mockUser.email}>`,
        text: `User ${mockUser.email} has requested their account be deleted. \n\nTheir reason for deletion is: ${mockInput.reason}. \n\nTheir alternate email is ${mockInput.alternateEmail}\n\nUser Id: ${mockUser.id}`,
      });

      expect(res).toEqual({
        success: true,
        message: `Account deletion requested. We will contact you at <${mockUser.email}> shortly. If you have any questions, please contact us at <support@gokudos.io>.`,
      });
    });
  });

  describe('createImageResizerBody', () => {
    test('it should return a body for the image resizer', () => {
      const destinationPath = 'images/sandbox/your-user-id/file-uuid.jpeg';
      const fileBuffer = Buffer.from(
        '/iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=',
        'base64',
      );
      const res = UserService.createImageResizerBody({
        destinationPath,
        bucketName: 'gokudos-dev-public',
        fileBuffer: fileBuffer,
      });

      expect(res).toEqual({
        bucket: 'gokudos-dev-public',
        env: 'sandbox',
        fileName: 'file-uuid',
        image:
          'data:image/jpeg;base64,/iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII',
        userId: 'your-user-id',
      });
    });
  });

  describe('getPaymentMethods', () => {
    test("if customerId is undefined, then call stripe to look for the user's customerId, then update user's customer_id, then returns payment method", async () => {
      const customer = await fixtures.generate('stripe');
      const customerResponse = { ...customer, id: 'cus_123' };
      const user = await fixtures.generate('user');
      const userResponse = { ...user, customer_id: 'cus_123' };
      const customerId = null;
      const email = 'barrynorris84@gmail.com';
      const userId = 1;
      const name = 'Barry Norris';

      (StripeService.getStripeId as jest.Mock).mockResolvedValue(
        customerResponse.id,
      );
      (UserStore.updateCustomerId as jest.Mock).mockResolvedValue(userResponse);
      (StripeService.getPaymentMethods as jest.Mock).mockResolvedValue({
        object: 'list',
        data: [
          {
            address: null,
            balance: 0,
            created: 1623829472,
            currency: 'myr',
            default_currency: 'myr',
            default_source: null,
            delinquent: false,
            description: null,
            discount: null,
            email: 'barrynoris84@gmail.com',
            id: 'cus_123',
            invoice_prefix: 'F1E3D52F',
            invoice_settings: {
              custom_fields: null,
              default_payment_method: null,
              footer: null,
              rendering_options: null,
            },
            livemode: false,
            metadata: {},
            name: 'Barry Noris',
            next_invoice_sequence: 284,
            object: 'customer',
            phone: null,
            preferred_locales: [],
            shipping: null,
            tax_exempt: 'none',
            test_clock: null,
          },
        ],
        has_more: false,
        url: `/v1/customers`,
      });
      const res = await UserService.getPaymentMethods({
        customerId,
        email,
        userId,
        name,
      });
      expect(StripeService.getStripeId).toBeCalledWith({ email });
      expect(UserStore.updateCustomerId).toBeCalledWith({
        userId,
        customerId: 'cus_123',
      });
      expect(StripeService.getPaymentMethods).toBeCalledWith('cus_123');

      expect(res).toEqual([
        {
          address: null,
          balance: 0,
          created: 1623829472,
          currency: 'myr',
          default_currency: 'myr',
          default_source: null,
          delinquent: false,
          description: null,
          discount: null,
          email: 'barrynoris84@gmail.com',
          id: 'cus_123',
          invoice_prefix: 'F1E3D52F',
          invoice_settings: {
            custom_fields: null,
            default_payment_method: null,
            footer: null,
            rendering_options: null,
          },
          livemode: false,
          metadata: {},
          name: 'Barry Noris',
          next_invoice_sequence: 284,
          object: 'customer',
          phone: null,
          preferred_locales: [],
          shipping: null,
          tax_exempt: 'none',
          test_clock: null,
        },
      ]);

      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    test("if customerId is undefined, then call stripe to look for the user's customerId, if there is no customer id, create a new customer and return payment methods", async () => {
      const customer = await fixtures.generate('stripe');
      const customerResponse = { ...customer, id: 'cus_123' };
      const user = await fixtures.generate('user');
      const userResponse = {
        ...user,
        customer_id: 'cus_123',
        name: 'Barry Norris',
      };
      const customerId = undefined;
      const email = 'barrynorris84@gmail.com';
      const userId = 1;
      const name = 'Barry Norris';

      (StripeService.getStripeId as jest.Mock).mockResolvedValue(customerId);
      (StripeService.createCustomer as jest.Mock).mockResolvedValue(
        customerResponse,
      );
      (UserStore.updateCustomerId as jest.Mock).mockResolvedValue(userResponse);
      (StripeService.getPaymentMethods as jest.Mock).mockResolvedValue({
        object: 'list',
        data: [
          {
            address: null,
            balance: 0,
            created: 1623829472,
            currency: 'myr',
            default_currency: 'myr',
            default_source: null,
            delinquent: false,
            description: null,
            discount: null,
            email: 'barrynoris84@gmail.com',
            id: 'cus_123',
            invoice_prefix: 'F1E3D52F',
            invoice_settings: {
              custom_fields: null,
              default_payment_method: null,
              footer: null,
              rendering_options: null,
            },
            livemode: false,
            metadata: {},
            name: 'Barry Noris',
            next_invoice_sequence: 284,
            object: 'customer',
            phone: null,
            preferred_locales: [],
            shipping: null,
            tax_exempt: 'none',
            test_clock: null,
          },
        ],
        has_more: false,
        url: `/v1/customers`,
      });
      const res = await UserService.getPaymentMethods({
        customerId,
        email,
        userId,
        name,
      });
      expect(StripeService.getStripeId).toBeCalledWith({ email });
      expect(StripeService.createCustomer).toBeCalledWith({
        email,
        name,
      });
      expect(UserStore.updateCustomerId).toBeCalledWith({
        userId,
        customerId: 'cus_123',
      });
      expect(StripeService.getPaymentMethods).toBeCalledWith('cus_123');
      expect(res).toEqual([
        {
          address: null,
          balance: 0,
          created: 1623829472,
          currency: 'myr',
          default_currency: 'myr',
          default_source: null,
          delinquent: false,
          description: null,
          discount: null,
          email: 'barrynoris84@gmail.com',
          id: 'cus_123',
          invoice_prefix: 'F1E3D52F',
          invoice_settings: {
            custom_fields: null,
            default_payment_method: null,
            footer: null,
            rendering_options: null,
          },
          livemode: false,
          metadata: {},
          name: 'Barry Noris',
          next_invoice_sequence: 284,
          object: 'customer',
          phone: null,
          preferred_locales: [],
          shipping: null,
          tax_exempt: 'none',
          test_clock: null,
        },
      ]);
      jest.resetAllMocks();
      jest.clearAllMocks();
    });
  });
});
