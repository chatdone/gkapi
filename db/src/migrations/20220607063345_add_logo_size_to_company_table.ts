import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE companies
        ADD COLUMN logo_size DECIMAL(10,2) UNSIGNED DEFAULT 0.00 AFTER logo_url;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE companies
        DROP logo_size
  `);
}
