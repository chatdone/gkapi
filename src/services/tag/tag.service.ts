import { createLoaders, TagStore } from '@data-access';
import { AttendanceId } from '@models/attendance.model';
import { CollectionId } from '@models/collection.model';
import { CompanyId } from '@models/company.model';
import { ContactId } from '@models/contact.model';
import {
  CreateTagGroupPayload,
  CreateTagPayload,
  TagGroupModel,
  UpdateTagPayload,
  TagModel,
  UpdateTagGroupPayload,
  TagId,
  TagGroupId,
  ContactTagModel,
  TaskTagModel,
  CollectionTagModel,
  AttendanceTagModel,
} from '@models/tag.model';
import { TaskId } from '@models/task.model';
import logger from '@tools/logger';
import _ from 'lodash';

const createTag = async (
  payload: CreateTagPayload,
): Promise<TagModel | Error> => {
  try {
    const res = await TagStore.createTag(payload);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createTagGroup = async (
  payload: CreateTagGroupPayload,
): Promise<TagGroupModel | Error> => {
  try {
    const res = await TagStore.createTagGroup(payload);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'createTagGroup',
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const getTagsByCompanyId = async (
  companyId: CompanyId,
): Promise<(TagModel | Error)[]> => {
  try {
    const res = await TagStore.getTagsByCompanyId(companyId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTagsByCompanyId',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const getTagGroupsByCompanyId = async (
  companyId: CompanyId,
): Promise<(TagGroupModel | Error)[]> => {
  try {
    const res = await TagStore.getTagGroupsByCompanyId(companyId);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTagGroupsByCompanyId',
        companyId,
      },
    });
    return Promise.reject(error);
  }
};

const updateTag = async (
  payload: UpdateTagPayload,
): Promise<Error | TagModel> => {
  try {
    const res = await TagStore.updateTag(payload);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'updateTag',
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const updateTagGroup = async (
  payload: UpdateTagGroupPayload,
): Promise<TagGroupModel | Error> => {
  try {
    const res = await TagStore.updateTagGroup(payload);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'updateTagGroup',
        payload,
      },
    });
    return Promise.reject(error);
  }
};

const deleteTag = async (id: TagId): Promise<TagModel | Error> => {
  try {
    const res = await TagStore.deleteTag(id);
    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'deleteTag',
        tagId: id,
      },
    });
    return Promise.reject(error);
  }
};

const deleteTagGroup = async (
  id: TagGroupId,
): Promise<TagGroupModel | Error> => {
  try {
    const tags = await getTagsByGroupId(id);

    await Promise.all(
      _.map(tags, async (tag) => {
        await deleteTag(tag?.id);
      }),
    );

    const res = await TagStore.deleteTagGroup(id);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'deleteTagGroup',
        tagId: id,
      },
    });
    return Promise.reject(error);
  }
};

const deleteContactTags = async ({
  tagIds,
  contactId,
}: {
  tagIds: TagId[];
  contactId: ContactId;
}): Promise<ContactTagModel[]> => {
  try {
    const res = await Promise.all(
      _.map(tagIds, async (tagId) => {
        return await TagStore.deleteContactTag({ contactId, tagId });
      }),
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'deleteContactTags',
        tagIds,
        contactId,
      },
    });
    return Promise.reject(error);
  }
};

const deleteTaskTags = async ({
  tagIds,
  taskId,
}: {
  tagIds: TagId[];
  taskId: TaskId;
}): Promise<TaskTagModel[]> => {
  try {
    const res = await Promise.all(
      _.map(tagIds, async (tagId) => {
        return await TagStore.deleteTaskTag({ taskId, tagId });
      }),
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'deleteTaskTags',
        tagIds,
        taskId,
      },
    });
    return Promise.reject(error);
  }
};

const deleteCollectionTags = async ({
  tagIds,
  collectionId,
}: {
  tagIds: TagId[];
  collectionId: CollectionId;
}): Promise<CollectionTagModel[]> => {
  try {
    const res = await Promise.all(
      _.map(tagIds, async (tagId) => {
        return await TagStore.deleteCollectionTag({ collectionId, tagId });
      }),
    );

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'deleteCollectionTags',
        tagIds,
        collectionId,
      },
    });
    return Promise.reject(error);
  }
};

const getContactTags = async ({
  contactId,
}: {
  contactId: ContactId;
}): Promise<ContactTagModel[]> => {
  try {
    const res = await TagStore.getContactTags({ contactId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getContactTags',
        contactId,
      },
    });
    return Promise.reject(error);
  }
};

const getTaskTags = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TaskTagModel[]> => {
  try {
    const res = await TagStore.getTaskTags({ taskId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTaskTags',
        taskId,
      },
    });
    return Promise.reject(error);
  }
};

