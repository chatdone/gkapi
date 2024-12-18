// @ts-nocheck
import humps from 'humps';
import _ from 'lodash';

export const camelize = <T>(obj: T): T => {
  if (typeof obj === 'number') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const mapped = obj.map((e) => ({
      ...e,
      ...humps.camelizeKeys(e),
    }));

    return mapped.filter((e) => !_.isEmpty(e));
  }

  const camelized = humps.camelizeKeys(obj) as T;

  if (_.isEmpty(camelized)) {
    return undefined;
  }

  // FIXME: Stop returning the old snake case when fully deprecated
  return {
    ...camelized,
    ...obj,
  };
};

// TODO: This will eventually replace camelize above when we have (finally) removed
// all the snake case from the codebase
export const camelizeOnly = <T>(obj: T): T => {
  return humps.camelizeKeys(obj) as T;
};

export const verifyMatchingIds = <T extends Identifiable>(
  items: T[],
  ids: (string | number)[],
) => {
  if (items.length !== ids.length) {
    const missingIds = ids.filter((id) => {
      return !items.find((r) => r.id === id || r.id_text === id);
    });

    throw new Error(`Could not find ids: ${missingIds.join(', ')}`);
  }
};
