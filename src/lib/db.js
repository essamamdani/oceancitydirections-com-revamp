import { Pool } from 'pg';
import logger from '@/lib/logger'


let pool;

export function getDbPool() {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is missing');
    }
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased from 2000 to 10000
    });
  }
  return pool;
}

/**
 * Execute a SQL query against the Auth Database
 */
export async function query(text, params) {
  const start = Date.now();
  const dbPool = getDbPool();
  try {
    const res = await dbPool.query(text, params);
    const duration = Date.now() - start;
    logger.log('[DB] Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('[DB] Query error', err);
    throw err;
  }
}

/**
 * Transaction helper
 */
export async function transaction(callback) {
  const dbPool = getDbPool();
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
