import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE user_settings (
			user_id INT(10) UNSIGNED PRIMARY KEY,
			default_company_id INT(10) UNSIGNED,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (default_company_id) REFERENCES companies(id) ON DELETE SET NULL
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE user_settings;
	`);
}
