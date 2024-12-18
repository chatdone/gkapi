import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`ALTER TABLE contact_group_members
    ADD UNIQUE (contact_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`ALTER TABLE contact_group_members
    DROP INDEX contact_id;
    `);
}

// export async function up(knex: Knex): Promise<void> {
//     return knex.raw(`ALTER TABLE card_statuses
//       ADD COLUMN color VARCHAR(10);`);
//   }

//   export async function down(knex: Knex): Promise<void> {
//     return knex.raw(`ALTER TABLE card_statuses
//       DROP COLUMN color;`);
//   }

// 'contact_group_members', 'CREATE TABLE `contact_group_members`
// (\n  `contact_id` int(10) unsigned NOT NULL,\n  `contact_group_id` int(10) unsigned NOT NULL,\n  PRIMARY KEY (`contact_id`,`contact_group_id`),\n  UNIQUE KEY `contact_id` (`contact_id`),\n  KEY `contact_group_id` (`contact_group_id`),\n  CONSTRAINT `contact_group_members_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,\n  CONSTRAINT `contact_group_members_ibfk_2` FOREIGN KEY (`contact_group_id`) REFERENCES `contact_groups` (`id`) ON DELETE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8'
