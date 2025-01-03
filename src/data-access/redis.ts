import Redis from 'ioredis';

let redis: Redis | null = null;

const KEY_EXPIRY_TTL = 60 * 5; // 5 minutes

if (process.env.USE_REDIS === 'true') {
  redis = new Redis({
    port: +(process.env.REDIS_PORT || 6379),
    host: '127.0.0.1',
  });
}

const makeRedisKey = (key: string) => `${process.env.GK_ENVIRONMENT}:${key}`;

const get = async (key: string) => {
  if (!redis) {
    return null;
  }

  try {
    const value = await redis.get(makeRedisKey(key));
    if (value) {
      return JSON.parse(value);
    } else {
      return null;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const set = async (key: string, value: any) => {
  if (!redis) {
    return null;
  }

  try {
    const result = await redis.set(makeRedisKey(key), JSON.stringify(value));
    await redis.expire(makeRedisKey(key), KEY_EXPIRY_TTL);

    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

const setNeverExpire = async (key: string, value: any) => {
  if (!redis) {
    return null;
  }

  try {
    await redis.set(makeRedisKey(key), JSON.stringify(value));

    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getKeysByPattern = (key: string) => {
  return new Promise((resolve, reject) => {
    if (!redis) {
      return null;
    }
    const stream = redis.scanStream({
      match: key,
      count: 100,
    });

    const keys: string[] = [];
    stream.on('data', function (resultKeys) {
      for (var i = 0; i < resultKeys.length; i++) {
        keys.push(resultKeys[i]);
      }
    });
    stream.on('end', function () {
      resolve(keys);
    });
  });
};

// NOTE: This should not be awaited, as it is a background process
const deleteKeysByPattern = (key: string) => {
  if (!redis) {
    return null;
  }
  const stream = redis.scanStream({
    match: key,
    count: 100,
  });

  const keys: string[] = [];
  stream.on('data', function (resultKeys) {
    for (var i = 0; i < resultKeys.length; i++) {
      keys.push(resultKeys[i]);
    }
  });
  stream.on('end', function () {
    if (keys.length) {
      redis && redis.unlink(keys);
    }
  });
};

// NOTE: This should not be awaited, as it is a background process
const batchDeleteKeysByPattern = (key: string) => {
  if (!redis) {
    return null;
  }
  var stream = redis.scanStream({
    match: key,
    count: 100,
  });

  stream.on('data', function (resultKeys) {
    if (resultKeys.length) {
      redis && redis.unlink(resultKeys);
    }
  });
};

export default {
  get,
  set,
  setNeverExpire,
  getKeysByPattern,
  deleteKeysByPattern,
  batchDeleteKeysByPattern,
};
