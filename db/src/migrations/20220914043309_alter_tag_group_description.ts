import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE tag_groups
		ADD COLUMN description TEXT AFTER name

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE tag_groups
		DROP COLUMN description
	`);
}
