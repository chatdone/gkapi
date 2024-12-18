import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        ADD cancel_at_period_end TINYINT(1) DEFAULT 0 AFTER cancel_date
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_subscriptions
        DROP COLUMN cancel_at_period_end
    `);
}
