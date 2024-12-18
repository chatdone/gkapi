/*
	Creates a single user
*/

import { Knex } from 'knex';

import fixtures from '@test/fixtures';
import { TableNames } from '@db-tables';
const TEST_USER_ID = 5678;

export async function seed(knex: Knex): Promise<void> {
  await knex(TableNames.USERS).where('id', TEST_USER_ID).del();
  const { id_text, ...generated } = fixtures.generate('user');

  return await knex(TableNames.USERS).insert({
    ...generated,
    id: TEST_USER_ID,
    name: 'Calliope Mori',
    email: 'dad@hololive.com',
    active: 1,
  });
}
