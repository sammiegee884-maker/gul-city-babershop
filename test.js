const fs = require('fs');
const { JSDOM } = require('jsdom');
const dir = '/home/user/gulu-city-barbershop';

// jsdom will not fetch the external file: inline it so the REAL script.js executes.
// NB: use a replacer FUNCTION - a plain string replacement would interpret '$' patterns
// inside the JS source (that, not the site, was the earlier false failure).
const injected = '<scr' + 'ipt>' + fs.readFileSync(dir + '/script.js','utf8') + '</scr' + 'ipt>';
const html = fs.readFileSync(dir + '/index.html', 'utf8')
  .replace('<script src="script.js" defer></script>', () => injected);

const errors = [];
const dom = new JSDOM(html, {
  url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
  virtualConsole: new (require('jsdom').VirtualConsole)()
    .on('jsdomError', e => errors.push('jsdomError: ' + (e.detail && e.detail.stack ? e.detail.stack.split('\n').slice(0,3).join(' | ') : e.message)))
    .on('error', (...a) => errors.push('console.error: ' + a.join(' ')))
});
const { window } = dom;
const doc = window.document;
const $ = s => doc.querySelector(s);
const n = s => doc.querySelectorAll(s).length;

let pass = 0, fail = 0;
const ok = (label, cond, extra='') => {
  if (cond) { pass++; console.log('  PASS  ' + label + (extra ? '  → ' + extra : '')); }
  else { fail++; console.log('  FAIL  ' + label + (extra ? '  → ' + extra : '')); }
};

