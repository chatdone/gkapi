import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        ADD actual_cost DECIMAL(10,2) AFTER planned_effort,
        ADD projected_cost DECIMAL(10,2) AFTER planned_effort
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        DROP COLUMN actual_cost,
        DROP COLUMN projected_cost
    `);
}
