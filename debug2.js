const fs=require("fs");const {JSDOM,VirtualConsole}=require("jsdom");
const dir="/home/user/gulu-city-barbershop";
const raw=fs.readFileSync(dir+"/index.html","utf8");
const js=fs.readFileSync(dir+"/script.js","utf8");
const marker = '<' + 'script src="script.js" defer></' + 'script>';
console.log("marker present in html:", raw.includes(marker));
const html=raw.replace(marker, '<' + 'script' + '>' + js + '</' + 'script' + '>');
console.log("inlined:", html.includes("sendToWhatsApp"), "| html length:", html.length);
const vc=new VirtualConsole();
vc.on("jsdomError",e=>console.log("JSDOM ERROR:\n"+String(e.stack||e.message).split("\n").slice(0,7).join("\n")));
const dom=new JSDOM(html,{url:"http://localhost/",runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc});
setTimeout(()=>{const d=dom.window.document;
  console.log("cards:", d.querySelectorAll("#svc-grid .svc").length);
  console.log("grid:", !!d.querySelector("#svc-grid"), "| search:", !!d.querySelector("#svc-search"),
    "| search tag:", d.querySelector("#svc-search") && d.querySelector("#svc-search").tagName);
  console.log("scripts in doc:", d.querySelectorAll("script").length);
  process.exit(0);
},800);
