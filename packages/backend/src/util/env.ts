export const cfg = {
  session: {
    age: 1000 * 60 * 60 * 24, // 1 day in ms
    name: process.env.SESSION_NAME || 'unipi-session',
    secret: process.env.SESSION_SECRET || 'unipi-session-secret'
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  port: process.env.PORT || 5000,
  redisPrefix: process.env.REDIS_PREFIX || 'unipi:',
};

export const prod = process.env.NODE_ENV === 'production';
