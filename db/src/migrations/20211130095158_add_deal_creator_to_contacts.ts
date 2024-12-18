import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE contacts
	    ADD deal_creator INT(10) UNSIGNED
        AFTER deal_value;

    ALTER TABLE contacts
        ADD FOREIGN KEY (deal_creator) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE;
    `,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `
    ALTER TABLE contacts
          DROP FOREIGN KEY contacts_ibfk_2;
    
    ALTER TABLE contacts
	    DROP COLUMN deal_creator;`,
  );
}
