import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`ALTER TABLE employee_types
  ADD COLUMN archived TINYINT(1)`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`ALTER TABLE employee_types
  DROP COLUMN archived`);
}
