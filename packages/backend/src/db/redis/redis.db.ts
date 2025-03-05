//packages/backend/src/redis.db.ts
// sets up redis connection
import { createClient } from 'redis'
import { cfg } from '../../util/env'
import type { RedisClientType } from 'redis'

export const redis = createClient({ legacyMode: true, url: cfg.redisUrl })

export const rdc = redis as unknown as RedisClientType<any>
