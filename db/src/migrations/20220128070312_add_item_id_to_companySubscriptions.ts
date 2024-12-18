import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        ADD item_id VARCHAR(255) DEFAULT NULL AFTER product_id
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        DROP COLUMN item_id
    `);
}
