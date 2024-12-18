import { ApolloError, gql, UserInputError } from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { withAuth } from '@graphql/wrappers';
import { handleResolverError } from '@graphql/errors';
import { CompanyService, HolidayService } from '@services';
import { CompanyHolidayModel } from '@models/holiday.model';
import _ from 'lodash';
import { HOLIDAY_TYPE } from '@data-access/holiday/holiday.store';

import {
  getCompany,
  getCompanyHoliday,
  getPublicHoliday,
} from '@data-access/getters';

export const resolvers: Resolvers = {
  Mutation: {
    createHoliday: withAuth(
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

          const res = await HolidayService.createHoliday({
            companyId: company.id,
            userId: user.id,
            payload: input,
          });
          return res;
        } catch (error) {
          return [handleResolverError(error)];
        }
      },
    ),
    deactivatePublicHoliday: withAuth(
      async (
        root,
        { companyId, publicHolidayId },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isMember) {
            throw new UserInputError('User is not a member');
          }

          const publicHoliday = await getPublicHoliday(publicHolidayId);

          const deactivatedPublicHoliday =
            await HolidayService.getDeactivatedHoliday({
              companyId: company.id,
              publicHolidayId: publicHoliday.id,
            });

          if (deactivatedPublicHoliday) {
            throw new UserInputError(
              'That public holiday is already deactivated for this company',
            );
          }

          const res = (await HolidayService.deactivatePublicHoliday({
            companyId: company.id,
            userId: user.id,
            payload: publicHoliday,
          })) as CompanyHolidayModel;

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCompanyHoliday: withAuth(
      async (
        root,
        { companyHolidayId, companyId, input },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!isMember) {
            throw new UserInputError('User is not a member');
          }

          const companyHoliday = await getCompanyHoliday(companyHolidayId);

          const res = (await HolidayService.updateCompanyHoliday({
            companyHolidayId: companyHoliday.id,
            companyId: company.id,
            payload: input,
          })) as CompanyHolidayModel;

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    deleteCompanyHoliday: withAuth(
      async (
        root,
        { companyId, companyHolidayId },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isMember) {
            throw new UserInputError('User is not a member');
          }

          const companyHoliday = await getCompanyHoliday(companyHolidayId);

          const res = await HolidayService.deleteCompanyHoliday({
            companyId: company.id,
            companyHolidayId: companyHoliday.id,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    activatePublicHoliday: withAuth(
      async (root, { companyId, holidayId }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isMember) {
            throw new UserInputError('User is not a member');
          }
          const companyHoliday = await getCompanyHoliday(holidayId);

          if (!companyHoliday.public_holiday_id) {
            throw new UserInputError('This is not a public holiday');
          }

          const res = await HolidayService.activatePublicHoliday({
            companyId: company.id,
            companyHolidayId: companyHoliday.id,
          });
          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
  },
  Holiday: {
    id: ({ id_text }) => id_text,
    company: async ({ company_id }, args, { loaders }) => {
      return await loaders.companies.load(company_id);
    },
    active: ({ active }) => {
      return active === 1 ? true : false;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    type: ({ type }) => {
      return type === HOLIDAY_TYPE.CUSTOM ? 'CUSTOM' : 'PUBLIC';
    },
  },
  CompanyHoliday: {
    id: ({ id_text }) => id_text,
    company: async ({ company_id }, args, { loaders }) => {
      return await loaders.companies.load(company_id);
    },
    active: ({ active }) => {
      return active === 1 ? true : false;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    //deprecated
    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    type: ({ type }) => {
      return type === HOLIDAY_TYPE.CUSTOM ? 'CUSTOM' : 'PUBLIC';
    },
  },
  PublicHoliday: {
    id: ({ id_text }) => id_text,
  },
  CompanyHolidayStatus: {
    ACTIVE: 1,
    INACTIVE: 0,
  },
  Query: {
    holidays: withAuth(
      async (root, { companyId, year }, { loaders, auth: { user } }) => {
        const company = await getCompany(companyId);

        const res = await HolidayService.getHolidays({
          companyId: company.id,
          year,
        });
        return res;
      },
    ),
  },
};
