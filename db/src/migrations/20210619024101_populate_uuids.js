exports.up = function(knex) {
  return knex.raw(`
		UPDATE notifications SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE users_notifications SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE teams SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE team_members SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE admins SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
	`);
};

exports.down = function(knex) {
  return knex;
};
