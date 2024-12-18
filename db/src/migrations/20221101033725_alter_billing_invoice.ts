import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
		ADD COLUMN doc_date DATETIME NOT NULL AFTER doc_no,
        DROP COLUMN company_name,
        DROP COLUMN discount,
        ADD COLUMN contact_id INT(10) UNSIGNED NOT NULL AFTER code,
        ADD COLUMN discount INT(10) UNSIGNED NOT NULL AFTER unit_price,
        ADD COLUMN account VARCHAR(10) AFTER discount,
        DROP COLUMN uom,
        ADD COLUMN uom VARCHAR(10) DEFAULT "UNIT" AFTER qty;

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
		DROP COLUMN doc_date,
        DROP COLUMN contact_id,
        DROP COLUMN discount,
        DROP COLUMN account,
        ADD COLUMN company_name VARCHAR(100) AFTER code,
        ADD COLUMN discount DECIMAL(10,2) AFTER unit_price;

	`);
}
