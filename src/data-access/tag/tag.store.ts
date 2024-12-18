import knex from '@db/knex';
import {
  CreateTagGroupPayload,
  CreateTagPayload,
  UpdateTagPayload,
  TagGroupModel,
  TagModel,
  UpdateTagDbPayload,
  UpdateTagGroupPayload,
  TagId,
  TagGroupId,
  ContactTagModel,
  TaskTagModel,
  CollectionTagModel,
  AttendanceTagModel,
} from '@models/tag.model';
import { camelize } from '@data-access/utils';
import _ from 'lodash';
import { CompanyId } from '@models/company.model';
import { ContactId } from '@models/contact.model';
import { TaskId } from '@models/task.model';
import { CollectionId } from '@models/collection.model';
import { TableNames } from '@db-tables';
import { AttendanceId } from '@models/attendance.model';

const createTag = async (
  payload: CreateTagPayload,
): Promise<TagModel | Error> => {
  try {
    const { name, color, companyId, groupId, userId } = payload;
    const row = await knex(TableNames.TAGS).insert({
      name: name,
      color: color,
      company_id: companyId,
      group_id: groupId,
      created_at: knex.fn.now(),
      created_by: userId,
    });

    const res = await knex(TableNames.TAGS).where('id', row).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTagGroup = async (
  payload: CreateTagGroupPayload,
): Promise<TagGroupModel | Error> => {
  try {
    const { name, userId, companyId } = payload;

    const row = await knex(TableNames.TAG_GROUPS).insert({
      name: name,
      company_id: companyId,
      created_by: userId,
      created_at: knex.fn.now(),
      description: payload?.description,
    });
    const res = await knex(TableNames.TAG_GROUPS).where('id', row).select();
    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTagsByCompanyId = async (
  companyId: CompanyId,
): Promise<(TagModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TAGS)
      .where('company_id', companyId)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTagGroupsByCompanyId = async (
  companyId: CompanyId,
): Promise<(TagGroupModel | Error)[]> => {
  try {
    const res = await knex(TableNames.TAG_GROUPS)
      .where('company_id', companyId)
      .select();
    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTag = async (
  payload: UpdateTagPayload,
): Promise<Error | TagModel> => {
  try {
    let columns = {} as UpdateTagDbPayload;

    if (payload.name) {
      columns.name = payload.name;
    }
    if (payload.color) {
      columns.color = payload.color;
    }
    if (payload.groupId) {
      columns.group_id = payload.groupId;
    }

    if (!_.isEmpty(columns)) {
      await knex(TableNames.TAGS)
        .update({ ...columns, updated_at: knex.fn.now() })
        .where('id', payload.id);
    }

    const res = await knex(TableNames.TAGS).where('id', payload.id).select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateTagGroup = async (
  payload: UpdateTagGroupPayload,
): Promise<TagGroupModel | Error> => {
  try {
    await knex(TableNames.TAG_GROUPS)
      .update({
        name: payload.name,
        description: payload.description,
        updated_at: knex.fn.now(),
      })
      .where('id', payload.id);

    const res = await knex(TableNames.TAG_GROUPS)
      .where('id', payload.id)
      .select();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteTag = async (id: TagId): Promise<TagModel | Error> => {
  try {
    const res = await knex(TableNames.TAGS).where('id', id).select();

    await knex(TableNames.TAGS).where('id', id).del();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteTagGroup = async (
  id: TagGroupId,
): Promise<TagGroupModel | Error> => {
  try {
    const res = await knex(TableNames.TAG_GROUPS).where('id', id).select();

    await knex(TableNames.TAG_GROUPS).where('id', id).del();

    return camelize(_.head(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignContactTag = async ({
  tagId,
  contactId,
}: {
  tagId: TagId;
  contactId: ContactId;
}): Promise<ContactTagModel> => {
  try {
    await knex
      .from(TableNames.CONTACT_TAGS)
      .insert({ tag_id: tagId, contact_id: contactId });

    const res = await knex
      .from(TableNames.CONTACT_TAGS)
      .where({ contact_id: contactId, tag_id: tagId })
      .select();

    return _.head(camelize(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteContactTag = async ({
  tagId,
  contactId,
}: {
  tagId: TagId;
  contactId: ContactId;
}): Promise<ContactTagModel> => {
  try {
    const res = await knex
      .from(TableNames.CONTACT_TAGS)
      .where({ contact_id: contactId, tag_id: tagId })
      .select();

    await knex
      .from(TableNames.CONTACT_TAGS)
      .where({ tag_id: tagId, contact_id: contactId })
      .delete();

    return _.head(camelize(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignTaskTag = async ({
  tagId,
  taskId,
}: {
  tagId: TagId;
  taskId: TaskId;
}): Promise<TaskTagModel> => {
  try {
    await knex
      .from(TableNames.TASK_TAGS)
      .insert({ tag_id: tagId, task_id: taskId });

    const res = await knex
      .from(TableNames.TASK_TAGS)
      .where({ task_id: taskId, tag_id: tagId })
      .select();

    return _.head(camelize(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteTaskTag = async ({
  tagId,
  taskId,
}: {
  tagId: TagId;
  taskId: TaskId;
}): Promise<TaskTagModel> => {
  try {
    const res = await knex
      .from(TableNames.TASK_TAGS)
      .where({ task_id: taskId, tag_id: tagId })
      .select();

    await knex
      .from(TableNames.TASK_TAGS)
      .where({ tag_id: tagId, task_id: taskId })
      .delete();

    return _.head(camelize(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignCollectionTag = async ({
  tagId,
  collectionId,
}: {
  tagId: TagId;
  collectionId: CollectionId;
}): Promise<CollectionTagModel> => {
  try {
    await knex
      .from(TableNames.COLLECTION_TAGS)
      .insert({ tag_id: tagId, collection_id: collectionId });

    const res = await knex
      .from(TableNames.COLLECTION_TAGS)
      .where({ tag_id: tagId, collection_id: collectionId })
      .select();

    return _.head(camelize(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCollectionTag = async ({
  tagId,
  collectionId,
}: {
  tagId: TagId;
  collectionId: CollectionId;
}): Promise<CollectionTagModel> => {
  try {
    const res = await knex
      .from(TableNames.COLLECTION_TAGS)
      .where({ collection_id: collectionId, tag_id: tagId })
      .select();

    await knex
      .from(TableNames.COLLECTION_TAGS)
      .where({ collection_id: collectionId, tag_id: tagId })
      .delete();

    return _.head(camelize(res));
  } catch (error) {
    return Promise.reject(error);
  }
};

const getContactTags = async ({
  contactId,
}: {
  contactId: ContactId;
}): Promise<ContactTagModel[]> => {
  try {
    const res = await knex
      .from(TableNames.CONTACT_TAGS)
      .where({ contact_id: contactId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTaskTags = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TaskTagModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TASK_TAGS)
      .where({ task_id: taskId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getCollectionTags = async ({
  collectionId,
}: {
  collectionId: CollectionId;
}): Promise<CollectionTagModel[]> => {
  try {
    const res = await knex
      .from(TableNames.COLLECTION_TAGS)
      .where({ collection_id: collectionId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const assignAttendanceTags = async ({
  tagIds,
  attendanceId,
}: {
  tagIds: TagId[];
  attendanceId: AttendanceId;
}): Promise<AttendanceTagModel[]> => {
  try {
    await Promise.all(
      _.map(tagIds, async (tagId) => {
        await knex
          .from(TableNames.ATTENDANCE_TAGS)
          .insert({ tag_id: tagId, attendance_id: attendanceId });
      }),
    );

    const res = await knex
      .from(TableNames.ATTENDANCE_TAGS)
      .where({ attendance_id: attendanceId })
      .whereIn('tag_id', tagIds)
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteAttendanceTags = async ({
  tagIds,
  attendanceId,
}: {
  tagIds: TagId[];
  attendanceId: AttendanceId;
}): Promise<AttendanceTagModel[]> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCE_TAGS)
      .where({ attendance_id: attendanceId })
      .whereIn('tag_id', tagIds)
      .select();

    await Promise.all(
      _.map(tagIds, async (tagId) => {
        await knex
          .from(TableNames.ATTENDANCE_TAGS)
          .where({ tag_id: tagId, attendance_id: attendanceId })
          .delete();
      }),
    );

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAttendanceTags = async ({
  attendanceId,
}: {
  attendanceId: AttendanceId;
}): Promise<AttendanceTagModel[]> => {
  try {
    const res = await knex
      .from(TableNames.ATTENDANCE_TAGS)
      .where({ attendance_id: attendanceId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTagsByGroupId = async (groupId: TagGroupId): Promise<TagModel[]> => {
  try {
    const res = await knex
      .from(TableNames.TAGS)
      .where({ group_id: groupId })
      .select();

    return camelize(res);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default {
  createTag,
  createTagGroup,
  getTagsByCompanyId,
  getTagGroupsByCompanyId,
  updateTag,
  updateTagGroup,
  deleteTag,
  deleteTagGroup,
  assignContactTag,
  deleteContactTag,
  assignTaskTag,
  deleteTaskTag,
  assignCollectionTag,
  deleteCollectionTag,
  getContactTags,
  getTaskTags,
  getCollectionTags,
  assignAttendanceTags,
  deleteAttendanceTags,
  getAttendanceTags,
  getTagsByGroupId,
};
