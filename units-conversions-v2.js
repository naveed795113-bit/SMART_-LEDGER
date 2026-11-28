/* SmartLedger Units — Vyapar-style unit master and bulk assignment.
   Conversion rates belong to each item: 1 Base Unit = N Secondary Units. */
(function(){
"use strict";
const KEY="sl_units_master_v1", $=s=>document.querySelector(s);
const defaults=[
 ["kg","weight","g",1000],["g","weight","g",1],["mg","weight","g",.001],["quintal","weight","g",100000],["tonne","weight","g",1000000],["lb","weight","g",453.59237],["oz","weight","g",28.349523],
 ["L","volume","ml",1000],["ml","volume","ml",1],["kl","volume","ml",1000000],["m³","volume","ml",1000000],["gallon","volume","ml",3785.411784],["pint","volume","ml",473.176473],
 ["km","length","mm",1000000],["m","length","mm",1000],["cm","length","mm",10],["mm","length","mm",1],["ft","length","mm",304.8],["inch","length","mm",25.4],
 ["hectare","area","m²",10000],["acre","area","m²",4046.856422],["m²","area","m²",1],["ft²","area","m²",.09290304],
 ["pcs","count","pcs",1],["piece","count","pcs",1],["unit","count","pcs",1],["pair","count","pcs",2],["half-dozen","count","pcs",6],["dozen","count","pcs",12],
 ["box","count","pcs",1],["packet","count","pcs",1],["pack","count","pcs",1],["bag","count","pcs",1],["bottle","count","pcs",1],["carton","count","pcs",1],["case","count","pcs",1],["roll","count","pcs",1],["sheet","count","pcs",1],["strip","count","pcs",1],["set","count","pcs",1],["bundle","count","pcs",1],["tray","count","pcs",1],["sack","count","pcs",1],["tin","count","pcs",1]
];
const labels={weight:"Weight",volume:"Volume",length:"Length",area:"Area",count:"Quantity"};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(_){return []}};
const write=a=>localStorage.setItem(KEY,JSON.stringify(a));
function normalizeGroup(group){const g=String(group||"count").toLowerCase();if(["weight","volume","length","area"].includes(g))return g;return "count"}
function all(){
 const map=new Map();
 defaults.forEach(([unit,group,base,factor])=>map.set(unit,{unit,group,base,factor,builtin:true}));
 read().forEach(x=>{const group=normalizeGroup(x.group),base=x.base||x.baseUnit||({weight:"g",volume:"ml",length:"mm",area:"m²",count:"pcs"}[group]);map.set(x.unit,{...x,group,base,factor:1,builtin:false})});
 return [...map.values()].sort((a,b)=>a.group.localeCompare(b.group)||a.unit.localeCompare(b.unit));
}
function syncCatalog(){
 try{
  const cat=UNIT_CATALOG,original=cat.filter(x=>!x.customUnit);
  const map=new Map(original.map(x=>[x.unit,{...x}]));
  all().forEach(u=>map.set(u.unit,{unit:u.unit,group:u.group,base:u.base||({weight:"g",volume:"ml",length:"mm",area:"m²",count:"pcs"}[u.group]||u.unit),factor:Number(u.factor)||1,customUnit:!u.builtin}));
  cat.splice(0,cat.length,...map.values());
 }catch(_){}
}
function renderUnits(){
 syncCatalog();const units=all(),items=(()=>{try{return get("items")}catch(_){return []}})();
 const rows=units.map(u=>{
  const used=items.filter(p=>p.unit===u.unit||p.secondaryUnit===u.unit||(p.baseUnit===u.unit&&!p.secondaryUnit)).length;
  return '<tr><td><b>'+esc(u.unit)+'</b></td><td>'+esc(labels[u.group]||u.group)+'</td><td>'+used+'</td><td>'+(u.builtin?'<span class="muted">Built-in</span>':'<button class="btn danger" onclick="slDeleteUnit(\''+esc(u.unit)+'\')">Delete</button>')+'</td></tr>';
 }).join("");
 document.querySelector("#view").innerHTML='<div class="welcome"><div><h1>Units</h1><div class="muted">Manage the unit names available when adding or editing inventory items.</div></div><div class="actions"><button class="btn" onclick="slBulkAssign()">Bulk Assign Units</button><button class="btn primary" onclick="slUnitForm()">＋ Add Unit</button></div></div><div class="grid"><div class="card"><div class="statlabel">Available Units</div><div class="stat">'+units.length+'</div></div><div class="card"><div class="statlabel">Custom Units</div><div class="stat">'+units.filter(x=>!x.builtin).length+'</div></div><div class="card"><div class="statlabel">Items Using Units</div><div class="stat">'+items.filter(x=>x.unit||x.secondaryUnit).length+'</div></div></div><div class="section card"><div class="sectionhead"><h2>Unit Master</h2><input class="search" style="max-width:260px" placeholder="Search units…" oninput="slFilterUnits(this.value)"></div><div class="tablewrap"><table><thead><tr><th>Unit Name</th><th>Category</th><th>Items Using Unit</th><th>Type / Action</th></tr></thead><tbody id="slUnitRows">'+(rows||'<tr><td colspan="4">No units available.</td></tr>')+'</tbody></table></div></div><div class="section card"><h2>How item conversion works</h2><p>Conversion is set on each item, not globally in this list. Example: for a cooking-oil carton, set Base Unit = Carton, Secondary Unit = Pieces, Conversion Rate = 24. The item then uses <b>1 Carton = 24 Pieces</b> in purchase and sales entries.</p></div>';
}
window.slFilterUnits=function(q){const v=String(q||"").toLowerCase();document.querySelectorAll("#slUnitRows tr").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(v)?"":"none")};
window.slUnitForm=function(){
 const html='<form onsubmit="slSaveUnit(event)"><div class="formgrid"><div class="field"><label>Unit Name / Symbol</label><input id="sluName" maxlength="24" required placeholder="e.g. crate, tin, bag"></div><div class="field"><label>Unit Category</label><select id="sluGroup"><option value="count">Quantity</option><option value="weight">Weight</option><option value="volume">Volume</option><option value="length">Length</option><option value="area">Area</option></select></div></div><p class="muted">Create a unit name here. Set its exact conversion rate separately for each item, because pack sizes can differ between products.</p><button class="btn primary">Save Unit</button></form>';
 modal("Add Unit",html);
};
window.slSaveUnit=function(e){
 e.preventDefault();const unit=$("#sluName").value.trim(),group=$("#sluGroup").value;
 if(!unit)return alert("Enter a unit name.");
 if(all().some(x=>x.unit.toLowerCase()===unit.toLowerCase()))return alert("This unit already exists.");
 const base={weight:"g",volume:"ml",length:"mm",area:"m²",count:"pcs"}[group]||"pcs";
 write([...read(),{unit,group,base,factor:1}]);syncCatalog();closeModal();renderUnits();
};
window.slDeleteUnit=function(unit){
 const items=get("items"),linked=items.filter(p=>p.unit===unit||p.secondaryUnit===unit);
 if(linked.length)return alert("This unit is assigned to "+linked.length+" inventory item(s). Change those items first.");
 if(!confirm("Delete "+unit+" from the unit master?"))return;
 write(read().filter(x=>x.unit!==unit));syncCatalog();renderUnits();
};
window.slBulkAssign=function(){
 const items=get("items");if(!items.length)return alert("Add inventory items before using bulk assignment.");
 const check=items.map((p,i)=>'<label class="bulk-unit-item"><input type="checkbox" class="slBulkItem" value="'+i+'"><span>'+esc(p.name)+'</span><small>'+esc(p.unit||"pcs")+'</small></label>').join("");
 modal("Bulk Assign Units",'<form onsubmit="slApplyBulkUnits(event)"><div class="field"><label>Find items</label><input id="slBulkSearch" placeholder="Search item names" oninput="document.querySelectorAll(\'.bulk-unit-item\').forEach(x=>x.style.display=x.textContent.toLowerCase().includes(this.value.toLowerCase())?\'flex\':\'none\')"></div><div class="bulk-unit-list">'+check+'</div><div class="formgrid"><div class="field"><label>Base Unit</label><select id="slBulkBase">'+all().map(x=>'<option value="'+esc(x.unit)+'">'+esc(x.unit)+'</option>').join("")+'</select></div><div class="field"><label>Secondary Unit</label><select id="slBulkSecondary"><option value="">No secondary unit</option>'+all().map(x=>'<option value="'+esc(x.unit)+'">'+esc(x.unit)+'</option>').join("")+'</select></div><div class="field"><label>Conversion Rate (1 Base = ? Secondary)</label><input id="slBulkRate" type="number" min="0.000001" step="any" value="1"></div></div><p class="muted">Only select items that share the same unit mapping and pack size.</p><button class="btn primary">Apply to Selected Items</button></form>');
};
window.slApplyBulkUnits=function(e){
 e.preventDefault();const indices=[...document.querySelectorAll(".slBulkItem:checked")].map(x=>Number(x.value));if(!indices.length)return alert("Select at least one item.");
 const base=$("#slBulkBase").value,secondary=$("#slBulkSecondary").value,rate=Number($("#slBulkRate").value);
 if(secondary&&secondary===base)return alert("Base and secondary units must be different.");
 if(secondary&&(!Number.isFinite(rate)||rate<=0))return alert("Enter a valid conversion rate.");
 const cat=UNIT_CATALOG.find(x=>x.unit===base),secondaryDef=UNIT_CATALOG.find(x=>x.unit===secondary);if(!cat)return alert("Select a valid base unit.");if(secondary&&(!secondaryDef||secondaryDef.group!==cat.group))return alert("Base and secondary units must belong to the same category.");
 const items=get("items");indices.forEach(i=>{items[i]={...items[i],unit:base,unitGroup:cat.group,baseUnit:cat.base||base,unitFactor:Number(cat.factor)||1,secondaryUnit:secondary,conversionRate:secondary?rate:0}});
 put("items",items);closeModal();renderUnits();
};
function navigate(p){
 if(p!=="Units")return false;
 document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.page==="Units"));
 document.querySelectorAll(".mobile-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page==="More"));
 page="Units";if(typeof applyModuleTheme==="function")applyModuleTheme();
 if($("#pagetitle"))$("#pagetitle").textContent="Units";renderUnits();return true;
}
function injectNav(){
 const nav=$("#nav");if(nav&&!nav.querySelector('[data-page="Units"]')){const b=document.createElement("button");b.dataset.page="Units";b.innerHTML='⚖ <span class="txt">Units</span>';const items=nav.querySelector('[data-page="Items"]');if(items)items.insertAdjacentElement("afterend",b);else nav.appendChild(b)}
}
function addUnitsMoreLink(){
 const grid=$("#view")?.querySelector(".more-grid");if(!grid||grid.querySelector("[data-units-link]"))return;
 const b=document.createElement("button");b.className="more-link";b.dataset.unitsLink="true";b.innerHTML='<span class="more-icon">⚖</span><span><b>Units</b><small>Manage item units and bulk assignments</small></span><span class="more-arrow">›</span>';b.addEventListener("click",()=>window.go("Units"));grid.insertBefore(b,grid.firstChild);
}
function boot(){
 syncCatalog();injectNav();
 if(window.go&&!window.go.__unitsWrapped){const original=window.go,wrapped=function(p){if(navigate(p))return;const out=original.apply(this,arguments);if(p==="More")addUnitsMoreLink();return out};wrapped.__unitsWrapped=true;window.go=wrapped}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
document.addEventListener("change",e=>{
 const select=e.target;if(!select?.matches?.(".txnline .txunit"))return;
 const row=select.closest(".txnline"),index=Number(row.querySelector(".txitem")?.value),item=get("items")[index];if(!item)return;
 const selectedFactor=unitFactorForItem(item,select.value),primaryFactor=itemUnitFactor(item);if(selectedFactor===null||!primaryFactor)return;
 const baseRate=window.currentTxn==="sales"?Number(item.price||0):Number(item.purchase||0);
 row.querySelector(".txrate").value=String(baseRate*selectedFactor/primaryFactor);if(typeof updateTxnTotals==="function")updateTxnTotals();
});
window.addEventListener("storage",e=>{if(e.key===KEY&&$("#pagetitle")?.textContent==="Units")renderUnits()});
})();