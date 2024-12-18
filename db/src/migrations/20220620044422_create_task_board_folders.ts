import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE task_board_folders (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      id_bin BINARY(16) UNIQUE,
      id_text varchar(36) generated always as (LOWER(insert(
          insert(
            insert(
              insert(hex(id_bin),9,0,'-'),
              14,0,'-'),
            19,0,'-'),
          24,0,'-')
      )) virtual,
			name VARCHAR(255) NOT NULL,
			company_id INT(10) UNSIGNED NOT NULL,
			created_at DATETIME NOT NULL,
			created_by INT(10) UNSIGNED,		
			updated_at DATETIME NOT NULL,
			updated_by INT(10) UNSIGNED,		
			PRIMARY KEY (id),
			FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
			FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
		);

    CREATE 
      TRIGGER task_board_folders_uuid_before_insert
    BEFORE INSERT ON task_board_folders FOR EACH ROW 
      BEGIN 
          set NEW.id_bin = unhex(replace(uuid(),'-',''));
      END;
    ;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TRIGGER IF EXISTS task_board_folders_uuid_before_insert;
		DROP TABLE task_board_folders;
	`);
}
