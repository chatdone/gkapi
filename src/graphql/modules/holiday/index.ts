import { merge } from 'lodash';
import { schema } from './holiday.schema';
import { resolvers as holidayResolvers } from './holiday.resolvers';

const resolvers = merge(holidayResolvers);

export { schema, resolvers };
