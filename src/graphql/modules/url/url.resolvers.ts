import { Resolvers } from '@generated/graphql-types';
import { UrlService } from '@services';
import { handleResolverError } from '@graphql/errors';
import { DataLoaders } from '@models/common.model';
import { BreadcrumbInfoModel, ShortUrlModel } from '@models/url.model';

export const resolvers: Resolvers = {
  Query: {
    shortUrl: async (
      root,
      { shortId },
      { loaders }: { loaders: DataLoaders },
    ) => {
      try {
        const url = (await loaders.getShortUrl.load(shortId)) as ShortUrlModel;
        return url;
      } catch (error) {
        handleResolverError(error);
      }
    },
    breadcrumbInfo: async (root, { id, type }, { loaders }) => {
      try {
        const res = (await UrlService.getBreadcrumbInfo(
          id,
          loaders,
          type,
        )) as BreadcrumbInfoModel;
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
  },
  ShortUrl: {
    full_url: ({ url }) => `${process.env.WEBSITE_URL}${url}`,
  },
  Mutation: {
    createShortUrl: async (root, { url }) => {
      try {
        const res = await UrlService.createShortUrl(url);
        return res;
      } catch (error) {
        handleResolverError(error);
      }
    },
  },
};
