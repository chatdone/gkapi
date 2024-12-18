import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
          ALTER TABLE subscriptions
          DROP COLUMN storage_quota;

          ALTER TABLE subscriptions
          ADD COLUMN storage_quota BIGINT DEFAULT 50000000000 AFTER team_quota;
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`

  ALTER TABLE subscriptions
          DROP COLUMN storage_quota;

		ALTER TABLE subscriptions
        ADD COLUMN storage_quota DECIMAL(10,3) NOT NULL DEFAULT 50 AFTER company_id;
	`);
}
