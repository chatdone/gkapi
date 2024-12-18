import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('roles').del();

  await knex('roles').insert([
    {
      id: 3,
      name: 'member',
      permissions: JSON.stringify([
        {
          action: 'read',
          subject: 'Task',
        },
        {
          action: 'update',
          subject: 'Task',
          conditions: { id: '${user.id}' },
        },
      ]),
    },
  ]);
}
