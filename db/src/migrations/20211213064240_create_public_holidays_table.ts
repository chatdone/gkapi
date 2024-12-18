import { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		CREATE TABLE public_holidays (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            id_bin BINARY(16) UNIQUE,
            id_text varchar(36) generated always as (LOWER(insert(
                    insert(
                        insert(
                            insert(hex(id_bin),9,0,'-'),
                            14,0,'-'),
                        19,0,'-'),
                    24,0,'-')
            )) virtual,
			name VARCHAR(255) NOT NULL,
			start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
			created_at DATETIME NOT NULL DEFAULT NOW(),
            updated_at DATETIME NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id)
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE public_holidays
	`);
}
