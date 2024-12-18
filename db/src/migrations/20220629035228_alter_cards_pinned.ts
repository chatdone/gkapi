import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards 
		ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0;

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		DROP COLUMN pinned
	`);
}
