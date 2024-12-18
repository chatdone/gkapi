import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_member_reference_images 
        ADD COLUMN remark VARCHAR(255);
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE company_member_reference_images
        DROP COLUMN remark;
  `);
}
