// @ts-nocheck

/*
	Creates a single user
*/

import { Knex } from 'knex';
import { TableNames } from 'db';
import fixtures from '@test/fixtures';

const TEST_USER_ID = 74;
const TEST_COMPANY_ID = 2879;

export async function seed(knex: Knex): Promise<void> {
  await knex(TableNames.USERS).where('id', TEST_USER_ID).del();
  await knex(TableNames.COMPANIES).where('id', TEST_COMPANY_ID).del();

  await knex(TableNames.COMPANIES).insert({
    id: 756,
    user_id: TEST_COMPANY_ID,
    name: 'Hololive',
    description: 'The vtuber company',
  });
}
