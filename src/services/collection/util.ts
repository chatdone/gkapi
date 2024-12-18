import dayjs from 'dayjs';
import async from 'async';
import numeral from 'numeral';

import _ from 'lodash';
export const numberToArray = (num: number): number[] => {
  const ary = [];
  for (let i = 1; i <= num; i++) {
    ary.push(i);
  }
  return ary;
};

export const ringgitRounding = (val: number) => {
  if (val < 0) return 0;
  return Math.round(val * 20) / 20;
};

export const calculateReminderDueDate = (
  currentDueDate: any,
  targetDueDate: any,
) => {
  const due = dayjs(targetDueDate).format('DD');
  return dayjs(currentDueDate).format(`YYYY-MM-${due}`);
};

export const asyncCargo = (size: any) =>
  async.cargo(async (tasks: any, callback: any) => {
    await Promise.all(
      _.map(tasks, async (task) => {
        if (task) await task();
      }),
    );
    callback();
  }, size);

export const parseMoney = (value: number): string =>
  numeral(value).format('0,0.00');
