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

const getInsertedIds = (startId: number, count: number): number[] => {
  const insertedIds = Array.from({ length: count }, (k, i) => i + startId);

  return insertedIds;
};

export { getUuidQuery, getBinaryMatchFromPublicIds, getInsertedIds };
