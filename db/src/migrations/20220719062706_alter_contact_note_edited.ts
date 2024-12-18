import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE contact_notes
		ADD COLUMN edited TINYINT(1) DEFAULT 0 AFTER note_content
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE contact_notes
		DROP COLUMN edited
	`);
}
