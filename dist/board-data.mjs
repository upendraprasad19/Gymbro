import {previewDefinitions} from './board-definitions.mjs';
export async function loadBoardData(config,{demoEnabled=false,apiFactory}={}){
 if(config?.url&&config?.publishableKey){
  const createApi=apiFactory||(await import('./board-api.mjs')).createBoardApi;
  const api=createApi(config);const [records,definitions]=await Promise.all([api.getPublicRecords(),api.getDefinitions()]);
  return {mode:'live',records,definitions};
 }
 if(demoEnabled){const {sampleRecords,sampleDefinitions}=await import('./sample-board.mjs');return {mode:'sample',records:sampleRecords,definitions:sampleDefinitions};}
 return {mode:'unconfigured',records:[],definitions:previewDefinitions};
}
