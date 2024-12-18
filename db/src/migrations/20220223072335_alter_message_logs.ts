import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

const tableName = 'collection_message_logs';
exports.up = function (knex: Knex): Promise<void> {
  return knex.raw(getUuidQuery(tableName));
};

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
          ALTER TABLE ${tableName} DROP COLUMN id_text;
          ALTER TABLE ${tableName} DROP COLUMN id_bin;
          DROP TRIGGER IF EXISTS ${tableName}_uuid_before_insert;
      `);
}
