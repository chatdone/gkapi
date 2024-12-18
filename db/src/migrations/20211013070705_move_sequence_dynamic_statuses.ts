import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE card_statuses 
		MODIFY COLUMN sequence INTEGER(10)
        AFTER percentage
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE card_statuses
        MODIFY COLUMN sequence INTEGER
        AFTER id_text
	`);
}
