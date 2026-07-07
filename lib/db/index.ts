import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5,
  ssl: { rejectUnauthorized: false },
})

// Warm up pool on first import
pool.query('SELECT 1').catch(() => {})

export const db = drizzle(pool, { schema })
