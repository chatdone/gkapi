import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE attendances 
        ADD COLUMN worked INT(11) DEFAULT 0 AFTER time_total,
        ADD COLUMN overtime INT(11) DEFAULT 0 AFTER time_total; 
        

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE attendances
        DROP COLUMN worked,
        DROP COLUMN overtime;
        
  `);
}
