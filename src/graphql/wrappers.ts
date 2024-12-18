import { AuthenticationError } from 'apollo-server-express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

// Basic auth check for logged in
const withAuth = <Func extends AnyFunction>(
  fn: Func,
): ((...args: Parameters<Func>) => ReturnType<Func>) => {
  const wrappedFn = (...args: Parameters<Func>): ReturnType<Func> => {
    const { auth } = args[2];
    if (!auth.isAuthenticated) {
      throw new AuthenticationError('Not logged in');
    }

    return fn(...args);
  };
  return wrappedFn;
};

// Check that there's a linked user
const withUserAuth = <Func extends AnyFunction>(
  fn: Func,
): ((...args: Parameters<Func>) => ReturnType<Func>) => {
  const wrappedFn = (...args: Parameters<Func>): ReturnType<Func> => {
    const { auth } = args[2];
    if (!auth.isAuthenticated) {
      throw new AuthenticationError('Not authenticated');
    }

    if (!auth.user || !auth.user.id) {
      throw new AuthenticationError('User is not logged in');
    }

    return fn(...args);
  };
  return wrappedFn;
};

export { withAuth, withUserAuth };
