import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE holidays
            RENAME TO company_holidays;

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_holidays
        RENAME TO holidays
	`);
}
