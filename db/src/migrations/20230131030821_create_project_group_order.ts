import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE project_group_orders (
            group_id INT(10) UNSIGNED NOT NULL,
            project_id INT(10) UNSIGNED NOT NULL,
            ordering INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (group_id, project_id),
            FOREIGN KEY (group_id) REFERENCES project_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE project_group_orders;
	`);
}
