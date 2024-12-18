import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
          DROP TABLE attendance_daily_summary_mv;
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE attendance_daily_summary_mv (
			company_member_id INT(10) UNSIGNED PRIMARY KEY,
			day INT(2) UNSIGNED,
			month INT(2) UNSIGNED,
			year INT(4) UNSIGNED,
			tracked INT(10) UNSIGNED NOT NULL DEFAULT 0,
			worked INT(10) UNSIGNED NOT NULL DEFAULT 0,
			regular INT(10) UNSIGNED NOT NULL DEFAULT 0,
			overtime INT(10) UNSIGNED NOT NULL DEFAULT 0,
			generated_at DATETIME NOT NULL DEFAULT NOW(),
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW()
		);
	`);
}

// import { Knex } from 'knex';

// export async function up(knex: Knex): Promise<void> {
//   return knex.raw(`
// 		ALTER TABLE attendance_daily_summary_mv
// 		DROP COLUMN company_member_id;

//         ALTER TABLE attendance_daily_summary_mv
// 		ADD COLUMN company_member_id INT(10) UNSIGNED NOT NULL,
//         ADD COLUMN id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT FIRST;

// //
// 	`);
// }

// export async function down(knex: Knex): Promise<void> {
//   return knex.raw(`
// 		ALTER TABLE attendance_daily_summary_mv
// 		ADD COLUMN company_member_id INT(10) UNSIGNED PRIMARY KEY
//         FIRST;

//         ALTER TABLE attendance_daily_summary_mv
// 		DROP COLUMN company_member_id,
//         DROP id;

// 	`);
// }
