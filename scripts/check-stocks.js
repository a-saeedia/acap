const {Pool}=require('pg');
const p=new Pool({connectionString:process.env.DATABASE_URL});
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
