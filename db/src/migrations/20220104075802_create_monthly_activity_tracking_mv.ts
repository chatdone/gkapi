import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE activity_tracker_monthly_mv (
            id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            company_member_id INT(10) UNSIGNED NOT NULL,
            task_id INT(10) UNSIGNED NOT NULL,
            week_number INT(10) DEFAULT 0,
            week_total INT(11) DEFAULT 0,
			created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id),
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE
		); 

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
	DROP TABLE activity_tracker_monthly_mv
	`);
}
