import {boardConfig} from './board-config.js';
import {escapeHtml} from './board-render.mjs';
import {submitWithEvidence} from './staff-state.mjs';
const $=selector=>document.querySelector(selector);
const status=$('#staff-status');let api,context,definitions=[],divisions=[],key=crypto.randomUUID(),busy=false,loadVersion=0,authGeneration=0;
function show(id,visible){$(id).hidden=!visible;}
function message(text){status.textContent=text;}
function clearWorkspace(){context=null;$('#submission-list').replaceChildren();$('#record-form').reset();show('#staff-session',false);}
async function start(){
 if(!boardConfig.url||!boardConfig.publishableKey){show('#staff-setup',true);message('Staff submissions are not open yet.');return;}
 try{const {createBoardApi}=await import('./board-api.mjs');api=createBoardApi(boardConfig);api.onAuthChange(event=>{if(event==='SIGNED_OUT'||event==='SIGNED_IN'){clearWorkspace();++loadVersion;}refreshIdentity();});await refreshIdentity();}catch(error){message(error.message);}
}
async function refreshIdentity(){
 const version=++authGeneration;show('#staff-login',false);
 try{const next=await api.getStaffContext();if(version!==authGeneration)return;if(context&&next&&context.userId===next.userId&&context.role===next.role)return;clearWorkspace();context=next;if(!context){show('#staff-login',true);message('Sign in with a designated staff account.');return;}
  [definitions,divisions]=await Promise.all([api.getDefinitions(),api.getDivisions()]);if(version!==authGeneration)return;
  show('#staff-session',true);$('#staff-role').textContent=context.role==='approver'?'Signed in as record approver':'Signed in as coach';$('#queue-title').textContent=context.role==='approver'?'Review submissions':'Your submissions';
  const select=$('[name=definitionId]');select.innerHTML=definitions.map(d=>`<option value="${escapeHtml(d.id)}">${escapeHtml(d.label)}</option>`).join('');$('[name=divisionId]').innerHTML=divisions.map(d=>`<option value="${escapeHtml(d.id)}">${escapeHtml(d.label)}</option>`).join('');$('#record-form button[type=submit]').disabled=!definitions.length||!divisions.length;updateEvent();
  message(definitions.length?'Workspace ready.':'No record events are open yet. Event rules need approval before submissions.');await loadQueue();
 }catch(error){if(version!==authGeneration)return;clearWorkspace();show('#staff-login',true);message(error.message);}
}
function updateEvent(){const def=definitions.find(d=>d.id===$('[name=definitionId]').value);$('#record-unit').textContent=def?`(${def.unit})`:'';$('#record-conditions').textContent=def?.rules||'No active record events.';}
async function loadQueue(){const request=++loadVersion;const session=context;if(!session)return;try{const rows=await api.listSubmissions();if(request!==loadVersion||context!==session)return;const target=$('#submission-list');target.innerHTML=rows.length?rows.map(record=>`<article class="submission" data-record="${escapeHtml(record.id)}"><div class="submission-top"><h3>${escapeHtml(record.memberName)}</h3><span class="micro-label">${escapeHtml(record.state.replaceAll('_',' '))}</span></div><p>${escapeHtml(record.eventLabel)} / ${escapeHtml(record.divisionLabel)} — ${escapeHtml(record.value)} ${escapeHtml(record.unit)}</p><p>${escapeHtml(record.achievedOn)} · Revision ${record.version}</p>${record.reviewReason?`<p class="review-reason">Review note: ${escapeHtml(record.reviewReason)}</p>`:''}<button class="text-link" data-evidence>Download private evidence ↗</button>${context.role==='approver'&&['pending','approved'].includes(record.state)?`<form class="review-form"><label>Review note<input name="reason" maxlength="1000"></label>${record.state==='pending'?'<label class="check-label"><input type="checkbox" name="membershipVerified"> I checked membership eligibility, the event conditions and evidence.</label><div class="review-actions"><button class="button blue" name="decision" value="approve">Approve</button><button class="button" name="decision" value="request_changes">Request changes</button><button class="button" name="decision" value="reject">Reject</button></div>':'<button class="button" name="decision" value="withdraw">Withdraw approved record</button>'}</form>`:''}${record.coachId===context.userId&&['changes_requested','approved'].includes(record.state)?'<button class="text-link" data-correction>Submit a corrected revision ↗</button>':''}</article>`).join(''):'<p class="empty-submissions">No submissions yet.</p>';
  rows.forEach(record=>{const row=[...target.querySelectorAll('[data-record]')].find(el=>el.dataset.record===record.id);row.querySelector('[data-evidence]').addEventListener('click',async event=>{const button=event.currentTarget;button.disabled=true;try{const url=await api.getEvidence(record.evidencePath);if(context!==session)return;const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.download='';link.click();}catch(error){message(error.message);}finally{button.disabled=false;}});
   row.querySelector('.review-form')?.addEventListener('submit',event=>review(event,record));row.querySelector('[data-correction]')?.addEventListener('click',()=>{const form=$('#record-form');form.elements.memberName.value=record.memberName;form.elements.definitionId.value=record.definitionId;form.elements.divisionId.value=record.divisionId;form.elements.value.value=record.value;form.elements.achievedOn.value=record.achievedOn;form.elements.supersedesId.value=record.id;key=crypto.randomUUID();updateEvent();form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});form.elements.memberName.focus();message('Editing a new revision. The existing approved result remains until the new revision is approved.');});
  });
 }catch(error){message(error.message);}
}
async function review(event,record){event.preventDefault();if(busy)return;const form=event.currentTarget,data=new FormData(form),decision=event.submitter.value;const verified=data.get('membershipVerified')==='on';if(decision==='approve'&&!verified){message('Confirm membership eligibility, conditions and evidence before approving.');return;}if(decision!=='approve'&&!String(data.get('reason')).trim()){message('Add a review note explaining this decision.');return;}busy=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);try{await api.reviewRecord({id:record.id,version:record.version,decision,reason:data.get('reason'),membershipVerified:verified});message('Review saved.');await loadQueue();}catch(error){message(error.message);}finally{busy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}}
$('#staff-login').addEventListener('submit',async event=>{event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;try{await api.signIn(event.currentTarget.elements.email.value);message('If this is a registered staff email, check your inbox for the sign-in link.');}catch(error){message(error.message);}finally{button.disabled=false;}});
$('#staff-signout').addEventListener('click',async()=>{clearWorkspace();++loadVersion;++authGeneration;try{await api.signOut();show('#staff-login',true);message('Signed out.');}catch(error){message(error.message);}});
$('[name=definitionId]').addEventListener('change',updateEvent);$('#refresh-queue').addEventListener('click',loadQueue);
$('[name=achievedOn]').max=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
$('#record-form').addEventListener('submit',async event=>{
 event.preventDefault();if(busy||!context)return;
 const form=event.currentTarget;if(!form.reportValidity())return;
 const fields={memberName:form.elements.memberName.value.trim(),definitionId:form.elements.definitionId.value,divisionId:form.elements.divisionId.value,value:Number(form.elements.value.value),achievedOn:form.elements.achievedOn.value,supersedesId:form.elements.supersedesId.value||null};
 if(!fields.memberName){message('Enter a member name.');return;}
 const session=context,generation=authGeneration,file=form.elements.evidence.files[0];
 busy=true;const button=form.querySelector('button[type=submit]');button.disabled=true;
 try{
  await submitWithEvidence({api,fields,file,idempotencyKey:key,isCurrent:()=>context===session&&authGeneration===generation});
  key=crypto.randomUUID();form.reset();updateEvent();message('Record submitted. It remains private until approval.');await loadQueue();
 }catch(error){message(error.message);}finally{busy=false;button.disabled=false;}
});
start();
