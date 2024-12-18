import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE timesheet_activities (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            task_id INT(10) UNSIGNED,
            active TINYINT(1) NOT NULL DEFAULT 1,
			created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id),
			FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE SET NULL
		);
        
        ${knex.raw(getUuidQuery('timesheet_activities'))}
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
	DROP TABLE timesheet_activities
	`);
}
