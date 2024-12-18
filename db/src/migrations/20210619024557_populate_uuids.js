exports.up = function(knex) {
  return knex.raw(`
		UPDATE collectors SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE collectors_members SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE companies SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE company_members SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE company_services_histories SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE company_subscriptions SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE company_working_hours SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE contacts SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE contacts_pic SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
	`);
};

exports.down = function(knex) {};
