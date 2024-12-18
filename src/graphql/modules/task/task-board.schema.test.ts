import { gql, ApolloServer } from 'apollo-server-express';
import schema from '@graphql/schemasMap';
import fixtures from '@test/fixtures';
import { TaskService } from '@services';
import {
  getTaskBoard,
  getTaskBoardFolder,
  getTaskBoards,
} from '@data-access/getters';
import { TaskBoardFolderModel, TaskBoardModel } from '@models/task.model';

jest.mock('@data-access/getters');
jest.mock('@services');

const mockUser = fixtures.generateCustom('user', {
  activeCompany: 177,
  companyIds: [23, 78, 387],
});

const testServer = new ApolloServer({
  schema,
  context: () => {
    return {
      auth: {
        user: mockUser,
      },
    };
  },
});

describe('task-board.schema', () => {
  describe('taskBoardFolders', () => {
    test('it should return the task board folders', async () => {
      const mockResponse = fixtures.generate(
        'taskBoardFolder',
        3,
      ) as TaskBoardFolderModel[];

      (TaskService.getTaskBoardFolders as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await testServer.executeOperation({
        query: gql`
          query TaskBoardFoldersQuery($type: TaskBoardFolderType!) {
            taskBoardFolders(type: $type) {
              id
              name
            }
          }
        `,
        variables: {
          type: 'PERSONAL',
        },
      });

      expect(TaskService.getTaskBoardFolders).toBeCalledWith({
        companyId: mockUser.activeCompany,
        type: 2,
        user: mockUser,
      });
      expect(result.errors).toBeUndefined();
      expect(result.data?.taskBoardFolders).toHaveLength(3);
    });
  });

  describe('createTaskBoardFolder', () => {
    test('it should create a task board folder', async () => {
      const mockInput = {
        input: {
          name: 'Secret Company Projects',
          type: 'PERSONAL',
        },
      };
      const mockResponse = fixtures.generateCustom('taskBoardFolder', {
        name: mockInput.input.name,
      }) as TaskBoardFolderModel;

      (TaskService.createTaskBoardFolder as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await testServer.executeOperation({
        query: gql`
          mutation CreateTaskBoardFolderMutation(
            $input: CreateTaskBoardFolderInput!
          ) {
            createTaskBoardFolder(input: $input) {
              id
              name
            }
          }
        `,
        variables: mockInput,
      });
      expect(TaskService.createTaskBoardFolder).toBeCalledWith({
        companyId: mockUser.activeCompany,
        name: mockInput.input.name,
        type: 2,
        user: mockUser,
      });
      expect(result.errors).toBeUndefined();
      expect(result.data?.createTaskBoardFolder.name).toEqual(
        mockInput.input.name,
      );
    });
  });

  describe('updateTaskBoardFolder', () => {
    test('it should update a task board folder', async () => {
      const mockInput = {
        input: {
          folderId: 'abcd1234',
          name: 'Secret Company Missions',
        },
      };

      const mockFolder = fixtures.generateCustom('taskBoardFolder', {
        name: mockInput.input.name,
      });

      const mockResponse = fixtures.generateCustom('taskBoardFolder', {
        name: mockInput.input.name,
      }) as TaskBoardFolderModel;

      (getTaskBoardFolder as jest.Mock).mockResolvedValue(mockFolder);

      (TaskService.updateTaskBoardFolder as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await testServer.executeOperation({
        query: gql`
          mutation UpdateTaskBoardFolderMutation(
            $input: UpdateTaskBoardFolderInput!
          ) {
            updateTaskBoardFolder(input: $input) {
              id
              name
            }
          }
        `,
        variables: mockInput,
      });

      expect(TaskService.updateTaskBoardFolder).toBeCalledWith({
        folderId: mockFolder.id,
        name: mockInput.input.name,
        user: mockUser,
      });
      expect(result.errors).toBeUndefined();
      expect(result.data?.updateTaskBoardFolder.name).toEqual(
        mockInput.input.name,
      );
    });
  });

  describe('deleteTaskBoardFolder', () => {
    test('it should delete a task board folder', async () => {
      const mockFolder = fixtures.generate(
        'taskBoardFolder',
      ) as TaskBoardFolderModel;

      (getTaskBoardFolder as jest.Mock).mockResolvedValue(mockFolder);

      (TaskService.deleteTaskBoardFolder as jest.Mock).mockResolvedValue(null);

      const result = await testServer.executeOperation({
        query: gql`
          mutation DeleteTaskBoardFolderMutation($folderId: ID!) {
            deleteTaskBoardFolder(folderId: $folderId) {
              id
              name
            }
          }
        `,
        variables: { folderId: 'abcd1234' },
      });

      expect(TaskService.deleteTaskBoardFolder).toBeCalledWith({
        folderId: mockFolder.id,
        user: mockUser,
      });
      expect(result.errors).toBeUndefined();
      expect(result.data?.deleteTaskBoardFolder.name).toEqual(mockFolder.name);
    });
  });

  describe('assignTaskBoardsToFolder', () => {
    test('it should assign task boards to a folder', async () => {
      const mockInput = {
        input: {
          folderId: 'abcd1234',
          boardIds: ['anthoeu82', 'boech', 'o82theu'],
        },
      };
      const mockFolder = fixtures.generate('taskBoardFolder');
      const mockBoards = fixtures.generate('taskBoard', 3) as TaskBoardModel[];

      const mockResponse = fixtures.generate(
        'taskBoardFolder',
      ) as TaskBoardFolderModel;

      (getTaskBoardFolder as jest.Mock).mockResolvedValue(mockFolder);
      (getTaskBoards as jest.Mock).mockResolvedValue(mockBoards);

      (TaskService.assignTaskBoardsToFolder as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await testServer.executeOperation({
        query: gql`
          mutation AssignTaskBoardsToFolderMutation(
            $input: AssignTaskBoardsToFolderInput!
          ) {
            assignTaskBoardsToFolder(input: $input) {
              id
              name
            }
          }
        `,
        variables: mockInput,
      });

      expect(TaskService.assignTaskBoardsToFolder).toBeCalledWith({
        folderId: mockFolder.id,
        boardIds: mockBoards.map((b) => b.id),
        user: mockUser,
      });
      expect(result.errors).toBeUndefined();
      expect(result.data?.assignTaskBoardsToFolder.name).toEqual(
        mockResponse.name,
      );
    });
  });
});
