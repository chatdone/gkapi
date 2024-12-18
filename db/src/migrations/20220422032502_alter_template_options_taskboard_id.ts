import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE template_options 
    ADD COLUMN taskboard_id INT(10) UNSIGNED AFTER next_create
    
    
        
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE template_options
          DROP taskboard_id;
          
    `);
}
