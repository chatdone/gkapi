import knex from 'knex';
import { getTracker, MockClient, Tracker } from 'knex-mock-client';
import { TableNames } from '@db-tables';
import fixtures from '@db-fixtures';

import { camelizeOnly as camelize } from '../utils';
import TaskStore from './task.store';
import { TaskModel } from '@models/task.model';

jest.mock('@db/knex', () => {
  return knex({ client: MockClient });
});

describe('task.store', () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = getTracker();
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('updateTasksArchivedState', () => {
    test('it should get the workspaces', async () => {
      const mockInput = {
        taskIds: [1, 2, 3],
        archived: true,
        userId: 1,
        projectIds: [1, 2, 3],
      };
      const mockTask = fixtures.generate('db.task') as TaskModel;
      const expectedResult = camelize({ ...mockTask, archived: true });
      tracker.on
        .update(TableNames.TASKS)
        .response({ ...mockTask, archived: false });
      tracker.on.select(TableNames.TASKS).response(expectedResult);

      const res = await TaskStore.updateTasksArchivedState(mockInput);

      const selectHistory = tracker.history.select;

      expect(selectHistory[0].method).toEqual('select');

      expect(res).toEqual(expectedResult);
    });
  });
});
