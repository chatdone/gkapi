import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE timesheet_attendances (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            company_member_id INT(10) UNSIGNED NOT NULL,
            start_date DATETIME NOT NULL,
            end_date DATETIME,
						type TINYINT(1) NOT NULL DEFAULT 1,
            submitted_date DATETIME,
            comments VARCHAR(255),
            location_id INT(10) UNSIGNED,
						created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            time_total INT(11) GENERATED ALWAYS AS 
                (TIMESTAMPDIFF(SECOND,start_date,end_date)) VIRTUAL,
            PRIMARY KEY (id),
						FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE,
            FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
		); 
        ${knex.raw(getUuidQuery('timesheet_attendances'))}
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE timesheet_attendances
	`);
}
