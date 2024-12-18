// @ts-nocheck
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import axios from 'axios';

type Auth0UserUtil = {
  sub: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  [key: string]: any[];
};

export const fetchAuth0UserProfile = async (accessToken: string) => {
  try {
    const result = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!result) {
      throw new Error('Could not get profile');
    }

    return result.data as Auth0UserUtil;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const verifyToken = async (bearerToken) => {
  const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  });

  try {
    const getJwksClientKey = (header, callback) => {
      client.getSigningKey(header.kid, (error, key) => {
        const signingKey = key?.publicKey || key?.rsaPublicKey;
        callback(null, signingKey);
      });
    };
    return new Promise((resolve, reject) => {
      jwt.verify(
        bearerToken,
        getJwksClientKey,
        {
          audience: process.env.AUTH0_AUDIENCE,
          issuer: process.env.AUTH0_ISSUER,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) reject(err);
          resolve(decoded);
        },
      );
    });
  } catch (error) {
    console.log('error', error);
    return Promise.reject(error);
  }
};
