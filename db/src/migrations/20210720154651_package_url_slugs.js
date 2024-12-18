
exports.up = function(knex) {
    return knex.raw(`
        ALTER TABLE packages
        ADD url_slug VARCHAR(100);
    `)
  
};

exports.down = function(knex) {
    return knex.raw(`
        ALTER TABLE packages
        DROP COLUMN url_slug;
    `)
  
};
