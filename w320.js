const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
for (const opt of [{isMobile:false},{isMobile:true,hasTouch:true}]) {
  const p=await b.newPage();
  await p.setViewport(Object.assign({width:320,height:700,deviceScaleFactor:2},opt));
  await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
  const o=await p.evaluate(()=>{
    const r=document.querySelector('#burger').getBoundingClientRect();
    return {innerW:innerWidth, scrollW:document.documentElement.scrollWidth,
      burger:{left:Math.round(r.left),right:Math.round(r.right)},
      wide:[...document.querySelectorAll('main *, header *, footer *')].filter(e=>{const q=e.getBoundingClientRect();return q.width>innerWidth+1 && getComputedStyle(e).position!=='fixed' && getComputedStyle(e).position!=='absolute';}).slice(0,4).map(e=>e.tagName+'.'+String(e.className).split(' ')[0]+':'+Math.round(e.getBoundingClientRect().width))};
  });
  console.log(JSON.stringify(opt), '→', JSON.stringify(o));
  if(!opt.isMobile){ await p.screenshot({path:'shot-320.png'}); }
  await p.close();
}
await b.close();})();
