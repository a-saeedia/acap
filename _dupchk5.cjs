const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('C:/Users/User/Desktop/a cap/acap/.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
}
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
  await c.connect();
  // Plus users
  const plus = await c.query(`SELECT u.id, u.name, s."acapPlus" FROM "user" u LEFT JOIN subscription s ON s."userId" = u.id WHERE s."acapPlus" = true`);
  console.log('Plus users:', plus.rows.length);
  for (const r of plus.rows) console.log('  ', r.id.slice(0,12), r.name);
  // Replicate getUserSuggestions for the FIRST plus user
  if (plus.rows.length) {
    const uid = plus.rows[0].id;
    const q = await c.query(`SELECT id, title, "isBroadcast", "userId" FROM suggestion WHERE "userId" = $1 OR "isBroadcast" = true ORDER BY "createdAt" DESC`, [uid]);
    console.log(`getUserSuggestions for ${uid.slice(0,12)} -> ${q.rows.length} rows`);
    for (const r of q.rows) console.log('  ', r.id.slice(0,8), '|', r.isBroadcast, '|', r.userId.slice(0,8), '|', r.title.slice(0,35));
  }
  // Any suggestion ids referenced twice anywhere (impossible, but verify no dup ids)
  const dupIds = await c.query(`SELECT id, COUNT(*)::int c FROM suggestion GROUP BY id HAVING COUNT(*) > 1`);
  console.log('duplicate suggestion ids:', dupIds.rows.length);
  await c.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
