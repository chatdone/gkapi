import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE attendance_labels (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			company_id INT(10) UNSIGNED NOT NULL,
			name VARCHAR(255),
			color VARCHAR(10),
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			archived TINYINT(1),
			PRIMARY KEY (id),
			FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
		); 
		${knex.raw(getUuidQuery('attendance_labels'))}
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE attendance_labels
	`);
}
