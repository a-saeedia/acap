import { Pool } from 'pg';
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_7cDmedLMV9TH@ep-cool-rice-ad08tjh2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });
try {
  const r = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log(r.rows.map(x => x.table_name).sort().join('\n'));
} catch(e) {
  console.error(e.message);
}
await pool.end();
