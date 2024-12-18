import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE card_attachments 
		ADD COLUMN is_external TINYINT(1) NOT NULL DEFAULT 0 AFTER url,
		ADD COLUMN external_source VARCHAR(255) AFTER is_external
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE card_attachments
		DROP COLUMN is_external,
		DROP COLUMN external_source
	`);
}
