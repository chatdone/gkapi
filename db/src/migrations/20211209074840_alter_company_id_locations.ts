import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE locations
    ADD company_id INT(10) UNSIGNED NOT NULL
    AFTER id;`,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE locations
          DROP COLUMN company_id`,
  );
}
