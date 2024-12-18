import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances 
			ADD COLUMN contact_id INT(10) UNSIGNED AFTER location_id;

    ALTER TABLE attendances
			ADD CONSTRAINT attendances_contact_id_foreign_idx FOREIGN KEY (contact_id)  
			REFERENCES contacts(id)
			ON DELETE SET NULL ON UPDATE CASCADE;
    
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE attendances
			DROP FOREIGN KEY attendances_contact_id_foreign_idx;

		ALTER TABLE attendances 
			DROP COLUMN contact_id;

	`);
}
