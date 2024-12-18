import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions 
		ADD COLUMN interval_type VARCHAR(255) AFTER company_id;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions 
		DROP COLUMN interval_type;
	`);
}
