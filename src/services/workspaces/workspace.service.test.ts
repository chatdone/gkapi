import { WorkspaceStore } from '@data-access';
import serviceFixtures from '@test/fixtures/service.fixtures';
import { UserModelUpdated as UserModel } from '@models/user.model';

import WorkspaceService from './workspace.service';
import { WorkspaceModel } from '@models/workspace.model';
import { ProjectModel } from '@models/task.model';

import { TaskService } from '@services';

jest.mock('@services');
jest.mock('@data-access');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    projectTemplates: {
      load: jest.fn().mockImplementation((ids) => {
        return { columns: JSON.stringify(['test']) };
      }),
    },
  })),
}));

describe('workspace.service', () => {
  const mockUser = serviceFixtures.generate('user', 1) as UserModel;

  describe('getWorkspaces', () => {
    test('it should get workspaces', async () => {
      const mockInput = {
        ids: [2, 387, 873],
        companyId: 388,
        user: mockUser,
      };

      const mockWorkspaces = serviceFixtures.generate('workspace', 3, [
        { id: 2, companyId: 388 },
        { id: 387, companyId: 388 },
        { id: 873, companyId: 388 },
      ]);

      (WorkspaceStore.getWorkspaces as jest.Mock).mockResolvedValueOnce(
        mockWorkspaces,
      );

      const res = await WorkspaceService.getWorkspaces(mockInput);

      expect(WorkspaceStore.getWorkspaces).toHaveBeenCalledWith({
        ids: mockInput.ids,
        companyId: mockInput.companyId,
      });

      expect(res).toEqual(mockWorkspaces);
    });
  });

  describe('createWorkspace', () => {
    test('it should create a workspace', async () => {
      const mockUser = serviceFixtures.generate('user', 1) as UserModel;
      const mockInput = {
        name: 'My Workspace',
        bgColor: '#d3d3d3',
        companyId: 28,
        user: mockUser,
      };

      const mockWorkspaces = serviceFixtures.generate('workspace', 3, [
        { id: 2 },
        { id: 387 },
        { id: 873 },
      ]);

      (WorkspaceStore.createWorkspace as jest.Mock).mockResolvedValueOnce(
        mockWorkspaces,
      );

      const res = await WorkspaceService.createWorkspace(mockInput);

      expect(WorkspaceStore.createWorkspace).toHaveBeenCalledWith({
        bgColor: mockInput.bgColor,
        companyId: mockInput.companyId,
        name: mockInput.name,
        userId: mockUser.id,
      });
      expect(res).toEqual(mockWorkspaces);
    });
  });

  describe('updateWorkspace', () => {
    test('it should update a workspace', async () => {
      const mockWorkspace = serviceFixtures.generate(
        'workspace',
      ) as WorkspaceModel;
      const mockInput = {
        name: 'My Workspace',
        bgColor: '#d3d3d3',
        user: mockUser,
        workspaceId: mockWorkspace.id,
      };

      (WorkspaceStore.updateWorkspace as jest.Mock).mockResolvedValueOnce(
        mockWorkspace,
      );

      const res = await WorkspaceService.updateWorkspace(mockInput);

      expect(WorkspaceStore.updateWorkspace).toHaveBeenCalledWith({
        bgColor: mockInput.bgColor,
        workspaceId: mockInput.workspaceId,
        name: mockInput.name,
        userId: mockUser.id,
      });

      expect(res).toEqual(mockWorkspace);
    });
  });

  describe('assignProjectsToWorkspace', () => {
    test('it should assign projects to a workspace', async () => {
      const mockInput = {
        workspaceId: 2,
        projectIds: [324, 577, 83],
        user: mockUser,
      };

      const mockWorkspace = serviceFixtures.generate(
        'workspace',
      ) as WorkspaceModel;

      (
        WorkspaceStore.assignProjectsToWorkspace as jest.Mock
      ).mockResolvedValueOnce(mockWorkspace);

      const res = await WorkspaceService.assignProjectsToWorkspace(mockInput);

      expect(WorkspaceStore.assignProjectsToWorkspace).toHaveBeenCalledWith({
        workspaceId: mockInput.workspaceId,
        projectIds: mockInput.projectIds,
      });

      expect(res).toEqual(mockWorkspace);
    });
  });

  describe('removeProjectsFromWorkspace', () => {
    test('it should remove projects from a workspace', async () => {
      const mockInput = {
        workspaceId: 2,
        projectIds: [324, 577, 83],
        user: mockUser,
      };

      const mockWorkspace = serviceFixtures.generate(
        'workspace',
      ) as WorkspaceModel;

      (
        WorkspaceStore.removeProjectsFromWorkspace as jest.Mock
      ).mockResolvedValueOnce(mockWorkspace);

      const res = await WorkspaceService.removeProjectsFromWorkspace(mockInput);

      expect(WorkspaceStore.removeProjectsFromWorkspace).toHaveBeenCalledWith({
        workspaceId: mockInput.workspaceId,
        projectIds: mockInput.projectIds,
      });

      expect(res).toEqual(mockWorkspace);
    });
  });

  describe('moveProjectsToWorkspace', () => {
    test('it should move projects to a workspace', async () => {
      const mockInput = {
        sourceWorkspaceId: 921,
        destinationWorkspaceId: 66,
        projectIds: [324, 577, 83],
        user: mockUser,
      };

      const mockWorkspace = serviceFixtures.generate(
        'workspace',
        2,
      ) as WorkspaceModel[];

      (
        WorkspaceStore.removeProjectsFromWorkspace as jest.Mock
      ).mockResolvedValueOnce(mockWorkspace[0]);

      (
        WorkspaceStore.assignProjectsToWorkspace as jest.Mock
      ).mockResolvedValueOnce(mockWorkspace[1]);

      const res = await WorkspaceService.moveProjectsToWorkspace(mockInput);

      expect(WorkspaceStore.removeProjectsFromWorkspace).toHaveBeenCalledWith({
        workspaceId: mockInput.sourceWorkspaceId,
        projectIds: mockInput.projectIds,
      });

      expect(WorkspaceStore.assignProjectsToWorkspace).toHaveBeenCalledWith({
        workspaceId: mockInput.destinationWorkspaceId,
        projectIds: mockInput.projectIds,
      });

      expect(res).toEqual([mockWorkspace[0], mockWorkspace[1]]);
    });
  });

  describe('createProject', () => {
    test('it should create a project', async () => {
      const mockProject = serviceFixtures.generate('project') as ProjectModel;
      const mockWorkspace = serviceFixtures.generate(
        'workspace',
      ) as WorkspaceModel;

      const mockInput = {
        name: 'Top 10 Fortnite Battles',
        user: mockUser,
        companyId: 879,
        workspaceId: mockWorkspace.id,
      };

      (WorkspaceStore.createProject as jest.Mock).mockResolvedValueOnce(
        mockProject,
      );

      const assignSpy = jest
        .spyOn(WorkspaceService, 'assignProjectsToWorkspace')
        .mockResolvedValue(mockWorkspace);

      const project = await WorkspaceService.createProject(mockInput);

      expect(WorkspaceStore.createProject).toHaveBeenCalledWith({
        name: mockInput.name,
        userId: mockInput.user.id,
        companyId: mockInput.companyId,
      });

      expect(assignSpy).toHaveBeenCalledWith({
        workspaceId: mockWorkspace.id,
        projectIds: [project.id],
        user: mockUser,
      });

      expect(project).toEqual(mockProject);

      assignSpy.mockRestore();
    });
  });
});
