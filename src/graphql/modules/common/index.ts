import { merge } from 'lodash';
import { schema } from './common.schema';
import { resolvers as commonResolvers } from './common.resolvers';

const resolvers = merge(commonResolvers);

export { schema, resolvers };
