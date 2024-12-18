import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE companies
		ADD COLUMN account_code VARCHAR(100) AFTER description;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE companies
		DROP COLUMN account_code;
	`);
}
