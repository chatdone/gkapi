import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		RENAME TABLE company_payment_options TO company_payment_methods;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		RENAME TABLE company_payment_methods TO company_payment_options;
	`);
}
