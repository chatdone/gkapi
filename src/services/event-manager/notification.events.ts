import { CollectionId } from '@models/collection.model';
import { CompanyId } from '@models/company.model';
import { TaskBoardId, TaskId } from '@models/task.model';
import { TeamId } from '@models/team.model';
import { UserId } from '@models/user.model';
import { NOTIFICATION_TEMPLATE_TYPES } from '@services/notification/constant';
import logger from '@tools/logger';
import slack from '@tools/slack';
import { consoleLog } from '@tools/utils';
import axios from 'axios';

const baseUrl = `${process.env.NOTIFICATION_API_URL}`;

const api = axios.create({
  baseURL: baseUrl,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const createTaskReminderNotification = async ({
  taskId,
  dueDate,
  recipientId,
  templateType,
  dueDays,
}: {
  taskId: TaskId;
  dueDate: string;
  dueDays: string;
  recipientId: UserId;
  templateType: number;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          templateType,
          dueDate,
          recipientId,
          dueDays,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log('info', 'createTaskReminderNotification', err);
          slack.postToDevLog('createTaskReminderNotification', err);
        });
    } else {
      return;
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createTaskReminderNotification', error);
    slack.postToDevLog('createTaskReminderNotification', error);
    return;
  }
};

const createSubtaskDoneNotification = async ({
  taskId,
  userId,
  recipientId,
  createdBy,
}: {
  taskId: TaskId;
  userId: UserId;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          userId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.SUBTASK_DONE,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log('info', 'createSubtaskDoneNotification', err);
          slack.postToDevLog('createSubtaskDoneNotification', err);
        });
    } else {
      return;
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createSubtaskDoneNotification', error);
    slack.postToDevLog('createSubtaskDoneNotification', error);
  }
};

const createCommentMentionedNotification = async ({
  userId,
  taskId,
  recipientId,
  createdBy,
}: {
  userId: UserId;
  taskId: TaskId;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          userId,
          taskId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.COMMENT_ON_TASK,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createCommentMentionedNotification',
            err,
          );
          slack.postToDevLog('createCommentMentionedNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createCommentMentionedNotification', error);
    slack.postToDevLog('createCommentMentionedNotification', error);
  }
};

const createAssignToTaskNotification = async ({
  userId,
  taskId,
  recipientId,
  createdBy,
}: {
  userId: UserId;
  taskId: TaskId;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          userId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.ASSIGNED_TO_TASK,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log('info', 'createAssignToTaskNotification', err);
          slack.postToDevLog('createAssignToTaskNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createAssignToTaskNotification', error);
    slack.postToDevLog('createAssignToTaskNotification', error);
  }
};

const createUploadedToTaskNotification = async ({
  userId,
  taskId,
  recipientId,
  createdBy,
}: {
  userId: UserId;
  taskId: TaskId;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          userId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.UPLOAD_TO_TASK,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createUploadedToTaskNotification',
            err,
          );
          slack.postToDevLog('createUploadedToTaskNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createUploadedToTaskNotification', error);
    slack.postToDevLog('createUploadedToTaskNotification', error);
  }
};

const createCollectionReminderNotification = async ({
  collectionId,
  companyId,
  recipientId,
  templateType,
  amount,
  dueDate,
}: {
  collectionId: CollectionId;
  companyId: CompanyId;
  recipientId: UserId;
  templateType: number;
  amount: string;
  dueDate: string;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          collectionId,
          companyId,
          templateType,
          recipientId,
          amount,
          dueDate,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createCollectionReminderNotification',
            err,
          );
          slack.postToDevLog('createCollectionReminderNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log(
      'info',
      'createCollectionReminderNotification',
      error,
    );
    slack.postToDevLog('createCollectionReminderNotification', error);
  }
};

const createInvitedToCompanyNotification = async ({
  userId,
  companyId,
  memberType,
  recipientId,
  createdBy,
}: {
  userId: UserId;
  companyId: CompanyId;
  memberType: string;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          userId,
          companyId,
          memberType,
          templateType: NOTIFICATION_TEMPLATE_TYPES.INVITED_TO_COMPANY,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createInvitedToCompanyNotification',
            err,
          );
          slack.postToDevLog('createInvitedToCompanyNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createInvitedToCompanyNotification', error);
    slack.postToDevLog('createInvitedToCompanyNotification', error);
  }
};

