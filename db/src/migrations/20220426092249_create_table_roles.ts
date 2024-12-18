import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE roles (
      id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(50),
			permissions JSON,
			company_id INT(10) UNSIGNED,
      created_by INT(10) UNSIGNED,
      updated_by INT(10) UNSIGNED,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),
			PRIMARY KEY (id),
			FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE roles;
	`);
}
