import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE company_quota_usage (
			company_id INT(10) UNSIGNED PRIMARY KEY,
			whatsapp_quota_usage INT(10) DEFAULT 0,
			email_quota_usage INT(10) DEFAULT 0,
            timestamp TIMESTAMP,
		    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE company_quota_usage;
	`);
}
