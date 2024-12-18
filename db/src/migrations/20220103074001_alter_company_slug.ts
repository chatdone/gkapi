import { Knex } from 'knex';

exports.up = function (knex: Knex): Promise<void> {
  return knex.raw(`
        ALTER TABLE companies
        ADD slug VARCHAR(100);
    `);
};

exports.down = function (knex: Knex): Promise<void> {
  return knex.raw(`
        ALTER TABLE companies
        DROP COLUMN slug;
    `);
};
