exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE card_attachments
            ADD document_hash VARCHAR(150);
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE card_attachments
            DROP COLUMN document_hash;
    `);
};
