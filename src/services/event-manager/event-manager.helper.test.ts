// import { EventManagerService, NotificationService } from '@services';
import { TaskReminderConstantModel } from '@models/notification.model';
import { NOTIFICATION_TYPES as TYPES } from '@services/notification/constant';
import fixtures from '@test/fixtures';
import { getNotificationTaskConstant } from './event-manager.helper';

jest.mock('../../tools/s3');
jest.mock('../url/url.service');
jest.mock('../subscription/subscription.service');
jest.mock('../../data-access');
jest.mock('../../services/notification/constant');
jest.mock('../notification/notification.service');
jest.mock('../../data-access/notification/notification.store');
jest.mock('../../services/timesheet/timesheet.service');
jest.mock('@data-access/loaders', () => ({
  createLoaders: jest.fn(() => ({
    contactPics: {
      loadMany: jest.fn().mockImplementation((ids) => {
        return fixtures.generate('contactPic', ids.length);
      }),
    },
    timesheetActivities: {
      load: jest.fn().mockImplementation(() => {
        return { task_id: 120 };
      }),
    },
    companyMembers: {
      load: jest.fn().mockImplementation(() => {
        return { company_id: 420 };
      }),
    },
  })),
}));

describe('event-manager.helper.ts', () => {
  describe('createEmailOption', () => {
    test('it should create the option obj', async () => {
      // const res = await createEmailOption(emailOptionParams);
      // expect(res).toEqual(mockEmailOptionResponse);
    });
  });

  describe('getNotificationTaskConstant', () => {
    test('it should get task constant if for reminder', async () => {
      const isProject = false;

      const isOnDue = 0;
      const isOverdue = 0;

      const res = (await getNotificationTaskConstant({
        isProject,

        isOnDue,
        isOverdue,
      })) as TaskReminderConstantModel;

      expect(res).toEqual(TYPES.TASK_REMINDER);
    });

    test('it should get task constant if for on due', async () => {
      const isProject = false;

      const isOnDue = 1;
      const isOverdue = 0;

      const res = (await getNotificationTaskConstant({
        isProject,

        isOnDue,
        isOverdue,
      })) as TaskReminderConstantModel;

      expect(res).toEqual(TYPES.TASK_ON_DUE);
    });

    test('it should get task constant if for overdue', async () => {
      const isProject = false;

      const isOnDue = 0;
      const isOverdue = 1;

      const res = (await getNotificationTaskConstant({
        isProject,

        isOnDue,
        isOverdue,
      })) as TaskReminderConstantModel;

      expect(res).toEqual(TYPES.TASK_OVERDUE);
    });

    test('it should get project task constant if for reminder', async () => {
      const isProject = true;

      const isOnDue = 0;
      const isOverdue = 0;

      const res = (await getNotificationTaskConstant({
        isProject,

        isOnDue,
        isOverdue,
      })) as TaskReminderConstantModel;

      expect(res).toEqual(TYPES.PROJECT_REMINDER);
    });

    test('it should get project task constant if for on due', async () => {
      const isProject = true;

      const isOnDue = 1;
      const isOverdue = 0;

      const res = (await getNotificationTaskConstant({
        isProject,

        isOnDue,
        isOverdue,
      })) as TaskReminderConstantModel;

      expect(res).toEqual(TYPES.PROJECT_ON_DUE);
    });

    test('it should get project task constant if for overdue', async () => {
      const isProject = true;

      const isOnDue = 0;
      const isOverdue = 1;

      const res = (await getNotificationTaskConstant({
        isProject,

        isOnDue,
        isOverdue,
      })) as TaskReminderConstantModel;

      expect(res).toEqual(TYPES.PROJECT_OVERDUE);
    });
  });
});
