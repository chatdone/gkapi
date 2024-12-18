import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE task_timer_entries (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            company_member_id INT(10) UNSIGNED NOT NULL,
            task_id INT(10) UNSIGNED NOT NULL,
            start_date DATETIME NOT NULL,
            end_date DATETIME,
						created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            time_total INT(11) GENERATED ALWAYS AS 
                (TIMESTAMPDIFF(SECOND,start_date,end_date)) VIRTUAL,
						PRIMARY KEY (id),
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE
		); 
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
	DROP TABLE task_timer_entries
	`);
}
