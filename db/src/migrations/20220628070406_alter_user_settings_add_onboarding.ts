import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE user_settings
		ADD COLUMN onboarding JSON
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE user_settings
		DROP COLUMN onboarding
	`);
}
