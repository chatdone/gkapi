import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheets
            ADD archived TINYINT(1) NOT NULL DEFAULT 0 AFTER time_total

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE timesheets
        DROP COLUMN archived
	`);
}
