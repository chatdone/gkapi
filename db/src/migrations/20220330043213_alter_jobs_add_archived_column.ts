import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE jobs 
        ADD COLUMN archived TINYINT(1) DEFAULT 0;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE jobs
        DROP COLUMN archived;
  `);
}
