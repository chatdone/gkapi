import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE task_custom_values (
            group_id INT(10) UNSIGNED NOT NULL,
            attribute_id INT(10) UNSIGNED NOT NULL,
            task_id INT(10) UNSIGNED NOT NULL,
            value VARCHAR(255),
			PRIMARY KEY (group_id, task_id, attribute_id),
            FOREIGN KEY (group_id, attribute_id) REFERENCES project_group_custom_columns(group_id, attribute_id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE	
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE task_custom_values;
	`);
}
