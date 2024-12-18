import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE contacts
	    ADD COLUMN deal_value DECIMAL(10,2) AFTER remarks;`,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE contacts
	    DROP COLUMN deal_value;`,
  );
}
