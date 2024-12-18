import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE card_comment_attachments (
      comment_id INT(10) UNSIGNED NOT NULL,
      attachment_id INT(10) UNSIGNED NOT NULL,
      PRIMARY KEY (comment_id, attachment_id),
      FOREIGN KEY (comment_id) REFERENCES card_comments(id) ON DELETE CASCADE,
      FOREIGN KEY (attachment_id) REFERENCES card_attachments(id) ON DELETE CASCADE
      )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE card_comment_attachments
    `);
}
