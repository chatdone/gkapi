/* eslint-disable prefer-const */
import _ from 'lodash';
import SendGridMail, { ClientResponse, MailDataRequired } from '@sendgrid/mail';
import Joi from 'joi';
import dotenv from 'dotenv';
import emailParser from 'mailparser';
import { consoleLog, getConstantNameByValue } from '@tools/utils';
import { NOTIFICATION_TYPES } from '@services/notification/constant';
import {
  EmailPayload,
  FpxEmailModel,
  IncomingEmailModel,
} from '@models/email.model';
import logger from '@tools/logger';
import { convert } from 'html-to-text';
import slack from '@tools/slack';
dotenv.config();
SendGridMail.setApiKey(process.env.SENDGRID_API_KEY as string);

type BasicEmailPayload = {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
};

const sendBasicEmail = async ({
  to,
  from,
  subject,
  text,
  html,
}: BasicEmailPayload): Promise<[ClientResponse, unknown]> => {
  const message = {
    to,
    from,
    subject,
    text,
    html,
  };
  try {
    const schema = Joi.object({
      to: Joi.string().required(),
      from: Joi.string().required(),
      subject: Joi.string().required(),
      text: Joi.string(),
      html: Joi.string(),
    });

    await schema.validateAsync(message);
    // @ts-ignore
    const sendResponse = await SendGridMail.send(message);
    return sendResponse;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'sendBasicEmail',
        to,
        from,
        subject,
        text,
        html,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const sendEmail = async (option: EmailPayload): Promise<boolean> => {
  let { to, data, templateId, attachments, subject } = option;

  try {
    let toEmail = to;
    if (process.env.GK_ENVIRONMENT === 'staging') {
      if (!to.includes('6biz.ai') && !to.includes('dropjar')) {
        return true;
      }
    }
    if (!_.get(data, 'companyLogoUrl'))
      data.companyLogoUrl = process.env.LOGO_URL || '';
    if (process.env.LOG_THIS_OUT) {
      console.log(
        `------- Send Email To ${toEmail} ${
          process.env.IS_SIMULATE_SEND ? '(Simulated)' : ''
        } -----------`,
      );
    }

    const message = {
      personalizations: [{ to: toEmail, dynamic_template_data: data, subject }],
      from: {
        email: process.env.NO_REPLY_EMAIL as string,
        name: process.env.EMAIL_SENDER_NAME as string,
      },
      template_id: templateId,
    };

    if (process.env.IS_SIMULATE_SEND) {
      consoleLog({ message });
      return true;
    }

    const sendResponse = await SendGridMail.send({
      personalizations: message.personalizations,
      from: message.from,
      templateId: message.template_id,
      attachments,
    });

    if (!sendResponse) {
      return Promise.reject(false);
    } else {
      return Promise.resolve(true);
    }
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'sendEmail',
        to,
        data,
        templateId,
        attachments,
        subject,
      },
      error: err,
    });
    return Promise.reject({ error });
  }
};

