exports.up = function(knex) {
  return knex.raw(`
	CREATE TABLE signing_workflows (
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
		status TINYINT(1) NOT NULL DEFAULT 0,
		card_id INT(10) UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    modified_at DATETIME NOT NULL DEFAULT NOW(),
    deleted_at DATETIME,
    created_by INT(10) UNSIGNED NOT NULL,
    data JSON,
    PRIMARY KEY (id),
    FOREIGN KEY (card_id) REFERENCES cards(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
	);

	CREATE TABLE signing_workflow_documents (
		id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
		card_attachment_id INT(10) UNSIGNED NOT NULL,
		signing_workflow_id INT(10) UNSIGNED NOT NULL,
		PRIMARY KEY (id),
    FOREIGN KEY (card_attachment_id) REFERENCES card_attachments(id),
    FOREIGN KEY (signing_workflow_id) REFERENCES signing_workflows(id)
	);

	CREATE 
		TRIGGER signing_workflows_uuid_before_insert
	BEFORE INSERT ON signing_workflows FOR EACH ROW 
		BEGIN 
				set NEW.id_bin = unhex(replace(uuid(),'-',''));
		END;
	;

	`);
};

exports.down = function(knex) {
  return knex.raw(`
		DROP TABLE signing_workflow_documents;
		DROP TABLE signing_workflows;
		DROP TRIGGER IF EXISTS signing_workflows_uuid_before_insert;
	`);
};
