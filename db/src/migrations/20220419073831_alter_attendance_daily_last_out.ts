import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE attendance_daily_summary_mv 
    ADD COLUMN last_attendance_id INT(10) UNSIGNED AFTER first_in,
        ADD COLUMN first_attendance_id INT(10) UNSIGNED AFTER first_in;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE attendance_daily_summary_mv
          DROP first_attendance_id,
          DROP last_attendance_id;
    `);
}
