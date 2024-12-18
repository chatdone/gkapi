import dotenv from 'dotenv';
dotenv.config();

const environments = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DEV_DB_HOST,
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      port: 3306,
      multipleStatements: true,
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      directory: './db/src/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './db/src/seeds',
    },
  },
  test: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'user',
      password: 'pass',
      database: 'sbiz-test',
      port: 5432,
      multipleStatements: true,
    },
    migrations: {
      directory: './db/src/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/__tests__/seeds',
    },
  },
  staging: {
    client: 'mysql2',
    connection: {
      host: process.env.PRODUCTION_DB_HOST,
      user: process.env.PRODUCTION_DB_USER,
      password: process.env.PRODUCTION_DB_PASSWORD,
      database: process.env.PRODUCTION_DB_NAME,
      port: 3306,
      multipleStatements: true,
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      directory: './db/src/migrations',
      tableName: 'knex_migrations',
    },
  },
  sandbox: {
    client: 'mysql2',
    connection: {
      host: process.env.SANDBOX_DB_HOST,
      user: process.env.SANDBOX_DB_USER,
      password: process.env.SANDBOX_DB_PASSWORD,
      database: process.env.SANDBOX_DB_NAME,
      port: 3306,
      multipleStatements: true,
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      directory: './db/src/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './db/src/seeds',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.PRODUCTION_DB_HOST,
      user: process.env.PRODUCTION_DB_USER,
      password: process.env.PRODUCTION_DB_PASSWORD,
      database: process.env.PRODUCTION_DB_NAME,
      port: 3306,
      multipleStatements: true,
    },
    pool: {
      min: 0,
      max: 10,
    },
    migrations: {
      directory: './db/src/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './db/src/seeds',
    },
  },
  // debug: true,
};

export default environments;
