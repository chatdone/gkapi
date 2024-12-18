import { UserInputError } from 'apollo-server-express';
import _ from 'lodash';
import { Resolvers } from '@generated/graphql-types';
import { CollectorStore } from '@data-access';
import { CollectionService, CollectorService, CompanyService } from '@services';
import { CollectorModel } from '@models/collector.model';
import {
  CompanyMemberModel,
  CompanyModel,
  CompanyTeamModel,
} from '@models/company.model';
import { ContactModel } from '@models/contact.model';
import { withAuth } from '@graphql/wrappers';
import { FilterOptionsModel } from '@models/filter.model';
import {
  getCollector,
  getCollectors,
  getCompany,
  getCompanyMembers,
  getCompanyTeam,
  getContact,
} from '@data-access/getters';
import { handleResolverError } from '@graphql/errors';

export const resolvers: Resolvers = {
  Query: {
    collector: withAuth(
      async (root, { collectorId }, { loaders, auth: { user } }) => {
        try {
          const res = (await getCollector(collectorId)) as CollectorModel;
          return res;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    ),
    collectors: withAuth(
      async (root, { companyId }, { loaders, auth: { user } }) => {
        const company = await getCompany(companyId);
        const res = await CollectorService.listCollectorsByUserIdAndCompanyId({
          companyId: company.id,
        });
        return res;
      },
    ),
    // TODO: Needs to be deprecated
    listCollectors: withAuth(
      async (root, { companyId }, { loaders, auth: { user } }) => {
        const company = await getCompany(companyId);
        const res = await CollectorService.listCollectorsByUserIdAndCompanyId({
          companyId: company.id,
        });
        return res;
      },
    ),
    // TODO: Needs to be deprecated
    getCollector: withAuth(
      async (root, { collectorId }, { loaders, auth: { user } }) => {
        try {
          const res = (await getCollector(collectorId)) as CollectorModel;
          return res;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    ),
    getCollaboratedCollectors: withAuth(
      async (root, args, { loaders, auth: { user } }) => {
        try {
          const res = await CollectorService.getCollaboratedCollectors({
            userId: user.id,
            loaders,
          });
          return res;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    ),
    collectorActivities: withAuth(async (root, { companyId }, { loaders }) => {
      const company = await getCompany(companyId);

      const res = await CollectorService.getCollectorsActivitiesByCompanyId(
        company?.id,
      );

      return res;
    }),
  },
  Mutation: {
    createCollector: withAuth(
      async (_, { input }, { loaders, auth: { user } }) => {
        const { contact_id, member_ids, team_id } = input;

        const contact = (await getContact(contact_id)) as ContactModel;

        //cannot use getters here, using private contact id to get collector
        const collector = (await loaders.collectors.load(
          contact.id,
        )) as CollectorModel;
        if (collector) {
          throw new Error(
            'Collection for this contact already exist! Please select another contact',
          );
        }

        let team, companyMembers;

        if (team_id) {
          team = (await getCompanyTeam(team_id)) as CompanyTeamModel;
        }
        if (member_ids) {
          companyMembers = (await getCompanyMembers(
            member_ids,
          )) as CompanyMemberModel[];
        }

        const payload = {
          ...(team && { team_id: team.id }),
          ...(companyMembers && {
            member_ids: companyMembers.map((cm: CompanyMemberModel) => {
              return cm.id;
            }),
          }),
          user_id: user.id,
          contact_id: contact.id,
          company_id: contact.company_id,
        };

        await CollectorService.validateIfCollectionExists(contact.id);
        const res = await CollectorService.createCollector({
          payload,
        });

        return res;
      },
    ),
    deleteCollectors: withAuth(
      async (_, { input }, { loaders, auth: { user } }) => {
        try {
          const { company_id, collector_ids } = input;

          const company = (await getCompany(company_id)) as CompanyModel;

          const collectors = (await getCollectors(
            collector_ids,
          )) as CollectorModel[];

          const collectorIds = collectors.map((collector) => collector.id);

          if (collectorIds.length !== collector_ids.length) {
            throw new UserInputError('One of the collector id does not exist');
          }

          await CollectorService.deleteCollectors({ collectorIds });

          const res = await CollectorService.listCollectorsByUserIdAndCompanyId(
            {
              companyId: company.id,
            },
          );
          return res;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    ),
    updateCollector: async (root, { input }, { loaders, auth: { user } }) => {
      try {
        const { team_id, member_ids, id } = input;
        let res;

        const collector = await getCollector(id);

        if (!_.isEmpty(member_ids)) {
          const members = await getCompanyMembers(member_ids as string[]);

          res = await CollectorService.updateCollectorAssignToMembers({
            memberIds: members.map((member) => member.id),
            collector,
            loaders,
            user,
          });
        } else if (team_id) {
          const team = await getCompanyTeam(team_id);

          res = await CollectorService.updateCollectorAssignToTeam({
            team,
            collector,
            user,
            loaders,
          });
        }

        return res;
      } catch (error: any) {
        throw new Error(error);
      }
    },
  },
  Collector: {
    id: ({ id_text }) => id_text,
    company: async ({ company_id }, {}, { loaders }) => {
      return company_id ? await loaders.companies.load(company_id) : null;
    },
    team: async ({ team_id }, {}, { loaders }) => {
      return team_id ? await loaders.companyTeams.load(team_id) : null;
    },
    //deprecated
    collector_members: async ({ id }) => {
      const res = CollectorService.getCollectorMembersByCollectorId({
        collectorId: id,
      });

      return res;
    },
    collectorMembers: async ({ id }) => {
      const res = CollectorService.getCollectorMembersByCollectorId({
        collectorId: id,
      });

      return res;
    },
    contact: async ({ id }, {}, { loaders }) => {
      return id ? await loaders.contacts.load(id) : null;
    },
    //@ts-ignore
    collections: async (
      { id, company_id },
      { filters },
      { auth: { user } },
    ) => {
      try {
        const pic = await CollectorStore.getAssigneesByCollectorId({
          collectorId: id,
          userId: user?.id,
        });

        const member = await CompanyService.getMemberByUserIdAndCompanyId({
          userId: user?.id,
          companyId: company_id,
        });

        if (pic instanceof Error) {
          return null;
          // return handleResolverError(pic);
        } else if (pic && !member) {
          return id
            ? await CollectionService.listCollectionsByContactId({
                contactId: id,
                contactPicId: pic?.id,
                filters: filters as FilterOptionsModel,
              })
            : null;
        } else {
          if (member instanceof Error) {
            return null;
          }

          return member?.id
            ? await CollectionService.listCollectionsByContactId({
                contactId: id,
                filters: filters as FilterOptionsModel,
              })
            : null;
        }
      } catch (error) {
        return handleResolverError(error);
      }
    },

    assignees: async ({ id }, {}, { auth: { user } }) => {
      const res = await CollectorService.getCollectionAssigneesByCollectorId({
        collectorId: id,
        user,
      });

      return res;
    },

    created_by: async ({ created_by }, {}, { loaders }) => {
      return created_by ? await loaders.users.load(created_by) : null;
    },
    updated_by: async ({ updated_by }, {}, { loaders }) => {
      return updated_by ? await loaders.users.load(updated_by) : null;
    },
    deleted_by: async ({ deleted_by }, {}, { loaders }) => {
      return deleted_by ? await loaders.users.load(deleted_by) : null;
    },
  },
  CollectorMember: {
    id: ({ id_text }) => id_text,
    member: async ({ member_id }, {}, { loaders }) => {
      return member_id ? await loaders.companyMembers.load(member_id) : null;
    },
  },
};
