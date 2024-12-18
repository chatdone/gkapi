exports.up = function(knex) {
  return knex.raw(`
		ALTER TABLE company_subscriptions 
		ADD COLUMN data JSON
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE company_subscriptions 
		DROP COLUMN data
	`);
};
