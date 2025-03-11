// packages/backend/src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { rdc, redis } from './db/redis/redis.db';
import { pgPool } from './db/postgres/postgres.db';
import healthRouter from './routes/health';
import piAuthRouter from './routes/authRouter';
import piPaymentRouter from './routes/piPaymentRouter';
import userRouter from './routes/userRouter';
import { waitForServices } from './services/startupService';
import { cfg, prod } from './util/env';
import logger from './util/logger';

const app = express();
const PORT = cfg.port;

redis.connect().catch(logger.error);

const redisStore = new RedisStore({
  client: rdc,
  prefix: cfg.redisPrefix,
});

async function startServer() {
  try {
    await waitForServices();
    logger.info('Services are ready, starting server...');

    app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(
      session({
        store: redisStore,
        secret: cfg.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: prod,
          maxAge: cfg.session.age,
        },
      })
    );

    app.use('/health', healthRouter);
    app.use('/auth', piAuthRouter);
    app.use('/incomplete_server_payment', piPaymentRouter);
    app.use('/api/users', userRouter);

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      await rdc.quit();
      await pgPool.end();
      logger.info('Redis and Postgres clients closed');
      process.exit(0);
    });

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;