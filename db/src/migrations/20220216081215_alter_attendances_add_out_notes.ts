import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances
		ADD COLUMN comments_out VARCHAR(255) AFTER comments;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances
		DROP COLUMN comments_out;
	`);
}
