import { createLoaders } from '@data-access';
import { companyMemberTypes } from '@data-access/company/company.store';
import {
  CompanyId,
  CompanyMemberId,
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamModel,
} from '@models/company.model';
import { ContactModel, ContactPicModel } from '@models/contact.model';
import { TaskNotificationReminderModel } from '@models/notification.model';
import {
  ProjectStatusModel,
  SubtaskModel,
  TaskAttachmentModel,
  TaskBoardId,
  TaskBoardModel,
  TaskBoardOwnerModel,
  TaskBoardTeamModel,
  TaskId,
  TaskMemberModel,
  TaskModel,
  TaskPicModel,
} from '@models/task.model';
import { UserId, UserModel } from '@models/user.model';
import {
  CompanyService,
  EmailService,
  TaskService,
  UserService,
  MobileService,
} from '@services';
import {
  NOTIFICATION_TEMPLATE_TYPES,
  NOTIFICATION_TYPES as TYPES,
} from '@services/notification/constant';
import {
  ASSIGN_WATCHER_TO_TASK,
  BOARD_DELETED,
  TASK_DELETED,
} from '@tools/email-templates';
import logger from '@tools/logger';
import slack from '@tools/slack';
import dayjs from 'dayjs';
import _ from 'lodash';
import {
  createEmailOption,
  getNotificationTaskConstant,
  getNotificationTemplateType,
} from './event-manager.helper';
import * as NotificationEvents from './notification.events';

const handleTaskReminderEvent = async (
  eventTask: TaskNotificationReminderModel,
): Promise<boolean | Error | void> => {
  try {
    const cardName = eventTask?.name;
    const dueDate = eventTask?.dueDate;
    const taskMembers = (await TaskService.getTaskMembersByTaskId({
      taskId: eventTask?.id,
    })) as TaskMemberModel[];

    const taskPics = (await TaskService.getTaskPicsByTaskId({
      taskId: eventTask?.id,
    })) as TaskPicModel[];

    const memberUsers = (await getUsersFromTaskMembers(
      taskMembers,
    )) as UserModel[];
    const watcherUsers = (await getWatchersAsUsers(
      eventTask?.id,
    )) as UserModel[];
    const allMemberUsers = [...memberUsers, ...watcherUsers];
    const picUsers = (await getUsersFromTaskPics(taskPics)) as UserModel[];

    const uniqPicUsers = _.uniqBy(picUsers, 'id');
    const isProject = eventTask?.category || 0;

    const constant = await getNotificationTaskConstant({
      isProject: eventTask?.category === 1 ? true : false,
      isOnDue: eventTask?.isOnDue,
      isOverdue: eventTask?.isOverdue,
    });

    if (!constant || constant instanceof Error) {
      return slack.postToDevLog('handleTaskReminderEvent', constant, eventTask);
    }

    const dueDaysNumber = dayjs(eventTask?.dueDate)
      .add(eventTask?.dueReminder || 0, 'minute')
      .diff(dayjs(), 'day');

    const dueDays = `${dueDaysNumber} ${dueDaysNumber > 1 ? 'days' : 'day'}`;

    await Promise.all(
      _.map(uniqPicUsers, async (pu) => {
        const receiverName = _.get(pu, 'name');
        const email = _.get(pu, 'email');
        let url = await getUrlForTask({
          isMember: false,
          isProject,

          taskId: eventTask?.id_text,

          slug: eventTask?.companySlug,
          userId: pu?.id,
        });

        if (typeof url !== 'string') {
          url = '';
        }

        const userTimezone = await UserService.getUserDefaultTimezone(pu?.id);

        const option = await createEmailOption({
          templateId: constant.PIC?.template as string,
          receiverName,
          url,
          cardName,
          isTask: true,
          dueDate: dayjs(dueDate)
            .tz(userTimezone)
            .format('YYYY-MM-DD HH:mm:ss'),
          dueDays,
          email,
          companyLogoUrl: eventTask.companyLogoUrl,
          isProject,
          companyName: eventTask?.companyName,
          taskBoardName: eventTask?.taskBoardName,
        });

        if (process.env.NOTIFICATION_FEATURE) {
          await NotificationEvents.createTaskReminderNotification({
            taskId: eventTask?.id,

            templateType: getNotificationTemplateType({
              isOnDue: eventTask?.isOnDue,
              isOverdue: eventTask?.isOverdue,
              isProject: eventTask?.category,
            }),
            dueDate,
            dueDays,
            recipientId: pu?.id,
          });

          const userDateTime = dayjs().tz(userTimezone);
          const isUser8am =
            userDateTime.hour() === 8 && userDateTime.minute() === 0;

          if (eventTask.isOverdue && isUser8am) {
            await MobileService.sendPushNotification({
              userId: pu.id,
              message: {
                title: 'Task Reminder',
                body: `${eventTask.name} is overdue on ${dayjs(dueDate)
                  .tz(userTimezone)
                  .format(
                    'YYYY-MM-DD HH:mm:ss',
                  )} and it requires your attention.`,
                data: {
                  companyId: eventTask.companyId,
                  taskId: eventTask.id_text,
                  type: MobileService.PushNotificationType.OVERDUE_REMINDER,
                },
              },
            });
          } else {
            await MobileService.sendPushNotification({
              userId: pu.id,
              message: {
                title: 'Task Reminder',
                body: eventTask.isOnDue
                  ? `${eventTask.name} is due now`
                  : `${eventTask.name} will be due on ${dayjs(dueDate)
                      .tz(userTimezone)
                      .format(
                        'YYYY-MM-DD HH:mm:ss',
                      )} and it requires your attention`,
                data: {
                  companyId: eventTask.companyId,
                  taskId: eventTask.id_text,
                  type: eventTask.isOnDue
                    ? MobileService.PushNotificationType.ON_DUE_REMINDER
                    : MobileService.PushNotificationType.BEFORE_DUE_REMINDER,
                },
              },
            });
          }
        }

        if (!option) {
          slack.postToDevLog(
            'handleTaskReminderEvent createOptionFailed',
            'createOptionFailed',
          );

          return;
        }
        await EmailService.sendEmail(option);
      }),
    );

    const uniqMemberUsers = _.uniqBy(allMemberUsers, 'id');

    await Promise.all(
      _.map(uniqMemberUsers, async (mu) => {
        const receiverName = mu.name;
        const email = mu?.email;

        let url = await getUrlForTask({
          isMember: true,
          isProject,

          taskId: eventTask?.id_text,

          slug: eventTask?.companySlug,
        });

        if (typeof url !== 'string') {
          url = '';
        }

        const userTimezone = await UserService.getUserDefaultTimezone(mu?.id);

        const option = await createEmailOption({
          templateId: constant.MEMBER?.template as string,
          receiverName,
          url,
          cardName,
          isTask: true,
          dueDate: dayjs(dueDate)
            .tz(userTimezone)
            .format('YYYY-MM-DD HH:mm:ss'),
          dueDays,
          email,
          companyLogoUrl: eventTask.companyLogoUrl,
          isProject,
          companyName: eventTask?.companyName,
          taskBoardName: eventTask?.taskBoardName,
        });

        await NotificationEvents.createTaskReminderNotification({
          taskId: eventTask?.id,
          templateType: getNotificationTemplateType({
            isOnDue: eventTask?.isOnDue,
            isOverdue: eventTask?.isOverdue,
            isProject: eventTask?.category,
          }),
          dueDate,
          dueDays,
          recipientId: mu?.id,
        });

        await EmailService.sendEmail(option);
      }),
    );

    return true;
  } catch (error) {
    slack.postToDevLog('handleTaskReminderEvent', error, eventTask);
  }
};

