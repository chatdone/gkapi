import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
        ALTER TABLE company_holidays
            DROP COLUMN description;

        ALTER TABLE company_holidays
            DROP COLUMN hidden;

        ALTER TABLE company_holidays
            ADD active TINYINT(1) DEFAULT 1;

        ALTER TABLE company_holidays
            ADD public_holiday_id INT(10) UNSIGNED AFTER company_id;

        ALTER TABLE company_holidays
            ADD FOREIGN KEY (public_holiday_id) REFERENCES public_holidays(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        ALTER TABLE company_holidays
            ADD description VARCHAR(255);
        
        ALTER TABLE company_holidays
            ADD hidden TINYINT(1) DEFAULT 0;

        ALTER TABLE company_holidays
            DROP COLUMN active;

        ALTER TABLE company_holidays
            DROP FOREIGN KEY company_holidays_ibfk_4;
        
        ALTER TABLE company_holidays
            DROP COLUMN public_holiday_id;
    `);
}
