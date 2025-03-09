//packages/backend/src/services/userService.ts
import { pgPool } from '../db/postgres/postgres.db';
import { getCachedData, invalidateCache } from '../util/cache';

// Define the User interface
interface User {
    id: string;
    name: string;
    balance: number;
  }

  /**
   * Fetches a user by ID with caching
   * @param userId The user's ID
   * @returns User object or null if not found
   */
  export async function getUserById(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}`;

    // Define the database fetch function
    const fetchFromDb = async (): Promise<User | null> => {
      try {
        const query = 'SELECT id, name, balance FROM users WHERE id = $1';
        const result = await pgPool.query(query, [userId]);
        return result.rows[0] || null;
      } catch (error) {
        console.error(`Database error fetching user ${userId}:`, error);
        throw error; // Let the caller handle the error
      }
    };

    // Use getCachedData with the fetch function
    return getCachedData<User | null>(
      cacheKey,
      fetchFromDb,
      3600 // 1 hour TTL
    );
  }

  /**
   * Updates a user's balance and invalidates cache
   * @param userId The user's ID
   * @param newBalance The new balance to set
   */
  export async function updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const cacheKey = `user:${userId}`;

    try {
      // Update the database
      const query = 'UPDATE users SET balance = $1 WHERE id = $2';
      await pgPool.query(query, [newBalance, userId]);

      // Invalidate the cache
      await invalidateCache(cacheKey);
    } catch (error) {
      console.error(`Error updating user balance for ${userId}:`, error);
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