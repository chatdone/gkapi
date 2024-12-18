import knex from '../db/knex';
import _ from 'lodash';

const getUuidQuery = (tableName: string): string => {
  return `
		ALTER TABLE ${tableName}
		ADD COLUMN id_bin BINARY(16) UNIQUE,
		ADD COLUMN id_text varchar(36) generated always as (LOWER(insert(
				insert(
					insert(
						insert(hex(id_bin),9,0,'-'),
						14,0,'-'),
					19,0,'-'),
				24,0,'-')
		)) virtual
		;

		CREATE 
			TRIGGER ${tableName}_uuid_before_insert
		BEFORE INSERT ON ${tableName} FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END;
		;

	`;
};

const getBinaryMatchFromPublicIds = (publicIds: readonly string[]): string => {
  const binIds = publicIds
    .map((e) => {
      const id = e.replace(/-/g, '').toLowerCase();
      return `0x${id}`;
    })
    .join(',');
  return `id_bin in (${binIds})`;
};

const batchGet = async <T>(
  tableName: string,
  ids: readonly (number | string)[],
): Promise<ArrayLike<T>> => {
  const query = knex.from(tableName);
  if (_.isEmpty(ids)) {
    return [];
  } else if (typeof _.head(ids) === 'string') {
    query.whereRaw(getBinaryMatchFromPublicIds(ids as string[]));
  } else {
    query.whereIn('id', ids);
  }

  try {
    const res = await query.select();

    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getInsertedIds = (startId: number, count: number): number[] => {
  const insertedIds = Array.from({ length: count }, (k, i) => i + startId);

  return insertedIds;
};

export { batchGet, getUuidQuery, getBinaryMatchFromPublicIds, getInsertedIds };
