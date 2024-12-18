import knex from '@db/knex';
import { CompanyId, CompanyTeamId } from '@models/company.model';
import { TaskBoardId, TaskId, TaskModel } from '@models/task.model';
import {
  TaskTemplateModel,
  TemplateId,
  TemplateModel,
  TemplateOptionsModel,
  TaskTemplateItemModel,
} from '@models/template.model';
import { UserId, UserModel } from '@models/user.model';
import dayjs from 'dayjs';
import { TableNames } from '@db-tables';
import _ from 'lodash';
import { camelize } from '../utils';

const getTaskTemplate = async (id: TemplateId): Promise<TaskTemplateModel> => {
  try {
    const res = await knex
      .from({ tt: TableNames.TEMPLATES })
      .innerJoin({ to: TableNames.TEMPLATE_OPTIONS }, 'to.template_id', 'tt.id')
      .where('tt.id', id)
      .select('tt.*', 'to.*');

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskTemplates = async ({
  companyId,
}: {
  companyId: CompanyId;
}): Promise<TaskTemplateModel[] | Error> => {
  try {
    const res = await knex
      .from({ tt: TableNames.TEMPLATES })
      .innerJoin({ to: TableNames.TEMPLATE_OPTIONS }, 'to.template_id', 'tt.id')
      .where('tt.company_id', companyId)
      .select('tt.*', 'to.*');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTemplate = async ({
  name,
  companyId,
  user,
  type,
}: {
  name: string;
  companyId: CompanyId;
  user: UserModel;
  type: number;
}): Promise<TemplateModel | Error> => {
  try {
    const insertRes = await knex(TableNames.TEMPLATES).insert({
      name,
      company_id: companyId,
      created_by: user.id,
      type,
    });

    const res = await knex
      .from(TableNames.TEMPLATES)
      .where('id', _.head(insertRes))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const upsertTemplateOptions = async ({
  templateId,
  copySubtasks,
  copyAttachments,
  description,
}: {
  templateId: TemplateId;
  copySubtasks: boolean;
  copyAttachments: boolean;
  description: string | undefined | null;
}): Promise<TemplateOptionsModel | Error> => {
  try {
    await knex(TableNames.TEMPLATE_OPTIONS)
      .insert({
        template_id: templateId,
        copy_subtasks: copySubtasks,
        copy_attachments: copyAttachments,
        description,
      })
      .onConflict('template_id')
      .merge();

    const res = await knex
      .from(TableNames.TEMPLATE_OPTIONS)
      .where('template_id', templateId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTemplate = async ({
  name,
  templateId,
}: {
  name: string;
  templateId: TemplateId;
}): Promise<TemplateModel | Error> => {
  try {
    const updateRes = await knex(TableNames.TEMPLATES)
      .update({
        name,
        updated_at: knex.fn.now(),
      })
      .where('id', templateId);

    const res = await knex
      .from(TableNames.TEMPLATES)
      .where('id', templateId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskTemplateItems = async ({
  templateId,
}: {
  templateId: TemplateId;
}): Promise<TaskTemplateItemModel[] | Error> => {
  try {
    const res = await knex
      .from(TableNames.TEMPLATE_TASKS)
      .where('template_id', templateId)
      .select()
      .orderBy('sequence');

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTaskTemplateItem = async ({
  templateId,
  name,
  description,
}: {
  templateId: TemplateId;
  name: string;
  description: string;
}): Promise<TaskTemplateModel | Error> => {
  try {
    const insertRes = await knex(TableNames.TEMPLATE_TASKS).insert({
      template_id: templateId,
      name,
      description,
      sequence: 0,
    });

    const res = await knex(TableNames.TEMPLATE_TASKS)
      .where('id', _.head(insertRes))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteTemplate = async ({ templateId }: { templateId: TemplateId }) => {
  try {
    const delResult = await knex(TableNames.TEMPLATES)
      .where('id', templateId)
      .del();
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTemplateSubtasks = async ({
  templateId,
  subtasks,
}: {
  templateId: TemplateId;
  subtasks: { parentId: TaskId; name: string; sequence: number }[];
}) => {
  try {
    if (subtasks.length > 0) {
      const itemsToInsert = subtasks.map((subtask) => ({
        template_id: templateId,
        parent_id: subtask.parentId,
        name: subtask.name,
        sequence: subtask.sequence,
      }));

      await knex(TableNames.TEMPLATE_TASKS).insert(itemsToInsert);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskTemplateAttachments = async ({
  templateId,
}: {
  templateId: TemplateId;
}) => {
  try {
    const res = await knex
      .from(TableNames.TEMPLATE_ATTACHMENTS)
      .where('template_id', templateId)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTemplateAttachments = async ({
  templateId,
  attachments,
}: {
  templateId: TemplateId;
  attachments: {
    name: string;
    type: string;
    filesize: number;
    url: string;
    bucket: string;
    path: string;
  }[];
}) => {
  try {
    if (attachments.length > 0) {
      await knex(TableNames.TEMPLATE_ATTACHMENTS).insert(
        attachments.map((attachment) => ({
          ...attachment,
          template_id: templateId,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })),
      );
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertTaskFromTemplate = async ({
  name,
  description,
  taskBoardId,
  companyTeamId,
  userId,
  templateId,
}: {
  name: string;
  description: string;
  taskBoardId: TaskBoardId;
  companyTeamId: CompanyTeamId | null;
  userId: UserId;
  templateId?: TemplateId;
}): Promise<TaskModel | Error> => {
  try {
    const insertRes = await knex(TableNames.TASKS).insert({
      name,
      description,
      job_id: taskBoardId,
      team_id: companyTeamId,
      type: 'Task',
      created_by: userId,
      status: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      template_id: templateId,
    });

    const res = await knex
      .from(TableNames.TASKS)
      .where('id', _.head(insertRes))
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertSubtasksFromTemplate = async ({
  taskId,
  subtaskItems,
  userId,
}: {
  taskId: TaskId;
  subtaskItems: TaskTemplateItemModel[];
  userId: UserId;
}) => {
  try {
    const itemsToInsert = subtaskItems.map((subtask) => ({
      card_id: taskId,
      sequence: subtask.sequence,
      title: subtask.name,
      created_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    }));

    const insertRes = await knex(TableNames.TASK_SUBTASKS).insert(
      itemsToInsert,
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const insertTaskAttachmentsFromTemplate = async ({
  taskId,

  attachments,
  userId,
}: {
  taskId: TaskId;
  attachments: {
    name: string;
    type: string;
    filesize: number;
    url: string;
    bucket: string;
    path: string;
  }[];
  userId: UserId;
}) => {
  try {
    if (attachments.length > 0) {
      const itemsToInsert = attachments.map((attachment) => ({
        card_id: taskId,
        name: attachment.name,
        type: attachment.type,
        file_size: attachment.filesize,
        path: attachment.path,
        url: attachment.url,
        created_by: userId,
        updated_by: userId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      }));

      await knex(TableNames.TASK_ATTACHMENTS).insert(itemsToInsert);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const setRecurringTaskTemplate = async ({
  cronString,
  nextCreateDate,
  templateId,
  taskId,
}: {
  cronString: string;
  nextCreateDate: string;
  templateId: TemplateId;
  taskId?: TaskId;
}): Promise<TaskTemplateModel> => {
  try {
    const taskIdObj = { task_id: taskId };

    if (!taskId) {
      delete taskIdObj.task_id;
    }

    await knex
      .from(TableNames.TEMPLATE_OPTIONS)
      .where({ template_id: templateId })
      .update({
        cron_string: cronString,
        next_create: dayjs(nextCreateDate).toDate(),
        ...taskIdObj,
      });

    const taskTemplate = (await getTaskTemplate(
      templateId,
    )) as TaskTemplateModel;

    return taskTemplate;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTasksForNextRecurringCreate = async () => {
  try {
    const res = await knex
      .from({ to: TableNames.TEMPLATE_OPTIONS })
      .leftJoin(
        { tt: TableNames.TEMPLATE_TASKS },
        'tt.template_id',
        'to.template_id',
      )
      .leftJoin(
        { template: TableNames.TEMPLATES },
        'template.id',
        'tt.template_id',
      )
      .where({ 'to.is_recurring': 1, parent_id: null })
      .whereRaw(
        `DATE_FORMAT(to.next_create, '%Y-%m-%d %H:00:00') = DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')`,
      )
      .select(
        'tt.id as taskTemplateId',
        'template.created_by as createdBy',
        'template.id as templateId',
        'to.cron_string as cronString',
        'to.next_create as nextCreate',
        'template.company_id as companyId',
        'to.task_id as taskId',
      );

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateNextRecurringDate = async ({
  templateId,
  nextDate,
}: {
  templateId: number;
  nextDate: string;
}) => {
  try {
    await knex
      .from(TableNames.TEMPLATE_OPTIONS)
      .where({ template_id: templateId })
      .update({ next_create: nextDate });
  } catch (error) {
    return Promise.reject(error);
  }
};

const setRecurringTaskTemplateStatus = async ({
  templateId,
}: {
  templateId: number;
}): Promise<TaskTemplateModel> => {
  try {
    await knex
      .from(TableNames.TEMPLATE_OPTIONS)
      .where({ template_id: templateId })
      .update({
        is_recurring: true,
      });

    const taskTemplate = (await getTaskTemplate(
      templateId,
    )) as TaskTemplateModel;
    return taskTemplate;
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTemplateTaskNameAndDesc = async ({
  name,
  description,
  templateId,
}: {
  name: string;
  description: string;
  templateId: TemplateId;
}): Promise<TaskTemplateModel | Error> => {
  try {
    const updateRes = await knex(TableNames.TEMPLATE_TASKS)
      .update({
        name,
        description,
        updated_at: knex.fn.now(),
      })
      .where('template_id', templateId);

    const res = await knex
      .from(TableNames.TEMPLATE_TASKS)
      .where('template_id', templateId)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeTemplateIdFromTask = async ({
  templateId,
}: {
  templateId: TemplateId;
}) => {
  await knex
    .from('cards')
    .where({ template_id: templateId })
    .update({ template_id: null });
};

export default {
  getTaskTemplate,
  getTaskTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  upsertTemplateOptions,
  getTaskTemplateItems,
  getTaskTemplateAttachments,
  createTaskTemplateItem,
  createTemplateSubtasks,
  createTemplateAttachments,
  insertTaskFromTemplate,
  insertSubtasksFromTemplate,
  insertTaskAttachmentsFromTemplate,
  setRecurringTaskTemplate,
  getTasksForNextRecurringCreate,
  updateNextRecurringDate,
  setRecurringTaskTemplateStatus,
  updateTemplateTaskNameAndDesc,
  removeTemplateIdFromTask,
};
