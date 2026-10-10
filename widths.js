const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
for (const w of [1440,1200,1024,900,834,768,430,390,360,320]) {
  const p=await b.newPage();
  await p.setViewport({width:w,height:900,isMobile:w<820,hasTouch:w<820,deviceScaleFactor:2});
  await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,500));
  const o=await p.evaluate((w)=>{
    const r=document.querySelector('#burger').getBoundingClientRect();
    const navR=document.querySelector('.nav').getBoundingClientRect();
    const burgerVisible=getComputedStyle(document.querySelector('#burger')).display!=='none';
    const linkVisible=getComputedStyle(document.querySelector('.nav-links')).display!=='none';
    // which element is actually under the burger centre?
    const cx=r.x+r.width/2, cy=r.y+r.height/2;
    const under=document.elementFromPoint(cx,cy);
    // widest overflowing element, if any
    let worst=null;
    document.querySelectorAll('body *').forEach(el=>{const q=el.getBoundingClientRect();
      if(q.right>innerWidth+1 && !worst && getComputedStyle(el).position!=='fixed') worst=el.tagName+'.'+(typeof el.className==='string'?el.className.split(' ')[0]:'')+' right='+Math.round(q.right);});
    // clipped headline check
    const big=document.querySelector('.hero h1 .big');
    const clipped=[...document.querySelectorAll('.hero h1 .big, .hero h1 .sub, .section-head h2')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.trim().slice(0,18));
    return {
      pageOverflow: document.documentElement.scrollWidth>w+1, scrollW: document.documentElement.scrollWidth,
      burger: {shown:burgerVisible, onScreen: r.right<=w+1 && r.left>=0, clickable: !!under && (under.closest('#burger')?'yes':'blocked by '+under.tagName+'.'+under.className)},
      navMode: burgerVisible? 'drawer':'links', linksVisible: linkVisible,
      h1size: Math.round(parseFloat(getComputedStyle(big).fontSize))+'px',
      textClipped: clipped, widestOffender: worst
    };
  }, w);
  console.log(String(w).padStart(5), JSON.stringify(o));
  await p.close();
}
await b.close();})();
