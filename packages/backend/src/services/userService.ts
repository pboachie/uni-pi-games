//packages/backend/src/services/userService.ts
import { pgPool } from '../db/postgres/postgres.db';
import { getCachedData, invalidateCache } from '../util/cache';
import logger from '../util/logger';

// Define the User interface
interface User {
  id: string;
  name: string;
  balance: number;
}

/**
 * Fetches a user by ID with caching.
 * Reads "name" and "balance" from the JSONB column "data".
 */
export async function getUserById(userId: string): Promise<User | null> {
  const cacheKey = `user:${userId}`;

  const fetchFromDb = async (): Promise<User | null> => {
    try {
      const query = `
        SELECT id,
          data->>'name' as name,
          (data->>'balance')::numeric as balance
        FROM users
        WHERE id = $1
      `;
      const result = await pgPool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Database error fetching user ${userId}:`, error);
      throw error;
    }
  };

  return getCachedData<User | null>(
    cacheKey,
    fetchFromDb,
    3600 // 1 hour TTL
  );
}

/**
 * Updates a user's balance stored inside the JSONB "data" column and invalidates cache.
 */
export async function updateUserBalance(userId: string, newBalance: number): Promise<void> {
  const cacheKey = `user:${userId}`;
  try {
    logger.info(`Updating balance for user ${userId} to ${newBalance}`);
    const query = `
      UPDATE users
      SET data = jsonb_set(data, '{balance}', to_jsonb($1::numeric), true)
      WHERE id = $2
    `;
    await pgPool.query(query, [newBalance, userId]);
    logger.info(`Balance updated in database for user ${userId}`);
    await invalidateCache(cacheKey);
    logger.info(`Cache invalidated for user ${userId}`);
  } catch (error) {
    logger.error(`Error updating user balance for ${userId}: ${error}`);
    throw error;
  }
}

export async function upsertUser(user: { uid: string; [key: string]: any }): Promise<void> {
  await pgPool.query(
    `INSERT INTO users (id, data, created_at, last_login)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (id)
     DO UPDATE SET last_login = NOW()`,
    [user.uid, JSON.stringify(user)]
  );
}