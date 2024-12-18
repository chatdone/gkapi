// /* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import fixtures from '../../jest/fixtures';
import { faker } from '@faker-js/faker';
import { AttendanceStore } from '@data-access';
import { CompanyService, SocketService } from '@services';
import { AttendanceModel } from '@models/attendance.model';
import dayjs from 'dayjs';
import { createLoaders } from '@data-access';
import AttendanceService from './attendance.service';

jest.mock('@services');
jest.mock('@data-access');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    companyMembers: {
      load: jest.fn().mockImplementation(() => {
        return { id: 1, employee_type: 2, company_id: 1 };
      }),
    },
    employeeTypes: {
      load: jest.fn().mockImplementation(() => {
        return { id: 2, has_overtime: 1 };
      }),
    },
  })),
}));

describe('attendance.service', () => {
  const mockUser = fixtures.generate('user');

  describe('createAttendanceLabel', () => {
    test('it should create an attendance label', async () => {
      const mockInput = {
        companyId: faker.datatype.number(),
        name: faker.lorem.word(),
        color: faker.lorem.word(),
      };

      const expectedResult = fixtures.generate('attendanceLabel');

      (AttendanceStore.createAttendanceLabel as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const res = await AttendanceService.createAttendanceLabel(mockInput);

      expect(AttendanceStore.createAttendanceLabel).toBeCalledWith({
        companyId: mockInput.companyId,
        name: mockInput.name,
        color: mockInput.color,
      });
      expect(res).toEqual(expectedResult);
    });
  });

  describe('startAttendanceEntry', () => {
    test('it should start a new attendance', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;

      (
        AttendanceStore.getOpenAttendancesForCompanyMember as jest.Mock
      ).mockResolvedValue([]);

      (AttendanceStore.createAttendanceEntry as jest.Mock).mockResolvedValue(
        ma,
      );

      const spyStart = (
        SocketService.notifyAttendanceStarted as jest.Mock
      ).mockResolvedValue({
        user: mockUser,
      });

      jest
        .spyOn(AttendanceService, 'updateMemberDailySummary')
        .mockResolvedValue(undefined);
      const res = await AttendanceService.startAttendanceEntry({
        companyMemberId: 1,
        locationId: 1,
        labelId: 1,
        input: { type: 1, comments: '' },
        user: mockUser,
      });

      expect(AttendanceStore.getOpenAttendancesForCompanyMember).toBeCalledWith(
        { companyMemberId: 1 },
      );

      const locationId = 1;
      const labelId = 1;
      const input = { type: 1, comments: '' };

      expect(AttendanceStore.createAttendanceEntry).toBeCalledWith({
        payload: {
          company_member_id: 1,
          ...(locationId && { location_id: locationId }),
          ...(labelId && { attendance_label_id: labelId }),
          ...input,
        },
      });

      expect(spyStart).toHaveBeenCalledTimes(1);

      expect(res).toEqual(ma);

      jest.restoreAllMocks();
    });
  });

  describe('createWorkHourTotals', () => {
    test('it should get time within working hours', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 10:00:00`).toISOString(),
        end_date: dayjs(`2022-01-17 12:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: false,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });

      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 7200,
          start_date: dayjs(`2022-01-17 10:00:00`).toISOString(),
          end_date: dayjs(`2022-01-17 12:00:00`).toISOString(),
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 0,
            regular: 7200,
            tracked: 7200,
            worked: 7200,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });

    test('is within same day but worker started before start hours', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 08:00:00`).toISOString(),
        end_date: dayjs(`2022-01-17 10:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: false,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });
      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 7200,
          start_date: mockAtt.start_date,
          end_date: mockAtt.end_date,
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 0,
            regular: 3600,
            tracked: 7200,
            worked: 7200,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });

    test('is within same day but worker clocked out after end hours but has no overtime', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 10:00:00`).toISOString(),
        end_date: dayjs(`2022-01-17 20:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: false,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });

      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 36000,
          start_date: mockAtt.start_date,
          end_date: mockAtt.end_date,
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 0,
            regular: 28800,
            tracked: 36000,
            worked: 28800,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });

    test('is within same day but worker clocked out after end hours and has overtime', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 10:00:00`).toISOString(),
        end_date: dayjs(`2022-01-17 20:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: true,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });

      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 36000,
          start_date: mockAtt.start_date,
          end_date: mockAtt.end_date,
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 7200,
            regular: 28800,
            tracked: 36000,
            worked: 36000,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });

    test('is within same day but worker clocked in and out before start hours', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 07:00:00`).toISOString(),
        end_date: dayjs(`2022-01-17 08:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: false,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });

      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 3600,
          start_date: mockAtt.start_date,
          end_date: mockAtt.end_date,
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 0,
            regular: 0,
            tracked: 3600,
            worked: 3600,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });

    test('is within same day but worker clocked in and out after end hours and does not have OT', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 19:00:00`).toISOString(),
        end_date: dayjs(`2022-01-17 20:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: false,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });

      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 3600,
          start_date: mockAtt.start_date,
          end_date: mockAtt.end_date,
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 0,
            regular: 0,
            tracked: 3600,
            worked: 3600,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });

    test('is within same day but worker clocked in and out after end hours and has OT', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 19:00:00`).toISOString(),
        end_date: dayjs(`2022-01-17 20:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: true,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });

      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 3600,
          start_date: mockAtt.start_date,
          end_date: mockAtt.end_date,
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(1);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 3600,
            regular: 0,
            tracked: 3600,
            worked: 3600,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });

    test('started after end hour and ended the next day is not within working hours', async () => {
      const ma = fixtures.generate('attendance') as AttendanceModel;
      const mockAtt = {
        ...ma,
        company_member_id: 1,
        start_date: dayjs(`2022-01-17 23:00:00`).toISOString(),
        end_date: dayjs(`2022-01-18 01:00:00`).toISOString(),
      };

      (createLoaders().companyMembers.load as jest.Mock).mockResolvedValue({
        id: 1,
        employee_type: 2,
        company_id: 1,
      });

      (CompanyService.getWorkDaySettings as jest.Mock).mockResolvedValue([
        { start_hour: '09:00:00', end_hour: '18:00:00', day: 1 },
      ]);

      jest.spyOn(AttendanceService, 'getEmployeeType').mockResolvedValue({
        has_overtime: true,
        id: 1,
        company_id: 1,
        employee_type_id: 2,
        archived: false,
        name: 'whatever',
      });

      (AttendanceStore.getAttendances as jest.Mock).mockResolvedValue([
        {
          time_total: 3599,
          start_date: mockAtt.start_date,
          end_date: mockAtt.end_date,
          type: 1,
        },
      ]);

      const res = await AttendanceService.createWorkHourTotals({
        companyMemberId: mockAtt.company_member_id,
        latestAttendance: mockAtt,
      });

      expect(CompanyService.getWorkDaySettings).toBeCalledWith({
        employeeTypeId: 2,
      });

      expect(AttendanceStore.getAttendances).toBeCalledWith({
        fromDate: '2022-01-17 00:00:00',
        toDate: '2022-01-18 00:00:00',
        companyId: 1,
        companyMemberId: 1,
      });

      expect(res).toHaveLength(2);
      expect(res).toEqual(
        expect.arrayContaining([
          {
            day: 17,
            month: 1,
            overtime: 3599,
            regular: 0,
            tracked: 3599,
            worked: 3599,
            year: 2022,
          },
          {
            day: 18,
            month: 1,
            overtime: 3601,
            regular: 0,
            tracked: 3601,
            worked: 3601,
            year: 2022,
          },
        ]),
      );

      jest.restoreAllMocks();
    });
  });

  describe('getOvertimeFromAttendance', () => {
    test('it should get 2915 seconds overtime based on work schedule hours', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-14 16:44:03`).toISOString(),
        end_date: dayjs(`2022-04-14 17:32:38`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '06:30:00',
        end_hour: '11:00:00',
        open: 1,
        day: 4,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getOvertimeFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 4,
      });

      expect(res).toEqual(2915);
    });

    test('it should get 3600 seconds overtime even after end hours', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-11 18:00:00`).toISOString(),
        end_date: dayjs(`2022-04-11 19:00:00`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '09:00:00',
        end_hour: '18:00:00',
        open: 1,
        day: 1,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getOvertimeFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 1,
      });

      expect(res).toEqual(3600);

      jest.resetAllMocks();
    });

    test('it should get 0 seconds overtime if not allowed to work that day', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-11 18:00:00`).toISOString(),
        end_date: dayjs(`2022-04-11 19:00:00`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '09:00:00',
        end_hour: '18:00:00',
        open: 0,
        day: 1,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getOvertimeFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 1,
      });

      expect(res).toEqual(0);

      jest.resetAllMocks();
    });
  });

  // describe('hasOvertime', () => {
  //   test('it should return true if member has overtime', async () => {
  //     const res = await AttendanceService.hasOvertime(1);

  //     expect(res).toEqual(true);
  //   });
  // });

  describe('getWorkedFromAttendance', () => {
    test('it should get 3600 seconds worked based on work schedule hours', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-11 09:00:00`).toISOString(),
        end_date: dayjs(`2022-04-11 10:00:00`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '09:00:00',
        end_hour: '18:00:00',
        day: 1,
        open: 1,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getWorkedFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 1,
      });

      expect(res).toEqual(3600);

      jest.resetAllMocks();
    });

    test('it should return 0 seconds worked if it is after worked hours and have OT', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-11 18:00:00`).toISOString(),
        end_date: dayjs(`2022-04-11 19:00:00`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '09:00:00',
        end_hour: '18:00:00',
        day: 1,
        open: 1,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getWorkedFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 1,
      });

      expect(res).toEqual(0);

      jest.resetAllMocks();
    });

    test('it should return 3600 seconds worked if it is after worked hours and dont have OT', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-11 18:00:00`).toISOString(),
        end_date: dayjs(`2022-04-11 19:00:00`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '09:00:00',
        end_hour: '18:00:00',
        day: 1,
        open: 1,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(false);
      const res = await AttendanceService.getWorkedFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 1,
      });

      expect(res).toEqual(3600);

      jest.resetAllMocks();
    });

    test('it should return 3600 seconds worked if it is before worked hours', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-11 06:00:00`).toISOString(),
        end_date: dayjs(`2022-04-11 07:00:00`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '09:00:00',
        end_hour: '18:00:00',
        day: 1,
        open: 1,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getWorkedFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 1,
      });

      expect(res).toEqual(3600);

      jest.resetAllMocks();
    });

    test('it should return 39599 seconds worked if it is before worked hours', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-14 00:00:01`).toISOString(),
        end_date: dayjs(`2022-04-14 13:37:21`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '06:30:00',
        end_hour: '11:00:00',
        day: 4,
        open: 1,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getWorkedFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 4,
      });

      expect(res).toEqual(39599);

      jest.resetAllMocks();
    });

    test('it should return 3600 seconds worked if member is not working that day', async () => {
      const att = fixtures.generate('attendance');
      const attendance = {
        ...att,
        company_member_id: 1,
        start_date: dayjs(`2022-04-14 18:00:00`).toISOString(),
        end_date: dayjs(`2022-04-14 19:00:00`).toISOString(),
      };

      (CompanyService.getMemberWorkingHours as jest.Mock).mockResolvedValue({
        start_hour: '11:00:00',
        end_hour: '18:00:00',
        day: 4,
        open: 0,
      });
      jest.spyOn(AttendanceService, 'hasOvertime').mockResolvedValue(true);
      const res = await AttendanceService.getWorkedFromAttendance(attendance);

      expect(CompanyService.getMemberWorkingHours).toBeCalledWith({
        companyMemberId: 1,
        day: 4,
      });

      expect(res).toEqual(3600);

      jest.resetAllMocks();
    });
  });

  describe('getTotalTrackedHours', () => {
    test('it should return tracked hours total during clocked in', async () => {
      const mockAtt = fixtures.generate('attendance', 3) as AttendanceModel[];
      const attendances = mockAtt.map((att) => {
        return {
          ...att,
          type: 1,
          time_total: 2000,
          worked: 500,
          overtime: 1000,
        };
      });
      const res = await AttendanceService.getTotalTrackedHours(attendances);

      expect(res).toEqual({ tracked: 6000, worked: 1500, overtime: 3000 });
    });

    test('it should return tracked hours total during break', async () => {
      const mockAtt = fixtures.generate('attendance', 3) as AttendanceModel[];
      const attendances = mockAtt.map((att) => {
        return {
          ...att,
          type: 0,
          time_total: 2000,
          worked: 500,
          overtime: 1000,
        };
      });
      const res = await AttendanceService.getTotalTrackedHours(attendances);

      expect(res).toEqual({ tracked: 6000, worked: 0, overtime: 0 });

      jest.resetAllMocks();
    });

    test('it should return 0 if no attendances', async () => {
      const res = await AttendanceService.getTotalTrackedHours([]);

      expect(res).toEqual({ tracked: 0, worked: 0, overtime: 0 });

      jest.resetAllMocks();
    });
  });

  describe('getTotalTrackedHoursForWeekly', () => {
    test('it should return for weekly, tracked hours total during clocked in', async () => {
      const mockAtt = fixtures.generate('attendance', 3) as AttendanceModel[];

      const attendances = mockAtt.map((att, index) => {
        const day = index + 11;
        const startDate = `2022-04-${day} 15:00:00`;
        const endDate = `2022-04-${day} 15:33:20`;

        return {
          ...att,
          start_date: startDate,
          end_date: endDate,
          type: 1,
          time_total: 2000,
          worked: 500,
          overtime: 1000,
        };
      });
      const res = await AttendanceService.getTotalTrackedHoursForWeekly(
        attendances,
      );

      expect(res).toEqual({
        monday: 2000,
        tuesday: 2000,
        wednesday: 2000,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        tracked_total: 6000,
        worked_total: 1500,
        regular_total: 1500,
        overtime_total: 3000,
      });
    });
  });

  describe('getDateRange', () => {
    test('it should return an array of numbers with days, and the month and year', async () => {
      const res = await AttendanceService.getDateRange({
        fromDate: '2022-06-01',
        toDate: '2022-06-05',
      });
      expect(res).toEqual({ days: [1, 2, 3, 4, 5], month: 6, year: 2022 });
    });
  });

  // describe('groupAttendancesBasedOnWeekNumber', () => {
  //   test('it should return attendance grouped by week number', async () => {
  //     const mockAtt = fixtures.generate('attendance', 5) as AttendanceModel[];

  //     const attendances = mockAtt.map((att, index) => {
  //       const day = index + 16;

  //       // First and last day, I want to get a "natural" clock in and clock out, the rest are auto clock out/in
  //       const time = index === 0 || index === 4 ? '12:00:00' : `00:00:01`;
  //       const startDate = `2022-04-${day} ${time}`;
  //       const endDate = `2022-04-${day} 23:59:59`;

  //       return {
  //         ...att,
  //         start_date: startDate,
  //         end_date: endDate,
  //         type: 1,
  //         time_total: 86400,
  //         worked: 12000,
  //         overtime: 15000,
  //       };
  //     });

  //     const res = await AttendanceService.groupAttendancesBasedOnWeekNumber(
  //       attendances,
  //     );

  //     expect(res).toEqual('something');
  //   });
  // });
});
