import { gql } from 'apollo-server-express';

export const schema = gql`
  type ShortUrl {
    url: String
    short_id: String
    active: Boolean
    created_at: DateTime
    full_url: String
  }

  type BreadcrumbInfo {
    name: String
  }

  enum BreadcrumbType {
    TASK_BOARD
    PROJECT_BOARD
    CRM
    COLLECTION
    CLIENT
    PAYMENTS
    TIMESHEET
    COMPANY_SLUG
  }

  extend type Query {
    shortUrl(shortId: String!): ShortUrl

    breadcrumbInfo(id: ID!, type: BreadcrumbType!): BreadcrumbInfo
  }

  extend type Mutation {
    createShortUrl(url: String!): ShortUrl
  }
`;
