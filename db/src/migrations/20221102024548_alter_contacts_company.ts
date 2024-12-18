import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE contacts
		ADD COLUMN account_code VARCHAR(100) AFTER deal_creator;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE contacts
		DROP COLUMN account_code;
	`);
}
