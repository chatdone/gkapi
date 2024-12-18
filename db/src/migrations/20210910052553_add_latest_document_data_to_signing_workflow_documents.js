exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE signing_workflow_documents
        ADD COLUMN latest_document_data JSON
        AFTER latest_path;
  `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE signing_workflow_documents
            DROP COLUMN latest_document_data;
    `);
};
