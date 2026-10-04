const fs = require('node:fs');
const path = require('node:path');
const {Client} = require('../../backend2.0/node_modules/pg');
require('../../backend2.0/node_modules/pg').types.setTypeParser(1082,v=>v);
const root = path.resolve(__dirname,'../..');
const env = {};
for (const line of fs.readFileSync(path.join(root,'backend2.0/.env'),'utf8').split(/\r?\n/)) {
  const m=line.match(/^([A-Z0-9_]+)=(.*)$/); if(m) env[m[1]]=m[2].trim().replace(/^(['"])(.*)\1$/,'$2');
}
const truth = v=>['true','1','yes','on','require','verify-ca','verify-full'].includes(String(v).toLowerCase());
const u=env.DB_URL?new URL(env.DB_URL):null;
const config=u?{host:u.hostname,port:Number(u.port)||5432,user:decodeURIComponent(u.username),password:decodeURIComponent(u.password),database:u.pathname.slice(1)}:{host:env.DB_HOST,port:Number(env.DB_PORT)||5432,user:env.DB_USERNAME,password:env.DB_PASSWORD,database:env.DB_DATABASE};
if(truth(env.DB_SSL)||(u?.searchParams.get('sslmode')&&u.searchParams.get('sslmode')!=='disable'))config.ssl={rejectUnauthorized:truth(env.DB_SSL_REJECT_UNAUTHORIZED)};
config.connectionTimeoutMillis=15000;
config.options='-c statement_timeout=30000';
const {matchPort}=require('./port-match.cjs');
const pairs=[['port_of_loading_id','port_of_loading_name'],['port_of_discharge_id','port_of_discharge_name'],['place_of_receipt_port_id','place_of_receipt_name'],['place_of_delivery_port_id','place_of_delivery_name'],['place_of_issue_port_id','place_of_issue_name'],['pickup_port_id','pickup_place_name'],['dropoff_port_id','dropoff_place_name'],['transit_port_id','transit_port_name']];
async function main(){const c=new Client(config);await c.connect();const apply=process.argv.includes('--apply');
try {await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ'+(apply?'':' READ ONLY'));
const ports=(await c.query('SELECT id,name,sub_name_1,sub_name_2,code,country_code,is_active FROM ports')).rows;
const rows=(await c.query('SELECT * FROM booking_records WHERE deleted_at IS NULL ORDER BY id')).rows;
const summary=async()=> (await c.query('SELECT booking_flow,count(*)::int as bookings,sum(planned_teu)::text as booked,sum(actual_teu)::text as actual FROM booking_reporting_v1 GROUP BY booking_flow ORDER BY booking_flow')).rows;
const before=await summary();const changes=[],unresolved=[];
for(const b of rows){const updates=[];for(const [idField,nameField] of pairs){
 const val=b[nameField];const item={bookingId:b.id,bookingNumber:b.booking_number,flow:b.booking_flow,field:idField,value:val,before:b[idField],versionBefore:b.version};
 if(b[idField]!=null){if(!ports.some(p=>p.id===Number(b[idField])))unresolved.push({...item,reason:'invalid existing ID'});continue;}
 if(!val?.trim())continue;
 const match=matchPort(val,ports);if(!match.id){unresolved.push({...item,...match});continue;}
 updates.push({...item,after:match.id});}
 if(updates.length){if(apply){const values=updates.map(u=>u.after);values.push(b.id,b.version);
 const result=await c.query('UPDATE booking_records SET '+updates.map((u,i)=>u.field+'=$'+(i+1)).join(',')+',version=version+1,updated_at=now() WHERE id=$'+(values.length-1)+' AND version=$'+values.length+' AND deleted_at IS NULL RETURNING version',values);
 if(result.rowCount!==1)throw Error('Concurrent change for booking '+b.id);}
 changes.push(...updates.map(u=>({...u,versionAfter:apply?b.version+1:b.version})));}}
 const after=await summary();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Booking or TEU totals changed');
 const report={mode:apply?'applied':'dry-run',at:new Date().toISOString(),bookingsScanned:rows.length,bookingsUpdated:new Set(changes.map(x=>x.bookingId)).size,fieldsUpdated:changes.length,before,after,changes,unresolved};
 const dest=path.join(root,'docs/reports/logistics-q2-2026/port-id-'+(apply?'applied':'audit')+'.json');
 fs.writeFileSync(dest,JSON.stringify(report,null,2));
 await c.query(apply?'COMMIT':'ROLLBACK');console.log(JSON.stringify({file:dest,bookings:rows.length,updated:report.bookingsUpdated,fields:changes.length,unresolved:unresolved.length,before,after}));
}catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}}
main().catch(e=>{console.error(e.message);process.exitCode=1});
