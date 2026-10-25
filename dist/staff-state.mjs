// Capture a stable submission before the asynchronous evidence upload starts.
export async function submitWithEvidence({api,fields,file,idempotencyKey,isCurrent}){
 const snapshot={...fields,memberName:String(fields.memberName).trim(),idempotencyKey,portraitUrl:null};
 const evidencePath=await api.uploadEvidence(file);
 if(!isCurrent())throw new Error('Your session changed. Sign in and check your submissions before trying again.');
 const result=await api.submitRecord({...snapshot,evidencePath});
 if(!isCurrent())throw new Error('Your session changed. Sign in and check whether the submission was saved.');
 return result;
}
