import knex from '@db/knex';
import { TaskStore } from '@data-access';
import _ from 'lodash';
import MockDate from 'mockdate';
import { TaskBoardFolderModel } from '@models/task.model';

describe('task board folder CRUD functions', () => {
  const folderName = 'My Folder';
  const mockUserId = 23;
  const mockCompanyId = 879;
  MockDate.set('2022-02-02');
  beforeAll(async () => {
    try {
      await knex.seed.run({
        directory: 'src/__tests__/seeds/tasks',
        specific: 'task-board.seed.ts',
      });
    } catch (error) {
      console.log('migration error', error);
    }
  });

  test('it should create a task board folder', async () => {
    const mockPayload = {
      name: folderName,
      companyId: mockCompanyId,
      type: 2,
      userId: mockUserId,
    };

    const res = await TaskStore.createTaskBoardFolder(mockPayload);
    console.log(res);

    expect(res.name).toBe(folderName);
    expect(res.companyId).toBe(mockCompanyId);

    // const result = _.head(
    //   await knex.from(TableNames.USERS).where('id', user.id).select(),
    // );

    // expect(user).toEqual(result);

    // await knex(TableNames.USERS).where('id', user.id).del();
  });

  afterAll(async () => {
    await knex.destroy();
    MockDate.reset();
  });
});
