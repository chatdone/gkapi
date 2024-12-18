import StatusCodes from 'http-status-codes';
import dotenv from 'dotenv';
dotenv.config();
import _ from 'lodash';
import { EmailService } from '@services';
import { Request, Response } from 'express';

const parseIncomingEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const result = await EmailService.parseIncomingEmail(req.body);

    return res.status(StatusCodes.OK).json({ body: result });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const convertEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const query = _.get(req, 'query');
    const email = _.get(query, 'email');
    const result = await EmailService.convertEmail(email as string);

    return res.status(StatusCodes.OK).json({ body: result });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};
export default {
  parseIncomingEmail,
  convertEmail,
};
