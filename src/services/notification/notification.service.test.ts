// import _ from 'lodash';
// import NotificationStore from '@data-access/notifications/notification.store';
// import NotificationService from '.';

import { NotificationService } from '@services';
import dayjs from 'dayjs';
import MockDate from 'mockdate';
// jest.mock('@data-access/notifications/notification.store');
// jest.mock('knex');

describe('placeholder', () => {
  test('should be a placeholder', async () => {
    expect(true).toBe(true);
  });
});

describe('notification.service.js', () => {
  describe('isRemindedQuotaExceeded', () => {
    test('it should return true if lastRemind is within 24 hours of current datetime', async () => {
      MockDate.set('2022-04-07');
      const lastReminded = dayjs().hour(8).subtract(1, 'day').toISOString();

      const res = await NotificationService.isRemindedQuotaExceeded(
        lastReminded,
      );

      expect(res).toEqual(true);
    });

    test('it should return false if lastRemind is more than 24 hours after current datetime', async () => {
      MockDate.set('2022-04-07');
      const lastReminded = dayjs().hour(6).subtract(1, 'day').toISOString();

      const res = await NotificationService.isRemindedQuotaExceeded(
        lastReminded,
      );

      expect(res).toEqual(false);
    });

    test('it should return false if lastRemind is null', async () => {
      MockDate.set('2022-04-07');
      const lastReminded = null;

      const res = await NotificationService.isRemindedQuotaExceeded(
        lastReminded,
      );

      expect(res).toEqual(false);
    });
  });
});
