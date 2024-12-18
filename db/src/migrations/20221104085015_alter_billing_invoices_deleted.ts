import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
        ADD COLUMN deleted_at DATETIME,
		ADD COLUMN deleted_by INT(10);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
        DROP COLUMN deleted_at,
		DROP COLUMN deleted_by;
	`);
}
