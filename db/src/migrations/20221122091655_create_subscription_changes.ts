import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE subscription_changes (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			subscription_id INT(10) UNSIGNED NOT NULL,
			action VARCHAR(255) NOT NULL,
			action_data JSON NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),	
			created_by INT(10) UNSIGNED NULL,
			run_at DATETIME NULL,
			completed_at DATETIME NULL,
			completed_by VARCHAR(255),
			PRIMARY KEY (id),
			FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE subscription_changes;
	`);
}
