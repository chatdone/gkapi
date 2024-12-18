import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE subscription_quantity_assignments 
        DROP FOREIGN KEY subscription_quantity_assignments_ibfk_2;

        ALTER TABLE subscription_quantity_assignments 
        ADD FOREIGN KEY (company_member_id) REFERENCES company_members(id) 
        ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE subscription_quantity_assignments
    DROP foreign key subscription_quantity_assignments_ibfk_2,
    ADD foreign key (company_member_id) REFERENCES company_members(id);
  `);
}
