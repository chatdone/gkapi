import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		ADD COLUMN parent_id INT(10) UNSIGNED AFTER status_id
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE cards
		DROP COLUMN parent_id
		
	`);
}
