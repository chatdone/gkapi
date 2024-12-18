import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE contact_notes
        ADD COLUMN date DATETIME AFTER content,
		ADD COLUMN user_id INT(10) UNSIGNED AFTER content,
		ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE contact_notes
        DROP COLUMN date,
		DROP FOREIGN KEY contact_notes_ibfk_2,
		DROP COLUMN user_id;
	`);
}
