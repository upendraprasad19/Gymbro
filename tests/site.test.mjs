import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
const pages=['index','club','story','coaches','board','membership','fuel','avya'];
test('all eight direct-entry pages and their project-subpath links resolve',async()=>{
 const titles=new Set();
 for(const page of pages){
  let html=''; try{html=await readFile(`dist/${page}.html`,'utf8');}catch{}
  assert.ok(html,`${page}.html must exist`);
  assert.equal((html.match(/<main\b/g)||[]).length,1);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`${page} has unique IDs`);
  const title=html.match(/<title>(.*?)<\/title>/)?.[1]; assert.ok(title);titles.add(title);
  for(const target of pages)assert.ok(html.includes(`href="${target}.html"`),`${page} links to ${target}`);
  for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
   if(/^(https?:|data:|mailto:|tel:)/.test(url))continue;
   const resolved=new URL(url,'https://example.test/Gymbro/'+page+'.html');
   assert.ok(resolved.pathname.startsWith('/Gymbro/'),`${url} escapes project subpath`);
   await access('dist/'+decodeURIComponent(resolved.pathname.slice(8)));
  }
 }
 assert.equal(titles.size,8);
});
test('generated pages match their editable source modules',async()=>{
 const {renderLayout}=await import('../site/layout.mjs');
 for(const [key,module,title] of [['index','home','The club, the people, the work'],['club','club','The Club'],['story','story','Our Story'],['coaches','coaches','Coaches'],['board','board','The Board'],['membership','membership','Membership'],['fuel','fuel','Fuel'],['avya','avya','AVYA'],['staff','staff','Staff access']]){
  const {renderPage}=await import(`../site/pages/${module}.mjs`);
  assert.equal(await readFile(`dist/${key}.html`,'utf8'),renderLayout({key,title,description:`${title}. Explore GYMBRO, Jamshedpur's training club.`,body:renderPage()}),`${key} output is current`);
 }
});
test('people names and live AVYA destination appear in appropriate pages',async()=>{
 for(const [page,names] of [['story',['Vicky','Upendra']],['coaches',['Rohit','Sameer','Amit']]]){
  let html='';try{html=await readFile(`dist/${page}.html`,'utf8');}catch{}
  for(const name of names)assert.ok(html.includes(name),`${page} contains ${name}`);
 }
 const avya=await readFile('dist/avya.html','utf8');
 assert.match(avya,/href="https:\/\/app\.icanbefitter\.com\/?"/);
});
