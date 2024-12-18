import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheets
            ADD planned_effort INT(11) DEFAULT 0 AFTER updated_at

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE timesheets
        DROP COLUMN planned_effort
	`);
}
