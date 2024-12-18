import winston from 'winston';
import dayjs from 'dayjs';
import WinstonCloudWatch from 'winston-cloudwatch';
import AWS from 'aws-sdk';
import slack from './slack';

type LoggerStripeError = {
  type: string;
  raw: {
    code: string;
    doc_url: string;
    message: string;
    param: string;
    type: string;
    headers: {
      server: string;
      date: string;
      'content-type': string;
      'content-length': string;
      connection: string;
      'access-control-allow-credentials': string;
      'access-control-allow-methods': string;
      'access-control-allow-origin': string;
      'access-control-expose-headers': string;
      'access-control-max-age': string;
      'cache-control': string;
      'request-id': string;
      'stripe-version': string;
      'strict-transport-security': string;
    };
    statusCode: number;
    requestId: string;
  };
  rawType: string;
  code: string;
  doc_url: string;
  param: string;
  detail: any;
  headers: {
    server: string;
    date: string;
    'content-type': string;
    'content-length': string;
    connection: string;
    'access-control-allow-credentials': string;
    'access-control-allow-methods': string;
    'access-control-allow-origin': string;
    'access-control-expose-headers': string;
    'access-control-max-age': string;
    'cache-control': string;
    'request-id': string;
    'stripe-version': string;
    'strict-transport-security': string;
  };
  requestId: string;
  statusCode: number;
  charge: any;
  decline_code: any;
  payment_intent: any;
  payment_method: any;
  payment_method_type: any;
  setup_intent: any;
  source: any;
};

const CloudWatchBaseOptions = {
  logStreamName: dayjs().format('YYYY/MM/DD'),
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: 'ap-southeast-1',
  jsonMessage: true,
  cloudWatchLogs: new AWS.CloudWatchLogs({ region: 'ap-southeast-1' }),
};

const commonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'common',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/common`,
    }),
  ],
});

const dedocoLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'dedoco',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/dedoco`,
    }),
  ],
});

const quotaLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'quotas',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/quotas`,
    }),
  ],
});

const subscriptionsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'subscriptions',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/subscriptions`,
    }),
  ],
});

const errorLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'errors',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/errors`,
    }),
  ],
});

const attendanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'attendance',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/attendance`,
    }),
  ],
});

const reportsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'reports',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/reports`,
    }),
  ],
});

const eventManagerLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'event-manager',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/event-manager`,
    }),
  ],
});

const activityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dashboard-api', environment: process.env.NODE_ENV },
  transports: [
    new WinstonCloudWatch({
      ...CloudWatchBaseOptions,
      name: 'unlogged-collection',
      logGroupName:
        process.env.CLOUDWATCH_LOG_GROUP ||
        `/api/gokudos-api/${process.env.NODE_ENV}/unlogged-collection`,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  commonLogger.add(
    new winston.transports.Console({
      format: winston.format.json(),
    }),
  );

  subscriptionsLogger.add(
    new winston.transports.Console({
      format: winston.format.json(),
    }),
  );
}

const logError = ({
  error,
  payload,
  sendToSlack = false,
}: {
  error: Error | LoggerStripeError;
  payload: unknown;
  sendToSlack?: boolean;
}) => {
  // const logCloudwatch = winston.createLogger({
  //   level: 'info',
  //   format: winston.format.json(),
  //   defaultMeta: {
  //     service: 'dashboard-api',
  //     environment: process.env.NODE_ENV,
  //   },
  //   transports: [
  //     // new WinstonCloudWatch({
  //     //   ...CloudWatchBaseOptions,
  //     //   name: 'errors',
  //     //   logGroupName:
  //     //     process.env.CLOUDWATCH_LOG_GROUP ||
  //     //     `/api/gokudos-api/${process.env.NODE_ENV}/errors`,
  //     // }),
  //     new winston.transports.Console({
  //       format: winston.format.json(),
  //       level: 'info',
  //     }),
  //   ],
  // });

  if (error instanceof Error) {
    // logCloudwatch.log('info', error?.message, {
    //   error,
    //   payload,
    // });
  } else {
    // logCloudwatch.log('info', JSON.stringify(error), {
    //   error,
    //   payload,
    // });
  }

  if (sendToSlack && process.env.SEND_TO_SLACK === 'true') {
    return slack.postToDevLog(JSON.stringify(error), payload);
  }
};

const logStripe = ({ email, payload }: { email: string; payload: unknown }) => {
  const logCloudwatch = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {
      service: 'dashboard-api',
      environment: process.env.NODE_ENV,
    },
    transports: [
      new WinstonCloudWatch({
        ...CloudWatchBaseOptions,
        name: 'stripe',
        logGroupName:
          process.env.CLOUDWATCH_LOG_GROUP ||
          `/api/gokudos-api/${process.env.NODE_ENV}/stripe`,
      }),
    ],
  });

  logCloudwatch.log('info', email, {
    payload,
  });
};

export default {
  common: commonLogger,
  subscriptions: subscriptionsLogger,
  quotaLogger: quotaLogger,
  errorLogger: errorLogger,
  dedoco: dedocoLogger,
  attendanceLogger: attendanceLogger,
  reportsLogger: reportsLogger,
  eventManagerLogger: eventManagerLogger,
  activityLogger: activityLogger,
  logError: logError,
  logStripe: logStripe,
};
