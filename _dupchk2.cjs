const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('C:/Users/User/Desktop/a cap/acap/.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
}
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
  await c.connect();
  // ALL suggestions in last 3 days
  const sug = await c.query(`SELECT id, title, "createdAt", "userId", "isBroadcast" FROM suggestion WHERE "createdAt" > now() - interval '3 days' ORDER BY "createdAt" DESC`);
  console.log('suggestions last 3 days:', sug.rows.length);
  for (const r of sug.rows) console.log('  ', r.createdAt, '|', r.isBroadcast, '|', r.title.slice(0, 40));
  // Signal table last 3 days
  const sig = await c.query(`SELECT id, title, "publishedAt" FROM signal WHERE "publishedAt" > now() - interval '3 days' ORDER BY "publishedAt" DESC`);
  console.log('signal table last 3 days:', sig.rows.length);
  for (const r of sig.rows) console.log('  ', r.publishedAt, '|', r.title.slice(0, 40));
  await c.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
