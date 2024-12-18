import twilio from 'twilio';
import parsePhoneNumber, { E164Number } from 'libphonenumber-js';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { consoleLog } from '@tools/utils';
import logger from '@tools/logger';

const twilioSmsFrom = process.env.TWILIO_SMS_FROM;
const twilioWhatsappFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

const accountSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const parseMYPhoneNumber = (
  number: string | E164Number,
): Promise<Error | string | E164Number> => {
  try {
    if (typeof number === 'string') {
      const parsed = parsePhoneNumber(number, 'MY');

      if (parsed) return Promise.resolve(parsed.number as string);
    }

    return Promise.resolve(number as string);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'messaging',
        fnName: 'parseMYPhoneNumber',
        number,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

const sendSms = async ({
  body,
  to,
}: {
  body: string;
  to: any;
}): Promise<MessageInstance | Error> => {
  try {
    to = await parseMYPhoneNumber(to);

    const message = await client.messages.create({
      body,
      from: twilioSmsFrom,
      to,
    });

    return message;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'messaging',
        fnName: 'sendSms',
        body,
        to,
      },
      error: err,
    });

    return Promise.reject(error);
  }
};

const sendWhatsapp = async ({
  body,
  to,
}: {
  body: string;
  to: string;
}): Promise<MessageInstance | { errorCode: number } | Error> => {
  try {
    to = `whatsapp:${await parseMYPhoneNumber(to)}`;

    console.log(
      `------- Send WhatsApp To ${to} ${
        process.env.IS_SIMULATE_SEND ? '(Simulated)' : ''
      } -----------`,
    );

    if (process.env.IS_SIMULATE_SEND) {
      consoleLog({ body, to });
      return { errorCode: 0 };
    }

    const message = await client.messages.create({
      body,
      from: twilioWhatsappFrom,
      to,
    });

    return Promise.resolve(message);
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'messaging',
        fnName: 'sendWhatsapp',
        body,
        to,
      },
      error: err,
    });

    return Promise.reject(error);
  }
};

// DO NOT ADJUST MESSAGE CONTENT, IT NEEDS TO FOLLOW THE TEMPLATE IN TWILIO OR ELSE IT WILL NOT SEND
const createCollectionCreatedMessage = async (
  messageType: string,
  data: {
    picName: string;
    refNo: string;
    companyName: string;
    dueType: string;
    title: string;
    amount: string;
    period: string;
    link: string;
    paymentType: boolean;
  },
): Promise<string> => {
  try {
    let message = '';
    if (messageType === 'sms') {
      message = `Hi ${data.picName}, ${data.companyName} has just created a ${
        data.dueType
      } payment invoice as per below:

        Payment Title: ${data.title}
        Invoice number: ${data.refNo}
        Invoice amount: RM${data.amount}
        ${data.period !== '-' ? `Instalment Period: ${data.period}` : ''}
        ${
          data.paymentType
            ? 'Please click on the link to view and make payment for your invoice:'
            : 'Please click on the link to view your invoice:'
        } ${data.link}`;
    } else if (messageType == 'whatsapp') {
      message = `Hi ${data.picName}, *${data.companyName}* has just created a ${data.dueType} payment invoice as per below:

       Payment Title: *${data.title}*
       Invoice number: *${data.refNo}*
       Invoice amount: *RM${data.amount}*
       Instalment period: *${data.period}*

       Please click on the link to view your invoice: ${data.link}`;
    }

    return message;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'messaging',
        fnName: 'createCollectionCreatedMessage',
        messageType,
        data,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

// DO NOT ADJUST MESSAGE CONTENT, IT NEEDS TO FOLLOW THE TEMPLATE IN TWILIO OR ELSE IT WILL NOT SEND
const createCollectionReminderMessage = async (
  paymentType: number,
  messageType: string,
  data: {
    picName: string;
    refNo: string;
    companyName: string;
    dueType: string;
    title: string;
    amount: string;
    period: string;
    link: string;
    date: string;
  },
): Promise<string> => {
  try {
    let message = '';
    if (!data.dueType) {
      message = `Hi ${data.picName}, this is to inform you that ${data.refNo} from ${data.companyName} is due on ${data.date}.

      Payment Title: ${data.title}
      Invoice number: ${data.refNo}
      Invoice amount: RM${data.amount}
      Instalment period: ${data.period}

      Please click ${data.link} to upload payment proof. If payment has been made please disregard this message, thank you.`;
    } else if (messageType == 'whatsapp') {
      message = `Hi ${data.picName}, this is to inform you that *${data.refNo}* from *${data.companyName}* is ${data.dueType}.

      Payment Title: *${data.title}*
      Invoice number: *${data.refNo}*
      Invoice amount: *RM${data.amount}*
      Instalment period: *${data.period}*

      Please click ${data.link} to upload payment proof. If payment has been made please disregard this message, thank you.`;
    }
    return message;
  } catch (error) {
    const err = error as Error;
    logger.logError({
      payload: {
        service: 'messaging',
        fnName: 'createCollectionReminderMessage',
        paymentType,
        messageType,
        data,
      },
      error: err,
    });
    return Promise.reject(error);
  }
};

export default {
  sendSms,
  sendWhatsapp,
  parseMYPhoneNumber,
  createCollectionCreatedMessage,
  createCollectionReminderMessage,
};
