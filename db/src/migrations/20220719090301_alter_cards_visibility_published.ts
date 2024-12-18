import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		ADD COLUMN published TINYINT(1) DEFAULT 1,
        ADD COLUMN visibility TINYINT(1) DEFAULT 1
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		DROP COLUMN published,
        DROP COLUMN visibility
	`);
}
