import { TimesheetStore } from '@data-access';
import {
  TimesheetModel,
  ActivityTrackerWeeklyModel,
  ActivityTrackerMonthlyModel,
} from '@models/timesheet.model';
import fixtures from '@test/fixtures';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import TimesheetService from './timesheet.service';
import _ from 'lodash';

jest.mock('@services');
jest.mock('@data-access');
jest.mock('@tools/logger');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    timesheetAttendances: {
      load: jest.fn().mockImplementation(() => {
        return fixtures.generate('timesheetAttendance');
      }),
    },
  })),
}));

describe('timesheet.service', () => {
  describe('createTimesheetEntry', () => {
    test('it should return all timesheets for selected company', async () => {
      const timesheetEntry = fixtures.generate(
        'timesheet',
        4,
      ) as TimesheetModel[];
      const companyMemberIds = timesheetEntry.map((ts) => ts.company_member_id);

      (
        TimesheetStore.getTimesheetsByCompanyMemberIds as jest.Mock
      ).mockResolvedValue(timesheetEntry);

      const res = await TimesheetService.getTimesheetsByCompanyMemberIds({
        companyMemberIds,
      });

      expect(TimesheetStore.getTimesheetsByCompanyMemberIds).toBeCalledWith({
        companyMemberIds,
      });

      expect(res).toEqual(timesheetEntry);
      jest.restoreAllMocks();
    });
    test('it should return all timesheet for selected company member', async () => {
      const companyMemberId = 4;
      let timesheetEntries = fixtures.generate(
        'timesheet',
        3,
      ) as TimesheetModel[];

      timesheetEntries = timesheetEntries.map((timesheet) => ({
        ...timesheet,
        company_member_id: companyMemberId,
      }));

      (
        TimesheetStore.getTimesheetByCompanyMemberId as jest.Mock
      ).mockResolvedValue(timesheetEntries);

      const res = await TimesheetService.getTimesheetByCompanyMemberId({
        companyMemberId,
      });

      expect(TimesheetStore.getTimesheetByCompanyMemberId).toHaveBeenCalledWith(
        { companyMemberId },
      );

      expect(res).toEqual(timesheetEntries);
      jest.resetAllMocks();
    });
  });

  describe('createTimesheet', () => {
    test('it should return all timesheets for selected company', async () => {
      const timesheetEntry = fixtures.generate(
        'timesheet',
        4,
      ) as TimesheetModel[];
      const companyMemberIds = timesheetEntry.map((ts) => ts.company_member_id);

      (
        TimesheetStore.getTimesheetsByCompanyMemberIds as jest.Mock
      ).mockResolvedValue(timesheetEntry);

      const res = await TimesheetService.getTimesheetsByCompanyMemberIds({
        companyMemberIds,
      });

      expect(TimesheetStore.getTimesheetsByCompanyMemberIds).toBeCalledWith({
        companyMemberIds,
      });

      expect(res).toEqual(timesheetEntry);
      jest.restoreAllMocks();
    });
    test('it should return all timesheet for selected company member', async () => {
      const companyMemberId = 4;
      let timesheetEntries = fixtures.generate(
        'timesheet',
        3,
      ) as TimesheetModel[];

      timesheetEntries = timesheetEntries.map((timesheet) => ({
        ...timesheet,
        company_member_id: companyMemberId,
      }));

      (
        TimesheetStore.getTimesheetByCompanyMemberId as jest.Mock
      ).mockResolvedValue(timesheetEntries);

      const res = await TimesheetService.getTimesheetByCompanyMemberId({
        companyMemberId,
      });

      expect(TimesheetStore.getTimesheetByCompanyMemberId).toHaveBeenCalledWith(
        { companyMemberId },
      );

      expect(res).toEqual(timesheetEntries);
      jest.resetAllMocks();
    });
    test('it should update a timesheet and return the updated timesheet', async () => {
      const timesheet = fixtures.generate('timesheet');
      const payload = { comments: 'This is a task for Max' };

      (TimesheetStore.updateTimesheet as jest.Mock).mockResolvedValue({
        ...timesheet,
        ...payload,
      });

      const res = await TimesheetService.updateTimesheet({
        timesheetId: timesheet.id,
        payload,
        companyId: 1,
      });

      expect(TimesheetStore.updateTimesheet).toHaveBeenCalledWith({
        timesheetId: timesheet.id,
        payload,
      });

      expect(res).toEqual({ ...timesheet, ...payload });
      jest.resetAllMocks();
    });

    test('it should throw an error if an active member with timesheet attempts to start a new one', async () => {
      const memberId = 2;
      const locationId = 3;

      const mockCreateTimesheetEntry = {
        start_date: dayjs().toISOString(),
      };

      //@ts-ignore
      const mockTimesheets = [{ end_date: undefined }] as TimesheetModel[];

      jest
        .spyOn(TimesheetService, 'getTimesheetByCompanyMemberId')
        .mockResolvedValue(mockTimesheets);
      try {
        await TimesheetService.createTimesheet({
          payload: {
            ...mockCreateTimesheetEntry,
            activity_id: 123,
            location_id: locationId,
            company_member_id: memberId,
          },
          task: { id: 1, actual_start: null },
          userId: 1,
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).toEqual(
          'Cannot start a new timesheet if there is an ongoing one',
        );
      }

      jest.restoreAllMocks();
    });

    // test.todo('it should update the timesheet archived status');
  });

  // describe('getActivityTimeSummaryByWeek', () => {
  //   test('it should get activity time summary by week', async () => {
  //     const mockWeeklyTimesheet = fixtures.generate(
  //       'weeklyTimesheetMv',
  //     ) as ActivityTrackerWeeklyModel;
  //     const memberId = 5;
  //     const taskId = 2;
  //     const week = 49;
  //     const year = 2021;
  //     const companyId = 12;

  //     (
  //       TimesheetStore.getActivityTimeSummaryByWeek as jest.Mock
  //     ).mockResolvedValue([mockWeeklyTimesheet]);

  //     (FilterService.Filter as jest.Mock).mockResolvedValue([
  //       mockWeeklyTimesheet,
  //     ]);

  //     const res = await TimesheetService.getActivityTimeSummaryByWeek({
  //       payload: {
  //         company_member_id: memberId,
  //         task_id: taskId,
  //         week_number: week,
  //         year,
  //       },
  //       companyId,
  //     });

  //     expect(TimesheetStore.getActivityTimeSummaryByWeek).toBeCalledWith({
  //       payload: {
  //         company_member_id: memberId,
  //         task_id: taskId,
  //         week_number: week,
  //         year,
  //       },
  //       companyId,
  //     });

  //     expect(FilterService.Filter).toBeCalledWith([mockWeeklyTimesheet], {
  //       company_id: companyId,
  //     });
  //     expect(res).toEqual([mockWeeklyTimesheet]);
  //   });
  // });
  // describe('getTimeTracked', () => {
  //   test('it should get time difference within a day', async () => {
  //     const tm = fixtures.generate('timesheet') as TimesheetModel;
  //     const timesheet = {
  //       ...tm,
  //       start_date: dayjs('2021-12-20T12:00:00.000Z').toISOString(),
  //       end_date: dayjs('2021-12-20T13:00:00.000Z').toISOString(),
  //     };

  //     const res = await TimesheetService.getTimeTracked({
  //       query: {
  //         start_date: timesheet.start_date,
  //         end_date: timesheet.end_date,
  //       },
  //     });

  //     expect(res).toEqual([{ total: 3600, day: 20, month: 12, year: 2021 }]);
  //   });

  //   test('it should get the time difference if end date is next day', async () => {
  //     const tm = fixtures.generate('timesheet') as TimesheetModel;
  //     const timesheet = {
  //       ...tm,
  //       start_date: dayjs('2021-12-20T12:00:00.000Z').toISOString(),
  //       end_date: dayjs('2021-12-21T12:00:00.000Z').toISOString(),
  //     };

  //     const res = await TimesheetService.getTimeTracked({
  //       query: {
  //         start_date: timesheet.start_date,
  //         end_date: timesheet.end_date,
  //       },
  //     });

  //     expect(res).toEqual([
  //       { total: 43199, day: 20, month: 12, year: 2021 },
  //       { total: 43200, day: 21, month: 12, year: 2021 },
  //     ]);
  //   });

  //   test('it should get the time difference if end date is over a day', async () => {
  //     const tm = fixtures.generate('timesheet') as TimesheetModel;
  //     const timesheet = {
  //       ...tm,
  //       start_date: dayjs('2021-12-20T12:00:00.000Z').toISOString(),
  //       end_date: dayjs('2021-12-24T12:00:00.000Z').toISOString(),
  //     };

  //     const res = await TimesheetService.getTimeTracked({
  //       query: {
  //         start_date: timesheet.start_date,
  //         end_date: timesheet.end_date,
  //       },
  //     });

  //     expect(res).toEqual([
  //       { total: 43199, day: 20, month: 12, year: 2021 },
  //       { total: 86400, day: 21, month: 12, year: 2021 },
  //       { total: 86400, day: 22, month: 12, year: 2021 },
  //       { total: 86400, day: 23, month: 12, year: 2021 },
  //       { total: 43200, day: 24, month: 12, year: 2021 },
  //     ]);
  //   });
  // });
});
