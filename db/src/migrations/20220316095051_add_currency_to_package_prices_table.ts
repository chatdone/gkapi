import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE package_prices
        ADD currency VARCHAR(5) DEFAULT 'MYR' AFTER description
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE package_prices
        DROP COLUMN currency
    `);
}
