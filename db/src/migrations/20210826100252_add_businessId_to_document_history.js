exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE document_history
    ADD business_process_id VARCHAR(50)
    AFTER signing_workflow_document_id;
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
        DROP COLUMN business_process_id;
    
    `);
};
