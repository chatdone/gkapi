import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
		ADD COLUMN address VARCHAR(999),
        ADD COLUMN email VARCHAR(255),
        ADD COLUMN phone VARCHAR(255),
        ADD COLUMN website VARCHAR(255),
        ADD COLUMN registration_code VARCHAR(255),
        ADD COLUMN invoice_start INT(10);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE company_profiles
		DROP COLUMN address,
        DROP COLUMN email,
        DROP COLUMN phone,
        DROP COLUMN website,
        DROP COLUMN registration_code,
        DROP COLUMN invoice_start;
	`);
}
