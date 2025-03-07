// packages/backend/src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { rdc, redis } from './db/redis/redis.db';
import { pgPool } from './db/postgres/postgres.db';
import healthRouter from './routes/health';
import piAuthRouter from './routes/authRouter';
import piPaymentRouter from './routes/piPaymentRouter';
import tokenRouter from './routes/tokenRouter';
import { getUserData } from './services/dataService';
import { waitForServices } from './services/startupService';
import { cfg, prod } from './util/env';
import { authMiddleware, AuthRequest } from './middleware/auth';

const app = express();
const PORT = cfg.port;

redis.connect().catch(console.error);

const redisStore = new RedisStore({
  client: rdc,
  prefix: cfg.redisPrefix,
});

async function startServer() {
  try {
    await waitForServices();
    console.log('Services are ready, starting server...');

    app.use(cors());
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
    app.use('/auth', tokenRouter);

    // User data route
    app.get(
      '/user/:id',
      async (req: Request<{ id: string }>, res: Response) => {
        try {
          const userData = await getUserData(req.params.id);
          res.json(userData);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'An unknown error occurred';
          res.status(500).json({ message: errorMessage });
        }
      }
    );

    // Add user balance route (assuming getUserData returns balance)
    app.get(
      '/api/user-balance',
      authMiddleware,
      async (req: AuthRequest, res: Response): Promise<void> => {
        try {
          const userId = req.user?.uid;
          if (!userId) {
            res.status(400).json({ message: 'User ID not found' });
            return;
          }
          // Replace with your actual user data retrieval logic
          const userData = { balance: 100 }; // Placeholder
          res.json({ balance: userData.balance || 0 });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          res.status(500).json({ message: errorMessage });
        }
      }
    );

    app.use((err: any, req: express.Request, res: express.Response) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await rdc.quit();
      await pgPool.end();
      console.log('Redis and Postgres clients closed');
      process.exit(0);
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;