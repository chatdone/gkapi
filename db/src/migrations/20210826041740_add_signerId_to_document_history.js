exports.up = function(knex) {
  return knex.raw(
    `ALTER TABLE document_history
            ADD signer_id VARCHAR(150)
            AFTER created_by;
        `
  );
};

exports.down = function(knex) {
  return knex.raw(
    `ALTER TABLE document_history
            DROP COLUMN signer_id;
        `
  );
};
