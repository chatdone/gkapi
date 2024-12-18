exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
        MODIFY COLUMN link VARCHAR(500);
        `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE document_history
    MODIFY COLUMN link VARCHAR(255);
    `);
};
