exports.up = function(knex) {
  return knex.raw(`
		CREATE TABLE contact_groups (
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
    created_at DATETIME NOT NULL DEFAULT NOW(),
    modified_at DATETIME NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (id),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
	);

	CREATE TABLE contact_group_members (
		contact_id INT(10) UNSIGNED NOT NULL,
		contact_group_id INT(10) UNSIGNED NOT NULL,
		PRIMARY KEY (contact_id, contact_group_id),
		FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
		FOREIGN KEY (contact_group_id) REFERENCES contact_groups(id) ON DELETE CASCADE

	);


	CREATE 
		TRIGGER contact_groups_uuid_before_insert
	BEFORE INSERT ON contact_groups FOR EACH ROW 
		BEGIN 
				set NEW.id_bin = unhex(replace(uuid(),'-',''));
		END;
	;


	`);
};

exports.down = function(knex) {
  return knex.raw(`
		DROP TRIGGER IF EXISTS contact_groups_uuid_before_insert;
		DROP TABLE contact_group_members;
		DROP TABLE contact_groups;
	`);
};
