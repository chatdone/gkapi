exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
        ADD document_id VARCHAR(100)
        AFTER action_id;
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
        DROP document_id;
    `);
};
