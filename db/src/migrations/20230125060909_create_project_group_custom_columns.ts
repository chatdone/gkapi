import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE project_group_custom_columns (
			group_id INT(10) UNSIGNED NOT NULL,
			attribute_id INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (group_id, attribute_id),
			FOREIGN KEY (group_id) REFERENCES project_groups(id) ON DELETE CASCADE,
			FOREIGN KEY (attribute_id) REFERENCES project_groups_custom_attributes(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE project_group_custom_columns;
	`);
}
