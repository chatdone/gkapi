exports.up = function(knex) {
  return knex.raw(`
	ALTER TABLE receivable_periods 
	ADD COLUMN webhook_data JSON`);
};

exports.down = function(knex) {
  return knex.raw(`
	ALTER TABLE receivable_periods 
	DROP COLUMN webhook_data
`);
};
