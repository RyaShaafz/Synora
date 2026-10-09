import {z} from 'zod';
import {AppError} from '../errors';
import {aiOutputSchema,type AIOutput} from './schema';
import {generate as generateLocal,ollamaStatus} from './ollama';

const endpoint='https://api.groq.com/openai/v1';
export function providerName(){const provider=process.env.AI_PROVIDER||'groq';if(!['groq','ollama'].includes(provider))throw new AppError(503,'The AI provider configuration is invalid.');return provider;}
export function defaultModel(){return providerName()==='ollama'?process.env.OLLAMA_MODEL||'qwen3:4b':process.env.GROQ_MODEL||'openai/gpt-oss-120b';}
export function effectiveModel(preference?:string){return providerName()==='ollama'?preference||defaultModel():defaultModel();}
export function providerLabel(){return providerName()==='ollama'?'Local Ollama':'Groq';}
function apiKey(){const key=process.env.GROQ_API_KEY?.trim();if(!key||key==='YOUR_GROQ_API_KEY')throw new AppError(503,'Groq is not configured. Add GROQ_API_KEY to the server’s .env file and restart Synora. Your other features still work.');return key;}
function providerError(status:number){if(status===401||status===403)return new AppError(503,'Groq rejected the API key or model permissions. Check the server configuration.');if(status===429)return new AppError(429,'Groq’s usage limit was reached. Please wait or check your provider quota before retrying.');return new AppError(503,'Groq could not answer. Check the selected model and try again.');}

export async function aiStatus(preference?:string,fetcher:typeof fetch=fetch){
 const model=effectiveModel(preference),provider=providerName();
 if(provider==='ollama')return {...await ollamaStatus(model),provider,label:providerLabel(),local:true,configured:true,detail:''};
 const base={model,provider,label:'Groq',local:false,models:[] as string[],online:false,ready:false,configured:false,detail:''};
 try{const key=apiKey();base.configured=true;const response=await fetcher(endpoint+'/models',{headers:{Authorization:'Bearer '+key},redirect:'error',signal:AbortSignal.timeout(5000),cache:'no-store'});if(!response.ok)throw providerError(response.status);const result=z.object({data:z.array(z.object({id:z.string()}))}).parse(await response.json());return {...base,online:true,models:result.data.map(m=>m.id),ready:result.data.some(m=>m.id===model),detail:result.data.some(m=>m.id===model)?'':'The selected Groq model is unavailable. Update GROQ_MODEL in the server configuration.'};}catch(e){return {...base,detail:e instanceof AppError?e.message:'Unable to connect to Groq. Please retry.'};}
}

export async function generate(messages:{role:string;content:string}[],preference?:string,fetcher:typeof fetch=fetch):Promise<AIOutput>{
 const model=effectiveModel(preference);
 if(providerName()==='ollama')return generateLocal(messages,model,fetcher);
 const key=apiKey();
 try{
  // Optional fields in Synora's action schema require best-effort mode. Zod validates
  // every response independently before it can be saved or proposed to the user.
  const response=await fetcher(endpoint+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},redirect:'error',body:JSON.stringify({model,messages,temperature:0.2,max_completion_tokens:4096,stream:false,response_format:{type:'json_schema',json_schema:{name:'aura_response',strict:false,schema:z.toJSONSchema(aiOutputSchema)}}}),signal:AbortSignal.timeout(90000)});
  if(!response.ok)throw providerError(response.status);
  const envelope=z.object({choices:z.array(z.object({finish_reason:z.string().nullable(),message:z.object({content:z.string().min(1)})})).min(1)}).parse(await response.json());
  if(envelope.choices[0].finish_reason!=='stop')throw new AppError(502,'Groq did not finish a complete response. Nothing was changed. Please retry.');
  return aiOutputSchema.parse(JSON.parse(envelope.choices[0].message.content));
 }catch(e){if(e instanceof AppError)throw e;if(e instanceof z.ZodError||e instanceof SyntaxError)throw new AppError(502,'The AI returned an invalid response. Nothing was changed. Please retry.');throw new AppError(503,'Synora cannot connect to Groq. Please retry. Your other features still work.');}
}
