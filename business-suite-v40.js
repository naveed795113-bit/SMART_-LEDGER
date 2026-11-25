/* SmartLedger v40.0 Unified Business Suite: analytics, planning and forward-only double-entry automation. */
(function(){
"use strict";
const $=s=>document.querySelector(s),R=k=>{try{let x=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(x)?x:[]}catch(_){return[]}},W=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const K={items:"sl_items",customers:"sl_customers",suppliers:"sl_suppliers",sales:"sl_sales",purchases:"sl_purchases",expenses:"sl_expenses",payments:"sl_payments",batches:"sl_batches",salesReturns:"sl_sales_returns",purchaseReturns:"sl_purchase_returns"};
const G=k=>R(K[k]||k),N=v=>Number.isFinite(Number(v))?Number(v):0,S=(a,f)=>a.reduce((s,x)=>s+N(f(x)),0),M=v=>"₹"+N(v).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}),E=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const D=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10),ago=n=>{let d=new Date();d.setDate(d.getDate()-n);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const AK="sl_chart_accounts",JK="sl_account_journals",defs=[["1000","Cash in Hand","Asset"],["1010","Bank Account","Asset"],["1100","Accounts Receivable","Asset"],["1200","Inventory Asset","Asset"],["1300","Input GST Credit","Asset"],["2000","Accounts Payable","Liability"],["2100","Output GST Payable","Liability"],["2200","Other Current Liabilities","Liability"],["3000","Owner's Capital","Equity"],["3100","Retained Earnings","Equity"],["4000","Sales Revenue","Income"],["4090","Sales Returns","Income"],["4100","Other Income","Income"],["5000","Cost of Goods Sold","Expense"],["5100","Purchase Expense","Expense"],["6000","Shop Rent","Expense"],["6010","Salaries","Expense"],["6020","Electricity & Utilities","Expense"],["6030","Transport & Fuel","Expense"],["6090","Other Operating Expenses","Expense"]];
function initAccounts(){let a=R(AK);defs.forEach(([code,name,type])=>{if(!a.some(x=>x.code===code))a.push({code,name,type,system:true,active:true})});W(AK,a)}
const J=()=>R(JK),has=c=>R(AK).some(x=>x.code===c&&x.active!==false),L=(account,debit,credit)=>({account,debit:Math.round(N(debit)*100)/100,credit:Math.round(N(credit)*100)/100});
function post(type,id,date,ref,narration,lines){if(!id||J().some(x=>x.sourceType===type&&String(x.sourceId)===String(id)))return;let a=lines.filter(x=>has(x.account)&&(x.debit>0||x.credit>0)),dr=S(a,x=>x.debit),cr=S(a,x=>x.credit);if(a.length<2||dr<=0||Math.abs(dr-cr)>.004)throw Error("Unbalanced auto journal");let all=J();all.push({id:"JA"+Date.now()+Math.random().toString(36).slice(2,7),date:date||D(),reference:"AUTO-"+type.toUpperCase()+"-"+(ref||id),narration,lines:a,status:"posted",auto:true,sourceType:type,sourceId:String(id),postedAt:new Date().toISOString()});W(JK,all)}
const cash=m=>/bank|upi|cheque|card|online/i.test(String(m||""))?"1010":"1000";
function safe(fn){try{fn()}catch(e){let a=R("sl_v40_posting_errors");a.push({at:new Date().toISOString(),message:String(e.message||e)});W("sl_v40_posting_errors",a.slice(-100))}}
function postTxn(x,type){let paid=Math.min(N(x.paid),N(x.total)),due=Math.max(0,N(x.total)-paid),taxable=Math.max(0,N(x.taxable??(N(x.total)-N(x.tax)))),tax=Math.max(0,N(x.tax)),a=[];if(type==="sales"){a.push(L(cash(x.method),paid,0),L("1100",due,0),L("4000",0,taxable),L("2100",0,tax));let cost=N(x.cost);if(cost>0)a.push(L("5000",cost,0),L("1200",0,cost))}else a.push(L("1200",taxable,0),L("1300",tax,0),L(cash(x.method),0,paid),L("2000",0,due));post(type,x.id,x.date,x.invoice,(type==="sales"?"Sales invoice ":"Purchase bill ")+x.invoice,a)}
function postPay(x){let a=x.type==="Customer"?[L(cash(x.mode),x.amount,0),L("1100",0,x.amount)]:[L("2000",x.amount,0),L(cash(x.mode),0,x.amount)];post("payment",x.id,x.date,x.reference,x.type+" payment — "+x.party,a)}
function postExp(x){let c=String(x.category||"").toLowerCase(),code=c.includes("rent")?"6000":c.includes("salary")?"6010":c.includes("electric")?"6020":c.includes("transport")||c.includes("fuel")?"6030":"6090";post("expense",x.id,x.date,x.id,"Expense — "+x.category,[L(code,x.amount,0),L("1000",0,x.amount)])}
function postRet(x){let sale=x.kind==="Sales return";post("return",x.id,x.date,x.invoice,x.kind+" — "+x.invoice,sale?[L("4090",x.amount,0),L("1000",0,x.amount)]:[L("1000",x.amount,0),L("1200",0,x.amount)])}
function hook(name,fn){let old=window[name];if(typeof old!=="function"||old.__v40)return;let w=function(){let r=old.apply(this,arguments);safe(()=>fn(arguments));return r};w.__v40=true;window[name]=w}
function lastWithId(k){let a=G(k);if(!a.length)return null;let x=a[a.length-1];if(!x.id){x.id="V40-"+Date.now()+"-"+a.length;W(K[k],a)}return x}function hooks(){hook("saveTransaction",a=>{let rows=G(a[1]);if(rows.length)postTxn(rows[rows.length-1],a[1])});hook("savePayment",()=>{let x=lastWithId("payments");if(x)postPay(x)});hook("saveExpense",()=>{let x=lastWithId("expenses");if(x)postExp(x)});hook("saveReturn",()=>{let a=[...G("salesReturns"),...G("purchaseReturns")].sort((x,y)=>N(x.id)-N(y.id));if(a.length)postRet(a[a.length-1])})}
function sold(days){let o={};G("sales").filter(x=>!x.date||x.date>=ago(days)).forEach(t=>(t.lines?.length?t.lines:[{item:t.item,qty:t.qty}]).forEach(l=>{let k=l.item||l.name||"Unknown";o[k]=(o[k]||0)+N(l.qty)}));return o}
function calc(){let sales=G("sales"),purchases=G("purchases"),expenses=G("expenses"),sr=G("salesReturns"),pr=G("purchaseReturns"),items=G("items"),batches=G("batches"),j=J(),salesReturn=S(sr,x=>x.amount),netSales=S(sales,x=>x.total)-salesReturn,cogs=S(sales,x=>x.cost),stock=S(items,x=>N(x.qty)*N(x.purchase)),output=S(sales,x=>x.tax)-S(sr,x=>x.tax||0),input=S(purchases,x=>x.tax)-S(pr,x=>x.tax||0);return{sales,purchases,expenses,sr,pr,items,batches,j,sold:sold(30),netSales,cogs,gross:netSales-cogs,exp:S(expenses,x=>x.amount),net:netSales-cogs-S(expenses,x=>x.amount),stock,retail:S(items,x=>N(x.qty)*N(x.price)),output,input,low:items.filter(x=>N(x.qty)<=N(x.minStock??5)),expired:batches.filter(x=>N(x.remaining)>0&&x.expiryDate&&x.expiryDate<D()),soon:batches.filter(x=>N(x.remaining)>0&&x.expiryDate&&x.expiryDate>=D()&&x.expiryDate<=ago(-30)),dr:S(j,x=>S(x.lines||[],l=>l.debit)),cr:S(j,x=>S(x.lines||[],l=>l.credit))}}
const stat=(a,b,c)=>'<div class="v40-stat"><small>'+a+'</small><strong>'+b+'</strong><span>'+c+'</span></div>',card=(a,b)=>'<section class="v40-card"><h2>'+a+'</h2>'+b+'</section>';
const tabs=[["overview","Overview"],["finance","Finance"],["inventory","Inventory"],["gst","GST & Tax"],["customers","Customers"],["suppliers","Suppliers"],["planning","Planning"],["health","Data health"]];
function shell(t,b){return'<div class="v40-head"><div><div class="v40-kicker">SMARTLEDGER · UNIFIED BUSINESS SUITE</div><h1>Business Suite</h1><p>Accounts, stock, tax, customer intelligence and business planning.</p></div><span class="v40-version">v40.0</span></div><div class="v40-tabs">'+tabs.map(x=>'<button class="v40-tab '+(t===x[0]?"active":"")+'" onclick="smartSuiteTab(\''+x[0]+'\')">'+x[1]+'</button>').join("")+'</div>'+b}
function overview(){let d=calc(),day=S(d.sales.filter(x=>x.date===D()),x=>x.total),month=S(d.sales.filter(x=>(x.date||"").slice(0,7)===D().slice(0,7)),x=>x.total),top=Object.entries(d.sold).sort((a,b)=>b[1]-a[1]).slice(0,5),days=Array.from({length:7},(_,i)=>{let date=ago(6-i);return{label:new Date(date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short"}),v:S(d.sales.filter(x=>x.date===date),x=>x.total)}}),max=Math.max(1,...days.map(x=>x.v)),bars=days.map(x=>'<div class="v40-bar"><span>'+ (x.v?M(x.v):"")+'</span><i style="height:'+Math.max(3,x.v/max*100)+'%"></i><small>'+x.label+'</small></div>').join("");return'<div class="v40-grid">'+stat("Sales today",M(day),d.sales.filter(x=>x.date===D()).length+" invoices")+stat("Sales this month",M(month),"Current month")+stat("Estimated net profit",M(d.net),"Recorded costs less expenses")+stat("Inventory at cost",M(d.stock),d.items.length+" items")+stat("Customer receivables",M(window.outstandingTotal?window.outstandingTotal("Customer"):0),"Party balances")+stat("Supplier payables",M(window.outstandingTotal?window.outstandingTotal("Supplier"):0),"Party balances")+'</div>'+card("7-day sales trend",'<div class="v40-bars">'+bars+'</div>')+'<div class="v40-columns">'+card("Top items · 30 days",'<div class="v40-table"><table><thead><tr><th>Item</th><th>Qty sold</th></tr></thead><tbody>'+(top.map(x=>'<tr><td>'+E(x[0])+'</td><td>'+x[1]+'</td></tr>').join("")||'<tr><td colspan="2">No recent sales.</td></tr>')+'</tbody></table></div>')+card("Quick actions",'<div class="v40-actions"><button onclick="go(\'Sales\')">New sale</button><button onclick="go(\'Purchases\')">New purchase</button><button onclick="go(\'Items\')">Inventory</button><button onclick="go(\'Accounts\')">General ledger</button><button onclick="go(\'Tax Reports\')">GST reports</button><button onclick="exportData()">Full backup</button></div><p class="v40-muted">'+d.low.length+' low stock · '+d.expired.length+' expired · '+d.soon.length+' expiring in 30 days</p>')+'</div>'}
function finance(){let d=calc(),types=["sales","purchases","payment","expense","return"],err=R("sl_v40_posting_errors");return'<div class="v40-grid">'+stat("Net sales",M(d.netSales),"After sales returns")+stat("Cost of goods sold",M(d.cogs),"Saved item costs")+stat("Gross profit",M(d.gross),"Before overheads")+stat("Expenses",M(d.exp),"Recorded expenses")+stat("Estimated net profit",M(d.net),"Management estimate")+stat("Journal difference",M(Math.abs(d.dr-d.cr)),Math.abs(d.dr-d.cr)<.005?"Balanced":"Review")+'</div>'+card("Automatic accounting",'<p>New sales, purchases, customer receipts, supplier payments, expenses and returns are posted to the general ledger when saved. Source references prevent duplicate posting.</p><div class="v40-chips">'+types.map(t=>'<span>'+t+': '+d.j.filter(x=>x.sourceType===t).length+'</span>').join("")+'</div><p class="v40-muted">Historical transactions are not back-posted. Returns use simplified management entries. Reconcile opening balances and tax treatment before relying on statutory statements.</p><div class="v40-actions"><button onclick="go(\'Accounts\')">Open chart & journals</button><button onclick="go(\'Accounts\');showTrialBalance()">Trial balance</button></div>')+card("Posting exceptions",err.length?'<ul>'+err.slice(-8).reverse().map(x=>'<li>'+E(x.at)+' — '+E(x.message)+'</li>').join("")+'</ul>':'<p>No posting exceptions recorded.</p>')}
function inventory(){let d=calc(),dead=d.items.filter(x=>N(x.qty)>0&&!d.sold[x.name]),rows=d.items.map(x=>'<tr><td>'+E(x.name)+'</td><td>'+N(x.qty)+' '+E(x.unit||"")+'</td><td>'+M(x.purchase)+'</td><td>'+M(N(x.qty)*N(x.purchase))+'</td><td>'+M(x.price)+'</td><td>'+(N(x.qty)<=N(x.minStock??5)?'<b class="v40-warn">Reorder</b>':'OK')+'</td></tr>').join("");return'<div class="v40-grid">'+stat("Items",d.items.length,"Catalogue")+stat("Stock at cost",M(d.stock),"Current valuation")+stat("Potential retail",M(d.retail),"Not realised sales")+stat("Low stock",d.low.length,"Reorder threshold")+stat("Expired batches",d.expired.length,"Remaining qty")+stat("No sales · 30d",dead.length,"Slow-moving candidates")+'</div>'+card("Inventory valuation",'<div class="v40-table"><table><thead><tr><th>Item</th><th>Stock</th><th>Cost</th><th>Value</th><th>Retail</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="v40-muted">No-sale items have no recorded sales in 30 days. Opening stock without batch records is excluded from expiry tracking.</p>')+card("Batch & expiry",'<p>'+d.expired.length+' expired · '+d.soon.length+' expiring within 30 days.</p><div class="v40-actions"><button onclick="go(\'Batch & Expiry\')">Batch register</button><button onclick="go(\'Stock Summary\')">Stock summary</button><button onclick="go(\'Stock Alerts\')">Stock alerts</button></div>')}
function gst(){let d=calc(),ts=S(d.sales,x=>x.taxable??(N(x.total)-N(x.tax))),tp=S(d.purchases,x=>x.taxable??(N(x.total)-N(x.tax)));return'<div class="v40-grid">'+stat("Taxable sales",M(ts),"Saved invoices")+stat("Output GST",M(d.output),"Recorded sales tax")+stat("Taxable purchases",M(tp),"Saved bills")+stat("Input GST",M(d.input),"Recorded purchase tax")+stat("Net GST estimate",M(d.output-d.input),"Output less input")+'</div>'+card("GST split",'<div class="v40-table"><table><tbody>'+[["CGST",S(d.sales,x=>x.cgst)],["SGST",S(d.sales,x=>x.sgst)],["IGST",S(d.sales,x=>x.igst)],["Input GST",d.input],["Net GST",d.output-d.input]].map(x=>'<tr><th>'+x[0]+'</th><td>'+M(x[1])+'</td></tr>').join("")+'</tbody></table></div><div class="v40-actions"><button onclick="go(\'Tax Reports\')">Detailed GST report</button><button onclick="v40Export(\'tax\')">Export tax CSV</button></div><p class="v40-muted">Management summary only, not a statutory GST return. Validate ITC, HSN, place of supply and filing separately.</p>')}
function customers(){let p=G("customers"),s=G("sales"),rows=p.map(x=>{let t=s.filter(y=>y.party===x.name);return{name:x.name,count:t.length,total:S(t,y=>y.total),due:window.partyOutstanding?window.partyOutstanding("Customer",x.name):0}}).sort((a,b)=>b.total-a.total);return'<div class="v40-grid">'+stat("Customers",p.length,"Profiles")+stat("Sales",M(S(s,x=>x.total)),"Saved invoices")+stat("Receivables",M(window.outstandingTotal?window.outstandingTotal("Customer"):0),"Outstanding")+'</div>'+card("Customer segments",'<div class="v40-table"><table><thead><tr><th>Customer</th><th>Invoices</th><th>Sales</th><th>Due</th><th>Segment</th></tr></thead><tbody>'+(rows.map(x=>'<tr><td>'+E(x.name)+'</td><td>'+x.count+'</td><td>'+M(x.total)+'</td><td>'+M(x.due)+'</td><td>'+(x.due>0?"Due":x.total>0?"Regular":"New")+'</td></tr>').join("")||'<tr><td colspan="5">No customers.</td></tr>')+'</tbody></table></div><button onclick="go(\'Customers\')">Open customer directory</button> <button onclick="v40Export(\'customers\')">Export summary</button>')}
function suppliers(){let p=G("suppliers"),s=G("purchases"),rows=p.map(x=>{let t=s.filter(y=>y.party===x.name);return{name:x.name,count:t.length,total:S(t,y=>y.total),due:window.partyOutstanding?window.partyOutstanding("Supplier",x.name):0}}).sort((a,b)=>b.total-a.total);return'<div class="v40-grid">'+stat("Suppliers",p.length,"Profiles")+stat("Purchases",M(S(s,x=>x.total)),"Saved bills")+stat("Payables",M(window.outstandingTotal?window.outstandingTotal("Supplier"):0),"Outstanding")+'</div>'+card("Supplier spend",'<div class="v40-table"><table><thead><tr><th>Supplier</th><th>Bills</th><th>Purchases</th><th>Due</th></tr></thead><tbody>'+(rows.map(x=>'<tr><td>'+E(x.name)+'</td><td>'+x.count+'</td><td>'+M(x.total)+'</td><td>'+M(x.due)+'</td></tr>').join("")||'<tr><td colspan="4">No suppliers.</td></tr>')+'</tbody></table></div><button onclick="go(\'Suppliers\')">Supplier directory</button> <button onclick="v40Export(\'suppliers\')">Export summary</button>')}
function planning(){let d=calc(),rows=d.items.map(p=>{let sold=N(d.sold[p.name]),q=Math.max(0,Math.ceil(Math.max(N(p.minStock??5),sold)-N(p.qty)));return{p,sold,q}}).filter(x=>x.q>0).sort((a,b)=>b.q*N(b.p.purchase)-a.q*N(a.p.purchase));return'<div class="v40-grid">'+stat("Items to reorder",rows.length,"Min stock / recent demand")+stat("Suggested units",rows.reduce((s,x)=>s+x.q,0),"Planning quantity")+stat("Reorder value",M(S(rows,x=>x.q*x.p.purchase)),"At saved purchase rates")+'</div>'+card("Reorder planner",'<div class="v40-table"><table><thead><tr><th>Item</th><th>On hand</th><th>Sold 30d</th><th>Suggested</th><th>Cost</th></tr></thead><tbody>'+(rows.map(x=>'<tr><td>'+E(x.p.name)+'</td><td>'+N(x.p.qty)+'</td><td>'+x.sold+'</td><td>'+x.q+'</td><td>'+M(x.q*x.p.purchase)+'</td></tr>').join("")||'<tr><td colspan="5">No reorder suggestions.</td></tr>')+'</tbody></table></div><div class="v40-actions"><button onclick="v40Export(\'reorder\')">Download reorder CSV</button><button onclick="go(\'Purchases\')">Create purchase bill</button><button onclick="go(\'Stock Alerts\')">Stock alerts</button></div><p class="v40-muted">Estimate from current stock, reorder levels and sales over 30 days. Not a purchase order.</p>')}
function health(){let d=calc(),issues=[],check=(k,label)=>{let seen=new Set();G(k).forEach(x=>{let v=String(x.invoice||"").trim().toLowerCase();if(v&&seen.has(v))issues.push("Duplicate "+label+": "+v);seen.add(v)})};check("sales","invoice");check("purchases","bill");d.items.forEach(x=>{if(N(x.qty)<0)issues.push("Negative stock: "+x.name)});let codes=new Set();d.items.forEach(x=>{let c=String(x.code||"").toLowerCase();if(c&&codes.has(c))issues.push("Duplicate SKU: "+c);if(c)codes.add(c)});d.j.forEach(x=>{if(Math.abs(S(x.lines||[],l=>l.debit)-S(x.lines||[],l=>l.credit))>.004)issues.push("Unbalanced journal: "+x.reference)});let missing=d.sales.filter(x=>!N(x.cost)).length;if(missing)issues.push(missing+" sales without recorded cost");let errors=R("sl_v40_posting_errors");if(errors.length)issues.push(errors.length+" posting exceptions");return'<div class="v40-grid">'+stat("Issues",issues.length,issues.length?"Review below":"No issues detected")+stat("Sales without cost",missing,"Profit accuracy")+stat("Journal entries",d.j.length,"Manual and auto")+stat("Posting exceptions",errors.length,"Stored locally")+'</div>'+card("Data checks",issues.length?'<ul class="v40-issues">'+issues.map(E).map(x=>'<li>'+x+'</li>').join("")+'</ul>':'<p class="v40-good">No issues found by these checks.</p>')+card("Backup & recovery",'<p>Download full JSON backups regularly and keep a copy outside this phone.</p><div class="v40-actions"><button onclick="exportData()">Full JSON backup</button><button onclick="document.getElementById(\'restore\')?.click()">Restore backup</button><button onclick="v40Export(\'all\')">Export record summary CSV</button></div><p class="v40-muted">No cloud sync, staff logins, remote access or server backup in this local-first release.</p>')}
function render(tab){initAccounts();let f={overview,finance,inventory,gst,customers,suppliers,planning,health};$("#view").innerHTML=shell(tab,(f[tab]||overview)())}
function download(type){let d=calc(),rows=[];if(type==="tax")rows=[["Metric","Amount"],["Output GST",d.output],["Input GST",d.input],["Net GST",d.output-d.input]];else if(type==="customers")rows=[["Customer","Sales","Due"],...G("customers").map(p=>[p.name,S(d.sales.filter(x=>x.party===p.name),x=>x.total),window.partyOutstanding?window.partyOutstanding("Customer",p.name):0])];else if(type==="suppliers")rows=[["Supplier","Purchases","Due"],...G("suppliers").map(p=>[p.name,S(d.purchases.filter(x=>x.party===p.name),x=>x.total),window.partyOutstanding?window.partyOutstanding("Supplier",p.name):0])];else if(type==="reorder")rows=[["Item","Stock","Sold 30d","Suggested qty","Cost"],...d.items.map(p=>{let q=Math.max(0,Math.ceil(Math.max(N(p.minStock??5),N(d.sold[p.name]))-N(p.qty)));return[p.name,p.qty,N(d.sold[p.name]),q,q*N(p.purchase)]}).filter(x=>x[3]>0)];else rows=[["Type","Count","Value"],["Items",d.items.length,d.stock],["Sales",d.sales.length,S(d.sales,x=>x.total)],["Purchases",d.purchases.length,S(d.purchases,x=>x.total)],["Expenses",d.expenses.length,d.exp],["Payments",G("payments").length,S(G("payments"),x=>x.amount)],["Journals",d.j.length,d.dr]];
 const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\\r\\n"),url=URL.createObjectURL(new Blob(["\\ufeff"+csv],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");a.href=url;a.download="smartledger-"+type+".csv";a.click();URL.revokeObjectURL(url)}
function styles(){
 if($("#v40styles"))return;
 let s=document.createElement("style");s.id="v40styles";
 s.textContent=`
 body.theme-light #view{--v40-text:#20252b;--v40-muted:#56616d;--v40-card:#ffffff;--v40-line:#d9e0e6;--v40-accent:#805f2b;--v40-accent-ink:#ffffff;--v40-good:#176b49;--v40-warn:#875016}
 body.theme-dark #view{--v40-text:#f4f6f8;--v40-muted:#c1cad3;--v40-card:#20262d;--v40-line:#46515c;--v40-accent:#e2c98e;--v40-accent-ink:#202329;--v40-good:#70d6a4;--v40-warn:#f0bd75}
 #view .v40-stat,#view .v40-card{color:var(--v40-text)!important;background:var(--v40-card)!important}
 #view .v40-stat small,#view .v40-stat span,#view .v40-bar span,#view .v40-bar small{color:var(--v40-muted)!important}
 #view .v40-stat strong,#view .v40-card h2,#view .v40-card p,#view .v40-card li{color:var(--v40-text)!important}
 #view .v40-table table,#view .v40-table th,#view .v40-table td{color:var(--v40-text)!important;background:var(--v40-card)!important}
 #view .v40-actions button,#view .v40-card>button{color:var(--v40-text)!important;background:var(--v40-card)!important}
 #view .v40-head{display:flex;justify-content:space-between;gap:12px;margin:4px 0 18px;color:var(--v40-text)}
 #view .v40-head h1{margin:3px 0 5px;font-size:25px;color:var(--v40-text)}
 #view .v40-head p,#view .v40-muted{color:var(--v40-muted);font-size:12px;line-height:1.55}
 #view .v40-kicker{font-size:10px;letter-spacing:1.7px;font-weight:800;color:var(--v40-accent)}
 #view .v40-version{border:1px solid var(--v40-accent);border-radius:20px;padding:7px 11px;color:var(--v40-accent);font-size:12px;font-weight:800}
 #view .v40-tabs{display:flex;gap:7px;overflow-x:auto;padding:2px 0 12px}
 #view .v40-tab{border:1px solid var(--v40-line);background:var(--v40-card);color:var(--v40-text);border-radius:10px;padding:9px 12px;white-space:nowrap;font-weight:700}
 #view .v40-tab.active{background:var(--v40-accent);color:var(--v40-accent-ink);border-color:var(--v40-accent)}
 #view .v40-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0}
 #view .v40-stat,#view .v40-card{background:var(--v40-card);color:var(--v40-text);border:1px solid var(--v40-line);border-radius:15px;padding:14px;min-width:0;box-shadow:var(--shadow,0 8px 20px #0000000a)}
 #view .v40-stat small,#view .v40-stat span{display:block;color:var(--v40-muted);font-size:11px}
 #view .v40-stat strong{display:block;font-size:clamp(15px,2vw,21px);margin:8px 0;overflow-wrap:anywhere;color:var(--v40-text)}
 #view .v40-stat span{font-size:10px}
 #view .v40-card{margin:12px 0}
 #view .v40-card h2{font-size:16px;margin:0 0 12px;color:var(--v40-text)}
 #view .v40-card p,#view .v40-card li{color:var(--v40-text);line-height:1.55}
 #view .v40-columns{display:grid;grid-template-columns:1fr 1fr;gap:12px}
 #view .v40-bars{height:160px;display:flex;align-items:flex-end;gap:8px;padding:12px 4px 0}
 #view .v40-bar{height:100%;flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}
 #view .v40-bar span,#view .v40-bar small{font-size:10px;color:var(--v40-muted)}
 #view .v40-bar span{font-size:9px;white-space:nowrap}
 #view .v40-bar i{display:block;width:70%;max-width:34px;min-height:3px;border-radius:6px;background:linear-gradient(180deg,var(--v40-accent),color-mix(in srgb,var(--v40-accent) 65%,#777))}
 #view .v40-table{overflow:auto;max-width:100%}
 #view .v40-table table{width:100%;border-collapse:collapse;min-width:450px;background:var(--v40-card);color:var(--v40-text)}
 #view .v40-table th,#view .v40-table td{padding:9px;border-bottom:1px solid var(--v40-line);text-align:left;font-size:12px;white-space:nowrap;color:var(--v40-text);background:var(--v40-card)}
 #view .v40-table th{color:var(--v40-accent);font-weight:800}
 #view .v40-actions{display:flex;flex-wrap:wrap;gap:8px}
 #view .v40-actions button,#view .v40-card>button{background:var(--v40-card);border:1px solid var(--v40-accent);color:var(--v40-text);border-radius:9px;padding:9px 11px;font-weight:700}
 #view .v40-actions button:hover,#view .v40-card>button:hover{background:var(--v40-accent);color:var(--v40-accent-ink)}
 #view .v40-chips{display:flex;gap:7px;flex-wrap:wrap}
 #view .v40-chips span{border:1px solid var(--v40-line);color:var(--v40-text);background:var(--v40-card);padding:6px 9px;border-radius:20px;font-size:11px}
 #view .v40-warn,#view .v40-issues{color:var(--v40-warn)}
 #view .v40-good{color:var(--v40-good);font-weight:700}
 #view .v40-card a{color:var(--v40-accent);text-decoration:underline}
 @media(max-width:760px){#view .v40-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#view .v40-stat,#view .v40-card{padding:11px}#view .v40-columns{grid-template-columns:1fr}#view .v40-head h1{font-size:22px}}
 `;
 document.head.appendChild(s)
}
const oldGo=window.go,oldMore=window.morePage,oldRender=window.render;
window.smartSuiteTab=t=>{window.__v40Tab=t;render(t)};
window.v40Export=t=>download(t);
window.morePage=function(){if(oldMore)oldMore();let v=$("#view");if(v&&!v.querySelector("[data-v40-link]"))v.insertAdjacentHTML("beforeend",'<button data-v40-link class="more-card" onclick="go(\'Business Suite\')"><span class="more-icon">✦</span><span><b>Business Suite · v40.0</b><small>Advanced accounts, stock intelligence, GST, CRM and planning</small></span></button>')};
window.go=function(p){if(p==="Business Suite"){window.__v40Open=true;styles();$("#pagetitle").textContent="Business Suite";document.querySelectorAll(".nav button,.mobile-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page==="More"));render(window.__v40Tab||"overview");return}window.__v40Open=false;return oldGo.apply(this,arguments)};
window.render=function(){if(window.__v40Open){render(window.__v40Tab||"overview");return}return oldRender.apply(this,arguments)};
styles();initAccounts();hooks();window.__SMARTLEDGER_V40__={version:"40.0.0",calc,post};
})();

/* v41.0 — one predictable scroll owner per device class, all workspaces. */
(function(){
  "use strict";
  const mobile=()=>window.matchMedia("(max-width:850px)").matches;
  const view=()=>document.getElementById("view");
  let locked=false, savedY=0, savedViewY=0, bodyStyles=null;
  function resetWorkspaceScroll(){
    const v=view();
    if(v){v.scrollTop=0;v.scrollLeft=0;}
    if(mobile()&&window.scrollTo)window.scrollTo(0,0);
  }
  function lockBackground(){
    if(locked)return;
    locked=true;
    savedY=window.scrollY||window.pageYOffset||0;
    savedViewY=view()?.scrollTop||0;
    bodyStyles={position:document.body.style.position,top:document.body.style.top,width:document.body.style.width,overflow:document.body.style.overflow};
    document.body.classList.add("sl-modal-open");
    if(mobile()){
      document.body.style.position="fixed";
      document.body.style.top=(-savedY)+"px";
      document.body.style.width="100%";
      document.body.style.overflow="hidden";
    }
  }
  function unlockBackground(){
    if(!locked)return;
    document.body.classList.remove("sl-modal-open");
    if(bodyStyles){
      document.body.style.position=bodyStyles.position;
      document.body.style.top=bodyStyles.top;
      document.body.style.width=bodyStyles.width;
      document.body.style.overflow=bodyStyles.overflow;
    }
    locked=false;
    bodyStyles=null;
    requestAnimationFrame(()=>{
      if(mobile())window.scrollTo(0,savedY);
      const v=view();
      if(v&&!mobile())v.scrollTop=savedViewY;
    });
  }

  const originalModal=window.modal;
  if(typeof originalModal==="function"){
    window.modal=function(title,html){
      lockBackground();
      const result=originalModal.apply(this,arguments);
      const overlay=document.getElementById("modal"),dialog=overlay?.querySelector(".dialog");
      if(overlay)overlay.scrollTop=0;
      if(dialog)dialog.scrollTop=0;
      return result;
    };
  }
  const originalClose=window.closeModal;
  if(typeof originalClose==="function"){
    window.closeModal=function(){
      const result=originalClose.apply(this,arguments);
      if(!document.getElementById("modal")?.classList.contains("show"))unlockBackground();
      return result;
    };
  }

  const originalGo=window.go;
  if(typeof originalGo==="function"){
    window.go=function(){
      if(document.getElementById("modal")?.classList.contains("show"))window.closeModal();
      const result=originalGo.apply(this,arguments);
      requestAnimationFrame(resetWorkspaceScroll);
      return result;
    };
  }
  const originalSuiteTab=window.smartSuiteTab;
  if(typeof originalSuiteTab==="function"){
    window.smartSuiteTab=function(){
      const result=originalSuiteTab.apply(this,arguments);
      requestAnimationFrame(resetWorkspaceScroll);
      return result;
    };
  }

  const style=document.createElement("style");
  style.id="smartledger-v41-scroll";
  style.textContent=`
    html{scroll-behavior:auto!important}
    /* Desktop/tablet: the workspace content is the only page scroll region. */
    @media(min-width:851px){
      html,body{height:100%!important;min-height:100%!important;overflow:hidden!important}
      .app{height:100dvh!important;min-height:0!important;overflow:hidden!important}
      .main{height:100dvh!important;min-height:0!important;max-height:100dvh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
      .main>.top{flex:0 0 auto!important}
      .main>.content{display:block!important;flex:1 1 auto!important;min-height:0!important;height:auto!important;max-height:none!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important}
      body.sl-modal-open .main>.content{overflow:hidden!important}
    }
    /* Android/iOS: use native document scrolling instead of nested flex scrollers. */
    @media(max-width:850px){
      html,body{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior-y:auto!important}
      body{position:relative!important}
      .app{display:block!important;width:100%!important;height:auto!important;min-height:100vh!important;overflow:visible!important}
      .side{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:auto!important;height:62px!important;z-index:40!important}
      .main{display:block!important;position:relative!important;width:100%!important;height:auto!important;min-height:100vh!important;max-height:none!important;overflow:visible!important;padding:62px 0 0!important;margin:0!important}
      .main>.top{position:sticky!important;top:62px!important;z-index:12!important;display:flex!important;height:48px!important;min-height:48px!important}
      .main>.content{display:block!important;position:relative!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;flex:none!important;overflow:visible!important;overflow-x:hidden!important;overflow-y:visible!important;touch-action:pan-y!important;overscroll-behavior:auto!important;margin:0 auto!important;padding-bottom:calc(110px + env(safe-area-inset-bottom))!important}
      #view{display:block!important;position:relative!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;touch-action:pan-y!important}
      .mobile-nav{position:fixed!important;bottom:0!important;left:0!important;right:0!important;z-index:50!important}
      body.sl-modal-open{position:fixed!important;left:0!important;right:0!important;overflow:hidden!important}
    }
    /* Dialog is the only scrollable surface while a modal is open. */
    .modal{z-index:100!important;overscroll-behavior:contain!important}
    .modal.show{position:fixed!important;inset:0!important;overflow:hidden!important;overscroll-behavior:contain!important}
    .modal.show .dialog{min-height:0!important;max-height:calc(100dvh - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important}
    #modalbody{min-height:0!important}
    .txn-product-grid{overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important}
    .v40-tabs{overscroll-behavior-x:contain}
  `;
  document.head.appendChild(style);
  window.__SMARTLEDGER_V41_SCROLL__={resetWorkspaceScroll,lockBackground,unlockBackground};
})();


/* v41.1 — remove legacy nested mobile scroll traps across every page and mini-section. */
(function(){
  "use strict";
  const css=document.createElement("style");
  css.id="smartledger-v41-1-universal-scroll";
  css.textContent=`
    /* Desktop: one workspace scroller; nested content expands naturally. */
    @media(min-width:851px){
      html,body{height:100%!important;min-height:100%!important;overflow:hidden!important}
      .app{height:100dvh!important;min-height:0!important;overflow:hidden!important}
      .main{height:100dvh!important;min-height:0!important;max-height:100dvh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
      .main>.content{flex:1 1 auto!important;height:auto!important;min-height:0!important;max-height:none!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior-y:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important}
      #view{height:auto!important;min-height:max-content!important;max-height:none!important;overflow:visible!important}
      .modal.show .dialog{max-height:calc(100dvh - 24px)!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important}
    }
    /* Mobile: the document is the only vertical scroll owner. */
    @media(max-width:850px){
      html{height:auto!important;min-height:100%!important;overflow-x:clip!important;overflow-y:auto!important;scroll-behavior:auto!important}
      body{height:auto!important;min-height:100%!important;overflow-x:clip!important;overflow-y:auto!important;position:relative!important;top:auto!important;width:100%!important;overscroll-behavior-y:auto!important}
      body.sl-modal-open{position:fixed!important;top:var(--sl-modal-scroll-top,0px)!important;left:0!important;right:0!important;width:100%!important;overflow:hidden!important}
      .app{display:block!important;width:100%!important;height:auto!important;min-height:100svh!important;overflow:visible!important}
      .side{position:fixed!important;inset:0 0 auto 0!important;width:100%!important;height:62px!important;overflow:visible!important;z-index:40!important}
      .main{display:block!important;position:relative!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;margin:0!important;padding:62px 0 0!important}
      .main>.top{position:sticky!important;top:62px!important;z-index:12!important;display:flex!important;height:48px!important;min-height:48px!important}
      .main>.content{display:block!important;position:relative!important;width:100%!important;max-width:none!important;height:auto!important;min-height:0!important;max-height:none!important;flex:none!important;overflow:visible!important;overflow-x:clip!important;overflow-y:visible!important;touch-action:pan-y!important;overscroll-behavior:initial!important;-webkit-overflow-scrolling:auto!important;margin:0 auto!important;padding-bottom:calc(112px + env(safe-area-inset-bottom))!important}
      #view{display:block!important;position:relative!important;width:100%!important;max-width:100%!important;height:auto!important;min-height:max-content!important;max-height:none!important;overflow:visible!important;touch-action:pan-y!important}
      #view>*{max-width:100%;min-width:0}
      /* Expand compact lists and sub-panels so the page/modal scrolls, not a nested box. */
      #view .txn-product-grid{display:grid!important;max-height:none!important;height:auto!important;overflow:visible!important;overscroll-behavior:initial!important;touch-action:pan-y!important}
      #view .section-quick{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;overflow:visible!important;flex-wrap:wrap!important}
      #view .v40-tabs{display:flex!important;flex-wrap:wrap!important;overflow:visible!important;white-space:normal!important}
      #view .tablewrap,#view .v40-table{max-height:none!important;height:auto!important;overflow:visible!important;overscroll-behavior:initial!important}
      #view .v40-table table{width:100%!important;min-width:0!important;table-layout:fixed!important}
      #view .v40-table th,#view .v40-table td{white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
      .mobile-nav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:50!important}
      /* The dialog is the only vertical scroll area while it is open. */
      .modal{position:fixed!important;inset:0!important;z-index:100!important;overflow:hidden!important;overscroll-behavior:contain!important}
      .modal.show{display:flex!important;align-items:flex-start!important;justify-content:center!important;padding:calc(8px + env(safe-area-inset-top)) 10px calc(8px + env(safe-area-inset-bottom))!important;overflow:hidden!important}
      .modal.show .dialog{display:block!important;width:100%!important;max-width:620px!important;height:auto!important;min-height:0!important;max-height:calc(100dvh - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important}
      #modalbody{min-height:0!important}
    }
  `;
  document.head.appendChild(css);
  const modal=document.getElementById("modal");
  let y=0;
  const oldModal=window.modal;
  if(typeof oldModal==="function"){
    window.modal=function(){
      y=window.scrollY||document.documentElement.scrollTop||0;
      document.body.style.setProperty("--sl-modal-scroll-top",(-y)+"px");
      const result=oldModal.apply(this,arguments);
      requestAnimationFrame(()=>{const d=modal?.querySelector(".dialog");if(d)d.scrollTop=0;});
      return result;
    };
  }
  const oldClose=window.closeModal;
  if(typeof oldClose==="function"){
    window.closeModal=function(){
      const result=oldClose.apply(this,arguments);
      if(!modal?.classList.contains("show")){
        document.body.style.removeProperty("--sl-modal-scroll-top");
        requestAnimationFrame(()=>window.scrollTo(0,y));
      }
      return result;
    };
  }
  window.__SMARTLEDGER_V41_1_SCROLL__={version:"41.1.0",reset:()=>window.scrollTo(0,0)};
})();
