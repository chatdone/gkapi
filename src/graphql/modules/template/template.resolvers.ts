import { Resolvers } from '@generated/graphql-types';
import _ from 'lodash';
import { TaskService, TemplateService } from '@services';
import {
  getCompany,
  getTemplate,
  getTask,
  getTaskBoard,
  getCompanyTeam,
} from '@data-access/getters';
import { TemplateStore } from '@data-access';
import {
  TaskTemplateItemModel,
  TaskTemplateAttachmentModel,
  TaskTemplateModel,
} from '@models/template.model';
import { UserModel } from '@models/user.model';
import { handleResolverError } from '@graphql/errors';

export const resolvers: Resolvers = {
  TaskTemplate: {
    id: ({ idText }) => idText,
    company: async ({ companyId }) => await getCompany(companyId),
    items: async ({ id }) =>
      (await TemplateStore.getTaskTemplateItems({
        templateId: id,
      })) as TaskTemplateItemModel[],
    attachments: async ({ id }) =>
      (await TemplateStore.getTaskTemplateAttachments({
        templateId: id,
      })) as TaskTemplateAttachmentModel[],
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    recurringSetting: async ({ cronString }) => {
      const recurringSetting =
        (await TemplateService.getRecurringSettingsByCronString(
          cronString,
        )) as {
          intervalType: any;
          day: number | null;
          month: number | null;
          skipWeekend: boolean;
        };

      return recurringSetting;
    },
    templateId: async ({ templateId }, args, { loaders }) => {
      const template = await loaders.templates.load(templateId);

      if (!template) {
        return null;
      }

      return template.idText;
    },
    isRecurring: ({ is_recurring }) => (is_recurring ? is_recurring : false),
  },
  TaskTemplateItem: {
    isSubtask: ({ parentId }) => !!parentId,
  },
  TaskTemplateRecurringSetting: {
    intervalType: ({ intervalType }) => intervalType,
    day: ({ day }) => day,
    month: ({ month }) => month,
    skipWeekend: ({ skipWeekend }) => (skipWeekend ? skipWeekend : false),
  },

  Query: {
    taskTemplate: async (root, { id, companyId }, { auth: { user } }) => {
      try {
        const template = await getTemplate(id);

        const res = await TemplateService.getTaskTemplate(template.id);

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    // FIXME: Figure out why TS is failing this. Can't be bothered now cos it works
    // @ts-ignore
    taskTemplates: async (root, { companyId }, { auth: { user } }) => {
      try {
        const company = await getCompany(companyId);

        const res = (await TemplateService.getTaskTemplates({
          companyId: company.id,
        })) as TaskTemplateModel[];

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
  },
  Mutation: {
    createTaskTemplate: async (root, { input }, { auth: { user } }) => {
      try {
        const { companyId, sourceTaskId, cronString } = input;
        const company = await getCompany(companyId);

        const task = await getTask(sourceTaskId);

        const res = await TemplateService.createTaskTemplate({
          ...input,
          companyId: company.id,
          sourceTaskId: task.id,
          description: input.description,
          copySubtasks: input.copySubtasks,
          copyAttachments: input.copyAttachments,
          user,
        });

        if (cronString) {
          await TemplateService.setRecurringTaskTemplate({
            cronString,
            templateId: res.id,
            taskId: task.id,
          });

          const taskTemp = await TemplateService.setRecurringTaskTemplateStatus(
            {
              templateId: res?.id,
            },
          );

          if (taskTemp) {
            await TaskService.updateTaskWithTemplateId({
              taskId: task.id,
              templateId: res?.id,
            });
          }
        }
        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    updateTaskTemplate: async (root, { input }, { auth: { user } }) => {
      try {
        const company = await getCompany(input.companyId);
        const template = await getTemplate(input.templateId);

        const res = await TemplateService.updateTaskTemplate({
          cronString: input?.cronString as string | undefined,
          name: input?.name,
          companyId: company.id as number,
          templateId: template.id as number,
          description: input.description as string | undefined | null,
          user: user as UserModel,
          isCopySubtasks: input?.isCopySubtasks as boolean | undefined,
          isCopyAttachments: input?.isCopyAttachments as boolean | undefined,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    deleteTaskTemplate: async (root, { input }, { auth: { user } }) => {
      try {
        const template = await getTemplate(input.templateId);
        const company = await getCompany(input.companyId);
        const res = await TemplateService.deleteTemplate({
          companyId: company.id,
          templateId: template.id,
          user,
        });
        return template;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    applyTaskTemplate: async (root, { input }, { auth: { user } }) => {
      try {
        const { companyId, taskBoardId, companyTeamId } = input;
        const company = await getCompany(companyId);
        const taskBoard = await getTaskBoard(taskBoardId);
        const template = await getTemplate(input.templateId);

        let team = null;
        if (companyTeamId) {
          team = await getCompanyTeam(companyTeamId);
        }

        await TemplateService.applyTaskTemplate({
          templateId: template.id,
          taskBoardId: taskBoard.id,
          companyId: company.id,
          user,
          companyTeamId: team ? team.id : null,
        });

        return template;
      } catch (error) {
        return handleResolverError(error);
      }
    },
  },
  TemplateType: {
    TASK: 1,
    PROJECT_TASK: 2,
  },
};
