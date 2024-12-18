import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE jobs
        ADD category TINYINT(1) DEFAULT 0 AFTER type
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE jobs
        DROP category;
    `);
}
