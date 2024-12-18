import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions
        ADD COLUMN storage_quota DECIMAL(10,3) NOT NULL DEFAULT 50 AFTER company_id,
        ADD COLUMN team_quota INT(10) NOT NULL DEFAULT 1 AFTER company_id,
        ADD COLUMN report_quota INT(10) NOT NULL DEFAULT 5 AFTER company_id,
        ADD COLUMN invoice_quota INT(10) NOT NULL DEFAULT 5 AFTER company_id,
        ADD COLUMN task_quota INT(10) NOT NULL DEFAULT 50 AFTER company_id,
        ADD COLUMN user_quota INT(10) NOT NULL DEFAULT 3 AFTER company_id;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions
		DROP COLUMN storage_quota,
        DROP COLUMN team_quota,
        DROP COLUMN report_quota,
        DROP COLUMN invoice_quota,
        DROP COLUMN task_quota,
        DROP COLUMN user_quota;
	`);
}
