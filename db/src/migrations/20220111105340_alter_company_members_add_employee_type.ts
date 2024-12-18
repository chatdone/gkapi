import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_members
		ADD COLUMN employee_type INT(10) UNSIGNED,
		ADD FOREIGN KEY (employee_type) REFERENCES employee_types(id) ON DELETE SET NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_members
		DROP FOREIGN KEY company_members_ibfk_3,
		DROP COLUMN employee_type;
	`);
}
