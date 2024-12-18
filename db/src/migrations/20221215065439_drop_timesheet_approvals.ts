import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      DROP TABLE timesheet_approvals
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE timesheet_approvals (
      timesheet_id INT(10) UNSIGNED NOT NULL,
      PRIMARY KEY (timesheet_id),
      status TINYINT(1) NOT NULL DEFAULT 0,
      approved_by INT(10) UNSIGNED NOT NULL,
      approved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE CASCADE
      )
  `);
}
