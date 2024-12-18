import knex from 'knex';
import { getTracker, MockClient, Tracker } from 'knex-mock-client';
import { TableNames } from '@db-tables';
import fixtures from '@db-fixtures';
import MockDate from 'mockdate';

import { camelizeOnly as camelize } from '../utils';
import WorkspaceStore from './workspace.store';
import {
  WorkspaceDbModel,
  ProjectDbModel,
  ProjectTemplateDbModel,
  ProjectStatusDbModel,
  ProjectSettingsDbModel,
} from '@db-types';

jest.mock('@db/knex', () => {
  return knex({ client: MockClient });
});

describe('workspace.store', () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = getTracker();
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('getWorkspace', () => {
    test('it should get the workspaces', async () => {
      const mockInput = {
        ids: [2, 387],
        companyId: 980,
      };
      const mockWorkspaces = fixtures.generate('db.workspace', 2, [
        { id: mockInput.ids[0], company_id: 980 },
        { id: mockInput.ids[1], company_id: 980 },
      ]);

      tracker.on.select(TableNames.WORKSPACES).response(mockWorkspaces);

      const res = await WorkspaceStore.getWorkspaces(mockInput);

      const expectedResult = camelize(mockWorkspaces);

      const selectHistory = tracker.history.select;

      expect(selectHistory).toHaveLength(1);
      expect(selectHistory[0].method).toEqual('select');
      expect(selectHistory[0].bindings).toEqual([
        ...mockInput.ids,
        mockInput.companyId,
      ]);

      expect(res).toHaveLength(2);
      expect(res).toEqual(expectedResult);
    });
  });

  describe('createWorkspace', () => {
    test('it should create a workspace', async () => {
      MockDate.set('2020-01-01');

      const mockInput = {
        name: 'test',
        bgColor: '#d3d3d3',
        companyId: 37,
        userId: 2,
      };

      const mockWorkspace = fixtures.generate('db.workspace', 1, [
        {
          name: mockInput.name,
          bg_color: mockInput.bgColor,
          company_id: mockInput.companyId,
          created_by: mockInput.userId,
          updated_by: mockInput.userId,
        },
      ]) as WorkspaceDbModel;

      tracker.on.select(TableNames.WORKSPACES).response([mockWorkspace]);
      tracker.on.insert(TableNames.WORKSPACES).response([mockWorkspace.id]);

      const res = await WorkspaceStore.createWorkspace(mockInput);

      const expectedBindings = [
        mockInput.bgColor,
        mockInput.companyId,
        mockInput.userId,
        mockInput.name,
        mockInput.userId,
      ];

      const expectedResult = camelize(mockWorkspace);

      const insertHistory = tracker.history.insert;

      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toEqual('insert');
      expect(insertHistory[0].bindings).toEqual(expectedBindings);

      expect(res).toEqual(expectedResult);

      MockDate.reset();
    });
  });

  describe('updateWorkspace', () => {
    test('it should update a workspace', async () => {
      MockDate.set('2020-01-01');

      const mockInput = {
        name: 'test',
        bgColor: '#d3d3d3',
        userId: 282,
        workspaceId: 887,
      };

      const mockWorkspace = fixtures.generate('db.workspace', 1, [
        {
          name: mockInput.name,
          bg_color: mockInput.bgColor,
          updated_by: mockInput.userId,
        },
      ]) as WorkspaceDbModel;

      tracker.on.select(TableNames.WORKSPACES).response([mockWorkspace]);
      tracker.on.update(TableNames.WORKSPACES).response([mockWorkspace.id]);

      const res = await WorkspaceStore.updateWorkspace(mockInput);

      const expectedBindings = [
        mockInput.name,
        mockInput.bgColor,
        mockInput.userId,
        mockInput.workspaceId,
      ];

      const expectedResult = camelize(mockWorkspace);

      const updateHistory = tracker.history.update;

      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].method).toEqual('update');
      expect(updateHistory[0].bindings).toEqual(expectedBindings);

      expect(res).toEqual(expectedResult);

      MockDate.reset();
    });

    test('it should work without the optionals', async () => {
      MockDate.set('2020-01-01');

      const mockInput = {
        userId: 282,
        workspaceId: 887,
      };

      const mockWorkspace = fixtures.generate('db.workspace', 1, [
        {
          updated_by: mockInput.userId,
        },
      ]) as WorkspaceDbModel;

      tracker.on.select(TableNames.WORKSPACES).response([mockWorkspace]);
      tracker.on.update(TableNames.WORKSPACES).response([mockWorkspace.id]);

      const res = await WorkspaceStore.updateWorkspace(mockInput);

      const expectedBindings = [mockInput.userId, mockInput.workspaceId];

      const expectedResult = camelize(mockWorkspace);

      const updateHistory = tracker.history.update;

      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].method).toEqual('update');
      expect(updateHistory[0].bindings).toEqual(expectedBindings);

      expect(res).toEqual(expectedResult);

      MockDate.reset();
    });
  });

  describe('getProjectsByWorkspaceId', () => {
    test('it should get the projects from the workspace', async () => {
      const mockInput = {
        workspaceId: 2,
      };
      const mockProjects = fixtures.generate('db.project', 2, [
        { company_id: 980 },
        { company_id: 980 },
      ]);

      tracker.on.select(TableNames.WORKSPACE_PROJECTS).response(mockProjects);

      const res = await WorkspaceStore.getProjectsByWorkspaceId(mockInput);

      const expectedResult = camelize(mockProjects);

      const selectHistory = tracker.history.select;

      expect(selectHistory).toHaveLength(1);
      expect(selectHistory[0].method).toEqual('select');
      expect(selectHistory[0].bindings).toEqual([mockInput.workspaceId]);

      expect(res).toHaveLength(2);
      expect(res).toEqual(expectedResult);
    });
  });

  describe('assignProjectsToWorkspace', () => {
    test('it should assign projects to a workspace', async () => {
      const mockInput = {
        workspaceId: 2,
        projectIds: [3, 93, 87],
      };

      const mockWorkspace = fixtures.generate('db.workspace', 1, [
        { company_id: 980 },
      ]) as WorkspaceDbModel;

      tracker.on
        .insert(TableNames.WORKSPACE_PROJECTS)
        .response([387, 382931, 38881]);

      tracker.on.select(TableNames.WORKSPACES).response([mockWorkspace]);

      const res = await WorkspaceStore.assignProjectsToWorkspace(mockInput);

      const expectedResult = camelize(mockWorkspace);

      const insertHistory = tracker.history.insert;

      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toEqual('insert');
      expect(insertHistory[0].bindings).toEqual([3, 2, 93, 2, 87, 2]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('removeProjectsFromWorkspace', () => {
    test('it should remove projects from a workspace', async () => {
      const mockInput = {
        workspaceId: 2,
        projectIds: [3, 93, 87],
      };

      const mockWorkspace = fixtures.generate('db.workspace', 1, [
        { company_id: 980 },
      ]) as WorkspaceDbModel;

      tracker.on.delete(TableNames.WORKSPACE_PROJECTS).response(3);

      tracker.on.select(TableNames.WORKSPACES).response([mockWorkspace]);

      const res = await WorkspaceStore.removeProjectsFromWorkspace(mockInput);

      const expectedResult = camelize(mockWorkspace);

      const deleteHistory = tracker.history.delete;

      expect(deleteHistory).toHaveLength(1);
      expect(deleteHistory[0].method).toEqual('delete');
      expect(deleteHistory[0].bindings).toEqual([2, 3, 93, 87]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('getProjectTemplates', () => {
    test('it should get the project templates', async () => {
      const mockInput = {
        companyId: 10,
      };

      const mockTemplates = fixtures.generate(
        'db.projectTemplate',
        2,
      ) as ProjectTemplateDbModel[];

      tracker.on.select(TableNames.PROJECT_TEMPLATES).response(mockTemplates);

      const res = await WorkspaceStore.getProjectTemplates(mockInput);

      const expectedResult = camelize(mockTemplates);
      const selectHistory = tracker.history.select;

      expect(selectHistory).toHaveLength(1);
      expect(selectHistory[0].method).toEqual('select');
      expect(selectHistory[0].bindings).toEqual([mockInput.companyId]);

      expect(res).toHaveLength(2);
      expect(res).toEqual(expectedResult);
    });
  });

  describe('createProjectTemplate', () => {
    test('it should create a project template', async () => {
      const mockInput = {
        name: 'Template name',
        companyId: 1,
        columns: JSON.stringify([
          {
            name: 'Column 1',
            order: 1,
          },
          {
            name: 'Column 2',
            order: 2,
          },
        ]),
      };

      const mockTemplate = fixtures.generate(
        'db.projectTemplate',
        1,
      ) as ProjectTemplateDbModel;

      tracker.on
        .insert(TableNames.PROJECT_TEMPLATES)
        .response([mockTemplate.id]);

      tracker.on.select(TableNames.PROJECT_TEMPLATES).response([mockTemplate]);

      const res = await WorkspaceStore.createProjectTemplate(mockInput);

      const expectedResult = camelize(mockTemplate);

      const insertHistory = tracker.history.insert;

      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toEqual('insert');
      expect(insertHistory[0].bindings).toEqual([
        '[{"name":"Column 1","order":1},{"name":"Column 2","order":2}]',
        1,
        'Template name',
      ]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('deleteProjectTemplates', () => {
    test('it should delete project templates', async () => {
      const projectTemplateIds = [1, 2, 3];

      tracker.on.delete(TableNames.PROJECT_TEMPLATES).response(3);

      const res = await WorkspaceStore.deleteProjectTemplates(
        projectTemplateIds,
      );

      const deleteHistory = tracker.history.delete;

      expect(deleteHistory).toHaveLength(1);
      expect(deleteHistory[0].method).toEqual('delete');
      expect(deleteHistory[0].bindings).toEqual([1, 2, 3]);

      expect(res).toEqual(3);
    });
  });

  describe('updateProjectTemplate', () => {
    test('it should update project template', async () => {
      const mockInput = {
        templateId: 1,
        name: 'New Template Name',
        columns: JSON.stringify([
          {
            name: 'Column 1',
            order: 2,
          },
          {
            name: 'Column 2',
            order: 1,
          },
        ]),
      };

      tracker.on.select(TableNames.PROJECT_TEMPLATES).response([1]);
      tracker.on.update(TableNames.PROJECT_TEMPLATES).response(1);

      const res = await WorkspaceStore.updateProjectTemplate(mockInput);

      const updateHistory = tracker.history.update;

      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].method).toEqual('update');
      expect(updateHistory[0].bindings).toEqual([
        'New Template Name',
        '[{"name":"Column 1","order":2},{"name":"Column 2","order":1}]',
        1,
      ]);
      expect(res).toEqual(1);
    });
  });

  describe('createProjectStatus', () => {
    test('it should create a project status', async () => {
      const mockInput = {
        name: 'Status name',
        color: '#000000',
        projectId: 1,
        sequence: 12,
      };

      const mockStatus = fixtures.generate(
        'db.projectStatus',
        1,
      ) as ProjectStatusDbModel;

      tracker.on.insert(TableNames.PROJECT_STATUSES).response([mockStatus?.id]);

      tracker.on.select(TableNames.PROJECT_STATUSES).response([mockStatus]);

      const res = await WorkspaceStore.createProjectStatus(mockInput);

      const expectedResult = camelize(mockStatus);

      const insertHistory = tracker.history.insert;

      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toEqual('insert');
      expect(insertHistory[0].bindings).toEqual([
        '#000000',
        'Status name',
        1,
        12,
      ]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('updateProjectStatus', () => {
    test('it should update a project status', async () => {
      const mockInput = {
        projectStatusId: 1,
        name: 'New Status Name',
        color: '#000000',
      };

      tracker.on.select(TableNames.PROJECT_STATUSES).response([1]);
      tracker.on.update(TableNames.PROJECT_STATUSES).response(1);

      const res = await WorkspaceStore.updateProjectStatus(mockInput);

      const updateHistory = tracker.history.update;
      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].method).toEqual('update');
      expect(updateHistory[0].bindings).toEqual([
        'New Status Name',
        '#000000',
        1,
      ]);
      expect(res).toEqual(1);
    });
  });

  describe('deleteProjectStatuses', () => {
    test('it should delete project statuses', async () => {
      const projectStatusIds = [1, 2, 3];

      tracker.on.delete(TableNames.PROJECT_STATUSES).response(3);

      const res = await WorkspaceStore.deleteProjectStatuses(projectStatusIds);

      const deleteHistory = tracker.history.delete;

      expect(deleteHistory).toHaveLength(1);
      expect(deleteHistory[0].method).toEqual('delete');
      expect(deleteHistory[0].bindings).toEqual([1, 2, 3]);

      expect(res).toEqual(3);
    });
  });

  describe('createProjectTemplateStatus', () => {
    test('it should create a project template status', async () => {
      const mockInput = {
        name: 'Template Status name',
        color: '#000000',
        projectTemplateId: 1,
      };

      const mockStatus = fixtures.generate(
        'db.projectTemplateStatus',
        1,
      ) as ProjectStatusDbModel;

      tracker.on
        .insert(TableNames.PROJECT_TEMPLATE_STATUSES)
        .response([mockStatus?.id]);

      tracker.on
        .select(TableNames.PROJECT_TEMPLATE_STATUSES)
        .response([mockStatus]);

      const res = await WorkspaceStore.createProjectTemplateStatus(mockInput);

      const expectedResult = camelize(mockStatus);

      const insertHistory = tracker.history.insert;

      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toEqual('insert');
      expect(insertHistory[0].bindings).toEqual([
        '#000000',
        'Template Status name',
        1,
      ]);

      expect(res).toEqual(expectedResult);
    });
  });

  describe('updateProjectTemplateStatus', () => {
    test('it should update a project template status', async () => {
      const mockInput = {
        projectTemplateStatusId: 1,
        name: 'New Template Status Name',
        color: '#000000',
      };

      tracker.on.select(TableNames.PROJECT_TEMPLATE_STATUSES).response([1]);
      tracker.on.update(TableNames.PROJECT_TEMPLATE_STATUSES).response(1);

      const res = await WorkspaceStore.updateProjectTemplateStatus(mockInput);

      const updateHistory = tracker.history.update;
      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].method).toEqual('update');
      expect(updateHistory[0].bindings).toEqual([
        'New Template Status Name',
        '#000000',
        1,
      ]);
      expect(res).toEqual(1);
    });
  });

  // describe('createProjectSettings', () => {
  //   test('it should create a project settings', async () => {
  //     const mockInput = {
  //       columns: JSON.stringify([
  //         {
  //           name: 'Column 1',
  //           order: 2,
  //         },
  //         {
  //           name: 'Column 2',
  //           order: 1,
  //         },
  //       ]),
  //       projectId: 1,
  //     };

  //     const mockSettings = fixtures.generate(
  //       'db.projectSettings',
  //       1,
  //     ) as ProjectSettingsDbModel;

  //     tracker.on
  //       .insert(TableNames.PROJECT_SETTINGS)
  //       .response([mockSettings?.project_id]);

  //     tracker.on.select(TableNames.PROJECT_SETTINGS).response([mockSettings]);

  //     const res = await WorkspaceStore.createProjectSettings(mockInput);

  //     const expectedResult = camelize(mockSettings);

  //     const insertHistory = tracker.history.insert;

  //     expect(insertHistory).toHaveLength(1);
  //     expect(insertHistory[0].method).toEqual('insert');
  //     expect(insertHistory[0].bindings).toEqual([
  //       '[{"name":"Column 1","order":2},{"name":"Column 2","order":1}]',
  //       1,
  //     ]);

  //     expect(res).toEqual(expectedResult);
  //   });
  // });

  describe('updateProjectSettings', () => {
    test('it should update a project settings', async () => {
      const mockInput = {
        columns: JSON.stringify([
          {
            name: 'Column 1',
            order: 2,
          },
          {
            name: 'Column 2',
            order: 1,
          },
        ]),
        projectId: 1,
      };

      tracker.on.select(TableNames.PROJECT_SETTINGS).response([1]);
      tracker.on.update(TableNames.PROJECT_SETTINGS).response(1);

      const res = await WorkspaceStore.updateProjectSettings(mockInput);

      const updateHistory = tracker.history.update;
      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].method).toEqual('update');
      expect(updateHistory[0].bindings).toEqual([
        '[{"name":"Column 1","order":2},{"name":"Column 2","order":1}]',
        1,
      ]);
      expect(res).toEqual(1);
    });
  });

  describe('createProject', () => {
    test('it should create a project', async () => {
      const mockInput = {
        name: 'Top 10 Doom Metal Bands',
        companyId: 8729,
        userId: 346,
      };

      const mockProject = fixtures.generate('db.project', 1) as ProjectDbModel;

      tracker.on.insert(TableNames.PROJECTS).response([3776]);
      tracker.on.select(TableNames.PROJECTS).response([mockProject]);

      const res = await WorkspaceStore.createProject(mockInput);

      const expectedResult = camelize(mockProject);
      const expectedBindings = [
        1, // associate_by
        1, // category
        8729, // company_id
        346, // created_at
        'Top 10 Doom Metal Bands', // name
        1, // status
        346, // updated_at
      ];

      const insertHistory = tracker.history.insert;
      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toEqual('insert');
      expect(insertHistory[0].bindings).toEqual(expectedBindings);

      expect(res).toEqual(expectedResult);
    });
  });
});
