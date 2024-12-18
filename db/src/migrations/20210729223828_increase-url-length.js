exports.up = function(knex) {
    return knex.raw(`
          ALTER TABLE short_urls
          MODIFY url VARCHAR(500);
      `);
  };
  
  exports.down = function(knex) {
    return knex.raw(`
          ALTER TABLE short_urls
          MODIFY url VARCHAR(45);
          `);
  };
  