import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE task_watchers (
      task_id INT(10) UNSIGNED NOT NULL,
      member_id INT(10) UNSIGNED NOT NULL,
      PRIMARY KEY (task_id, member_id),
      FOREIGN KEY (task_id) REFERENCES cards(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES company_members(id) ON DELETE CASCADE
      )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE task_watchers
    `);
}
