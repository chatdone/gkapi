import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_verifications
		ADD COLUMN s3_bucket VARCHAR(255),
		ADD COLUMN s3_key VARCHAR(255)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheet_verifications
		DROP COLUMN s3_bucket,
		DROP COLUMN s3_key
	`);
}
