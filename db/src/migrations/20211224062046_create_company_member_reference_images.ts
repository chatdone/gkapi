import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE company_member_reference_images (
			company_member_id INT(10) UNSIGNED UNIQUE NOT NULL,
			image_url VARCHAR(255),
			status TINYINT(1),
			action_by INT(10) UNSIGNED,
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			PRIMARY KEY (company_member_id),
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE,
			FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE SET NULL 
		); 

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE company_member_reference_images;
	`);
}
