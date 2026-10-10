const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
for (const w of [320,360,390,834,1024]) {
  const p=await b.newPage();
  await p.setViewport({width:w,height:900,isMobile:w<820,hasTouch:w<820,deviceScaleFactor:2});
  await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
  await p.evaluate(()=>{window.scrollTo(0,document.body.scrollHeight)});
  await new Promise(r=>setTimeout(r,900));
  const o=await p.evaluate((w)=>{
    const clipped=(el)=>{for(let a=el.parentElement;a;a=a.parentElement){const cs=getComputedStyle(a);
      if(/hidden|clip|auto|scroll/.test(cs.overflowX)) {const ar=a.getBoundingClientRect();
        // ancestor clips horizontally only if it actually scrolls/clips (not auto-with-scrollable)
        if(cs.overflowX==='hidden'||cs.overflowX==='clip') return true;} } return false;};
    const bad=[];
    document.querySelectorAll('body *').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.width===0||r.height===0) return;
      if(r.right>w+1 && !clipped(el)) bad.push({el:el.tagName+'.'+(typeof el.className==='string'?el.className.split(' ').slice(0,2).join('.'):''),right:Math.round(r.right),w:Math.round(r.width)});
    });
    return {scrollW:document.documentElement.scrollWidth, innerW:innerWidth, offenders:bad.slice(0,10)};
  }, w);
  console.log('== viewport', w, '==', JSON.stringify(o));
  await p.close();
}
await b.close();})();
