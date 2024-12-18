/* eslint-disable prefer-const */
import _ from 'lodash';
import { asyncCargo } from '../collection/util';
import {
  CollectionStore,
  NotificationStore,
  createLoaders,
  CompanyStore,
} from '@data-access';

import {
  AssignTeamNotificationPayload,
  MessageServiceModel,
  MessageServicesStatus,
  NotificationModel,
  TaskNotificationReminderModel,
} from '@models/notification.model';
import { UserModel } from '@models/user.model';
import {
  CompanyId,
  CompanyMemberModel,
  CompanyModel,
} from '@models/company.model';
import { CollectionId } from '@models/collection.model';
import {
  CollectorService,
  CompanyService,
  EmailService,
  EventManagerService,
  SubscriptionService,
} from '@services';
import { CompanySubscriptionModel } from '@models/subscription.model';
import {
  NOTIFICATION_TEMPLATE_TYPES,
  NOTIFICATION_TYPES as TYPES,
  NOTIFICATION_USER_TYPES as UserTypes,
} from '@services/notification/constant';
import { SERVICE_STATUS, SERVICE_TYPES } from '@services/company/constant';
import { EventCollectionPayload } from '@models/event-manager.model';
import { ContactId, ContactModel } from '@models/contact.model';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import utc from 'dayjs/plugin/utc';
import { UserInputError } from 'apollo-server-errors';
import { createEmailOption } from '@services/event-manager/event-manager.helper';
import logger from '@tools/logger';
dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

const checkQuotaExceeded = async ({
  companyId,
  services,
  contactId,
  loaders,
  collectionId,
}: {
  companyId: CompanyId;
  services: MessageServiceModel;
  contactId: ContactId;
  loaders: any;
  collectionId?: CollectionId;
}): Promise<MessageServicesStatus | Error> => {
  try {
    let exceededServices = [];
    let lowQuotaServices = [];
    const { whatsApp, email } = services;
    const company = (await loaders.companies.load(companyId)) as CompanyModel;
    const companySub = (await CompanyService.getCompanySubscription(
      companyId,
    )) as CompanySubscriptionModel;

    let owner: UserModel;

    if (company.user_id) {
      owner = (await loaders.users.load(
        _.get(company, 'user_id'),
      )) as UserModel;
    } else {
      owner = (await loaders.users.load(
        _.get(company, 'created_by'),
      )) as UserModel;
    }

    const contact = (await loaders.contacts.load(contactId)) as ContactModel;

    let isQuotaOk = {
      whatsApp: true,
      sms: true,
      email: true,
    };

    if (
      whatsApp.quota === 0 &&
      companySub.package_title !== 'Starter' &&
      whatsApp.notify
    ) {
      exceededServices.push('WhatsApp');
      isQuotaOk = {
        ...isQuotaOk,
        whatsApp: false,
      };
    }

    if (email.quota === 0 && email.notify) {
      exceededServices.push('Email');
      isQuotaOk = {
        ...isQuotaOk,
        email: false,
      };
    }

    if (whatsApp.quota === 50) {
      lowQuotaServices.push('WhatsApp');
    }

    if (email.quota === 50) {
      lowQuotaServices.push('Email');
    }

    await notifyQuotaExceededToMembers({
      collectionId,
      company,
      exceededServices,
      contact,
      owner,
      services,
    });

    await notifyLowQuotaToMembers({
      collectionId,
      company,
      contact,
      owner,
      lowQuotaServices,
    });

    return isQuotaOk;
  } catch (error) {
    return Promise.reject({ error });
  }
};

