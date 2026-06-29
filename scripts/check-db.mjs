import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
try {
  await pool.query("ALTER TABLE suggestion ADD COLUMN IF NOT EXISTS profit_percent real, ADD COLUMN IF NOT EXISTS profit_message text")
  const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'suggestion' ORDER BY ordinal_position")
  console.log('COLUMNS:', r.rows.map(c => c.column_name).join(','))
} catch (e) {
  console.log('ERROR:', e.message)
}
await pool.end()