const parseIncomingEmail = async (body: IncomingEmailModel) => {
  const {
    dkim,
    email,
    to,
    from,
    sender_ip,
    spam_report,
    envelope,
    subject,
    spam_score,
    charsets,
    SPF,
  } = body;

  const convertedMessage = convert(email, {
    wordwrap: 130,
  });
  try {
    const userEmail = await parseSenangPayTo(to);

    const parser = emailParser.simpleParser;

    const isFpx = subject.includes('FPX');

    const clientName = isFpx ? '' : await parseSenangPayName(email);

    if (subject.includes('Welcome')) {
      await redirectEmail(userEmail, clientName, 'SenangPayActivation', null);
    } else if (subject.includes('Payment detail')) {
      parser(email, async (err, parsed) => {
        const parsedText = _.get(parsed, 'text');
        let transaction = _.split(parsedText, 'below');
        if (transaction[0].includes('recurring')) {
          // if recurring
          transaction = transaction[1].split('Recurring Charges');
          const transactionContent = transaction[0].split('\n');

          let parsedTransactionContent: any = await parseTransactionContent(
            transactionContent,
            true,
          );

          const recurringCharges = await parseRecurringList(transaction);

          parsedTransactionContent = {
            ...parsedTransactionContent,
            recurringCharges,
          };

          await redirectEmail(
            userEmail,
            clientName,
            'SenangPayTransactionRecurring',
            parsedTransactionContent,
          );
        } else {
          // if full payment
          const transactionString = transaction[1].split('NOTES')[0];

          const transactionContent = transactionString.split('\n');
          const parsedTransactionContent = await parseTransactionContent(
            transactionContent,
            false,
          );

          await redirectEmail(
            userEmail,
            clientName,
            'SenangPayTransactionFull',
            parsedTransactionContent,
          );
        }
      });
    } else if (subject.includes('FPX')) {
      parser(email, async (err, parsed) => {
        if (err) return Promise.reject(err);
        const parsedEmailContent = await parseFpxEmail(parsed);

        await redirectEmail(
          userEmail,
          clientName,
          'FpxTransactionStatus',
          parsedEmailContent,
        );
      });
    } else {
      logger.logError({
        payload: {
          service: 'email',
          fnName: 'parseIncomingEmail',
          body: convertedMessage,
        },
        error: new Error('Unparsed SP Message'),
        sendToSlack: true,
      });
    }

    return Promise.resolve(clientName);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'parseIncomingEmail',
        body,
      },
      error: err,
    });
    slack.postToDevLog(JSON.stringify(error), { convertedMessage });
    return Promise.reject({ error });
  }
};

const parseSenangPayTo = (RawTo: string) => {
  try {
    // regex to get in between < and >
    const regex = /<([^>]+)>/g;
    const inBetweenEmail = RawTo.match(regex);
    const stringifiedEmail = JSON.stringify(inBetweenEmail)
      .replace('["<', '')
      .replace('>"]', '');

    const to = stringifiedEmail.split('+');

    const noAt = to[1].split('@');

    let parsedEmail;
    let userEmail = [];
    let convertedEmail = '';
    if (to[0] === 'senangpay') {
      parsedEmail = noAt[0].split('-');

      for (let i = 0; i < parsedEmail.length; i++) {
        if (parsedEmail[i] === 'at') {
          userEmail.push('@');
        } else if (parsedEmail[i] === 'dot') {
          userEmail.push('.');
        } else if (parsedEmail[i] === 'dash') {
          userEmail.push('-');
        } else {
          userEmail.push(parsedEmail[i]);
        }
      }

      convertedEmail = userEmail.join('');
    }

    return convertedEmail;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'parseSenangPayTo',
        RawTo,
      },
      error: err,
    });
    return Promise.reject({ error });
  }
};

const parseSenangPayName = async (email: any) => {
  try {
    let parseEmail = email.split(' ');
    let arrName;
    let clientName;

    for (let i = 0; i < parseEmail.length; i++) {
      if (parseEmail[i].includes('Hello')) {
        arrName = parseEmail[i + 1];
        break;
      }
    }
    clientName = arrName.split(',');

    return Promise.resolve(clientName[0]);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'parseSenangPayName',
        email,
      },
      error: err,
    });
    return Promise.reject({ error });
  }
};

