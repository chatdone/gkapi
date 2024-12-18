import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		ADD COLUMN status_id INT(10) UNSIGNED AFTER job_id,
        ADD FOREIGN KEY (status_id) REFERENCES project_statuses(id) ON DELETE SET NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		DROP FOREIGN KEY cards_ibfk_2,
		DROP COLUMN status_id;
	`);
}
