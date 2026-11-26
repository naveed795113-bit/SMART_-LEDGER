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
w.eval(readFileSync("business-suite-v40.js","utf8"));
w.go("Accounts");
w.localStorage.setItem("sl_items",JSON.stringify([{name:"Rice",qty:2,purchase:6,price:15,unit:"kg"},{name:"Oil",qty:0,purchase:60,price:75,unit:"kg"}]));
w.localStorage.setItem("sl_sales",JSON.stringify([{id:810,date:"2026-11-25",invoice:"S-810",party:"Customer",item:"Rice",qty:10,rate:10,total:100,taxable:95,tax:5,cost:60,paid:100},{id:812,date:"2026-11-25",invoice:"S-812",party:"Customer",item:"Rice, Oil",qty:40,rate:1050,total:2625,taxable:2500,tax:125,cost:2100,paid:2625,supplyType:"intra",cgst:62.5,sgst:62.5,lines:[{item:"Rice",qty:10,unit:"kg",unitFactor:1,stockQty:10,rate:50,discount:0,gstRate:5,taxable:500,tax:25,total:525,cost:300},{item:"Oil",qty:2,unit:"tin",unitFactor:15,stockQty:30,rate:1000,discount:0,gstRate:5,taxable:2000,tax:100,total:2100,cost:1800}]}]));
w.localStorage.setItem("sl_purchases",JSON.stringify([{id:811,date:"2026-11-25",invoice:"P-811",party:"Supplier",item:"Rice",qty:10,rate:10,total:105,taxable:100,tax:5,paid:105}]));
w.localStorage.setItem("sl_batches",JSON.stringify([]));
assert.equal(w.saveReturn.__v40,true,"Automatic return-journal hook is installed");
w.returnForm("sales");
w.document.querySelector("#returntx").value="810";
w.setReturnMax();
w.document.querySelector("#returnqty").value="2";
w.document.querySelector("#returnrate").value="10";
w.saveReturn({preventDefault(){}}, "sales");
const savedSalesReturns=JSON.parse(w.localStorage.getItem("sl_sales_returns")||"[]");
assert.equal(savedSalesReturns.length,1,"Sales return transaction was saved; posting errors: "+w.localStorage.getItem("sl_v40_posting_errors"));
let journals=JSON.parse(w.localStorage.getItem("sl_account_journals")||"[]");
assert.equal(journals.length,1,"Sales return creates one automatic journal");
assert.equal(journals[0].sourceType,"return");
console.log("DEBUG_RETURN_RECORD",JSON.stringify(savedSalesReturns[0]));
console.log("DEBUG_RETURN_JOURNAL",JSON.stringify(journals[0].lines));
assert.equal(journals[0].lines.reduce((s,x)=>s+Number(x.debit),0),32,"Sales return debits sales returns, output GST and returned stock cost");
assert.equal(journals[0].lines.reduce((s,x)=>s+Number(x.credit),0),32,"Sales return credits customer receivables and reverses COGS");
assert.ok(journals[0].lines.some(x=>x.account==="2100"&&x.debit===1),"Sales return reverses output GST");
console.log("DEBUG_DEFAULT_SALES_RETURN",JSON.stringify(savedSalesReturns[0]),JSON.stringify(journals[0].lines));
assert.ok(journals[0].lines.some(x=>x.account==="1100"&&x.credit===21),"Default sales return reduces customer receivables instead of inventing a cash refund");
w.returnForm("purchases");
w.document.querySelector("#returnqty").value="1";
w.document.querySelector("#returnrate").value="10";
w.saveReturn({preventDefault(){}}, "purchases");
journals=JSON.parse(w.localStorage.getItem("sl_account_journals")||"[]");
assert.equal(journals.length,2,"Purchase return creates one automatic journal");
assert.equal(journals[1].lines.reduce((s,x)=>s+Number(x.debit),0),10.5,"Purchase return debits supplier payables including GST");
assert.equal(journals[1].lines.reduce((s,x)=>s+Number(x.credit),0),10.5,"Purchase return credits inventory and input GST");
assert.ok(journals[1].lines.some(x=>x.account==="1300"&&x.credit===0.5),"Purchase return reverses input GST");
assert.ok(journals[1].lines.some(x=>x.account==="2000"&&x.debit===10.5),"Default purchase return reduces supplier payables instead of inventing a cash receipt");
w.returnForm("sales");
w.document.querySelector("#returntx").value="812";
w.setReturnMax();
w.document.querySelector("#returnline").value="1";
w.setReturnMax();
w.document.querySelector("#returnqty").value="1";
w.document.querySelector("#returnrate").value="1000";
w.saveReturn({preventDefault(){}}, "sales");
journals=JSON.parse(w.localStorage.getItem("sl_account_journals")||"[]");
const saved=JSON.parse(w.localStorage.getItem("sl_sales_returns")||"[]").find(x=>String(x.originalId)==="812");
assert.equal(saved.item,"Oil","Return selects the correct item from a multi-item invoice");
assert.equal(saved.stockQty,15,"Return converts invoice units back into stock units");
assert.equal(saved.cost,900,"Return reverses the exact line-level purchase cost");
assert.equal(saved.tax,50,"Return reverses the exact line-level GST");
assert.equal(JSON.parse(w.localStorage.getItem("sl_items")).find(x=>x.name==="Oil").qty,15,"Returned stock is restored to the correct item");
assert.equal(journals.length,3,"Multi-item return creates a third automatic journal");
assert.equal(journals[2].lines.reduce((s,x)=>s+Number(x.debit),0),1950,"Multi-item return journal debits line revenue, GST and cost");
assert.equal(journals[2].lines.reduce((s,x)=>s+Number(x.credit),0),1950,"Multi-item return journal credits customer receivables and reverses COGS");
assert.equal(w.totals().sales,1655,"Net sales include item-level returns and GST");
assert.equal(w.totals().profit,328,"Gross profit reverses only returned taxable revenue and returned cost");
assert.equal(w.totals().purchases,94.5,"Net purchases subtract purchase returns and GST");
assert.equal(w.partyOutstanding("Supplier","Supplier"),-10.5,"Supplier credit balance includes purchase return and GST");
assert.equal(w.localStorage.getItem("sl_cash"),null,"Balance-adjusted returns do not create false cash-book movements");
const riceBeforeFailedReturn=JSON.parse(w.localStorage.getItem("sl_items")).find(x=>x.name==="Rice").qty;
const batchBeforeFailedReturn=w.localStorage.getItem("sl_batches");
const returnsBeforeFailedReturn=w.localStorage.getItem("sl_sales_returns");
const cashBeforeFailedReturn=w.localStorage.getItem("sl_cash");
w.returnForm("sales");
w.document.querySelector("#returntx").value="810";
w.setReturnMax();
w.document.querySelector("#returnqty").value="1";
w.document.querySelector("#returnrate").value="10";
const originalSetItem=w.Storage.prototype.setItem;
let failReturnWrite=true;
w.Storage.prototype.setItem=function(key,value){
 if(key==="sl_sales_returns"&&failReturnWrite){failReturnWrite=false;throw new Error("simulated storage quota")}
 return originalSetItem.call(this,key,value);
};
w.saveReturn({preventDefault(){}}, "sales");
w.Storage.prototype.setItem=originalSetItem;
assert.equal(JSON.parse(w.localStorage.getItem("sl_items")).find(x=>x.name==="Rice").qty,riceBeforeFailedReturn,"Failed return restores inventory quantity");
assert.equal(w.localStorage.getItem("sl_batches"),batchBeforeFailedReturn,"Failed return restores batch allocation");
assert.equal(w.localStorage.getItem("sl_sales_returns"),returnsBeforeFailedReturn,"Failed return does not append a return record");
assert.equal(w.localStorage.getItem("sl_cash"),cashBeforeFailedReturn,"Failed return does not add cash movement");
assert.equal(JSON.parse(w.localStorage.getItem("sl_account_journals")).length,3,"Failed return does not create an accounting journal");



w.returnForm("sales");
w.document.querySelector("#returntx").value="810";
w.setReturnMax();
w.document.querySelector("#returnqty").value="1";
w.document.querySelector("#returnrate").value="10";
w.document.querySelector("#returnsettlement").value="Cash";
w.saveReturn({preventDefault(){}}, "sales");
const refundCash=JSON.parse(w.localStorage.getItem("sl_cash")||"[]");
assert.equal(refundCash.length,1,"Explicit cash refund creates a cash-book movement");
assert.equal(refundCash[0].type,"Money Out","Sales return cash settlement is recorded as money out");
journals=JSON.parse(w.localStorage.getItem("sl_account_journals")||"[]");
assert.equal(journals.length,4,"Explicitly settled return creates its accounting journal");
assert.ok(journals[3].lines.some(x=>x.account==="1000"&&x.credit>0),"Cash refund credits cash in the return journal");
assert.equal(errors.length,0,"No runtime errors: "+errors.join("; "));
console.log("PASS sales and purchase return double-entry journals and proportional GST reversals");
console.log("PASS atomic return rollback on storage failure");
console.log("PASS explicit cash refund settlement and cash-book posting");
dom.window.close();
