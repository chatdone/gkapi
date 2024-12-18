exports.up = function(knex) {
  return knex.raw(
    `ALTER TABLE packages
        CHANGE url_slug slug 
        VARCHAR(100);
        `
  );
};

exports.down = function(knex) {
  return knex.raw(
    `ALTER TABLE packages
    CHANGE slug url_slug 
    VARCHAR(100);
    `
  );
};
