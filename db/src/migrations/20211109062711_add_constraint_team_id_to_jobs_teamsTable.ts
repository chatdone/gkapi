import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE jobs_teams
        DROP FOREIGN KEY jobs_teams_ibfk_2;

    ALTER TABLE jobs_teams
        ADD CONSTRAINT jobs_teams_ibfk_2 FOREIGN KEY (team_id)  
        REFERENCES teams (id)
        ON DELETE CASCADE;
    
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE jobs_teams
        DROP FOREIGN KEY jobs_teams_ibfk_2;

    ALTER TABLE jobs_teams
        ADD CONSTRAINT jobs_teams_ibfk_2 FOREIGN KEY (team_id)  
        REFERENCES teams (id);
    `);
}
