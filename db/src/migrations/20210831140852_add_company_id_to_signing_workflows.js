exports.up = function(knex) {
  return knex.raw(`
      ALTER TABLE signing_workflows
          ADD company_id INT(10) UNSIGNED
          AFTER created_by;
  
      ALTER TABLE signing_workflows
          ADD FOREIGN KEY (company_id) REFERENCES companies(id);
      `);
};

exports.down = function(knex) {
  return knex.raw(`
      ALTER TABLE signing_workflows
          DROP FOREIGN KEY signing_workflows_ibfk_3;
          
      ALTER TABLE signing_workflows
          DROP COLUMN company_id;
      `);
};
