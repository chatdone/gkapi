import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE company_payment_options (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			company_id INT(10) UNSIGNED NOT NULL,
			user_id INT(10) UNSIGNED NOT NULL,
			stripe_customer_id VARCHAR(255) NOT NULL,
			stripe_payment_method_id VARCHAR(255) NOT NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			created_by INT(10) UNSIGNED NOT NULL,
			updated_by INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (id),
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
		);
	
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE company_payment_options;
	`);
}
