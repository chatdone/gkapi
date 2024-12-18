import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_day_approvals
		ADD COLUMN billable TINYINT(1) NOT NULL DEFAULT 0 AFTER status;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_day_approvals
		DROP COLUMN billable;
	`);
}
