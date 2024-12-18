exports.up = function(knex) {
  return knex.raw(`
		ALTER TABLE receivable_payments
		ADD column transaction_id VARCHAR(36)

	`);
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE receivable_payments
		DROP COLUMN transaction_id
	`);
};
