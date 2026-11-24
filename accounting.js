/* SmartLedger v18.0 — accounting foundation.
   Journal entries are a separate, balanced general-ledger register.
   Legacy sales/purchase/payment/expense records are intentionally not auto-posted:
   they require a verified migration and opening-balance reconciliation first. */
(function () {
  "use strict";
  const ACCOUNT_KEY = "sl_chart_accounts";
  const JOURNAL_KEY = "sl_account_journals";
  const defaults = [
    ["1000","Cash in Hand","Asset"],["1010","Bank Account","Asset"],
    ["1100","Accounts Receivable","Asset"],["1200","Inventory Asset","Asset"],
    ["1300","Input GST Credit","Asset"],["2000","Accounts Payable","Liability"],
    ["2100","Output GST Payable","Liability"],["2200","Other Current Liabilities","Liability"],
    ["3000","Owner's Capital","Equity"],["3100","Retained Earnings","Equity"],
    ["4000","Sales Revenue","Income"],["4100","Other Income","Income"],
    ["5000","Cost of Goods Sold","Expense"],["5100","Purchase Expense","Expense"],
    ["6000","Shop Rent","Expense"],["6010","Salaries","Expense"],
    ["6020","Electricity & Utilities","Expense"],["6030","Transport & Fuel","Expense"],
    ["6090","Other Operating Expenses","Expense"]
  ].map(([code,name,type]) => ({code,name,type,system:true,active:true}));
  const read = key => { try { const v=JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(v)?v:[]; } catch (_) { return []; } };
  const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));
  const esc = value => String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const n = value => { const v=Number(value); return Number.isFinite(v)?v:0; };
  const fmt = value => "₹"+n(value).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
  const dateNow = () => new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const accounts = () => {
    let a=read(ACCOUNT_KEY);
    if(!a.length){a=defaults.map(x=>({...x}));write(ACCOUNT_KEY,a);}
    return a.filter(x=>x.active!==false);
  };
  const journals = () => read(JOURNAL_KEY);
  const byCode = code => accounts().find(a=>a.code===code);
  const allLines = entries => entries.flatMap(j=>Array.isArray(j.lines)?j.lines:[]);
  const total = (arr,key) => arr.reduce((s,x)=>s+n(x[key]),0);
  const notice = "This is the new general-ledger journal register. Existing sales, purchases, receipts, payments and expenses are not yet automatically posted here. Do not use these journal-only statements as complete statutory financial statements until transaction migration and opening balances are reconciled.";
  function accountOptions(selected=""){
    return accounts().map(a=>'<option value="'+esc(a.code)+'" '+(a.code===selected?"selected":"")+'>'+esc(a.code+" · "+a.name+" ("+a.type+")")+'</option>').join("");
  }
  function accountingPage(){
    const a=accounts(),j=journals(),lines=allLines(j),debit=total(lines,"debit"),credit=total(lines,"credit");
    const counts={};a.forEach(x=>counts[x.type]=(counts[x.type]||0)+1);
    document.querySelector("#view").innerHTML=
      '<div class="welcome"><div><h1>Accounts & general ledger</h1><div class="muted">v18.0 · Balanced double-entry journal foundation</div></div><button class="btn primary" onclick="newJournal()">＋ New journal</button></div>'+
      '<div class="grid"><div class="card"><div class="statlabel">Chart of accounts</div><div class="stat">'+a.length+'</div></div><div class="card"><div class="statlabel">Posted journals</div><div class="stat">'+j.length+'</div></div><div class="card"><div class="statlabel">Total debits</div><div class="stat">'+fmt(debit)+'</div></div><div class="card"><div class="statlabel">Total credits</div><div class="stat">'+fmt(credit)+'</div></div></div>'+
      '<div class="section card"><div class="sectionhead"><div><h2>Accounting workspace</h2><div class="muted">Every journal must balance before it can be posted.</div></div></div><div class="actions"><button class="btn primary" onclick="newJournal()">Create journal entry</button><button class="btn" onclick="showChartOfAccounts()">Chart of accounts</button><button class="btn" onclick="showTrialBalance()">Trial balance</button><button class="btn" onclick="showAccountStatements()">Account ledger</button><button class="btn" onclick="showFinancialStatements()">Journal-based P&amp;L / balance sheet</button></div></div>'+
      '<div class="section"><h2>Recent journal entries</h2>'+journalTable(j.slice().reverse().slice(0,20))+'</div>'+
      '<div class="notice">'+notice+'</div>';
  }
  function journalTable(rows){
    if(!rows.length)return '<div class="empty">No journal entries posted yet.</div>';
    return '<div class="tablewrap"><table><thead><tr><th>Date</th><th>Reference</th><th>Narration</th><th>Debits</th><th>Credits</th><th>Status</th></tr></thead><tbody>'+
      rows.map(j=>'<tr><td>'+esc(j.date)+'</td><td>'+esc(j.reference)+'</td><td>'+esc(j.narration)+'</td><td>'+fmt(total(j.lines||[],"debit"))+'</td><td>'+fmt(total(j.lines||[],"credit"))+'</td><td><span class="pill">Posted</span></td></tr>').join("")+
      '</tbody></table></div>';
  }
  function showChartOfAccounts(){
    const a=accounts();
    const types=["Asset","Liability","Equity","Income","Expense"];
    document.querySelector("#view").innerHTML='<div class="sectionhead"><div><h2>Chart of accounts</h2><div class="muted">Standard retail accounts plus custom accounts</div></div><button class="btn primary" onclick="newAccount()">＋ Add account</button></div>'+
      types.map(type=>'<section class="section"><h3>'+type+' accounts</h3>'+accountTable(a.filter(x=>x.type===type))+'</section>').join("")+
      '<div class="notice">System accounts are protected. Custom accounts can be deactivated only when they have no journal activity.</div>';
  }
  function accountTable(rows){
    if(!rows.length)return '<div class="empty">No accounts in this group.</div>';
    return '<div class="tablewrap"><table><thead><tr><th>Code</th><th>Account name</th><th>Type</th><th>Origin</th></tr></thead><tbody>'+
      rows.map(a=>'<tr><td>'+esc(a.code)+'</td><td>'+esc(a.name)+'</td><td>'+esc(a.type)+'</td><td>'+(a.system?"System":"Custom")+'</td></tr>').join("")+
      '</tbody></table></div>';
  }
  function newAccount(){
    modal("Add account",'<form onsubmit="saveAccount(event)"><div class="formgrid"><div class="field"><label>Account code</label><input id="acode" required inputmode="numeric" maxlength="12"></div><div class="field"><label>Account name</label><input id="aname" required maxlength="70"></div><div class="field"><label>Account type</label><select id="atype"><option>Asset</option><option>Liability</option><option>Equity</option><option>Income</option><option>Expense</option></select></div></div><p><button class="btn primary">Save account</button></p></form>');
  }
  function saveAccount(e){
    e.preventDefault();const code=document.querySelector("#acode").value.trim(),name=document.querySelector("#aname").value.trim(),type=document.querySelector("#atype").value,a=read(ACCOUNT_KEY);
    if(!/^([0-9]{3,12})$/.test(code))return alert("Use a unique numeric account code (3–12 digits).");
    if(a.some(x=>x.code===code))return alert("This account code already exists.");
    if(a.some(x=>x.name.toLowerCase()===name.toLowerCase()&&x.active!==false))return alert("An active account with this name already exists.");
    a.push({code,name,type,system:false,active:true,createdAt:new Date().toISOString()});write(ACCOUNT_KEY,a);closeModal();showChartOfAccounts();
  }
  function newJournal(){
    const opts=accountOptions(),date=dateNow();
    modal("New journal entry",'<form onsubmit="postJournal(event)"><div class="formgrid">'+
      '<div class="field"><label>Entry date</label><input id="jdate" type="date" value="'+date+'" required></div>'+
      '<div class="field"><label>Reference number</label><input id="jref" maxlength="40" placeholder="JV-001" required></div>'+
      '<div class="field full"><label>Narration</label><input id="jnarration" maxlength="180" placeholder="Reason for this journal entry" required></div></div>'+
      '<div class="tablewrap"><table><thead><tr><th>Account</th><th>Debit (₹)</th><th>Credit (₹)</th></tr></thead><tbody id="journalLines">'+[0,1].map((_,i)=>journalRow(i,opts)).join("")+'</tbody></table></div>'+
      '<p><button type="button" class="btn" onclick="addJournalLine()">＋ Add line</button></p><div class="grid"><div class="card"><div class="statlabel">Total debit</div><div class="stat" id="journalDebit">₹0.00</div></div><div class="card"><div class="statlabel">Total credit</div><div class="stat" id="journalCredit">₹0.00</div></div></div><p class="muted" id="journalBalanceHint">Enter equal debit and credit totals.</p><p><button class="btn primary">Validate and post journal</button></p></form>');
    updateJournalTotals();
  }
  function journalRow(i,opts){
    return '<tr class="journal-line"><td><select class="jaccount" required><option value="">Select account</option>'+opts+'</select></td><td><input class="jdebit" type="number" min="0" step="0.01" value="0" inputmode="decimal" oninput="updateJournalTotals()"></td><td><input class="jcredit" type="number" min="0" step="0.01" value="0" inputmode="decimal" oninput="updateJournalTotals()"></td></tr>';
  }
  function addJournalLine(){
    const body=document.querySelector("#journalLines");if(!body)return;
    body.insertAdjacentHTML("beforeend",journalRow(body.querySelectorAll("tr").length,accountOptions()));
  }
  function updateJournalTotals(){
    const body=document.querySelector("#journalLines");if(!body)return;
    let d=0,c=0;body.querySelectorAll("tr").forEach(row=>{d+=n(row.querySelector(".jdebit").value);c+=n(row.querySelector(".jcredit").value);});
    document.querySelector("#journalDebit").textContent=fmt(d);document.querySelector("#journalCredit").textContent=fmt(c);
    const hint=document.querySelector("#journalBalanceHint");if(hint)hint.textContent=Math.abs(d-c)<0.005&&d>0?"Balanced — ready to post.":"Difference: "+fmt(Math.abs(d-c))+" · Debits and credits must be equal and greater than zero.";
  }
  function postJournal(e){
    e.preventDefault();const rows=[...document.querySelectorAll("#journalLines tr")],lines=rows.map(row=>({account:row.querySelector(".jaccount").value,debit:n(row.querySelector(".jdebit").value),credit:n(row.querySelector(".jcredit").value)}));
    if(lines.length<2)return alert("A journal needs at least two lines.");
    if(lines.some(x=>!x.account||x.debit<0||x.credit<0||(x.debit>0&&x.credit>0)||(x.debit===0&&x.credit===0)))return alert("Each line must have an account and either a debit or a credit amount.");
    const debit=total(lines,"debit"),credit=total(lines,"credit");
    if(debit<=0||Math.abs(debit-credit)>0.004)return alert("Journal is not balanced. Total debit and credit must match.");
    const ref=document.querySelector("#jref").value.trim(),date=document.querySelector("#jdate").value,narration=document.querySelector("#jnarration").value.trim(),a=journals();
    if(a.some(x=>String(x.reference).toLowerCase()===ref.toLowerCase()))return alert("This journal reference already exists.");
    if(!date||!narration||!ref)return alert("Complete the date, reference and narration.");
    a.push({id:"J"+Date.now(),date,reference:ref,narration,lines:lines.map(x=>({...x})),postedAt:new Date().toISOString(),status:"posted"});
    write(JOURNAL_KEY,a);closeModal();accountingPage();
  }
  function showTrialBalance(){
    const a=accounts(),j=journals(),from=document.querySelector("#tbFrom")?.value||"",to=document.querySelector("#tbTo")?.value||"";
    const selected=j.filter(x=>(!from||x.date>=from)&&(!to||x.date<=to)),balances={};a.forEach(x=>balances[x.code]={account:x,debit:0,credit:0});
    selected.forEach(entry=>(entry.lines||[]).forEach(line=>{if(!balances[line.account])return;balances[line.account].debit+=n(line.debit);balances[line.account].credit+=n(line.credit);}));
    const rows=Object.values(balances).filter(x=>x.debit||x.credit).map(x=>{const net=x.debit-x.credit;return {...x,closingDebit:Math.max(0,net),closingCredit:Math.max(0,-net)};});
    const d=total(rows,"closingDebit"),c=total(rows,"closingCredit");
    document.querySelector("#view").innerHTML='<div class="sectionhead"><div><h2>Trial balance</h2><div class="muted">Based only on posted general-ledger journals</div></div><button class="btn" onclick="printAccountsReport()">Print / PDF</button></div><div class="formgrid"><div class="field"><label>From date</label><input id="tbFrom" type="date"></div><div class="field"><label>To date</label><input id="tbTo" type="date"></div></div><p><button class="btn primary" onclick="showTrialBalance()">Apply dates</button> <button class="btn" onclick="downloadTrialBalance()">Export CSV</button></p><div class="tablewrap"><table><thead><tr><th>Code</th><th>Account</th><th>Debit balance</th><th>Credit balance</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+esc(x.account.code)+'</td><td>'+esc(x.account.name)+'</td><td>'+fmt(x.closingDebit)+'</td><td>'+fmt(x.closingCredit)+'</td></tr>').join("")+'</tbody><tfoot><tr><th colspan="2">Totals</th><th>'+fmt(d)+'</th><th>'+fmt(c)+'</th></tr></tfoot></table></div><div class="notice">'+(Math.abs(d-c)<0.005?"Trial balance agrees.":"Warning: trial balance does not agree; review journal data.")+" "+esc(notice)+'</div>';
    if(from)document.querySelector("#tbFrom").value=from;if(to)document.querySelector("#tbTo").value=to;
  }
  function showAccountStatements(){
    const a=accounts(),code=document.querySelector("#accountPick")?.value||a[0]?.code||"",j=journals().slice().sort((x,y)=>(x.date||"").localeCompare(y.date||""));
    const entries=j.flatMap(entry=>(entry.lines||[]).filter(line=>line.account===code).map(line=>({date:entry.date,reference:entry.reference,narration:entry.narration,debit:n(line.debit),credit:n(line.credit)})));
    let running=0;const rows=entries.map(x=>{running+=x.debit-x.credit;return {...x,balance:running};});
    document.querySelector("#view").innerHTML='<div class="sectionhead"><div><h2>Account ledger</h2><div class="muted">Journal movement and running balance</div></div><button class="btn" onclick="printAccountsReport()">Print / PDF</button></div><div class="field"><label>Select account</label><select id="accountPick" onchange="showAccountStatements()">'+a.map(x=>'<option value="'+esc(x.code)+'" '+(x.code===code?"selected":"")+'>'+esc(x.code+" · "+x.name)+'</option>').join("")+'</select></div><div class="tablewrap"><table><thead><tr><th>Date</th><th>Reference</th><th>Narration</th><th>Debit</th><th>Credit</th><th>Running net</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+esc(x.date)+'</td><td>'+esc(x.reference)+'</td><td>'+esc(x.narration)+'</td><td>'+fmt(x.debit)+'</td><td>'+fmt(x.credit)+'</td><td>'+fmt(x.balance)+'</td></tr>').join("")+'</tbody></table></div><div class="notice">'+esc(notice)+'</div>';
  }
  function showFinancialStatements(){
    const a=accounts(),j=journals(),lines=allLines(j),group={Income:0,Expense:0,Asset:0,Liability:0,Equity:0};
    const sums={};a.forEach(x=>sums[x.code]={account:x,debit:0,credit:0});
    lines.forEach(x=>{if(sums[x.account]){sums[x.account].debit+=n(x.debit);sums[x.account].credit+=n(x.credit);}});
    Object.values(sums).forEach(x=>{const net=x.account.type==="Asset"||x.account.type==="Expense"?x.debit-x.credit:x.credit-x.debit;group[x.account.type]+=net;});
    const net=group.Income-group.Expense,asset=group.Asset,liability=group.Liability,equity=group.Equity+net;
    document.querySelector("#view").innerHTML='<div class="welcome"><div><h1>Journal-based financial statements</h1><div class="muted">Only posted general-ledger journals are included</div></div><button class="btn" onclick="printAccountsReport()">Print / PDF</button></div><div class="grid"><div class="card"><div class="statlabel">Journal income</div><div class="stat">'+fmt(group.Income)+'</div></div><div class="card"><div class="statlabel">Journal expenses</div><div class="stat">'+fmt(group.Expense)+'</div></div><div class="card"><div class="statlabel">Journal net profit</div><div class="stat">'+fmt(net)+'</div></div><div class="card"><div class="statlabel">Journal assets</div><div class="stat">'+fmt(asset)+'</div></div></div><div class="section card"><h2>Balance sheet summary</h2><p>Assets: <b>'+fmt(asset)+'</b></p><p>Liabilities: <b>'+fmt(liability)+'</b></p><p>Equity including current journal profit: <b>'+fmt(equity)+'</b></p><p>Liabilities + equity: <b>'+fmt(liability+equity)+'</b></p><p>Balance check difference: <b>'+fmt(asset-liability-equity)+'</b></p></div><div class="notice">'+esc(notice)+'</div>';
  }
  function printAccountsReport(){
    const w=window.open("","_blank");if(!w)return alert("Allow pop-ups to print this report.");
    w.document.write('<!doctype html><html><head><title>SmartLedger Accounts</title><style>body{font:14px Arial;padding:24px;color:#222}table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:8px;text-align:left}.notice{margin-top:20px;padding:12px;background:#f2f2f2}</style></head><body><h2>'+esc(localStorage.bizname||"SmartLedger")+' — Accounts report</h2>'+document.querySelector("#view").innerHTML+'</body></html>');w.document.close();w.print();
  }
  function downloadTrialBalance(){
    const rows=[["Code","Account","Type","Debit","Credit"]];const a=accounts(),sums={};a.forEach(x=>sums[x.code]={account:x,debit:0,credit:0});
    journals().forEach(j=>(j.lines||[]).forEach(l=>{if(sums[l.account]){sums[l.account].debit+=n(l.debit);sums[l.account].credit+=n(l.credit);}}));
    Object.values(sums).forEach(x=>{const net=x.debit-x.credit;rows.push([x.account.code,x.account.name,x.account.type,Math.max(0,net).toFixed(2),Math.max(0,-net).toFixed(2)]);});
    const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),link=document.createElement("a");link.href=url;link.download="smartledger-trial-balance.csv";link.click();URL.revokeObjectURL(url);
  }
  window.accountingPage=accountingPage;window.showChartOfAccounts=showChartOfAccounts;window.newAccount=newAccount;window.saveAccount=saveAccount;
  window.newJournal=newJournal;window.addJournalLine=addJournalLine;window.updateJournalTotals=updateJournalTotals;window.postJournal=postJournal;
  window.showTrialBalance=showTrialBalance;window.showAccountStatements=showAccountStatements;window.showFinancialStatements=showFinancialStatements;
  window.printAccountsReport=printAccountsReport;window.downloadTrialBalance=downloadTrialBalance;
  const oldRender=window.render;
  window.render=function(){if(window.__smartLedgerPage==="Accounts")return accountingPage();return oldRender.apply(this,arguments);};
  const oldGo=window.go;
  window.go=function(p){window.__smartLedgerPage=p==="Accounts"?"Accounts":"";return oldGo.apply(this,arguments);};
})();
