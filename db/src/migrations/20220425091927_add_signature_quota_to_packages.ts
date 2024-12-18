import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE packages
        ADD signature_quota INT(10) UNSIGNED DEFAULT 0
        AFTER whatsapp_quota;

    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE packages
        DROP COLUMN signature_quota;
    `);
}