const getCollectionTags = async ({
  collectionId,
}: {
  collectionId: CollectionId;
}): Promise<CollectionTagModel[]> => {
  try {
    const res = await TagStore.getCollectionTags({ collectionId });

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getCollectionTags',
        collectionId,
      },
    });
    return Promise.reject(error);
  }
};

const getTagsByContactId = async ({
  contactId,
}: {
  contactId: ContactId;
}): Promise<TagModel[]> => {
  try {
    const res = await TagStore.getContactTags({ contactId });

    const tagIds = res.map((contactTag) => contactTag.tagId);

    const loaders = createLoaders();
    const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
    return tags;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTagsByContactId',
        contactId,
      },
    });
    return Promise.reject(error);
  }
};

const getTagsByTaskId = async ({
  taskId,
}: {
  taskId: TaskId;
}): Promise<TagModel[]> => {
  try {
    const res = await TagStore.getTaskTags({ taskId });

    const loaders = createLoaders();

    const tagIds = res.map((taskTag) => taskTag.tagId);

    const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];

    return tags;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTagsByTaskId',
        taskId,
      },
    });
    return Promise.reject(error);
  }
};

const getTagsByCollectionId = async ({
  collectionId,
}: {
  collectionId: CollectionId;
}): Promise<TagModel[]> => {
  try {
    const res = await TagStore.getCollectionTags({ collectionId });

    const tagIds = res.map((collectionTag) => collectionTag.tagId);

    const loaders = createLoaders();
    const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
    return tags;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTagsByCollectionId',
        collectionId,
      },
    });
    return Promise.reject(error);
  }
};

const assignTagsToTask = async ({
  tagIds,
  taskId,
}: {
  tagIds: TagId[];
  taskId: TaskId;
}): Promise<TaskTagModel[]> => {
  try {
    return await Promise.all(
      _.map(tagIds, async (tagId) => {
        return await TagStore.assignTaskTag({ taskId: taskId, tagId });
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'assignTagsToTask',
        tagIds,
      },
    });
    return Promise.reject(error);
  }
};

const assignTagsToContact = async ({
  tagIds,
  contactId,
}: {
  tagIds: TagId[];
  contactId: ContactId;
}): Promise<ContactTagModel[]> => {
  try {
    return await Promise.all(
      _.map(tagIds, async (tagId) => {
        return await TagStore.assignContactTag({ contactId: contactId, tagId });
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'assignTagsToContact',
        tagIds,
      },
    });
    return Promise.reject(error);
  }
};

const assignTagsToCollection = async ({
  tagIds,
  collectionId,
}: {
  tagIds: TagId[];
  collectionId: CollectionId;
}): Promise<CollectionTagModel[]> => {
  try {
    return await Promise.all(
      _.map(tagIds, async (tagId) => {
        return await TagStore.assignCollectionTag({ collectionId, tagId });
      }),
    );
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'assignTagsToCollection',
        tagIds,
      },
    });
    return Promise.reject(error);
  }
};

const assignTagsToAttendance = async ({
  tagIds,
  attendanceId,
}: {
  tagIds: TagId[];
  attendanceId: AttendanceId;
}): Promise<AttendanceTagModel[]> => {
  try {
    return await TagStore.assignAttendanceTags({ attendanceId, tagIds });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'assignTagsToAttendance',
        tagIds,
        attendanceId,
      },
    });
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
    return await TagStore.deleteAttendanceTags({ attendanceId, tagIds });
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'deleteAttendanceTags',
        tagIds,
        attendanceId,
      },
    });
    return Promise.reject(error);
  }
};

const getTagsByAttendanceId = async ({
  attendanceId,
}: {
  attendanceId: ContactId;
}): Promise<TagModel[]> => {
  try {
    const res = await TagStore.getAttendanceTags({ attendanceId });

    const tagIds = res.map((attendanceTag) => attendanceTag.tagId);

    const loaders = createLoaders();
    const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
    return tags;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTagsByAttendanceId',
        attendanceId,
      },
    });
    return Promise.reject(error);
  }
};

const getTagsByGroupId = async (groupId: TagGroupId): Promise<TagModel[]> => {
  try {
    const res = await TagStore.getTagsByGroupId(groupId);

    return res;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      error: err,
      payload: {
        service: 'tag',
        fnName: 'getTagsByGroupId',
        groupId,
      },
    });
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
  deleteContactTags,
  deleteTaskTags,
  deleteCollectionTags,
  getContactTags,
  getTaskTags,
  getCollectionTags,
  getTagsByContactId,
  getTagsByTaskId,
  getTagsByCollectionId,
  assignTagsToTask,
  assignTagsToContact,
  assignTagsToCollection,
  assignTagsToAttendance,
  deleteAttendanceTags,
  getTagsByAttendanceId,
  getTagsByGroupId,
};
