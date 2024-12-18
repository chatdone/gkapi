import { merge } from 'lodash';
import { schema } from './collection.schema';
import { resolvers as TaskResolvers } from './collection.resolvers';

const resolvers = merge(TaskResolvers);

export { schema, resolvers };
