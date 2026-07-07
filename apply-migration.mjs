import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const envPath = resolve(__dirname, '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  let value = trimmed.slice(eqIdx + 1)
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  }
  process.env[key] = value
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()

try {
  const sql = readFileSync(resolve(__dirname, 'drizzle/0004_optimal_christian_walker.sql'), 'utf-8')
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)
  for (const stmt of statements) {
    console.log('Executing:', stmt.slice(0, 80))
    await client.query(stmt)
  }
  console.log('Migration 0004 applied successfully')
} catch (e) {
  console.error('Migration failed:', e.message)
} finally {
  client.release()
  await pool.end()
}
