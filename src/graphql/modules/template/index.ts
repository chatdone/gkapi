import { merge } from 'lodash';
import { schema } from './template.schema';
import { resolvers as TemplateResolvers } from './template.resolvers';

const resolvers = merge(TemplateResolvers);

export { schema, resolvers };
