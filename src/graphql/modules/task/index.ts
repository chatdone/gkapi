import { merge } from 'lodash';
import { schema } from './task.schema';
import { resolvers as TaskResolvers } from './task.resolvers';
import { resolvers as TaskBoardResolvers } from './task-board.resolvers';

const resolvers = merge(TaskResolvers, TaskBoardResolvers);

export { schema, resolvers };
