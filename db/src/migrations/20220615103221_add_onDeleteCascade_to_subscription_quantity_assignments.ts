import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
       ALTER TABLE subscription_quantity_assignments
       DROP FOREIGN KEY subscription_quantity_assignments_ibfk_1;

       ALTER TABLE subscription_quantity_assignments
       ADD CONSTRAINT subscription_quantity_assignments_ibfk_1 FOREIGN KEY (subscription_id) REFERENCES company_subscriptions (id) ON DELETE CASCADE;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        ALTER TABLE subscription_quantity_assignments
        DROP FOREIGN KEY subscription_quantity_assignments_ibfk_1;

        ALTER TABLE subscription_quantity_assignments
        ADD CONSTRAINT subscription_quantity_assignments_ibfk_1 FOREIGN KEY (subscription_id) REFERENCES company_subscriptions (id);
	`);
}
