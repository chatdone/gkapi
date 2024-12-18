import { TemplateService } from '@services';
import MockDate from 'mockdate';

describe('template.service.ts', () => {
  describe('getNextCreateDateFromCronString', () => {
    test('it should return the correct date in UTC time for third week on thursday for cron in April 2022', async () => {
      MockDate.set('2022-04-01'); // To make sure it's April 2022
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 * * 4#3', // Third week on thursday
      );

      expect(res).toEqual('2022-04-20T16:00:00.000Z');
    });

    test('it should return the correct date in UTC time for second week on monday for cron in May 2022', async () => {
      MockDate.set('2022-05-01'); // To make sure it's May 2022
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 * * 1#2',
      );
      expect(res).toEqual('2022-05-08T16:00:00.000Z');
    });

    test('it should return the correct date in UTC time for last week on tuesday for cron in June 2022', async () => {
      MockDate.set('2022-06-15'); // To make sure it's May 2022
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 * * TUEL',
      );
      expect(res).toEqual('2022-06-27T16:00:00.000Z');
    });

    test('it should return the correct date in UTC time if first week on sunday for cron in January 2022', async () => {
      MockDate.set('2022-01-01');
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 * * SUN#1',
      );
      expect(res).toEqual('2022-01-01T16:00:00.000Z');
    });

    test('it should return the next UTC date for every week(weekly) on sunday based on cron in April 2022', async () => {
      MockDate.set('2022-04-01');
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 * * SUN',
      );
      expect(res).toEqual('2022-04-02T16:00:00.000Z');
    });

    test('it should return the next UTC date for every 2nd of month based on cron in April 2022', async () => {
      MockDate.set('2022-04-15');
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 2 * *',
      );
      expect(res).toEqual('2022-05-01T16:00:00.000Z');
    });

    test('it should return the next UTC date for yearly on 6th May based on cron in April 2022', async () => {
      MockDate.set('2022-04-15');
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 6 5 *',
      );
      expect(res).toEqual('2022-05-05T16:00:00.000Z');
    });

    test('it should return the next UTC date for daily', async () => {
      MockDate.set('2022-05-03T16:00:00.00Z');
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 * * *',
      );
      expect(res).toEqual('2022-05-04T16:00:00.000Z');
    });

    test('it should return the next UTC date for daily but skip weekends', async () => {
      MockDate.set('2022-07-08T16:00:00.00Z');
      const res = await TemplateService.getNextCreateDateFromCronString(
        '0 0 * * 1-5',
      );
      expect(res).toEqual('2022-07-10T16:00:00.000Z');
    });
  });

  describe('getRecurringSettingsByCronString', () => {
    test('it should return null if cronString is null', async () => {
      const res = await TemplateService.getRecurringSettingsByCronString(null);

      expect(res).toEqual(null);
    });
  });
});
