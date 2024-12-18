import { TaskStore } from '@data-access';
import GkFixtures from '@db-fixtures';
import fixtures from '@test/fixtures';
import TaskService from './task.service';
import TaskBoardService from './task-board.service';
import { TaskBoardFolderModel, TaskBoardModel } from '@models/task.model';
import _ from 'lodash';
import { UserModel } from '@models/user.model';

jest.mock('../../data-access/task/task.store');
import { createLoaders } from '../../data-access/loaders';
import { ProjectSettingsDbModel } from '@db-types';
import { camelizeOnly } from '@data-access/utils';

jest.mock('../../data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    projectTemplates: {
      load: jest.fn().mockImplementation((ids) => {
        return { columns: JSON.stringify(['test']) };
      }),
    },
  })),
}));

describe('task-board.service', () => {
  const mockUser = fixtures.generate('user');
  describe('getTaskBoardFolders', () => {
    test('it should return the folders for a company', async () => {
      const mockInput = {
        companyId: 123,
        type: 2,
        user: mockUser,
      };

      const mockResponse = fixtures.generate(
        'taskBoardFolder',
        3,
      ) as TaskBoardFolderModel[];

      (TaskStore.getTaskBoardFolders as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.getTaskBoardFolders(mockInput);

      expect(TaskStore.getTaskBoardFolders).toBeCalledWith({
        companyId: mockInput.companyId,
        type: mockInput.type,
      });
      expect(res).toEqual(mockResponse);
    });
  });

  describe('createTaskBoardFolder', () => {
    test('it should create a folder', async () => {
      const mockInput = {
        companyId: 1223,
        name: `Now! That's What I Call Music`,
        type: 2,
        user: mockUser,
      };

      const mockResponse = fixtures.generateCustom('taskBoardFolder', {
        companyId: 1223,
      });

      (TaskStore.createTaskBoardFolder as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.createTaskBoardFolder(mockInput);

      expect(TaskStore.createTaskBoardFolder).toBeCalledWith({
        companyId: mockInput.companyId,
        name: mockInput.name,
        type: mockInput.type,
        userId: mockUser.id,
      });
      expect(res).toEqual(mockResponse);
    });
  });

  describe('updateTaskBoardFolder', () => {
    test('it should update a folder', async () => {
      const mockInput = {
        folderId: 2222,
        name: `Now! That's What I Call Music`,
        user: mockUser,
      };

      const mockResponse = fixtures.generateCustom('taskBoardFolder', {
        companyId: 1223,
      });

      (TaskStore.updateTaskBoardFolder as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.updateTaskBoardFolder(mockInput);

      expect(res).toEqual(mockResponse);
    });
  });

  describe('deleteTaskBoardFolder', () => {
    test('it should delete a folder', async () => {
      const mockInput = {
        folderId: 2222,
        user: mockUser,
      };

      (TaskStore.updateTaskBoardFolder as jest.Mock).mockResolvedValue(
        undefined,
      );

      const res = await TaskService.deleteTaskBoardFolder(mockInput);

      expect(res).toEqual(undefined);
    });
  });

  describe('setTaskBoardVisibility', () => {
    test('it should set the task board visibility', async () => {
      const mockUser = fixtures.generate('user');
      const mockInput = {
        boardId: 123,
        visibility: 3,
        companyId: 234,
        user: mockUser,
      };
      const mockResponse = fixtures.generate('taskBoard');

      (TaskStore.setTaskBoardVisibility as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.setTaskBoardVisibility(mockInput);

      expect(TaskStore.setTaskBoardVisibility).toBeCalledWith({
        boardId: 123,
        userId: mockUser.id,
        visibility: 3,
      });

      expect(res).toEqual(mockResponse);
    });
  });

  describe('assignTaskBoardsToFolder', () => {
    test('it should assign task boards', async () => {
      const mockUser = fixtures.generate('user');
      const mockInput = {
        folderId: 23,
        boardIds: [238, 879, 764],
        user: mockUser,
      };

      const mockResponse = fixtures.generate(
        'taskBoardFolder',
      ) as TaskBoardFolderModel;

      (TaskStore.assignTaskBoardsToFolder as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.assignTaskBoardsToFolder(mockInput);

      expect(TaskStore.assignTaskBoardsToFolder).toBeCalledWith({
        folderId: mockInput.folderId,
        boardIds: mockInput.boardIds,
        userId: mockUser.id,
      });
      expect(res).toEqual(mockResponse);
    });
  });

  describe('removeTaskBoardsFromFolder', () => {
    test('it should remove task boards from a folders', async () => {
      const mockUser = fixtures.generate('user');
      const mockInput = {
        boardIds: [238, 879, 764],
        user: mockUser,
      };

      const mockResponse = fixtures.generate(
        'taskBoard',
        3,
      ) as TaskBoardModel[];

      (TaskStore.removeTaskBoardsFromFolder as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.removeTaskBoardsFromFolder(mockInput);

      expect(TaskStore.removeTaskBoardsFromFolder).toBeCalledWith({
        boardIds: mockInput.boardIds,
        userId: mockUser.id,
      });
      expect(res).toEqual(mockResponse);
    });
  });

  describe('getTaskBoardsByFolderId', () => {
    test('it should get normal task boards by folder id', async () => {
      const mockUser = fixtures.generate('user');
      const mockInput = {
        folderId: 23,
        user: mockUser,
        folderType: 1,
        companyId: mockUser.activeCompany,
      };

      const mockResponse = fixtures.generate(
        'taskBoard',
        4,
      ) as TaskBoardModel[];

      (TaskStore.getTaskBoardsByFolderId as jest.Mock).mockResolvedValue(
        mockResponse,
      );
      const spy = jest
        .spyOn(TaskService, 'filterVisibleBoards')
        .mockResolvedValue(mockResponse);

      const res = await TaskService.getTaskBoardsByFolderId(mockInput);

      expect(TaskStore.getTaskBoardsByFolderId).toBeCalledWith({
        folderId: mockInput.folderId,
        type: 'Internal',
        category: 0,
      });
      expect(res).toEqual(mockResponse);

      spy.mockRestore();
    });

    test('it should get project boards by folder id', async () => {
      const mockUser = fixtures.generate('user');
      const mockInput = {
        folderId: 23,
        user: mockUser,
        folderType: 4,
        companyId: mockUser.activeCompany,
      };

      const mockResponse = fixtures.generate(
        'taskBoard',
        4,
      ) as TaskBoardModel[];

      (TaskStore.getTaskBoardsByFolderId as jest.Mock).mockResolvedValue(
        mockResponse,
      );
      const spy = jest
        .spyOn(TaskService, 'filterVisibleBoards')
        .mockResolvedValue(mockResponse);

      const res = await TaskService.getTaskBoardsByFolderId(mockInput);

      expect(TaskStore.getTaskBoardsByFolderId).toBeCalledWith({
        folderId: mockInput.folderId,
        type: 'All',
        category: 1,
      });
      expect(res).toEqual(mockResponse);

      spy.mockRestore();
    });
    test.todo('it should filter out boards not visible to the user');
  });

  describe('toggleTaskBoardPinned', () => {
    const mockUser = fixtures.generate('user') as UserModel;
    test('it should invert the task board pinned status', async () => {
      const mockInput = {
        boardId: 23,
        user: mockUser,
      };

      const mockResponse = fixtures.generate('taskBoard') as TaskBoardModel;

      (TaskStore.toggleTaskBoardPinned as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.toggleTaskBoardPinned(mockInput);

      expect(TaskStore.toggleTaskBoardPinned).toBeCalledWith({
        boardId: mockInput.boardId,
        userId: mockUser.id,
      });
      expect(res).toEqual(mockResponse);
    });
  });

  describe('addToVisibilityWhitelist', () => {
    const mockUser = fixtures.generate('user') as UserModel;
    test('it should add the correct entities to the whitelist', async () => {
      const mockInput = {
        boardId: 23,
        memberIds: [87, 983, 27],
        teamIds: [399, 73],
        user: mockUser,
      };

      const mockResponse = fixtures.generate('taskBoard') as TaskBoardModel;

      (TaskStore.getVisibilityWhitelist as jest.Mock).mockResolvedValue({
        members: [],
        teams: [],
      });
      (TaskStore.addToVisibilityWhitelist as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.addToVisibilityWhitelist(mockInput);

      expect(TaskStore.addToVisibilityWhitelist).toBeCalledWith({
        boardId: mockInput.boardId,
        memberIds: [87, 983, 27],
        teamIds: [399, 73],
      });

      expect(res).toEqual(mockResponse);
    });
  });

  describe('removeFromVisibilityWhitelist', () => {
    const mockUser = fixtures.generate('user') as UserModel;
    test('it should remove the correct entities from the whitelist', async () => {
      const mockInput = {
        boardId: 23,
        memberIds: [87, 983, 27],
        teamIds: [399, 73],
        user: mockUser,
      };

      const mockResponse = fixtures.generate('taskBoard') as TaskBoardModel;

      (TaskStore.removeFromVisibilityWhitelist as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await TaskService.removeFromVisibilityWhitelist(mockInput);

      expect(TaskStore.removeFromVisibilityWhitelist).toBeCalledWith({
        boardId: mockInput.boardId,
        memberIds: [87, 983, 27],
        teamIds: [399, 73],
      });

      expect(res).toEqual(mockResponse);
    });
  });

  // describe('applyProjectTemplate', () => {
  //   test('it should apply project template if there is a templateId and return project settings', async () => {
  //     const mockInput = {
  //       projectId: 23,
  //       templateId: 12,
  //     };

  //     const mockResponse = GkFixtures.generate('db.projectSettings', 1, [
  //       { project_id: mockInput.projectId },
  //     ]) as ProjectSettingsDbModel;

  //     (createLoaders().projectTemplates.load as jest.Mock).mockResolvedValue({
  //       columns: mockResponse.columns,
  //       id: 12,
  //     });

  //     jest.spyOn(TaskBoardService, 'createProjectSettings').mockResolvedValue({
  //       projectId: mockResponse.project_id,
  //       columns: mockResponse.columns,
  //     });

  //     jest
  //       .spyOn(TaskBoardService, 'applyProjectTemplateStatuses')
  //       .mockResolvedValue([]);

  //     const res = await TaskService.applyProjectTemplate(mockInput);
  //     const camelizedResponse = camelizeOnly(mockResponse);

  //     expect(TaskBoardService.applyProjectTemplateStatuses).toBeCalledWith({
  //       projectId: mockResponse.project_id,
  //       templateId: mockInput.templateId,
  //     });
  //     expect(res).toEqual(camelizedResponse);
  //   });

  //   test('it should return empty template if there is not templateId', async () => {
  //     const mockInput = {
  //       projectId: 23,
  //       templateId: undefined,
  //     };

  //     jest.spyOn(TaskBoardService, 'createProjectSettings').mockResolvedValue({
  //       projectId: mockInput.projectId,
  //       columns: JSON.stringify([]),
  //     });

  //     const res = await TaskService.applyProjectTemplate(mockInput);

  //     expect(res).toEqual({
  //       projectId: mockInput.projectId,
  //       columns: JSON.stringify([]),
  //     });
  //   });
  // });

  // describe('validateTemplateColumns', () => {
  //   test('it should return true if all columns are valid', async () => {
  //     const mockInput = {
  //       columns: [
  //         {
  //           name: 'Assignee',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Watchers',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Contacts',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Tracking',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Priority',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Tags',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Value',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Effort',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Reminder',
  //           enabled: true,
  //         },
  //         {
  //           name: 'Recurrence',
  //           enabled: true,
  //         },
  //       ],
  //     };

  //     const res = await TaskService.validateTemplateColumns(
  //       JSON.stringify(mockInput),
  //     );
  //     expect(res).toEqual(true);
  //   });
  // });
});
