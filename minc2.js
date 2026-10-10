const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:320,height:700,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
const o=await p.evaluate(()=>{
  const vw=innerWidth, list=[];
  document.querySelectorAll('body *').forEach(el=>{
    const cs=getComputedStyle(el); if(cs.position==='fixed'||cs.position==='absolute') return;
    const r=el.getBoundingClientRect();
    // leaf-most elements only (no child wider than itself) keeps the list short
    const widerChild=[...el.children].some(c=>c.getBoundingClientRect().width>r.width-1);
    if(r.width>vw-2 && !widerChild && r.height>0) list.push({el:el.tagName+'.'+(typeof el.className==='string'?el.className.split(' ')[0]:''),
      w:Math.round(r.width),vw,ws:cs.whiteSpace,txt:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)});
  });
  return {vw, scrollW:document.documentElement.scrollWidth, list:list.slice(0,12)};
});
console.log('innerWidth',o.vw,'scrollWidth',o.scrollW);
console.log(o.list.map(x=>JSON.stringify(x)).join('\n')||'no in-flow element spans the full min-content width');
await b.close();})();
