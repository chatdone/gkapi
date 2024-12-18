import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE packages
        ADD storage DECIMAL(5,2) DEFAULT 0 AFTER description
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE packages
        DROP COLUMN storage
    `);
}
