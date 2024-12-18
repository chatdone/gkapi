import EventManagerService from './event-manager.service';
import mime from 'mime-types';
import { createLoaders } from '../../data-access/loaders';
import {
  collectionEventMock,
  mockAttachmentsResponseShort,
} from '../../jest/mockData/event-manager';
import s3 from '../../tools/s3';
import fixtures from '@test/fixtures/service.fixtures';
import { CompanyModel } from '../../models/company.model';
import { NOTIFICATION_TYPES as TYPES } from '../../services/notification/constant';

import {
  TimesheetModel,
  ActivityTrackerWeeklyModel,
} from '@models/timesheet.model';
import dayjs from 'dayjs';
import { TimesheetService, SubscriptionService, UrlService } from '@services';

jest.mock('@services');
jest.mock('mime-types');
jest.mock('@data-access');
jest.mock('../../tools/s3');
jest.mock('../../services/notification/constant');
jest.mock('../notification/notification.service');
jest.mock('../../data-access/notification/notification.store');
jest.mock('../../services/timesheet/timesheet.service');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    contactPics: {
      loadMany: jest.fn().mockImplementation((ids) => {
        return fixtures.generate('contactPic', ids.length);
      }),
    },
    timesheetActivities: {
      load: jest.fn().mockImplementation((ids) => {
        return { task_id: 120 };
      }),
    },
    companyMembers: {
      load: jest.fn().mockImplementation((ids) => {
        return { company_id: 420 };
      }),
    },
  })),
}));

