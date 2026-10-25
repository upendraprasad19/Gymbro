import test from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
const ids={coach:'10000000-0000-4000-8000-000000000001',other:'10000000-0000-4000-8000-000000000002',owner:'10000000-0000-4000-8000-000000000003',stranger:'10000000-0000-4000-8000-000000000004'};
test('PostgreSQL enforces record privacy, roles, transitions, revisions and audit',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,metadata jsonb); alter table storage.objects enable row level security; grant usage on schema storage to authenticated; grant select,insert on storage.objects to authenticated;
 insert into auth.users values ${Object.values(ids).map(id=>`('${id}')`).join(',')};`);
 const file=(await readdir('supabase/migrations')).find(f=>f.endsWith('_gymbro_records.sql'));
 const migration=await readFile('supabase/migrations/'+file,'utf8');await db.exec(migration);
 let count;try{count=(await db.query('select count(*)::int n from public.published_records')).rows[0].n;}catch{}
 assert.equal(count,0,'migration must create a public safe projection');
 await db.exec(`insert into gymbro_private.staff(user_id,role) values ('${ids.coach}','coach'),('${ids.other}','coach'),('${ids.owner}','approver'); update public.record_definitions set active=true where id='deadlift-v1';`);
 async function as(user,sql,params=[]){await db.exec(`reset role; set role ${user?'authenticated':'anon'}; select set_config('request.jwt.claim.sub','${user?ids[user]:''}',false);`);return db.query(sql,params);}
 const rpc=(user,name,input)=>as(user,`select public.${name}($1::jsonb) result`,[JSON.stringify(input)]).then(r=>r.rows[0].result);
 const input={memberName:'Test member',definitionId:'deadlift-v1',divisionId:'open',value:100,achievedOn:'2026-01-01',evidencePath:ids.coach+'/evidence.jpg',idempotencyKey:'20000000-0000-4000-8000-000000000001'};
 await db.exec(`reset role; insert into storage.objects(bucket_id,name,metadata) values ('record-evidence','${input.evidencePath}','{"mimetype":"image/jpeg","size":100}');`);
 await assert.rejects(rpc('stranger','submit_record',input),/staff|permission|designated/i);
 await assert.rejects(rpc(null,'submit_record',input),/permission|sign in/i);
 const pending=await rpc('coach','submit_record',input);assert.equal(pending.state,'pending');
 assert.deepEqual(await rpc('coach','submit_record',input),pending,'retry is idempotent');
 assert.equal((await as(null,'select * from public.published_records')).rows.length,0);
 await assert.rejects(as('coach','select * from gymbro_private.submissions'),/permission/i);
 assert.equal((await as('other','select public.staff_submissions() result')).rows[0].result.length,0);
 await assert.rejects(rpc('coach','review_record',{id:pending.id,version:1,decision:'approve',membershipVerified:true}),/approver|permission/i);
 await assert.rejects(rpc('stranger','review_record',{id:pending.id,version:1,decision:'approve',membershipVerified:true,role:'approver'}),/approver|permission/i);
 await assert.rejects(rpc('owner','review_record',{id:pending.id,version:1,decision:'approve',membershipVerified:false}),/membership/i);
 const approved=await rpc('owner','review_record',{id:pending.id,version:1,decision:'approve',membershipVerified:true});assert.equal(approved.state,'approved');
 assert.equal((await as(null,'select * from public.published_records')).rows[0].member_name,'Test member');
 await assert.rejects(rpc('owner','review_record',{id:pending.id,version:1,decision:'approve',membershipVerified:true}),/stale|conflict/i);
 const corrected=await rpc('coach','submit_record',{...input,value:110,idempotencyKey:'20000000-0000-4000-8000-000000000002',supersedesId:pending.id});
 assert.equal((await as(null,'select value from public.published_records')).rows[0].value,'100');
 await rpc('owner','review_record',{id:corrected.id,version:1,decision:'approve',membershipVerified:true});
 const publicRows=(await as(null,'select value from public.published_records')).rows;assert.equal(publicRows.length,1);assert.equal(publicRows[0].value,'110');
 await rpc('owner','review_record',{id:corrected.id,version:2,decision:'withdraw',reason:'Incorrect conditions'});assert.equal((await as(null,'select * from public.published_records')).rows.length,0);
 // A -> B (changes requested) -> C must replace A, not merely retire B.
 const ancestor=await rpc('coach','submit_record',{...input,value:200,idempotencyKey:'20000000-0000-4000-8000-000000000004'});
 await rpc('owner','review_record',{id:ancestor.id,version:1,decision:'approve',membershipVerified:true});
 const middle=await rpc('coach','submit_record',{...input,value:210,idempotencyKey:'20000000-0000-4000-8000-000000000005',supersedesId:ancestor.id});
 await rpc('owner','review_record',{id:middle.id,version:1,decision:'request_changes',reason:'Correct result'});
 const finalRevision=await rpc('coach','submit_record',{...input,value:220,idempotencyKey:'20000000-0000-4000-8000-000000000006',supersedesId:middle.id});
 await rpc('owner','review_record',{id:finalRevision.id,version:1,decision:'approve',membershipVerified:true});
 assert.deepEqual((await as(null,'select value from public.published_records')).rows.map(r=>r.value),['220'],'revised correction chain removes the approved ancestor');
 await assert.rejects(as('coach',`insert into public.published_records(id,definition_id,division_id,member_name,value,achieved_on,approved_at) values(gen_random_uuid(),'deadlift-v1','open','spoof',900,'2026-01-01',now())`),/permission|policy/i);
 assert.equal((await as('other','select * from storage.objects')).rows.length,0);assert.equal((await as('coach','select * from storage.objects')).rows.length,1);assert.equal((await as('owner','select * from storage.objects')).rows.length,1);
 await db.exec(`reset role; update gymbro_private.staff set active=false where user_id='${ids.coach}';`);
 await assert.rejects(rpc('coach','submit_record',{...input,idempotencyKey:'20000000-0000-4000-8000-000000000003'}),/staff|permission|designated/i);
 await db.exec('reset role');assert.ok((await db.query('select count(*)::int n from gymbro_private.audit')).rows[0].n>=5);
 }finally{await db.close();}
});