const checkQuotaBeforeCreateCollection = async ({
  companyId,
  serviceNotify,
  contactId,
  loaders,
  isReminder,
}: {
  companyId: CompanyId;
  serviceNotify: {
    whatsAppNotify: boolean;
    emailNotify: boolean;
  };
  contactId: ContactId;
  loaders: any;
  isReminder?: boolean;
}): Promise<boolean | Error> => {
  try {
    const isDevelopment =
      process.env.GK_ENVIRONMENT === 'development' &&
      serviceNotify.whatsAppNotify;

    const isStaging =
      process.env.GK_ENVIRONMENT === 'staging' && serviceNotify.whatsAppNotify;

    if (isDevelopment || isStaging)
      throw new UserInputError(
        'WhatsApp disabled except for production and certain numbers in sandbox',
      );

    const services = await CompanyService.getCompanySubscriptions({
      companyId: companyId,
      data: {
        emailNotify: serviceNotify.emailNotify,
        whatsAppNotify: serviceNotify.whatsAppNotify,
      },
    });

    const isQuotaOk = (await checkQuotaExceeded({
      companyId: companyId,
      services,
      contactId,
      loaders,
    })) as MessageServicesStatus;

    if (!Object.values(isQuotaOk).every(Boolean)) {
      if (isReminder) {
        return false;
      } else {
        throw new UserInputError('Out of quota');
      }
    }

    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

const remindCollectionOnDue = async (): Promise<null | Error> => {
  try {
    const cargo = asyncCargo(30);
    const sendReminder = (records: EventCollectionPayload[]) => {
      _.map(records, async (record) => {
        const overdue = record.is_overdue === 1 ? true : false;
        await cargo.push(async () => {
          try {
            await sendCollectionNotification(record, overdue);
          } catch (e) {
            return Promise.reject(e);
          }
        });
      });
    };

    // ------------------------- Weekly -----------------------//

    const weeklyRecurringResult = (await NotificationStore.getWeeklyReminders({
      remindType: 2,
    })) as EventCollectionPayload[];

    const weeklyResult = (await NotificationStore.getWeeklyReminders({
      remindType: 1,
    })) as EventCollectionPayload[];

    // ------------------------- Monthly -----------------------//

    const monthlyRecurringResult = (await NotificationStore.getMonthlyReminders(
      {
        remindType: 2,
      },
    )) as EventCollectionPayload[];

    const monthlyResult = (await NotificationStore.getMonthlyReminders({
      remindType: 1,
    })) as EventCollectionPayload[];

    // ------------------------- Yearly -----------------------//

    const yearlyRecurringResult = (await NotificationStore.getYearlyReminders({
      remindType: 2,
    })) as EventCollectionPayload[];

    const yearlyResult = (await NotificationStore.getYearlyReminders({
      remindType: 1,
    })) as EventCollectionPayload[];

    // ------------------------- On Due -----------------------//

    const onDueRecurringResults = (await NotificationStore.getOnDueResults({
      remindType: 2,
    })) as EventCollectionPayload[];

    const onDueResults = (await NotificationStore.getOnDueResults({
      remindType: 1,
    })) as EventCollectionPayload[];

    const overdueResults = (await NotificationStore.getOverdueResults({
      remindType: 1,
    })) as EventCollectionPayload[];

    const overdueRecurringResults = (await NotificationStore.getOverdueResults({
      remindType: 2,
    })) as EventCollectionPayload[];

    const allReminders = _.uniqBy(
      [
        ...weeklyRecurringResult,
        ...weeklyResult,
        ...monthlyResult,
        ...monthlyRecurringResult,
        ...yearlyRecurringResult,
        ...yearlyResult,
        ...onDueRecurringResults,
        ...onDueResults,
        ...overdueResults,
        ...overdueRecurringResults,
      ],
      (c) => c.id,
    );

    // consoleLog(allReminders, 'allReminders');

    sendReminder(allReminders);

    return Promise.resolve(null);
  } catch (e) {
    return Promise.reject(e);
  }
};

const sendCollectionNotification = async (
  record: EventCollectionPayload,
  overdue: boolean,
) => {
  try {
    const loaders = createLoaders();

    const contact = (await loaders.contacts.load(
      record.contact_id,
    )) as ContactModel;

    //-------------Check quota if okay -------------------
    const isPaidCompany = await SubscriptionService.isPaidCompany(
      contact.company_id,
    );

    let isQuotaOk = true;

    if (isPaidCompany) {
      isQuotaOk = (await checkQuotaBeforeCreateCollection({
        companyId: contact.company_id,
        serviceNotify: {
          emailNotify: record.email_notify ? true : false,
          whatsAppNotify: record.whatsapp_notify ? true : false,
        },
        contactId: contact.id,
        loaders,
        isReminder: true,
      })) as boolean;
    }
    //------------------end check quota-----------------------------------

    if (isQuotaOk) {
      await EventManagerService.handleCollectionReminderEvent({
        data: record,
        overdue,
        isResend: false,
        isCreate: false,
      });
      if (!process.env.TIMEZONE_FEATURE_TEST) {
        await CollectionStore.updateLastRemindOn(record);
      }
    }

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const remindTaskDueReminder = async (): Promise<null | Error> => {
  try {
    const cargo = asyncCargo(30);
    const sendReminder = (records: TaskNotificationReminderModel[]) => {
      _.map(records, async (record) => {
        await cargo.push(async () => {
          try {
            const res = await EventManagerService.handleTaskReminderEvent(
              record,
            );
            if (res === true && !process.env.TIMEZONE_FEATURE_TEST) {
              await NotificationStore.updateLastRemindOnTask(record.id);
            }
          } catch (e) {
            return Promise.reject(e);
          }
        });
      });
    };

    const reminderTasks =
      (await NotificationStore.getReminderTasksTimezone()) as TaskNotificationReminderModel[];
    // consoleLog(reminderTasks, 'reminderTasks');
    sendReminder(reminderTasks);

    const onDueTasks =
      (await NotificationStore.getOnDueTasksTimezone()) as TaskNotificationReminderModel[];

    // consoleLog(onDueTasks, 'onDueTasks');
    sendReminder(onDueTasks);

    return null;
  } catch (error) {
    return Promise.reject(error);
  }
};

const remindProjectTasksAndOverdueTasks = async (): Promise<null | Error> => {
  try {
    const cargo = asyncCargo(30);
    const sendReminder = (records: TaskNotificationReminderModel[]) => {
      _.map(records, async (record) => {
        await cargo.push(async () => {
          try {
            const res = await EventManagerService.handleTaskReminderEvent(
              record,
            );
            if (res === true && !process.env.TIMEZONE_FEATURE_TEST) {
              await NotificationStore.updateLastRemindOnTask(record.id);
            }
          } catch (e) {
            return Promise.reject(e);
          }
        });
      });
    };

    const onDueProjectTasks =
      (await NotificationStore.getOnDueProjectTasksTimezone()) as TaskNotificationReminderModel[];

    sendReminder(onDueProjectTasks);

    const overdueProjectTasks =
      (await NotificationStore.getOverdueTasksTimezone(
        true,
      )) as TaskNotificationReminderModel[];
    sendReminder(overdueProjectTasks);

    const overdueTasks =
      (await NotificationStore.getOverdueTasksTimezone()) as TaskNotificationReminderModel[];
    sendReminder(overdueTasks);

    return null;
  } catch (error) {
    return Promise.reject(error);
  }
};

const isRemindedQuotaExceeded = async (
  lastRemind: string | null | undefined,
) => {
  try {
    if (!lastRemind) {
      return false;
    }
    const timeDifference = dayjs().diff(dayjs(lastRemind), 'hour');

    if (timeDifference <= 24) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const notifyQuotaExceededToMembers = async ({
  exceededServices,
  collectionId,
  company,
  owner,
  services,
  contact,
}: {
  exceededServices: string[];
  collectionId?: CollectionId;
  company: CompanyModel;
  owner: UserModel;
  services: MessageServiceModel;
  contact: ContactModel;
}) => {
  try {
    if (_.isEmpty(exceededServices)) {
      return null;
    }
    const loaders = createLoaders();

    const lastRemindExceeded = await CompanyService.getLastRemindExceeded(
      company.id,
    );
    const hasRemindedExceed = await isRemindedQuotaExceeded(lastRemindExceeded);
    if (hasRemindedExceed) {
      return null;
    }

    const exceededServicesString = _.join(exceededServices, ', ');

    const collectorMembers =
      await CollectorService.getCollectorMembersByCollectorId({
        collectorId: _.get(contact, 'id'),
      });

    const memberIds = _.map(collectorMembers, (each) => {
      return _.get(each, 'member_id');
    });

    const companyMembers = (await loaders.companyMembers.loadMany(
      memberIds,
    )) as CompanyMemberModel[];
    const userIds = _.map(companyMembers, (each) => {
      return _.get(each, 'user_id');
    });

    const companyUsers = (await loaders.users.loadMany(userIds)) as UserModel[];

    await Promise.all(
      _.map(companyUsers, async (user) => {
        await EventManagerService.createQuotaExceededNotification({
          services: exceededServicesString,
          companyId: company?.id,
          recipientId: user?.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.QUOTA_EXCEED,
        });
      }),
    );

    let data = '';
    await Promise.all(
      _.map(exceededServices, async (each) => {
        let type;
        let status = SERVICE_STATUS.FAILED.value;

        if (each === 'WhatsApp') {
          type = SERVICE_TYPES.WHATSAPP;
        } else {
          type = SERVICE_TYPES.EMAIL;
        }
        data = JSON.stringify(`${each} has exceeded quota`);

        if (typeof collectionId === 'number') {
          await CompanyService.createCompanyServiceHistory({
            companyId: company?.id,
            collectionId,
            type,
            status,
            to: owner.email,
            data,
          });
        }
      }),
    );

    const templateId = TYPES.QUOTA_EXCEED.template;

    await Promise.all(
      _.map(companyUsers, async (cu) => {
        const option = await createEmailOption({
          email: cu.email,
          receiverName: cu.name,
          templateId,
          companyLogoUrl: company.logo_url,
          companyName: company.name,
          exceededServicesString,
        });
        await EmailService.sendEmail(option);
      }),
    );

    await CompanyStore.updateCompanyQuotaLastRemind(company.id);
  } catch (error) {
    logger.errorLogger.log('info', 'notifyQuotaExceededToMembers', {
      error,
      company,
    });
    return null;
  }
};

const notifyLowQuotaToMembers = async ({
  lowQuotaServices,
  collectionId,
  company,
  owner,
  contact,
}: {
  lowQuotaServices: string[];
  collectionId?: CollectionId;
  company: CompanyModel;
  owner: UserModel;
  contact: ContactModel;
}) => {
  try {
    if (_.isEmpty(lowQuotaServices)) {
      return null;
    }
    const loaders = createLoaders();

    const lowQuotaServicesString = _.join(lowQuotaServices, ', ');

    const collectorMembers =
      await CollectorService.getCollectorMembersByCollectorId({
        collectorId: _.get(contact, 'id'),
      });

    const memberIds = _.map(collectorMembers, (each) => {
      return _.get(each, 'member_id');
    });

    const companyMembers = (await loaders.companyMembers.loadMany(
      memberIds,
    )) as CompanyMemberModel[];
    const userIds = _.map(companyMembers, (each) => {
      return _.get(each, 'user_id');
    });

    const companyUsers = (await loaders.users.loadMany(userIds)) as UserModel[];

    await Promise.all(
      _.map(companyUsers, async (user) => {
        await EventManagerService.createQuotaExceededNotification({
          services: lowQuotaServicesString,
          companyId: company?.id,
          recipientId: user?.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.LOW_QUOTA,
        });
      }),
    );

    let data = '';
    await Promise.all(
      _.map(lowQuotaServices, async (each) => {
        let type;
        let status = SERVICE_STATUS.FAILED.value;

        if (each === 'WhatsApp') {
          type = SERVICE_TYPES.WHATSAPP;
        } else {
          type = SERVICE_TYPES.EMAIL;
        }
        data = JSON.stringify(`${each} has exceeded quota`);

        if (typeof collectionId === 'number') {
          await CompanyService.createCompanyServiceHistory({
            companyId: company?.id,
            collectionId,
            type,
            status,
            to: owner.email,
            data,
          });
        }
      }),
    );

    const templateId = TYPES.LOW_QUOTA.template;

    await Promise.all(
      _.map(companyUsers, async (cu) => {
        const option = await createEmailOption({
          email: cu.email,
          receiverName: cu.name,
          templateId,
          companyLogoUrl: company.logo_url,
          companyName: company.name,
          lowQuotaServicesString,
        });
        await EmailService.sendEmail(option);
      }),
    );
  } catch (error) {
    logger.errorLogger.log('info', 'notifyLowQuotaToMembers', {
      error,
      company,
    });
    return null;
  }
};

export default {
  checkQuotaExceeded,
  checkQuotaBeforeCreateCollection,
  remindCollectionOnDue,
  remindTaskDueReminder,
  remindProjectTasksAndOverdueTasks,
  isRemindedQuotaExceeded,
  notifyQuotaExceededToMembers,
  notifyLowQuotaToMembers,
};
