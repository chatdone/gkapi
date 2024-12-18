import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        ADD signature_quota INT(10) UNSIGNED DEFAULT 0
        AFTER whatsApp_quota;

    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        DROP COLUMN signature_quota;
    `);
}
