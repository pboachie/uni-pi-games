//packages/backend/src/redis.db.ts
// sets up redis connection
import { createClient } from 'redis'
import { cfg } from '../../util/env'

export const redis = createClient({ url: cfg.redisUrl })

export const rdc = redis
