import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE collection_assignees (
			collection_id INT(10) UNSIGNED NOT NULL,
			member_id INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (collection_id, member_id),
			FOREIGN KEY (collection_id) REFERENCES receivable_reminders(id) ON DELETE CASCADE,
			FOREIGN KEY (member_id) REFERENCES company_members(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE collection_assignees;
	`);
}
