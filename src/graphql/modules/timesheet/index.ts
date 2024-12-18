import { merge } from 'lodash';
import { schema } from './timesheet.schema';
import { resolvers as TimesheetResolvers } from './timesheet.resolvers';

const resolvers = merge(TimesheetResolvers);

export { schema, resolvers };
