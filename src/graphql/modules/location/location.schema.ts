import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const schema = gql`
  scalar DateTime

  type Location {
    id: ID!
    company: Company
    name: String
    address: String
    radius: Float
    lng: Float
    lat: Float
    archived: Boolean
    createdAt: DateTime
    createdBy: User
    updatedAt: DateTime
    updatedBy: User
    metadata: String

    created_at: DateTime #deprecated
    created_by: User #deprecated
    updated_at: DateTime #deprecated
    updated_by: User #deprecated
  }

  input CreateLocationInput {
    name: String!
    address: String
    radius: Float
    lng: Float
    lat: Float
    metadata: String
  }

  input UpdateLocationInput {
    name: String
    address: String
    radius: Float
    lng: Float
    lat: Float
    archived: Boolean
    metadata: String
  }

  extend type Query {
    location(id: ID!): Location
    locations(companyId: ID!): [Location]
  }

  extend type Mutation {
    createLocation(companyId: ID!, input: CreateLocationInput!): Location
    updateLocation(locationId: ID!, input: UpdateLocationInput!): Location
    deleteLocations(locationIds: [ID]!): [Location]
    updateLocationArchivedStatus(
      locationIds: [ID]!
      archived: Boolean!
    ): [Location]
  }
`;
