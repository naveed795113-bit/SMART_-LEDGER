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
    w.URL.createObjectURL=()=>"blob:test";
    w.URL.revokeObjectURL=()=>{};
    w.HTMLAnchorElement.prototype.click=function(){};
  }
});
const w=dom.window;
await new Promise(resolve=>setTimeout(resolve,40));
w.go("Accounts");
w.localStorage.setItem("sl_items",JSON.stringify([{name:"Rice",qty:2,purchase:6,price:15,unit:"kg"}]));
w.localStorage.setItem("sl_sales",JSON.stringify([{id:810,date:"2026-11-25",invoice:"S-810",party:"Customer",item:"Rice",qty:10,rate:10,total:100,taxable:95,tax:5,cost:60,paid:100}]));
w.localStorage.setItem("sl_purchases",JSON.stringify([{id:811,date:"2026-11-25",invoice:"P-811",party:"Supplier",item:"Rice",qty:10,rate:10,total:105,taxable:100,tax:5,paid:105}]));
w.localStorage.setItem("sl_batches",JSON.stringify([]));
assert.equal(w.saveReturn.__v40,true,"Automatic return-journal hook is installed");
w.returnForm("sales");
w.document.querySelector("#returnqty").value="2";
w.document.querySelector("#returnrate").value="10";
w.saveReturn({preventDefault(){}}, "sales");
const savedSalesReturns=JSON.parse(w.localStorage.getItem("sl_sales_returns")||"[]");
assert.equal(savedSalesReturns.length,1,"Sales return transaction was saved; posting errors: "+w.localStorage.getItem("sl_v40_posting_errors"));
let journals=JSON.parse(w.localStorage.getItem("sl_account_journals")||"[]");
assert.equal(journals.length,1,"Sales return creates one automatic journal");
assert.equal(journals[0].sourceType,"return");
assert.equal(journals[0].lines.reduce((s,x)=>s+Number(x.debit),0),33,"Sales return debits sales returns, output GST and returned stock cost");
assert.equal(journals[0].lines.reduce((s,x)=>s+Number(x.credit),0),33,"Sales return credits cash and reverses COGS");
assert.ok(journals[0].lines.some(x=>x.account==="2100"&&x.debit===1),"Sales return reverses output GST");
w.returnForm("purchases");
w.document.querySelector("#returnqty").value="1";
w.document.querySelector("#returnrate").value="10";
w.saveReturn({preventDefault(){}}, "purchases");
journals=JSON.parse(w.localStorage.getItem("sl_account_journals")||"[]");
assert.equal(journals.length,2,"Purchase return creates one automatic journal");
assert.equal(journals[1].lines.reduce((s,x)=>s+Number(x.debit),0),10.5,"Purchase return debits cash including GST");
assert.equal(journals[1].lines.reduce((s,x)=>s+Number(x.credit),0),10.5,"Purchase return credits inventory and input GST");
assert.ok(journals[1].lines.some(x=>x.account==="1300"&&x.credit===0.5),"Purchase return reverses input GST");
assert.equal(errors.length,0,"No runtime errors: "+errors.join("; "));
console.log("PASS sales and purchase return double-entry journals and proportional GST reversals");
dom.window.close();
