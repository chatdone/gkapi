import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE projects
		ADD COLUMN archived_at DATETIME AFTER deleted_by,
        ADD COLUMN archived_by INT(10) UNSIGNED AFTER archived_at

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE projects
		DROP COLUMN archived_at,
        DROP COLUMN archived_by
	`);
}
