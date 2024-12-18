exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE signing_workflows
            ADD job_id INT(10) UNSIGNED
            AFTER card_id;

        ALTER TABLE signing_workflows
            ADD FOREIGN KEY (job_id) REFERENCES jobs(id);
    
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE signing_workflows
            DROP FOREIGN KEY signing_workflows_ibfk_4;

        ALTER TABLE signing_workflows
            DROP COLUMN job_id;
    
    `);
};
