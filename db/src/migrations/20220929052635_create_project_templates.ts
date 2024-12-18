import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

     CREATE TABLE project_templates (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_id INT(10) UNSIGNED NOT NULL,
        columns JSON NOT NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        ); 

        ${knex.raw(getUuidQuery('project_templates'))};		
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE project_templates;
	`);
}
