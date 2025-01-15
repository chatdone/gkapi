import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import schema from './graphql/schemasMap';
import authContext from './graphql/authContext';
import { graphqlUploadExpress } from 'graphql-upload';
import dotenv from 'dotenv';
import { knexConfig } from './db/knex';
import helmet from 'helmet';
import router from './routes';
import { RequestWithRawBody } from '@routes/subscription.routes';
import { setupSocketServer } from '@sockets';

if (process.env.GK_ENVIRONMENT === 'production') {
  import('newrelic');
}

dotenv.config();

const app = express();

const rawBodySaver = (
  req: RequestWithRawBody,
  res: express.Response,
  buf: Buffer,
) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString('utf8');
  }
};

const corsOrigins = [
  'http://localhost:3000',
  'https://neo.sandbox.gokudos.io',
  'https://neo.staging.gokudos.io',
  'https://app.gokudos.io',
  'https://admin.gokudos.io',
  'https://gk-api.vercel.app',
  'https://gkweb.vercel.app',
  'https://gkapi.chatdone.my',
  'https://gkweb.chatdone.my',
];

const startServer = async () => {
  const PORT = process.env.SERVER_PORT || 5000;

  const server = new ApolloServer({
    schema,
    context: authContext,
  });

  await server.start();

  app.use(
    express.json({
      verify: rawBodySaver,
    }),
  );
  app.use(express.urlencoded({ extended: false }));

  app.use(
    cors({
      credentials: true,
      origin: true,
    }),
  );

  router(app);

  app.use(graphqlUploadExpress());
  app.use(helmet());

  server.applyMiddleware({ app: app as any, path: '/graphql' });

  if (process.env.NODE_ENV !== 'test') {
    require('@scripts/cronjobs.script');
  }

  if (process.env.NODE_ENV !== 'test') {
    const expressServer = app.listen(PORT, () => {
      if (process.env.BYPASS_GRAPHQL_AUTH) {
        console.log('WARNING! GraphQL Auth bypass is ON.');
      }

      console.log('=======================================================');
      console.log(`GoKudos API is now running on port ${PORT}`);
      console.log(`Node Env: ${process.env.NODE_ENV}`);
      console.log(`GK Env: ${process.env.GK_ENVIRONMENT}`);
      console.log(`Database Url: ${knexConfig.connection.host}`);
      console.log(`Notification Url: ${process.env.NOTIFICATION_API_URL}`);
      console.log(`Redis Port: ${process.env.REDIS_PORT}`);
      console.log(`Use Redis?: ${process.env.USE_REDIS}`);
      console.log(`Enable Websockets?: ${process.env.ENABLE_WEBSOCKETS}`);

      console.log(`\n${new Date()}`);

      /*** GOODBYE SENANGPAY */
      // console.log('SenangPay API Url:', process.env.SENANGPAY_API_URL);
      // console.log(
      //   'SenangPay Credentials Key:',
      //   process.env.SENANGPAY_CREDENTIALS_KEY,
      // );
      // console.log('SenangPay Worker URL:', process.env.SENANGPAY_WORKER_URL);
      console.log('=======================================================');
    });

    if (process.env.ENABLE_WEBSOCKETS === 'true') {
      setupSocketServer(expressServer, corsOrigins);
    }
  }
};

startServer();

export default app;
