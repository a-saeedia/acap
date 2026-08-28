const { Pool } = require('pg');
const p = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});
(async () => {
  try {
    const a = await p.query('SELECT * FROM signal ORDER BY "publishedAt" DESC');
    console.log('signal rows:', a.rows.length);
    if (a.rows[0]) console.log('first:', JSON.stringify(a.rows[0]).substring(0, 200));
    try {
      const b = await p.query('SELECT * FROM acap_revenue ORDER BY year DESC, month DESC');
      console.log('revenue rows:', b.rows.length);
    } catch (e) { console.log('acap_revenue err:', e.message); }
    const cols = await p.query(`SELECT column_name FROM information_schema.columns WHERE table_name='signal'`);
    console.log('signal columns:', cols.rows.map((c) => c.column_name).join(', '));
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  } finally {
    await p.end();
  }
})();