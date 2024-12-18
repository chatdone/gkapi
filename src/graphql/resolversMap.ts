import { IResolvers } from '@graphql-tools/utils';
import { merge } from 'lodash';

import { resolvers as attendanceResolvers } from './modules/attendance';
import { resolvers as companyResolvers } from './modules/company';
import { resolvers as contactResolvers } from './modules/contact';
import { resolvers as userResolvers } from './modules/user';
import { resolvers as notificationResolvers } from './modules/notification';
import { resolvers as scalarResolvers } from 'graphql-scalars';
import { resolvers as taskResolvers } from './modules/task';
import { resolvers as collectorResolvers } from './modules/collector';
import { resolvers as subscriptionResolvers } from './modules/subscription';
import { resolvers as urlResolvers } from './modules/url';
import { resolvers as locationResolvers } from './modules/location';
import { resolvers as holidayResolvers } from './modules/holiday';
import { resolvers as templateResolvers } from './modules/template';
import { resolvers as tagResolvers } from './modules/tag';
import { resolvers as collectionResolvers } from './modules/collection';
import { resolvers as filterResolvers } from './modules/filter';
import { resolvers as commonResolvers } from './modules/common';
import { resolvers as workspaceResolvers } from './modules/workspace';
import { resolvers as billingResolvers } from './modules/billing';
import { resolvers as timesheetResolvers } from './modules/timesheet';

const resolverMap: IResolvers = merge(
  attendanceResolvers,
  companyResolvers,
  contactResolvers,
  userResolvers,
  notificationResolvers,
  scalarResolvers,
  taskResolvers,
  collectorResolvers,
  subscriptionResolvers,
  templateResolvers,
  urlResolvers,
  collectionResolvers,
  locationResolvers,
  holidayResolvers,
  commonResolvers,
  filterResolvers,
  timesheetResolvers,
  tagResolvers,
  workspaceResolvers,
  billingResolvers,
);
export default resolverMap;
