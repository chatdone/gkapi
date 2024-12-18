import { createLoaders, TaskStore } from '@data-access';
import { DataLoaders } from '@models/common.model';
import { UserModel } from '@models/user.model';
import fixtures from '@test/fixtures';
import TaskService from './task.service';
import { faker } from '@faker-js/faker';
import {
  TaskBoardVisibilityModel,
  TaskStatusModel,
  ProjectModel,
  TaskModelRefactor as TaskModel,
} from '@models/task.model';
import _ from 'lodash';
import { CompanyStageType } from '@services/company/constant';
import MockDate from 'mockdate';
import serviceFixtures from '@test/fixtures/service.fixtures';
import { TASK_KANBAN_POSITION_BUFFER } from '@constants';

jest.mock('@services');
jest.mock('@data-access');
jest.mock('../../tools/logger');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    companyMembers: {
      loadMany: jest.fn().mockImplementation((ids) => {
        return [undefined, fixtures.generate('companyMember')];
      }),
    },
    contactPics: {
      loadMany: jest.fn().mockImplementation((ids) => {
        return [undefined, fixtures.generate('contactPic')];
      }),
    },
    teamStatuses: {
      load: jest.fn().mockImplementation((id) => {
        return [undefined, fixtures.generate('teamStatus')];
      }),
    },
  })),
}));

export enum TaskBoardType {
  All = 'ALL',
  Collaboration = 'COLLABORATION',
  Company = 'COMPANY',
  Internal = 'INTERNAL',
  Personal = 'PERSONAL',
}

