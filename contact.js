const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:1440,height:1000});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
await p.evaluate(()=>document.querySelector('#contact').scrollIntoView({block:'center'}));
await new Promise(r=>setTimeout(r,1600));
const o=await p.evaluate(()=>({
  cards:[...document.querySelectorAll('#contact .info')].map(c=>({
    cls:c.className, opacity:getComputedStyle(c).opacity, w:Math.round(c.getBoundingClientRect().width),
    left:Math.round(c.getBoundingClientRect().left), top:Math.round(c.getBoundingClientRect().top), h:Math.round(c.getBoundingClientRect().height)})),
  grid:getComputedStyle(document.querySelector('.contact-grid')).gridTemplateColumns
}));
console.log(JSON.stringify(o,null,1));
await p.screenshot({path:'shot-contact2.png'});
await b.close();})();
