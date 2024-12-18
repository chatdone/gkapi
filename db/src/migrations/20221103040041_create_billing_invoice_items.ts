import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE billing_invoice_items (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            invoice_id INT(10) UNSIGNED NOT NULL,
            description_hdr VARCHAR(200) DEFAULT "Sales",
            sequence INT(10) UNSIGNED,
            task_id INT(10) UNSIGNED,
            description_dtl VARCHAR(200),
            qty INT(10) DEFAULT 1,
            uom VARCHAR(10) DEFAULT "UNIT",
            unit_price DECIMAL(10,2),
            discount_percentage DECIMAL(10,2),
            tax VARCHAR(10) DEFAULT "SV",
            tax_inclusive TINYINT(1),
            tax_percentage DECIMAL(10,2),
            tax_amt DECIMAL(10,2),
            amount DECIMAL(10,2),
            created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            updated_by INT(10) UNSIGNED NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES billing_invoices(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE SET NULL
		);

    ${knex.raw(getUuidQuery('billing_invoice_items'))};		
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE billing_invoice_items;
	`);
}
