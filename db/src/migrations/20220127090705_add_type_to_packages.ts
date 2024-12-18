import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE packages
        ADD type TINYINT(2) DEFAULT 0 AFTER title
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE packages
        DROP COLUMN type
    `);
}
