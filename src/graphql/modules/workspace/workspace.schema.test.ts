import { ApolloServer, gql } from 'apollo-server-express';
import schema from '@graphql/schemasMap';
import fixtures from '@test/fixtures';
import { WorkspaceService } from '@services';
import { getCompany, getWorkspace } from '@data-access/getters';
import serviceFixtures from '@test/fixtures/service.fixtures';
import { CompanyModel } from '@models/company.model';
import { WorkspaceModel } from '@models/workspace.model';
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
        isAuthenticated: true,
      },
    };
  },
});

describe('workspace.schema', () => {
  describe('createProject', () => {
    test('it should create a project', async () => {
      // placeholder
    });
    // test('it should create a project', async () => {
    //   const mockCompany = serviceFixtures.generate('company') as CompanyModel;
    //   const mockWorkspace = serviceFixtures.generate(
    //     'workspace',
    //   ) as WorkspaceModel;
    //   (getCompany as jest.Mock).mockResolvedValue(mockCompany);
    //   (getWorkspace as jest.Mock).mockResolvedValue(mockWorkspace);
    //   const mockInput = {
    //     name: 'Korone Doggo Items',
    //     companyId: 'teh38ghteouh82n',
    //     workspaceId: 'umi34pi8ghetuh',
    //   };
    //   try {
    //     const result = await testServer.executeOperation({
    //       query: gql`
    //         mutation CreateProject($input: CreateProjectInput!) {
    //           createProject(input: $input) {
    //             id
    //           }
    //         }
    //       `,
    //       variables: {
    //         input: mockInput,
    //       },
    //     });
    //     expect(WorkspaceService.createProject).toBeCalledWith({
    //       name: mockInput.name,
    //       user: mockUser,
    //       companyId: mockCompany.id,
    //       workspaceId: mockWorkspace.id,
    //     });
    //     expect(result.errors).toBeUndefined();
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
  });
});
