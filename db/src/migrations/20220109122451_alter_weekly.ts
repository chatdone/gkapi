import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE activity_tracker_weekly_mv
    ADD year int(10) AFTER task_id,
    ADD week_number int(10) AFTER task_id
        
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE activity_tracker_weekly_mv
        DROP COLUMN week_number,
        DROP COLUMN year
    `);
}
