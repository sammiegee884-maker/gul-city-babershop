const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:1400,height:900});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
const o=await p.evaluate(()=>{
  const res=[];
  document.querySelectorAll('body *').forEach(el=>{
    const cs=getComputedStyle(el);
    if(cs.position==='fixed'||cs.position==='absolute'||cs.display==='none') return;
    const prev=el.style.width;
    el.style.width='min-content';
    const mc=el.offsetWidth;
    el.style.width=prev;
    if(mc>300) res.push({mc, el:el.tagName+'.'+(typeof el.className==='string'?el.className.split(' ').slice(0,2).join('.'):''),
      txt:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,38)});
  });
  res.sort((a,b)=>b.mc-a.mc);
  return res.slice(0,10);
});
console.log(o.map(x=>`${String(x.mc).padStart(5)}  ${x.el}  «${x.txt}»`).join('\n')||'nothing needs more than 300px');
await b.close();})();
