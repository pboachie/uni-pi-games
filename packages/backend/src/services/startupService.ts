// packages/backend/src/services/startupService.ts
import { redis } from '../db/redis/redis.db';
import { pgPool } from '../db/postgres/postgres.db';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForServices(maxAttempts = 10, interval = 2000) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      // Check Redis
      if (!redis.isOpen) {
          throw new Error('Redis not ready');
      }

      // Check Postgres
      const client = await pgPool.connect();
      await client.query('SELECT 1');
      client.release();

      console.log('All services are ready');
      return;
    } catch (err) {
      attempts++;
      console.log(`Services not ready (attempt ${attempts}/${maxAttempts}):`, err instanceof Error ? err.message : err);
      if (attempts >= maxAttempts) {
        throw new Error('Services did not become ready in time');
      }
      await sleep(interval);
    }
  }
}