import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE contacts_pic MODIFY user_id INT(10) UNSIGNED NULL

    `);
}

//Reverting requires filling in values in user id otherwise there will be errors
export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
  SELECT * FROM contacts_pic LIMIT 1
  `);
}
