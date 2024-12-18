import knex from 'knex';
import { getTracker, MockClient, Tracker } from 'knex-mock-client';
import { TableNames } from '@db-tables';
import fixtures from '@db-fixtures';
import MockDate from 'mockdate';

import { camelizeOnly as camelize } from '../utils';
import CompanyStore from './company.store';
import { CompanyPaymentMethodDbModel } from '@db-types';

jest.mock('@db/knex', () => {
  return knex({ client: MockClient });
});

// TODO: Rename after deprecating the old file
describe('company.store', () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = getTracker();
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('createcompanyPaymentMethod', () => {
    test('it should create a company payment option', async () => {
      const mockInput = {
        stripeCustomerId: 'cus_LZWByAJ6iA4YZJ',
        stripePaymentMethodId: 'pm_1J9Zy2LZWByAJ6iA4YZJ',
        companyId: 389,
        isDefault: true,
        userId: 346,
      };

      const mockPaymentMethod = fixtures.generate(
        'db.companyPaymentMethod',
        1,
      ) as CompanyPaymentMethodDbModel;

      tracker.on
        .insert(TableNames.COMPANY_PAYMENT_METHODS)
        .response([mockPaymentMethod.id]);
      tracker.on
        .select(TableNames.COMPANY_PAYMENT_METHODS)
        .response([mockPaymentMethod]);

      const res = await CompanyStore.createCompanyPaymentMethod(mockInput);

      const expectedResult = camelize(mockPaymentMethod);

      const history = tracker.history.insert;
      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('insert');
      expect(history[0].bindings).toEqual([
        389,
        346,
        true,
        'cus_LZWByAJ6iA4YZJ',
        'pm_1J9Zy2LZWByAJ6iA4YZJ',
        346,
        346,
      ]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('getcompanyPaymentMethods', () => {
    test('it should get company payment options', async () => {
      const mockInput = {
        companyId: 389,
      };

      const mockPaymentMethods = fixtures.generate(
        'db.companyPaymentMethod',
        4,
      ) as CompanyPaymentMethodDbModel;

      tracker.on
        .select(TableNames.COMPANY_PAYMENT_METHODS)
        .response(mockPaymentMethods);

      const res = await CompanyStore.getCompanyPaymentMethods(mockInput);

      const expectedResult = camelize(mockPaymentMethods);

      const history = tracker.history.select;
      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('select');
      expect(history[0].bindings).toEqual([389]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('deletecompanyPaymentMethod', () => {
    test('it should delete a company payment option', async () => {
      const mockInput = {
        stripePaymentMethodId: 'pm_1J9Zy2LZWByAJ6iA4YZJ',
        companyId: 389,
      };

      tracker.on.delete(TableNames.COMPANY_PAYMENT_METHODS).response(1);

      const res = await CompanyStore.deleteCompanyPaymentMethod(mockInput);

      const history = tracker.history.delete;
      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('delete');
      expect(history[0].bindings).toEqual([389, 'pm_1J9Zy2LZWByAJ6iA4YZJ']);

      expect(res).toEqual(1);
    });
  });

  describe('getCompanyDefaultPaymentMethod', () => {
    test('it should get the default company payment method', async () => {
      const mockInput = {
        companyId: 389,
      };

      const mockPaymentMethods = fixtures.generate(
        'db.companyPaymentMethod',
        4,
        [
          { is_default: false },
          { is_default: false },
          { is_default: true },
          { is_default: false },
        ],
      ) as CompanyPaymentMethodDbModel[];

      tracker.on
        .select(TableNames.COMPANY_PAYMENT_METHODS)
        .response([mockPaymentMethods[2]]);

      const res = await CompanyStore.getCompanyDefaultPaymentMethod(mockInput);

      const expectedResult = camelize(mockPaymentMethods[2]);

      const history = tracker.history.select;
      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('select');
      expect(history[0].bindings).toEqual([389, true]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('setCompanyDefaultPaymentOption', () => {
    test('it should set the default company payment option', async () => {
      const mockInput = {
        companyId: 389,
        stripePaymentMethodId: 'pm_1J9Zy2LZWByAJ6iA4YZJ',
        isDefault: true,
      };

      const mockPaymentMethod = fixtures.generate(
        'db.companyPaymentMethod',
        1,
      ) as CompanyPaymentMethodDbModel;

      tracker.on.update(TableNames.COMPANY_PAYMENT_METHODS).response(1);

      tracker.on
        .select(TableNames.COMPANY_PAYMENT_METHODS)
        .response([{ ...mockPaymentMethod, is_default: true }]);

      const res = await CompanyStore.setCompanyPaymentMethodIsDefault(
        mockInput,
      );

      const expectedResult = camelize({
        ...mockPaymentMethod,
        is_default: mockInput.isDefault,
      });

      const updateHistory = tracker.history.update;
      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].method).toEqual('update');
      expect(updateHistory[0].bindings).toEqual([
        true,
        389,
        'pm_1J9Zy2LZWByAJ6iA4YZJ',
      ]);

      const history = tracker.history.select;
      expect(history).toHaveLength(1);
      expect(history[0].method).toEqual('select');
      expect(history[0].bindings).toEqual([389, 'pm_1J9Zy2LZWByAJ6iA4YZJ']);

      expect(res).toEqual(expectedResult);
    });
  });
});
