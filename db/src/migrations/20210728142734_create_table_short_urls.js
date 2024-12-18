exports.up = function(knex) {
  return knex.raw(`
		CREATE TABLE short_urls (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			url VARCHAR(255) NOT NULL,
			short_id VARCHAR(100) UNIQUE NOT NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),
			active TINYINT(1) NOT NULL DEFAULT 0,
			PRIMARY KEY (id)
		);
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		DROP TABLE short_urls;
	`);
};
