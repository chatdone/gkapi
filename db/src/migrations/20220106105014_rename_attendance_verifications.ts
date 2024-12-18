import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_verifications
		RENAME TO attendance_verifications
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendance_verifications 
		RENAME TO timesheet_verifications
	`);
}
