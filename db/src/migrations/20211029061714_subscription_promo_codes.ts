import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE subscription_promo_codes (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			subscription_id INT(10) UNSIGNED NOT NULL,
			promo_code_id VARCHAR(100) NOT NULL,
			code VARCHAR(50) NOT NULL,
			percent_off INT(10),
			amount_off INT(10),
			created_at DATETIME NOT NULL DEFAULT NOW(),
			PRIMARY KEY (id),
			FOREIGN KEY (subscription_id) REFERENCES company_subscriptions(id) ON DELETE CASCADE
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE subscription_promo_codes
	`);
}
