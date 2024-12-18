import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime

  type Collector {
    id: ID

    company: Company
    collections(filters: FilterOptions): [Collection]
    team: CompanyTeam
    collectorMembers: [CollectorMember]
    contact: Contact
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt: DateTime
    createdBy: User
    updatedBy: User
    deletedBy: User

    assignees: [CompanyMember]

    collector_members: [CollectorMember] # deprecated
    created_at: DateTime # deprecated
    updated_at: DateTime # deprecated
    deleted_at: DateTime # deprecated
    created_by: User # deprecated
    updated_by: User # deprecated
    deleted_by: User # deprecated
  }

  type CollectorMember {
    id: ID
    member: CompanyMember
  }

  input CreateCollectorInput {
    contact_id: ID! # deprecated
    team_id: ID # deprecated
    member_ids: [ID] # deprecated
    contactId: ID # mark as mandatory once V3 is up
    teamId: ID
    memberIds: [ID]
  }

  input DeleteCollectorInput {
    company_id: ID! # deprecated
    collector_ids: [ID]! # deprecated
    companyId: ID # mark as mandatory once V3 is up
    collectorIds: [ID]
  }

  input UpdateCollectorInput {
    id: ID!
    team_id: ID
    member_ids: [ID]

    teamId: ID # deprecated
    memberIds: [ID] # deprecated
  }

  extend type Query {
    # collectors: [Collector]
    # collectorsCount: Int
    collector(collectorId: ID!): Collector
    collectors(companyId: ID!): [Collector]

    # NOTE: These 2 need to deprecated to remove the verb (- Enoch)
    getCollector(collectorId: ID!): Collector
    listCollectors(companyId: ID!): [Collector]
    getCollaboratedCollectors: [Collector]
    collectorActivities(companyId: ID!): [CollectionActivityLog]
  }

  extend type Mutation {
    createCollector(input: CreateCollectorInput!): Collector
    deleteCollectors(input: DeleteCollectorInput!): [Collector]
    updateCollector(input: UpdateCollectorInput!): Collector
  }
`;
