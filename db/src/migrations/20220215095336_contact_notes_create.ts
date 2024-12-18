import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE contact_notes (
            id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			contact_id INT(10) UNSIGNED NOT NULL,
			content LONGTEXT,
            PRIMARY KEY (id),
			FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
            
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE contact_notes;
	`);
}
