import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE company_profiles (
			company_id INT(10) UNSIGNED NOT NULL PRIMARY KEY,
			profile JSON,
			FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE company_profiles;
	`);
}
