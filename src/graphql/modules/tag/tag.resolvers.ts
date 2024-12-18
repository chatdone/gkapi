import { Resolvers } from '@generated/graphql-types';
import _ from 'lodash';
import {
  getCollection,
  getCompany,
  getContact,
  getTag,
  getTagGroup,
  getTask,
} from '@data-access/getters';
import { CompanyModel } from '@models/company.model';
import { TagService } from '@services';
import { TagGroupModel, TagModel } from '@models/tag.model';
import { handleResolverError } from '@graphql/errors';
import dayjs from 'dayjs';

export const resolvers: Resolvers = {
  Tag: {
    id: ({ idText }) => idText,
    company: async ({ companyId }) => await getCompany(companyId),
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    group: async ({ groupId }, args, { loaders }) => {
      return groupId ? await loaders.tagGroups.load(groupId) : null;
    },
  },
  TagGroup: {
    id: ({ idText }) => idText,
    company: async ({ companyId }) => await getCompany(companyId),
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    tags: async ({ id }) => {
      const tags = await TagService.getTagsByGroupId(id);

      return tags;
    },
  },
  ContactTag: {
    contact: async ({ contactId }, args, { loaders }) => {
      return await loaders.contacts.load(contactId);
    },
    tag: async ({ tagId }, args, { loaders }) => {
      return await loaders.tags.load(tagId);
    },
  },
  TaskTag: {
    task: async ({ taskId }, args, { loaders }) => {
      return await loaders.tasks.load(taskId);
    },
    tag: async ({ tagId }, args, { loaders }) => {
      return await loaders.tags.load(tagId);
    },
  },
  CollectionTag: {
    collection: async ({ collectionId }, args, { loaders }) => {
      return await loaders.collections.load(collectionId);
    },
    tag: async ({ tagId }, args, { loaders }) => {
      return await loaders.tags.load(tagId);
    },
  },
  Query: {
    tag: async (root, { id }, { auth: { user } }) => {
      try {
        const tag = await getTag(id);

        return tag;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    tags: async (root, { companyId }, { auth: { user } }) => {
      try {
        const company = (await getCompany(companyId)) as CompanyModel;

        const res = await TagService.getTagsByCompanyId(company.id);
        return res;
      } catch (error) {
        return [handleResolverError(error)];
      }
    },
    tagGroups: async (root, { companyId }, { auth: { user } }) => {
      try {
        const now = dayjs();
        const company = (await getCompany(companyId)) as CompanyModel;

        const res = await TagService.getTagGroupsByCompanyId(company.id);

        // console.log('end taggroups', dayjs().diff(now, 'ms'));
        return res;
      } catch (error) {
        return [handleResolverError(error)];
      }
    },
    tagGroup: async (root, { id }, { auth: { user } }) => {
      try {
        const group = await getTagGroup(id);

        return group;
      } catch (error) {
        return handleResolverError(error);
      }
    },
  },
  Mutation: {
    createTag: async (_, { input }, { loaders, auth: { user } }) => {
      try {
        const { companyId, name, color, groupId } = input;
        let group;
        const company = (await getCompany(companyId)) as CompanyModel;

        if (groupId) {
          group = await getTagGroup(groupId);
        }

        const payload = {
          companyId: company.id,
          groupId: group?.id,
          name: name,
          color: color,
          userId: user.id,
        };

        const res = await TagService.createTag(payload);

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    createTagGroup: async (_, { input }, { loaders, auth: { user } }) => {
      try {
        const { companyId, name } = input;
        const company = (await getCompany(companyId)) as CompanyModel;

        const payload = {
          companyId: company.id,
          name: name,
          userId: user.id,
          description: input?.description ? input.description : undefined,
        };

        const res = await TagService.createTagGroup(payload);

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },

    updateTag: async (_, { input }, { loaders, auth: { user } }) => {
      try {
        let tagGroup;
        const { groupId, name, color, id } = input;

        const tag = (await getTag(id)) as TagModel;

        if (groupId) {
          tagGroup = (await getTagGroup(groupId)) as TagGroupModel;
        }

        const payload = {
          id: tag?.id,
          ...(color && { color }),
          ...(name && { name }),
          ...(tagGroup && { groupId: tagGroup?.id }),
        };
        const res = await TagService.updateTag(payload);

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    updateTagGroup: async (_, { input }, { loaders, auth: { user } }) => {
      try {
        const { id, name, description } = input;

        const tagGroup = (await getTagGroup(id)) as TagGroupModel;

        const payload = {
          id: tagGroup.id,
          name,
          ...(description && { description }),
        };

        const res = await TagService.updateTagGroup(payload);

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    deleteTag: async (_, { id }, { loaders, auth: { user } }) => {
      try {
        const tag = (await getTag(id)) as TagModel;

        const res = await TagService.deleteTag(tag.id);

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    deleteTagGroup: async (_, { id }, { loaders, auth: { user } }) => {
      try {
        const tagGroup = (await getTagGroup(id)) as TagGroupModel;

        const res = await TagService.deleteTagGroup(tagGroup.id);

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    assignContactTags: async (root, { input }, { loaders, auth: { user } }) => {
      const { tagIds, contactId } = input;
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];

      const contact = await getContact(contactId);

      const res = await TagService.assignTagsToContact({
        tagIds: tags.map((tag) => tag.id),
        contactId: contact.id,
      });

      return res;
    },
    deleteContactTags: async (root, { input }, { loaders, auth: { user } }) => {
      const { tagIds, contactId } = input;
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      const contact = await getContact(contactId);

      const res = await TagService.deleteContactTags({
        tagIds: tags.map((tag) => tag.id),
        contactId: contact?.id,
      });

      return res;
    },
    assignTaskTags: async (root, { input }, { loaders, auth: { user } }) => {
      const { tagIds, taskId } = input;
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      const task = await getTask(taskId);

      const res = await TagService.assignTagsToTask({
        tagIds: tags.map((tag) => tag.id),
        taskId: task?.id,
      });

      return res;
    },
    deleteTaskTags: async (root, { input }, { loaders, auth: { user } }) => {
      const { tagIds, taskId } = input;
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      const task = await getTask(taskId);

      const res = await TagService.deleteTaskTags({
        tagIds: tags.map((tag) => tag.id),
        taskId: task?.id,
      });

      return res;
    },
    assignCollectionTags: async (
      root,
      { input },
      { loaders, auth: { user } },
    ) => {
      const { tagIds, collectionId } = input;
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      const collection = await getCollection(collectionId);

      const res = await TagService.assignTagsToCollection({
        tagIds: tags.map((tag) => tag.id),
        collectionId: collection?.id,
      });

      return res;
    },
    deleteCollectionTags: async (
      root,
      { input },
      { loaders, auth: { user } },
    ) => {
      const { tagIds, collectionId } = input;
      const tags = (await loaders.tags.loadMany(tagIds)) as TagModel[];
      const collection = await getCollection(collectionId);

      const res = await TagService.deleteCollectionTags({
        tagIds: tags.map((tag) => tag.id),
        collectionId: collection?.id,
      });

      return res;
    },
  },
};
