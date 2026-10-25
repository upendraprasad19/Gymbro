import test from 'node:test';import assert from 'node:assert/strict';
test('submission snapshots fields before upload and ignores later form mutation',async()=>{
 const {submitWithEvidence}=await import('../dist/staff-state.mjs');let finish;let payload;
 const fields={memberName:' Test member ',value:100,definitionId:'lift',divisionId:'open',achievedOn:'2026-01-01',supersedesId:null};
 const api={uploadEvidence:()=>new Promise(resolve=>finish=resolve),submitRecord:async input=>{payload=input;return {id:'saved'};}};
 const pending=submitWithEvidence({api,fields,file:{},idempotencyKey:'same-retry',isCurrent:()=>true});fields.memberName='';fields.value=0;finish('private/file.jpg');
 assert.deepEqual(await pending,{id:'saved'});assert.equal(payload.memberName,'Test member');assert.equal(payload.value,100);assert.equal(payload.idempotencyKey,'same-retry');
});
test('account loss during upload prevents submission',async()=>{
 const {submitWithEvidence}=await import('../dist/staff-state.mjs');let saved=false;
 const api={uploadEvidence:async()=> 'private/file.jpg',submitRecord:async()=>{saved=true;}};
 await assert.rejects(submitWithEvidence({api,fields:{memberName:'Test'},file:{},idempotencyKey:'x',isCurrent:()=>false}),/session changed/i);assert.equal(saved,false);
});
