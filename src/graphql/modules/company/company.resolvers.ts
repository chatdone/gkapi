import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from 'apollo-server-express';
import { Resolvers } from '@generated/graphql-types';
import { GraphQLUpload } from 'graphql-upload';
import {
  CompanyMemberId,
  CompanyMemberModel,
  CompanyMemberPermissionScopeModel,
  CompanyMemberReferenceImageModel,
  CompanyModel,
  CompanyPermissionModel,
  CompanyProfileModel,
  CompanyStorageDetailsModel,
  CompanyTeamModel,
  CompanyTeamStatusModel,
  CompanyWorkDaySettingModel,
  EmployeeTypeModel,
} from '@models/company.model';
import {
  CompanyService,
  SenangPayService,
  StripeService,
  SubscriptionService,
  TaskService,
} from '@services';
import { withAuth, withUserAuth } from '@graphql/wrappers';
import { handleResolverError } from '@graphql/errors';
import { AuthContextPayload } from '@graphql/authContext';
import { DataLoaders } from '@models/common.model';
import { UserModel } from '@models/user.model';
import _ from 'lodash';
import { CompanySubscriptionModel } from '@models/subscription.model';
import dayjs from 'dayjs';
import { TaskModel } from '@models/task.model';
import joi from 'joi';
import {
  getCompany,
  getCompanyMember,
  getCompanyMembers,
  getCompanyTeam,
  getCompanyTeamStatus,
  getEmployeeType,
  getUsers,
} from '@data-access/getters';
import { CompanyStore, SubscriptionStore } from '@data-access';
import { SortDirection } from '@constants';

