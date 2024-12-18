import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions
		ADD COLUMN created_by INT(10) UNSIGNED REFERENCES users(id) ON DELETE CASCADE AFTER updated_at,
		ADD COLUMN updated_by INT(10) UNSIGNED REFERENCES users(id) ON DELETE CASCADE AFTER created_by;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions
		DROP COLUMN created_by,
		DROP COLUMN updated_by;
	`);
}
