import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE project_time_costs (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            date DATETIME NOT NULL DEFAULT NOW(),
            time_in DATETIME NOT NULL,
            time_out DATETIME,
            task_id INT(10) UNSIGNED NOT NULL,
            member_id INT(10) UNSIGNED NOT NULL,
            duration INT(11) GENERATED ALWAYS AS 
                (TIMESTAMPDIFF(SECOND,time_in,time_out)) VIRTUAL,
            amount DECIMAL(10,2) UNSIGNED DEFAULT 0,
            project_id INT(10) UNSIGNED NOT NULL,
            created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            updated_by INT(10) UNSIGNED NOT NULL,
            id_bin BINARY(16) UNIQUE,
      id_text varchar(36) generated always as (LOWER(insert(
          insert(
            insert(
              insert(hex(id_bin),9,0,'-'),
              14,0,'-'),
            19,0,'-'),
          24,0,'-')
      )) virtual,
			FOREIGN KEY (project_id) REFERENCES jobs(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE
		);

        CREATE 
        TRIGGER project_time_costs_uuid_before_insert
      BEFORE INSERT ON project_time_costs FOR EACH ROW 
        BEGIN 
            set NEW.id_bin = unhex(replace(uuid(),'-',''));
        END;
      ;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE project_time_costs;
	`);
}
