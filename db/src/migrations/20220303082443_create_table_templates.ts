import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE templates (
      id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
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
      company_id INT(10) UNSIGNED,
      created_by INT(10) UNSIGNED,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE template_tasks (
      id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      template_id INT(10) UNSIGNED,
      parent_id INT(10) UNSIGNED,
      name VARCHAR(255),
      description VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );

    CREATE TABLE template_attachments (
      id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      template_id INT(10) UNSIGNED,
      name VARCHAR(255),
      type VARCHAR(255),
      filesize INT(10) UNSIGNED DEFAULT 0, 
      url VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );

    CREATE TABLE template_options (
      template_id INT(10) UNSIGNED PRIMARY KEY,
      copy_subtasks TINYINT(1) DEFAULT 0,
      copy_attachments TINYINT(1) DEFAULT 0,
      description VARCHAR(255),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );

    CREATE 
      TRIGGER templates_uuid_before_insert
    BEFORE INSERT ON templates FOR EACH ROW 
      BEGIN 
          set NEW.id_bin = unhex(replace(uuid(),'-',''));
      END;
    ;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TRIGGER IF EXISTS templates_uuid_before_insert;
    DROP TABLE template_options;
    DROP TABLE template_attachments;
    DROP TABLE template_tasks;
    DROP TABLE templates;
  `);
}
