import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE timesheet_verifications (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			company_member_id INT(10) UNSIGNED NOT NULL,
			image_url VARCHAR(255),
			status TINYINT(1),
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			PRIMARY KEY (id),
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE
		); 
		${knex.raw(getUuidQuery('timesheet_verifications'))}

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE timesheet_verifications;
	`);
}
