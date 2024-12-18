import { Knex } from 'knex';

//This applies to every companies.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		CREATE TABLE project_template_galleries (
			id INT NOT NULL AUTO_INCREMENT,
            gallery_templates JSON NULL,
            enabled BOOLEAN NOT NULL DEFAULT 0,
			PRIMARY KEY (id)
		);
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		DROP TABLE project_template_galleries;
	`);
}
