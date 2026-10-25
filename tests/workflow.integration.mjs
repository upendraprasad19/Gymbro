// Run separately: npm run test:workflow. This requires a running LOCAL Supabase stack.
import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createClient} from '@supabase/supabase-js';
test('local Supabase Auth, REST and Storage enforce the full workflow',async()=>{
 let settings;
 try{const output=execFileSync('node',['node_modules/supabase/dist/supabase.js','status','-o','json'],{encoding:'utf8',timeout:12000,stdio:['ignore','pipe','pipe']});settings=JSON.parse(output);}catch{throw new Error('Local Supabase is not ready. Start Docker and the isolated local stack; no hosted service has been tested.');}
 const url=settings.API_URL;assert.ok(url&&['127.0.0.1','localhost'].includes(new URL(url).hostname),'Integration tests refuse non-local service URLs');
 const admin=createClient(url,settings.SERVICE_ROLE_KEY||settings.SECRET_KEY,{auth:{persistSession:false}});const key=settings.ANON_KEY||settings.PUBLISHABLE_KEY;
 const makeClient=()=>createClient(url,key,{auth:{persistSession:false}});
 const runSql=sql=>execFileSync('docker',['exec','-i','supabase_db_gymbro-expansion','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-c',sql],{encoding:'utf8',timeout:12000,stdio:['ignore','pipe','pipe']});
 const suffix=crypto.randomUUID();const users=[];const paths=[];
 try{
  const accounts={};
  for(const [name,role] of [['coach','coach'],['owner','approver'],['stranger',null]]){
   const email=`gymbro-${name}-${suffix}@example.invalid`,password=crypto.randomUUID()+'Aa!9';
   const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.equal(error,null);users.push(data.user.id);
   const client=makeClient();const signed=await client.auth.signInWithPassword({email,password});assert.equal(signed.error,null);accounts[name]={client,id:data.user.id};
   if(role)runSql(`insert into gymbro_private.staff(user_id,role) values('${data.user.id}','${role}');`);
  }
  runSql("update public.record_definitions set active=true where id='deadlift-v1';");
  const path=accounts.coach.id+'/'+crypto.randomUUID()+'.jpg';paths.push(path);
  const upload=await accounts.coach.client.storage.from('record-evidence').upload(path,new Uint8Array([255,216,255,217]),{contentType:'image/jpeg'});assert.equal(upload.error,null);
  const input={memberName:'Synthetic integration member',definitionId:'deadlift-v1',divisionId:'open',value:101,achievedOn:'2026-01-01',evidencePath:path,idempotencyKey:crypto.randomUUID()};
  const submitted=await accounts.coach.client.rpc('submit_record',{input});assert.equal(submitted.error,null);assert.equal(submitted.data.state,'pending');
  const anon=makeClient();const hidden=await anon.from('published_records').select().eq('id',submitted.data.id);assert.equal(hidden.error,null);assert.equal(hidden.data.length,0);
  const denied=await accounts.coach.client.rpc('review_record',{input:{id:submitted.data.id,version:1,decision:'approve',membershipVerified:true}});assert.ok(denied.error);
  const privateDenied=await accounts.stranger.client.storage.from('record-evidence').createSignedUrl(path,60);assert.ok(privateDenied.error);
  const reviewed=await accounts.owner.client.rpc('review_record',{input:{id:submitted.data.id,version:1,decision:'approve',membershipVerified:true}});assert.equal(reviewed.error,null);
  const publicResult=await anon.from('published_records').select().eq('id',submitted.data.id);assert.equal(publicResult.error,null);assert.equal(publicResult.data.length,1);
  const freshRead=await makeClient().from('published_records').select().eq('id',submitted.data.id);assert.equal(freshRead.data[0].value,101);
  const evidence=await accounts.owner.client.storage.from('record-evidence').createSignedUrl(path,60,{download:true});assert.equal(evidence.error,null);
 }finally{
  // Disposable synthetic LOCAL fixtures only; never remove real user data.
  if(users.length){const list=users.map(id=>`'${id}'`).join(',');runSql(`delete from public.published_records where id in(select id from gymbro_private.submissions where coach_id in(${list})); delete from gymbro_private.audit where actor_id in(${list}); delete from gymbro_private.submissions where coach_id in(${list}); delete from gymbro_private.staff where user_id in(${list}); update public.record_definitions set active=false where id='deadlift-v1';`);}
  if(paths.length)await admin.storage.from('record-evidence').remove(paths);
  for(const id of users)await admin.auth.admin.deleteUser(id);
 }
});
