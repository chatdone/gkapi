import _ from 'lodash';

export const formatResponse = (
  payload: { [key: string]: unknown },
  additionalOmits: string[] = [],
): { [key: string]: unknown } => {
  return {
    ..._.omit(payload, ['id', 'id_bin', 'id_text', ...additionalOmits]),
    id: payload.id_text,
  };
};
