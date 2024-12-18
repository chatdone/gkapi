/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { faker } from '@faker-js/faker';
import { StripeService } from '@services';
import logger from '../../tools/logger';
import stripe from 'stripe';

jest.mock('../../tools/logger');

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      subscriptions: {
        create: jest.fn().mockResolvedValue({ id: faker.datatype.string() }),
      },
      customers: {
        list: jest.fn().mockResolvedValue({
          object: 'list',
          data: [
            {
              id: 'cus_mock',
              object: 'customer',
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
              phone: null,
              preferred_locales: [],
              shipping: null,
              tax_exempt: 'none',
              test_clock: null,
            },
            {
              id: 'cus_I6rw29I68FJr4S',
              object: 'customer',
              address: null,
              balance: 0,
              created: 1601368131,
              currency: 'myr',
              default_currency: 'myr',
              default_source: null,
              delinquent: false,
              description: null,
              discount: null,
              email: 'barrynoris84@gmail.com',
              invoice_prefix: '6D61B899',
              invoice_settings: {
                custom_fields: null,
                default_payment_method: null,
                footer: null,
                rendering_options: null,
              },
              livemode: false,
              metadata: {},
              name: 'Noris Barry',
              next_invoice_sequence: 115,
              phone: null,
              preferred_locales: [],
              shipping: null,
              tax_exempt: 'none',
              test_clock: null,
            },
          ],
          has_more: false,
          url: `/v1/customers`,
        }),
      },
    };
  });
});

describe('stripe.service', () => {
  test('it should be a placeholder', () => {
    expect(true).toBeTruthy();
  });
  // describe('createSubscription', () => {
  //   test('should create a subscription successfully without a promo code', async () => {
  //     const inputs = {
  //       customerId: faker.datatype.string(),
  //       priceId: faker.datatype.string(),
  //       defaultPaymentMethod: faker.datatype.string(),
  //     };
  //     const res = await StripeService.createSubscription(inputs);

  //     const expectedOptions = {
  //       customer: inputs.customerId,
  //       items: [{ price: inputs.priceId }],
  //       expand: ['latest_invoice.payment_intent'],
  //       default_payment_method: inputs.defaultPaymentMethod,
  //     };
  //     expect(stripe.subscriptions.create).toBeCalledWith(expectedOptions);
  //   });

  //   test('should create a subscription successfully with a promo code', async () => {
  //     const inputs = {
  //       customerId: faker.datatype.string(),
  //       priceId: faker.datatype.string(),
  //       defaultPaymentMethod: faker.datatype.string(),
  //       promoId: faker.datatype.string(),
  //     };
  //     const res = await StripeService.createSubscription(inputs);

  //     const expectedOptions = {
  //       customer: inputs.customerId,
  //       items: [{ price: inputs.priceId }],
  //       expand: ['latest_invoice.payment_intent'],
  //       default_payment_method: inputs.defaultPaymentMethod,
  //       promotion_code: inputs.promoId,
  //     };
  //     expect(stripe.subscriptions.create).toBeCalledWith(expectedOptions);
  //   });
  // });

  describe('getStripeId', () => {
    test('it should log unused customerIds', async () => {
      const email = 'barrynoris84@gmail.com';
      const customerId = 'cus_mock';
      const unusedCustomerId = 'cus_I6rw29I68FJr4S';
      const mockCustomers = {
        object: 'list',
        data: [
          {
            id: 'cus_mock',
            object: 'customer',
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
            phone: null,
            preferred_locales: [],
            shipping: null,
            tax_exempt: 'none',
            test_clock: null,
          },
          {
            id: 'cus_I6rw29I68FJr4S',
            object: 'customer',
            address: null,
            balance: 0,
            created: 1601368131,
            currency: 'myr',
            default_currency: 'myr',
            default_source: null,
            delinquent: false,
            description: null,
            discount: null,
            email: 'barrynoris84@gmail.com',
            invoice_prefix: '6D61B899',
            invoice_settings: {
              custom_fields: null,
              default_payment_method: null,
              footer: null,
              rendering_options: null,
            },
            livemode: false,
            metadata: {},
            name: 'Noris Barry',
            next_invoice_sequence: 115,
            phone: null,
            preferred_locales: [],
            shipping: null,
            tax_exempt: 'none',
            test_clock: null,
          },
        ],
        has_more: false,
        url: `/v1/customers`,
      };
      (stripe as jest.Mock).mockResolvedValue(mockCustomers);

      await StripeService.getStripeId({ email, customerId });
      expect(logger.logStripe).toBeCalledWith({
        email,
        payload: [unusedCustomerId],
      });
    });
  });
});
