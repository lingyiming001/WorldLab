import {agentPrompt,validateComponents,validatePlan,type ComponentDefinition} from '../src/components';
import {planSchema} from '../src/agent-schema';
export type AgentEnv={OPENAI_API_KEY?:string;OPENAI_MODEL?:string};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
// Best-effort isolate guard. Private Sites dispatch is the authoritative access boundary.
const limits=new Map<string,{start:number;count:number;active:number}>();
export async function agentRoute(request:Request,env:AgentEnv,fetcher:typeof fetch=fetch){
 const url=new URL(request.url);
 if(url.pathname==='/api/agent/status'&&request.method==='GET')return json({configured:!!env.OPENAI_API_KEY});
 if(url.pathname!=='/api/agent/generate')return json({error:'Not found'},404);
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'仅允许同源请求 / Same-origin requests required'},403);
 if(!env.OPENAI_API_KEY)return json({error:'AI 服务尚未配置。请管理员在服务端配置 OPENAI_API_KEY。'},503);
 const user=request.headers.get('oai-authenticated-user-id');if(!user)return json({error:'请登录后生成场景 / Sign in to generate'},401);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Content-Type must be application/json'},415);
 if(Number(request.headers.get('content-length'))>65536)return json({error:'请求过大 / Request too large'},413);
 let body:{request?:unknown;components?:unknown};try{if(!request.body)return json({error:'请求无效'},400);const reader=request.body.getReader();let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();return json({error:'请求过大 / Request too large'},413)}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}body=JSON.parse(new TextDecoder().decode(bytes))}catch{return json({error:'请求无效 / Invalid request'},400)}
 if(typeof body.request!=='string'||!body.request.trim()||body.request.length>6000)return json({error:'需求应为 1–6000 字符 / Brief must be 1–6000 characters'},400);
 let defs:ComponentDefinition[];try{defs=validateComponents(body.components??[],[]).components}catch(e){return json({error:(e as Error).message},400)}
 const now=Date.now();for(const [id,limit] of limits)if(now-limit.start>300000&&!limit.active)limits.delete(id);if(limits.size>1000&&!limits.has(user))return json({error:'服务繁忙，请稍后重试'},429);const bucket=limits.get(user)??{start:now,count:0,active:0};if(bucket.count>=6||bucket.active>=1)return json({error:'请求过于频繁，请稍后重试 / Please retry later'},429);bucket.count++;bucket.active++;limits.set(user,bucket);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),55000);const cancel=()=>controller.abort();request.signal.addEventListener('abort',cancel,{once:true});
 try{const response=await fetcher('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:env.OPENAI_MODEL??'gpt-4.1-mini',store:false,input:[{role:'system',content:'Create semantic 3D learning scenes from declarative primitives. Return the requested JSON only. Follow budget and coordinate constraints; never add executable code or external URLs.'},{role:'user',content:agentPrompt(body.request,defs)}],max_output_tokens:7000,text:{format:{type:'json_schema',name:'worldlab_scene',strict:true,schema:planSchema}}}),signal:controller.signal});if(!response.ok){const status=response.status;return json({error:status===401?'AI 服务密钥无效，请管理员检查配置':status===429?'AI 服务额度或速率受限，请稍后重试':'AI 服务暂时不可用，请稍后重试'},502)}const data=await response.json() as {status?:string;output?:{type:string;content?:{type:string;text?:string}[]}[]};if(data.status!=='completed')return json({error:'方案未生成完整，请减少场景复杂度后重试'},502);const text=(data.output??[]).filter(o=>o.type==='message').flatMap(o=>o.content??[]).filter(c=>c.type==='output_text').map(c=>c.text??'').join('');try{const plan=validatePlan(JSON.parse(text));return json({plan})}catch{return json({error:'Agent 方案未通过场景验证，请重新生成或简化需求'},422)}}catch{return json({error:controller.signal.aborted?'生成已取消或超时，请重试':'无法连接 AI 服务，请稍后重试'},504)}finally{clearTimeout(timer);request.signal.removeEventListener('abort',cancel);bucket.active--}
}
