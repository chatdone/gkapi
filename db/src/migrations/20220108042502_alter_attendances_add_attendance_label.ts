import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances
		ADD COLUMN attendance_label_id INT(10) UNSIGNED,
		ADD COLUMN location POINT,
		ADD COLUMN s3_key VARCHAR(255),
		ADD COLUMN s3_bucket VARCHAR(255),
		ADD COLUMN image_url VARCHAR(255),
		ADD COLUMN verification_type TINYINT(1),
		ADD FOREIGN KEY (attendance_label_id) REFERENCES attendance_labels(id) ON DELETE SET NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances
		DROP COLUMN verification_type,
		DROP COLUMN location,
		DROP COLUMN s3_key,
		DROP COLUMN s3_bucket,
		DROP COLUMN image_url,
		DROP FOREIGN KEY attendances_ibfk_4,
		DROP COLUMN attendance_label_id;
	`);
}
