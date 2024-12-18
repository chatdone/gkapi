import { createLoaders, UserStore } from '@data-access';
import { DataLoaders } from '@models/common.model';
import { Auth0TokenPayload, UserModel } from '@models/user.model';
import { AuthenticationError } from 'apollo-server-errors';
import knex from '@db/knex';
import _ from 'lodash';
import { camelize } from '@data-access/utils';
import { verifyToken } from '@utils/auth0.util';
import { TableNames } from '@db-tables';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Request } from 'express';

export type AuthContextPayload = {
  isAuthenticated: boolean;
  authPayload: Auth0TokenPayload;
  user: UserModel | null;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const authContext = async ({ req, ...rest }: { req: Request }) => {
  let isAuthenticated = false;
  let authPayload = null;
  let user = null;
  const loaders: DataLoaders = createLoaders();

  if (
    process.env.NODE_ENV === 'development' &&
    process.env.BYPASS_GRAPHQL_AUTH
  ) {
    return {
      ...rest,
      req,
      loaders,
      auth: {
        isAuthenticated: true,
        auth0user: null,
        user: await loaders.users.load(process.env.USER_PUBLIC_ID || ''),
      },
    };
  }
  try {
    const authHeader = req.headers.authorization || '';

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyToken(token);
      isAuthenticated = payload ? true : false;
      authPayload = payload as Auth0TokenPayload;

      const userProfile = (await UserStore.getUserWithCompaniesByEmail(
        authPayload.email,
      )) as UserModel;

      let activeCompany = null;
      if (req.headers['x-company-id']) {
        const cid = req.headers['x-company-id'];
        const company = _.head(
          await knex.from(TableNames.COMPANIES).where('id_text', cid).select(),
        );

        if (company) {
          activeCompany = company.id;
        }
      }

      const roles = _.get(authPayload, 'https://api.gokudos.io/roles') || [];

      if (userProfile) {
        const appendedProfile = {
          ...userProfile,
          company_uuids: userProfile.company_uuids
            ? userProfile.company_uuids
            : [],
          companyUuids: userProfile.company_uuids
            ? userProfile.company_uuids
            : [],
          company_ids: userProfile.company_ids ? userProfile.company_ids : [],
          companyIds: userProfile.company_ids ? userProfile.company_ids : [],
          active_company: activeCompany,
          activeCompany: activeCompany,
          roles,
          isAdmin: roles.includes('AdminPanelUser'),
        };

        user = camelize(appendedProfile);
      }
    }
  } catch (error) {
    console.error(error);
    if (error instanceof JsonWebTokenError) {
      throw new AuthenticationError(error.message);
    }
  }
  const auth: AuthContextPayload = {
    isAuthenticated,
    authPayload: authPayload as Auth0TokenPayload,
    user,
  };
  return {
    ...rest,
    req,
    loaders,
    auth,
  };
};

export default authContext;