const handleNotifyTaskAssignees = async (input: {
  assignees: { taskId: TaskId; userId: UserId; memberId: CompanyMemberId }[];
  addedBy: UserModel;
}) => {
  try {
    const { assignees, addedBy } = input;
    const taskId = _.head(assignees)?.taskId as TaskId;
    const loaders = createLoaders();
    const task = (await loaders.tasks.load(taskId)) as TaskModel;

    const taskMembers = (await TaskService.getTaskMembersByTaskIdAndMemberId({
      memberIds: _.map(assignees, 'memberId'),
      taskId,
    })) as TaskMemberModel[];
    for (let i = 0; i < taskMembers.length; i++) {
      await handleNotifyAssignToTask({
        taskMember: taskMembers[i],
        user: addedBy,
        task,
      });
    }
  } catch (error) {
    slack.postToDevLog('handleNotifyTaskAssignees', error, input);
  }
};

const handleNotifyTaskWatchers = async (input: {
  watcherIds: CompanyMemberId[];
  addedBy: UserModel;
  taskId: TaskId;
}) => {
  try {
    const { watcherIds, addedBy, taskId } = input;

    const loaders = createLoaders();
    const task = (await loaders.tasks.load(taskId)) as TaskModel;

    const taskMembers = (await loaders.companyMembers.loadMany(
      watcherIds,
    )) as CompanyMemberModel[];
    for (let i = 0; i < taskMembers.length; i++) {
      await handleNotifyAssignWatcherToTask({
        watcher: taskMembers[i],
        user: addedBy,
        task,
      });
    }
  } catch (error) {
    slack.postToDevLog('handleNotifyTaskWatchers', error, input);
  }
};

