import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

     CREATE TABLE project_settings (
        project_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        columns JSON NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        ); 

        
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE project_settings;
	`);
}
