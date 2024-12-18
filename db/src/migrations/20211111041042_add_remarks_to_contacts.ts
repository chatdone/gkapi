import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE contacts
	    ADD COLUMN remarks VARCHAR(255) AFTER address;`,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE contacts
	    DROP COLUMN remarks;`,
  );
}
