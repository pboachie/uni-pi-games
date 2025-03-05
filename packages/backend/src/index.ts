// packages/backend/src/index.ts
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { rdc, redis } from './db/redis/redis.db';
import { pgPool } from './db/postgres/postgres.db';
import healthRouter from './routes/health';
import { getUserData } from './services/dataService';
import { waitForServices } from './services/startupService';
import { cfg, prod } from './util/env';

const app = express();
const PORT = cfg.port;

// Connect shared Redis client
redis.connect().catch(console.error);

// Create RedisStore for session storage
const redisStore = new RedisStore({
  client: rdc,
  prefix: cfg.redisPrefix,
});

// Wait for services and start the server
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

    // Sample route using Postgres and Redis
    app.get('/user/:id', async (req, res) => {
      try {
        const userData = await getUserData(req.params.id);
        res.json(userData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ message: errorMessage });
      }
    });

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await rdc.quit();
      await pgPool.end();
      console.log('Redis and Postgres clients closed');
      process.exit(0);
    });

    // Start server
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