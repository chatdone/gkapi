import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs
		ADD COLUMN folder_id INT(10) UNSIGNED REFERENCES task_board_folders(id) ON DELETE SET NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs
		DROP COLUMN folder_id
	`);
}
