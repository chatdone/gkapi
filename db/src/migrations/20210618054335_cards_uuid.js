const { getUuidQuery } = require('../utils');

const tableName = 'cards';

exports.up = function(knex) {
  return knex.raw(getUuidQuery(tableName));
};

exports.down = function(knex) {
  return knex.raw(`
		ALTER TABLE ${tableName} DROP COLUMN id_text;
		ALTER TABLE ${tableName} DROP COLUMN id_bin;
		DROP TRIGGER IF EXISTS ${tableName}_uuid_before_insert;
	`);
};
