import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE employee_types
		ADD COLUMN has_overtime TINYINT(1) NOT NULL DEFAULT 0;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE employee_types 
		DROP COLUMN has_overtime;
	`);
}
