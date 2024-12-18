import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
		ADD COLUMN invoice_prefix VARCHAR(5);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
		DROP COLUMN invoice_prefix;
	`);
}
