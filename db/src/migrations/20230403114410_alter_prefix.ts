import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_profiles
    MODIFY invoice_prefix VARCHAR(255);
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_profiles
    MODIFY invoice_prefix VARCHAR(5);
  `);
}
