import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE attendances
        ADD COLUMN image_size DECIMAL(10,2) UNSIGNED DEFAULT 0.00 AFTER image_url;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE attendances
        DROP image_size
  `);
}
