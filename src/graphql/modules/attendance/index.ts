import { merge } from 'lodash';
import { schema } from './attendance.schema';
import { resolvers as AttendanceResolvers } from './attendance.resolvers';

const resolvers = merge(AttendanceResolvers);

export { schema, resolvers };
