import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
        ADD COLUMN total_received DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER remarks;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
        DROP COLUMN total_received;
	`);
}
