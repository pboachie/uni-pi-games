// packages/backend/src/services/permissionService.ts
import { pgPool } from '../db/postgres/postgres.db';
import { getCachedData, invalidateCache } from '../util/cache';
import logger from '../util/logger';

/**
 * Retrieves active permissions for a given user using Redis cache.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const cacheKey = `user_permissions:${userId}`;
  logger.info(`Fetching permissions for user: ${userId} from cache [key: ${cacheKey}]`);

  const permissions = await getCachedData<string[]>(
    cacheKey,
    async () => {
      logger.info(`Cache miss for permissions of user: ${userId}. Querying database.`);
      const query = `
        SELECT p.name
        FROM permissions p
        INNER JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = $1 AND p.active = TRUE
      `;
      const result = await pgPool.query(query, [userId]);
      return result.rows.map((row) => row.name);
    },
    1800 // TTL of 30 minutes
  );

  logger.info(`Permissions retrieved for user: ${userId}.`);
  return permissions ?? [];
}

/**
 * Adds a permission to a user.
 * @param addedBy Optional user ID who assigned the permission (default 'system').
 */
export async function addUserPermission(userId: string, permission: string, addedBy: string = 'system'): Promise<void> {
  logger.info(`Attempting to add permission: "${permission}" to user: ${userId} by ${addedBy}`);

  // Ensure permission exists; store who added it and update modified date on conflict.
  const permResult = await pgPool.query(
    `INSERT INTO permissions (name, created_by)
     VALUES ($1, $2)
     ON CONFLICT (name)
     DO UPDATE SET updated_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [permission, addedBy]
  );
  const permissionId = permResult.rows[0].id;

  // Insert into user_permissions with an audit field
  await pgPool.query(
    `INSERT INTO user_permissions (user_id, permission_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, permissionId, addedBy]
  );

  // Invalidate cached permissions for this user
  await invalidateCache(`user_permissions:${userId}`);
  logger.info(`Permission: "${permission}" added to user: ${userId} and cache invalidated.`);
}

/**
 * Removes a permission from a user.
 */
export async function removeUserPermission(userId: string, permission: string): Promise<void> {
  logger.info(`Attempting to remove permission: "${permission}" from user: ${userId}`);

  const permResult = await pgPool.query(
    'SELECT id FROM permissions WHERE name = $1',
    [permission]
  );
  if (permResult.rowCount === 0) {
    logger.warn(`Permission: "${permission}" not found for removal for user: ${userId}`);
    return;
  }
  const permissionId = permResult.rows[0].id;

  await pgPool.query(
    'DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2',
    [userId, permissionId]
  );

  // Invalidate cached permissions for this user
  await invalidateCache(`user_permissions:${userId}`);
  logger.info(`Permission: "${permission}" removed from user: ${userId} and cache invalidated.`);
}
