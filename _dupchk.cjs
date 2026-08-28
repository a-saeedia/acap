const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('C:/Users/User/Desktop/a cap/acap/.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
}
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
  await c.connect();
  // Duplicate broadcast suggestions by title
  const dupes = await c.query(`
    SELECT title, COUNT(*)::int c FROM suggestion
    WHERE "isBroadcast" = true GROUP BY title HAVING COUNT(*) > 1 ORDER BY c DESC LIMIT 10
  `);
  console.log('duplicate broadcast titles:', dupes.rows.length);
  for (const r of dupes.rows) console.log('  ', r.c, 'x', r.title);
  // Recent broadcasts
  const rec = await c.query(`SELECT id, title, "createdAt", "userId", "adminId" FROM suggestion WHERE "isBroadcast" = true ORDER BY "createdAt" DESC LIMIT 6`);
  console.log('recent broadcasts:');
  for (const r of rec.rows) console.log('  ', r.title, '|', r.createdAt, '| userId=', r.userId, '| adminId=', r.adminId);
  // Check suggestion table schema for isBroadcast default
  const cols = await c.query(`SELECT column_name, column_default FROM information_schema.columns WHERE table_name='suggestion' AND column_name IN ('isBroadcast','userId','adminId','isRead')`);
  console.log('suggestion cols:', cols.rows.map(r=>r.column_name+'='+(r.column_default||'-')).join(', '));
  await c.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
