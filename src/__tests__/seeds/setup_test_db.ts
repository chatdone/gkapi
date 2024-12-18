import { Knex } from 'knex';
import fs from 'fs';

export async function seed(knex: Knex): Promise<void> {
  var sqlSchema = fs
    .readFileSync('./src/__tests__/test-db-data/schema.sql')
    .toString();

  var sqlData = fs
    .readFileSync('./src/__tests__/test-db-data/migrations.sql')
    .toString();
  await knex
    .raw('DROP DATABASE IF EXISTS `sbiz-test`')
    .then(() => knex.raw('CREATE DATABASE `sbiz-test`'))
    .then(() => knex.raw(sqlSchema))
    .then(() => knex.raw(sqlData));
}
