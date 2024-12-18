import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE project_group_custom_columns
		ADD COLUMN enabled TINYINT(1) NOT NULL DEFAULT 1;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE project_group_custom_columns
		DROP COLUMN enabled;
	`);
}
