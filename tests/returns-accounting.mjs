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
w.localStorage.setItem("sl_sales",JSON.stringify([
  {id:501,date:"2026-11-25",invoice:"SALE-501",party:"Return Customer",qty:10,total:100,taxable:95,tax:5,cost:60,paid:20}
]));
w.localStorage.setItem("sl_sales_returns",JSON.stringify([
  {id:601,originalId:501,invoice:"SALE-501",date:"2026-11-25",item:"Rice",party:"Return Customer",qty:2,rate:10,amount:20,kind:"Sales return"}
]));
w.localStorage.setItem("sl_customers",JSON.stringify([{name:"Return Customer",opening:10}]));
w.localStorage.setItem("sl_payments",JSON.stringify([{id:701,type:"Customer",party:"Return Customer",amount:5}]));
const totals=w.totals();
assert.equal(totals.sales,79,"Net invoice sales subtract returned value and its GST");
assert.equal(totals.profit,27,"Profit reverses returned sales revenue and returned goods cost");
assert.equal(w.partyOutstanding("Customer","Return Customer"),64,"Customer balance subtracts sales returns including GST");
assert.equal(w.outstandingTotal("Customer"),64,"Total receivables include sales returns including GST");
w.taxReports();
assert.match(w.document.querySelector("#view").textContent,/₹75/,"Taxable sales subtract returned value");
assert.match(w.document.querySelector("#view").textContent,/₹4/,"Output GST reverses the proportional returned tax");
w.reports();
assert.match(w.document.querySelector("#view").textContent,/₹27/,"Profit report includes returned sales and returned cost");
w.ledgerPage();
assert.match(w.document.querySelector("#ledgerrows").textContent,/₹27/,"Customer ledger gross profit includes returned goods");
assert.match(w.document.querySelector("#ledgerrows").textContent,/₹64/,"Customer ledger balance includes returned invoice value and GST");
assert.equal(errors.length,0,"No runtime errors: "+errors.join("; "));
console.log("PASS sales-return net sales, gross profit, GST and customer outstanding calculations");
dom.window.close();
