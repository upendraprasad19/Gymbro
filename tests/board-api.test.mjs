import test from 'node:test';import assert from 'node:assert/strict';
const load=()=>import('../dist/board-api.mjs');
test('unconfigured service fails closed before any network operation',async()=>{const {createBoardApi}=await load();assert.throws(()=>createBoardApi({url:'',publishableKey:''}),/not connected/i);});
test('failed persistence never reports a successful submit',async()=>{const {createBoardApi}=await load();const client={rpc:async()=>({error:{message:'permission denied'}})};const api=createBoardApi({url:'https://test.supabase.co',publishableKey:'public-test'},{client});await assert.rejects(api.submitRecord({idempotencyKey:'stable'}),/couldn.t save/i);});
test('review transmits expected version and membership check to the service',async()=>{const {createBoardApi}=await load();let sent;const client={rpc:async(name,args)=>{sent={name,args};return {data:{id:'r',state:'approved',version:2},error:null};}};const api=createBoardApi({url:'https://test.supabase.co',publishableKey:'public-test'},{client});const result=await api.reviewRecord({id:'r',version:1,decision:'approve',reason:'',membershipVerified:true});assert.equal(result.state,'approved');assert.equal(sent.name,'review_record');assert.equal(sent.args.input.version,1);assert.equal(sent.args.input.membershipVerified,true);});
test('expired sessions clear authorization and unsafe files fail before upload',async()=>{const {createBoardApi}=await load();const client={rpc:async()=>({error:{message:'JWT expired'}}),auth:{getSession:async()=>({data:{session:null}})}};const api=createBoardApi({url:'https://test.supabase.co',publishableKey:'public-test'},{client});await assert.rejects(api.getStaffContext(),/sign in|session/i);await assert.rejects(api.uploadEvidence(new File(['<script>'],'bad.html',{type:'text/html'})),/JPEG|supported/i);});
test('routine refresh and same-user sign-in do not reset a staff draft',async()=>{
 const {createBoardApi}=await load();let callback;let resets=0;
 const client={auth:{onAuthStateChange:cb=>{callback=cb;return {data:{subscription:{unsubscribe(){}}}};}}};
 const api=createBoardApi({url:'https://test.supabase.co',publishableKey:'public-test'},{client});api.onAuthChange(()=>resets++);
 callback('INITIAL_SESSION',{user:{id:'coach'}});callback('TOKEN_REFRESHED',{user:{id:'coach'}});callback('SIGNED_IN',{user:{id:'coach'}});
 await new Promise(resolve=>setTimeout(resolve,10));assert.equal(resets,0);
 callback('SIGNED_OUT',null);await new Promise(resolve=>setTimeout(resolve,10));assert.equal(resets,1);
});
