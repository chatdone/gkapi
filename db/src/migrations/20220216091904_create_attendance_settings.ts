import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE attendance_settings (
			company_id INT(10) UNSIGNED PRIMARY KEY,
			allow_mobile TINYINT(1) NOT NULL DEFAULT 1,
			allow_web TINYINT(1) NOT NULL DEFAULT 1,
			require_verification TINYINT(1) NOT NULL DEFAULT 0,
			require_location TINYINT(1) NOT NULL DEFAULT 0,
			enable_2d TINYINT(1) NOT NULL DEFAULT 1,
			enable_biometric TINYINT(1) NOT NULL DEFAULT 1,
		FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
			
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE attendance_settings;
	`);
}
