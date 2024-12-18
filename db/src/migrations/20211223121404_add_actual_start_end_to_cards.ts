import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        ADD actual_start DATETIME AFTER planned_effort,
        ADD actual_end DATETIME AFTER planned_effort
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
    DROP COLUMN actual_end,
    DROP COLUMN actual_start
    
    `);
}
