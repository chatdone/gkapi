import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_packages
		ADD COLUMN sequence INTEGER NOT NULL DEFAULT 0 AFTER name;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_packages
		DROP COLUMN sequence;
	`);
}
