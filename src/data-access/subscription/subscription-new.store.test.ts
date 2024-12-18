import knex from 'knex';
import { getTracker, MockClient, Tracker } from 'knex-mock-client';
import { TableNames } from '@db-tables';
import fixtures from '@db-fixtures';

import { camelizeOnly as camelize } from '../utils';
import SubscriptionStore from './subscription-new.store';
import {
  CompanyDbModel,
  SubscriptionDbModel,
  SubscriptionProductDbModel,
} from '@db-types';
import { SubscriptionModel } from '@models/subscription.model';

jest.mock('@db/knex', () => {
  return knex({ client: MockClient });
});

// TODO: Rename after deprecating the old file
describe('subscription-new.store', () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = getTracker();
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('createSubscriptionProduct', () => {
    test('it should create a subscription product', async () => {
      const mockInput = {
        name: 'Top 10 Doom Metal Bands',
        stripeProductId: 'prod_LZWByAJ6iA4YZJ',
        userId: 346,
      };

      const mockProduct = fixtures.generate(
        'db.subscriptionProduct',
        1,
      ) as SubscriptionProductDbModel;

      tracker.on
        .insert(TableNames.SUBSCRIPTION_PRODUCTS)
        .response([mockProduct.id]);
      tracker.on
        .select(TableNames.SUBSCRIPTION_PRODUCTS)
        .response([mockProduct]);

      const res = await SubscriptionStore.createSubscriptionProduct(mockInput);

      const expectedResult = camelize(mockProduct);

      const history = tracker.history.insert;
      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('insert');
      expect(history[0].bindings).toEqual([
        346, // created_by
        'Top 10 Doom Metal Bands', // name
        'prod_LZWByAJ6iA4YZJ', // stripe_product_id
        346, // updated_by
      ]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('updateSubscriptionProduct', () => {
    test('it should update a subscription product', async () => {
      const mockInput = {
        id: 234,
        name: 'Top 10 Doom Metal Bands',
        stripeProductId: 'prod_LZWByAJ6iA4YZJ',
        userId: 346,
      };

      const mockProduct = fixtures.generate(
        'db.subscriptionProduct',
        1,
      ) as SubscriptionProductDbModel;

      tracker.on
        .update(TableNames.SUBSCRIPTION_PRODUCTS)
        .response([mockProduct.id]);
      tracker.on
        .select(TableNames.SUBSCRIPTION_PRODUCTS)
        .response([mockProduct]);

      const res = await SubscriptionStore.updateSubscriptionProduct(mockInput);

      const expectedResult = camelize(mockProduct);

      const history = tracker.history.update;
      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('update');
      expect(history[0].bindings).toEqual([
        'Top 10 Doom Metal Bands', // name
        'prod_LZWByAJ6iA4YZJ', // stripe_product_id
        346, // updated_by
        234,
      ]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('getSubscriptionProducts', () => {
    test('it should return all subscription products if no ids are given', async () => {
      const mockProducts = fixtures.generate(
        'db.subscriptionProduct',
        3,
      ) as SubscriptionProductDbModel[];

      tracker.on
        .select(TableNames.SUBSCRIPTION_PRODUCTS)
        .response(mockProducts);

      const res = await SubscriptionStore.getSubscriptionProducts();

      const expectedResult = camelize(mockProducts);

      const selectHistory = tracker.history.select;
      expect(selectHistory).toHaveLength(1);
      expect(selectHistory[0].method).toEqual('select');
      expect(selectHistory[0].bindings).toEqual([]);

      expect(res).toEqual(expectedResult);
    });

    test('it should return the selected subscription products if ids are specified', async () => {
      const mockProducts = fixtures.generate(
        'db.subscriptionProduct',
        3,
      ) as SubscriptionProductDbModel[];

      tracker.on
        .select(TableNames.SUBSCRIPTION_PRODUCTS)
        .response([mockProducts[0], mockProducts[2]]);

      const res = await SubscriptionStore.getSubscriptionProducts({
        ids: [mockProducts[0].id, mockProducts[2].id],
      });

      const expectedResult = camelize([mockProducts[0], mockProducts[2]]);

      const history = tracker.history.select;

      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('select');
      expect(history[0].bindings).toEqual([
        mockProducts[0].id,
        mockProducts[2].id,
      ]);

      expect(res).toEqual(expectedResult);
    });

    test('it should return the selected subscription products if public ids are specified', async () => {
      const mockProducts = fixtures.generate(
        'db.subscriptionProduct',
        3,
      ) as SubscriptionProductDbModel[];

      tracker.on
        .select(TableNames.SUBSCRIPTION_PRODUCTS)
        .response([mockProducts[0], mockProducts[2]]);

      const res = await SubscriptionStore.getSubscriptionProducts({
        publicIds: [mockProducts[0].id_text, mockProducts[2].id_text],
      });

      const expectedResult = camelize([mockProducts[0], mockProducts[2]]);

      const history = tracker.history.select;

      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('select');
      expect(history[0].bindings).toEqual([
        mockProducts[0].id_text,
        mockProducts[2].id_text,
      ]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('getSubscription', () => {
    test('it should return the subscription', async () => {
      const mockSubscription = fixtures.generate('db.subscription', 1);

      const mockResult = camelize(mockSubscription) as SubscriptionModel;

      const spy = jest
        .spyOn(SubscriptionStore, 'batchGetSubscriptions')
        .mockResolvedValue([mockResult]);

      const res = await SubscriptionStore.getSubscriptionsById(
        (mockSubscription as SubscriptionDbModel).id,
      );

      expect(res).toEqual(camelize(mockSubscription));

      spy.mockRestore();
    });
  });
  describe('getSubscriptionForCompanyId', () => {
    test('it should return the subscription for a given company', async () => {
      const company = fixtures.generate('db.company', 1) as CompanyDbModel;
      const mockSubscription = fixtures.generate('db.subscription', 1);

      tracker.on.select(TableNames.SUBSCRIPTIONS).response([mockSubscription]);

      const res = await SubscriptionStore.getSubscriptionForCompanyId({
        companyId: company.id,
      });

      const expectedResult = camelize(mockSubscription);

      const history = tracker.history.select;

      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('select');
      expect(history[0].bindings).toEqual([company.id, 1]);

      expect(res).toEqual(expectedResult);
    });
  });
});
