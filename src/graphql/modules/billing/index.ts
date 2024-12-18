import { merge } from 'lodash';
import { schema } from './billing.schema';
import { resolvers as BillingResolvers } from './billing.resolvers';

const resolvers = merge(BillingResolvers);

export { schema, resolvers };
