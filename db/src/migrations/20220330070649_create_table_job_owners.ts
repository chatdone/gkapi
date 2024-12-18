import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE job_owners (
			job_id INT(10) UNSIGNED NOT NULL,
			company_member_id INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (job_id, company_member_id),
			FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
			FOREIGN KEY (company_member_id) REFERENCES company_members(id) ON DELETE CASCADE
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE job_owners;
	`);
}