const parseTransactionContent = (transaction: any, isRecurring: any) => {
  try {
    let transactionContent;

    if (isRecurring) {
      transactionContent = {
        transactionRef: transaction[4].replace(/:/g, ''),
        transactionDateAndTime: transaction[8].replace(/:/g, ''),
        transactionAmount: transaction[12].replace(/:/g, ''),
        paymentMode: transaction[16].replace(/:/g, ''),
        status: transaction[20].replace(/:/g, ''),
        merchantName: transaction[24].replace(/:/g, ''),
        merchantEmail: transaction[28].replace(/:/g, ''),
        contactNumber: transaction[32].replace(/:/g, ''),
        item: transaction[36].replace(/:/g, ''),
        quantity: transaction[40].replace(/:/g, ''),
        recurringPrice: transaction[44].replace(/:/g, ''),
        deliveryCharges: transaction[48].replace(/:/g, ''),
        grandTotal: transaction[52].replace(/:/g, ''),
        paymentMadeBy: transaction[56].replace(/:/g, ''),
        userEmail: transaction[60].replace(/:/g, ''),
        contactNumberPayer: transaction[64].replace(/:/g, ''),
        note: transaction[68].replace(/:/g, '') || '',
        isRecurring: true,
      };
    } else {
      transactionContent = {
        transactionRef: transaction[4].replace(/:/g, ''),
        fpxRef: transaction[8].replace(/:/g, ''),
        transactionDateAndTime: transaction[12].replace(/:/g, ''),
        transactionAmount: transaction[16].replace(/:/g, ''),
        paymentMode: transaction[20].replace(/:/g, ''),
        status: transaction[24].replace(/:/g, ''),
        merchantName: transaction[28].replace(/:/g, ''),
        merchantEmail: transaction[32].replace(/:/g, ''),
        contactNumber: transaction[36].replace(/:/g, ''),
        item: transaction[40].replace(/:/g, ''),
        grandTotal: transaction[44].replace(/:/g, ''),
        paymentMadeBy: transaction[48].replace(/:/g, ''),
        userEmail: transaction[52].replace(/:/g, ''),
        contactNumberPayer: transaction[56].replace(/:/g, ''),
        isRecurring: false,
      };
    }

    return Promise.resolve(transactionContent);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'parseTransactionContent',
        transaction,
        isRecurring,
      },
      error: err,
    });
    return Promise.reject({ error });
  }
};

const parseRecurringList = (transaction: any) => {
  try {
    let recurringList = transaction[1].split(' ');
    let recurringDates = [];
    let recurringPrices = [];
    let recurringStatus = [];
    let no = [];

    for (let i = 0; i < recurringList.length; i++) {
      no.push(i + 1);

      if (recurringList[i].includes('/2')) {
        recurringDates.push(recurringList[i]);
      }

      if (recurringList[i].includes('RM')) {
        recurringPrices.push(recurringList[i + 1]);
      }

      if (recurringList[i].includes('Paid')) {
        recurringStatus.push('Paid');
      } else if (recurringList[i].includes('Pending')) {
        recurringStatus.push('Pending');
      }
    }

    let recurringCharges = [];

    for (let i = 0; i < recurringDates.length; i++) {
      recurringCharges.push({
        date: recurringDates[i],
        amount: `RM ${recurringPrices[i]}`,
        status: recurringStatus[i],
        no: no[i],
      });
    }

    return Promise.resolve(recurringCharges);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'parseRecurringList',
        transaction,
      },
      error: err,
    });
    return Promise.reject({ error });
  }
};

const redirectEmail = async (
  userEmail: string,
  clientName: string,
  emailType: any,
  emailContent: any,
) => {
  try {
    const typeInfo = getConstantNameByValue(NOTIFICATION_TYPES, emailType, {
      object: true,
    });
    if (_.isEmpty(typeInfo)) return Promise.resolve();

    const template = _.get(typeInfo, 'template') as string;

    let data = emailContent
      ? {
          ...emailContent,
          receiverName: clientName || '',
          companyLogoUrl: process.env.LOGO_URL,
        }
      : {
          receiverName: clientName || '',
          companyLogoUrl: process.env.LOGO_URL,
        };

    let toEmail = userEmail;
    if (process.env.GK_ENVIRONMENT === 'staging') {
      if (!userEmail.includes('6biz.ai') && !userEmail.includes('dropjar')) {
        return true;
      }
    }

    const message = {
      personalizations: [{ to: toEmail, dynamic_template_data: data }],
      from: {
        email: process.env.NO_REPLY_EMAIL as string,
        name: process.env.EMAIL_SENDER_NAME as string,
      },
      template_id: template,
    };

    if (process.env.LOG_THIS_OUT) {
      console.log(`------- Send To ${toEmail} -----------`);
    }
    const sendResponse = await SendGridMail.send({
      personalizations: message.personalizations,
      from: message.from,
      templateId: message.template_id,
    });
    let res = sendResponse[0];

    return Promise.resolve(res);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'redirectEmail',
        userEmail,
        clientName,
        emailType,
        emailContent,
      },
      error: err,
    });
    return Promise.reject({ error });
  }
};

