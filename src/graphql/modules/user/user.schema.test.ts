import { gql, ApolloServer } from 'apollo-server-express';
import schema from '@graphql/schemasMap';
import fixtures from '@test/fixtures';
import { UserService } from '@services';
import { UserOnboardingModel, UserViewOptionsModel } from '@models/user.model';

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
        isAuthenticated: true,
        user: mockUser,
      },
    };
  },
});

describe('user.schema', () => {
  describe('User resolvers', () => {
    describe('User.viewOptions', () => {
      test('it should return the view options JSON', async () => {
        const mockResponse = fixtures.generate(
          'userViewOptions',
        ) as UserViewOptionsModel;

        (UserService.getUserViewOptions as jest.Mock).mockResolvedValue(
          mockResponse,
        );

        const result = await testServer.executeOperation({
          query: gql`
            query UserQuery {
              currentUser {
                id
                name
                viewOptions
              }
            }
          `,
        });

        expect(UserService.getUserViewOptions).toBeCalledWith({
          userId: mockUser.id,
          currentUser: mockUser,
        });
        expect(result.errors).toBeUndefined();
        expect(result.data?.currentUser).not.toBeNull();
      });
    });

    describe('User.onboarding', () => {
      test('it should return the onboarding JSON', async () => {
        const mockResponse = fixtures.generate(
          'userOnboarding',
        ) as UserOnboardingModel;

        (UserService.getUserOnboarding as jest.Mock).mockResolvedValue(
          mockResponse,
        );

        const result = await testServer.executeOperation({
          query: gql`
            query UserQuery {
              currentUser {
                id
                name
                onboarding
              }
            }
          `,
        });

        expect(UserService.getUserOnboarding).toBeCalledWith({
          userId: mockUser.id,
          currentUser: mockUser,
        });
        expect(result.errors).toBeUndefined();
        expect(result.data?.currentUser).not.toBeNull();
      });
    });
  });

  describe('Mutations', () => {
    describe('requestAccountDeletion', () => {
      it('should initiate a user account deletion request', async () => {
        const mockInput = {
          reason: `My cat ate my ssh key so I no longer want to use this account.`,
          alternateEmail: 'meow@cat.com',
        };

        (UserService.requestAccountDeletion as jest.Mock).mockResolvedValue({
          success: true,
          message: `Account deletion requested. We will contact you at <${mockUser.email}> shortly. If you have any questions, please contact us at <support@gokudos.io>.`,
        });

        try {
          const result = await testServer.executeOperation({
            query: gql`
              mutation RequestAccountDeletion(
                $input: RequestAccountDeletionInput!
              ) {
                requestAccountDeletion(input: $input) {
                  message
                }
              }
            `,
            variables: {
              input: mockInput,
            },
          });

          expect(UserService.requestAccountDeletion).toBeCalledWith({
            user: mockUser,
            ...mockInput,
          });
          expect(result.errors).toBeUndefined();
        } catch (error) {
          console.error('error', error);
        }
      });
    });
  });
});