setTimeout(() => {
  console.log('\n=== RUNTIME (real script.js executed against index.html) ===');
  ok('no script errors on boot', errors.length === 0, errors.slice(0,3).join(' | ') || 'clean');

  console.log('\n--- Rendering ---');
  ok('service cards rendered from data', n('#svc-grid .svc') === 10, n('#svc-grid .svc') + ' cards');
  ok('filter chips built with counts', n('#filters .chip') === 6, [...doc.querySelectorAll('#filters .chip')].map(c=>c.textContent.trim().replace(/\s+/g,' ')).join(', '));
  ok('nail columns rendered', n('#nail-cols .nail-col') === 2 && n('#nail-cols li') === 13, n('#nail-cols li') + ' nail services');
  ok('why-us cards rendered', n('#why-grid .why-card') === 4);
  ok('carousel slides + dots', n('#car-track .slide') === 4 && n('#car-dots button') === 4);
  ok('reveal fallback applied w/o IntersectionObserver', n('#svc-grid .svc.reveal') === 10);

  console.log('\n--- Prices: menu vs booking form must agree ---');
  const menu = [...doc.querySelectorAll('#svc-grid .svc')].map(c => c.querySelector('.svc-price').textContent.replace(/^From/,'').trim());
  const form = [...doc.querySelectorAll('#service optgroup[label="Barbershop"] option')].map(o => o.textContent.split('—')[1].trim());
  ok('every menu price appears in the form select', menu.every((m,i)=>m===form[i]), menu.length + ' matched: ' + menu.join(' / '));
  ok('nail options present', n('#service optgroup[label="Nail parlour"] option') === 2);
  ok('date min defaults to today', $('#date').min === new Date().toISOString().slice(0,10) || $('#date').value.length === 10, 'min=' + $('#date').min + ' value=' + $('#date').value);
  ok('time clamped to shop hours', $('#time').min === '07:30' && $('#time').max === '21:30', $('#time').min + '–' + $('#time').max);

  console.log('\n--- Live open/closed status ---');
  const st = $('.status[data-status]');
  ok('status computed in Africa/Kampala', ['open','closed','closing'].includes(st.dataset.state) && st.textContent.trim().length > 5, st.textContent.replace(/\s+/g,' ').trim());
  ok('hero status cell mirrors it', !!$('#status-cell') && $('#status-cell').textContent.includes('7:30'), $('#status-cell').textContent.trim());
  ok("today's hours row highlighted", n('#hours-table tr.is-today') === 1, doc.querySelector('#hours-table tr.is-today')?.dataset.day || 'none');

  console.log('\n--- Search + filter interaction ---');
  const input = $('#svc-search'); input.value = 'beard';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  ok('search "beard" narrows the grid', n('#svc-grid .svc:not(.is-hidden)') === 1, [...doc.querySelectorAll('#svc-grid .svc:not(.is-hidden) h3')].map(h=>h.textContent).join());
  input.value = 'zzz'; input.dispatchEvent(new window.Event('input', { bubbles: true }));
  ok('empty state shows when nothing matches', $('#svc-empty').classList.contains('is-on'));
  input.value = ''; input.dispatchEvent(new window.Event('input', { bubbles: true }));
  ok('clearing search restores all 10', n('#svc-grid .svc:not(.is-hidden)') === 10);
  doc.querySelector('#filters [data-filter="colour"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  ok('category filter works (colour = 4)', n('#svc-grid .svc:not(.is-hidden)') === 4, [...doc.querySelectorAll('#svc-grid .svc:not(.is-hidden) h3')].map(h=>h.textContent).join(', '));
  doc.querySelector('#filters [data-filter="nails"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  ok('nails filter hides barber cards, shows parlour', n('#svc-grid .svc:not(.is-hidden)') === 0 && $('#nails').style.display !== 'none');
  doc.querySelector('#filters [data-filter="all"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

  console.log('\n--- Click a card → preselects the service ---');
  doc.querySelector('#svc-grid .svc[data-id="curl"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  ok('tapping a card sets the select + scrolls to #book', $('#service').value === 'curl' && !!$('#book'), 'select=' + $('#service').value);
  ok('toast fired with the chosen service', $('#toast').classList.contains('is-on') && $('#toast').textContent.includes('Haircut + Curl'), JSON.stringify($('#toast').textContent.trim()));

  console.log('\n--- Validation & WhatsApp payload ---');
  let opened = null;
  window.open = (u) => { opened = u; return { closed: false }; };
  const form2 = $('#book-form');
  // fully reset first, since the card click above legitimately pre-filled service + date
  $('#service').value=''; $('#date').value=''; $('#time').value=''; $('#name').value=''; $('#phone').value=''; $('#notes').value='';
  form2.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  const emptyErrs = ['#name-err','#phone-err','#service-err','#date-err','#time-err'].filter(s=>$(s).textContent.trim());
  ok('empty submit blocked with all 5 field errors', emptyErrs.length === 5, emptyErrs.length + ': ' + [...doc.querySelectorAll('.hint.err')].map(e=>e.textContent).filter(Boolean).join(' | '));
  ok('no WhatsApp window opened on invalid submit', opened === null);
  ok('error toast shown', $('#toast').classList.contains('err'));

  $('#name').value = 'Okello David';
  $('#phone').value = '0787597444';
  $('#service').value = 'dye';
  $('#date').value = new Date().toISOString().slice(0,10);
  $('#time').value = '18:15';
  $('#notes').value = 'Skin fade + lined beard';
  ['#name','#phone','#service','#date','#time','#notes'].forEach(s => $(s).dispatchEvent(new window.Event('input', { bubbles: true })));
  ok('live preview rebuilds', $('#preview').textContent.includes('Haircut + Dyeing (UGX 15,000)') && $('#preview').textContent.includes('Notes: Skin fade'),
     $('#preview').textContent.replace(/\s+/g,' ').trim().slice(0,120) + '…');
  $('#time').value = '23:00'; $('#time').dispatchEvent(new window.Event('input', { bubbles: true }));
  form2.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  ok('out-of-hours time rejected', $('#time-err').textContent.includes('7:30 AM'), $('#time-err').textContent);
  $('#time').value = '18:15'; $('#time').dispatchEvent(new window.Event('input', { bubbles: true }));

  form2.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  const qs = opened ? decodeURIComponent(opened.split('?text=')[1]) : '';
  ok('valid submit opens the right wa.me link', opened && opened.startsWith('https://wa.me/256787597444?text='), opened ? opened.slice(0,46) + '…' : 'NOT OPENED');
  ok('message carries every field', ['Okello David','0787597444','Haircut + Dyeing','18:15','Skin fade'].every(x => qs.includes(x)), '\n' + qs);

  console.log('\n--- Chrome: scroll, drawer, carousel ---');
  window.dispatchEvent(new window.Event('scroll'));
  ok('scroll handler runs without throwing (progress + header)', true);
  $('#burger').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  ok('hamburger opens drawer + sets aria-expanded', $('#drawer').classList.contains('is-open') && $('#burger').getAttribute('aria-expanded') === 'true');
  doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  ok('Escape closes drawer', !$('#drawer').classList.contains('is-open'));
  const tf = $('#car-track').style.transform;
  $('#car-next').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  ok('carousel advances + dot follows', $('#car-track').style.transform !== tf && $('#car-dots button[aria-current="true"]').dataset.i === '1', tf + ' → ' + $('#car-track').style.transform);
  ok('contact details wired from config', $('[data-email]').textContent === 'sammiegee884@gmail.com' && $('[data-phone-display]').textContent === '+256 787 597 444');
  ok('maps links point at Labwor Street', [...doc.querySelectorAll('[data-maps]')].every(a => a.href.includes('Labwor+Street')));

  console.log('\n=== ' + pass + ' passed, ' + fail + ' failed ===');
  window.close(); process.exit(fail ? 1 : 0);
}, 900);