const createPaymentStatusForPicNotification = async ({
  userId,
  companyId,
  collectionId,
  recipientId,
  templateType,
  createdBy,
}: {
  userId: UserId;
  companyId: CompanyId;
  collectionId: CollectionId;
  recipientId: UserId;
  templateType: number;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          userId,
          companyId,
          collectionId,
          templateType,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createPaymentStatusForPicNotification',
            err,
          );
          slack.postToDevLog('createPaymentStatusForPicNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log(
      'info',
      'createPaymentStatusForPicNotification',
      error,
    );
    slack.postToDevLog('createPaymentStatusForPicNotification', error);
  }
};

const createPaymentStatusForMemberNotification = async ({
  userId,
  collectionId,
  recipientId,
  templateType,
  createdBy,
}: {
  userId: UserId;
  collectionId: CollectionId;
  recipientId: UserId;
  templateType: number;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          userId,
          collectionId,
          templateType,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createPaymentStatusForMemberNotification',
            err,
          );
          slack.postToDevLog('createPaymentStatusForMemberNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log(
      'info',
      'createPaymentStatusForMemberNotification',
      error,
    );
    slack.postToDevLog('createPaymentStatusForMemberNotification', error);
  }
};

const createAttendanceReminderNotification = async ({
  recipientId,
  templateType,
  companyId,
}: {
  recipientId: UserId;
  templateType: number;
  companyId: CompanyId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          templateType,
          recipientId,
          companyId,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createAttendanceReminderNotification',
            err,
          );
          slack.postToDevLog('createAttendanceReminderNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log(
      'info',
      'createAttendanceReminderNotification',
      error,
    );
    slack.postToDevLog('createAttendanceReminderNotification', error);
  }
};

const createPaymentSpPaidNotification = async ({
  collectionId,
  recipientId,
}: {
  collectionId: CollectionId;
  recipientId: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          collectionId,
          templateType:
            NOTIFICATION_TEMPLATE_TYPES.COLLECTION_PAYMENT_RECEIVED_SP,
          recipientId,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createPaymentSpPaidNotification',
            err,
          );
          slack.postToDevLog('createPaymentSpPaidNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createPaymentSpPaidNotification', error);
    slack.postToDevLog('createPaymentSpPaidNotification', error);
  }
};

const createAssignedToTeamNotification = async ({
  userId,
  teamId,
  recipientId,
  createdBy,
}: {
  userId: UserId;
  teamId: TeamId;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          userId,
          teamId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.ASSIGNED_TO_TEAM,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createAssignedToTeamNotification',
            err,
          );
          slack.postToDevLog('createAssignedToTeamNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createAssignedToTeamNotification', error);
    slack.postToDevLog('createAssignedToTeamNotification', error);
  }
};

const createRemovedFromTeamNotification = async ({
  teamId,
  recipientId,
  createdBy,
}: {
  teamId: TeamId;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          teamId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.REMOVED_FROM_TEAM,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createRemovedFromTeamNotification',
            err,
          );
          slack.postToDevLog('createRemovedFromTeamNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createRemovedFromTeamNotification', error);
    slack.postToDevLog('createRemovedFromTeamNotification', error);
  }
};

const createMemberTypeChangedNotification = async ({
  userId,
  memberType,
  recipientId,
  companyId,
  createdBy,
}: {
  userId: UserId;
  memberType: string;
  recipientId: UserId;
  companyId: CompanyId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          userId,
          memberType,
          companyId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.ASSIGNED_MEMBER_TYPE,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createMemberTypeChangedNotification',
            err,
          );
          slack.postToDevLog('createMemberTypeChangedNotification', err, {
            userId,
            memberType,
            recipientId,
          });
        });
    }
  } catch (error) {
    logger.errorLogger.log(
      'info',
      'createMemberTypeChangedNotification',
      error,
    );
    slack.postToDevLog('createMemberTypeChangedNotification', error, {
      userId,
      memberType,
      recipientId,
    });
  }
};

const createQuotaExceededNotification = async ({
  services,
  companyId,
  recipientId,
  templateType,
}: {
  services: string;
  companyId: CompanyId;
  recipientId: UserId;
  templateType: number;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          services,
          companyId,
          templateType,
          recipientId,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createQuotaExceededNotification',
            err,
          );
          slack.postToDevLog('createQuotaExceededNotification', err, {
            services,
            companyId,
            recipientId,
          });
        });
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createQuotaExceededNotification', error);
    slack.postToDevLog('createQuotaExceededNotification', error, {
      services,
      companyId,
      recipientId,
    });
  }
};

