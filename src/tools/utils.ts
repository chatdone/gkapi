import dayjs, { Dayjs } from 'dayjs';
import { Response } from 'express';
import mime from 'mime';
import _ from 'lodash';
export const setFileResHeader = ({
  res,
  fileName,
}: {
  res: Response;
  fileName: string;
}): void => {
  const extension = getExtensionFromString(fileName);
  const contentType = mime.lookup(extension);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
};

export const getExtensionFromString = (val: string) => {
  const re = /(?:\.([^.]+))?$/;
  return re.exec(val)![1];
};

type DateDurationProps = {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
  years: number;
};

export const getDateDuration = (
  startDate: Dayjs,
  endDate: Dayjs | string,
): DateDurationProps => {
  const start = dayjs(startDate); // eslint-disable-line no-param-reassign
  const end = dayjs(endDate); // eslint-disable-line no-param-reassign

  const result = {
    seconds: start.diff(end, 'seconds'),
    minutes: start.diff(end, 'minutes'),
    hours: start.diff(end, 'hours'),
    days: start.diff(end, 'days'),
    weeks: start.diff(end, 'weeks'),
    months: start.diff(end, 'months'),
    years: start.diff(end, 'years'),
  };

  return result;
};

export const getConstantNameByValue = (
  constant: any,
  value: any,
  { object = false } = {},
) => {
  const key = _.findKey(
    constant,
    (o) => _.get(o, 'value', o) === value,
  ) as string;
  if (object) return constant[key];
  if (_.has(constant[key], 'name')) return constant[key].name;
  return _.startCase(_.toLower(key));
};

export const consoleLog = (message: unknown, message2?: unknown): void => {
  if (process.env.LOG_THIS_OUT) {
    if (message2) {
      console.log(message, message2);
    } else {
      console.log(message);
    }
  }
};
