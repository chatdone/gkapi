import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE workspaces 
		ADD COLUMN visibility TINYINT(1) NOT NULL DEFAULT 1;

		CREATE TABLE workspace_visibility (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			workspace_id INT(10) UNSIGNED NOT NULL,
			team_id INT(10) UNSIGNED,
			member_id INT(10) UNSIGNED,
			PRIMARY KEY (id),
			FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
			FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
			FOREIGN KEY (member_id) REFERENCES company_members (id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE workspaces
        DROP COLUMN visibility;

		DROP TABLE workspace_visibility;
	`);
}
