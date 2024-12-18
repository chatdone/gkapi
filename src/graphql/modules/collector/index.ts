import { merge } from 'lodash';
import { schema } from './collector.schema';
import { resolvers as CollectorResolvers } from './collector.resolvers';

const resolvers = merge(CollectorResolvers);

export { schema, resolvers };
