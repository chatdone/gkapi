exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
        CHANGE COLUMN data document_data JSON;
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
        CHANGE COLUMN document_data data TEXT;    
    `);
};
