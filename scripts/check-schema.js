const {Pool} = require('pg');
const p = new Pool({connectionString: process.env.DATABASE_URL});
(async () => {
  try {
    const r = await p.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='suggestion' ORDER BY ordinal_position");
    console.log('suggestion columns:');
    r.rows.forEach(c => console.log('  ' + c.column_name + ' (' + c.data_type + ')'));
    
    const a = await p.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='asset' ORDER BY ordinal_position");
    console.log('asset columns:');
    a.rows.forEach(c => console.log('  ' + c.column_name + ' (' + c.data_type + ')'));
  } catch(e) { console.error(e.message); }
  await p.end();
})();
