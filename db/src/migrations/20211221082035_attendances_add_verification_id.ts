import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_attendances 
		ADD COLUMN verification_id INT(10) UNSIGNED,
		ADD FOREIGN KEY (verification_id) REFERENCES timesheet_verifications(id) ON DELETE SET NULL
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		
		ALTER TABLE timesheet_attendances
		DROP FOREIGN KEY timesheet_attendances_ibfk_3,
		DROP COLUMN verification_id

	`);
}
