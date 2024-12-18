exports.up = function(knex) {
  return knex.raw(`
		ALTER TABLE cards
		ADD slug VARCHAR(50);
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE cards
		DROP COLUMN slug
	`);
};
