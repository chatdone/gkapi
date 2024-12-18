exports.up = function(knex) {
  return knex.raw(`
          ALTER TABLE jobs
          ADD color VARCHAR(100)
          AFTER comment;
      `);
};

exports.down = function(knex) {
  return knex.raw(`
          ALTER TABLE jobs
          DROP color;
      `);
};