export const resolvers: Resolvers = {
  Query: {
    company: async (root, { id }, { auth: { user } }) => {
      try {
        if (!user.activeCompany) {
          if (!user.isAdmin) {
            throw new AuthenticationError('Not authorized');
          }

          const company = await getCompany(id);
          return company;
        }

        const company = await getCompany(id);

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!valid) {
          throw new AuthenticationError('User is not in company');
        }
        return company;
      } catch (error) {
        handleResolverError(error);
      }
    },
    companyStorage: withUserAuth(
      async (
        root,
        { companyId },
        {
          loaders,
          auth: { user },
        }: { loaders: DataLoaders; auth: AuthContextPayload },
      ) => {
        if (!user) {
          throw new Error('Missing user');
        }
        const company = await getCompany(companyId);

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!valid) {
          throw new AuthenticationError('User is not in company');
        }
        const res = (await CompanyService.getCompanyStorageDetails(
          company.id,
        )) as CompanyStorageDetailsModel;
        return res;
      },
    ),
    companySlug: withUserAuth(
      async (
        root,
        { slug },
        {
          loaders,
          auth: { user },
        }: { loaders: DataLoaders; auth: AuthContextPayload },
      ) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }
          const company = (await loaders.getByCompanySlug.load(
            slug,
          )) as CompanyModel;

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User is not in company');
          }
          return company;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    companyMember: withUserAuth(
      async (root, { companyMemberId }, { auth: { user }, loaders }) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }

          const member = await getCompanyMember(companyMemberId);

          const { company_id } = member;

          const company = await loaders.companies.load(company_id);
          if (!company) {
            throw new Error('Company no longer exists');
          }

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!valid) {
            throw new UserInputError('User not in company');
          }

          const res = await loaders.companyMembers.load(companyMemberId);

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    companies: async (root, { pagination }, { auth: { user } }) => {
      try {
        const { limit, offset, orderBy, sortDirection } = pagination || {};
        const now = dayjs();
        if (!user.activeCompany) {
          if (user.isAdmin) {
            const res = await CompanyStore.listCompanies({
              limit: limit || 10,
              offset: offset || 0,
              orderBy: orderBy || 'name',
              sortDirection: sortDirection || SortDirection.ASC,
            });

            return res;
          }
        }

        if (!user) {
          throw new Error('Missing user');
        }
        const res = (await CompanyService.getCompanies(
          user.id,
        )) as CompanyModel[];

        // console.log('end company', dayjs().diff(now, 'ms'));
        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    companyTeams: async (
      root,
      { companyId },
      { loaders, auth: { isAuthenticated } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }
      const now = dayjs();
      const company = await getCompany(companyId);

      const res = await CompanyService.getCompanyTeams(company.id);
      // console.log('end companyTeams', dayjs().diff(now, 'ms'));

      return res;
    },
    teamStatuses: async (
      root,
      { companyTeamId },
      { loaders, auth: { isAuthenticated } },
    ) => {
      if (!isAuthenticated) {
        throw new AuthenticationError('Not logged in');
      }
      const team = await getCompanyTeam(companyTeamId);
      const res = (await CompanyService.getCompanyTeamStatuses(
        team.id,
      )) as CompanyTeamStatusModel[];

      const sortBySequences = res.sort((a, b) => {
        return a.sequence - b.sequence;
      });

      return sortBySequences;
    },
    senangPayUsers: async (
      root,
      { companyId },
      { loaders, auth: { isAuthenticated } },
    ) => {
      const company = await getCompany(companyId);

      const result = (await SenangPayService.getSenangPayUsers(
        company.id,
      )) as CompanyMemberModel[];
      return result;
    },
    getReferenceImageUploadUrl: withUserAuth(
      async (root, { companyId }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User not in company');
          }

          const res = await CompanyService.getReferenceImageUploadUrl(
            companyId,
          );
          return res;
        } catch (error) {
          throw new Error((error as Error).message);
        }
      },
    ),
    companyWorkDaySettings: withUserAuth(
      async (
        root,
        { companyId, employeeTypeId },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User not in company');
          }

          const type = await getEmployeeType(employeeTypeId);

          const res = (await CompanyService.getWorkDaySettings({
            employeeTypeId: type.id,
          })) as CompanyWorkDaySettingModel[];
          return res;
        } catch (error) {
          throw new Error((error as Error).message);
        }
      },
    ),
    companyProfileJson: withUserAuth(
      async (
        root,
        { companyId },
        {
          loaders,
          auth: { user },
        }: { loaders: DataLoaders; auth: AuthContextPayload },
      ) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }
          const company = await getCompany(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User is not in company');
          }

          const res = await CompanyService.getCompanyProfileJson({
            companyId: company.id,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
          return null;
        }
      },
    ),
    companyTeam: withUserAuth(
      async (
        root,
        { id },
        { auth: { user } }: { loaders: DataLoaders; auth: AuthContextPayload },
      ) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }

          const team = await getCompanyTeam(id);

          return team;
        } catch (error) {
          handleResolverError(error);
          return null;
        }
      },
    ),
    employeeType: withUserAuth(
      async (
        root,
        { employeeTypeId },
        { auth: { user } }: { loaders: DataLoaders; auth: AuthContextPayload },
      ) => {
        try {
          if (!user) {
            throw new Error('Missing user');
          }

          const employeeType = await getEmployeeType(employeeTypeId);

          return employeeType;
        } catch (error) {
          handleResolverError(error);
          return null;
        }
      },
    ),
    companyPaymentMethods: async (root, { companyId }, { auth: { user } }) => {
      try {
        const company = await getCompany(companyId);

        const res = await CompanyService.getCompanyPaymentMethods({
          companyId: company.id,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
  },
  Company: {
    id: ({ id_text }) => id_text,
    members: async ({ id }) => {
      const res = await CompanyService.getCompanyMembers(id);
      return res;
    },
    teams: async ({ id }) => {
      const res = await CompanyService.getCompanyTeams(id);
      return res;
    },
    invoicePrefix: async ({ id }) => {
      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: id,
      })) as CompanyProfileModel;

      return companyProfile?.invoicePrefix;
    },
    invoiceStart: async ({ id }) => {
      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: id,
      })) as CompanyProfileModel;

      return companyProfile?.invoiceStartString;
    },
    address: async ({ id }) => {
      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: id,
      })) as CompanyProfileModel;

      return companyProfile?.address;
    },
    email: async ({ id }) => {
      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: id,
      })) as CompanyProfileModel;

      return companyProfile?.email;
    },
    phone: async ({ id }) => {
      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: id,
      })) as CompanyProfileModel;

      return companyProfile?.phone;
    },
    website: async ({ id }) => {
      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: id,
      })) as CompanyProfileModel;

      return companyProfile?.website;
    },
    registrationCode: async ({ id }) => {
      const companyProfile = (await CompanyService.getCompanyProfile({
        companyId: id,
      })) as CompanyProfileModel;

      return companyProfile?.registrationCode;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    //deprecated
    deleted_by: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    deletedBy: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    settings: ({ settings }) => {
      return JSON.stringify(settings || {});
    },
    currentSubscription: async ({ id }, args, { auth: { user } }) => {
      const res = await SubscriptionService.getSubscriptionForCompanyId({
        companyId: id,
        user,
      });
      return res;
    },
    subscriptions: async ({ id }) => {
      const res = await SubscriptionService.getActiveCompanySubscriptions(id);
      return res;
    },
    //deprecated
    active_subscription: async ({ id }) => {
      const res = (await SubscriptionService.getActiveCompanySubscriptions(
        id,
      )) as CompanySubscriptionModel[];
      return res;
    },
    //deprecated
    employee_types: async ({ id }) => {
      const res = (await CompanyService.getEmployeeTypes({
        companyId: id,
      })) as EmployeeTypeModel[];

      return res.filter((et) => !et?.archived);
    },
    activeSubscription: async ({ id }) => {
      const res = (await SubscriptionService.getActiveCompanySubscriptions(
        id,
      )) as CompanySubscriptionModel[];
      return res;
    },
    employeeTypes: async ({ id }) => {
      const res = (await CompanyService.getEmployeeTypes({
        companyId: id,
      })) as EmployeeTypeModel[];

      return res.filter((et) => !et?.archived);
    },
    permission: async ({ id }) => {
      const res = (await CompanyService.getCompanyPermission(
        id,
      )) as CompanyPermissionModel;
      if (typeof res?.grants === 'string') {
        return res?.grants;
      } else {
        return JSON.stringify(res?.grants);
      }
    },
    //deprecated
    default_timezone: async ({ id }) => {
      const res = await CompanyService.getCompanyProfile({ companyId: id });
      const isError = res instanceof Error;

      if (!isError) {
        return res?.default_timezone;
      } else {
        return null;
      }
    },
    defaultTimezone: async ({ id }) => {
      const res = await CompanyService.getCompanyProfile({ companyId: id });
      const isError = res instanceof Error;

      if (!isError) {
        return res?.default_timezone;
      } else {
        return null;
      }
    },
    expiredSubscription: async ({ id }) => {
      const res = await SubscriptionService.getExpiredCompanySubscriptions(id);
      return res;
    },
  },
  CompanyMember: {
    id: ({ id_text }) => id_text,
    user: async ({ user_id }, args, { loaders }) =>
      await loaders.users.load(user_id),
    permissions: ({ setting }) => {
      try {
        if (!setting) {
          return [];
        }

        const scopes: CompanyMemberPermissionScopeModel[] = [];
        _.each(setting, (value, key) => {
          scopes.push({
            scope: key,
            enabled: value === '1' ? true : false,
          });
        });

        return scopes;
      } catch (error) {
        return [];
      }
    },
    //deprecated
    reference_image: async ({ id }, args, { loaders }) => {
      const res = (await CompanyService.getCompanyMemberReferenceImage(
        id,
      )) as CompanyMemberReferenceImageModel;
      return res;
    },
    //deprecated
    employee_type: async ({ employee_type }, args, { loaders }) => {
      if (!employee_type) {
        return null;
      }
      const employeeType = (await loaders.employeeTypes.load(
        employee_type,
      )) as EmployeeTypeModel;

      if (employeeType?.archived) {
        return null;
      }

      return employeeType;
    },
    referenceImage: async ({ id }, args, { loaders }) => {
      const res = (await CompanyService.getCompanyMemberReferenceImage(
        id,
      )) as CompanyMemberReferenceImageModel;
      return res;
    },
    employeeType: async ({ employee_type }, args, { loaders }) => {
      if (!employee_type) {
        return null;
      }
      const employeeType = (await loaders.employeeTypes.load(
        employee_type,
      )) as EmployeeTypeModel;

      if (employeeType?.archived) {
        return null;
      }

      return employeeType;
    },
    hourlyRate: async ({ hourly_rate }) => hourly_rate,
    teams: async ({ id }, args, { loaders }) => {
      const teams = await CompanyStore.getCompanyTeamsByMemberIdV2({
        memberId: id,
      });

      return teams;
    },
  },

  CompanyTeam: {
    id: ({ id_text }) => id_text,
    company: async ({ company_id }, args, { loaders }) =>
      await loaders.companies.load(company_id),

    statuses: async ({ id }) => {
      const res = await CompanyService.getCompanyTeamStatuses(id);
      return res;
    },
    members: async ({ id }) => {
      const res = await CompanyService.getCompanyTeamMembers(id);
      return res;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    //deprecated
    deleted_by: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    deletedBy: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
  },
  CompanyTeamStatus: {
    id: ({ id_text }) => id_text,
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    //deprecated
    deleted_by: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    deletedBy: async ({ deleted_by }, args, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
    stage: ({ stage }) => (stage === 0 ? 1 : stage),
    team: async ({ team_id }, args, { loaders }) => {
      return team_id ? await loaders.companyTeams.load(team_id) : null;
    },
  },
  ResourcePermission: {
    //deprecated
    company_members: async ({ company_member_ids }, args, { loaders }) => {
      const memberIds =
        typeof company_member_ids === 'string'
          ? JSON.parse(company_member_ids)
          : company_member_ids;
      const members = (await loaders.companyMembers.loadMany(
        memberIds,
      )) as CompanyMemberModel[];

      return members;
    },
    companyMembers: async ({ company_member_ids }, args, { loaders }) => {
      const memberIds =
        typeof company_member_ids === 'string'
          ? JSON.parse(company_member_ids)
          : company_member_ids;
      const members = (await loaders.companyMembers.loadMany(
        memberIds,
      )) as CompanyMemberModel[];

      return members;
    },
    teams: async ({ team_ids }, args, { loaders }) => {
      const teamIds =
        typeof team_ids === 'string' ? JSON.parse(team_ids) : team_ids;
      const teams = (await loaders.companyTeams.loadMany(
        teamIds,
      )) as CompanyTeamModel[];

      return teams;
    },
  },
  CompanyMemberReferenceImage: {
    //deprecated
    action_by: async ({ action_by }, args, { loaders }) => {
      return action_by ? await loaders.users.load(action_by) : null;
    },
    actionBy: async ({ action_by }, args, { loaders }) => {
      return action_by ? await loaders.users.load(action_by) : null;
    },
  },
  CompanyWorkDaySetting: {
    company: async ({ company_id }, args, { loaders }) => {
      return company_id ? await loaders.companies.load(company_id) : null;
    },
    //deprecated
    created_by: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    //deprecated
    updated_by: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    createdBy: async ({ created_by }, args, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updatedBy: async ({ updated_by }, args, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
  },
  EmployeeType: {
    id: ({ id_text }) => id_text,
    archived: ({ archived }) => !!archived,
    workDaySettings: async ({ id }) => {
      const res = (await CompanyService.getWorkDaySettings({
        employeeTypeId: id,
      })) as CompanyWorkDaySettingModel[];

      return res;
    },
  },
  CompanyMemberReferenceImageResponse: {
    uploadUrl: ({ upload_url }) => (upload_url ? upload_url : null),
    s3Bucket: ({ s3_bucket }) => (s3_bucket ? s3_bucket : null),
    s3Key: ({ s3_key }) => (s3_key ? s3_key : null),
  },
  CompanyPaymentMethod: {
    company: async ({ companyId }, args, { loaders }) => {
      try {
        const company = await loaders.companies.load(companyId);
        return company;
      } catch (error) {
        return null;
      }
    },
    brand: ({ card }) => card.brand,
    last4: ({ card }) => card.last4,
    expMonth: ({ card }) => card.exp_month,
    expYear: ({ card }) => card.exp_year,
    createdBy: async ({ createdBy }, args, { loaders }) => {
      return createdBy ? await loaders.users.load(createdBy) : null;
    },
    updatedBy: async ({ updatedBy }, args, { loaders }) => {
      return updatedBy ? await loaders.users.load(updatedBy) : null;
    },
  },
  CompanyMemberType: {
    ADMIN: 1,
    MANAGER: 2,
    MEMBER: 3,
  },
  CompanyTeamStatusType: {
    PENDING: 1,
    DONE: 2,
    REJECTED: 3,
  },
  StageType: {
    PENDING: 1,
    PASS: 2,
    FAIL: 3,
    CLOSED: 4,
  },
  CompanyMemberReferenceImageStatus: {
    PENDING_APPROVAL: 0,
    APPROVED: 1,
    REJECTED: 2,
  },
  WorkDay: {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
  },
  CompanyArchivedUpdate: {
    UNARCHIVED: 0,
    ARCHIVED: 1,
  },
  ResourceType: {
    TASK: 'task',
    COLLECTION: 'collection',
  },
  Upload: GraphQLUpload,
  Mutation: {
    createCompany: withUserAuth(async (root, { input }, { auth: { user } }) => {
      try {
        const res = await CompanyService.createCompany({
          userId: user.id,
          payload: { ...input, user_id: user.id },
        });
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    }),
    deleteCompany: withUserAuth(
      async (root, { companyId }, { auth: { user }, loaders }) => {
        const company = await getCompany(companyId);

        try {
          const res = await CompanyService.deleteCompany(company.id);

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCompanyInfo: async (
      root,
      { companyId, input },
      { loaders, auth: { user } },
    ) => {
      const {
        accountCode,
        name,
        description,
        logoUrl,
        invoicePrefix,
        address,
        email,
        phone,
        website,
        registrationCode,
        invoiceStart,
      } = input;
      const company = await getCompany(companyId);

      const valid = await CompanyService.validateUserInCompany({
        userId: user.id,
        companyId: company.id,
      });
      if (!valid) {
        throw new AuthenticationError('User is not in company');
      }

      try {
        const res = await CompanyService.updateCompanyInfo({
          userId: user.id,
          companyId: company.id,
          payload: {
            ...input,
            ...(name && { name }),
            ...(description && { description }),
            ...(logoUrl && { logoUrl }),
            ...(accountCode && { accountCode }),
            ...(invoicePrefix && { invoicePrefix }),
            ...(typeof address !== 'undefined' && { address }),
            ...(typeof email !== 'undefined' && { email }),
            ...(typeof phone !== 'undefined' && { phone }),
            ...(typeof website !== 'undefined' && { website }),
            ...(typeof registrationCode !== 'undefined' && {
              registrationCode,
            }),
            ...(typeof invoiceStart !== 'undefined' && { invoiceStart }),
          },
        });

        // address?: string | null;
        // email?: string | null;
        // phone?: string | null;
        // website?: string | null;
        // registrationCode?: string | null;
        // invoiceStart?: number | null;

        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },

    uploadCompanyProfileImage: withUserAuth(
      async (root, { companyId, attachment }, { loaders, auth: { user } }) => {
        const company = await getCompany(companyId);

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!valid) {
          throw new AuthenticationError('User is not in company');
        }

        try {
          const res = await CompanyService.uploadCompanyProfileImage({
            user,
            company,
            attachment,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    addMemberToCompany: withUserAuth(
      async (root, { companyId, input }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User is not in company');
          }

          const member = (await CompanyService.getMemberByUserIdAndCompanyId({
            companyId: company.id,
            userId: user.id,
          })) as CompanyMemberModel;

          if (!member) {
            throw new UserInputError(
              `Member not found in company: ${company.name}`,
            );
          }

          const userMember =
            (await CompanyService.getMemberByUserIdAndCompanyId({
              companyId: company.id,
              userId: user.id,
            })) as CompanyMemberModel;

          if (process.env.PERMISSIONS_FLAG && userMember?.type !== 1) {
            const permission =
              await CompanyService.checkCompanyMemberPermission({
                memberType: userMember.type,
                companyId: company.id,
                resource: 'member',
                action: 'create:any',
              });

            if (!permission.hasPermission) {
              return new UserInputError(
                `${permission.type} do not have permission to do this action`,
              );
            }
          }

          const { hourly_rate, email, employee_type_id } = input;

          const validateEmailRes = joi.string().email().validate(email);
          if (validateEmailRes.error) {
            throw new UserInputError('Not a valid email');
          }

          if (hourly_rate) {
            const currentRequestCompanyMember =
              (await CompanyService.getMemberByUserIdAndCompanyId({
                userId: user.id,
                companyId: company.id,
              })) as CompanyMemberModel;
            if (currentRequestCompanyMember?.type !== 1) {
              throw new AuthenticationError(
                'Insufficient permission to add hourly rate',
              );
            }
          }

          let employeeType;
          if (employee_type_id) {
            const employeeTypeRes = await getEmployeeType(employee_type_id);

            employeeType = employeeTypeRes;
          }

          const res = await CompanyService.addCompanyMemberByEmail({
            companyId: company.id,
            payload: input,
            memberUser: user,
            employeeTypeId: employeeType?.id,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    removeMemberFromCompany: withUserAuth(
      async (
        root,
        { companyId, companyMemberId },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });
          if (!valid) {
            throw new AuthenticationError('User is not in company');
          }
          const companyMember = await getCompanyMember(companyMemberId);

          const userMember =
            (await CompanyService.getMemberByUserIdAndCompanyId({
              companyId: company.id,
              userId: user.id,
            })) as CompanyMemberModel;

          if (process.env.PERMISSIONS_FLAG && userMember.type !== 1) {
            const permission =
              await CompanyService.checkCompanyMemberPermission({
                memberType: userMember.type,
                companyId: company.id,
                resource: 'member',
                action: 'delete:any',
              });

            if (!permission.hasPermission) {
              return new UserInputError(
                `${permission.type} do not have permission to do this action`,
              );
            }
          }

          await CompanyService.removeCompanyMember({
            companyMember: companyMember,
            company,
            removedById: user?.id,
          });

          return company;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCompanyMemberInfo: withUserAuth(
      async (root, { companyMemberId, input }, { loaders, auth: { user } }) => {
        const companyMember = (await loaders.companyMembers.load(
          companyMemberId,
        )) as CompanyMemberModel;

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: companyMember.company_id,
        });
        if (!valid) {
          throw new AuthenticationError('User is not in company');
        }

        const { hourly_rate, employee_type_id, hourlyRate, employeeTypeId } =
          input;

        if (hourly_rate || hourlyRate) {
          const currentRequestCompanyMember =
            (await CompanyService.getMemberByUserIdAndCompanyId({
              userId: user.id,
              companyId: companyMember.company_id,
            })) as CompanyMemberModel;
          if (currentRequestCompanyMember?.type !== 1) {
            throw new AuthenticationError(
              'Insufficient permission to add hourly rate',
            );
          }
        }

        let employeeType;
        if (employee_type_id || employeeTypeId) {
          const employeeTypeRes = await getEmployeeType(
            employee_type_id || employeeTypeId,
          );

          employeeType = employeeTypeRes;
        }

        try {
          const res = await CompanyService.updateCompanyMemberInfo({
            companyMemberId: companyMember.id,
            companyMemberType: companyMember.type,
            companyId: companyMember.company_id,
            userId: user.id,
            payload: {
              type: input.type,
              position: input.position,
              hourly_rate: input.hourly_rate || input.hourlyRate,
              employee_type: employeeType?.id,
            },
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    createCompanyTeam: withUserAuth(
      async (root, { companyId, input }, { loaders, auth: { user } }) => {
        const company = await getCompany(companyId);

        const companyTeams = (await CompanyService.getCompanyTeams(
          company.id,
        )) as CompanyTeamModel[];

        const hasSameTeamName = companyTeams.some(
          (team) => team.title === input.title,
        );
        if (hasSameTeamName) {
          throw new UserInputError('Team name already existed');
        }

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!valid) {
          throw new AuthenticationError('User is not in company');
        }

        let memberIds: CompanyMemberId[] = [];
        if (input.member_ids) {
          const members = (await loaders.companyMembers.loadMany(
            input.member_ids,
          )) as UserModel[];
          memberIds = members.map((cm) => cm.id);
        }

        const res = await CompanyService.createCompanyTeam({
          currentUser: user,
          companyId: company.id,
          payload: input,
          memberIds,
        });

        return res;
      },
    ),
    deleteCompanyTeam: withUserAuth(
      async (root, { teamId }, { loaders, auth: { user } }) => {
        const team = await getCompanyTeam(teamId);

        const res = await CompanyService.deleteCompanyTeam({
          teamId: team.id,
          companyId: team.companyId,
        });

        return res;
      },
    ),
    updateCompanyTeamInfo: withUserAuth(
      async (root, { companyTeamId, input }, { loaders, auth: { user } }) => {
        const team = await getCompanyTeam(companyTeamId);

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: team.company_id,
        });
        if (!valid) {
          throw new AuthenticationError('User is not in company');
        }

        let memberIds: CompanyMemberId[] = [];
        if (input.member_ids) {
          const members = await getCompanyMembers(input.member_ids);
          memberIds = members.map((cm) => cm.id);
        }

        const res = await CompanyService.updateCompanyTeamInfo({
          currentUserId: user.id,
          team,
          payload: input,
          memberIds,
          user,
        });

        return res;
      },
    ),
    removeMemberFromCompanyTeam: withUserAuth(
      async (
        root,
        { teamMemberId, companyTeamId },
        { loaders, auth: { user } },
      ) => {
        const team = await getCompanyTeam(companyTeamId);

        const valid = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: team.company_id,
        });
        if (!valid) {
          throw new AuthenticationError('User is not in company');
        }

        const member = await getCompanyMember(teamMemberId);

        const res = await CompanyService.removeMemberFromCompanyTeam({
          companyMember: member,
          companyTeam: team,
          removedById: user.id,
        });

        return res;
      },
    ),
    deleteCompanyTeamStatus: withUserAuth(
      async (_, { companyTeamStatusId }, { loaders }) => {
        try {
          const companyTeamStatus = await getCompanyTeamStatus(
            companyTeamStatusId,
          );

          const res = await CompanyService.deleteCompanyTeamStatus({
            companyTeamStatusId: companyTeamStatus.id,
          });

          if (res >= 1) {
            return companyTeamStatus;
          } else throw Error('Failed to delete company team status');
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    addCompanyTeamStatus: withUserAuth(
      async (_, { teamId, input }, { loaders, auth: { user } }) => {
        try {
          const team = await getCompanyTeam(teamId);

          const res = await CompanyService.addCompanyTeamStatus({
            userId: user.id,
            payload: { ...input, team_id: team.id },
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCompanyTeamStatus: withUserAuth(
      async (_, { teamId, statusId, input }, { loaders, auth: { user } }) => {
        try {
          const team = await getCompanyTeam(teamId);

          const valid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: team.company_id,
          });
          if (!valid) {
            throw new AuthenticationError('User is not in company');
          }

          const status = await getCompanyTeamStatus(statusId);

          const tasksAssignedToStatus =
            (await TaskService.getTasksAssignedToStatusId(
              status.id,
            )) as TaskModel[];

          const res = await CompanyService.updateCompanyTeamStatus({
            userId: user.id,
            statusId: status.id,
            payload: { ...input },
            taskIds: tasksAssignedToStatus.map((task) => task.id),
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCompanyTeamStatusSequences: withUserAuth(
      async (_, { input }, { loaders, auth: { user } }) => {
        const res = await CompanyService.updateCompanyTeamStatusSequence({
          loaders,
          payload: input,
        });

        return res;
      },
    ),
    addSenangPayUsers: withUserAuth(
      async (_, { companyId, userIds }, { loaders, auth: { user } }) => {
        const company = await getCompany(companyId);

        const users = await getUsers(userIds);

        const res = (await SenangPayService.addSenangPayUsers({
          companyId: company.id,
          userIds: users.map((user) => user.id),
        })) as CompanyMemberModel[];
        return res;
      },
    ),
    removeSenangPayUsers: withUserAuth(
      async (_, { companyId, userIds }, { loaders, auth: { user } }) => {
        const company = await getCompany(companyId);

        const users = await getUsers(userIds);
        const res = (await SenangPayService.removeSenangPayUsers({
          companyId: company.id,
          userIds: users.map((user) => user.id),
        })) as CompanyMemberModel[];
        return res;
      },
    ),
    updateSenangPayOptions: withUserAuth(
      async (
        _,
        { companyId, defaultPayment, instalmentOption, fullOption, enabled },
        { loaders, auth: { user } },
      ) => {
        const company = await getCompany(companyId);

        const res = await CompanyService.updateSenangPayOptions({
          companyId: company.id,
          defaultPayment,
          instalmentOption,
          fullOption,
          enabled,
        });

        return res;
      },
    ),
    setCompanyMemberReferenceImage: withUserAuth(
      async (_, { companyMemberId, input }, { loaders, auth: { user } }) => {
        const member = await getCompanyMember(companyMemberId);

        const { company_id } = member;

        const validate = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company_id,
        });
        if (!validate) {
          throw new UserInputError('User is not in the company');
        }

        const res = await CompanyService.setCompanyMemberReferenceImage({
          companyMemberId: member.id,
          input,
        });

        return res;
      },
    ),
    setCompanyMemberReferenceImageStatus: withUserAuth(
      async (
        _,
        { companyId, companyMemberIds, status, remark },
        { loaders, auth: { user } },
      ) => {
        const company = await getCompany(companyId);

        const members = await getCompanyMembers(companyMemberIds);

        const validate = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });
        if (!validate) {
          throw new UserInputError('User is not in the company');
        }

        const memberIds = members.map((m) => m.id);

        const res = (await CompanyService.setCompanyMemberReferenceImageStatus({
          companyMemberIds: memberIds,
          status,
          remark,
          userId: user.id,
        })) as CompanyMemberModel[];

        return res;
      },
    ),

    createEmployeeType: withAuth(
      async (
        root,
        { companyId, name, overtime, timezone },
        { loaders, auth: { user } },
      ) => {
        try {
          const company = await getCompany(companyId);

          const isValid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isValid) {
            throw new AuthenticationError('User not in company');
          }

          const res = await CompanyService.createEmployeeType({
            companyId: company.id,
            name,
            overtime,
            userId: user.id,
            timezone: timezone
              ? timezone
              : process.env.LOCAL_TIMEZONE || 'Asia/Kuala_Lumpur',
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateEmployeeType: withAuth(
      async (
        root,
        { typeId, name, overtime, archived },
        { loaders, auth: { user } },
      ) => {
        try {
          const type = await getEmployeeType(typeId);

          const company = await loaders.companies.load(type.company_id);
          if (!company) {
            throw new UserInputError('Company does not exist');
          }

          const isValid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isValid) {
            throw new AuthenticationError('User not in company');
          }

          const res = await CompanyService.updateEmployeeType({
            typeId: type.id,
            name,
            overtime,
            archived,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    archiveEmployeeType: withAuth(
      async (root, { typeId, archived }, { loaders, auth: { user } }) => {
        try {
          const type = await getEmployeeType(typeId);

          const company = await loaders.companies.load(type.company_id);
          if (!company) {
            throw new UserInputError('Company does not exist');
          }

          const isValid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isValid) {
            throw new AuthenticationError('User not in company');
          }

          const res = await CompanyService.archiveEmployeeType({
            typeId: type.id,
            archived,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCompanyWorkDaySetting: withAuth(
      async (
        root,
        { companyId, day, employeeTypeId, input },
        { loaders, auth: { user } },
      ) => {
        try {
          const type = await getEmployeeType(employeeTypeId);

          const company = await getCompany(companyId);

          if (company.id !== type.company_id) {
            throw new UserInputError('Employee type and company do not match');
          }

          const isValid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isValid) {
            throw new AuthenticationError('User not in company');
          }

          const res = await CompanyService.updateCompanyWorkDaySetting({
            typeId: type.id,
            companyId: company.id,
            day,
            userId: user.id,
            input,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),

    updateCompanyProfile: withAuth(
      async (root, { companyId, key, value }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const isValid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isValid) {
            throw new AuthenticationError('User not in company');
          }

          const res = await CompanyService.updateCompanyProfile({
            companyId: company.id,
            key,
            value,
          });

          return res;
        } catch (error) {
          handleResolverError(error);
          return null;
        }
      },
    ),
    updateCompanyTimezone: withAuth(
      async (root, { companyId, timezone }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const isValid = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isValid) {
            throw new AuthenticationError('User not in company');
          }

          const res = await CompanyService.updateCompanyTimezone({
            companyId: company.id,
            default_timezone: timezone,
          });

          if (res instanceof Error) {
            return null;
          } else {
            return res?.default_timezone;
          }
        } catch (error) {
          handleResolverError(error);
          return null;
        }
      },
    ),
    //@ts-ignore
    bulkUploadMembers: withUserAuth(
      async (root, { companyId, attachment }, { loaders, auth: { user } }) => {
        try {
          const company = await getCompany(companyId);

          const isMember = await CompanyService.validateUserInCompany({
            userId: user.id,
            companyId: company.id,
          });

          if (!isMember) {
            return new UserInputError('User is not a member');
          }

          const result = await CompanyService.bulkUploadMembers({
            attachment: await attachment,
            user,
            companyId: company.id,
          });

          return {
            companyMembers: result?.members,
            duplicateEmails: result?.duplicates,
          };
        } catch (error) {
          handleResolverError(error);
        }
      },
    ),
    updateCompanyMemberActiveStatus: async (
      root,
      { companyMemberId, active },
      { loaders, auth: { user } },
    ) => {
      try {
        const targetCompanyMember = await getCompanyMember(companyMemberId);

        if (targetCompanyMember.companyId !== user.activeCompany) {
          throw new AuthenticationError(
            'Company member to be edited is not in the active company',
          );
        }

        const userCompanyMember =
          await CompanyService.getMemberByUserIdAndCompanyId({
            userId: user.id,
            companyId: targetCompanyMember.companyId,
          });

        if (!userCompanyMember) {
          throw new AuthenticationError('User is not a member');
        }

        // TODO: Refactor to permissions handler
        if ((userCompanyMember as CompanyMemberModel).type !== 1) {
          throw new AuthenticationError('User is not an admin');
        }

        const res = await CompanyService.updateCompanyMemberActiveStatus({
          companyMemberId: targetCompanyMember.id,
          active,
          user,
        });

        return res;
      } catch (error) {
        return handleResolverError(error);
      }
    },
    createCompanyPaymentMethod: async (root, { input }, { auth: { user } }) => {
      try {
        const { companyId, stripePaymentMethodId } = input;

        const company = await getCompany(companyId);

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isMember) {
          throw new AuthenticationError('User is not a company member');
        }

        const member = await CompanyService.getMemberByUserIdAndCompanyId({
          userId: user.id,
          companyId: company.id,
        });

        if (member.type !== 1) {
          throw new AuthenticationError('User is not an admin');
        }

        const res = await CompanyService.createCompanyPaymentMethod({
          companyId: company.id,
          stripePaymentMethodId,
          user,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    deleteCompanyPaymentMethod: async (root, { input }, { auth: { user } }) => {
      try {
        const { companyId, stripePaymentMethodId } = input;

        const company = await getCompany(companyId);

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isMember) {
          throw new AuthenticationError('User is not a company member');
        }

        const member = await CompanyService.getMemberByUserIdAndCompanyId({
          userId: user.id,
          companyId: company.id,
        });

        if (member.type !== 1) {
          throw new AuthenticationError('User is not an admin');
        }

        const res = await CompanyService.deleteCompanyPaymentMethod({
          companyId: company.id,
          stripePaymentMethodId,
          user,
        });

        return {
          success: true,
          affectedNum: res,
        };
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
    setDefaultCompanyPaymentMethod: async (
      root,
      { input },
      { auth: { user } },
    ) => {
      try {
        const { companyId, stripePaymentMethodId } = input;

        const company = await getCompany(companyId);

        const isMember = await CompanyService.validateUserInCompany({
          userId: user.id,
          companyId: company.id,
        });

        if (!isMember) {
          throw new AuthenticationError('User is not a company member');
        }

        const member = await CompanyService.getMemberByUserIdAndCompanyId({
          userId: user.id,
          companyId: company.id,
        });

        if (member.type !== 1) {
          throw new AuthenticationError('User is not an admin');
        }

        const res = await CompanyService.setDefaultCompanyPaymentMethod({
          companyId: company.id,
          stripePaymentMethodId,
        });

        return res;
      } catch (error) {
        throw new ApolloError(error as string);
      }
    },
  },
};
