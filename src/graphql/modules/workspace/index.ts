import { merge } from 'lodash';
import { schema } from './workspace.schema';
import { resolvers as WorkspaceResolvers } from './workspace.resolvers';

const resolvers = merge(WorkspaceResolvers);

export { schema, resolvers };
