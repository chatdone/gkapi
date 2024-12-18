import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

		CREATE TABLE subscription_products (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			stripe_product_id VARCHAR(255) NOT NULL,
			name VARCHAR(255) NOT NULL,
			created_by INT(10) UNSIGNED NOT NULL,
			updated_by INT(10) UNSIGNED NOT NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			PRIMARY KEY (id),
			FOREIGN KEY (created_by) REFERENCES users(id),
			FOREIGN KEY (updated_by) REFERENCES users(id)
		);

		CREATE TABLE subscription_packages (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			published TINYINT(1) NOT NULL DEFAULT 0,
			created_by INT(10) UNSIGNED NOT NULL,
			updated_by INT(10) UNSIGNED NOT NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			PRIMARY KEY (id),
			FOREIGN KEY (created_by) REFERENCES users(id),
			FOREIGN KEY (updated_by) REFERENCES users(id)
		);

		CREATE TABLE subscription_package_products (
			package_id INT(10) UNSIGNED NOT NULL,
			product_id INT(10) UNSIGNED NOT NULL,
			PRIMARY KEY (package_id, product_id),
			FOREIGN KEY (package_id) REFERENCES subscription_packages(id),
			FOREIGN KEY (product_id) REFERENCES subscription_products(id)
		);

		CREATE TABLE subscriptions (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			stripe_subscription_id VARCHAR(255) NOT NULL,
			package_id INT(10) UNSIGNED NOT NULL,
			company_id INT(10) UNSIGNED NOT NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),
			updated_at DATETIME NOT NULL DEFAULT NOW(),
			PRIMARY KEY (id),
			FOREIGN KEY (company_id) REFERENCES companies(id),
			FOREIGN KEY (package_id) REFERENCES subscription_packages(id)
		);
		
	
	`);
  await knex.raw(getUuidQuery('subscriptions'));
  await knex.raw(getUuidQuery('subscription_products'));
  await knex.raw(getUuidQuery('subscription_packages'));
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE subscriptions;
		DROP TABLE subscription_package_products;
		DROP TABLE subscription_packages;
		DROP TABLE subscription_products;
	`);
}
