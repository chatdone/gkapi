import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

     CREATE TABLE task_kanban_positions (
        task_id INT(10) UNSIGNED PRIMARY KEY,
        pos_y INT(10) UNSIGNED NOT NULL,
        FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE
        ); 
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE task_kanban_positions;
	`);
}
