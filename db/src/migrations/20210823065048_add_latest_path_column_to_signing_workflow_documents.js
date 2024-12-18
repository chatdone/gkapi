exports.up = function(knex) {
  return knex.raw(`
          ALTER TABLE signing_workflow_documents
          ADD latest_path VARCHAR(255);
      `);
};

exports.down = function(knex) {
  return knex.raw(`
          ALTER TABLE signing_workflow_documents
          DROP COLUMN latest_path;
      `);
};
