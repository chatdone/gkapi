exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE company_members
        ADD setting JSON;
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE company_members
        DROP COLUMN setting;
    `);
};
