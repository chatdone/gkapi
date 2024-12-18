import { merge } from 'lodash';
import { schema } from './location.schema';
import { resolvers as locationResolvers } from './location.resolvers';

const resolvers = merge(locationResolvers);

export { schema, resolvers };
