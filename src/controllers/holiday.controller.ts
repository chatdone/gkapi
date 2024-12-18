import { HolidayService } from '@services';
import { Request, Response } from 'express';
import joi, { string } from 'joi';
import { StatusCodes } from 'http-status-codes';

const updatePublicHolidays = async (req: Request, res: Response) => {
  try {
    const schema = joi.object({
      year: joi.number().required(),
      country_code: joi.string().required(),
    });

    const payload = await schema.validateAsync(req.body);

    const response = await HolidayService.updatePublicHolidays(payload);
    return res.status(StatusCodes.OK).json({ data: response });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
  }
};

export default { updatePublicHolidays };
