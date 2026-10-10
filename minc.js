const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
// desktop viewport, then squeeze html to 320px so we can see what refuses to shrink
await p.setViewport({width:1400,height:900});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
const o=await p.evaluate(()=>{
  document.documentElement.style.width='320px';
  document.body.style.width='320px';
  const out=[];
  document.querySelectorAll('body *').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.width>321 && r.height>0){
      const par=el.parentElement, pr=par?par.getBoundingClientRect():{width:0};
      out.push({el:el.tagName+'.'+(typeof el.className==='string'?el.className.split(' ').slice(0,2).join('.'):''),
        w:Math.round(r.width), parent:par?par.tagName+'.'+String(par.className).split(' ')[0]:'', pw:Math.round(pr.width),
        ws:getComputedStyle(el).whiteSpace, txt:(el.textContent||'').trim().slice(0,34)});
    }
  });
  document.documentElement.style.width=''; document.body.style.width='';
  return out.slice(0,14);
});
console.log(o.map(x=>JSON.stringify(x)).join('\n'));
await b.close();})();
