import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        ADD last_remind_on DATETIME AFTER due_reminder
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        DROP COLUMN last_remind_on
    `);
}
