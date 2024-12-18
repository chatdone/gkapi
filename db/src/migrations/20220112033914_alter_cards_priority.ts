import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        ADD priority TINYINT(1) DEFAULT 2 AFTER planned_effort
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        DROP priority;
    `);
}
