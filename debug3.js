const fs=require("fs");const {JSDOM,VirtualConsole}=require("jsdom");
const dir="/home/user/gulu-city-barbershop";
let js=fs.readFileSync(dir+"/script.js","utf8");
// instrument: report what `input` actually is, plus the real throwing line
js=js.replace('if (input) input.addEventListener("input", apply);',
  'console.log("DEBUG input =", Object.prototype.toString.call(input), "| has AE:", typeof input && typeof (input||{}).addEventListener, "| id:", input && input.id, "| outer:", String(input).slice(0,80)); if (input) input.addEventListener("input", apply);');
js='window.__boot=function(){try{arguments[0]&&0;}catch(e){}};\n'+js;
const html=fs.readFileSync(dir+"/index.html","utf8")
  .replace('<'+'script src="script.js" defer></'+'script+'>'.slice(0,0)+'', '') // no-op
  .replace('<'+'script src="script.js" defer></'+'script'+'>', '<'+'script>window.onerror=function(m,s,l,c,e){console.log("WINDOW ERROR: "+m+" @line "+l+":"+" "+(e&&e.stack?e.stack.split("\\n")[1]:""))};</'+'script'+'><'+'script'+'>\n'+js+'\n</'+'script'+'>');
const vc=new VirtualConsole();
vc.on("error",(...a)=>console.log("CONSOLE:",...a));
vc.on("jsdomError",e=>console.log("JSDOM ERROR:", e.detail && e.detail.stack ? e.detail.stack.split("\n").slice(0,4).join("\n") : e.message));
vc.sendTo(console, {omitJSDOMErrors:true});
new JSDOM(html,{url:"http://localhost/",runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc});
setTimeout(()=>process.exit(0),900);
