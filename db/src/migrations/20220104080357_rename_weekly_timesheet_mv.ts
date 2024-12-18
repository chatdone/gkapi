import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      DROP TABLE weekly_timesheets_mv
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE weekly_timesheets_mv (
            id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            company_member_id INT(10) UNSIGNED NOT NULL,
            task_id INT(10) UNSIGNED NOT NULL,
            monday INT(11) DEFAULT 0,
            tuesday INT(11) DEFAULT 0,
            wednesday INT(11) DEFAULT 0,
            thursday INT(11) DEFAULT 0,
            friday INT(11) DEFAULT 0,
            saturday INT(11) DEFAULT 0,
            sunday INT(11) DEFAULT 0,
			created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            total_weekly INT(11) GENERATED ALWAYS AS 
                (monday + tuesday + wednesday + thursday + friday + saturday + sunday) VIRTUAL,
            PRIMARY KEY (id),
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE
		); 

	`);
}
