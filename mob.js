const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,800));
const o=await p.evaluate(()=>{
  const box=el=>{const r=el.getBoundingClientRect();return {x:Math.round(r.x),w:Math.round(r.width),right:Math.round(r.right),disp:getComputedStyle(el).display};};
  const nav=document.querySelector('.nav');
  return {vw:innerWidth, nav:box(nav), brand:box(document.querySelector('.brand')),
    links:box(document.querySelector('.nav-links')), cta:box(document.querySelector('.nav-cta')),
    status:box(document.querySelector('.status--nav')), burger:box(document.querySelector('#burger')),
    navPad:getComputedStyle(document.querySelector('.nav')).paddingInline,
    burgerClickable: (()=>{const r=document.querySelector('#burger').getBoundingClientRect();const el=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);return el? el.tagName+'.'+el.className : 'none';})()};
});
console.log(JSON.stringify(o,null,1));
await b.close();})();
