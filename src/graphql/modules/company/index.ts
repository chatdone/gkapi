import { merge } from 'lodash';
import { schema } from './company.schema';
import { resolvers as CompanyResolvers } from './company.resolvers';

const resolvers = merge(CompanyResolvers);

export { schema, resolvers };