const handleNotifyAssignWatcherToTask = async ({
  watcher,
  user,
  task,
}: {
  watcher?: CompanyMemberModel;
  user: UserModel;
  task: TaskModel;
}): Promise<boolean | void> => {
  try {
    const isPublished = await TaskService.isTaskPublished(task?.id);
    if (!isPublished) {
      return;
    }
    const loaders = createLoaders();
    const taskboard = (await loaders.taskBoards.load(
      task?.job_id,
    )) as TaskBoardModel;

    if (!taskboard?.published) {
      return;
    }

    if (!watcher) {
      return;
    }

    const cardName = task?.name;

    let contact;
    if (taskboard?.contact_id) {
      contact = (await loaders.contacts.load(
        taskboard?.contact_id as number,
      )) as ContactModel;
    }
    const company = (await loaders.companies.load(
      taskboard?.company_id,
    )) as CompanyModel;
    const companyName = company?.name;
    let receiverName;
    let url;
    const contactName = contact?.name;
    let email;
    const companyLogoUrl = company?.logo_url;
    const updatedBy = user.name;
    const templateId = ASSIGN_WATCHER_TO_TASK;
    let assigneeUserId;
    const taskBoardName = contact ? contact?.name : taskboard?.name;
    const isProject = taskboard?.category;

    if (watcher) {
      const member = (await loaders.companyMembers.load(
        watcher.id,
      )) as CompanyMemberModel;

      const memberUser = (await loaders.users.load(
        member.user_id,
      )) as UserModel;

      email = memberUser.email && member?.active ? memberUser.email : undefined;
      url = await getUrlForTask({
        isMember: true,
        isProject,
        taskId: task.id_text,
        slug: company?.slug,
      });

      if (typeof url !== 'string') {
        url = '';
      }
      receiverName = memberUser?.name;
      assigneeUserId = memberUser.id;

      if (member?.active) {
        await NotificationEvents.createAssignWatcherToTaskNotification({
          taskId: task?.id,
          userId: user?.id,
          recipientId: assigneeUserId,
          createdBy: user.id,
        });

        await MobileService.sendPushNotification({
          message: {
            title: taskBoardName,
            body: `${user.name} assigned you as a watcher to ${task.name}`,
            data: {
              companyId: company.id_text,
              taskId: task.id_text,
              type: MobileService.PushNotificationType.TASK_INVITATION,
            },
          },
          userId: assigneeUserId,
        });
      }

      if (!email) {
        return;
      }
      const option = await createEmailOption({
        companyName,
        url,
        contactName,
        receiverName,
        cardName,
        templateId,
        updatedBy,
        email,
        companyLogoUrl,
        isProject,
        taskBoardName,
      });

      const isEmailSent = await EmailService.sendEmail(option);

      if (!isEmailSent) {
        slack.postToDevLog('handleNotifyAssignWatcherToTask', option, user);
      }

      return isEmailSent;
    }
  } catch (error) {
    slack.postToDevLog(
      'handleNotifyAssignWatcherToTask',
      { error },
      `UserId:${user.id}`,
    );
  }
};

const handleNotifyAssignToTask = async ({
  taskMember,
  taskPic,
  user,
  task,
}: {
  taskMember?: TaskMemberModel;
  taskPic?: TaskPicModel;
  user: UserModel;
  task: TaskModel;
}): Promise<boolean | void> => {
  try {
    const isPublished = await TaskService.isTaskPublished(task?.id);
    if (!isPublished) {
      return;
    }
    const loaders = createLoaders();
    const taskboard = (await loaders.taskBoards.load(
      task?.job_id,
    )) as TaskBoardModel;

    if (!taskboard?.published) {
      return;
    }

    if (!taskMember && !taskPic) {
      return;
    }

    const cardName = task?.name;

    let contact;
    if (taskboard?.contact_id) {
      contact = (await loaders.contacts.load(
        taskboard?.contact_id as number,
      )) as ContactModel;
    }
    const company = (await loaders.companies.load(
      taskboard?.company_id,
    )) as CompanyModel;
    const companyName = company?.name;
    let receiverName;
    let url;
    const contactName = contact?.name;
    let email;
    const companyLogoUrl = company?.logo_url;
    const updatedBy = user.name;
    const templateId = taskMember
      ? TYPES.MEMBER_ASSIGNED_TO_TASK.template
      : TYPES.PIC_ASSIGNED_TO_TASK.template;
    let assigneeUserId;
    const taskBoardName = contact ? contact?.name : taskboard?.name;
    const isProject = taskboard?.category;

    if (taskMember) {
      const member = (await loaders.companyMembers.load(
        taskMember.member_id,
      )) as CompanyMemberModel;

      const memberUser = (await loaders.users.load(
        member.user_id,
      )) as UserModel;

      email = memberUser.email && member?.active ? memberUser.email : undefined;
      url = await getUrlForTask({
        isMember: true,
        isProject,
        taskId: task.id_text,
        slug: company?.slug,
      });

      if (typeof url !== 'string') {
        url = '';
      }
      receiverName = memberUser?.name;
      assigneeUserId = memberUser.id;

      if (member?.active) {
        await NotificationEvents.createAssignToTaskNotification({
          taskId: task?.id,
          userId: user?.id,
          recipientId: assigneeUserId,
          createdBy: user.id,
        });

        await MobileService.sendPushNotification({
          message: {
            title: taskBoardName,
            body: `${user.name} assigned you to ${task.name}`,
            data: {
              companyId: company.id_text,
              taskId: task.id_text,
              type: MobileService.PushNotificationType.TASK_INVITATION,
            },
          },
          userId: assigneeUserId,
        });
      }
    } else {
      const pic = (await loaders.contactPics.load(
        taskPic?.pic_id as number,
      )) as ContactPicModel;

      const picUser = (await loaders.users.load(pic.user_id)) as UserModel;

      email = picUser.email;
      url = await getUrlForTask({
        isMember: false,
        isProject,
        taskId: task.id_text,

        slug: company?.slug,
        userId: picUser.id,
      });

      if (typeof url !== 'string') {
        url = '';
      }
      receiverName = pic?.name;
      assigneeUserId = picUser?.id;

      await MobileService.sendPushNotification({
        message: {
          title: taskBoardName,
          body: `${user.name} assigned you to ${task.name}`,
          data: {
            companyId: company.id_text,
            taskId: task.id_text,
            type: MobileService.PushNotificationType.TASK_INVITATION,
          },
        },
        userId: picUser.id,
      });
    }

    if (!email) {
      return;
    }
    const option = await createEmailOption({
      companyName,
      url,
      contactName,
      receiverName,
      cardName,
      templateId,
      updatedBy,
      email,
      companyLogoUrl,
      isProject,
      taskBoardName,
    });

    const isEmailSent = await EmailService.sendEmail(option);

    if (!isEmailSent) {
      slack.postToDevLog('handleNotifyAssignToTask', option, user);
    }

    return isEmailSent;
  } catch (error) {
    slack.postToDevLog(
      'handleNotifyAssignToTask',
      { error },
      `UserId:${user.id}`,
    );
  }
};

