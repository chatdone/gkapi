import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_packages
		ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT FALSE AFTER is_default;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_packages
		DROP COLUMN is_custom;
	`);
}
