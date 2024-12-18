exports.up = function(knex) {
  return knex.raw(
    `ALTER TABLE document_history
        ADD signing_workflow_document_id INT(10) UNSIGNED NOT NULL AFTER data;
     
    ALTER TABLE document_history
        ADD FOREIGN KEY (signing_workflow_document_id) REFERENCES signing_workflow_documents(id);
    `
  );
};

exports.down = function(knex) {
  return knex.raw(
    `ALTER TABLE document_history
        DROP FOREIGN KEY document_history_ibfk_3;
    ALTER TABLE document_history
        DROP COLUMN signing_workflow_document_id;
           
    `
  );
};
