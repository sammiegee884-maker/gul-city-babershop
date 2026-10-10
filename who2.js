const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:320,height:700});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
const base=await p.evaluate(()=>document.body.scrollWidth);
console.log('baseline body.scrollWidth =', base);
for (const sel of ['.fabs','.marquee','.hero-spot','.drawer','.scroll-progress','.hero-card','.site-header','.hero','.hero-grid','.toast','.svc-grid','.nails','#book-form']) {
  const r=await p.evaluate((sel)=>{
    const els=[...document.querySelectorAll(sel)]; const prev=els.map(e=>e.style.display);
    els.forEach(e=>e.style.display='none');
    const w=document.body.scrollWidth;
    els.forEach((e,i)=>e.style.display=prev[i]);
    return {count:els.length, after:w};
  }, sel);
  console.log(String(sel).padEnd(14), 'hidden', String(r.count).padStart(2), '→ scrollWidth', r.after, r.after<base? '  <<< CULPRIT':'');
}
await b.close();})();
