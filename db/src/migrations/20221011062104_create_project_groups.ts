import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

     CREATE TABLE project_groups (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        project_id INT(10) UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        ); 

        ${knex.raw(getUuidQuery('project_groups'))};		
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE project_groups;
	`);
}