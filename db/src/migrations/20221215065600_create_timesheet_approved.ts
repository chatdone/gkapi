import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE timesheet_day_approvals (
            
            company_member_id INT(10) UNSIGNED NOT NULL,
            task_id INT(10) UNSIGNED NOT NULL,
            day INT(10) DEFAULT 0,
            month INT(10) DEFAULT 0,
            year INT(10) DEFAULT 0,
            PRIMARY KEY (task_id, company_member_id, day, month, year),
            total INT(11) NOT NULL,
            status TINYINT(1) NOT NULL DEFAULT 1,
			created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
      approved_by INT(10),
      approved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE
		); 

	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
	DROP TABLE timesheet_day_approvals
	`);
}
