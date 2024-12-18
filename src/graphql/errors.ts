import { ApolloError } from 'apollo-server-express';

export const handleResolverError = (error: unknown): void => {
  if (error instanceof Error) {
    throw new ApolloError(error.message);
  } else {
    console.error(error);
    throw new ApolloError(error as string);
  }
};
