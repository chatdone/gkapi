import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
        ADD COLUMN void TINYINT(1) NOT NULL DEFAULT 0 AFTER total_received,
		ADD COLUMN voided_at DATETIME AFTER void,
        ADD COLUMN voided_by INT(10) AFTER voided_at;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
        DROP COLUMN void,
		DROP COLUMN voided_at,
        DROP COLUMN voided_by;
	`);
}
