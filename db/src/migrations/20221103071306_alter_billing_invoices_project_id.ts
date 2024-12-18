import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
		ADD COLUMN project_id INT(10) UNSIGNED NOT NULL AFTER id,
        ADD FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE billing_invoices
		DROP COLUMN project_id;
	`);
}
