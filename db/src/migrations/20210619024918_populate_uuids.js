exports.up = function(knex) {
  return knex.raw(`
		UPDATE job_members SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE jobs SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE jobs_teams SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE package_prices SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE packages SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE receivable_payments SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE receivable_periods SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE receivable_reminders SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE reminder_read SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
		UPDATE remind_on_days SET id_bin = unhex(replace(uuid(),'-','')) WHERE id_bin IS NULL;
	`);
};

exports.down = function(knex) {};
