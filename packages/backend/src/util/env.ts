export const cfg = {
  session: {
    age: 1000 * 60 * 60 * 24, // 1 day in ms
    name: process.env.SESSION_NAME || 'unipi-session',
    secret: process.env.SESSION_SECRET || 'unipi-session-secret'
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  postgresUrl: process.env.DATABASE_URL || 'postgres://uniPiAdmin:YourStrongPasswordHere@postgres:5432/unipi',
  port: process.env.PORT || 5000,
  redisPrefix: process.env.REDIS_PREFIX || 'unipi:',
  postgresPool: {
    max: Number(process.env.PG_POOL_MAX) || 20, // Max connections in the pool
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MILLIS) || 30000, // Close idle connections after 30s
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MILLIS) || 2000, // Timeout for acquiring a connection
  },
};

export const prod = process.env.NODE_ENV === 'production';