const parseFpxEmail = async (email: any): Promise<FpxEmailModel | Error> => {
  try {
    let fpxObj = {
      fpxTransactionId: '',
      dateAndTime: '',
      sellerName: '',
      merchantOrderNo: '',
      sellerOrderNo: '',
      buyerBank: '',
      debitStatus: '',
      creditStatus: '',
      transactionAmount: '',
      fpxStatus: email.html.includes('<b>successful</b>')
        ? 'successful'
        : 'not successful',
    };
    let emailContent = email.html.split('\n');
    for (let i = 0; i < emailContent.length; i++) {
      if (emailContent[i].includes('<div align="left">')) {
        const rowName = emailContent[i].replace(/<[^>]*>?/gm, '');

        if (rowName.includes('Transaction ID')) {
          fpxObj = {
            ...fpxObj,
            fpxTransactionId: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Date')) {
          fpxObj = {
            ...fpxObj,
            dateAndTime: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Seller Name')) {
          fpxObj = {
            ...fpxObj,
            sellerName: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Merchant Order')) {
          fpxObj = {
            ...fpxObj,
            merchantOrderNo: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Seller Order')) {
          fpxObj = {
            ...fpxObj,
            sellerOrderNo: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Buyer')) {
          fpxObj = {
            ...fpxObj,
            buyerBank: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Debit')) {
          fpxObj = {
            ...fpxObj,
            debitStatus: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Credit')) {
          fpxObj = {
            ...fpxObj,
            creditStatus: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        } else if (rowName.includes('Amount')) {
          fpxObj = {
            ...fpxObj,
            transactionAmount: emailContent[i + 4].replace(/<[^>]*>?/gm, ''),
          };
        }
      }
    }

    return Promise.resolve(fpxObj);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'parseFpxEmail',
        email,
      },
      error: err,
    });
    return Promise.reject({ error });
  }
};

const convertEmail = async (
  email: string,
): Promise<{ userEmail: string } | Error> => {
  try {
    let userEmail = _.split(email, '');

    for (let i = 0; i < email.length; i++) {
      if (userEmail[i] == '.') {
        userEmail[i] = '-dot-';
      }

      if (userEmail[i] == '@') {
        userEmail[i] = '-at-';
      }

      if (userEmail[i] == '-') {
        userEmail[i] = '-dash-';
      }
    }

    const convertedEmail = `senangpay+${userEmail.join('')}@parse.gokudos.io`;

    return { userEmail: convertedEmail };
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'convertEmail',
        email,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const checkForCollectionTemplates = async (
  templateId: string,
): Promise<boolean | Error> => {
  try {
    let isCollectionTemplate = false;

    const COLLECTION_TEMPLATES_ID = [
      NOTIFICATION_TYPES.COLLECTION_CREATED.template,
      NOTIFICATION_TYPES.COLLECTION_DUE.template,
      NOTIFICATION_TYPES.COLLECTION_OVERDUE.template,
      // TYPES.RECEIVABLE_PAYMENT_RECEIVED.template,
      // TYPES.RECEIVABLE_PAYMENT_REJECTED.template,
      // TYPES.RECEIVABLE_PAYMENT_REJECTED.template,
      // TYPES.RECEIVABLE_REMINDER_CANCELLED.template,
    ];

    for (let i = 0; i < COLLECTION_TEMPLATES_ID.length; i++) {
      if (templateId == COLLECTION_TEMPLATES_ID[i]) {
        isCollectionTemplate = true;
        break;
      }
    }
    return Promise.resolve(isCollectionTemplate);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'email',
        fnName: 'checkForCollectionTemplates',
        templateId,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

export default {
  sendBasicEmail,
  sendEmail,
  parseIncomingEmail,
  parseSenangPayTo,
  parseSenangPayName,
  redirectEmail,
  convertEmail,
  checkForCollectionTemplates,
};
