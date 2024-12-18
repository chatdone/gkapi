import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
          ALTER TABLE locations 
          MODIFY COLUMN updated_by INT(10) UNSIGNED;
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
          ALTER TABLE locations 
          MODIFY COLUMN updated_by INT(10) UNSIGNED NOT NULL;
      `);
}
