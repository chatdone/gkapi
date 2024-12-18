import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE billing_invoice_histories (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            invoice_id INT(10) UNSIGNED NOT NULL,
            total_received DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL
		);

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE billing_invoice_histories;
	`);
}
