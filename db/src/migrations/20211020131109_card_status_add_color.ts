import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`ALTER TABLE card_statuses
	ADD COLUMN color VARCHAR(10);`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`ALTER TABLE card_statuses
	DROP COLUMN color;`);
}
