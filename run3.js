const fs=require("fs");const {JSDOM,VirtualConsole}=require("jsdom");
const vc=new VirtualConsole();
["log","error","warn","info"].forEach(k=>vc.on(k,(...a)=>console.log("["+k+"]",...a)));
vc.on("jsdomError",e=>console.log("[jsdomError]", (e.detail&&e.detail.stack)?e.detail.stack.split("\n").slice(0,4).join(" | "):e.message));
const dom=new JSDOM(fs.readFileSync("combined.html","utf8"),{url:"http://localhost/",runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc});
setTimeout(()=>{const d=dom.window.document;console.log("cards:",d.querySelectorAll("#svc-grid .svc").length);process.exit(0);},900);
