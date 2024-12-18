import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE public_holidays
            ADD country_code VARCHAR(4) AFTER name,
            ADD year INT(4) AFTER name,
            ADD date DATETIME AFTER name;

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_holidays
        DROP COLUMN country_code,
        DROP COLUMN year,
        DROP COLUMN date;
	`);
}
