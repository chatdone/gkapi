import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE attendance_weekly_summary_mv (
            id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            company_member_id INT(10) UNSIGNED NOT NULL,
			week INT(2) UNSIGNED,
			month INT(2) UNSIGNED,
			year INT(4) UNSIGNED,
			monday INT(11) DEFAULT 0,
            tuesday INT(11) DEFAULT 0,
            wednesday INT(11) DEFAULT 0,
            thursday INT(11) DEFAULT 0,
            friday INT(11) DEFAULT 0,
            saturday INT(11) DEFAULT 0,
            sunday INT(11) DEFAULT 0,
			tracked_total INT(10) UNSIGNED NOT NULL DEFAULT 0,
			worked_total INT(10) UNSIGNED NOT NULL DEFAULT 0,
			regular_total INT(10) UNSIGNED NOT NULL DEFAULT 0,
			overtime_total INT(10) UNSIGNED NOT NULL DEFAULT 0,
			generated_at DATETIME NOT NULL DEFAULT NOW(),
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id),
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE
		); 

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE attendance_weekly_summary_mv
        `);
}
