import { EmailPayload } from '@models/email.model';
import { CreateEmailOptionModel } from '@models/event-manager.model';
import slack from '@tools/slack';
import dayjs from 'dayjs';
import _ from 'lodash';

import {
  NOTIFICATION_TEMPLATE_TYPES,
  NOTIFICATION_TYPES as TYPES,
  NOTIFICATION_USER_TYPES as UserTypes,
} from '@services/notification/constant';
import { TaskReminderConstantModel } from '@models/notification.model';

const createEmailOption = async (
  payload: CreateEmailOptionModel,
): Promise<EmailPayload> => {
  let option = {
    to: payload.email,
    templateId: payload.templateId,
    from: {
      email: process.env.NO_REPLY_EMAIL,
      name: process.env.EMAIL_SENDER_NAME,
    },
    data: {
      ...payload,
      receivableRefNo: payload.refNo,
      receivableTitle: payload.title,
      signUpUrl: ``,
      loginUrl: ``,
      dueDate: ``,
      parsedPaymentAmount: payload.totalDue,
      receivablePaymentLink: payload.link,
    },
    attachments: ``,
    subject: '',
  };
  try {
    option = {
      to: payload.email,
      templateId: payload.templateId,
      from: {
        email: process.env.NO_REPLY_EMAIL,
        name: process.env.EMAIL_SENDER_NAME,
      },
      data: {
        ...payload,
        receivableRefNo: payload.refNo,
        receivableTitle: payload.title,
        signUpUrl: `${process.env.WEBSITE_URL}/login`,
        loginUrl: `${process.env.WEBSITE_URL}/login`,
        // taskDueDate:
        dueDate: payload.isTask
          ? dayjs(payload.dueDate).format('LLL')
          : dayjs(payload.dueDate).format('MMMM D, YYYY'),
        parsedPaymentAmount: payload.totalDue,
        receivablePaymentLink: payload.link,
      },
      attachments: _.get(payload, 'attachments'),
      subject: '',
    };
    return option;
  } catch (error) {
    slack.postToDevLog('createEmailOption', error, payload);
    return option;
  }
};

const getNotificationTaskConstant = async ({
  isProject,
  isOnDue,
  isOverdue,
}: {
  isProject: boolean;
  isOnDue?: number;
  isOverdue?: number;
}): Promise<TaskReminderConstantModel | Error | void> => {
  try {
    if (isProject) {
      if (isOnDue && !isOverdue) {
        return TYPES.PROJECT_ON_DUE;
      } else if (!isOnDue && isOverdue) {
        return TYPES.PROJECT_OVERDUE;
      } else {
        return TYPES.PROJECT_REMINDER;
      }
    } else {
      if (isOnDue && !isOverdue) {
        return TYPES.TASK_ON_DUE;
      } else if (!isOnDue && isOverdue) {
        return TYPES.TASK_OVERDUE;
      } else {
        return TYPES.TASK_REMINDER;
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const currentDay = (): number => {
  const day = dayjs().day();

  if (day === 0) {
    return 7;
  } else {
    return day;
  }
};

const getCurrentMonth = (): number => {
  const month = dayjs().month() + 1;

  return month;
};

const getReminderType = async ({
  isResend,
  isCreate,
}: {
  isResend: boolean;
  isCreate: boolean;
}): Promise<string> => {
  try {
    if (isResend) {
      return 'resend';
    } else if (isCreate) {
      return 'create';
    } else {
      return 'reminder';
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getNotificationTemplateType = ({
  isProject,
  isOnDue,
  isOverdue,
}: {
  isProject: undefined | number;
  isOnDue: undefined | number;
  isOverdue: undefined | number;
}) => {
  if (isProject) {
    if (isOnDue) {
      return NOTIFICATION_TEMPLATE_TYPES.PROJECT_ON_DUE;
    } else if (isOverdue) {
      return NOTIFICATION_TEMPLATE_TYPES.PROJECT_OVERDUE;
    } else {
      return NOTIFICATION_TEMPLATE_TYPES.PROJECT_REMINDER;
    }
  } else {
    if (isOnDue) {
      return NOTIFICATION_TEMPLATE_TYPES.TASK_ON_DUE;
    } else if (isOverdue) {
      return NOTIFICATION_TEMPLATE_TYPES.TASK_OVERDUE;
    } else {
      return NOTIFICATION_TEMPLATE_TYPES.TASK_REMINDER;
    }
  }
};

export {
  createEmailOption,
  getNotificationTaskConstant,
  currentDay,
  getCurrentMonth,
  getReminderType,
  getNotificationTemplateType,
};
