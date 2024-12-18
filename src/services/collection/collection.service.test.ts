import { CollectionStore } from '@data-access';
import fixtures from '@test/fixtures';
import CollectionService from './collection.service';
import _ from 'lodash';
import { UserModel } from '@models/user.model';
import { CollectionModel } from '@models/collection.model';
import { CompanyMemberModel } from '@models/company.model';

jest.mock('../../data-access/collection/collection.store');

describe('collection.service', () => {
  const mockUser = fixtures.generate('user');
  describe('getCollectionAssignees', () => {
    test('it should get the company members assigned to a collection', async () => {
      const mockInput = {
        collectionId: 123,
        user: mockUser,
      };

      const mockResponse = fixtures.generate(
        'companyMember',
        5,
      ) as CompanyMemberModel[];

      (CollectionStore.getCollectionAssignees as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const res = await CollectionService.getCollectionAssignees(mockInput);

      expect(CollectionStore.getCollectionAssignees).toHaveBeenCalledWith({
        collectionId: mockInput.collectionId,
      });
      expect(res).toEqual(mockResponse);
    });
  });
  describe('assignMembersToCollection', () => {
    test('it should assign company members to a collection', async () => {
      const mockInput = {
        collectionId: 123,
        memberIds: [23, 872, 922],
        user: mockUser,
      };

      const mockResponse = fixtures.generate('collection') as CollectionModel;

      (
        CollectionStore.assignMembersToCollection as jest.Mock
      ).mockResolvedValue(mockResponse);

      const res = await CollectionService.assignMembersToCollection(mockInput);

      expect(CollectionStore.assignMembersToCollection).toHaveBeenCalledWith({
        collectionId: mockInput.collectionId,
        memberIds: mockInput.memberIds,
      });
      expect(res).toEqual(mockResponse);
    });
  });

  describe('removeMembersFromCollection', () => {
    test('it should remove company members from a collection', async () => {
      const mockInput = {
        collectionId: 123,
        memberIds: [23, 872, 922],
        user: mockUser,
      };

      const mockResponse = fixtures.generate('collection') as CollectionModel;

      (
        CollectionStore.removeMembersFromCollection as jest.Mock
      ).mockResolvedValue(mockResponse);

      const res = await CollectionService.removeMembersFromCollection(
        mockInput,
      );

      expect(CollectionStore.removeMembersFromCollection).toHaveBeenCalledWith({
        collectionId: mockInput.collectionId,
        memberIds: mockInput.memberIds,
      });
      expect(res).toEqual(mockResponse);
    });
  });
});
