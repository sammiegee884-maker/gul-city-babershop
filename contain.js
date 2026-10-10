const puppeteer=require('puppeteer');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setViewport({width:1400,height:900});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle2'});
for (const css of ['contain:inline-size','contain:size','overflow:clip', 'contain:layout paint inline-size']) {
  const r=await p.evaluate((css)=>{
    const m=document.querySelector('.marquee'); m.setAttribute('style',css);
    const prev=document.querySelector('main').style.width;
    const mc=document.querySelector('main').offsetWidth;
    document.querySelector('main').style.width='min-content';
    const mcm=document.querySelector('main').offsetWidth;
    document.querySelector('main').style.width=prev; m.removeAttribute('style');
    // also check the marquee still shows its row height
    const h=document.querySelector('.marquee').getBoundingClientRect().height;
    return {mainMinContent:mcm, marqueeH:Math.round(h)};
  },css);
  console.log(css.padEnd(30), JSON.stringify(r));
}
await b.close();})();
