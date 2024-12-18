exports.up = function(knex) {
  return knex.raw(`
		UPDATE card_activities SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE card_attachments SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE card_checklist SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE card_comments SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE card_members SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE card_pics SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE card_statuses SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
	`);
};

exports.down = function(knex) {};
