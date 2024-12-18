exports.up = function(knex) {
  return knex.raw(`
		ALTER TABLE receivable_reminders
		ADD COLUMN payment_type INT 
	`);
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE receivable_reminders
		DROP COLUMN payment_type
	`);
};
