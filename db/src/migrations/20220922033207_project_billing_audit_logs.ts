import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE project_billing_audit_logs (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            action_type TINYINT(1) NOT NULL,
            billing_type TINYINT(1) NOT NULL,
            note VARCHAR(999),
            member_id INT(10) UNSIGNED NOT NULL,
            name VARCHAR(255),
            data JSON,
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
      )) virtual
		);

        CREATE 
        TRIGGER project_billing_audit_logs_uuid_before_insert
      BEFORE INSERT ON project_billing_audit_logs FOR EACH ROW 
        BEGIN 
            set NEW.id_bin = unhex(replace(uuid(),'-',''));
        END;
      ;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE project_billing_audit_logs;
	`);
}
