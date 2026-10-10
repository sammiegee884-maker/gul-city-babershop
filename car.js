const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
await p.evaluate(()=>document.querySelector('#reviews').scrollIntoView());
await new Promise(r=>setTimeout(r,600));
for(let i=0;i<5;i++){
  const o=await p.evaluate(()=>{
    const c=document.querySelector('.carousel').getBoundingClientRect();
    const vis=[...document.querySelectorAll('#car-track .slide')].map((s,k)=>({k,left:Math.round(s.getBoundingClientRect().left-c.left),w:Math.round(s.getBoundingClientRect().width)}));
    const idx=[...document.querySelectorAll('#car-dots button')].findIndex(d=>d.getAttribute('aria-current')==='true');
    const txt=document.querySelector('#car-track .slide[style], #car-track .slide') && document.querySelectorAll('#car-track .quote blockquote, #car-track .quote')[idx] ? (document.querySelectorAll('#car-track .slide')[idx].textContent||'').replace(/\s+/g,' ').trim().slice(0,42):'';
    return {idx, carW:Math.round(c.width), visible: vis.filter(v=>v.left>-50&&v.left<c.width+50), slide:txt};
  });
  console.log(JSON.stringify(o));
  await p.click('#car-next'); await new Promise(r=>setTimeout(r,800));
}
await p.screenshot({path:'shot-reviews2.png'});
await b.close();})();
