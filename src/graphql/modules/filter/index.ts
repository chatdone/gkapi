import { merge } from 'lodash';
import { schema } from './filter.schema';
import { resolvers as filterResolvers } from './filter.resolvers';

const resolvers = merge(filterResolvers);

export { schema, resolvers };
