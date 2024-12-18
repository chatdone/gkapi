import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE project_claims (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            description VARCHAR(255),
            note VARCHAR(999),
            member_id INT(10) UNSIGNED NOT NULL,
            amount DECIMAL(10,2) UNSIGNED DEFAULT 0,
            attachment_url VARCHAR(255),
            status TINYINT(1) NOT NULL DEFAULT 0,
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
			FOREIGN KEY (project_id) REFERENCES jobs(id) ON DELETE CASCADE
		);

        CREATE 
        TRIGGER project_claims_uuid_before_insert
      BEFORE INSERT ON project_claims FOR EACH ROW 
        BEGIN 
            set NEW.id_bin = unhex(replace(uuid(),'-',''));
        END;
      ;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE project_claims;
	`);
}
