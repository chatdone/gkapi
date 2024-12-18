exports.up = function(knex) {
  return knex.raw(`
		CREATE TABLE sp_company_credentials (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			company_id INT(10) UNSIGNED UNIQUE,
			credentials BLOB,
			PRIMARY KEY (id),
			FOREIGN KEY (company_id) REFERENCES companies(id)
		)
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		DROP TABLE sp_company_credentials
	`);
};
