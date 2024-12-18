import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs 
		ADD COLUMN visibility TINYINT(1) NOT NULL DEFAULT 1;

		CREATE TABLE task_board_visibility (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			board_id INT(10) UNSIGNED NOT NULL,
			team_id INT(10) UNSIGNED,
			member_id INT(10) UNSIGNED,
			PRIMARY KEY (id),
			FOREIGN KEY (board_id) REFERENCES jobs(id) ON DELETE CASCADE,
			FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
			FOREIGN KEY (member_id) REFERENCES company_members (id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs

		DROP TABLE task_board_visibility;
	`);
}
