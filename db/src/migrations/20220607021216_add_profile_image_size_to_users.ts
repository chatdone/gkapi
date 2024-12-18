import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE users
        ADD COLUMN profile_image_size DECIMAL(10,2) UNSIGNED DEFAULT 0.00 AFTER profile_image;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE users
        DROP profile_image_size
  `);
}
