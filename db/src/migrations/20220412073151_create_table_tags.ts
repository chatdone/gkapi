import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE tag_groups (
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
      name VARCHAR(150),
      company_id INT(10) UNSIGNED NOT NULL,
      created_by INT(10) UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      
      PRIMARY KEY (id),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE tags (
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
      name VARCHAR(150),
      color VARCHAR(10),
      company_id INT(10) UNSIGNED NOT NULL,
      group_id INT(10) UNSIGNED,
      created_by INT(10) UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),

      
      PRIMARY KEY (id),
      FOREIGN KEY (group_id) REFERENCES tag_groups(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );


    CREATE 
      TRIGGER tags_uuid_before_insert
    BEFORE INSERT ON tags FOR EACH ROW 
      BEGIN 
          set NEW.id_bin = unhex(replace(uuid(),'-',''));
      END;

    CREATE 
      TRIGGER tag_groups_uuid_before_insert
    BEFORE INSERT ON tag_groups FOR EACH ROW 
      BEGIN 
          set NEW.id_bin = unhex(replace(uuid(),'-',''));
      END;
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TRIGGER IF EXISTS tags_uuid_before_insert;
    DROP TRIGGER IF EXISTS tag_groups_uuid_before_insert;
    DROP TABLE tags;
    DROP TABLE tag_groups;

  `);
}
