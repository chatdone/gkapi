import { merge } from 'lodash';
import { schema } from './user.schema';
import { resolvers as UserResolvers } from './user.resolvers';

const resolvers = merge(UserResolvers);

export { schema, resolvers };
