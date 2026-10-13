import {build} from 'vite';
import {readFile,writeFile,readdir,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
// The Worker serves the exact built static files without relying on an unprovisioned binding.
await build({configFile:false,build:{ssr:'server/index.ts',outDir:'.worker-build',rollupOptions:{output:{entryFileNames:'worker.js'}}}});
const assets={};const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.glb':'model/gltf-binary','.txt':'text/plain; charset=utf-8','.png':'image/png'};
async function collect(dir,prefix=''){for(const item of await readdir(dir,{withFileTypes:true})){const rel=prefix+'/'+item.name,filename=path.join(dir,item.name);if(item.isDirectory())await collect(filename,rel);else assets[rel]=[mime[path.extname(filename)]??'application/octet-stream',(await readFile(filename)).toString('base64')]}}
await collect('dist/client');
let worker=await readFile('.worker-build/worker.js','utf8');worker=worker.replace(/export\s*\{\s*(\w+)\s+as\s+default\s*\};?\s*$/, 'const apiWorker=$1;');if(!worker.includes('const apiWorker='))throw new Error('Worker export missing');
worker+='\nconst staticFiles='+JSON.stringify(assets)+';\nexport default {async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname.startsWith("/api/"))return apiWorker.fetch(request,env,ctx);if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed",{status:405});const asset=staticFiles[u.pathname==="/"?"/index.html":u.pathname];if(!asset)return new Response("Not found",{status:404});const bytes=request.method==="HEAD"?null:Uint8Array.from(atob(asset[1]),c=>c.charCodeAt(0));return new Response(bytes,{headers:{"Content-Type":asset[0],"Cache-Control":u.pathname.startsWith("/assets/")?"public,max-age=31536000,immutable":"no-cache","X-Content-Type-Options":"nosniff"}})}};\n';
await mkdir('dist/server',{recursive:true});await writeFile('dist/server/index.js',worker);await mkdir('dist/.openai',{recursive:true});await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json'));await rm('.worker-build',{recursive:true,force:true});
console.log('Built Worker with '+Object.keys(assets).length+' static assets');
