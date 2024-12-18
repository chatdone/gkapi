import { createLoaders } from '@data-access';
import {
  SubtaskModel,
  TaskAttachmentModel,
  TaskMemberModel,
  TaskModel,
} from '@models/task.model';
import { UserModel } from '@models/user.model';
import {
  EventManagerService,
  UserService,
  CompanyService,
  TaskService,
} from '@services';
import fixtures from '@db-fixtures';

jest.mock('../url/url.service');
jest.mock('../../services/user/user.service');
jest.mock('../../services/task/task.service');
jest.mock('../../services/company/company.service');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    tasks: {
      load: jest.fn().mockImplementation((id) => {
        return { id: 1, published: 0 };
      }),
    },
    taskBoards: {
      load: jest.fn().mockImplementation((id) => {
        return { published: 0 };
      }),
    },
  })),
}));
describe('task.events.ts', () => {
  describe('getUrlForTask', () => {
    test('it should return url for member project', async () => {
      const isMember = true;
      const isProject = 1;
      const slug = 'company-slug-123';
      const taskId = 'task-123';

      const res = await EventManagerService.getUrlForTask({
        isMember,
        isProject,
        slug,
        taskId,
        userId: 1,
      });

      const mockResponse = `${process.env.WEBSITE_URL}/${slug}/task/${taskId}`;

      expect(res).toEqual(mockResponse);
    });

    test('it should return url for member task', async () => {
      const isMember = true;
      const isProject = 0;
      const slug = 'company-slug-123';
      const taskId = 'task-123';
      const res = await EventManagerService.getUrlForTask({
        isMember,
        isProject,
        slug,
        taskId,
      });

      const mockResponse = `${process.env.WEBSITE_URL}/${slug}/task/${taskId}`;

      expect(res).toEqual(mockResponse);
    });

    test('it should return url for PIC shared project', async () => {
      const isMember = false;
      const isProject = 1;
      const slug = 'company-slug-123';
      const taskId = 'task-123';

      (UserService.getDefaultCompany as jest.Mock).mockResolvedValue({
        slug,
      });

      const res = await EventManagerService.getUrlForTask({
        isMember,
        isProject,
        taskId,
        userId: 1,
        slug: 'company-slug-123',
      });

      expect(UserService.getDefaultCompany).toBeCalledWith(1);

      const mockResponse = `${process.env.WEBSITE_URL}/${slug}/shared/${taskId}`;

      expect(res).toEqual(mockResponse);
    });

    test('it should return url for PIC shared task', async () => {
      const isMember = false;
      const isProject = 0;
      const slug = 'company-slug-123';
      const taskId = 'task-123';

      (UserService.getDefaultCompany as jest.Mock).mockResolvedValue({
        slug,
      });

      (CompanyService.getCompanies as jest.Mock).mockResolvedValue([
        {
          slug: 'company-slug-123',
        },
      ]);
      const res = await EventManagerService.getUrlForTask({
        isMember,
        isProject,
        taskId,
        userId: 1,
        slug: 'company-slug-123',
      });

      expect(UserService.getDefaultCompany).toBeCalledWith(1);

      const mockResponse = `${process.env.WEBSITE_URL}/${slug}/shared/${taskId}`;

      expect(res).toEqual(mockResponse);
    });
  });

  describe('handleNotifyAssignToTask', () => {
    test('it should return void if task/taskboard is not published(draft)', async () => {
      const task = {
        id: 1,
        published: 0,
      } as TaskModel;

      (TaskService.isTaskPublished as jest.Mock).mockResolvedValue(false);

      const user = {} as UserModel;

      const taskMember = {} as TaskMemberModel;

      const res = await EventManagerService.handleNotifyAssignToTask({
        taskMember,
        taskPic: undefined,
        task,
        user,
      });

      expect(res).toBeUndefined();
    });
  });

  describe('handleNotifyUploadedToTask', () => {
    test('it should return void if task/taskboard is not published(draft)', async () => {
      const attachment = {
        card_id: 1,
      } as TaskAttachmentModel;
      const mockUser = fixtures.generate('db.user') as UserModel;

      (createLoaders().tasks.load as jest.Mock).mockResolvedValue({
        id: 1,
        published: 0,
      });

      (TaskService.isTaskPublished as jest.Mock).mockResolvedValue(false);

      const res = await EventManagerService.handleNotifyUploadedToTask(
        attachment,
        mockUser,
      );

      expect(res).toBeUndefined();
    });
  });
  describe('handleNotifySubtaskDone', () => {
    test('it should return void if task is not published(draft)', async () => {
      const subtask = {
        card_id: 1,
      } as SubtaskModel;

      (createLoaders().tasks.load as jest.Mock).mockResolvedValue({
        published: 0,
      });
      (TaskService.isTaskPublished as jest.Mock).mockResolvedValue(false);
      const updatedById = 1;

      const res = await EventManagerService.handleNotifySubtaskDone(
        subtask,
        updatedById,
      );

      expect(res).toBeUndefined();
    });
  });

  describe('notifyMentions', () => {
    test('it should return void if task is not published(draft)', async () => {
      const mentionIds = ['uuid1', 'uuid2', 'uuid3'];

      (createLoaders().tasks.load as jest.Mock).mockResolvedValue({
        published: 0,
      });

      (TaskService.isTaskPublished as jest.Mock).mockResolvedValue(false);

      const res = await EventManagerService.notifyMentions({
        mentionIds,
        taskId: 1,
        commenterUserId: 2,
      });

      expect(res).toBeUndefined();
    });
  });

  describe('handleNotifyTaskStageChanged', () => {
    test('it should return void if task is not published(draft)', async () => {
      const task = {
        published: 0,
      } as TaskModel;

      const updatedBy = {} as UserModel;

      (TaskService.isTaskPublished as jest.Mock).mockResolvedValue(false);

      const res = await EventManagerService.handleNotifyTaskStageChanged({
        task,
        updatedBy,
        fromStatusId: 1,
        toStatusId: 2,
      });

      expect(res).toBeUndefined();
    });
  });

  describe('handleNotifyTaskDeleted', () => {
    test('it should return void if task is not published(draft)', async () => {
      const task = {
        published: 0,
      } as TaskModel;

      const deletedBy = {} as UserModel;

      const res = await EventManagerService.handleNotifyTaskDeleted({
        task,
        deletedBy,
        companyId: 1,
      });

      expect(res).toBeUndefined();
    });
  });

  describe('handleNotifyBoardDeleted', () => {
    test('it should return void if task is not published(draft)', async () => {
      (createLoaders().taskBoards.load as jest.Mock).mockResolvedValue({
        published: 0,
      });

      const res = await EventManagerService.handleNotifyBoardDeleted({
        boardId: 1,
        deletedById: 1,
      });

      expect(res).toBeUndefined();
    });
  });
});
