import test from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';
test('sample Board is visibly labelled and isolated from a configured live service',async()=>{
 const {loadBoardData}=await import('../dist/board-data.mjs');
 const sample=await loadBoardData({}, {demoEnabled:true});
 assert.equal(sample.mode,'sample');assert.ok(sample.records.length>=10);assert.ok(sample.records.every(r=>r.sample===true));
 const real=await loadBoardData({url:'https://test.supabase.co',publishableKey:'public'}, {demoEnabled:true,apiFactory:()=>({getPublicRecords:async()=>[{id:'real'}],getDefinitions:async()=>[]})});
 assert.equal(real.mode,'live');assert.deepEqual(real.records,[{id:'real'}]);
 const empty=await loadBoardData({}, {demoEnabled:false});assert.equal(empty.mode,'unconfigured');assert.equal(empty.records.length,0);
});
test('all five people have image references and a visible sample disclosure',async()=>{
 for(const [page,names] of [['story',['founder-vicky','founder-upendra']],['coaches',['coach-rohit','coach-sameer','coach-amit']]]){
  const html=await readFile(`dist/${page}.html`,'utf8');
  for(const name of names){assert.ok(html.includes(`assets/people/${name}.jpg`),`${name} portrait is used`);await access(`dist/assets/people/${name}.jpg`);}
  assert.match(html,/AI-generated portraits/);
 }
});
test('record rendering permits only safe local sample portraits and labels illustrative results',async()=>{
 const {renderRecord,safePortrait}=await import('../dist/board-render.mjs');
 assert.equal(safePortrait('assets/people/member-meera.jpg'),'assets/people/member-meera.jpg');
 assert.equal(safePortrait('assets/people/../../private.html'),null);
 const html=renderRecord({memberName:'Meera Rao',portraitUrl:'assets/people/member-meera.jpg',value:85,achievedOn:'2026-10-01',sample:true},{label:'Squat',unit:'kg'});
 assert.match(html,/Illustrative record/);assert.match(html,/<img/);
});
