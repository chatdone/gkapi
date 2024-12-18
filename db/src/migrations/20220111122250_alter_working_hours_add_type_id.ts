import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_working_hours
		ADD COLUMN employee_type_id INT(10) UNSIGNED AFTER company_id,
		ADD FOREIGN KEY (employee_type_id) REFERENCES employee_types(id) ON DELETE CASCADE;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_working_hours
		DROP FOREIGN KEY company_working_hours_ibfk_2,
		DROP COLUMN employee_type_id;
	`);
}
