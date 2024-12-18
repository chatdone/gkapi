exports.up = function(knex) {
  return knex.raw(`
		CREATE TABLE document_history (
			id INTEGER(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			id_bin BINARY(16) UNIQUE,
			id_text varchar(36) generated always as (LOWER(insert(
					insert(
						insert(
							insert(hex(id_bin),9,0,'-'),
							14,0,'-'),
						19,0,'-'),
					24,0,'-')
			)) virtual,

			card_attachment_id INT(10) UNSIGNED,
			action_id TINYINT(3) UNSIGNED,
			data JSON,

			created_at DATETIME NOT NULL DEFAULT NOW(),
			created_by INT(10) UNSIGNED NOT NULL,

			PRIMARY KEY (id),
			FOREIGN KEY (card_attachment_id) REFERENCES card_attachments(id),
			FOREIGN KEY (created_by) REFERENCES users(id)
		);

		CREATE 
			TRIGGER document_history_uuid_before_insert
		BEFORE INSERT ON document_history FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END;
;
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		DROP TABLE document_history;
		DROP TRIGGER IF EXISTS document_history_uuid_before_insert;
	`);
};
