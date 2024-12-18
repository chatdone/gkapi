import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE timesheets
            MODIFY start_date DATETIME
	`);
}

//If this failed it means one of the rows for column start_date is null.
export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        ALTER TABLE timesheets
            MODIFY start_date DATETIME NOT NULL
	`);
}
