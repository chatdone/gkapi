exports.up = function(knex) {
    return knex.raw(`
        ALTER TABLE users
        ADD signup_data JSON;
    `)
  
};

exports.down = function(knex) {
    return knex.raw(`
        ALTER TABLE users
        DROP COLUMN signup_data;
    `)
  
};