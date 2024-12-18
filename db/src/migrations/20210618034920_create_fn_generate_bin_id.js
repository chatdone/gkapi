exports.up = function(knex) {
  return knex.raw(`
	CREATE FUNCTION generateBinaryId() RETURNS VARCHAR(36)
	BEGIN
		RETURN unhex(replace(uuid(),'-',''));
	END;

	`);
};

exports.down = function(knex) {
  return knex.raw(`
	DROP FUNCTION IF EXISTS generateBinaryId;
 `);
};
