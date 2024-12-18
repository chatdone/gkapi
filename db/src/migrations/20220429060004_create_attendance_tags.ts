import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE attendance_tags (
      attendance_id INT(10) UNSIGNED NOT NULL,
      tag_id INT(10) UNSIGNED NOT NULL,
      PRIMARY KEY (attendance_id, tag_id),
      FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE attendance_tags
    `);
}
