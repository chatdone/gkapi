import { Knex } from 'knex';
import { getUuidQuery } from '../utils';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE employee_types (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			company_id INT(10) UNSIGNED NOT NULL,
			name VARCHAR(255),
			PRIMARY KEY (id),
			FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
		); 
		${knex.raw(getUuidQuery('employee_types'))}
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE employee_types;
		
	`);
}
