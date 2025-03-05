// packages/backend/src/services/dataService.ts
import { pgPool } from '../db/postgres/postgres.db';
import { redis } from '../db/redis/redis.db';
import { promisify } from 'util';

const getAsync = promisify(redis.get).bind(redis);
const setAsync = promisify(redis.set).bind(redis);

export async function getUserData(userId: string) {
  const cacheKey = `user:${userId}`;

  // Check Redis cache first
  const cachedData = await getAsync(cacheKey);
  if (cachedData) {
    console.log('Cache hit for user:', userId);
    return JSON.parse(cachedData);
  }

  // Cache miss: query Postgres
  const client = await pgPool.connect();
  try {
    const res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    const userData = res.rows[0];
    if (!userData) {
      throw new Error('User not found');
    }

    // Store in Redis with a TTL of 1 hour (3600 seconds)
    await setAsync(cacheKey, JSON.stringify(userData), 'EX', 3600);
    console.log('Cache set for user:', userId);
    return userData;
  } finally {
    client.release();
  }
}

export async function updateUserData(userId: string, data: any) {
  const cacheKey = `user:${userId}`;

  // Update Postgres
  const client = await pgPool.connect();
  try {
    await client.query('UPDATE users SET data = $1 WHERE id = $2', [data, userId]);
    // Invalidate or update Redis cache
    await redis.del(cacheKey);
    console.log('Cache invalidated for user:', userId);
  } finally {
    client.release();
  }
}