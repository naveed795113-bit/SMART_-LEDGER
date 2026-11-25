import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import assert from "node:assert/strict";

const errors=[];
const vc=new VirtualConsole();
vc.on("jsdomError",e=>errors.push(e.message));
const dom=new JSDOM(readFileSync("index.html","utf8"),{
  url:"https://smartledger.test/",
  runScripts:"dangerously",
  pretendToBeVisual:true,
  virtualConsole:vc,
  beforeParse(w){
    w.matchMedia=()=>({matches:false,addEventListener(){}});
    w.alert=()=>{};
    w.confirm=()=>true;
  }
});
const w=dom.window;
await new Promise(resolve=>setTimeout(resolve,30));
w.document.querySelector("#modalbody").innerHTML='<form><div class="formgrid"><div class="field"><input id="tinvoice"></div></div></form>';
w.currentTxn="purchases";
w.transactionForm=function(kind){w.currentTxn=kind;};
w.eval(readFileSync("offline-ocr-v69.js","utf8"));
w.transactionForm("purchases");
await new Promise(resolve=>setTimeout(resolve,30));
assert.ok(w.document.querySelector("#slOcrTools"),"Purchase form exposes the offline bill scanner");
assert.ok(w.document.querySelector("#slOcrFile"),"Scanner accepts an invoice image");
assert.deepEqual([...w.document.querySelectorAll("#slOcrLanguage option")].map(x=>x.value),["eng","eng+hin","hin","urd","eng+urd"],"English, Hindi and Urdu OCR language choices are available");
assert.equal(typeof w.SmartLedgerOCR.resolve,"function","Native OCR callback handler is registered");
assert.equal(errors.length,0,"No runtime errors: "+errors.join("; "));
console.log("PASS offline OCR purchase-form interface and language selection");
dom.window.close();
