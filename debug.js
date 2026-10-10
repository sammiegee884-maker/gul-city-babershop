const fs=require('fs');const {JSDOM}=require('jsdom');
const dir='/home/user/gulu-city-barbershop';
const html=fs.readFileSync(dir+'/index.html','utf8');
const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;const doc=window.document;
console.log('#svc-search ->', doc.querySelector('#svc-search'));
console.log('typeof addEventListener ->', typeof (doc.querySelector('#svc-search')||{}).addEventListener);
console.log('grid node ->', doc.querySelector('#svc-grid') && doc.querySelector('#svc-grid').tagName);
try{ window.eval(fs.readFileSync(dir+'/script.js','utf8')); }
catch(e){ console.log('\nTHROWN:', e.stack.split('\n').slice(0,6).join('\n')); }
