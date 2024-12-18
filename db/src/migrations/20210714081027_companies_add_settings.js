exports.up = function(knex) {
  return knex.raw(`
		ALTER TABLE companies
		ADD COLUMN settings JSON
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE companies
		DROP COLUMN settings
	`);
};
