import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		ADD COLUMN group_id INT(10) UNSIGNED AFTER status_id,
        ADD FOREIGN KEY (group_id) REFERENCES project_groups(id) ON DELETE SET NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		DROP FOREIGN KEY cards_ibfk_3,
		DROP COLUMN group_id;

		
	`);
}