describe('task.test.ts', () => {
  describe('createTask', () => {
    const loaders: DataLoaders = createLoaders();
    const user = fixtures.generate('user') as UserModel;

    // test.skip('it should throw an error if start date does not have an end date', async () => {
    //   try {
    //     const mockCreateTask = {
    //       name: 'Mock task',
    //       startDate: new Date().toString(),
    //       endDate: undefined,
    //       createdBy: 1,
    //       jobId: 1,
    //     };

    //     await TaskService.createTask({
    //       loaders,
    //       payload: { ...mockCreateTask },
    //       user,
    //       memberIds: [],
    //     });
    //   } catch (error) {
    //     const err = error as Error;
    //     expect(err.message).toEqual('Start date should also have an end date');
    //   }
    // });

    // test.skip('it should throw an error if end date does not have a start date', async () => {
    //   const mockCreateTask = {
    //     name: 'Mock task',
    //     startDate: undefined,
    //     endDate: new Date().toString(),
    //     createdBy: 1,
    //     jobId: 1,
    //   };

    //   try {
    //     await TaskService.createTask({
    //       loaders,
    //       payload: { ...mockCreateTask },
    //       user,
    //       memberIds: [],
    //     });
    //   } catch (error) {
    //     const err = error as Error;
    //     expect(err.message).toEqual('End date should also have a start date');
    //   }
    // });
  });

  describe('addTaskMembersForCreateTask', () => {
    test('it should throw an error if one or more company members return undefined', async () => {
      const task = fixtures.generate('task');
      const memberIds = ['abcd', 'aeiou'];
      const user = fixtures.generate('user');
      const loaders: DataLoaders = createLoaders();

      // eslint-disable-next-line import/no-named-as-default-member
      (createLoaders().companyMembers.loadMany as jest.Mock).mockResolvedValue([
        undefined,
      ]);

      try {
        await TaskService.addTaskMembersForCreateTask({
          task,
          memberIds,
          user,
          loaders,
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).toEqual(
          'One or more company members does not exist',
        );
      }
    });
  });

  describe('addTaskPicsForCreateTask', () => {
    test('it should throw an error if one or more contact PICs return undefined', async () => {
      const task = fixtures.generate('task');
      const picIds = ['abcd', 'aeiou'];
      const user = fixtures.generate('user');
      const loaders: DataLoaders = createLoaders();

      // eslint-disable-next-line import/no-named-as-default-member
      (createLoaders().contactPics.loadMany as jest.Mock).mockResolvedValue([
        undefined,
      ]);

      try {
        await TaskService.addTaskPicsForCreateTask({
          task,
          picIds,
          user,
          loaders,
        });
      } catch (error) {
        const err = error as Error;
        expect(err.message).toEqual('One or more PICs does not exists');
      }
    });
  });

  describe('startTaskTimer', () => {
    test('it should reject if there is a running timer', async () => {
      const mockInput = {
        taskId: faker.datatype.number(),
        companyMemberId: faker.datatype.number(),
      };

      (TaskStore.getOpenTaskTimers as jest.Mock).mockResolvedValue([
        {
          ...fixtures.generate('taskTimerEntry'),
          company_member_id: mockInput.companyMemberId,
        },
      ]);

      try {
        const res = await TaskService.startTaskTimer(mockInput);
      } catch (error) {
        expect((error as Error).message).toBe(
          'Member already has a timer running',
        );
      }

      expect(TaskStore.getOpenTaskTimers).toBeCalledWith({
        taskId: mockInput.taskId,
      });
    });

    test('it should create a timer entry', async () => {
      const mockInput = {
        taskId: faker.datatype.number(),
        companyMemberId: faker.datatype.number(),
      };

      const expectedResult = fixtures.generate('taskTimerEntry');
      (TaskStore.getOpenTaskTimers as jest.Mock).mockResolvedValue([]);
      (TaskStore.createTaskTimerEntry as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const res = await TaskService.startTaskTimer(mockInput);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('stopTaskTimer', () => {
    test('it should reject if there are no running timers', async () => {
      const mockInput = {
        taskId: faker.datatype.number(),
        companyMemberId: faker.datatype.number(),
      };

      const expectedResult = fixtures.generate('taskTimerEntry');
      (TaskStore.getOpenTaskTimers as jest.Mock).mockResolvedValue([]);

      try {
        const res = await TaskService.stopTaskTimer(mockInput);
      } catch (error) {
        expect((error as Error).message).toBe(
          'Member does not have a timer running',
        );
      }
    });

    test('it should close the running timer', async () => {
      const mockInput = {
        taskId: faker.datatype.number(),
        companyMemberId: faker.datatype.number(),
      };

      const expectedResult = fixtures.generate('taskTimerEntry');
      (TaskStore.getOpenTaskTimers as jest.Mock).mockResolvedValue([
        { ...expectedResult, company_member_id: mockInput.companyMemberId },
      ]);
      (TaskStore.closeTaskTimerEntry as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const res = await TaskService.stopTaskTimer(mockInput);

      expect(res).toEqual(expectedResult);
    });
  });

  /* THIS SECTION TEMPORARY DISABLED BY ENOCH BUT DON'T DELETE K THX BAI */

  // describe('getByCompanyId', () => {
  //   test('it should filter taskboards that has the same userId with createdBy for Personal taskboards', async () => {
  //     const tb = fixtures.generate('taskBoard') as TaskBoardModel;
  //     const mockTaskBoard = { ...tb, type: 'Personal', created_by: 1 };

  //     const tb2 = fixtures.generate('taskBoard') as TaskBoardModel;
  //     const mockTaskBoard2 = { ...tb2, type: 'Collaboration' };

  //     const tbs = fixtures.generate('taskBoard', 5) as TaskBoardModel[];

  //     const mockTbs = _.map(tbs, (tb) => {
  //       return { ...tb, type: 'Personal', created_by: 2 };
  //     });

  //     const mockTaskBoards = [mockTaskBoard, mockTaskBoard2, ...mockTbs];

  //     (TaskStore.getByCompanyId as jest.Mock).mockResolvedValue(mockTaskBoards);

  //     const spy = jest
  //       .spyOn(TaskService, 'filterVisibleBoards')
  //       .mockResolvedValue(mockTaskBoards);

  //     const res = await TaskService.getByCompanyId({
  //       taskType: TaskBoardType.All,
  //       userId: 1,
  //       companyId: 1,
  //       payload: { company_id: 1 },
  //     });

  //     expect(TaskStore.getByCompanyId).toBeCalledWith({
  //       taskType: TaskBoardType.All,
  //       payload: { company_id: 1 },
  //     });

  //     expect(res).toHaveLength(2);
  //     expect(res).toEqual(
  //       expect.arrayContaining([mockTaskBoard, mockTaskBoard2]),
  //     );

  //     spy.mockRestore();
  //   });
  // });

  // describe('filterVisibleBoards', () => {
  //   const mockUserId = 2;
  //   const mockCompanyId = 77;
  //   beforeEach(() => {
  //     (
  //       CompanyStore.getMemberByUserIdAndCompanyId as jest.Mock
  //     ).mockResolvedValue({ id: 45 });
  //     (CompanyStore.getCompanyTeamsByUserId as jest.Mock).mockResolvedValue([
  //       { id: 1 },
  //       { id: 2 },
  //     ]);
  //     (TaskStore.getTeamsForTaskBoardIds as jest.Mock).mockResolvedValue([
  //       { jobId: 1, teamId: 2 },
  //       { jobId: 2, teamId: 2 },
  //     ]);
  //     (TaskStore.getOwnersForTaskBoardIds as jest.Mock).mockResolvedValue([
  //       { jobId: 1 },
  //       { companyMemberId: 2 },
  //     ]);
  //     (TaskStore.getVisibilityForTaskBoardIds as jest.Mock).mockResolvedValue([
  //       { boardId: 1, memberId: 45 },
  //       { boardId: 2, teamId: 1 },
  //     ]);
  //   });

  //   test('it should filter out boards that are not visible', async () => {
  //     const mockInput = fixtures.generate('taskBoard', 3);
  //     const spy = jest
  //       .spyOn(TaskService, 'isBoardVisible')
  //       .mockReturnValueOnce(true)
  //       .mockReturnValueOnce(false)
  //       .mockReturnValueOnce(true);

  //     const res = await TaskService.filterVisibleBoards({
  //       boards: mockInput,
  //       userId: mockUserId,
  //       companyId: mockCompanyId,
  //     });

  //     expect(res.length).toBe(2);

  //     spy.mockRestore();
  //   });

  //   afterEach(() => {
  //     jest.restoreAllMocks();
  //   });
  // });

  /* END SECTION TEMPORARY DISABLED */

  describe('isMemberAssignedToBoard', () => {
    test('it should return true if member is creator of the board', () => {
      const mockUserId = 45;
      const mockMemberId = 87;

      const mockBoard = fixtures.generateCustom('taskBoard', {
        createdBy: mockUserId,
      });
      const mockInput = {
        board: mockBoard,
        userId: mockUserId,
        boardOwners: [],
        companyMemberId: mockMemberId,
        userTeamIds: [23],
        boardTeamIds: [],
      };

      const res = TaskService.isMemberAssignedToBoard(mockInput);

      expect(res).toBe(true);
    });

    test('it should return true if member is one of the board owners', () => {
      const mockUserId = 45;
      const mockMemberId = 87;

      const mockBoard = fixtures.generateCustom('taskBoard', {
        createdBy: 8888,
      });
      const mockBoardOwner = {
        jobId: mockBoard.id,
        companyMemberId: mockMemberId,
      };
      const mockInput = {
        board: mockBoard,
        userId: mockUserId,
        boardOwners: [mockBoardOwner],
        companyMemberId: mockMemberId,
        userTeamIds: [23],
        boardTeamIds: [89],
      };

      const res = TaskService.isMemberAssignedToBoard(mockInput);

      expect(res).toBe(true);
    });

    test('it should return true if member is in one of the teams assigned to the board', () => {
      const mockUserId = 45;
      const mockMemberId = 87;

      const mockBoard = fixtures.generateCustom('taskBoard', {
        createdBy: 8888,
      });
      const mockInput = {
        board: mockBoard,
        userId: mockUserId,
        boardOwners: [],
        companyMemberId: mockMemberId,
        userTeamIds: [23, 87, 923],
        boardTeamIds: [87, 34],
      };

      const res = TaskService.isMemberAssignedToBoard(mockInput);

      expect(res).toBe(true);
    });

    test('it should return false if member is not assigned to the board in any way', () => {
      const mockUserId = 45;
      const mockMemberId = 87;

      const mockBoard = fixtures.generateCustom('taskBoard', {
        createdBy: 8888,
      });

      const mockOwners = [
        {
          jobId: mockBoard.id,
          companyMemberId: 229,
        },
        {
          jobId: mockBoard.id,
          companyMemberId: 28,
        },
      ];

      const mockInput = {
        board: mockBoard,
        userId: mockUserId,
        boardOwners: mockOwners,
        companyMemberId: mockMemberId,
        userTeamIds: [23, 87, 923],
        boardTeamIds: [34, 227],
      };

      const res = TaskService.isMemberAssignedToBoard(mockInput);

      expect(res).toBe(false);
    });
  });

  describe('isMemberSpecificVisibleOnBoard', () => {
    test('it should return true if member is the creator of the board', () => {
      const mockUserId = 45;
      const mockMemberId = 87;

      const mockBoard = fixtures.generateCustom('taskBoard', {
        createdBy: mockUserId,
      });

      const mockVisibility: TaskBoardVisibilityModel[] = [];
      const mockInput = {
        board: mockBoard,
        userId: mockUserId,
        companyMemberId: mockMemberId,
        userTeamIds: [23],
        boardVisibility: mockVisibility,
      };

      const res = TaskService.isMemberSpecificVisibleOnBoard(mockInput);

      expect(res).toBe(true);
    });

    test('it should return true if member is specifically assigned in visibility setting', () => {
      const mockUserId = 45;
      const mockMemberId = 87;

      const mockBoard = fixtures.generateCustom('taskBoard', {
        createdBy: 9999,
      });

      const mockVisibility: TaskBoardVisibilityModel[] = [
        {
          boardId: mockBoard.id,
          memberId: mockMemberId,
        },
      ];
      const mockInput = {
        board: mockBoard,
        userId: mockUserId,
        companyMemberId: mockMemberId,
        userTeamIds: [23],
        boardVisibility: mockVisibility,
      };

      const res = TaskService.isMemberSpecificVisibleOnBoard(mockInput);

      expect(res).toBe(true);
    });

    test('it should return true if member team is specifically assigned in visibility setting', () => {
      const mockUserId = 45;
      const mockMemberId = 87;

      const mockBoard = fixtures.generateCustom('taskBoard', {
        createdBy: 9999,
      });

      const mockVisibility: TaskBoardVisibilityModel[] = [
        {
          boardId: mockBoard.id,
          teamId: 45,
        },
        {
          boardId: mockBoard.id,
          teamId: 23,
        },
      ];
      const mockInput = {
        board: mockBoard,
        userId: mockUserId,
        companyMemberId: mockMemberId,
        userTeamIds: [23],
        boardVisibility: mockVisibility,
      };

      const res = TaskService.isMemberSpecificVisibleOnBoard(mockInput);

      expect(res).toBe(true);
    });
  });

  describe('shouldUpdateActualDates', () => {
    test("it should return true if the task's actual dates should be updated", async () => {
      const t = fixtures.generate('task');

      const task = { ...t, sub_status_id: 3, actual_end: null };
      const res = await TaskService.shouldUpdateActualDates({
        stage: CompanyStageType.CLOSED,
        task,
        payload: { updatedBy: 1, subStatusId: 2 },
      });

      expect(res).toBe(true);
    });
  });

  describe('getActualStartEndDates', () => {
    test('it should return the actual start date', () => {
      MockDate.set('2021-07-14');
      const mockInput = {
        percentage: 50,
        stageType: 1,
      };

      const res = TaskService.getActualStartEndDates(mockInput);

      const expectedResult = {
        actualStart: '2021-07-14 00:00:00',
        actualEnd: null,
      };

      expect(res).toEqual(expectedResult);

      MockDate.reset();
    });

    test('it should return the actual end dates', () => {
      MockDate.set('2021-07-14');
      const mockInput = {
        percentage: 73,
        stageType: 4,
      };

      const res = TaskService.getActualStartEndDates(mockInput);

      const expectedResult = {
        actualStart: null,
        actualEnd: '2021-07-14 00:00:00',
      };

      expect(res).toEqual(expectedResult);

      MockDate.reset();
    });

    test('it should return the nulls for other cases', () => {
      MockDate.set('2021-07-14');
      const mockInput = {
        percentage: 73,
        stageType: 2,
      };

      let res = TaskService.getActualStartEndDates(mockInput);

      const expectedResult = {
        actualStart: null,
        actualEnd: null,
      };

      expect(res).toEqual(expectedResult);

      mockInput.stageType = 3;

      res = TaskService.getActualStartEndDates(mockInput);

      expect(res).toEqual(expectedResult);

      MockDate.reset();
    });
  });

  describe('generateCreateTaskValues', () => {
    const loaders = createLoaders();
    const mockUser = fixtures.generate('user');
    const mockStatus = fixtures.generateCustom('taskStatus', {
      stage: 4,
      percentage: 100,
    }) as TaskStatusModel;
    const mockProject = fixtures.generate('project') as ProjectModel;
    const mockPics = fixtures.generate('contactPic', 2);

    test('it should generate the correct values', () => {
      MockDate.set('2021-07-14');

      const mockInput = {
        user: mockUser,
        name: 'Heed My Call',
        description: 'Yamada',
        project: mockProject,
        taskStatus: mockStatus,
        teamId: 76,
        dueDate: '2020-01-01 00:00:00.000',
        value: 5000,
        startDate: '2020-01-01 00:00:00.000',
        endDate: '2020-01-01 00:00:00.000',
        plannedEffort: 2,
        projectedCost: 354,
        priority: 2,
        published: true,
        visibility: 1,
        pics: mockPics,
        loaders,
      };

      jest.spyOn(TaskService, 'getActualStartEndDates').mockReturnValue({
        actualStart: null,
        actualEnd: '2021-07-14 00:00:00',
      });

      const res = TaskService.generateCreateTaskValues(mockInput);
      const expectedResult = {
        name: 'Heed My Call',
        description: 'Yamada',
        createdBy: mockUser.id,
        projectId: mockProject.id,
        teamId: 76,
        taskStatusId: mockStatus.id,
        stageType: mockStatus.stage,
        dueDate: '2020-01-01 00:00:00.000',
        value: 5000,
        startDate: '2020-01-01 00:00:00.000',
        endDate: '2020-01-01 00:00:00.000',
        plannedEffort: 2,
        projectedCost: 354,
        priority: 2,
        published: true,
        sequence: 0,
        visibility: 1,
        actualStart: null,
        actualEnd: '2021-07-14 00:00:00',
        completed: true,
      };
      expect(res).toEqual(expectedResult);

      MockDate.reset();
      jest.restoreAllMocks();
    });
    test('it should set the correct default values for undefined properties', () => {
      const mockInput = {
        project: mockProject,
        user: mockUser,
        name: 'Heed My Call',
        description: 'Yamada',
        createdBy: 45,
        jobId: 123,
        teamId: 76,
        subStatusId: 'abcd1234',
        dueDate: '2020-01-01 00:00:00.000',
        startDate: '2020-01-01 00:00:00.000',
        endDate: '2020-01-01 00:00:00.000',
        published: true,
        pics: mockPics,
        loaders,
      };
      const res = TaskService.generateCreateTaskValues(mockInput);
      expect(res.value).toBe(0);
      expect(res.plannedEffort).toBe(0);
      expect(res.projectedCost).toBe(0);
      expect(res.priority).toBe(2);
      expect(res.stageType).toBe(1);
    });
  });

  describe('calculateTaskPositionY', () => {
    test('it should return the correct position if there are other cards', async () => {
      const mockInput = {
        taskStatusId: 23,
      };

      const mockTasks = (await serviceFixtures.generate(
        'task',
        3,
      )) as TaskModel[];

      const positions = mockTasks.map((t) => t.posY || 0);

      const spy = jest
        .spyOn(TaskService, 'getTasksAssignedToStatusId')
        .mockResolvedValue(mockTasks);

      const res = await TaskService.calculateTaskPositionY(mockInput);

      expect(res).toEqual(Math.max(...positions) + TASK_KANBAN_POSITION_BUFFER);

      spy.mockRestore();
    });

    test('it should use the given pos Y if it is specified', async () => {
      const mockInput = {
        taskStatusId: 23,
        posY: 762,
      };

      const mockTasks = (await serviceFixtures.generate(
        'task',
        3,
      )) as TaskModel[];

      const spy = jest
        .spyOn(TaskService, 'getTasksAssignedToStatusId')
        .mockResolvedValue(mockTasks);

      const res = await TaskService.calculateTaskPositionY(mockInput);

      expect(res).toEqual(762);

      spy.mockRestore();
    });

    test('it should return a null pos y if there is no task status given', async () => {
      const mockInput = {
        posY: 762,
      };

      const mockTasks = (await serviceFixtures.generate(
        'task',
        3,
      )) as TaskModel[];

      const spy = jest
        .spyOn(TaskService, 'getTasksAssignedToStatusId')
        .mockResolvedValue(mockTasks);

      const res = await TaskService.calculateTaskPositionY(mockInput);

      expect(res).toEqual(null);

      spy.mockRestore();
    });
  });
});
