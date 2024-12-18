import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE card_comments 
          ADD COLUMN message_content JSON AFTER message;
  
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE card_comments
        DROP message_content;
  `);
}
