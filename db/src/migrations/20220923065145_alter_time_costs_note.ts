import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE project_time_costs
		ADD COLUMN note VARCHAR(999) AFTER amount
        
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE project_time_costs
		DROP COLUMN note
	`);
}
