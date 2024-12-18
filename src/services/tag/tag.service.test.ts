import { createLoaders, TagStore } from '@data-access';
import { TagService } from '@services';
import { faker } from '@faker-js/faker';
import {
  TagModel,
  TagGroupModel,
  CreateTagPayload,
  CreateTagGroupPayload,
} from '@models/tag.model';
import fixtures from '@test/fixtures';

jest.mock('../../data-access/tag/tag.store');

describe('tag.service', () => {
  describe('createTag', () => {
    test('it should create a tag and return the created tag', async () => {
      const tag = fixtures.generate('tag', 1) as TagModel;

      const payload = {
        companyId: tag.companyId,
        userId: tag.createdBy,
        name: tag.name,
        color: tag.color,
      };

      (TagStore.createTag as jest.Mock).mockResolvedValue(tag);

      const res = await TagService.createTag(payload);

      expect(TagStore.createTag).toHaveBeenCalledWith(payload);

      expect(res).toEqual({ ...tag });

      jest.restoreAllMocks();
    });
  });
  describe('createTagGroup', () => {
    test('it should create a tag group and return the created tag group', async () => {
      const tagGroup = fixtures.generate('tagGroup', 1) as TagGroupModel;

      const payload = {
        companyId: tagGroup.companyId,
        userId: tagGroup.createdBy,
        name: tagGroup.name,
      };

      (TagStore.createTagGroup as jest.Mock).mockResolvedValue(tagGroup);

      const res = await TagService.createTagGroup(payload);

      expect(TagStore.createTagGroup).toHaveBeenCalledWith(payload);

      expect(res).toEqual({ ...tagGroup });

      jest.restoreAllMocks();
    });
  });
  describe('updateTag', () => {
    test('it should update a tag name and return the updated tag object', async () => {
      const tag = fixtures.generate('tag', 1) as TagModel;

      const payload = {
        id: tag.id,
        name: 'New Name',
      };

      (TagStore.updateTag as jest.Mock).mockResolvedValue({
        ...tag,
        name: payload.name,
      });

      const res = await TagService.updateTag(payload);

      expect(TagStore.updateTag).toHaveBeenCalledWith(payload);

      expect(res).toEqual({ ...tag, name: payload.name });

      jest.restoreAllMocks();
    });
  });
  describe('updateTag', () => {
    test('it should assign if doesn`t exist or update a tag`s group and return the updated tag object', async () => {
      const tag = fixtures.generate('tag', 1) as TagModel;

      const payload = {
        id: tag.id,
        groupId: 3,
      };

      (TagStore.updateTag as jest.Mock).mockResolvedValue({
        ...tag,
        groupId: 3,
      });

      const res = await TagService.updateTag(payload);

      expect(TagStore.updateTag).toHaveBeenCalledWith(payload);

      expect(res).toEqual({ ...tag, groupId: payload.groupId });

      jest.restoreAllMocks();
    });
  });
  describe('updateTagGroup', () => {
    test('it should update a tag_group name and return the updated tag object', async () => {
      const tag = fixtures.generate('tagGroup', 1) as TagGroupModel;

      const payload = {
        id: tag.id,
        name: 'New Group',
      };

      (TagStore.updateTagGroup as jest.Mock).mockResolvedValue({
        ...tag,
        name: payload.name,
      });

      const res = await TagService.updateTagGroup(payload);

      expect(TagStore.updateTagGroup).toHaveBeenCalledWith(payload);

      expect(res).toEqual({ ...tag, name: payload.name });

      jest.restoreAllMocks();
    });
  });
});
