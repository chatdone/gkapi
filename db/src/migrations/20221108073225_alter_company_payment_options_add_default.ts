import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_payment_options 
		ADD COLUMN is_default TINYINT(1) DEFAULT 0 NOT NULL AFTER stripe_payment_method_id;	
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_payment_options
		DROP COLUMN is_default;
	`);
}
