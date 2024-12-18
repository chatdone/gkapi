import { merge } from 'lodash';
import { schema } from './url.schema';
import { resolvers as urlResolvers } from './url.resolvers';

const resolvers = merge(urlResolvers);

export { schema, resolvers };