describe('event-manager.service.ts', () => {
  describe('getCollectionConstants', () => {
    test('it should constants for collection created', async () => {
      const isResend = false;
      const overdue = false;
      const isCreate = true;
      const paymentType = 1;

      const companyMock = fixtures.generate('company', 1) as CompanyModel;

      (TYPES.COLLECTION_CREATED.toMessage as jest.Mock).mockResolvedValue(
        'GerardTest has created a receivable reminder "aaaa" with amount RM2.',
      );

      const res = await EventManagerService.getCollectionConstants({
        company: companyMock,
        data: collectionEventMock,
        isResend,
        isCreate,
        overdue,
        paymentType,
      });

      expect(TYPES.COLLECTION_CREATED.toMessage).toBeCalledWith({
        companyName: companyMock.name,
        collection: {
          title: collectionEventMock.title,
          payable_amount: collectionEventMock.payable_amount,
        },
      });

      expect(res).toEqual({
        type: 'CollectionCreated',
        templateId: 'd-7926aeaecaa942c2be8257785cdc95ab',
        message:
          'GerardTest has created a receivable reminder "aaaa" with amount RM2.',
      });
    });

    test('it should constants for SP collection on due', async () => {
      const isResend = false;
      const overdue = false;
      const isCreate = false;
      const paymentType = 1;

      const companyMock = fixtures.generate('company', 1) as CompanyModel;

      (TYPES.COLLECTION_DUE_SP.toMessage as jest.Mock).mockResolvedValue(
        'This is a reminder that SP for aaaa for RM2 is due on 26/11/2021. Kindly make the payment or ignore if the payment has been made.',
      );

      const res = await EventManagerService.getCollectionConstants({
        company: companyMock,
        data: collectionEventMock,
        isResend,
        isCreate,
        overdue,
        paymentType,
      });

      expect(TYPES.COLLECTION_DUE_SP.toMessage).toBeCalledWith(
        collectionEventMock,
      );

      expect(res).toEqual({
        message:
          'This is a reminder that SP for aaaa for RM2 is due on 26/11/2021. Kindly make the payment or ignore if the payment has been made.',
        templateId: 'd-64c24741c74b4c8cb1aa750e93b0bfd9',
        type: 'CollectionDueSp',
      });
    });

    test('it should constants for collection on due', async () => {
      const isResend = false;
      const overdue = false;
      const isCreate = false;
      const paymentType = 0;

      (TYPES.COLLECTION_DUE.toMessage as jest.Mock).mockResolvedValue(
        'This is a reminder that aaaa for RM2 is due on 26/11/2021. Please upload payment proof if the payment was made.',
      );
      const companyMock = fixtures.generate('company', 1) as CompanyModel;
      const res = await EventManagerService.getCollectionConstants({
        company: companyMock,
        data: collectionEventMock,
        isResend,
        isCreate,
        overdue,
        paymentType,
      });

      expect(TYPES.COLLECTION_DUE.toMessage).toBeCalledWith(
        collectionEventMock,
      );

      expect(res).toEqual({
        type: 'CollectionDue',
        templateId: 'd-64c24741c74b4c8cb1aa750e93b0bfd9',
        message:
          'This is a reminder that aaaa for RM2 is due on 26/11/2021. Please upload payment proof if the payment was made.',
      });
    });

    test('it should constants for SP collection overdue', async () => {
      const isResend = false;
      const overdue = true;
      const isCreate = false;
      const paymentType = 1;

      (TYPES.COLLECTION_OVERDUE_SP.toMessage as jest.Mock).mockResolvedValue(
        'aaaa for RM2 is overdue by 5 days. If payment has been made, please ignore this message.',
      );
      const companyMock = fixtures.generate('company', 1) as CompanyModel;
      const res = await EventManagerService.getCollectionConstants({
        company: companyMock,
        data: collectionEventMock,
        isResend,
        isCreate,
        overdue,
        paymentType,
      });

      expect(TYPES.COLLECTION_OVERDUE.toMessage).toBeCalledWith(
        collectionEventMock,
      );

      expect(res).toEqual({
        type: 'CollectionOverdue',
        templateId: 'd-da07ad5778d34a9aabaef2b4e7db2203',
        message:
          'aaaa for RM2 is overdue by 5 days. If payment has been made, please ignore this message.',
      });
    });

    test('it should constants for collection overdue', async () => {
      const isResend = false;
      const overdue = true;
      const isCreate = false;
      const paymentType = 0;

      (TYPES.COLLECTION_OVERDUE.toMessage as jest.Mock).mockResolvedValue(
        'aaaa for RM2 is overdue by 5 days. If the payment has already made, please upload payment proof.',
      );
      const companyMock = fixtures.generate('company', 1) as CompanyModel;
      const res = await EventManagerService.getCollectionConstants({
        company: companyMock,
        data: collectionEventMock,
        isResend,
        isCreate,
        overdue,
        paymentType,
      });

      expect(TYPES.COLLECTION_OVERDUE.toMessage).toBeCalledWith(
        collectionEventMock,
      );

      expect(res).toEqual({
        type: 'CollectionOverdue',
        templateId: 'd-da07ad5778d34a9aabaef2b4e7db2203',
        message:
          'aaaa for RM2 is overdue by 5 days. If the payment has already made, please upload payment proof.',
      });
    });
  });

  describe('getAttachments', () => {
    test('it should return an array of objs with filename, content and type', async () => {
      const attachmentParams = {
        fileName: 'sample.pdf',
        invoice: 'invoice/e1f81bf6-1a3a-4fef-9390-aaa62d24ef89.pdf',
      };

      (mime.lookup as jest.Mock).mockResolvedValue('application/pdf');

      (s3.getObjectFromS3 as jest.Mock).mockResolvedValue({
        AcceptRanges: 'bytes',
        LastModified: '2021-09-09T15:56:27.000Z',
        ContentLength: 3028,
        ETag: '"4b41a3475132bd861b30a878e30aa56a"',
        ContentType: 'application/octet-stream',
        Metadata: {},
        Body: 'Buffer here',
      });
      const res = await EventManagerService.getAttachments(attachmentParams);
      expect(res).toEqual(mockAttachmentsResponseShort);
    });
  });

  describe('handleQuotaConsume', () => {
    test('it should reduce quota on the used services', async () => {
      const mockServices = {
        sms: { notify: 0, quota: 274 },
        whatsApp: { notify: 0, quota: 475 },
        email: { notify: 1, quota: 437 },
        subscriptionId: 1,
      };

      const emailSentCount = 1;
      const whatsAppSentCount = 0;

      const companyId = 1;

      (SubscriptionService.consumeQuotas as jest.Mock).mockResolvedValue(1);

      const res = await EventManagerService.handleQuotaConsume({
        services: mockServices,
        emailSentCount,
        whatsAppSentCount,

        companyId,
      });

      const mockQuotasUpdated = {
        email_quota: mockServices.email.quota - emailSentCount,
        whatsApp_quota: mockServices.whatsApp.quota - whatsAppSentCount,
      };

      expect(SubscriptionService.consumeQuotas).toBeCalledWith({
        quotas: { ...mockQuotasUpdated, id: 1 },
        companyId,
      });

      expect(res).toEqual(mockQuotasUpdated);
    });
  });

  describe('getPeriodDuration', () => {
    test('it should get no duration if its not an instalment', async () => {
      const res = await EventManagerService.getPeriodDuration({
        remindType: 1,
        periodIds: `[1]`,
      });

      expect(res).toEqual('-');
    });
  });

  describe('getPicsToNotify', () => {
    test('it should return an empty array if input pic array is null', async () => {
      const notifyPics = null;

      // eslint-disable-next-line import/no-named-as-default-member
      (createLoaders().contactPics.loadMany as jest.Mock).mockResolvedValue([
        2,
      ]);

      const res = await EventManagerService.getPicsToNotify(notifyPics);

      expect(res).toHaveLength(0);
    });
    test('it should return an array of pics for a list of ids', async () => {
      const notifyPics = [12, 23];

      const res = await EventManagerService.getPicsToNotify(notifyPics);

      expect(res).toHaveLength(notifyPics.length);
    });
  });

  describe('getWeekNumbersInvolved', () => {
    // test('it return an array of week one number and its total only based on given timesheet', async () => {
    //   const mt = fixtures.generate('timesheet') as TimesheetModel;

    //   const mockTimesheet = {
    //     ...mt,
    //     start_date: dayjs('2022-01-06T12:00:00.000Z').toDate().toISOString(),
    //     end_date: dayjs('2022-01-08T13:00:00.000Z').toDate().toISOString(),
    //   };

    //   const mockDailies = [
    //     { id: 1, day: 6, month: 1, year: 2022, total: 4500 },
    //     { id: 2, day: 7, month: 1, year: 2022, total: 86400 },
    //     { id: 2, day: 8, month: 1, year: 2022, total: 1200 },
    //   ] as ActivityTrackerDailyModel[];

    //   const res = await EventManagerService.getWeekNumbersInvolved({
    //     timesheet: mockTimesheet,
    //     dailyActivityTrackers: mockDailies,
    //   });
    //   expect(res).toHaveLength(1);
    //   expect(res).toEqual(
    //     expect.arrayContaining([
    //       {
    //         monday: 0,
    //         tuesday: 0,
    //         wednesday: 0,
    //         thursday: 0,
    //         friday: 0,
    //         saturday: 0,
    //         sunday: 0,
    //         week_number: 1,
    //         year: 2022,
    //       },
    //     ]),
    //   );
    // });

    // test('it return an array of two week numbers and its total based on given timesheet', async () => {
    //   const mt = fixtures.generate('timesheet') as TimesheetModel;

    //   const mockTimesheet = {
    //     ...mt,
    //     start_date: dayjs('2022-01-06T12:00:00.000Z').toDate().toISOString(),
    //     end_date: dayjs('2022-01-11T13:00:00.000Z').toDate().toISOString(),
    //   };

    //   const mockDailies = [
    //     { id: 1, day: 6, month: 1, year: 2022, total: 4500 },
    //     { id: 2, day: 7, month: 1, year: 2022, total: 86400 },
    //     { id: 3, day: 8, month: 1, year: 2022, total: 86400 },
    //     { id: 4, day: 9, month: 1, year: 2022, total: 86400 },
    //     { id: 5, day: 10, month: 1, year: 2022, total: 86400 },
    //     { id: 6, day: 11, month: 1, year: 2022, total: 1200 },
    //   ] as ActivityTrackerDailyModel[];

    //   const res = await EventManagerService.getWeekNumbersInvolved({
    //     timesheet: mockTimesheet,
    //     dailyActivityTrackers: mockDailies,
    //   });
    //   expect(res).toHaveLength(2);
    //   expect(res).toEqual(
    //     expect.arrayContaining([
    //       {
    //         monday: 0,
    //         tuesday: 0,
    //         wednesday: 0,
    //         thursday: 4500,
    //         friday: 86400,
    //         saturday: 86400,
    //         sunday: 86400,
    //         week_number: 1,
    //         year: 2022,
    //       },
    //       {
    //         monday: 86400,
    //         tuesday: 1200,
    //         wednesday: 0,
    //         thursday: 0,
    //         friday: 0,
    //         saturday: 0,
    //         sunday: 0,
    //         week_number: 2,
    //         year: 2022,
    //       },
    //     ]),
    //   );
    // });

    // test('it return an array of three week numbers and its total based on given timesheet', async () => {
    //   const mt = fixtures.generate('timesheet') as TimesheetModel;

    //   const mockTimesheet = {
    //     ...mt,
    //     start_date: dayjs('2022-01-06T12:00:00.000Z').toDate().toISOString(),
    //     end_date: dayjs('2022-01-17T13:00:00.000Z').toDate().toISOString(),
    //   };

    //   const mockDailies = [
    //     { id: 1, day: 6, month: 1, year: 2022, total: 4500 },
    //     { id: 2, day: 7, month: 1, year: 2022, total: 86400 },
    //     { id: 3, day: 8, month: 1, year: 2022, total: 86400 },
    //     { id: 4, day: 9, month: 1, year: 2022, total: 86400 },
    //     { id: 5, day: 10, month: 1, year: 2022, total: 86400 },
    //     { id: 6, day: 11, month: 1, year: 2022, total: 86400 },
    //     { id: 7, day: 12, month: 1, year: 2022, total: 86400 },
    //     { id: 8, day: 13, month: 1, year: 2022, total: 86400 },
    //     { id: 9, day: 14, month: 1, year: 2022, total: 86400 },
    //     { id: 10, day: 15, month: 1, year: 2022, total: 86400 },
    //     { id: 11, day: 16, month: 1, year: 2022, total: 86400 },
    //     { id: 12, day: 17, month: 1, year: 2022, total: 1200 },
    //   ] as ActivityTrackerDailyModel[];

    //   const res = await EventManagerService.getWeekNumbersInvolved({
    //     timesheet: mockTimesheet,
    //     dailyActivityTrackers: mockDailies,
    //   });
    //   expect(res).toHaveLength(3);
    //   expect(res).toEqual(
    //     expect.arrayContaining([
    //       {
    //         monday: 0,
    //         tuesday: 0,
    //         wednesday: 0,
    //         thursday: 4500,
    //         friday: 86400,
    //         saturday: 86400,
    //         sunday: 86400,
    //         week_number: 1,
    //         year: 2022,
    //       },
    //       {
    //         monday: 86400,
    //         tuesday: 86400,
    //         wednesday: 86400,
    //         thursday: 86400,
    //         friday: 86400,
    //         saturday: 86400,
    //         sunday: 86400,
    //         week_number: 2,
    //         year: 2022,
    //       },
    //       {
    //         monday: 1200,
    //         tuesday: 0,
    //         wednesday: 0,
    //         thursday: 0,
    //         friday: 0,
    //         saturday: 0,
    //         sunday: 0,
    //         week_number: 3,
    //         year: 2022,
    //       },
    //     ]),
    //   );
    // });

    test('it should return array length 2', async () => {
      const mt = fixtures.generate('timesheet') as TimesheetModel;

      const mockTimesheet = {
        ...mt,
        start_date: dayjs('2022-04-08T12:00:00.000Z').toDate().toISOString(),
        end_date: dayjs('2022-04-11T13:00:00.000Z').toDate().toISOString(),
      };

      const mockDailies = [
        {
          id: 126,
          company_member_id: 1316,
          task_id: 5558,
          day: 8,
          month: 4,
          year: 2022,
          total: 74113,
          created_at: '2022-04-10T19:25:12.000Z',
          updated_at: '2022-04-10T19:25:12.000Z',
        },
        {
          id: 127,
          company_member_id: 1316,
          task_id: 5558,
          day: 9,
          month: 4,
          year: 2022,
          total: 86400,
          created_at: '2022-04-10T19:25:13.000Z',
          updated_at: '2022-04-10T19:25:13.000Z',
        },
        {
          id: 128,
          company_member_id: 1316,
          task_id: 5558,
          day: 10,
          month: 4,
          year: 2022,
          total: 86400,
          created_at: '2022-04-10T19:25:13.000Z',
          updated_at: '2022-04-10T19:25:13.000Z',
        },
        {
          id: 129,
          company_member_id: 1316,
          task_id: 5558,
          day: 11,
          month: 4,
          year: 2022,
          total: 12313,
          created_at: '2022-04-10T19:25:13.000Z',
          updated_at: '2022-04-10T19:25:13.000Z',
        },
      ];

      const res = await EventManagerService.getWeekNumbersInvolved({
        timesheet: mockTimesheet,
        dailyActivityTrackers: mockDailies,
      });
      expect(res).toHaveLength(2);
    });
  });

  describe('handleRecalculateActivityTrackerWeekly', () => {
    test('it should create weekly AT if it doesnt exists', async () => {
      const mt = fixtures.generate('timesheet') as TimesheetModel;

      const mockTimesheet = {
        ...mt,
        company_member_id: 1,
        start_date: dayjs('2021-01-04T12:00:00.000Z').toDate().toISOString(),
        end_date: dayjs('2021-01-05T13:00:00.000Z').toDate().toISOString(),
      };
      const days = [
        {
          day: 4,
          month: 1,
          year: 2022,
          id: 1,
          company_member_id: 1,
          task_id: 1,
          created_at: '',
          updated_at: '',
          total: 200,
        },
        {
          day: 5,
          month: 1,
          year: 2022,
          id: 2,
          company_member_id: 1,
          task_id: 1,
          created_at: '',
          updated_at: '',
          total: 200,
        },
      ];

      const mockMappedDaysToWeeks = [
        {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 4500,
          friday: 86400,
          saturday: 86400,
          sunday: 86400,
          week_number: 1,
          year: 2022,
        },
      ];

      jest
        .spyOn(EventManagerService, 'getWeekNumbersInvolved')
        .mockResolvedValue(mockMappedDaysToWeeks);

      const mockResult = {
        id: 17,
        company_member_id: 1,
        task_id: 170,
        week_number: 1,
        year: 2022,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 159095,
        friday: 259200,
        saturday: 259200,
        sunday: 259200,
        created_at: '2022-01-09T17:13:44.000Z',
        updated_at: '2022-01-09T17:20:31.000Z',
        total_weekly: 936695,
      };
      (
        TimesheetService.getActivityTimeSummaryByWeek as jest.Mock
      ).mockResolvedValue([{ company_member_id: 12 }]);

      (
        TimesheetService.createWeeklyActivityTrackerSummary as jest.Mock
      ).mockResolvedValue({ ...mockResult });

      const res =
        await EventManagerService.handleRecalculateActivityTrackerWeekly({
          dailyActivityTrackers: days,
          timesheet: { ...mockTimesheet, company_member_id: 1 },
          companyId: 1,
        });

      expect(TimesheetService.getActivityTimeSummaryByWeek).toBeCalledWith({
        payload: {
          company_member_id: 1,
          task_id: 1,
          week_number: 1,
          year: 2022,
        },
        companyId: 1,
      });

      expect(
        TimesheetService.createWeeklyActivityTrackerSummary,
      ).toBeCalledWith({
        payload: {
          company_member_id: 1,
          task_id: 1,
          ...mockMappedDaysToWeeks[0],
        },
      });
      const result = [
        {
          company_member_id: 1,
          created_at: '2022-01-09T17:13:44.000Z',
          friday: 259200,
          id: 17,
          monday: 0,
          saturday: 259200,
          sunday: 259200,
          task_id: 170,
          thursday: 159095,
          total_weekly: 936695,
          tuesday: 0,
          updated_at: '2022-01-09T17:20:31.000Z',
          wednesday: 0,
          week_number: 1,
          year: 2022,
        },
      ];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining(result));

      jest.restoreAllMocks();
    });

    test('it should update weekly AT if it exists', async () => {
      const mt = fixtures.generate('timesheet') as TimesheetModel;

      const mockTimesheet = {
        ...mt,
        id: 1,
        start_date: dayjs('2021-01-04T12:00:00.000Z').toDate().toISOString(),
        end_date: dayjs('2021-01-05T13:00:00.000Z').toDate().toISOString(),
      };
      const days = [
        {
          day: 4,
          month: 1,
          year: 2022,
          id: 1,
          company_member_id: 1,
          task_id: 1,
          created_at: '',
          updated_at: '',
          total: 200,
        },
        {
          day: 5,
          month: 1,
          year: 2022,
          id: 2,
          company_member_id: 1,
          task_id: 1,
          created_at: '',
          updated_at: '',
          total: 200,
        },
      ];

      const mockMappedDaysToWeeks = [
        {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 1200,
          friday: 0,
          saturday: 0,
          sunday: 0,
          week_number: 1,
          year: 2022,
        },
      ];

      jest
        .spyOn(EventManagerService, 'getWeekNumbersInvolved')
        .mockResolvedValue(mockMappedDaysToWeeks);

      const mockResult = {
        id: 17,
        company_member_id: 1,
        task_id: 170,
        week_number: 1,
        year: 2022,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 1200,
        friday: 0,
        saturday: 0,
        sunday: 0,
        created_at: '2022-01-09T17:13:44.000Z',
        updated_at: '2022-01-09T17:20:31.000Z',
        total_weekly: 2400,
      };
      (
        TimesheetService.getActivityTimeSummaryByWeek as jest.Mock
      ).mockResolvedValue([
        {
          company_member_id: 1,
          id: 1,
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 1200,
          friday: 0,
          saturday: 0,
          sunday: 0,
          week_number: 1,
          year: 2022,
        },
      ]);

      (
        TimesheetService.updateWeeklyTimesheetSummary as jest.Mock
      ).mockResolvedValue({ ...mockResult, thursday: 2400 });

      const res =
        await EventManagerService.handleRecalculateActivityTrackerWeekly({
          dailyActivityTrackers: days,
          timesheet: { ...mockTimesheet, company_member_id: 1 },
          companyId: 1,
        });

      expect(TimesheetService.getActivityTimeSummaryByWeek).toBeCalledWith({
        payload: {
          company_member_id: 1,
          task_id: 1,
          week_number: 1,
          year: 2022,
        },
        companyId: 1,
      });

      expect(TimesheetService.updateWeeklyTimesheetSummary).toBeCalledWith({
        weeklyTimesheetId: 1,
        payload: {
          company_member_id: 1,
          task_id: 1,
          ...mockMappedDaysToWeeks[0],
          thursday: 0,
          week_number: 1,
          year: 2022,
        },
      });
      const result = [
        {
          company_member_id: 1,
          created_at: '2022-01-09T17:13:44.000Z',
          friday: 0,
          id: 17,
          monday: 0,
          saturday: 0,
          sunday: 0,
          task_id: 170,
          thursday: 2400,
          total_weekly: 2400,
          tuesday: 0,
          updated_at: '2022-01-09T17:20:31.000Z',
          wednesday: 0,
          week_number: 1,
          year: 2022,
        },
      ];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining(result));

      jest.restoreAllMocks();
    });
  });

  describe('handleRecalculateActivityTrackerMonthly', () => {
    test('it should able to create monthly AT if it doesnt exists', async () => {
      const mws = fixtures.generate(
        'weeklyTimesheetMv',
        // 1,
      ) as ActivityTrackerWeeklyModel;

      const mockWeekly = {
        ...mws,
        task_id: 12,
        total_weekly: 2000,
        company_member_id: 1,
        week_number: 2,
        year: 2022,
      };

      const mockCreatedMonthly = {
        id: 1,
        company_member_id: 12,
        task_id: 12,
        week_number: 2,
        year: 2022,
        week_total: 2000,
        created_at: '',
        updated_at: '',
      };

      const mt = fixtures.generate('timesheet') as TimesheetModel;

      const mockTimesheet = {
        ...mt,
        id: 1,
        start_date: dayjs('2021-01-04T12:00:00.000Z').toDate().toISOString(),
        end_date: dayjs('2021-01-06T13:00:00.000Z').toDate().toISOString(),
      };

      (
        TimesheetService.getActivityTimeSummaryByMonth as jest.Mock
      ).mockResolvedValue([]);

      (
        TimesheetService.createMonthlyActivityTrackerSummary as jest.Mock
      ).mockResolvedValue(mockCreatedMonthly);

      const res =
        await EventManagerService.handleRecalculateActivityTrackerMonthly({
          weeklyTimeTracked: [mockWeekly],
          timesheet: mockTimesheet,
          companyId: 1,
        });
      expect(TimesheetService.getActivityTimeSummaryByMonth).toBeCalledWith({
        companyId: 1,
        query: {
          task_id: 12,
          company_member_id: 1,
          week_number: [2],
          year: 2022,
        },
      });

      expect(
        TimesheetService.createMonthlyActivityTrackerSummary,
      ).toBeCalledWith({
        payload: {
          company_member_id: 1,
          task_id: 12,
          week_number: 2,
          week_total: 2000,
          year: 2022,
        },
      });

      expect(res).toEqual([mockCreatedMonthly]);
    });

    test('it should able to update monthly AT if it does exists', async () => {
      const mws = fixtures.generate(
        'weeklyTimesheetMv',
        // 1,
      ) as ActivityTrackerWeeklyModel;

      const mockWeekly = {
        ...mws,
        task_id: 12,
        total_weekly: 2000,
        company_member_id: 1,
        week_number: 2,
        year: 2022,
      };

      const mockUpdatedMonthly = {
        id: 1,
        company_member_id: 12,
        task_id: 42,
        week_number: 2,
        year: 2022,
        week_total: 4000,
        created_at: '',
        updated_at: '',
      };

      const mockGetMonthly = {
        id: 1,
        company_member_id: 1,
        task_id: 42,
        week_number: 2,
        year: 2022,
        week_total: 2000,
        created_at: '',
        updated_at: '',
      };

      const mt = fixtures.generate('timesheet') as TimesheetModel;

      const mockTimesheet = {
        ...mt,
        id: 1,
        start_date: dayjs('2021-01-04T12:00:00.000Z').toDate().toISOString(),
        end_date: dayjs('2021-01-06T13:00:00.000Z').toDate().toISOString(),
      };

      (
        TimesheetService.getActivityTimeSummaryByMonth as jest.Mock
      ).mockResolvedValue([mockGetMonthly]);

      (
        TimesheetService.updateMonthlyTimesheetSummary as jest.Mock
      ).mockResolvedValue(mockUpdatedMonthly);

      const res =
        await EventManagerService.handleRecalculateActivityTrackerMonthly({
          weeklyTimeTracked: [mockWeekly],
          timesheet: mockTimesheet,
          companyId: 1,
        });
      expect(TimesheetService.getActivityTimeSummaryByMonth).toBeCalledWith({
        companyId: 1,
        query: {
          task_id: 12,
          company_member_id: 1,
          week_number: [2],
          year: 2022,
        },
      });

      expect(TimesheetService.updateMonthlyTimesheetSummary).toBeCalledWith({
        monthlyTimesheetId: 1,
        payload: {
          company_member_id: 1,
          task_id: 12,
          week_number: 2,
          week_total: 0,
          year: 2022,
        },
      });

      expect(res).toEqual([mockUpdatedMonthly]);
    });
  });

  // describe('remindClockInBeforeWorkStart', () => {
  //   test('it should send reminder to users 10 minutes before their working hours', async () => {
  //     const res = EventManagerService.remindClockInBeforeWorkStart();

  //     expect(res).toEqual(123);
  //   });
  // });
});
