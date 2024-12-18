import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE project_groups
        ADD COLUMN archived TINYINT(1) DEFAULT 0 AFTER name,
		ADD COLUMN archived_at DATETIME AFTER archived,
        ADD COLUMN archived_by INT(10) UNSIGNED AFTER archived_at;

        

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE project_groups
		DROP COLUMN archived_at,
        DROP COLUMN archived_by,
        DROP COLUMN archived
	`);
}
