import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE card_statuses
        ADD COLUMN stage TINYINT(1) UNSIGNED DEFAULT 0 AFTER parent_status 
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE card_statuses
        DROP stage
  `);
}
