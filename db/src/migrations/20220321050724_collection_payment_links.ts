import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE collection_payment_links (
			collection_id INT(10) UNSIGNED NOT NULL,
			short_url_id INT(10) UNSIGNED NOT NULL,
			FOREIGN KEY (collection_id) REFERENCES receivable_reminders(id),
			FOREIGN KEY (short_url_id) REFERENCES short_urls(id)
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE collection_payment_links;
	`);
}
