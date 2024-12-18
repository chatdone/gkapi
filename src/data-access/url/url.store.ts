import knex from '@db/knex';
import { ShortUrlModel } from '@models/url.model';
import _ from 'lodash';

const getByShortId = async (
  shortId: string,
): Promise<ShortUrlModel | Error> => {
  try {
    const res = await knex
      .from('short_urls')
      .where('short_id', shortId)
      .select();

    return _.head(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const createShortId = async ({
  shortId,
  url,
}: {
  shortId: string;
  url: string;
}): Promise<ShortUrlModel | Error> => {
  try {
    const insert = await knex('short_urls').insert({
      url,
      short_id: shortId,
      active: 1,
    });

    const res = await knex
      .from('short_urls')
      .where('id', _.head(insert))
      .select();
    return _.head(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default {
  getByShortId,
  createShortId,
};
