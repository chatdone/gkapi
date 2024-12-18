import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE collection_message_logs (
      id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			collection_id INT(10) UNSIGNED NOT NULL,
            type VARCHAR(50),
            email_address VARCHAR(500),
            phone VARCHAR(500),
            timestamp TIMESTAMP,
            status INT(1),
            PRIMARY KEY (id),
			FOREIGN KEY (collection_id) REFERENCES receivable_reminders(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE collection_message_logs;
	`);
}
