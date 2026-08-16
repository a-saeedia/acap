const {Pool} = require('pg');
const p = new Pool({connectionString: process.env.DATABASE_URL});
(async()=>{
const r = await p.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='subscription' ORDER BY ordinal_position");
r.rows.forEach(c => console.log(c.column_name + ' (' + c.data_type + ')'));
await p.end()
})()