const handleNotifyUploadedToTask = async (
  attachment: TaskAttachmentModel,
  user: UserModel,
): Promise<void | boolean> => {
  try {
    const loaders = createLoaders();
    const task = (await loaders.tasks.load(attachment?.card_id)) as TaskModel;
    const board = (await loaders.taskBoards.load(
      task?.job_id,
    )) as TaskBoardModel;

    const isPublished = await TaskService.isTaskPublished(task?.id);

    if (!isPublished) {
      return;
    }
    const taskMembers = (await TaskService.getTaskMembersByTaskId({
      taskId: task.id,
    })) as TaskMemberModel[];
    const memberUsers = (await getUsersFromTaskMembers(
      taskMembers,
    )) as UserModel[];
    const watcherUsers = (await getWatchersAsUsers(task?.id)) as UserModel[];
    const allMemberUsers = [...memberUsers, ...watcherUsers];
    const uniqMemberUsers = _.uniqBy(allMemberUsers, 'id');

    const taskPics = (await TaskService.getTaskPicsByTaskId({
      taskId: task.id,
    })) as TaskPicModel[];
    const picUsers = (await getUsersFromTaskPics(taskPics)) as UserModel[];

    const isCreatedByPic = picUsers.some((picUser) => picUser.id === user.id);

    await Promise.all(
      _.map(uniqMemberUsers, async (mu) => {
        if (attachment?.created_by !== mu.id) {
          await NotificationEvents.createUploadedToTaskNotification({
            taskId: task?.id,
            userId: attachment?.updated_by,
            recipientId: mu?.id,
            createdBy: attachment.created_by,
          });

          if (isCreatedByPic) {
            await MobileService.sendPushNotification({
              message: {
                title: board.name,
                body: `${user.name} uploaded an attachment to ${task.name}`,
                data: {
                  taskId: task?.id,
                  type: MobileService.PushNotificationType
                    .TASK_UPLOADED_ATTACHMENT,
                },
              },
              userId: mu.id,
            });
          }
        }
      }),
    );

    await Promise.all(
      _.map(picUsers, async (pu) => {
        if (attachment?.created_by !== pu.id) {
          await NotificationEvents.createUploadedToTaskNotification({
            taskId: task?.id,
            userId: attachment?.updated_by,
            recipientId: pu?.id,
            createdBy: attachment.created_by,
          });

          if (isCreatedByPic) {
            await MobileService.sendPushNotification({
              message: {
                title: board.name,
                body: `${user.name} uploaded an attachment to ${task.name}`,
                data: {
                  taskId: task?.id,
                  type: MobileService.PushNotificationType
                    .TASK_UPLOADED_ATTACHMENT,
                },
              },
              userId: pu.id,
            });
          }
        }
      }),
    );
  } catch (error) {
    slack.postToDevLog('handleNotifyUploadedToTask', error, attachment);
  }
};

const handleNotifySubtaskDone = async (
  subtask: SubtaskModel,
  updatedById: UserId,
): Promise<void> => {
  try {
    const loaders = createLoaders();
    const task = (await loaders.tasks.load(subtask.card_id)) as TaskModel;
    const isPublished = await TaskService.isTaskPublished(task?.id);
    if (!isPublished) {
      return;
    }
    const taskMembers = (await TaskService.getTaskMembersByTaskId({
      taskId: task.id,
    })) as TaskMemberModel[];

    const memberUsers = (await getUsersFromTaskMembers(
      taskMembers,
    )) as UserModel[];
    const watcherUsers = (await getWatchersAsUsers(task?.id)) as UserModel[];
    const allMemberUsers = [...memberUsers, ...watcherUsers];
    const uniqMemberUsers = _.uniqBy(allMemberUsers, 'id');

    const taskPics = (await TaskService.getTaskPicsByTaskId({
      taskId: task.id,
    })) as TaskPicModel[];
    const picUsers = (await getUsersFromTaskPics(taskPics)) as UserModel[];

    picUsers.forEach(async (pu) => {
      if (subtask?.updated_by !== pu?.id) {
        await NotificationEvents.createSubtaskDoneNotification({
          taskId: task?.id,
          userId: subtask.updated_by,
          recipientId: pu?.id,
          createdBy: updatedById,
        });
      }
    });

    uniqMemberUsers.forEach(async (mu) => {
      if (subtask?.updated_by !== mu?.id) {
        await NotificationEvents.createSubtaskDoneNotification({
          taskId: task?.id,
          userId: subtask.updated_by,
          recipientId: mu?.id,
          createdBy: updatedById,
        });
      }
    });
  } catch (error) {
    slack.postToDevLog('handleNotifySubtaskDone', error, subtask);
  }
};

