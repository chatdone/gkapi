exports.up = function(knex) {
  return knex.raw(`
		CREATE TABLE payment_orders (
		id_text VARCHAR(36),
		status TINYINT(3) DEFAULT 0,
		transaction_id VARCHAR(36),
    collection_id INT(10) UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    modified_at DATETIME NOT NULL DEFAULT NOW(),
    data JSON,
    PRIMARY KEY (id_text),
		FOREIGN KEY (collection_id) REFERENCES receivable_reminders(id)
	);
 `);
};

exports.down = function(knex) {
  return knex.raw(`
		DROP TABLE payment_orders
	`);
};
