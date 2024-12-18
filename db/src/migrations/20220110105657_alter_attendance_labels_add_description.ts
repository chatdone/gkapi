import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendance_labels 
		ADD COLUMN description VARCHAR(255);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendance_labels
		DROP COLUMN description;
	`);
}
