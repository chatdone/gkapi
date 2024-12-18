import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE templates 
        ADD COLUMN type TINYINT(1) AFTER name;
        

  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE templates
        DROP COLUMN type;
  `);
}
