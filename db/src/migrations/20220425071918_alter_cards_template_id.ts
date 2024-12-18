import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards 
    ADD COLUMN template_id INT(10) UNSIGNED AFTER deleted_by
    
    
        
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE cards
          DROP template_id;
          
    `);
}
