import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_members
        ADD hourly_rate DECIMAL(10,2) AFTER position
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_members
        DROP COLUMN hourly_rate
    `);
}
