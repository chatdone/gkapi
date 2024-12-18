import {
  Expo,
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushErrorTicket,
} from 'expo-server-sdk';
import axios from 'axios';

import { UserService } from '@services';

import { UserId } from '@models/user.model';
import logger from '@tools/logger';

enum PushNotificationType {
  CLOCK_IN_REMINDER = 'clock_in_reminder',
  CLOCK_OUT_REMINDER = 'clock_out_reminder',
  BEFORE_DUE_REMINDER = 'before_due_reminder',
  ON_DUE_REMINDER = 'on_due_reminder',
  OVERDUE_REMINDER = 'overdue_reminder',
  TASK_INVITATION = 'task_invitation',
  TASK_MENTIONED = 'task_mentioned',
  TASK_UPLOADED_ATTACHMENT = 'task_uploaded_attachment',
  TASK_STATUS_UPDATE = 'task_status_update',
  TASK_DELETED = 'task_deleted',
  COMPANY_INVITE_MEMBER = 'company_invite_member',
  COMPANY_REMOVE_MEMBER = 'company_remove_member',
  COMPANY_INVITE_MEMBER_TO_TEAM = 'company_invite_member_to_team',
  COMPANY_REMOVE_MEMBER_FROM_TEAM = 'company_remove_member_from_team',
}

const expo = new Expo();

const sendPushNotification = async ({
  userId,
  message,
}: {
  userId: UserId;
  message: Omit<ExpoPushMessage, 'to' | 'sound' | 'badge'>;
}) => {
  try {
    if (process.env.GK_ENVIRONMENT === 'staging') {
      return;
    }

    const tokens = await UserService.getUserExpoPushTokens(userId);

    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      return;
    }

    const messages: ExpoPushMessage[] = [];

    validTokens.forEach((token) =>
      messages.push({
        to: token,
        sound: 'default',
        badge: 1,
        ...message,
      }),
    );

    const chunks = expo.chunkPushNotifications(messages);

    const tickets: ExpoPushTicket[] = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);

        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    const invalidTokens: string[] = [];

    tickets.forEach((ticket) => {
      const errorTicket = ticket as ExpoPushErrorTicket;
      if (errorTicket && errorTicket.details?.error === 'DeviceNotRegistered') {
        const token = errorTicket.message.match(
          /ExponentPushToken(.*)]/gm,
        )?.[0];

        token && invalidTokens.push(token);
      }
    });

    if (invalidTokens.length > 0) {
      await UserService.removeExpoPushTokens({ userId, tokens: invalidTokens });
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'mobile',
        fnName: 'sendPushNotification',
        userId,
        message,
      },
    });
    return Promise.reject(error);
  }
};

const validatePushTickets = async (pushTicketIds: string[]) => {
  try {
    const res = await axios.post(
      'https://exp.host/--/api/v2/push/getReceipts',
      {
        ids: pushTicketIds,
      },
    );

    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

export default { sendPushNotification, PushNotificationType };
