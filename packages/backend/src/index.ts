// packages/backend/src/index.ts
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { rdc, redis } from './db/redis/redis.db';
import healthRouter from './routes/health';
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  rdc.quit().then(() => {
    console.log('Redis client closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;