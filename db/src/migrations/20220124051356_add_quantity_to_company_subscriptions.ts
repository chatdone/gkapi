import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        ADD quantity INT(10) DEFAULT 1 AFTER package_title
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        DROP COLUMN quantity
    `);
}
