import { gql, ApolloServer } from 'apollo-server-express';
import schema from '@graphql/schemasMap';
import fixtures from '@test/fixtures';
import { CollectionService } from '@services';
import { CollectionModel } from '@models/collection.model';
import { getCollection, getCompanyMembers } from '@data-access/getters';
import { CompanyMemberModel } from '@models/company.model';

jest.mock('@data-access/getters');
jest.mock('@services');

const mockUser = fixtures.generateCustom('user', {
  activeCompany: 177,
  companyIds: [23, 78, 387],
});

const testServer = new ApolloServer({
  schema,
  context: () => {
    return {
      auth: {
        user: mockUser,
      },
    };
  },
});

describe('collection.schema', () => {
  describe('assignMembersToCollection', () => {
    it('assigns members to collection', async () => {
      const mockResponse = fixtures.generate('collection') as CollectionModel;

      const mockCollection = fixtures.generate('collection') as CollectionModel;
      const mockMembers = fixtures.generate(
        'companyMember',
        3,
      ) as CompanyMemberModel[];

      (getCollection as jest.Mock).mockResolvedValue(mockCollection);
      (getCompanyMembers as jest.Mock).mockResolvedValue(mockMembers);

      (
        CollectionService.assignMembersToCollection as jest.Mock
      ).mockResolvedValue(mockResponse);

      try {
        const result = await testServer.executeOperation({
          query: gql`
            mutation AssignMembersToCollectionMutation(
              $input: AssignMembersToCollectionInput!
            ) {
              assignMembersToCollection(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              collectionId: mockCollection.id_text,
              memberIds: mockMembers.map((m) => m.id_text),
            },
          },
        });

        expect(CollectionService.assignMembersToCollection).toBeCalledWith({
          collectionId: mockCollection.id,
          memberIds: mockMembers.map((m) => m.id),
          user: mockUser,
        });
        expect(result.errors).toBeUndefined();
      } catch (error) {
        console.error('error', error);
      }
    });
  });

  describe('removeMembersFromCollection', () => {
    it('returns members from collection', async () => {
      const mockResponse = fixtures.generate('collection') as CollectionModel;

      const mockCollection = fixtures.generate('collection') as CollectionModel;
      const mockMembers = fixtures.generate(
        'companyMember',
        3,
      ) as CompanyMemberModel[];

      (getCollection as jest.Mock).mockResolvedValue(mockCollection);
      (getCompanyMembers as jest.Mock).mockResolvedValue(mockMembers);

      (
        CollectionService.removeMembersFromCollection as jest.Mock
      ).mockResolvedValue(mockResponse);

      try {
        const result = await testServer.executeOperation({
          query: gql`
            mutation RemoveMembersFromCollectionMutation(
              $input: RemoveMembersFromCollectionInput!
            ) {
              removeMembersFromCollection(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              collectionId: mockCollection.id_text,
              memberIds: mockMembers.map((m) => m.id_text),
            },
          },
        });

        expect(CollectionService.removeMembersFromCollection).toBeCalledWith({
          collectionId: mockCollection.id,
          memberIds: mockMembers.map((m) => m.id),
          user: mockUser,
        });
        expect(result.errors).toBeUndefined();
      } catch (error) {
        console.error('error', error);
      }
    });
  });
});
