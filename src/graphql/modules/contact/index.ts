import { merge } from 'lodash';
import { schema } from './contact.schema';
import { resolvers as ContactResolvers } from './contact.resolvers';

const resolvers = merge(ContactResolvers);

export { schema, resolvers };
