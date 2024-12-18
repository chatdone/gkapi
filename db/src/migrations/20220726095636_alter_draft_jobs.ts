import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs
		ADD COLUMN published TINYINT(1) DEFAULT 1
        
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE jobs
		DROP COLUMN published
	`);
}
