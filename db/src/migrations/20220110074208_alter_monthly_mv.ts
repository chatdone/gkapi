import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE activity_tracker_monthly_mv
    ADD year int(10) AFTER week_number
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE activity_tracker_monthly_mv
    DROP column year 
    `);
}
