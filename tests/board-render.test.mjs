import test from 'node:test';
import assert from 'node:assert/strict';
test('renders hostile names literally and rejects executable portrait URLs',async()=>{
 const {renderRecord}=await import('../dist/board-render.mjs');
 const html=renderRecord({memberName:'<img src=x onerror=alert(1)>',value:100,achievedOn:'2026-10-01',portraitUrl:'javascript:alert(1)'},{label:'Deadlift',unit:'kg'});
 assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('javascript:'));
});
test('unconfigured and failed reads differ from a genuinely empty Board',async()=>{
 const {renderStatus}=await import('../dist/board-render.mjs');
 assert.match(renderStatus('unconfigured'),/not yet open/i);assert.match(renderStatus('error'),/retry/i);assert.match(renderStatus('empty'),/No approved records/i);
});
