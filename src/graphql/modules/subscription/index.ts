import { merge } from 'lodash';
import { schema } from './subscription.schema';
import { resolvers as subscriptionResolvers } from './subscription.resolvers';

const resolvers = merge(subscriptionResolvers);

export { schema, resolvers };