const handleNotifyTaskStageChanged = async ({
  task,
  updatedBy,
  fromStatusId,
  toStatusId,
}: {
  task: TaskModel;
  updatedBy: UserModel;
  fromStatusId: number;
  toStatusId: number;
}) => {
  try {
    const isPublished = await TaskService.isTaskPublished(task?.id);
    if (!isPublished) {
      return;
    }
    const loaders = createLoaders();
    const members = (await TaskService.getTaskMembersByTaskId({
      taskId: task?.id,
    })) as TaskMemberModel[];
    const watchers = await TaskService.getTaskWatchersAsMembers({
      taskId: task?.id,
    });
    const memberIds = [
      ...members?.map((m) => m?.member_id),
      ...watchers?.map((w) => w?.id),
    ].filter((m) => m);
    const memberIdsUniq = _.uniqBy(memberIds, (m) => m);
    const allMembers = (await loaders.companyMembers.loadMany(
      memberIdsUniq,
    )) as CompanyMemberModel[];

    await Promise.all(
      _.map(allMembers, async (member) => {
        if (member?.active) {
          await NotificationEvents.createTaskStageChangeNotification({
            userId: updatedBy?.id,
            taskId: task.id,
            recipientId: member?.user_id,
            createdBy: updatedBy?.id,
            fromStatusId,
            toStatusId,
          });
        }
      }),
    );

    const pics = (await TaskService.getTaskPicsByTaskId({
      taskId: task?.id,
    })) as TaskPicModel[];

    await Promise.all(
      _.map(pics, async (pic) => {
        await NotificationEvents.createTaskStageChangeNotification({
          userId: updatedBy?.id,
          taskId: task.id,
          recipientId: pic?.user_id,
          createdBy: updatedBy?.id,
          fromStatusId,
          toStatusId,
        });
      }),
    );
  } catch (error) {
    slack.postToDevLog('handleNotifyTaskStageChanged', error, {
      updatedById: updatedBy?.id,
      taskId: task?.id,
      fromStatusId,
      toStatusId,
    });
  }
};

const handleNotifyProjectStatusChanged = async ({
  task,
  updatedBy,
  fromStatusId,
  toStatusId,
}: {
  task: TaskModel;
  updatedBy: UserModel;
  fromStatusId: number;
  toStatusId: number;
}) => {
  try {
    const isPublished = await TaskService.isTaskPublished(task?.id);
    if (!isPublished) {
      return;
    }
    const loaders = createLoaders();
    const members = (await TaskService.getTaskMembersByTaskId({
      taskId: task?.id,
    })) as TaskMemberModel[];
    const watchers = await TaskService.getTaskWatchersAsMembers({
      taskId: task?.id,
    });
    const memberIds = [
      ...members?.map((m) => m?.member_id),
      ...watchers?.map((w) => w?.id),
    ].filter((m) => m);
    const memberIdsUniq = _.uniqBy(memberIds, (m) => m);
    const allMembers = (await loaders.companyMembers.loadMany(
      memberIdsUniq,
    )) as CompanyMemberModel[];
    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;

    const fromProjectStatus = fromStatusId
      ? ((await loaders.projectStatuses.load(
          fromStatusId,
        )) as ProjectStatusModel)
      : null;
    const toProjectStatus = (await loaders.projectStatuses.load(
      toStatusId,
    )) as ProjectStatusModel;

    await Promise.all(
      _.map(allMembers, async (member) => {
        if (member?.active) {
          await NotificationEvents.createProjectStatusChangeNotification({
            userId: updatedBy?.id,
            taskId: task.id,
            recipientId: member?.user_id,
            createdBy: updatedBy?.id,
            fromStatusId,
            toStatusId,
          });

          await MobileService.sendPushNotification({
            message: {
              title: _.get(taskBoard, 'name'),
              body: fromProjectStatus
                ? `${updatedBy?.name} updated the status in ${task.name} from ${fromProjectStatus.name} to ${toProjectStatus.name}`
                : `${updatedBy.name} updated the status in ${task.name} to ${toProjectStatus.name}`,
              data: {
                taskId: task.id_text,
                type: MobileService.PushNotificationType.TASK_STATUS_UPDATE,
              },
            },
            userId: member.user_id,
          });
        }
      }),
    );

    const pics = (await TaskService.getTaskPicsByTaskId({
      taskId: task?.id,
    })) as TaskPicModel[];

    await Promise.all(
      _.map(pics, async (pic) => {
        await NotificationEvents.createProjectStatusChangeNotification({
          userId: updatedBy?.id,
          taskId: task.id,
          recipientId: pic?.user_id,
          createdBy: updatedBy?.id,
          fromStatusId,
          toStatusId,
        });

        await MobileService.sendPushNotification({
          message: {
            title: _.get(taskBoard, 'name'),
            body: fromProjectStatus
              ? `${updatedBy?.name} updated the status in ${task.name} from ${fromProjectStatus.name} to ${toProjectStatus.name}`
              : `${updatedBy.name} updated the status in ${task.name} to ${toProjectStatus.name}`,
            data: {
              taskId: task.id_text,
              type: MobileService.PushNotificationType.TASK_STATUS_UPDATE,
            },
          },
          userId: pic.user_id,
        });
      }),
    );
  } catch (error) {
    slack.postToDevLog('handleNotifyProjectStatusChanged', error, {
      updatedById: updatedBy?.id,
      taskId: task?.id,
      fromStatusId,
      toStatusId,
    });
  }
};

