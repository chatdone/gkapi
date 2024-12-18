import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE template_attachments
    ADD COLUMN path VARCHAR(255) AFTER filesize,
    ADD COLUMN bucket VARCHAR(255) AFTER filesize
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE template_attachments
    DROP COLUMN path,
    DROP COLUMN bucket;
  `);
}
