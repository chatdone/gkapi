import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE template_tasks 
    ADD COLUMN sequence INT(5) AFTER name;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE template_tasks
    DROP COLUMN sequence;
  `);
}
