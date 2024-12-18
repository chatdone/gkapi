exports.up = function(knex) {
  return knex.raw(`
		UPDATE users SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE cards SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
	`);
};

exports.down = function(knex) {
  return knex;
};
