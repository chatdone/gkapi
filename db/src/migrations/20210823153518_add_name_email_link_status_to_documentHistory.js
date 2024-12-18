exports.up = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
            ADD name VARCHAR(50),
            ADD email VARCHAR(100),
            ADD link VARCHAR(255),
            ADD status CHAR(50);
    `);
};

exports.down = function(knex) {
  return knex.raw(`
        ALTER TABLE document_history
            DROP COLUMN name,
            DROP COLUMN email,
            DROP COLUMN link,
            DROP COLUMN status;

    `);
};
