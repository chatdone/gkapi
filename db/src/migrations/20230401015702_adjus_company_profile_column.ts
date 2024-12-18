import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
        ADD COLUMN invoice_start_string VARCHAR(255);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
        DROP COLUMN invoice_start_string;
	`);
}
