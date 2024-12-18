import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE attendance_daily_summary_mv 
        ADD COLUMN first_in DATETIME AFTER company_member_id;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE attendance_daily_summary_mv
          DROP first_in;
    `);
}
