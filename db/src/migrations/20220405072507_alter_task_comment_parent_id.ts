import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE card_comments 
        ADD COLUMN parent_id INT(10) UNSIGNED NULL AFTER mention_id,
        ADD COLUMN message_content TEXT AFTER message;

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE card_comments
        DROP COLUMN parent_id,
        DROP message_content;
  `);
}
