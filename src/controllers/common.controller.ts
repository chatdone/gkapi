import _ from 'lodash';
import { Readable, ReadableOptions } from 'stream';
import s3 from '@tools/s3';
import { consoleLog, setFileResHeader } from '@tools/utils';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import express from 'express';

import slack from '@tools/slack';
import { IncomingMessage } from 'http';
// import * as Twilio from '@tools/twilio';
// import * as Constants from '../constants';
// import * as Models from '../models';

// export const getConstants = async (req, res, next) => {
//   try {
//     const { name } = req.query;
//     if (name) {
//       if (!_.has(Constants, _.toUpper(name))) return next(new Error('Constant not found'));
//     }

//     const constant = name ? Constants[_.toUpper(name)] : Constants;
//     let payload = [];
//     if (_.isObject(constant)) payload = _.map(filterFunc(constant));

//     return res.status(200).json({ message: 'Success', payload });
//   } catch (e) {
//     return next(e);
//   }
// };

// export const uniqueFieldValidation = async (req, res, next) => {
//   req.check('model').exists();
//   req.check('attribute').exists();
//   req.check('value').exists();
//   try {
//     await req.asyncValidationErrors();
//     const { model, attribute, value } = req.body;
//     if (!_.has(Models, model)) return next(new Error('Model not found'));

//     const count = await Models[model].count({ where: { [attribute]: value } });

//     if (count > 0) return next(new Error(`${attribute}: ${value} is already exists`));
//     return res.status(200).json({ message: 'Valid', payload: true });
//   } catch (e) {
//     return next(e);
//   }
// };

export const downloadFileRequest = async (
  req: Request,
  res: Response,
  next: any,
  isPublicAccess: boolean,
): Promise<Response> => {
  try {
    const { filePath, fileName } = req.query;
    if (!filePath) throw new Error('filePath is required');
    const file = (await s3.getObjectFromS3({
      filePath: filePath as string,
      isPublicAccess,
    })) as any;
    setFileResHeader({ res, fileName: fileName as string });

    const buffer = Buffer.from(file.Body);
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    return readable.pipe(res);
  } catch (e) {
    return next(e);
  }
};

export const sentryToSlack = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response | undefined> => {
  try {
    if (process.env.SENTRY_SLACK) {
      await slack.postToSlack({
        blocks: [
          {
            type: 'section',
            fields: [
              {
                type: 'plain_text',
                text: `env: ${process.env.GK_ENVIRONMENT}, node_env: ${process.env.NODE_ENV}`,
              },
              {
                type: 'plain_text',
                text: `Message: ${JSON.stringify(req?.body?.message)}`,
              },
              {
                type: 'plain_text',
                text: `Culprit: ${JSON.stringify(req?.body?.culprit)}`,
              },
              {
                type: 'plain_text',
                text: `URL:${JSON.stringify(req?.body?.url)}`,
              },
              {
                type: 'plain_text',
                text: `
                Log Entries: ${JSON.stringify({
                  logentry: req?.body?.event?.logentry,
                })}
                `,
              },
              {
                type: 'plain_text',
                text: `Platform: ${JSON.stringify(req?.body?.event?.platform)}
                `,
              },
            ],
          },
        ],
      });

      consoleLog(
        `Stack trace: ${JSON.stringify({
          stackTrace: req?.body?.event?.logentry,
        })}`,
      );
    }

    return res.status(StatusCodes.OK).json({ ok: 'ok' });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

// export const validateMalaysiaPhoneNumber = async (req, res, next) => {
//   try {
//     const { phoneNumber } = req.body;
//     const payload = await Twilio.validatePhoneNumber(phoneNumber, { countryCode: 'MY' });
//     return res.status(200).json({ message: 'Valid Number', payload });
//   } catch (e) {
//     return next(e);
//   }
// };
