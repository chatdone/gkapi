exports.up = function(knex) {
  return knex.raw(`
		ALTER TABLE jobs 
		ADD slug VARCHAR(50);
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE jobs
		DROP COLUMN slug;
	`);
};
