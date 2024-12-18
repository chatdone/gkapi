import { ApolloError, UserInputError } from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { withAuth } from '@graphql/wrappers';
import { DataLoaders } from '@models/common.model';
import { AuthContextPayload } from '@graphql/authContext';
import { handleResolverError } from '@graphql/errors';
import { CompanyService, LocationService } from '@services';

import _ from 'lodash';
import { getCompany, getLocation, getLocations } from '@data-access/getters';

export const resolvers: Resolvers = {
  Query: {
    location: withAuth(
      async (
        root,
        { id },
        {
          loaders,
          auth: { user },
        }: { loaders: DataLoaders; auth: AuthContextPayload },
      ) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }

          return await loaders.locations.load(id);
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    locations: withAuth(
      async (
        root,
        { companyId },
        {
          loaders,
          auth: { user },
        }: { loaders: DataLoaders; auth: AuthContextPayload },
      ) => {
        try {
          const company = await getCompany(companyId);

          const locations = await LocationService.getLocations(company.id);

          return locations;
        } catch (error) {
          throw new ApolloError((error as Error).message);
        }
      },
    ),
  },
  Location: {
    id: ({ id_text }) => id_text,
    company: async ({ company_id }, args, { loaders }) => {
      return await loaders.companies.load(company_id);
    },
    archived: ({ archived }) => {
      return archived ? true : false;
    },
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    updatedBy: async ({ updatedBy }, args, { loaders }) => {
      return updatedBy ? await loaders.users.load(updatedBy) : null;
    },
    metadata: ({ metadata }) => {
      return JSON.stringify(metadata || {});
    },
  },
  Mutation: {
    createLocation: withAuth(
      async (root, { companyId, input }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isMember) {
            throw new UserInputError('User is not a member');
          }

          const res = await LocationService.createLocation({
            user,
            companyId: company.id,
            payload: { ...input },
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateLocation: withAuth(
      async (root, { locationId, input }, { loaders, auth: { user } }) => {
        try {
          const location = await getLocation(locationId);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: location.company_id,
          });

          if (!isMember) {
            throw new UserInputError('User is not a member');
          }

          const res = await LocationService.updateLocation({
            userId: user.id,
            locationId: location.id,
            payload: { ...input },
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),

    deleteLocations: withAuth(
      async (root, { locationIds }, { loaders, auth: { user } }) => {
        try {
          const locations = await getLocations(locationIds);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: locations[0].company_id,
          });

          if (!isMember) {
            throw new UserInputError('User is not a member');
          }

          const res = await LocationService.deleteLocations(locations);

          if (res === locations.length) {
            return locations;
          } else {
            throw new UserInputError('Unable to delete one or more locations');
          }
        } catch (error) {
          return [handleResolverError(error)];
        }
      },
    ),
    updateLocationArchivedStatus: withAuth(
      async (root, { locationIds, archived }, { loaders, auth: { user } }) => {
        try {
          const locations = await getLocations(locationIds);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: locations[0].company_id,
          });

          if (!isMember) {
            throw new UserInputError('User is not a member');
          }

          const res = await LocationService.updateLocationArchivedStatus({
            locations,
            archived,
            userId: user.id,
          });

          if (res.length === locations.length) {
            return res;
          } else {
            throw new Error('Unable to archive one or more locations');
          }
        } catch (error) {
          throw new ApolloError((error as Error).message);
        }
      },
    ),
  },
};
