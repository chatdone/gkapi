import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_day_approvals
		ADD COLUMN deleted TINYINT(1) NOT NULL DEFAULT 0 AFTER approved_at;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_day_approvals
		DROP COLUMN deleted;
	`);
}
