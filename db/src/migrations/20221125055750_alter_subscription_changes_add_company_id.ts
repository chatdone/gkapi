import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_changes
		ADD COLUMN company_id INT(10) UNSIGNED NULL AFTER subscription_id,
		ADD CONSTRAINT subscription_changes_company_id_fk FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_changes
		DROP FOREIGN KEY subscription_changes_company_id_fk,
		DROP COLUMN company_id;
	`);
}
