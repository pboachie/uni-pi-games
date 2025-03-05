//packages/backend/src/db/postgres/postgres.db.ts
import { Pool } from 'pg';
import { cfg } from '../../util/env';

export const pgPool = new Pool({
  connectionString: cfg.postgresUrl,
  max: cfg.postgresPool.max,
  idleTimeoutMillis: cfg.postgresPool.idleTimeoutMillis,
  connectionTimeoutMillis: cfg.postgresPool.connectionTimeoutMillis,
});

pgPool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(-1);
});

pgPool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to Postgres:', err.stack);
    return;
  }
  console.log('Connected to Postgres successfully');
  release();
});

export default pgPool;
