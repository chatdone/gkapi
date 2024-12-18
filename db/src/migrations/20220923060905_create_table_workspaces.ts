import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE workspaces (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			company_id INT(10) UNSIGNED NOT NULL,
			name VARCHAR(255) NOT NULL,
			bg_color VARCHAR(255),
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			created_by INT(10) UNSIGNED NOT NULL,
			updated_by INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (id),
			FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
		); 

		CREATE TABLE workspace_projects (
			workspace_id INT(10) UNSIGNED NOT NULL,
			project_id INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY(workspace_id, project_id),
			FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
			FOREIGN KEY (project_id) REFERENCES jobs(id) ON DELETE CASCADE
		);

		${knex.raw(getUuidQuery('workspaces'))};

		
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE workspace_projects;
		DROP TABLE workspaces;
	`);
}
