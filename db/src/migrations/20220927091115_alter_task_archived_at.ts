import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		ADD COLUMN archived_at DATETIME AFTER template_id,
        ADD COLUMN archived_by INT(10) UNSIGNED AFTER archived_at

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		DROP COLUMN archived_at,
        DROP COLUMN archived_by
	`);
}
