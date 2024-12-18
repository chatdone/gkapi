import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        ADD end_date DATETIME AFTER due_reminder,
        ADD start_date DATETIME AFTER due_reminder,
        ADD value DECIMAL(10,2) AFTER description
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        DROP start_date,
        DROP end_date,
        DROP value
    `);
}
