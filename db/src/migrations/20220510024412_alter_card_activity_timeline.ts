import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE card_activities\
      ADD COLUMN to_end_date DATETIME AFTER to_date,
      ADD COLUMN to_start_date DATETIME AFTER to_date,
          ADD COLUMN from_end_date DATETIME AFTER to_date,
      ADD COLUMN from_start_date DATETIME AFTER to_date;
          
          
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE card_activities 
      DROP to_start_date,
          DROP to_end_date,
      DROP from_start_date,
          DROP from_end_date;
      
      
          
    `);
}
