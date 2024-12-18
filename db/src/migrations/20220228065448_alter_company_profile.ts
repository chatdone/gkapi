import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
        ADD COLUMN default_timezone VARCHAR(255);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
        DROP COLUMN default_timezone;
	`);
}
