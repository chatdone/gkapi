exports.up = function(knex) {
  return knex.raw(`ALTER TABLE receivable_reminders
	ADD COLUMN sp_recurring_id VARCHAR(50)`);
};

exports.down = function(knex) {
  return knex.raw(`ALTER TABLE receivable_reminders
	DROP COLUMN sp_recurring_id`);
};
