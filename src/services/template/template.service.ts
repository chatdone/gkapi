import { createLoaders, TaskStore, TemplateStore } from '@data-access';
import { StorageService } from '@services';
import { CompanyId, CompanyTeamId } from '@models/company.model';
import { v4 as uuid } from 'uuid';
import cronParser from 'cron-parser';
import _ from 'lodash';
import {
  SubtaskModel,
  TaskAttachmentModel,
  TaskId,
  TaskModel,
  TaskBoardId,
  TaskBoardModel,
} from '@models/task.model';
import {
  TaskTemplateModel,
  TemplateId,
  TemplateModel,
  TemplateOptionsModel,
  TaskTemplateItemModel,
} from '@models/template.model';
import { UserId, UserModel } from '@models/user.model';
import logger from '@tools/logger';

const getTaskTemplate = async (id: TemplateId): Promise<TaskTemplateModel> => {
  try {
    const template = (await TemplateStore.getTaskTemplate(
      id,
    )) as TaskTemplateModel;

    return template;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'getTaskTemplate',
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTaskTemplates = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<TaskTemplateModel[] | Error> => {
  try {
    const templates = (await TemplateStore.getTaskTemplates({
      companyId,
    })) as TaskTemplateModel[];

    return templates;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'getTaskTemplates',
        companyId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const createTaskTemplate = async ({
  name,
  companyId,
  sourceTaskId,
  user,
  description,
  copySubtasks,
  copyAttachments,
}: {
  name: string;
  companyId: CompanyId;
  sourceTaskId: TaskId;
  user: UserModel;
  description: string | undefined | null;
  copySubtasks: boolean;
  copyAttachments: boolean;
}): Promise<TaskTemplateModel> => {
  try {
    const loaders = createLoaders();
    const sourceTask = (await loaders.tasks.load(sourceTaskId)) as TaskModel;

    const templateType = await exportFunctions.getTemplateType(
      sourceTask.job_id,
    );
    const template = (await TemplateStore.createTemplate({
      companyId,
      name,
      user,
      type: templateType,
    })) as TemplateModel;

    const optionsRes = (await TemplateStore.upsertTemplateOptions({
      templateId: template.id,
      copySubtasks,
      copyAttachments,
      description,
    })) as TemplateOptionsModel;

    const parentTask = (await TemplateStore.createTaskTemplateItem({
      templateId: template.id,
      name: sourceTask.name,
      description: sourceTask.description,
    })) as TaskTemplateModel;

    if (copySubtasks) {
      const subtasks = (await TaskStore.getSubtasksByTaskId({
        taskId: sourceTask.id,
      })) as SubtaskModel[];

      const subtasksPayload = subtasks.map((subtask) => ({
        parentId: parentTask.id,
        name: subtask.title,
        sequence: subtask.sequence,
      }));

      await TemplateStore.createTemplateSubtasks({
        templateId: template.id,
        subtasks: subtasksPayload,
      });
    }

    if (copyAttachments) {
      const attachments = (await TaskStore.getTaskAttachmentsByTaskId({
        taskId: sourceTask.id,
      })) as TaskAttachmentModel[];

      const attachmentsPayload = await Promise.all(
        attachments.map(async (attachment) => {
          const fileExtension = attachment.path.split('.');
          const destinationKey = `template-files/${uuid()}.${fileExtension[1]}`;
          const path = `${process.env.AWS_S3_BUCKET}/${attachment.path}`;
          const destinationBucket = process.env.AWS_S3_BUCKET || 'gokudos-dev';

          await StorageService.copyS3File({
            sourcePath: path,
            destinationBucket,
            destinationKey,
          });

          return {
            name: attachment.name,
            type: attachment.type,
            filesize: attachment.file_size,
            url: `https://${destinationBucket}.s3.ap-southeast-1.amazonaws.com/${destinationKey}`,
            bucket: destinationBucket,
            path: destinationKey,
          };
        }),
      );

      await TemplateStore.createTemplateAttachments({
        templateId: template.id,
        attachments: attachmentsPayload,
      });
    }

    return { ...template, ...optionsRes };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'createTaskTemplate',
        companyId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateTaskTemplate = async ({
  name,
  companyId,
  templateId,
  user,
  cronString,
  description,
  isCopySubtasks,
  isCopyAttachments,
}: {
  name: string;
  companyId: CompanyId;
  templateId: TemplateId;
  user: UserModel;
  cronString?: string;
  description: string | undefined | null;
  isCopySubtasks?: boolean;
  isCopyAttachments?: boolean;
}): Promise<TaskTemplateModel> => {
  try {
    const taskTemplate = (await TemplateStore.getTaskTemplate(
      templateId,
    )) as TaskTemplateModel;

    const template = (await TemplateStore.updateTemplate({
      name,
      templateId,
    })) as TemplateModel;

    const optionsRes = (await TemplateStore.upsertTemplateOptions({
      templateId,
      copySubtasks:
        typeof isCopySubtasks === 'boolean'
          ? isCopySubtasks
          : taskTemplate?.copySubtasks,
      copyAttachments:
        typeof isCopyAttachments === 'boolean'
          ? isCopyAttachments
          : taskTemplate?.copyAttachments,
      description,
    })) as TemplateOptionsModel;

    if (cronString) {
      const nextCreateDate = await getNextCreateDateFromCronString(cronString);
      await TemplateStore.setRecurringTaskTemplate({
        templateId,
        nextCreateDate,
        cronString,
      });
    }

    const updatedTaskTemplate = await TemplateStore.getTaskTemplate(templateId);

    return updatedTaskTemplate;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'updateTaskTemplate',
        companyId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const updateTemplateTaskNameAndDesc = async ({
  name,
  templateId,
  description,
}: {
  name: string;
  templateId: TemplateId;
  description: string;
}) => {
  try {
    await TemplateStore.updateTemplateTaskNameAndDesc({
      name,
      description,
      templateId,
    });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'updateTemplateTaskNameAndDesc',
        templateId,
        name,
        description,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const deleteTemplate = async ({
  templateId,
  companyId,
  user,
}: {
  templateId: TemplateId;
  companyId: CompanyId;
  user: UserModel;
}) => {
  try {
    await TemplateStore.deleteTemplate({
      templateId,
    });

    await TemplateStore.removeTemplateIdFromTask({ templateId });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'deleteTemplate',
        templateId,
        companyId,
        userId: user?.id,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const applyTaskTemplate = async ({
  templateId,
  taskBoardId,
  companyId,
  user,
  companyTeamId,
}: {
  templateId: TemplateId;
  taskBoardId: TaskBoardId;
  companyId: CompanyId;
  user: UserModel;
  companyTeamId: CompanyTeamId | null;
}) => {
  try {
    const template = await TemplateStore.getTaskTemplate(templateId);
    const taskItems = await TemplateStore.getTaskTemplateItems({ templateId });

    const parentTask = _.find(taskItems, (task: TaskTemplateItemModel) =>
      _.isEmpty(task.parentId),
    ) as TaskTemplateItemModel | undefined;
    if (!parentTask) {
      throw new Error('Template has no tasks');
    }

    const insertResult = (await TemplateStore.insertTaskFromTemplate({
      name: parentTask.name,
      description: parentTask.description,
      taskBoardId,
      userId: user.id,
      companyTeamId,
      templateId,
    })) as TaskModel;

    if (template.copySubtasks) {
      const subtasks = _.filter(
        taskItems,
        (task: TaskTemplateItemModel) => task.parentId === parentTask.id,
      ) as TaskTemplateItemModel[];

      if (!_.isEmpty(subtasks)) {
        await TemplateStore.insertSubtasksFromTemplate({
          taskId: insertResult.id,
          userId: user.id,
          subtaskItems: subtasks,
        });
      }
    }

    if (template.copyAttachments) {
      const attachments = await TemplateStore.getTaskTemplateAttachments({
        templateId,
      });

      const attachmentsPayload = await Promise.all(
        attachments.map(async (attachment) => {
          const fileExtension = attachment.path.split('.');
          const destinationKey = `attachments/${uuid()}.${fileExtension[1]}`;
          const path = `${process.env.AWS_S3_BUCKET}/${attachment.path}`;
          const destinationBucket = process.env.AWS_S3_BUCKET || 'gokudos-dev';

          await StorageService.copyS3File({
            sourcePath: path,
            destinationBucket,
            destinationKey,
          });

          return {
            name: attachment.name,
            type: attachment.type,
            filesize: attachment.filesize,
            url: `https://${destinationBucket}.s3.ap-southeast-1.amazonaws.com/${destinationKey}`,
            bucket: destinationBucket,
            path: destinationKey,
          };
        }),
      );

      await TemplateStore.insertTaskAttachmentsFromTemplate({
        taskId: insertResult.id,
        attachments: attachmentsPayload,
        userId: user.id,
      });
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'applyTaskTemplate',
        templateId,
        companyId,
        userId: user?.id,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTemplateType = async (taskBoardId: TaskBoardId): Promise<number> => {
  try {
    const loaders = createLoaders();

    const TemplateTypes = {
      TASK: 1,
      PROJECT_TASK: 2,
    };

    const taskboard = (await loaders.taskBoards.load(
      taskBoardId,
    )) as TaskBoardModel;

    if (taskboard.category) {
      return TemplateTypes.PROJECT_TASK;
    } else {
      return TemplateTypes.TASK;
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'getTemplateType',
        taskBoardId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getNextCreateDateFromCronString = async (
  cronString: string,
): Promise<string> => {
  try {
    const interval = cronParser.parseExpression(cronString);

    return interval.next().toISOString();
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'getNextCreateDateFromCronString',
        cronString,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const setRecurringTaskTemplate = async ({
  cronString,
  templateId,
  taskId,
}: {
  cronString: string;
  templateId: TemplateId;
  taskId?: TaskId;
}): Promise<TaskTemplateModel> => {
  try {
    const nextCreateDate =
      await exportFunctions.getNextCreateDateFromCronString(cronString);

    const res = await TemplateStore.setRecurringTaskTemplate({
      cronString,
      templateId,
      nextCreateDate,
      taskId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'setRecurringTaskTemplate',
        cronString,
        templateId,
        taskId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getTasksForNextRecurringCreate = async () => {
  try {
    const res = (await TemplateStore.getTasksForNextRecurringCreate()) as {
      taskTemplateId: number;
      cronString: string;
      nextCreate: string;
      companyId: CompanyId;
      taskId: TaskId;
      templateId: number;
      createdBy: UserId;
    }[];

    const loaders = createLoaders();

    await Promise.all(
      _.map(res, async (recurringTemplateTask) => {
        const nextDate = await exportFunctions.getNextCreateDateFromCronString(
          recurringTemplateTask.cronString,
        );
        const task = (await loaders.tasks.load(
          recurringTemplateTask.taskId,
        )) as TaskModel;

        const createdByUser = (await loaders.users.load(
          recurringTemplateTask.createdBy,
        )) as UserModel;
        await exportFunctions.applyTaskTemplate({
          templateId: recurringTemplateTask.templateId,
          taskBoardId: task.job_id,
          companyId: recurringTemplateTask.companyId,
          user: createdByUser,
          companyTeamId: task.team_id,
        });

        await TemplateStore.updateNextRecurringDate({
          templateId: recurringTemplateTask.templateId,
          nextDate,
        });
      }),
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'getTasksForNextRecurringCreate',
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const setRecurringTaskTemplateStatus = async ({
  templateId,
}: {
  templateId: number;
}): Promise<TaskTemplateModel> => {
  try {
    const res = await TemplateStore.setRecurringTaskTemplateStatus({
      templateId,
    });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'setRecurringTaskTemplateStatus',
        templateId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const getRecurringSettingsByCronString = async (cronString: string | null) => {
  try {
    if (_.isEmpty(cronString)) {
      return null;
    }
    //Check if cron string is valid
    cronParser.parseExpression(cronString || '');

    const separate = (cronString || '').split(' ');
    const dayOfMonth = separate[2];
    const month = separate[3];
    const dayOfWeek = separate[4];

    if (cronString === '0 0 * * *') {
      return { intervalType: 'DAILY', day: null, month: null };
    } else if (cronString === '0 0 * * 1-5') {
      return {
        intervalType: 'DAILY',
        day: null,
        month: null,
        skipWeekend: true,
      };
    } else if (month === '*' && dayOfWeek === '*') {
      return {
        intervalType: 'MONTHLY',
        day: dayOfMonth,
      };
    } else if (dayOfWeek.includes('#')) {
      const separateDayOfWeek = dayOfWeek.split('#');
      const weekOfMonth = +separateDayOfWeek[1];

      if (+weekOfMonth === 1) {
        return {
          intervalType: 'FIRST_WEEK',
          day: +separateDayOfWeek[0],
        };
      } else if (+weekOfMonth === 2) {
        return {
          intervalType: 'SECOND_WEEK',
          day: +separateDayOfWeek[0],
        };
      } else if (+weekOfMonth === 3) {
        return {
          intervalType: 'THIRD_WEEK',
          day: +separateDayOfWeek[0],
        };
      }
    } else if (dayOfWeek.includes('L')) {
      const separateDayOfWeek = dayOfWeek.split('L');
      return {
        intervalType: 'FOURTH_WEEK',
        day: +separateDayOfWeek[0],
      };
    } else if (month !== '*' && dayOfMonth !== '*') {
      const selectedMonth = +month > 0 ? +month - 1 : +month;
      return {
        intervalType: 'YEARLY',
        month: selectedMonth,
        day: +dayOfMonth,
      };
    } else if (month === '*' && dayOfMonth === '*') {
      return {
        intervalType: 'WEEKLY',
        day: +dayOfWeek,
      };
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'template',
        fnName: 'getRecurringSettingsByCronString',
        cronString,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const exportFunctions = {
  getTaskTemplate,
  getTaskTemplates,
  createTaskTemplate,
  updateTaskTemplate,
  deleteTemplate,
  applyTaskTemplate,
  getTemplateType,
  getNextCreateDateFromCronString,
  setRecurringTaskTemplate,
  getTasksForNextRecurringCreate,
  setRecurringTaskTemplateStatus,
  getRecurringSettingsByCronString,
  updateTemplateTaskNameAndDesc,
};

export default exportFunctions;
