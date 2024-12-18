import { Knex } from 'knex';
import fs from 'fs';

export async function seed(knex: Knex): Promise<void> {
  var sqlSchema = fs
    .readFileSync('./src/__tests__/test-db-data/schema.sql')
    .toString()
    .replace('sbiz-test', 'sbiz-dev');

  var sqlData = fs
    .readFileSync('./src/__tests__/test-db-data/migrations.sql')
    .toString()
    .replace('sbiz-test', 'sbiz-dev');
  await knex
    .raw('DROP DATABASE IF EXISTS `sbiz-dev`')
    .then(() => knex.raw('CREATE DATABASE `sbiz-dev`'))
    .then(() => knex.raw(sqlSchema))
    .then(() => knex.raw(sqlData));
}
