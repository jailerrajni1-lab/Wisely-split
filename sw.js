const V='splitwise-v3',LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil((async()=>{
  const c=await caches.open(V);
  await Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})));          // one missing file must not break installation
  await c.add(new Request(LIB,{mode:'no-cors'})).catch(()=>{});      // sign-in library, so the app can start offline
  await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('splitwise-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
const net=r=>new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('timeout')),4000);fetch(r).then(x=>{clearTimeout(t);ok(x)},x=>{clearTimeout(t);no(x)})});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||!/^https?:$/.test(u.protocol)||u.hostname.endsWith('supabase.co'))return;
  e.respondWith(net(r).then(res=>{
    if(res.status===200||res.type==='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp)).catch(()=>{})}
    return res;
  }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html').then(x=>x||caches.match('./')):Response.error()))));
});
