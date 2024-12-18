import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances 
		ADD COLUMN is_last_out TINYINT(1) NOT NULL DEFAULT 0;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances
		DROP COLUMN is_last_out;
	`);
}
