import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE project_invoices (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            invoice_no VARCHAR(255),
            quantity INT(10) DEFAULT 0,
            price DECIMAL(10,2) UNSIGNED DEFAULT 0,
            amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) VIRTUAL,
            actual_cost DECIMAL(10,2) UNSIGNED DEFAULT 0,
            variance DECIMAL(10,2) GENERATED ALWAYS AS (amount - actual_cost) VIRTUAL,
            project_id INT(10) UNSIGNED NOT NULL,
            created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            updated_by INT(10) UNSIGNED NOT NULL,
			FOREIGN KEY (project_id) REFERENCES jobs(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE project_invoices;
	`);
}
