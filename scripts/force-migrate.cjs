const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });

pool.query("ALTER TABLE suggestion ADD COLUMN IF NOT EXISTS profit_percent real, ADD COLUMN IF NOT EXISTS profit_message text")
.then(() => pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'suggestion' ORDER BY ordinal_position"))
.then(r => {
  console.log('OK: ' + r.rows.map(c => c.column_name + ':' + c.data_type).join(' | '));
  pool.end();
})
.catch(e => {
  console.log('FAIL: ' + e.message);
  pool.end();
});