const handleNotifyTaskDeleted = async ({
  task,
  deletedBy,
  companyId,
}: {
  task: TaskModel;
  deletedBy: UserModel;
  companyId: CompanyId;
}) => {
  try {
    const isPublished = await TaskService.isTaskPublished(task?.id);
    if (!isPublished) {
      return;
    }
    const loaders = createLoaders();

    const company = (await loaders.companies.load(companyId)) as CompanyModel;
    const project = (await loaders.taskBoards.load(
      task?.job_id,
    )) as TaskBoardModel;

    const allMembers = (await CompanyService.getCompanyMembers(
      companyId,
    )) as CompanyMemberModel[];

    const managersAsUsers = (await Promise.all(
      _.map(allMembers, async (member) => {
        const isAdminOrManager =
          member.type === companyMemberTypes.MANAGER ||
          member.type === companyMemberTypes.ADMIN;

        if (member?.active && isAdminOrManager) {
          return (await loaders.users.load(member?.user_id)) as UserModel;
        }
      }).filter((user) => user),
    )) as UserModel[];

    const tbo = (await TaskService.getTaskBoardOwnersByTaskBoardId(
      task?.job_id,
    )) as TaskBoardOwnerModel[];

    const ownersAsUsers = (await Promise.all(
      _.map(tbo, async (member) => {
        const m = (await loaders.companyMembers.load(
          member.companyMemberId,
        )) as CompanyMemberModel;

        if (m?.active) {
          return (await loaders.users.load(m?.user_id)) as UserModel;
        }
      }).filter((user) => user),
    )) as UserModel[];

    const allManagersAndOwners = _.uniqBy(
      [...managersAsUsers, ...ownersAsUsers],
      (u) => u?.id,
    ).filter((u) => u);

    await Promise.all(
      _.map(allManagersAndOwners, async (user) => {
        const option = await createEmailOption({
          templateId: TASK_DELETED,
          receiverName: user?.name || user?.email,
          url: `${process.env.WEBSITE_URL}/${company?.slug}/board/${project?.id_text}`,
          taskName: task?.name,
          isProject: project?.category,
          email: user?.email,
          companyLogoUrl: company.logo_url,
          companyName: company.name,
          taskBoardName: project?.name,
          deletedByName: deletedBy?.name || deletedBy?.email,
        });

        if (option.to) {
          await EmailService.sendEmail(option);
        }

        await NotificationEvents.createTaskDeletedNotification({
          taskId: task?.id,
          recipientId: user?.id,
          createdBy: deletedBy?.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.TASK_DELETED,
        });

        await MobileService.sendPushNotification({
          message: {
            title: _.get(project, 'name'),
            body: `${deletedBy.name} deleted ${task.name}`,
            data: {
              companyId: company.id_text,
              taskId: task.id_text,
              projectId: project.id_text,
              type: MobileService.PushNotificationType.TASK_DELETED,
            },
          },
          userId: user.id,
        });
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'task.events',
        fnName: 'handleNotifyTaskDeleted',
        taskId: task?.id,
        companyId,
        deletedById: deletedBy?.id,
      },
    });
    slack.postToDevLog('handleNotifyTaskDeleted', error, {
      task,
      deletedById: deletedBy?.id,
      companyId,
    });
  }
};

