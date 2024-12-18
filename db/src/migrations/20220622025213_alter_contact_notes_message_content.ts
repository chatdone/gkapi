import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      ALTER TABLE contact_notes 
          ADD COLUMN note_content JSON AFTER content;
  
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE contact_notes
        DROP note_content;
  `);
}
