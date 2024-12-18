exports.up = function(knex) {
  return knex.raw(`
		ALTER TABLE contact_groups
		ADD COLUMN type TINYINT(3) NOT NULL DEFAULT 1;
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE contact_groups
		DROP COLUMN type;
	`);
};
