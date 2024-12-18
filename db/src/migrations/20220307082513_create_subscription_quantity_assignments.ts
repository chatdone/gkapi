import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE subscription_quantity_assignments (
			subscription_id INT(10) UNSIGNED NOT NULL,
			company_member_id INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (subscription_id, company_member_id),
			FOREIGN KEY (subscription_id) REFERENCES company_subscriptions(id),
			FOREIGN KEY (company_member_id) REFERENCES company_members(id)
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE subscription_quantity_assignments;
	`);
}
