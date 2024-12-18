import { merge } from 'lodash';
import { schema } from './notification.schema';
import { resolvers as notificationResolvers } from './notification.resolvers';

const resolvers = merge(notificationResolvers);

export { schema, resolvers };
