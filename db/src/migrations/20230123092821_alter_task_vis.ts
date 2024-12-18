import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE task_visibility (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			task_id INT(10) UNSIGNED NOT NULL,
			team_id INT(10) UNSIGNED,
			member_id INT(10) UNSIGNED,
			PRIMARY KEY (id),
			FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE,
			FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
			FOREIGN KEY (member_id) REFERENCES company_members (id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE task_visibility;
	`);
}
