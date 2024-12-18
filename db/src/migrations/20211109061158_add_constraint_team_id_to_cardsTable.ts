import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        DROP FOREIGN KEY cards_team_id_foreign_idx;

    ALTER TABLE cards
        ADD CONSTRAINT cards_team_id_foreign_idx FOREIGN KEY (team_id)  
        REFERENCES teams (id)
        ON DELETE SET NULL ON UPDATE CASCADE;
    
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE cards
        DROP FOREIGN KEY cards_team_id_foreign_idx;

    ALTER TABLE cards
        ADD CONSTRAINT cards_team_id_foreign_idx FOREIGN KEY (team_id)  
        REFERENCES teams (id);
    `);
}
