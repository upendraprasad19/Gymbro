export function groupRecords(records,definitions){
 const defs=new Map(definitions.map(d=>[d.id,d]));const groups=new Map();
 for(const record of records){
  const def=defs.get(record.definitionId);
  if(!def||!Number.isFinite(record.value)||record.value<=0||!record.id||!record.divisionId||!/^\d{4}-\d{2}-\d{2}$/.test(record.achievedOn)||Number.isNaN(Date.parse(record.achievedOn))||(record.state&&record.state!=='approved')||(record.unit&&record.unit!==def.unit))continue;
  const key=JSON.stringify([def.id,record.divisionId]);
  if(!groups.has(key))groups.set(key,{definition:def,divisionId:record.divisionId,records:[]});
  groups.get(key).records.push(record);
 }
 return [...groups.values()].map(group=>{
  group.records.sort((a,b)=>(group.definition.comparison==='lower'?a.value-b.value:b.value-a.value)||a.achievedOn.localeCompare(b.achievedOn)||a.id.localeCompare(b.id));
  const best=group.records[0].value;
  return {...group,leaders:group.records.filter(r=>r.value===best),history:group.records.filter(r=>r.value!==best)};
 });
}
export function formatResult(record,definition){return `${new Intl.NumberFormat('en-IN',{maximumFractionDigits:3}).format(record.value)} ${definition.unit}`;}
