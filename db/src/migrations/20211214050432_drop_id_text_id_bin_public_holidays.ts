import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

const tableName = 'public_holidays';
exports.up = function (knex: Knex): Promise<void> {
  return knex.raw(`
  ALTER TABLE ${tableName}
    DROP COLUMN id_text,
    DROP COLUMN id_bin;
  `);
};

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
          ALTER TABLE ${tableName} 
          ADD id_bin BINARY(16) UNIQUE,
          ADD id_text varchar(36) generated always as (LOWER(insert(
                    insert(
                        insert(
                            insert(hex(id_bin),9,0,'-'),
                            14,0,'-'),
                        19,0,'-'),
                    24,0,'-')
            )) virtual
      `);
}
