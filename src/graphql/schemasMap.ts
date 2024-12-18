import { gql } from 'apollo-server-express';
import 'graphql-import-node';
import { schema as attendanceSchema } from './modules/attendance';
import { schema as companySchema } from './modules/company';
import { schema as contactSchema } from './modules/contact';
import { schema as userSchema } from './modules/user';
import { schema as taskSchema } from './modules/task';
import { schema as notificationSchema } from './modules/notification';
import { schema as collectorSchema } from './modules/collector';
import { schema as subscriptionSchema } from './modules/subscription';
import { schema as urlSchema } from './modules/url';
import { schema as locationSchema } from './modules/location';
import { schema as holidaySchema } from './modules/holiday';
import { schema as tagSchema } from './modules/tag';
import { schema as templateSchema } from './modules/template';
import { schema as collectionSchema } from './modules/collection';
import { schema as commonSchema } from './modules/common';
import { schema as filterSchema } from './modules/filter';
import { schema as timesheetSchema } from './modules/timesheet';
import { schema as workspaceSchema } from './modules/workspace';
import { schema as billingSchema } from './modules/billing';
import { typeDefs as scalarTypes } from 'graphql-scalars';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './resolversMap';
import { GraphQLSchema } from 'graphql';

const types = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [
    types,
    ...scalarTypes,
    attendanceSchema,
    collectionSchema,
    collectorSchema,
    commonSchema,
    companySchema,
    contactSchema,
    filterSchema,
    holidaySchema,
    locationSchema,
    notificationSchema,
    subscriptionSchema,
    tagSchema,
    taskSchema,
    templateSchema,
    timesheetSchema,
    urlSchema,
    userSchema,
    workspaceSchema,
    billingSchema,
  ],
  resolvers,
});

export default schema;
