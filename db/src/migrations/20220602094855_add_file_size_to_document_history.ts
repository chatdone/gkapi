import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE document_history
        ADD COLUMN file_size INT(10) UNSIGNED AFTER document_data
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE document_history
        DROP file_size
  `);
}
