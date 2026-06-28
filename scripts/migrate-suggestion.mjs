import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
await pool.query('ALTER TABLE suggestion ADD COLUMN IF NOT EXISTS profit_percent real, ADD COLUMN IF NOT EXISTS profit_message text')
console.log('Migration done')
await pool.end()
