const {Pool}=require('pg');
const p=new Pool({connectionString:'postgresql://neondb_owner:npg_7cDmedLMV9TH@ep-cool-rice-ad08tjh2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'});
(async()=>{
try{
  const r=await p.query('SELECT count(*) FROM iran_stock');
  console.log('stock count:',r.rows[0].count);
  const r2=await p.query('SELECT count(*) FROM asset_price');
  console.log('asset_price count:',r2.rows[0].count);
  const r3=await p.query("SELECT symbol,price FROM asset_price WHERE symbol='USDT-IRR' LIMIT 1");
  console.log('USDT-IRR:',r3.rows.length?r3.rows[0]:'NONE');
}catch(e){console.error('err:',e.message)}
await p.end()
})()
