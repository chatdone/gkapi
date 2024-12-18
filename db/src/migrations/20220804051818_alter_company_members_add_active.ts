import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_members
		ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1 AFTER user_id;

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_members
		DROP COLUMN active;
	`);
}
