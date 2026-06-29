const {Pool} = require('pg');
const p = new Pool({connectionString: 'postgresql://neondb_owner:npg_7cDmedLMV9TH@ep-cool-rice-ad08tjh2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'});
(async()=>{
const r = await p.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='subscription' ORDER BY ordinal_position");
r.rows.forEach(c => console.log(c.column_name + ' (' + c.data_type + ')'));
await p.end()
})()
