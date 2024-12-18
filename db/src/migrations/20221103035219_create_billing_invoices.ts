import { getUuidQuery } from '../utils';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE billing_invoices (
			id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            doc_no VARCHAR(20),
            doc_date DATETIME NOT NULL,
            pic_id INT(10) UNSIGNED NOT NULL,
            terms VARCHAR(10),
            remarks VARCHAR(200),
            created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            updated_by INT(10) UNSIGNED NOT NULL,
            FOREIGN KEY (pic_id) REFERENCES contacts_pic(id) ON DELETE CASCADE
		);

    ${knex.raw(getUuidQuery('billing_invoices'))};		
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE billing_invoices;
	`);
}
