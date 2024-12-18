import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs 
		ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0;

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs
		DROP COLUMN pinned
	`);
}
