import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
		RENAME TABLE jobs TO projects;
	`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
		RENAME TABLE projects TO jobs;
	`);
}
