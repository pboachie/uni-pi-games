//packages/backend/src/util/env.ts

interface Config {
  session: {
    age: number;
    name: string;
    secret: string;
  };
  redisUrl: string;
  postgresUrl: string;
  port: string | number;
  redisPrefix: string;
  postgresPool: {
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  piNetwork: {
    baseURL: string;
  };
  jwt: {
    privateKey?: string;
    publicKey?: string;
    issuer: string;
    audience: string;
    expiration: string;
  };
}

export const cfg: Config = {
  session: {
    age: 1000 * 60 * 60 * 24, // 1 day in ms
    name: process.env.SESSION_NAME || 'unipi-session',
    secret: process.env.SESSION_SECRET || 'unipi-session-secret',
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  postgresUrl:
  process.env.DATABASE_URL || 'postgres://uniPiAdmin:YourStrongPasswordHere@postgres:5432/unipi',
  port: process.env.PORT || 5000,
  redisPrefix: process.env.REDIS_PREFIX || 'unipi:',
  postgresPool: {
    max: Number(process.env.PG_POOL_MAX) || 20,
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MILLIS) || 30000,
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MILLIS) || 5000,
  },
  piNetwork: {
    baseURL: process.env.PI_BASE_URL || 'https://api.minepi.com/v2',
  },
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    publicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n'),
    issuer: process.env.JWT_ISSUER || 'uni-pi-games-platform',
    audience: process.env.JWT_AUDIENCE || 'uni-pi-users',
    expiration: process.env.JWT_EXPIRES_IN || '15m',
  },
};

export const prod = process.env.NODE_ENV === 'production';