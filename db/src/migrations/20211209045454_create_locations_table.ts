import { Knex } from 'knex';
// name, address, radius, lng, lat, archived, created_by, created_at, updated_at, updated_by
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE locations (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			address VARCHAR(255),
			radius DECIMAL(10,2),
			lng DOUBLE,
			lat DOUBLE,
            archived TINYINT(1),
			created_at DATETIME NOT NULL DEFAULT NOW(),
            created_by INT(10) UNSIGNED NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            updated_by INT(10) UNSIGNED NOT NULL,
            PRIMARY KEY (id),
			FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)


		)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE locations
	`);
}
