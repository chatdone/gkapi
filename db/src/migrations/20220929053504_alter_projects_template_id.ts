import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE projects
		ADD COLUMN template_id INT(10) UNSIGNED AFTER contact_id,
        ADD FOREIGN KEY (template_id) REFERENCES project_templates(id) ON DELETE SET NULL;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		ALTER TABLE projects
        DROP FOREIGN KEY projects_ibfk_2,
		DROP COLUMN template_id;
	`);
}
