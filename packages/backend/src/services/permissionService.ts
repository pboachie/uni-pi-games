//packages/backend/src/services/permissionService.ts
import { pgPool } from '../db/postgres/postgres.db';

/**
 * Retrieves permissions for a given user.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const query = `
    SELECT p.name
    FROM permissions p
    INNER JOIN user_permissions up ON p.id = up.permission_id
    WHERE up.user_id = $1
  `;
  const result = await pgPool.query(query, [userId]);
  return result.rows.map((row) => row.name);
}

/**
 * Adds a permission to a user.
 */
export async function addUserPermission(userId: string, permission: string): Promise<void> {
  // Ensure permission exists
  const permResult = await pgPool.query(
    'INSERT INTO permissions (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
    [permission]
  );
  const permissionId = permResult.rows[0].id;

  await pgPool.query(
    'INSERT INTO user_permissions (user_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, permissionId]
  );
}

/**
 * Removes a permission from a user.
 */
export async function removeUserPermission(userId: string, permission: string): Promise<void> {
  const permResult = await pgPool.query(
    'SELECT id FROM permissions WHERE name = $1',
    [permission]
  );
  if (permResult.rowCount === 0) return;
  const permissionId = permResult.rows[0].id;
  await pgPool.query(
    'DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2',
    [userId, permissionId]
  );
}
