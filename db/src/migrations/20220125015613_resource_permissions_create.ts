import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE resource_permissions (
			resource_id VARCHAR(100) PRIMARY KEY,
            company_member_ids JSON,
            team_ids JSON
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE resource_permissions;
	`);
}
