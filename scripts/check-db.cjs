const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'suggestion' ORDER BY ordinal_position")
.then(r => { console.log(r.rows.map(c => c.column_name).join(',')); pool.end(); })
.catch(e => { console.log('ERR:' + e.message); pool.end(); });
