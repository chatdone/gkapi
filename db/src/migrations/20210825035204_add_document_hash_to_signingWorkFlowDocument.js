exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE signing_workflow_documents
            ADD document_hash VARCHAR(255);
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE signing_workflow_documents
            DROP COLUMN document_hash;
    `);
};
