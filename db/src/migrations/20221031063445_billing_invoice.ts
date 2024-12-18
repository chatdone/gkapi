import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE billing_invoices (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            doc_no VARCHAR(20),
            code VARCHAR(10),
            company_name VARCHAR(100),
            terms VARCHAR(10),
            description_hdr VARCHAR(200),
            sequence INT(10),
            description_dtl VARCHAR(200),
            qty INT(10),
            uom VARCHAR(10),
            unit_price DECIMAL(10,2),
            discount DECIMAL(10,2),
            tax VARCHAR(10),
            tax_inclusive TINYINT(1),
            tax_amt DECIMAL(10,2),
            amount DECIMAL(10,2),
            remarks VARCHAR(200),
            created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            updated_by INT(10) UNSIGNED NOT NULL
		);

    ${knex.raw(getUuidQuery('billing_invoices'))};		
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE billing_invoices;
	`);
}