const createTaskStageChangeNotification = async ({
  taskId,
  userId,
  recipientId,
  createdBy,
  fromStatusId,
  toStatusId,
}: {
  taskId: TaskId;
  userId: UserId;
  recipientId: UserId;
  createdBy: UserId;
  fromStatusId: number;
  toStatusId: number;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          userId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.STAGE_CHANGED,
          recipientId,
          createdBy,
          fromStatusId,
          toStatusId,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createTaskStageChangeNotification',
            err,
          );
          slack.postToDevLog('createTaskStageChangeNotification', err);
        });
    } else {
      return;
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createTaskStageChangeNotification', error);
    slack.postToDevLog('createTaskStageChangeNotification', error);
  }
};

const createProjectStatusChangeNotification = async ({
  taskId,
  userId,
  recipientId,
  createdBy,
  fromStatusId,
  toStatusId,
}: {
  taskId: TaskId;
  userId: UserId;
  recipientId: UserId;
  createdBy: UserId;
  fromStatusId: number;
  toStatusId: number;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          userId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.STATUS_CHANGED,
          recipientId,
          createdBy,
          fromStatusId,
          toStatusId,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createProjectStatusChangeNotification',
            err,
          );
          slack.postToDevLog('createProjectStatusChangeNotification', err);
        });
    } else {
      return;
    }
  } catch (error) {
    logger.errorLogger.log(
      'info',
      'createProjectStatusChangeNotification',
      error,
    );
    slack.postToDevLog('createProjectStatusChangeNotification', error);
  }
};

const createTaskDeletedNotification = async ({
  taskId,
  createdBy,
  recipientId,
  templateType,
}: {
  taskId: TaskId;
  createdBy: UserId;
  recipientId: UserId;
  templateType: number;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          templateType,
          createdBy,
          recipientId,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log('info', 'createTaskDeletedNotification', err);
          slack.postToDevLog('createTaskDeletedNotification', err);
        });
    } else {
      return;
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createTaskDeletedNotification', error);
    slack.postToDevLog('createTaskDeletedNotification', error);
    return;
  }
};

const createBoardDeletedNotification = async ({
  boardId,
  createdBy,
  recipientId,
  templateType,
}: {
  boardId: TaskBoardId;
  createdBy: UserId;
  recipientId: UserId;
  templateType: number;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          boardId,
          templateType,
          createdBy,
          recipientId,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log('info', 'createTaskDeletedNotification', err);
          slack.postToDevLog('createTaskDeletedNotification', err);
        });
    } else {
      return;
    }
  } catch (error) {
    logger.errorLogger.log('info', 'createTaskDeletedNotification', error);
    slack.postToDevLog('createTaskDeletedNotification', error);
    return;
  }
};

const createAssignWatcherToTaskNotification = async ({
  userId,
  taskId,
  recipientId,
  createdBy,
}: {
  userId: UserId;
  taskId: TaskId;
  recipientId: UserId;
  createdBy: UserId;
}) => {
  try {
    if (process.env.NOTIFICATION_FEATURE) {
      await api
        .post('/api/notifications/create', {
          taskId,
          userId,
          templateType: NOTIFICATION_TEMPLATE_TYPES.WATCHER_ASSIGNED_TO_TASK,
          recipientId,
          createdBy,
        })
        .then((response) => {
          consoleLog(response?.data);
        })
        .catch((err) => {
          logger.errorLogger.log(
            'info',
            'createAssignWatcherToTaskNotification',
            err,
          );
          slack.postToDevLog('createAssignWatcherToTaskNotification', err);
        });
    }
  } catch (error) {
    logger.errorLogger.log(
      'info',
      'createAssignWatcherToTaskNotification',
      error,
    );
    slack.postToDevLog('createAssignWatcherToTaskNotification', error);
  }
};

export {
  createTaskReminderNotification,
  createSubtaskDoneNotification,
  createCommentMentionedNotification,
  createAssignToTaskNotification,
  createUploadedToTaskNotification,
  createCollectionReminderNotification,
  createInvitedToCompanyNotification,
  createPaymentStatusForPicNotification,
  createPaymentStatusForMemberNotification,
  createAttendanceReminderNotification,
  createPaymentSpPaidNotification,
  createAssignedToTeamNotification,
  createRemovedFromTeamNotification,
  createMemberTypeChangedNotification,
  createQuotaExceededNotification,
  createTaskStageChangeNotification,
  createTaskDeletedNotification,
  createBoardDeletedNotification,
  createProjectStatusChangeNotification,
  createAssignWatcherToTaskNotification,
};
