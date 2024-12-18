import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_working_hours
        ADD timezone VARCHAR(255) DEFAULT 'Asia/Kuala_Lumpur' AFTER end_hour
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_working_hours
        DROP COLUMN timezone
    `);
}
