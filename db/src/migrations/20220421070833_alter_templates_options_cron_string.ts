import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE template_options 
    ADD COLUMN next_create DATETIME AFTER description,
    ADD COLUMN cron_string TEXT AFTER description,
    ADD COLUMN is_recurring TINYINT(1) AFTER description
    
    
        
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE template_options
          DROP is_recurring,
          DROP cron_string,
          DROP next_create;
    `);
}
