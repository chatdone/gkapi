import config from '../../knexfile';
import dotenv from 'dotenv';
import knex from 'knex';
dotenv.config();

const environment = process.env.GK_ENVIRONMENT || 'development';
// @ts-ignore
export const knexConfig = config[environment];
// console.log(`DB URL: ${knexConfig.connection.host}`);

export default knex(knexConfig);