const handleNotifyBoardDeleted = async ({
  boardId,
  deletedById,
}: {
  boardId: TaskBoardId;
  deletedById: UserId;
}) => {
  try {
    const loaders = createLoaders();
    const board = (await loaders?.taskBoards.load(boardId)) as TaskBoardModel;
    if (!board?.published) {
      return;
    }
    const deletedBy = (await loaders?.users.load(deletedById)) as UserModel;

    const company = (await loaders.companies.load(
      board?.company_id,
    )) as CompanyModel;
    let contactName = board?.name;
    if (board.contact_id) {
      const contact = (await loaders.contacts.load(
        board.contact_id,
      )) as ContactModel;
      contactName = contact?.name;
    }

    const taskTeams = (await TaskService.getTaskBoardTeams({
      id: board?.id,
    })) as TaskBoardTeamModel[];

    const teamIds = taskTeams?.map((tt) => tt?.team_id);

    const teams = (await loaders.companyTeams.loadMany(
      teamIds,
    )) as CompanyTeamModel[];

    const adminsAndManagersInTeams: CompanyMemberModel[] = [];

    await Promise.all(
      _.map(teams, async (team) => {
        const members = (await CompanyService.getCompanyTeamMembers(
          team?.id,
        )) as CompanyMemberModel[];

        members.forEach((mem) => {
          adminsAndManagersInTeams.push(mem);
        });

        return members;
      }),
    );

    const adminsAndManagersInTeamsIds: number[] = adminsAndManagersInTeams.map(
      (m) => m?.id,
    );

    const allMembers = (await CompanyService.getCompanyMembers(
      board?.company_id,
    )) as CompanyMemberModel[];

    const managersAsUsers = (await Promise.all(
      _.map(allMembers, async (member) => {
        const isManagerOrAdmin =
          member.type === companyMemberTypes.MANAGER ||
          member.type === companyMemberTypes.ADMIN;
        const isInTeam = adminsAndManagersInTeamsIds.includes(member?.id);

        if (member?.active && isManagerOrAdmin && isInTeam) {
          return (await loaders.users.load(member?.user_id)) as UserModel;
        }
      }).filter((user) => user),
    )) as UserModel[];

    const tbo = (await TaskService.getTaskBoardOwnersByTaskBoardId(
      board?.id,
    )) as TaskBoardOwnerModel[];

    const ownersAsUsers = (await Promise.all(
      _.map(tbo, async (member) => {
        const m = (await loaders.companyMembers.load(
          member.companyMemberId,
        )) as CompanyMemberModel;

        if (m?.active) {
          return (await loaders.users.load(m?.user_id)) as UserModel;
        }
      }).filter((user) => user),
    )) as UserModel[];

    const allManagersAndOwners = _.uniqBy(
      [...managersAsUsers, ...ownersAsUsers],
      (u) => u?.id,
    ).filter((u) => u);

    await Promise.all(
      _.map(allManagersAndOwners, async (user) => {
        const option = await createEmailOption({
          templateId: BOARD_DELETED,
          receiverName: user?.name || user?.email,
          url: `${process.env.WEBSITE_URL}/${company?.slug}/`,
          isProject: board?.category,
          email: user?.email,
          companyLogoUrl: company?.logo_url,
          companyName: company?.name,
          taskBoardName: board?.name || contactName,
          deletedByName: deletedBy?.name || deletedBy?.email,
        });

        if (option?.to) {
          await EmailService.sendEmail(option);
        }

        await NotificationEvents.createBoardDeletedNotification({
          boardId: board?.id,
          recipientId: user?.id,
          createdBy: deletedBy?.id,
          templateType: NOTIFICATION_TEMPLATE_TYPES.BOARD_DELETED,
        });
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'task.events',
        fnName: 'handleNotifyBoardDeleted',
        boardId,
        deletedById,
      },
    });
    slack.postToDevLog('handleNotifyBoardDeleted', error, {
      boardId,
      deletedById,
    });
  }
};

const notifyMentions = async ({
  mentionIds,
  taskId,
  commenterUserId,
}: {
  mentionIds: string[];
  taskId: TaskId;
  commenterUserId: UserId;
}) => {
  try {
    const loaders = createLoaders();

    const task = (await loaders.tasks.load(taskId)) as TaskModel;
    const commentUser = (await loaders.users.load(
      commenterUserId,
    )) as UserModel;
    const isPublished = await TaskService.isTaskPublished(task?.id);

    if (!isPublished) {
      return;
    }

    const taskBoard = (await loaders.taskBoards.load(
      task.job_id,
    )) as TaskBoardModel;
    const company = (await loaders.companies.load(
      taskBoard.company_id,
    )) as CompanyModel;
    let contactName = '';

    const userIdsRaw = await Promise.all(
      _.map(mentionIds, async (mentionId) => {
        const member = (await loaders.companyMembers.load(
          mentionId,
        )) as CompanyMemberModel;
        let userId;
        let isMember = false;

        if (!member) {
          const pic = (await loaders.contactPics.load(
            mentionId,
          )) as ContactPicModel;

          if (!pic) {
            logger.eventManagerLogger.log('info', 'notifyMentions', {
              message: 'pic and member not found',
              mentionId,
              commenterUserId,
            });
            return;
          } else {
            isMember = false;
            userId = pic?.user_id;
          }
        } else {
          if (member?.active) {
            isMember = true;
            userId = member?.user_id;
            // member become watcher
            const isTaskMember = await TaskService.isTaskMember({
              taskId,
              memberId: member?.id,
            });

            if (!isTaskMember) {
              await TaskService.addTaskWatchers({
                taskId,
                memberIds: [member?.id],
              });
            }
          }
        }

        if (!process.env.NOTIFICATION_FEATURE) {
          return;
        }

        const templateId = isMember
          ? TYPES.COMMENT_ON_TASK.template
          : TYPES.COMMENT_ON_TASK_SHARED.template;

        if (userId) {
          const user = (await loaders.users.load(userId)) as UserModel;

          let url = await getUrlForTask({
            isMember,
            isProject: taskBoard?.category === 1 ? true : false,
            taskId: task?.id_text,
            slug: company?.slug,
            userId,
          });

          if (typeof url !== 'string') {
            url = '';
          }

          const option = await createEmailOption({
            templateId,
            commenterName: commentUser?.name || commentUser?.email,
            email: user.email,
            receiverName: user?.name || user?.email,
            companyName: company?.name,
            contactName: contactName,
            companyLogoUrl: company.logo_url,
            boardName: _.get(taskBoard, 'name'),
            taskName: task.name,
            url,
            isProject: taskBoard?.category || 0,
          });

          await EmailService.sendEmail(option);
        }

        return userId;
      }),
    );

    const userIds = userIdsRaw.filter((userId) => userId) as UserId[];
    const mentionedUserIds = _.uniqBy(userIds, (u) => u);
    await Promise.all(
      _.map(mentionedUserIds, async (mentionedUserId) => {
        await NotificationEvents.createCommentMentionedNotification({
          userId: commenterUserId,
          taskId,
          recipientId: mentionedUserId,
          createdBy: commenterUserId,
        });

        await MobileService.sendPushNotification({
          message: {
            title: _.get(taskBoard, 'name'),
            body: `${commentUser.name} mentioned you in ${task.name}`,
            data: {
              companyId: company.id_text,
              taskId: task.id_text,
              type: MobileService.PushNotificationType.TASK_MENTIONED,
            },
          },
          userId: mentionedUserId,
        });
      }),
    );
  } catch (error) {
    return;
  }
};

