import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE activity_tracker_daily_mv (
            id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            company_member_id INT(10) UNSIGNED NOT NULL,
            task_id INT(10) UNSIGNED NOT NULL,
            day INT(10) DEFAULT 0,
            month INT(10) DEFAULT 0,
            year INT(10) DEFAULT 0,
            total INT(11) NOT NULL,
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
	DROP TABLE activity_tracker_daily_mv
	`);
}
