const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:320,height:700,deviceScaleFactor:2});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
const o=await p.evaluate(()=>{
  const clipped=(el)=>{for(let a=el.parentElement;a;a=a.parentElement){const cs=getComputedStyle(a);
    if(cs.overflowX==='hidden'||cs.overflowX==='clip') return true;} return false;};
  const hits=[];
  document.querySelectorAll('html *').forEach(el=>{
    const r=el.getBoundingClientRect(); if(!r.width||!r.height) return;
    if(r.right>innerWidth+0.5 && !clipped(el)) hits.push({right:Math.round(r.right),pos:getComputedStyle(el).position,
      el:el.tagName+'.'+(typeof el.className==='string'?el.className.split(' ').slice(0,2).join('.'):''),
      txt:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,30)});
  });
  hits.sort((a,b)=>b.right-a.right);
  return {innerW:innerWidth, scrollW:document.documentElement.scrollWidth, bodyScrollW:document.body.scrollWidth, hits:hits.slice(0,8)};
});
console.log(JSON.stringify(o,null,1));
await b.close();})();
