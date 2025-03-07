//packages/backend/src/redis.session.ts
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { rdc } from '../../db/redis/redis.db';
import { cfg, prod } from '../../util/env';

const redisStore = new RedisStore({
  client: rdc,
  prefix: cfg.redisPrefix,
});

export const express_session = session({
  store: redisStore,
  cookie: {
    secure: prod,
    httpOnly: prod,
    maxAge: cfg.session.age,
  },
  name: cfg.session.name,
  secret: cfg.session.secret,
  saveUninitialized: false,
  resave: false,
});

