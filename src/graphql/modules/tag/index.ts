import { merge } from 'lodash';
import { schema } from './tag.schema';
import { resolvers as tagResolvers } from './tag.resolvers';

const resolvers = merge(tagResolvers);

export { schema, resolvers };
