import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_quota_usage 
        ADD COLUMN last_remind_exceeded DATETIME;
        

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_quota_usage
        DROP COLUMN last_remind_exceeded;
        
  `);
}
