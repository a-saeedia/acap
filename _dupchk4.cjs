const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('C:/Users/User/Desktop/a cap/acap/.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
}
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
  await c.connect();
  const cols = await c.query(`SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='suggestion' ORDER BY ordinal_position`);
  console.log('suggestion columns:');
  for (const r of cols.rows) console.log('  ', r.column_name, '|', r.data_type, '|', r.column_default || '');
  const idx = await c.query(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename='suggestion'`);
  console.log('indexes:');
  for (const r of idx.rows) console.log('  ', r.indexname);
  const triggers = await c.query(`SELECT tgname FROM pg_trigger WHERE tgrelid = 'suggestion'::regclass AND NOT tgisinternal`);
  console.log('triggers:', triggers.rows.length);
  const subCount = await c.query(`SELECT "userId", COUNT(*)::int c FROM subscription GROUP BY "userId" HAVING COUNT(*) > 1`);
  console.log('duplicate subscription rows:', subCount.rows.length);
  await c.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
