import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
  
  ALTER TABLE task_statuses
  DROP FOREIGN KEY task_statuses_ibfk_1,
  DROP FOREIGN KEY task_statuses_ibfk_2,
  DROP FOREIGN KEY task_statuses_ibfk_3;
  
          DROP TABLE task_statuses;
          DROP TABLE project_status_set_assignments;
          DROP TABLE task_status_sets;
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`

     CREATE TABLE task_status_sets (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY
        ); 
        
      CREATE TABLE project_status_set_assignments (
            project_id INT(10) UNSIGNED NOT NULL,
            task_status_set_id INT(10) UNSIGNED NOT NULL,
            created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL,
            updated_by INT(10) UNSIGNED NOT NULL,
            FOREIGN KEY (project_id) REFERENCES jobs(id) ON DELETE CASCADE,
            FOREIGN KEY (task_status_set_id) REFERENCES task_status_sets(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
        ); 


		CREATE TABLE task_statuses (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			set_id INT(10) UNSIGNED NOT NULL,
            sequence INT(10) UNSIGNED NOT NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			created_by INT(10) UNSIGNED NOT NULL,
			updated_by INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (id),
			FOREIGN KEY (set_id) REFERENCES task_status_sets(id) ON DELETE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
		); 

		${knex.raw(getUuidQuery('task_statuses'))};		
	`);
}
