import {boardConfig} from './board-config.js';
import {groupRecords} from './board-model.mjs';
import {renderRecord,renderStatus,renderSpotlights,escapeHtml} from './board-render.mjs';
import {loadBoardData} from './board-data.mjs';
import {visualPreviewEnabled} from './visual-preview.js';
const board=document.querySelector('[data-board]');const preview=document.querySelector('[data-board-preview]');
if(board||preview){
 let filter='all',view='current',records=[],definitions=[],state='loading',mode='unconfigured';
 const demoNotice='<p class="record-demo-notice"><span>VISUAL PREVIEW</span> AI-generated member portraits. All names, results and dates below are fictional examples.</p>';
 function render(){
  const groups=groupRecords(records,definitions).filter(g=>filter==='all'||g.definition.group===filter);
  if(preview&&state==='loaded'&&groups.length)preview.innerHTML=(mode==='sample'?demoNotice:'')+`<div class="board-spotlight-grid">${renderSpotlights(groups)}</div>`;
  else if(preview&&state==='error')preview.innerHTML='<p class="board-home-empty">The Board is temporarily unavailable.<br><a href="board.html">View the Board ↗</a></p>';
  if(!board)return;
  const status=board.querySelector('[data-board-status]');status.textContent=state==='loading'?'Loading records…':mode==='sample'?`Illustrative records · ${view==='current'?'Current holders':'Record history'}`:state==='unconfigured'?'Record events / Preparing for the first attempts':state==='error'?'Records are temporarily unavailable':`${groups.length} record ${groups.length===1?'event':'events'} · ${view==='current'?'Current holders':'Previous results'}`;
  const feature=board.querySelector('[data-board-featured]');if(feature)feature.innerHTML=state==='loaded'&&view==='current'?`<div class="board-spotlight-grid">${renderSpotlights(groups)}</div>`:'';
  const notice=board.querySelector('[data-board-disclosure]');if(notice)notice.innerHTML=mode==='sample'?demoNotice:'';
  const list=board.querySelector('[data-board-results]');
  if(state==='loading'){list.innerHTML='';return;}
  const shown=groups.filter(g=>view==='current'||g.history.length);
  list.innerHTML=(state==='error'?renderStatus('error'):shown.length?shown.map(g=>`<section class="record-event"><div class="record-event-heading"><h3>${escapeHtml(g.definition.label)}</h3><span class="micro-label">${escapeHtml(g.divisionId)}${view==='current'&&g.leaders.length>1?' / Joint record holders':''}</span></div>${(view==='current'?g.leaders:g.history).map(r=>renderRecord(r,g.definition)).join('')}<p class="event-rules">${escapeHtml(g.definition.rules)}</p></section>`).join(''):renderStatus(state==='unconfigured'?'unconfigured':'empty'))+`<div class="event-index">${definitions.filter(d=>filter==='all'||d.group===filter).map(d=>`<details><summary>${escapeHtml(d.label)} <span>Event conditions +</span></summary><p>${escapeHtml(d.rules)}</p></details>`).join('')}</div>`;
  list.querySelector('[data-board-retry]')?.addEventListener('click',load);
 }
 async function load(){
  state='loading';render();
  try{const data=await loadBoardData(boardConfig,{demoEnabled:visualPreviewEnabled});({records,definitions,mode}=data);state=mode==='unconfigured'?'unconfigured':'loaded';}catch{state='error';mode='unconfigured';}render();
 }
 board?.querySelectorAll('[data-board-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.boardFilter;board.querySelectorAll('[data-board-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
 board?.querySelectorAll('[data-board-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.boardView;board.querySelectorAll('[data-board-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
 load();
}
