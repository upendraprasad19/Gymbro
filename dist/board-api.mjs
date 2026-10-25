import {createClient} from './vendor/supabase.js';
const supported=new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp'],['video/mp4','mp4'],['video/webm','webm']]);
export async function validateEvidence(file){
 if(!supported.has(file?.type)||file.size<=0||file.size>25*1024*1024)throw new Error('Choose a supported JPEG, PNG, WebP, MP4 or WebM file up to 25 MiB.');
 const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());const text=new TextDecoder().decode(bytes);
 const signatures={'image/jpeg':bytes[0]===255&&bytes[1]===216&&bytes[2]===255,'image/png':bytes[0]===137&&text.slice(1,4)==='PNG','image/webp':text.slice(0,4)==='RIFF'&&text.slice(8,12)==='WEBP','video/mp4':text.slice(4,8)==='ftyp','video/webm':bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163};
 if(!signatures[file.type])throw new Error('The evidence contents do not match its file type.');
 return supported.get(file.type);
}
export function createBoardApi(config,{client}={}){
 if(!config?.url||!config?.publishableKey)throw new Error('The record service is not connected yet.');
 const sdk=client||createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'gymbro-staff-session'}});
 async function rpc(name,input,fallback){const {data,error}=await sdk.rpc(name,input===undefined?undefined:{input});if(error){if(/jwt|session|token/i.test(error.message))throw new Error('Your session expired. Please sign in again.');if(/stale|conflict/i.test(error.message))throw new Error('This submission changed. Refresh before reviewing it.');throw new Error(fallback);}return data;}
 return {
  async getPublicRecords(){const {data,error}=await sdk.from('published_records').select('id,definitionId:definition_id,divisionId:division_id,memberName:member_name,portraitUrl:portrait_url,value,achievedOn:achieved_on,approvedAt:approved_at');if(error)throw new Error('Records could not load.');return data||[];},
  async getDefinitions(){const {data,error}=await sdk.from('record_definitions').select('id,group:discipline,label,unit,comparison,rules,rulesVersion:rules_version').eq('active',true);if(error)throw new Error('Event definitions could not load.');return data||[];},
  async getDivisions(){const {data,error}=await sdk.from('record_divisions').select('id,label').eq('active',true);if(error)throw new Error('Divisions could not load.');return data||[];},
  getStaffContext:()=>rpc('staff_context',undefined,'Staff access could not be checked.'),
  submitRecord:input=>rpc('submit_record',input,'We couldn’t save the submission. Your result has not been confirmed.'),
  listSubmissions:()=>rpc('staff_submissions',undefined,'Submissions could not load.'),
  reviewRecord:input=>rpc('review_record',input,'The review could not be saved. Refresh and try again.'),
  async uploadEvidence(file){const extension=await validateEvidence(file);const {data:{session}}=await sdk.auth.getSession();if(!session)throw new Error('Please sign in before uploading evidence.');const path=`${session.user.id}/${crypto.randomUUID()}.${extension}`;const {error}=await sdk.storage.from('record-evidence').upload(path,file,{upsert:false,contentType:file.type});if(error)throw new Error('Evidence upload failed. No record has been submitted.');return path;},
  async getEvidence(path){const {data,error}=await sdk.storage.from('record-evidence').createSignedUrl(path,60,{download:true});if(error)throw new Error('Evidence is unavailable or you do not have access.');return data.signedUrl;},
  async signIn(email){const {error}=await sdk.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:false,emailRedirectTo:new URL('staff.html',globalThis.location.href).href}});if(error)throw new Error('A sign-in link could not be sent. Check your staff email or try again later.');},
  async signOut(){const {error}=await sdk.auth.signOut();if(error)throw new Error('Sign-out could not be confirmed. Try again.');},
  onAuthChange(callback){
   let lastUser;
   return sdk.auth.onAuthStateChange((event,session)=>{
    const userId=session?.user?.id??null;
    if(event==='INITIAL_SESSION'){lastUser=userId;return;}
    if(event==='TOKEN_REFRESHED'||(event==='SIGNED_IN'&&userId===lastUser))return;
    if(event==='SIGNED_OUT'||userId!==lastUser){lastUser=userId;setTimeout(()=>callback(event),0);}
   });
  }
 };
}
