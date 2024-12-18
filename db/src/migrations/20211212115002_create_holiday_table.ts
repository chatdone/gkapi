import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE holidays (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			description VARCHAR(255),
			start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            type TINYINT(1),
            company_id INT(10) UNSIGNED NOT NULL,
            hidden TINYINT(1) DEFAULT 0,
			created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED,
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            updated_by INT(10) UNSIGNED,
            PRIMARY KEY (id),
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE holidays
	`);
}
