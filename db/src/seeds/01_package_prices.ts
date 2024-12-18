import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  // Inserts seed entries
  await knex('package_prices').insert([
    {
      package_id: 19,
      stripe_price_id: 'price_1KKIXRIElsOvFh8GFdgLlX3G',
      name: 'Monthly',
      price: 8.0,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 19,
      stripe_price_id: 'price_1KKIXRIElsOvFh8GfgDuKUmR',
      name: 'Yearly',
      price: 76.8,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 20,
      stripe_price_id: 'price_1KLJehIElsOvFh8G3yJhfqWN',
      name: 'Monthly',
      price: 165.0,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 20,
      stripe_price_id: 'price_1KLJehIElsOvFh8Gpa8MKQTR',
      name: 'Yearly',
      price: 1584.4,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 21,
      stripe_price_id: 'price_1KLJfVIElsOvFh8GIumVVmXX',
      name: 'Monthly',
      price: 310.0,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 21,
      stripe_price_id: 'price_1KLJfVIElsOvFh8G8GJSHobo',
      name: 'Yearly',
      price: 2976.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 22,
      stripe_price_id: 'price_1KLJgKIElsOvFh8GF1kgJ4JZ',
      name: 'Monthly',
      price: 560.0,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 22,
      stripe_price_id: 'price_1KLJgKIElsOvFh8GEszZvsJN',
      name: 'Yearly',
      price: 5376.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 23,
      stripe_price_id: 'price_1KM310IElsOvFh8GVvq4worC',
      name: 'Monthly',
      price: 118.68,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 23,
      stripe_price_id: 'price_1KM310IElsOvFh8Go9Jo93ns',
      name: 'Yearly',
      price: 1161.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 24,
      stripe_price_id: 'price_1KM31aIElsOvFh8GhoFlstwe',
      name: 'Monthly',
      price: 229.08,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 24,
      stripe_price_id: 'price_1KM31aIElsOvFh8GzXDaZKlx',
      name: 'Yearly',
      price: 2241.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 25,
      stripe_price_id: 'price_1KM32FIElsOvFh8GhU2Q1tNV',
      name: 'Monthly',
      price: 339.48,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 25,
      stripe_price_id: 'price_1KM32FIElsOvFh8GCnOiu0Nb',
      name: 'Yearly',
      price: 3321.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 26,
      stripe_price_id: 'price_1KM2uyIElsOvFh8G2L3mHXDp',
      name: 'Monthly',
      price: 2.76,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 26,
      stripe_price_id: 'price_1KM2uyIElsOvFh8GOWnIXfsg',
      name: 'Yearly',
      price: 27.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 27,
      stripe_price_id: 'price_1KM2vtIElsOvFh8GTAhgmEqn',
      name: 'Monthly',
      price: 7.36,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 27,
      stripe_price_id: 'price_1KM2wIIElsOvFh8GTYwHQbhq',
      name: 'Yearly',
      price: 72.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 28,
      stripe_price_id: 'price_1KMQAbIElsOvFh8G6c3stjzy',
      name: 'Monthly',
      price: 116.1,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 28,
      stripe_price_id: 'price_1KMQAbIElsOvFh8GNmQ6Sgyl',
      name: 'Yearly',
      price: 1083.6,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 29,
      stripe_price_id: 'price_1KMQBgIElsOvFh8G5edcYmiY',
      name: 'Monthly',
      price: 224.1,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 29,
      stripe_price_id: 'price_1KMQBgIElsOvFh8G8PfPW4NE',
      name: 'Yearly',
      price: 2091.6,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 30,
      stripe_price_id: 'price_1KMQCUIElsOvFh8GS1ylZnJy',
      name: 'Monthly',
      price: 332.1,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 30,
      stripe_price_id: 'price_1KMQCUIElsOvFh8GaaOEuowr',
      name: 'Yearly',
      price: 3099.6,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 31,
      stripe_price_id: 'price_1KMQDyIElsOvFh8GnTqF5oe4',
      name: 'Monthly',
      price: 2.7,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 31,
      stripe_price_id: 'price_1KMQDyIElsOvFh8GrfG3Hdoz',
      name: 'Yearly',
      price: 25.2,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 32,
      stripe_price_id: 'price_1KMQEiIElsOvFh8GuSIVTOlF',
      name: 'Monthly',
      price: 7.2,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 32,
      stripe_price_id: 'price_1KMQEiIElsOvFh8GoTdVmst9',
      name: 'Yearly',
      price: 67.2,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 33,
      stripe_price_id: 'price_1KMQGnIElsOvFh8GARKL9TVr',
      name: 'Monthly',
      price: 148.5,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 33,
      stripe_price_id: 'price_1KMQGnIElsOvFh8GPfra0xvR',
      name: 'Yearly',
      price: 1386.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 34,
      stripe_price_id: 'price_1KMQHpIElsOvFh8GNMBVnaQu',
      name: 'Monthly',
      price: 279.0,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 34,
      stripe_price_id: 'price_1KMQHpIElsOvFh8GqSzkmSJI',
      name: 'Yearly',
      price: 2604.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 35,
      stripe_price_id: 'price_1KMQNNIElsOvFh8GJk0CsNWA',
      name: 'Monthly',
      price: 504.0,
      interval: 'month',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      package_id: 35,
      stripe_price_id: 'price_1KMQNNIElsOvFh8GTC4JGxs2',
      name: 'Yearly',
      price: 4704.0,
      interval: 'year',
      interval_count: 1,
      active: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}