const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none'] });
  const p = await b.newPage();
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push('console.error: '+m.text()); });
  p.on('pageerror', e => errs.push('pageerror: '+e.message));
  p.on('requestfailed', r => errs.push('404/fail: '+r.url().replace('http://localhost:8080/','')));

  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8080/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1200));

  const info = await p.evaluate(() => {
    const cs = el => getComputedStyle(el);
    const h1 = document.querySelector('.hero h1');
    return {
      cards: document.querySelectorAll('#svc-grid .svc').length,
      fontsUsed: {
        h1: cs(h1).fontFamily.split(',')[0] + ' :: ' + cs(h1).fontSize + ' / lh ' + cs(h1).lineHeight,
        eyebrow: cs(document.querySelector('.eyebrow')).fontFamily.split(',')[0],
        body: cs(document.body).fontFamily.split(',')[0]
      },
      loaded: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight).slice(0,8),
      heroOverflowsX: document.documentElement.scrollWidth > window.innerWidth,
      scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      status: document.querySelector('.status[data-status]').textContent.replace(/\s+/g,' ').trim(),
      priceAlign: (()=>{const c=document.querySelector('.svc');const f=c.querySelector('.svc-foot');return {cardW:Math.round(c.getBoundingClientRect().width), footJustify:getComputedStyle(f).justifyContent};})(),
      sectionHeads: [...document.querySelectorAll('.section-head')].length,
      h1Overflow: (()=>{const h=document.querySelector('.hero h1 .big');return {text:h.textContent.trim(),w:Math.round(h.getBoundingClientRect().width),colW:Math.round(document.querySelector('.hero-copy').getBoundingClientRect().width),clipped:h.scrollWidth>h.clientWidth+1};})(),
      iconChecks: (()=>{const u=[...document.querySelectorAll('use')];const bad=u.filter(x=>{const r=x.getBoundingClientRect();return r.width<4||r.height<4;});return {uses:u.length, tooSmall:bad.length};})(),
      carousel: (()=>{const t=document.querySelector('#car-track'),c=document.querySelector('.carousel');const i=[...document.querySelectorAll('#car-dots button')].findIndex(b=>b.getAttribute('aria-current')==='true');const slide=document.querySelectorAll('#car-track .slide')[i].getBoundingClientRect();return {index:i,slideLeftOffset:Math.round(slide.left-c.getBoundingClientRect().left),slideW:Math.round(slide.width),carW:Math.round(c.getBoundingClientRect().width)};})(),
      imgStatus: [...document.querySelectorAll('.g-item img')].map(i => i.getAttribute('src') + ':' + (i.complete && i.naturalWidth ? 'ok' : 'broken'))
    };
  });
  console.log('=== RENDER CHECK ==='); console.log(JSON.stringify(info, null, 1));

  await p.screenshot({ path: 'shot-hero.png' });
  await p.evaluate(() => document.querySelector('#services').scrollIntoView());
  await new Promise(r => setTimeout(r, 900));
  await p.screenshot({ path: 'shot-services.png' });
  await p.evaluate(() => document.querySelector('#gallery').scrollIntoView());
  await new Promise(r => setTimeout(r, 700));
  await p.screenshot({ path: 'shot-gallery.png' });
  await p.evaluate(() => document.querySelector('#book').scrollIntoView());
  await new Promise(r => setTimeout(r, 700));
  await p.screenshot({ path: 'shot-book.png' });
  await p.evaluate(() => document.querySelector('#reviews').scrollIntoView());
  await new Promise(r => setTimeout(r, 700));
  await p.screenshot({ path: 'shot-reviews.png' });
  await p.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await new Promise(r => setTimeout(r, 500));
  await p.screenshot({ path: 'shot-contact.png' });

  // real interaction: filter + search + book
  const inter = await p.evaluate(async () => {
    document.querySelector('#filters [data-filter="colour"]').click();
    await new Promise(r=>setTimeout(r,60));
    const visible = [...document.querySelectorAll('#svc-grid .svc:not(.is-hidden)')].length;
    document.querySelector('#filters [data-filter="all"]').click();
    const s = document.querySelector('#svc-search'); s.value='kids'; s.dispatchEvent(new Event('input',{bubbles:true}));
    const afterSearch = [...document.querySelectorAll('#svc-grid .svc:not(.is-hidden) h3')].map(h=>h.textContent);
    s.value=''; s.dispatchEvent(new Event('input',{bubbles:true}));
    document.querySelector('#svc-grid .svc[data-id="beard"]').click();
    return { colourVisible: visible, afterSearch, selected: document.querySelector('#service').value };
  });
  await new Promise(r=>setTimeout(r,1200));
  console.log('\n=== INTERACTION ==='); console.log(JSON.stringify(inter));

  const sent = await p.evaluate(() => {
    let url=null; const orig=window.open; window.open=u=>{url=u;return{closed:false};};
    document.querySelector('#name').value='Ssaabako Peter';
    document.querySelector('#phone').value='0772345678';
    document.querySelector('#date').value='2026-10-11';
    document.querySelector('#time').value='17:00';
    ['name','phone','date','time'].forEach(id=>document.querySelector('#'+id).dispatchEvent(new Event('input',{bubbles:true})));
    document.querySelector('#book-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    window.open=orig; return decodeURIComponent((url||'').split('?text=')[1]||'NOT OPENED');
  });
  console.log('\n=== WHATSAPP PAYLOAD ===\n' + sent);

  // mobile
  const m = await b.newPage();
  await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await m.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });
  await new Promise(r=>setTimeout(r,1000));
  const mob = await m.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
    scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
    offender: (()=>{ let w=null; document.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect(); if(r.right>window.innerWidth+1 && !w) w=el.tagName+'.'+(el.className.baseVal!==undefined?'svg':String(el.className).split(' ')[0])+' right='+Math.round(r.right);}); return w; })(),
    burgerVisible: getComputedStyle(document.querySelector('#burger')).display
  }));
  console.log('\n=== MOBILE 390px ==='); console.log(JSON.stringify(mob));
  await m.screenshot({ path: 'shot-mobile-hero.png' });
  await m.evaluate(()=>document.querySelector('#services').scrollIntoView());
  await new Promise(r=>setTimeout(r,800));
  await m.screenshot({ path: 'shot-mobile-services.png' });
  await m.evaluate(()=>document.querySelector('#burger').click());
  await new Promise(r=>setTimeout(r,600));
  await m.screenshot({ path: 'shot-mobile-drawer.png' });

  console.log('\n=== NETWORK/CONSOLE ERRORS ===');
  console.log(errs.length ? errs.join('\n') : 'none');
  await b.close();
})().catch(e => { console.error('HARNESS:', e.message); process.exit(1); });
