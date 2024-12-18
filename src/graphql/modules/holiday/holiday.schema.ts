import { gql } from 'apollo-server-express';

import _ from 'lodash';

export const schema = gql`
  scalar DateTime

  type Holiday {
    id: ID!
    company: Company
    name: String
    type: String
    startDate: DateTime
    endDate: DateTime
    createdBy: User
    updatedBy: User
    createdAt: DateTime
    updatedAt: DateTime
    date: DateTime
    year: Int
    countryCode: String
    active: Boolean

    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    created_by: User #deprecated
    updated_by: User #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
    country_code: String #deprecated
  }

  type CompanyHoliday {
    id: ID!
    name: String
    startDate: DateTime
    endDate: DateTime
    type: String
    company: Company
    active: Boolean
    createdAt: DateTime
    createdBy: User
    updatedAt: DateTime
    updatedBy: User
    publicHolidayId: PublicHoliday

    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    created_at: DateTime #deprecated
    created_by: User #deprecated
    updated_at: DateTime #deprecated
    updated_by: User #deprecated
    public_holiday_id: PublicHoliday #deprecated
  }

  type PublicHoliday {
    id: ID!
    name: String
    date: DateTime
    year: Int
    countryCode: String
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime
    updatedAt: DateTime

    country_code: String #deprecated
    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
    created_at: DateTime #deprecated
    updated_at: DateTime #deprecated
  }

  enum CompanyHolidayStatus {
    ACTIVE
    INACTIVE
  }

  input CreateCompanyHolidayInput {
    name: String!
    startDate: DateTime # mark as mandatory once V3 is up
    endDate: DateTime # mark as mandatory once V3 is up
    start_date: DateTime! #deprecated
    end_date: DateTime! #deprecated
  }

  input UpdateCompanyHolidayInput {
    name: String
    active: CompanyHolidayStatus
    startDate: DateTime
    endDate: DateTime

    start_date: DateTime #deprecated
    end_date: DateTime #deprecated
  }

  extend type Query {
    holidays(companyId: ID!, year: Int!): [Holiday]
  }

  extend type Mutation {
    createHoliday(companyId: ID!, input: CreateCompanyHolidayInput!): [Holiday]
    deactivatePublicHoliday(
      companyId: ID!
      publicHolidayId: ID!
    ): CompanyHoliday
    updateCompanyHoliday(
      companyId: ID!
      companyHolidayId: ID!
      input: UpdateCompanyHolidayInput!
    ): CompanyHoliday
    deleteCompanyHoliday(companyId: ID!, companyHolidayId: ID!): CompanyHoliday
    activatePublicHoliday(companyId: ID!, holidayId: ID!): CompanyHoliday
  }
`;
