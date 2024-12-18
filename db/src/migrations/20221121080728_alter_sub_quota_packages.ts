import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_packages
        ADD COLUMN storage_quota BIGINT DEFAULT 50000000000 AFTER published,
        ADD COLUMN team_quota INT(10) NOT NULL DEFAULT 1 AFTER published,
        ADD COLUMN report_quota INT(10) NOT NULL DEFAULT 5 AFTER published,
        ADD COLUMN invoice_quota INT(10) NOT NULL DEFAULT 5 AFTER published,
        ADD COLUMN task_quota INT(10) NOT NULL DEFAULT 50 AFTER published,
        ADD COLUMN user_quota INT(10) NOT NULL DEFAULT 3 AFTER published;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscription_packages
		DROP COLUMN storage_quota,
        DROP COLUMN team_quota,
        DROP COLUMN report_quota,
        DROP COLUMN invoice_quota,
        DROP COLUMN task_quota,
        DROP COLUMN user_quota;
	`);
}
