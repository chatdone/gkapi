import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
          ALTER TABLE locations 
          MODIFY COLUMN archived TINYINT(1) DEFAULT 0;
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
          ALTER TABLE locations 
          MODIFY COLUMN archived TINYINT(1);
      `);
}
