//packages/backend/src/util/cache.ts
import { rdc } from '../db/redis/redis.db';
import { pgPool } from '../db/postgres/postgres.db';

export async function getCachedData<T>(
  key: string,
  fetchFromDb: () => Promise<T>,
  ttl: number = 3600 // Default TTL: 1 hour
): Promise<T | null> {
  try {
    const cached = await rdc.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    const data = await fetchFromDb();
    if (data) {
      await rdc.set(key, JSON.stringify(data), { EX: ttl });
    }
    return data;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    return fetchFromDb(); // Fallback to database if Redis fails
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await rdc.del(key);
  } catch (error) {
    console.error(`Error invalidating cache for key ${key}:`, error);
  }
}