//packages/backend/src/services/userService.ts
import { pgPool } from '../db/postgres/postgres.db';
import { getCachedData, invalidateCache } from '../util/cache';

export async function getUserData(userId: string) {
  const key = `user:${userId}`;
  return getCachedData(key, async () => {
    const result = await pgPool.query('SELECT data FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.data || null;
  });
}

export async function updateUserData(userId: string, newData: any) {
  const key = `user:${userId}`;
  await pgPool.query('UPDATE users SET data = $1 WHERE id = $2', [newData, userId]);
  await invalidateCache(key); // Invalidate cache after update
}