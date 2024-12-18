import { createLoaders } from '@data-access';
import { TaskBoardModel, TaskModel } from '@models/task.model';
import {
  TimesheetModel,
  ActivityTrackerWeeklyModel,
} from '@models/timesheet.model';
import { CompanyService, FilterService, TaskService } from '@services';

import fixtures from '@test/fixtures';
import dayjs from 'dayjs';
import MockDate from 'mockdate';
jest.mock('../../tools/logger');
jest.mock('../task/task.service');
jest.mock('../company/company.service');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    teamStatuses: {
      load: jest.fn().mockImplementation((ids) => {
        return { id: 1 };
      }),
    },
    taskMembers: {
      load: jest.fn().mockImplementation((ids) => {
        return { member_id: 69 };
      }),
    },
  })),
}));
describe('filter.service.ts', () => {
  describe('Filter', () => {
    const tl = fixtures.generate('task', 5);

    test('it should filter due_date according to date range', async () => {
      MockDate.set('2021-12-2');
      const taskList = tl.map((t: TaskModel) => {
        return { ...t, due_date: dayjs().subtract(10, 'day').toISOString() };
      });
      const mockTask = fixtures.generate('task');
      const tasks = [
        ...taskList,
        { ...mockTask, due_date: dayjs().add(1, 'day').toISOString() },
      ];

      const filterOptions = {
        date: {
          start_date: dayjs().toISOString(),
          end_date: dayjs().add(5, 'day').toISOString(),
        },
      };
      const res = await FilterService.Filter(tasks, filterOptions);
      const mockFiltered = tasks[5];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
      MockDate.reset();
    });

    test('it should be able to get overdue tasks', async () => {
      MockDate.set('2021-12-2');
      const taskList = tl.map((t: TaskModel) => {
        return { ...t, due_date: dayjs().add(10, 'day').toISOString() };
      });
      const mockTask = fixtures.generate('task');
      const tasks = [
        ...taskList,
        { ...mockTask, due_date: dayjs().subtract(10, 'day').toISOString() },
      ];

      const filterOptions = {
        date: {
          start_date: dayjs().toISOString(),
        },
      };
      const res = await FilterService.Filter(tasks, filterOptions);
      const mockFiltered = tasks[5];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
      MockDate.reset();
    });

    test('it should be able to filter by project type', async () => {
      const taskList = tl.map((t: TaskModel) => {
        return { ...t, board_type: 'Internal' };
      });
      const mockTask = fixtures.generate('task');
      const tasks = [...taskList, { ...mockTask, board_type: 'Collaboration' }];

      const filterOptions = {
        project_type: 'Collaboration',
      };

      const res = await FilterService.Filter(tasks, filterOptions);
      const mockFiltered = tasks[5];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
    });

    test('it should be able to filter projects by team statuses', async () => {
      const tl = fixtures.generate('task', 5);
      const taskList = tl.map((t: TaskModel) => {
        return { ...t, sub_status_id: 5 };
      });
      const mockTask = fixtures.generate('task');
      const tasks = [...taskList, { ...mockTask, sub_status_id: 1 }];

      const filterOptions = {
        team_status: {
          sub_status_id: 'aeiou',
        },
      };

      // eslint-disable-next-line import/no-named-as-default-member
      (createLoaders().teamStatuses.load as jest.Mock).mockResolvedValue({
        id: 1,
      });

      const res = await FilterService.Filter(tasks, filterOptions);
      const mockFiltered = tasks[5];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
    });

    test('it should be able to filter by assignees', async () => {
      const taskList = tl.map((t: TaskModel) => {
        return { ...t, id: 5 };
      });

      const mockTask = fixtures.generate('task');
      const tasks = [...taskList, { ...mockTask, id: 1 }];

      const filterOptions = {
        task_member: {
          member_id: 'aeiou',
        },
      };

      // eslint-disable-next-line import/no-named-as-default-member
      (createLoaders().taskMembers.load as jest.Mock).mockResolvedValue({
        member_id: 69,
      });

      (TaskService.getTaskMembers as jest.Mock).mockResolvedValue([
        { card_id: 1 },
      ]);

      const res = await FilterService.Filter(tasks, filterOptions);
      expect(TaskService.getTaskMembers).toBeCalledWith(69);
      const mockFiltered = tasks[5];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
    });

    test('it should filter weekly timesheets mv by week and year number', async () => {
      const wtm = fixtures.generate(
        'weeklyTimesheetMv',
        5,
      ) as ActivityTrackerWeeklyModel[];
      const weeklyTime = wtm.map((wt) => {
        return { ...wt, created_at: dayjs('2021-01-01') };
      });
      const mockWeeklyTimesheet = fixtures.generate('weeklyTimesheetMv');
      const weeklyTimesheets = [
        ...weeklyTime,
        { ...mockWeeklyTimesheet, created_at: dayjs('2021-12-25') },
      ];

      const filterOptions = {
        weekly_timesheet: {
          week: 52,
          year: 2021,
        },
      };
      const res = await FilterService.Filter(weeklyTimesheets, filterOptions);
      const mockFiltered = weeklyTimesheets[5];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
    });

    test('it should filter timesheet start date according to selected date', async () => {
      MockDate.set('2021-12-2');
      const tms = fixtures.generate('timesheet', 5);
      const mockTimesheets = tms.map((t: TimesheetModel) => {
        return { ...t, start_date: dayjs().subtract(10, 'day').toISOString() };
      });
      const mockTimesheet = fixtures.generate('timesheet');
      const timesheets = [
        ...mockTimesheets,
        { ...mockTimesheet, start_date: dayjs().add(1, 'day').toISOString() },
      ];

      const filterOptions = {
        selectedDate: dayjs('2021-12-03').toISOString(),
      };
      const res = await FilterService.Filter(timesheets, filterOptions);
      const mockFiltered = timesheets[5];

      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
      MockDate.reset();
    });

    test('it should get company members for weekly or monthly ATs', async () => {
      const tms = fixtures.generate('weeklyTimesheetMv', 5);
      let id = 2;
      const mockActivityTrackings = tms.map((t: ActivityTrackerWeeklyModel) => {
        const memberId = id + 1;
        id = memberId;
        return { ...t, company_member_id: memberId };
      });
      const mockTimesheet = fixtures.generate('weeklyTimesheetMv');
      const mockActivityTrackingMvs = [
        ...mockActivityTrackings,
        { ...mockTimesheet, company_member_id: 1 },
      ];

      const filterOptions = {
        company_id: 45,
      };

      (CompanyService.getCompanyMembers as jest.Mock).mockResolvedValue([
        { id: 1 },
      ]);

      const res = await FilterService.Filter(
        mockActivityTrackingMvs,
        filterOptions,
      );
      const mockFiltered = mockActivityTrackingMvs[5];

      expect(CompanyService.getCompanyMembers).toBeCalledWith(45);
      expect(res).toHaveLength(1);
      expect(res).toEqual(expect.arrayContaining([mockFiltered]));
    });
  });

  describe('filterPersonalTaskBoards', () => {
    test('it should filter taskboard only for the user', async () => {
      const userId = 1;
      const mockTaskboards = [
        { type: 'Personal', created_by: 2 },
        { type: 'Personal', created_by: 1 },
        { type: 'Collaboration', created_by: 2 },
      ] as TaskBoardModel[];

      const res = await FilterService.filterPersonalTaskBoards({
        userId,
        taskboards: mockTaskboards,
      });

      expect(res).toHaveLength(2);
      expect(res).toEqual(
        expect.arrayContaining([
          { type: 'Personal', created_by: 1 },
          { type: 'Collaboration', created_by: 2 },
        ]),
      );
    });
  });
});
