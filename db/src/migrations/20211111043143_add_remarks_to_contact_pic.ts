import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE contacts_pic
	    ADD COLUMN remarks VARCHAR(255) AFTER national_format;`,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE contacts_pic
	    DROP COLUMN remarks;`,
  );
}
