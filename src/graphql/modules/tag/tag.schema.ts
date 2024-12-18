import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const schema = gql`
  scalar DateTime
  scalar Latitude
  scalar Longitude

  type Tag {
    id: ID
    name: String
    color: String
    company: Company
    group: TagGroup
    createdBy: User
    createdAt: DateTime
    updatedAt: DateTime
  }

  type TagGroup {
    id: ID
    name: String
    description: String
    company: Company
    createdBy: User
    createdAt: DateTime
    updatedAt: DateTime

    tags: [Tag]
  }

  type ContactTag {
    contact: Contact
    tag: Tag
  }

  type TaskTag {
    task: Task
    tag: Tag
  }

  type CollectionTag {
    collection: Collection
    tag: Tag
  }

  input CreateTagInput {
    companyId: ID!
    groupId: ID
    name: String!
    color: String!
  }

  input CreateTagGroupInput {
    companyId: ID!
    name: String!
    description: String
  }

  input UpdateTagInput {
    id: ID!
    name: String
    color: String
    groupId: ID
  }

  input UpdateTagGroupInput {
    id: ID!
    #make name as mandatory for now
    name: String!
    description: String
  }

  input ContactTagOptions {
    contactId: ID!
    tagIds: [ID!]!
  }

  input TaskTagOptions {
    taskId: ID!
    tagIds: [ID!]!
  }

  input CollectionTagOptions {
    collectionId: ID!
    tagIds: [ID!]!
  }

  extend type Query {
    tag(id: ID!): Tag
    tags(companyId: ID!): [Tag]
    #tags(filterOptions: TagFilterOptions): [Tag]
    tagGroup(id: ID!): TagGroup
    tagGroups(companyId: ID!): [TagGroup]
    #tagGroups(id: ID!): [TagGroup]
  }

  extend type Mutation {
    createTag(input: CreateTagInput!): Tag
    createTagGroup(input: CreateTagGroupInput!): TagGroup
    updateTag(input: UpdateTagInput!): Tag
    updateTagGroup(input: UpdateTagGroupInput!): TagGroup
    deleteTag(id: ID!): Tag
    deleteTagGroup(id: ID!): TagGroup

    assignContactTags(input: ContactTagOptions!): [ContactTag]
    deleteContactTags(input: ContactTagOptions!): [ContactTag]

    assignTaskTags(input: TaskTagOptions!): [TaskTag]
    deleteTaskTags(input: TaskTagOptions!): [TaskTag]

    assignCollectionTags(input: CollectionTagOptions!): [CollectionTag]
    deleteCollectionTags(input: CollectionTagOptions!): [CollectionTag]
  }
`;
