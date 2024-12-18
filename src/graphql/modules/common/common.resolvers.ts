import { Resolvers } from '@generated/graphql-types';
import { SortDirection } from '@constants';

export const resolvers: Resolvers = {
  Query: {},
  SortDirection: {
    ASC: SortDirection.ASC,
    DESC: SortDirection.DESC,
  },
  CommonVisibility: {
    HIDDEN: 0,
    PUBLIC: 1,
    ASSIGNED: 2,
    SPECIFIC: 3,
    PRIVATE: 4,
  },
};
