import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE users 
		ADD COLUMN auth0_id VARCHAR(100)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE users
		DROP COLUMN auth0_id
	`);
}
