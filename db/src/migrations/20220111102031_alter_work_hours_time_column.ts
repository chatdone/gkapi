import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_working_hours 
		DROP COLUMN start_hour,
		DROP COLUMN end_hour,
		ADD COLUMN start_hour TIME AFTER open,
		ADD COLUMN end_hour TIME AFTER start_hour;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_working_hours
		DROP COLUMN start_hour,
		DROP COLUMN end_hour,
		ADD COLUMN start_hour DATETIME AFTER open,
		ADD COLUMN end_hour DATETIME AFTER start_hour;
	`);
}
