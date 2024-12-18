import { Knex } from 'knex';
import { getUuidQuery } from '../utils';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`

     CREATE TABLE project_groups_custom_attributes (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type TINYINT(1) DEFAULT 1
        ); 


        ${knex.raw(getUuidQuery('project_groups_custom_attributes'))};		
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE project_groups_custom_attributes;
	`);
}