const getUrlForTask = async ({
  isMember,
  slug,
  isProject,
  taskId,
  userId,
}: {
  isMember: boolean;
  slug: string;
  isProject: boolean | number;
  taskId: string;
  userId?: UserId;
}): Promise<string | Error> => {
  let companySlug = slug;
  try {
    let url = '';

    let taskString = 'task';

    if (userId && !isMember) {
      taskString = process.env.TASK_UNIFICATION ? 'shared' : 'task';
      const picUserCompany = (await UserService.getDefaultCompany(
        userId,
      )) as CompanyModel;

      if (picUserCompany) {
        companySlug = picUserCompany.slug;
      } else {
        const picCompanies = (await CompanyService.getCompanies(
          userId,
        )) as CompanyModel[];

        const firstCompany = picCompanies.find(
          (company) => typeof company?.slug === 'string',
        );

        companySlug = firstCompany?.slug || 'external';
      }
    }

    if (isProject) {
      url = `${process.env.WEBSITE_URL}/${companySlug}/${taskString}/${taskId}`;
    } else {
      url = `${process.env.WEBSITE_URL}/${companySlug}/${taskString}/${taskId}`;
    }
    return url;
  } catch (error) {
    slack.postToDevLog('getUrlForTask', { error, companySlug });
    return error as Error;
  }
};

const getUsersFromTaskMembers = async (
  taskMembers: TaskMemberModel[],
): Promise<UserModel[] | void> => {
  try {
    const filteredMembers = taskMembers.filter((tm) => tm?.user_id);
    const loaders = createLoaders();
    const users = await Promise.all(
      filteredMembers?.map(async (tm) => {
        const member = (await loaders.companyMembers.load(
          tm?.member_id,
        )) as CompanyMemberModel;
        if (member?.active) {
          return (await loaders.users.load(tm?.user_id)) as UserModel;
        }
      }),
    );

    return users.filter((user) => user) as UserModel[];
  } catch (error) {
    slack.postToDevLog('getUsersFromTaskMembers', error, taskMembers);
  }
};

const getWatchersAsUsers = async (
  taskId: TaskId,
): Promise<UserModel[] | void> => {
  try {
    const memberWatchers = await TaskService.getTaskWatchersAsMembers({
      taskId,
    });
    const loaders = createLoaders();
    const watcherUsers = await Promise.all(
      _.map(memberWatchers, async (member) => {
        const user = (await loaders.users.load(member?.user_id)) as UserModel;
        if (user?.active) {
          return user;
        }
      }),
    );

    return watcherUsers.filter((user) => user) as UserModel[];
  } catch (error) {
    slack.postToDevLog('getUsersFromWatchers', error, taskId);
  }
};

const getUsersFromTaskPics = async (
  taskPics: TaskPicModel[],
): Promise<UserModel[] | void> => {
  try {
    const loaders = createLoaders();

    const filteredTaskPics = taskPics.filter((taskPic) => taskPic?.user_id);
    const users = await Promise.all(
      filteredTaskPics.map(async (tp) => {
        const contactPic = (await loaders.contactPics.load(
          tp?.pic_id,
        )) as ContactPicModel;
        const picUser = (await loaders.users.load(
          contactPic?.user_id,
        )) as UserModel;

        return picUser;
      }),
    );

    return users;
  } catch (error) {
    slack.postToDevLog('getUsersFromTaskPics', error, taskPics);
  }
};

export {
  handleTaskReminderEvent,
  handleNotifyAssignToTask,
  handleNotifyUploadedToTask,
  handleNotifySubtaskDone,
  notifyMentions,
  handleNotifyTaskStageChanged,
  handleNotifyTaskDeleted,
  handleNotifyBoardDeleted,
  getUsersFromTaskMembers,
  getUsersFromTaskPics,
  getUrlForTask,
  getWatchersAsUsers,
  handleNotifyProjectStatusChanged,
  handleNotifyTaskAssignees,
  handleNotifyAssignWatcherToTask,
  handleNotifyTaskWatchers,
};
