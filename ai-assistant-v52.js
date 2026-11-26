/* SmartLedger AI Business Manager v52.0
 * Local-first business intelligence. No API keys, network calls, or fabricated data.
 */
(function(){
  "use strict";
  const $ = id => document.getElementById(id);
  const read = key => { try { return typeof get === "function" ? get(key) || [] : JSON.parse(localStorage.getItem("sl_"+key)||"[]"); } catch(e){ return []; } };
  const n = v => { const x=Number(v); return Number.isFinite(x)?x:0; };
  const sumBy = (a,fn) => a.reduce((s,x)=>s+n(fn(x)),0);
  const moneyFmt = v => typeof money==="function" ? money(v) : "₹"+n(v).toLocaleString("en-IN",{maximumFractionDigits:2});
  const todayKey = () => typeof today!=="undefined" ? today : new Date().toISOString().slice(0,10);
  const monthKey = () => todayKey().slice(0,7);
  const sales = () => read("sales");
  const purchases = () => read("purchases");
  const items = () => read("items");
  const customers = () => read("customers");
  const suppliers = () => read("suppliers");
  const expenses = () => read("expenses");
  const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const dateDaysAgo = d => { if(!d)return 99999; const t=new Date(d+"T12:00:00").getTime(); return Number.isFinite(t)?Math.max(0,Math.floor((new Date(todayKey()+"T12:00:00").getTime()-t)/86400000)):99999; };
  function outstanding(type){
    if(typeof outstandingTotal==="function") return n(outstandingTotal(type));
    const cust=type==="Customer", parties=cust?customers():suppliers(), tx=cust?sales():purchases(), payments=read("payments");
    const names=parties.map(p=>p.name);
    return sumBy(parties,p=>n(p.opening)+sumBy(tx.filter(x=>x.party===p.name),x=>n(x.total)-n(x.paid))-sumBy(payments.filter(x=>x.type===type&&x.party===p.name),x=>x.amount))
      +sumBy(tx.filter(x=>!names.includes(x.party)),x=>n(x.total)-n(x.paid))-sumBy(payments.filter(x=>x.type===type&&!names.includes(x.party)),x=>x.amount);
  }
  function metrics(){
    const s=sales(),p=purchases(),it=items(),e=expenses(),m=monthKey(),d=todayKey();
    const month=s.filter(x=>(x.date||"").slice(0,7)===m),day=s.filter(x=>x.date===d);
    const costed= s.filter(x=>x.cost!==undefined && x.cost!==null && (n(x.cost)>0 || n(x.total)===0));
    const gross=sumBy(costed,x=>n(x.taxable??x.total)-n(x.cost));
    const missing=s.filter(x=>x.cost===undefined||x.cost===null||(n(x.cost)===0&&n(x.total)>0)).length;
    const productMap={};
    s.forEach(t=>(t.lines&&t.lines.length?t.lines:[{item:t.item,qty:t.qty,total:t.total,cost:t.cost}]).forEach(l=>{
      const key=l.item||"Unspecified"; const z=productMap[key]||(productMap[key]={name:key,qty:0,revenue:0,cost:0,transactions:0});
      z.qty+=n(l.qty); z.revenue+=n(l.total); z.cost+=n(l.cost); z.transactions++;
    }));
    const customerMap={};
    s.forEach(t=>{if(!t.party)return;const z=customerMap[t.party]||(customerMap[t.party]={name:t.party,sales:0,count:0,last:null});z.sales+=n(t.total);z.count++;if(!z.last||String(t.date)>z.last)z.last=t.date;});
    const products=Object.values(productMap).sort((a,b)=>b.qty-a.qty);
    const customerRows=Object.values(customerMap).sort((a,b)=>b.sales-a.sales);
    const monthlyByKey={};s.forEach(t=>{const k=(t.date||"").slice(0,7);if(k)monthlyByKey[k]=(monthlyByKey[k]||0)+n(t.total)});
    const prior=new Date(todayKey()+"T12:00:00");prior.setMonth(prior.getMonth()-1);const prevKey=prior.toISOString().slice(0,7);
    const stockValue=sumBy(it,x=>n(x.qty)*n(x.purchase));
    return {s,p,it,e,month,day,gross,missing,net:gross-sumBy(e,x=>x.amount),products,customerRows,monthlySales:sumBy(month,x=>x.total),previousSales:monthlyByKey[prevKey]||0,stockValue,receivable:outstanding("Customer"),payable:outstanding("Supplier")};
  }
  function inventoryAdvice(m){
    return m.it.map(p=>{
      const sold=sumBy(m.s,t=>(t.lines&&t.lines.length?t.lines:[{item:t.item,qty:t.qty}]).filter(l=>l.item===p.name).reduce((a,l)=>a+n(l.qty),0));
      const recent=sumBy(m.s.filter(t=>dateDaysAgo(t.date)<=30),t=>(t.lines&&t.lines.length?t.lines:[{item:t.item,qty:t.qty}]).filter(l=>l.item===p.name).reduce((a,l)=>a+n(l.qty),0));
      const daily=recent/30, min=n(p.minStock??5), days=daily>0?n(p.qty)/daily:Infinity;
      const reorder=Math.max(0,Math.ceil(daily*10-n(p.qty)));
      const margin=n(p.price)>0&&n(p.purchase)>0?(n(p.price)-n(p.purchase))/n(p.price)*100:null;
      return {...p,sold,recent,daily,days,reorder,margin};
    }).sort((a,b)=>a.days-b.days);
  }
  function buildAlerts(m){
    const inv=inventoryAdvice(m),alerts=[];
    inv.forEach(p=>{
      if(n(p.qty)<=n(p.minStock??5))alerts.push({level:"high",title:"Reorder threshold reached",detail:p.name+": "+p.qty+" "+(p.unit||"units")+" remaining; reorder level "+n(p.minStock??5)+"."});
      else if(p.daily>0&&p.days<=7)alerts.push({level:"high",title:"Fast-moving stock may run out",detail:p.name+": about "+p.days.toFixed(1)+" days of stock at its recent 30-day sales rate."});
      if(p.margin!==null&&p.margin<3)alerts.push({level:"medium",title:"Low recorded selling margin",detail:p.name+": approximately "+p.margin.toFixed(1)+"% margin before expenses."});
    });
    m.customerRows.forEach(c=>{if(c.last&&dateDaysAgo(c.last)>=30&&c.sales>0)alerts.push({level:"medium",title:"Customer inactive for 30+ days",detail:c.name+": last recorded sale "+dateDaysAgo(c.last)+" days ago."});});
    m.s.filter(t=>n(t.total)>n(t.paid)&&dateDaysAgo(t.date)>=30).slice(0,12).forEach(t=>alerts.push({level:"medium",title:"Sales invoice may be overdue",detail:(t.party||"Walk-in")+" · "+(t.invoice||"Invoice")+" · "+moneyFmt(n(t.total)-n(t.paid))+" outstanding; "+dateDaysAgo(t.date)+" days old."}));
    if(m.missing)alerts.push({level:"medium",title:"Incomplete cost records",detail:m.missing+" sales transaction(s) have no recorded cost; profit estimates may be incomplete."});
    return alerts;
  }
  function answerQuestion(raw){
    const q=String(raw||"").toLowerCase().trim(),m=metrics(),inv=inventoryAdvice(m),alerts=buildAlerts(m);
    if(!q)return "Enter a business question to analyse.";
    if(/today|today's|daily sale/.test(q))return "Today's sales: "+moneyFmt(sumBy(m.day,x=>x.total))+" across "+m.day.length+" invoices. Received: "+moneyFmt(sumBy(m.day,x=>x.paid))+".";
    if(/compare|last month|previous month|growth/.test(q)){const delta=m.monthlySales-m.previousSales,pct=m.previousSales?delta/m.previousSales*100:null;return "This month: "+moneyFmt(m.monthlySales)+". Previous month: "+moneyFmt(m.previousSales)+". "+(pct===null?"There is no previous-month sales baseline yet.":(delta>=0?"Increase":"Decrease")+" of "+moneyFmt(Math.abs(delta))+" ("+Math.abs(pct).toFixed(1)+"%).");}
    if(/profit|margin|loss|net income/.test(q))return "Recorded gross profit estimate: "+moneyFmt(m.gross)+". Net estimate after recorded expenses: "+moneyFmt(m.net)+". "+m.missing+" transaction(s) lack a recorded cost. This excludes unrecorded costs and does not allocate expenses to individual customers/products.";
    if(/low stock|reorder|shortage|run out|stock.*finish/.test(q)){const low=inv.filter(p=>n(p.qty)<=n(p.minStock??5)||p.days<=7);return low.length?"Stock requiring attention: "+low.slice(0,12).map(p=>p.name+" — "+p.qty+" "+(p.unit||"units")+" left; suggested 10-day top-up "+p.reorder+".").join("; "):"No products currently meet the recorded reorder threshold or 7-day stock-cover alert.";}
    if(/stock value|inventory value|total stock|inventory/.test(q))return "Inventory: "+m.it.length+" product types, "+sumBy(m.it,x=>x.qty)+" recorded stock units and estimated purchase-cost value "+moneyFmt(m.stockValue)+".";
    if(/customer due|receivable|who owes|customer balance/.test(q))return "Customer receivables: "+moneyFmt(m.receivable)+". Open Ledgers for party-wise balances.";
    if(/supplier due|payable|owe supplier|supplier balance/.test(q))return "Supplier payables: "+moneyFmt(m.payable)+". Open Ledgers for supplier-wise balances.";
    if(/top customer|best customer|valuable customer/.test(q))return m.customerRows.length?"Top customers by recorded sales: "+m.customerRows.slice(0,5).map((x,i)=>(i+1)+". "+x.name+" — "+moneyFmt(x.sales)).join("; "):"No named-customer sales are recorded yet.";
    if(/top sell|fast mov|most sold|best product/.test(q))return m.products.length?"Fastest-moving products by recorded quantity: "+m.products.slice(0,7).map((x,i)=>(i+1)+". "+x.name+" — "+x.qty+" units").join("; "):"No product-level sales history is available.";
    if(/expense/.test(q))return "Recorded expenses: "+moneyFmt(sumBy(m.e,x=>x.amount))+". Net profit estimate after these expenses: "+moneyFmt(m.net)+".";
    if(/price|pricing|sell for|selling price/.test(q)){const p=m.it.find(x=>q.includes(String(x.name||"").toLowerCase()));if(!p)return "Include the product name, for example: What selling price should I use for rice?";const cost=n(p.purchase),price=n(p.price);if(cost<=0)return "There is no recorded purchase cost for "+p.name+". Add its cost before calculating a selling-price suggestion.";return p.name+" — recorded purchase cost "+moneyFmt(cost)+", current selling price "+moneyFmt(price)+". For a 3% gross margin, suggested price is "+moneyFmt(cost/.97)+"; for 4%, "+moneyFmt(cost/.96)+". These exclude expenses, tax and market-rate checks.";}
    if(/supplier|purchase price|buying price/.test(q))return "Recorded supplier purchases: "+moneyFmt(sumBy(m.p,x=>x.total))+". Supplier payables: "+moneyFmt(m.payable)+". Supplier-wise purchase totals are available in saved records; unrecorded market prices are not available.";
    if(/alert|problem|warning|business health/.test(q))return alerts.length?alerts.length+" business alert(s): "+alerts.slice(0,5).map(a=>a.title+" — "+a.detail).join(" "):"No alerts were detected from the currently recorded data.";
    return "I can analyse today's/monthly sales, month-on-month change, gross and net profit estimates, expenses, top products/customers, stock cover, reorder quantities, customer receivables and supplier payables. Try: “Compare this month with last month” or “Which products may run out?”";
  }
  function metricCard(label,value,sub){return '<div class="card"><div class="statlabel">'+esc(label)+'</div><div class="stat">'+value+'</div>'+(sub?'<small class="muted">'+esc(sub)+'</small>':'')+'</div>';}
  function panel(title,sub,body){return '<section class="section"><div class="sectionhead"><div><h3>'+esc(title)+'</h3><small class="muted">'+esc(sub||"")+'</small></div></div>'+body+'</section>';}
  function chatHTML(){return '<div class="card ai-chat-card"><div class="ai-head"><div><b>SmartLedger AI Business Manager</b><p class="muted">Ask about sales, profit, stock, customers or suppliers.</p></div><span class="ai-live">LOCAL DATA</span></div><div id="ai-chat-history" class="ai-chat-history" aria-live="polite"><div class="ai-message ai-bot">I analyse your saved SmartLedger records and explain what they show. What would you like to know?</div></div><div class="ai-prompt-row"><input id="aiquestion" class="search" aria-label="Ask the business assistant" placeholder="Ask: Which products need reordering?" onkeydown="if(event.key===\'Enter\')askBusinessAssistant()"><button class="btn" onclick="smartLedgerVoiceInput()" aria-label="Ask by voice">🎙</button><button class="btn primary" onclick="askBusinessAssistant()">Ask</button></div><div class="ai-suggestions"><button onclick="smartLedgerAsk(&quot;How much did I sell today?&quot;)">Today’s sales</button><button onclick="smartLedgerAsk(&quot;Which products need reordering?&quot;)">Reorder advice</button><button onclick="smartLedgerAsk(&quot;Compare this month with last month&quot;)">Monthly comparison</button><button onclick="smartLedgerAsk(&quot;Show my profit estimate&quot;)">Profit estimate</button></div><small class="muted">Answers are calculated from this device’s saved records. No cloud AI model is connected in this release.</small></div>';}
  function insightsHTML(m){const top=m.products.slice(0,5),customersTop=m.customerRows.slice(0,5),inv=inventoryAdvice(m);return '<div class="grid">'+metricCard("This month sales",moneyFmt(m.monthlySales),m.month.length+" invoices")+metricCard("Gross profit estimate",moneyFmt(m.gross),"Recorded sales costs only")+metricCard("Net profit estimate",moneyFmt(m.net),"After recorded expenses")+metricCard("Stock purchase value",moneyFmt(m.stockValue),m.it.length+" product types")+metricCard("Customer receivables",moneyFmt(m.receivable),"Recorded outstanding")+metricCard("Supplier payables",moneyFmt(m.payable),"Recorded outstanding")+'</div>'+panel("Sales movement","This month compared with previous month",'<div class="card"><b>'+moneyFmt(m.monthlySales)+'</b> current month <span class="muted">·</span> <b>'+moneyFmt(m.previousSales)+'</b> previous month</div>')+panel("Fast-moving products","Ranked by recorded sold quantity",top.length?'<div class="tablewrap"><table><thead><tr><th>Product</th><th>Qty sold</th><th>Revenue</th><th>Current stock</th></tr></thead><tbody>'+top.map(x=>{const p=m.it.find(y=>y.name===x.name)||{};return '<tr><td>'+esc(x.name)+'</td><td>'+x.qty+'</td><td>'+moneyFmt(x.revenue)+'</td><td>'+n(p.qty)+'</td></tr>';}).join("")+'</tbody></table></div>':'<div class="empty">No product sales recorded.</div>')+panel("Top customers","Ranked by recorded sales",customersTop.length?'<div class="tablewrap"><table><thead><tr><th>Customer</th><th>Sales</th><th>Invoices</th><th>Last sale</th></tr></thead><tbody>'+customersTop.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+moneyFmt(x.sales)+'</td><td>'+x.count+'</td><td>'+esc(x.last||"—")+'</td></tr>').join("")+'</tbody></table></div>':'<div class="empty">No named-customer sales recorded.</div>')+panel("Inventory cover","Estimated from the last 30 days of recorded item sales",'<div class="tablewrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Daily avg.</th><th>Days cover</th><th>10-day top-up</th></tr></thead><tbody>'+inv.slice(0,12).map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+n(x.qty)+'</td><td>'+x.daily.toFixed(2)+'</td><td>'+(Number.isFinite(x.days)?x.days.toFixed(1):"No sales")+'</td><td>'+x.reorder+'</td></tr>').join("")+'</tbody></table></div>');}
  function inventoryHTML(m){const inv=inventoryAdvice(m);return '<div class="notice">Reorder suggestions use the last 30 days of saved sales and a 10-day stock target. They are estimates, not purchase orders.</div><div class="tablewrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Reorder level</th><th>30-day sold</th><th>Days cover</th><th>Suggested top-up</th><th>Recorded margin</th></tr></thead><tbody>'+inv.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+n(x.qty)+' '+esc(x.unit||"")+'</td><td>'+n(x.minStock??5)+'</td><td>'+x.recent+'</td><td>'+(Number.isFinite(x.days)?x.days.toFixed(1):"—")+'</td><td>'+x.reorder+'</td><td>'+(x.margin===null?"Missing price/cost":x.margin.toFixed(1)+"%")+'</td></tr>').join("")+'</tbody></table></div>';}
  function alertsHTML(m){const a=buildAlerts(m);return a.length?'<div class="ai-alert-list">'+a.map(x=>'<div class="ai-alert '+x.level+'"><b>'+esc(x.title)+'</b><p>'+esc(x.detail)+'</p></div>').join("")+'</div>':'<div class="card"><b>No current alerts detected.</b><p class="muted">Alerts will appear when recorded stock, sales or payment data meets a warning rule.</p></div>';}
  function reportsHTML(m){return '<div class="grid">'+metricCard("Sales",moneyFmt(sumBy(m.s,x=>x.total)))+metricCard("Purchases",moneyFmt(sumBy(m.p,x=>x.total)))+metricCard("Gross profit estimate",moneyFmt(m.gross))+metricCard("Expenses",moneyFmt(sumBy(m.e,x=>x.amount)))+metricCard("Net profit estimate",moneyFmt(m.net))+metricCard("Closing stock value",moneyFmt(m.stockValue))+'</div><div class="notice">Management estimate only. Missing costs, opening stock, tax adjustments and unrecorded expenses can change the result. Not a statutory financial statement.</div><div class="actions" style="margin-top:12px"><button class="btn primary" onclick="smartLedgerPrintReport()">Print / Save PDF</button><button class="btn" onclick="smartLedgerExportCSV()">Export CSV</button></div>';}
  const styles='<style id="smartledger-ai-v52-style">.ai-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:0 0 14px}.ai-tabs button{border:1px solid var(--line);border-radius:10px;padding:10px 4px;background:var(--card);color:var(--text);font-size:12px;font-weight:700}.ai-tabs button.active{background:#672d3c;color:#fff;border-color:#672d3c}.ai-chat-card{padding:14px}.ai-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.ai-head p{margin:5px 0 12px}.ai-live{font-size:9px;letter-spacing:.7px;border-radius:20px;padding:5px 7px;background:#e7eee9;color:#285d45;font-weight:800}.ai-chat-history{display:flex;flex-direction:column;gap:9px;max-height:280px;overflow:auto;padding:8px 0 12px}.ai-message{padding:11px 13px;border-radius:13px;max-width:94%;line-height:1.5;white-space:pre-wrap}.ai-bot{background:color-mix(in srgb,var(--card) 78%,#8c6a73 22%);align-self:flex-start}.ai-user{background:#672d3c;color:white;align-self:flex-end}.ai-prompt-row{display:grid;grid-template-columns:minmax(0,1fr) 42px auto;gap:7px}.ai-prompt-row input{min-width:0}.ai-suggestions{display:flex;gap:6px;overflow:auto;padding:10px 0}.ai-suggestions button{white-space:nowrap;border:1px solid var(--line);border-radius:20px;padding:7px 10px;background:var(--bg);color:var(--text);font-size:11px}.ai-alert-list{display:grid;gap:9px}.ai-alert{padding:12px;border:1px solid var(--line);border-left:4px solid #b77b39;border-radius:12px;background:var(--card)}.ai-alert.high{border-left-color:#bd4650}.ai-alert p{margin:5px 0 0;color:var(--muted);line-height:1.45}.ai-alert.medium{border-left-color:#bd8b42}@media(max-width:520px){.ai-tabs button{font-size:10px;padding:9px 2px}.ai-prompt-row{grid-template-columns:minmax(0,1fr) 38px}.ai-prompt-row .btn.primary{grid-column:1/-1}.ai-head b{font-size:14px}}</style>';
  let activeTab="chat";
  function renderTab(tab){
    activeTab=tab;const host=$("ai-v52-panel");if(!host)return;
    document.querySelectorAll(".ai-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.aiTab===tab));
    const m=metrics();
    host.innerHTML=tab==="chat"?chatHTML():tab==="insights"?insightsHTML(m):tab==="inventory"?inventoryHTML(m):tab==="alerts"?alertsHTML(m):reportsHTML(m);
    if(tab==="chat")restoreChat();
  }
  function restoreChat(){const box=$("ai-chat-history");if(!box)return;let history=[];try{history=JSON.parse(sessionStorage.getItem("sl_ai_chat_v52")||"[]");}catch(e){}history.slice(-20).forEach(x=>addMessage(x.role,x.text,false));box.scrollTop=box.scrollHeight;}
  function addMessage(role,text,save=true){const box=$("ai-chat-history");if(!box)return;const el=document.createElement("div");el.className="ai-message "+(role==="user"?"ai-user":"ai-bot");el.textContent=text;box.appendChild(el);box.scrollTop=box.scrollHeight;if(save){let h=[];try{h=JSON.parse(sessionStorage.getItem("sl_ai_chat_v52")||"[]");}catch(e){}h.push({role,text});sessionStorage.setItem("sl_ai_chat_v52",JSON.stringify(h.slice(-20)));}}
  window.smartLedgerAsk=function(q){if(activeTab!=="chat")renderTab("chat");const input=$("aiquestion");if(input)input.value=q;window.askBusinessAssistant();};
  const AI_ENDPOINT="https://asia-south1-smart-ledger-288a4.cloudfunctions.net/smartLedgerAI";
  function aiSnapshot(){
    const m=metrics();
    return {
      currency:"INR",
      generatedOn:todayKey(),
      totals:{salesAllTime:sumBy(m.s,x=>x.total),salesThisMonth:m.monthlySales,salesToday:sumBy(m.day,x=>x.total),purchases:sumBy(m.p,x=>x.total),grossProfitEstimate:m.gross,netProfitEstimate:m.net,recordedExpenses:sumBy(m.e,x=>x.amount),customerReceivables:m.receivable,supplierPayables:m.payable,stockPurchaseValue:m.stockValue,missingSalesCostTransactions:m.missing},
      inventory:m.it.slice(0,100).map(x=>({product:String(x.name||"").slice(0,80),stock:n(x.qty),unit:String(x.unit||"").slice(0,16),purchaseRate:n(x.purchase),sellingRate:n(x.price),reorderLevel:n(x.minStock??5)})),
      topProducts:m.products.slice(0,10).map(x=>({product:x.name,quantitySold:x.qty,revenue:x.revenue})),
      topCustomers:m.customerRows.slice(0,8).map(x=>({customer:x.name,sales:x.sales,invoices:x.count,lastSale:x.last})),
      recentSales:m.s.slice(-25).map(x=>({date:x.date,invoice:x.invoice,total:n(x.total),paid:n(x.paid),party:x.party||"Walk-in"})),
      recentPurchases:m.p.slice(-15).map(x=>({date:x.date,invoice:x.invoice,total:n(x.total),paid:n(x.paid),party:x.party||"Supplier"}))
    };
  }
  window.askBusinessAssistant=async function(){
    const input=$("aiquestion"),q=input?input.value.trim():"";if(!q)return;
    if(!localStorage.getItem("sl_openai_data_consent")){
      const ok=confirm("SmartLedger AI uses OpenAI to answer questions. A limited summary of your shop records (sales, stock, purchases and balances) will be sent securely to OpenAI for this request. Do you agree?");
      if(!ok)return;
      localStorage.setItem("sl_openai_data_consent","yes");
    }
    addMessage("user",q);
    const box=$("ai-chat-history"),loading=document.createElement("div");loading.className="ai-message ai-bot";loading.textContent="Analysing your business records…";if(box)box.appendChild(loading);
    if(input){input.value="";input.disabled=true;}
    try{
      if(typeof window.smartLedgerGetIdToken!=="function")throw new Error("Secure sign-in is not ready. Sign out and sign in again.");
      const token=await window.smartLedgerGetIdToken();
      if(!token)throw new Error("Sign in to use OpenAI SmartLedger AI.");
      const response=await fetch(AI_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({question:q,businessSnapshot:aiSnapshot()})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.error||"AI request failed ("+response.status+").");
      if(loading.isConnected)loading.remove();
      addMessage("assistant",result.answer||"The AI service returned no answer.");
    }catch(error){
      if(loading.isConnected)loading.remove();
      addMessage("assistant","AI unavailable: "+(error.message||"Please try again."));
    }finally{if(input){input.disabled=false;input.focus();}}
  };
  window.smartLedgerVoiceInput=function(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Voice input is not supported in this browser. Use the keyboard instead.");return;}
    const rec=new SR();rec.lang="en-IN";rec.interimResults=false;rec.maxAlternatives=1;
    rec.onresult=e=>{const input=$("aiquestion");if(input){input.value=e.results[0][0].transcript;window.askBusinessAssistant();}};
    rec.onerror=()=>alert("Voice input was not available. Check microphone permission and try again.");rec.start();
  };
  window.smartLedgerPrintReport=function(){
    const m=metrics(),rows=[["Metric","Value"],["Sales",sumBy(m.s,x=>x.total)],["Purchases",sumBy(m.p,x=>x.total)],["Gross profit estimate",m.gross],["Expenses",sumBy(m.e,x=>x.amount)],["Net profit estimate",m.net],["Customer receivables",m.receivable],["Supplier payables",m.payable],["Stock purchase value",m.stockValue]];
    const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print the report.");return;}
    w.document.write('<!doctype html><html><head><title>SmartLedger AI Business Report</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px Arial;padding:24px;color:#222}h1{color:#672d3c}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ccc;text-align:left}th{background:#eee}.note{margin-top:20px;color:#555}</style></head><body><h1>SmartLedger Business Report</h1><p>Generated '+esc(todayKey())+'</p><table><thead><tr><th>Metric</th><th>Value (INR)</th></tr></thead><tbody>'+rows.slice(1).map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+moneyFmt(x[1])+'</td></tr>').join("")+'</tbody></table><p class="note">Management estimates from records saved on this device. Missing costs and unrecorded transactions may affect accuracy.</p><script>window.onload=()=>window.print()<\/script></body></html>');w.document.close();
  };
  window.smartLedgerExportCSV=function(){
    const m=metrics(),rows=[["Metric","Value"],["Sales",sumBy(m.s,x=>x.total)],["Purchases",sumBy(m.p,x=>x.total)],["Gross profit estimate",m.gross],["Expenses",sumBy(m.e,x=>x.amount)],["Net profit estimate",m.net],["Customer receivables",m.receivable],["Supplier payables",m.payable],["Stock purchase value",m.stockValue]];
    const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="SmartLedger-AI-Report-"+todayKey()+".csv";a.click();URL.revokeObjectURL(url);
  };
  window.smartLedgerAIAction=function(action){
    const labels={reports:"Open AI-generated reports",inventory:"Open inventory recommendations",alerts:"Review business alerts",ledger:"Open customer and supplier ledgers"};
    if(!labels[action])return;
    if(!confirm(labels[action]+"?"))return;
    closeModal();
    if(action==="reports")window.go("Reports");else if(action==="inventory")window.go("Items");else if(action==="alerts")window.go("Stock Alerts");else window.go("Ledgers");
  };
  window.openAIAssistant=function(){
    const body=styles+'<div class="ai-tabs" role="tablist" aria-label="AI Business Manager sections"><button class="active" data-ai-tab="chat" onclick="smartLedgerAITab(\'chat\')">✦ Chat</button><button data-ai-tab="insights" onclick="smartLedgerAITab(\'insights\')">◈ Insights</button><button data-ai-tab="inventory" onclick="smartLedgerAITab(\'inventory\')">▦ Inventory</button><button data-ai-tab="alerts" onclick="smartLedgerAITab(\'alerts\')">⚑ Alerts</button><button data-ai-tab="reports" onclick="smartLedgerAITab(\'reports\')">▤ Reports</button></div><div id="ai-v52-panel"></div><div class="section"><div class="actions"><button class="btn" onclick="smartLedgerAIAction(\'inventory\')">Open inventory</button><button class="btn" onclick="smartLedgerAIAction(\'ledger\')">Open ledgers</button><button class="btn" onclick="smartLedgerAIAction(\'alerts\')">Review alerts</button></div></div><div class="notice" style="margin-top:12px">Privacy: this release analyses data stored in this browser. It does not send shop records to an AI provider. Voice features depend on browser support and permission.</div>';
    modal("SmartLedger AI Business Manager",body);
    renderTab("chat");
    const panel=$("ai-v52-panel");if(panel){panel.addEventListener("click",e=>{const b=e.target.closest("[data-ai-tab]");if(b)renderTab(b.dataset.aiTab);});}
  };
  window.smartLedgerAITab=function(tab){renderTab(tab);};
  window.addEventListener("storage",e=>{if(e.key&&e.key.startsWith("sl_")&&$("ai-v52-panel"))renderTab(activeTab);});
  const css=document.createElement("style");css.textContent=".ai-tabs button{cursor:pointer}.ai-alert{color:var(--text)}.ai-alert p{color:var(--muted)}";document.head.appendChild(css);
})();
