import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions
		MODIFY stripe_subscription_id VARCHAR(255) NULL;	
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE subscriptions
		MODIFY stripe_subscription_id VARCHAR(255) NOT NULL;	
	`);
}
