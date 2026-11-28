import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const source=readFileSync("smartledger-v77-unified-upgrade.js","utf8");
const dom=new JSDOM('<!doctype html><html><head></head><body><div id="view"></div><div id="pagetitle"></div><div id="modalbody"></div></body></html>',{url:"https://smartledger.test",runScripts:"dangerously"});
const w=dom.window;
const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const records={
 items:[{name:"Rice 25kg",qty:20,unit:"bag",price:1200,wholesale:1150}],
 sales:[{date:today,total:2400}],purchases:[{date:today,total:1800}],expenses:[{date:today,amount:100}]
};
w.get=k=>records[k]||[];
w.go=p=>{w.document.querySelector("#view").textContent=p};
w.openSectionMore=()=>{};
w.closeModal=()=>{};
w.alert=()=>{};
w.eval(source);
w.go("Business Tools");
assert.equal(w.document.querySelectorAll("#view .sl77-grid article").length,7,"all new workflows are visible");
w.sl77Quote();w.document.querySelector("#r").value="QT-TEST";w.document.querySelector("#party").value="Customer A";w.document.querySelector("#qty").value="2";w.document.querySelector("#rate").value="50";w.sl77SaveQuote({preventDefault(){}});
assert.equal(JSON.parse(w.localStorage.getItem("sl_u_quotes"))[0].total,100,"quotation total is calculated");
w.sl77Order();w.document.querySelector("#r").value="PO-TEST";w.document.querySelector("#party").value="Supplier A";w.document.querySelector("#qty").value="3";w.document.querySelector("#rate").value="40";w.sl77SaveOrder({preventDefault(){}});
assert.equal(JSON.parse(w.localStorage.getItem("sl_u_orders"))[0].total,120,"purchase order total is calculated");
w.sl77Transfer();w.document.querySelector("#qty").value="2";w.document.querySelector("#from").value="Shop";w.document.querySelector("#to").value="Godown";w.document.querySelector("#note").value="TR-1";w.sl77SaveTransfer({preventDefault(){}});
assert.equal(JSON.parse(w.localStorage.getItem("sl_u_transfers"))[0].qty,2,"stock transfer is recorded");
w.sl77Prices();w.document.querySelector("#price").value="1175";w.sl77SavePrice({preventDefault(){}});
assert.equal(w.smartLedgerPriceFor("Rice 25kg","Retail"),1175,"saved price level can be retrieved");
w.sl77Due();w.document.querySelector("#party").value="Customer A";w.document.querySelector("#ref").value="INV-1";w.document.querySelector("#amount").value="500";w.sl77SaveDue({preventDefault(){}});
assert.equal(JSON.parse(w.localStorage.getItem("sl_u_dues"))[0].amount,500,"due date record is saved");
w.sl77Bank();w.document.querySelector("#amount").value="250";w.document.querySelector("#ref").value="UTR-1";w.sl77SaveBank({preventDefault(){}});
assert.equal(JSON.parse(w.localStorage.getItem("sl_u_bank"))[0].amount,250,"bank entry is saved");
w.sl77Day();w.document.querySelector("#cash").value="1500";w.sl77SaveDay({preventDefault(){}});
const close=JSON.parse(w.localStorage.getItem("sl_u_closing"))[0];
assert.equal(close.sales,2400,"day close reads today's sales");
assert.equal(close.purchases,1800,"day close reads today's purchases");
assert.equal(close.expenses,100,"day close reads today's expenses");
console.log("PASS SmartLedger v77 unified workflows");
