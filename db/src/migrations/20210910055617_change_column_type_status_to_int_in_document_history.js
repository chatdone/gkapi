exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
           CHANGE COLUMN status status TINYINT;
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
            CHANGE COLUMN status status CHAR;
    `);
};
