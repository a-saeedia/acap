const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('C:/Users/User/Desktop/a cap/acap/.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
}
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
  await c.connect();
  const sig = await c.query(`SELECT title, COUNT(*)::int c FROM signal GROUP BY title HAVING COUNT(*) > 1`);
  console.log('signal table dup titles:', sig.rows.length);
  for (const r of sig.rows) console.log('  ', r.c, 'x', r.title);
  const all = await c.query(`SELECT id, title, symbol, "publishedAt" FROM signal ORDER BY "publishedAt" DESC LIMIT 10`);
  console.log('all signals:');
  for (const r of all.rows) console.log('  ', r.title.slice(0,45), '|', r.symbol, '|', r.publishedAt);
  await c.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
