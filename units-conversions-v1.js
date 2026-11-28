/* SmartLedger Units & Conversions — dedicated unit master */
(function(){
"use strict";
const KEY="sl_units_master_v1";
let originalEngineCatalog=null;
const $=s=>document.querySelector(s);
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(_){return []}};
const write=a=>localStorage.setItem(KEY,JSON.stringify(a));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const defaults=[
["kg","Weight","g",1000],["g","Weight","g",1],["mg","Weight","g",.001],["quintal","Weight","g",100000],["tonne","Weight","g",1000000],
["litre","Volume","ml",1000],["ml","Volume","ml",1],["pcs","Quantity","pcs",1],["dozen","Quantity","pcs",12],["pair","Quantity","pcs",2],
["m","Length","mm",1000],["cm","Length","mm",10],["mm","Length","mm",1]
];
function all(){const saved=read(),map=new Map();defaults.forEach(x=>map.set(x[0],{unit:x[0],group:x[1],baseUnit:x[2],factor:x[3],builtin:true}));saved.forEach(x=>map.set(x.unit,x));return [...map.values()]}
function engineGroup(group){const g=String(group||"").toLowerCase();if(g==="weight")return "weight";if(g==="volume")return "volume";if(g==="length")return "length";return "count"}
function syncCatalog(){
 try{
  const cat=UNIT_CATALOG;
  if(!originalEngineCatalog)originalEngineCatalog=cat.filter(x=>x.group!=="count"||x.unit==="pcs").map(x=>({...x}));
  const merged=new Map(originalEngineCatalog.map(x=>[x.unit,{...x}]));
  all().forEach(u=>merged.set(u.unit,{unit:u.unit,group:engineGroup(u.group),base:u.baseUnit,factor:Number(u.factor)}));
  cat.splice(0,cat.length,...merged.values());
 }catch(_){}
}
function renderUnits(){
 syncCatalog();
 const units=all(),groups=[...new Set(units.map(x=>x.group))];
 const rows=units.map(u=>'<tr><td><b>'+esc(u.unit)+'</b></td><td>'+esc(u.group)+'</td><td>'+esc(u.baseUnit)+'</td><td>1 '+esc(u.unit)+' = '+Number(u.factor).toLocaleString('en-IN')+' '+esc(u.baseUnit)+'</td><td>'+(u.builtin?'<span class="muted">System</span>':'<button class="btn" onclick="slEditUnit(\''+esc(u.unit)+'\')">Edit</button> <button class="btn danger" onclick="slDeleteUnit(\''+esc(u.unit)+'\')">Delete</button>')+'</td></tr>').join('');
 document.querySelector('#view').innerHTML='<div class="welcome"><div><h1>Units &amp; Conversions</h1><div class="muted">Manage measurement units and conversion ratios used by inventory, purchases and sales.</div></div><button class="btn primary" onclick="slUnitForm()">＋ Add unit</button></div><div class="grid"><div class="card"><div class="statlabel">Available units</div><div class="stat">'+units.length+'</div></div><div class="card"><div class="statlabel">Custom units</div><div class="stat">'+units.filter(x=>!x.builtin).length+'</div></div><div class="card"><div class="statlabel">Categories</div><div class="stat">'+groups.length+'</div></div></div><div class="section card"><h2>Conversion rules</h2><p class="muted">Each unit converts to a base unit within its category. Units from different categories cannot be mixed.</p><div class="tablewrap"><table><thead><tr><th>Unit</th><th>Category</th><th>Base unit</th><th>Conversion</th><th>Actions</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5">No units added.</td></tr>')+'</tbody></table></div></div><div class="section card"><h2>How it works</h2><p>Example: define carton as 1 carton = 24 pcs. An item stocked in cartons can then be sold in pieces, and inventory is reduced by the equivalent carton fraction.</p><p class="muted">For packaging units, set the correct base unit and factor for your own product pack size. Do not assume all cartons or boxes contain the same quantity.</p></div>';
}
window.slUnitForm=function(name){
 const u=all().find(x=>x.unit===name)||{unit:"",group:"Packaging",baseUnit:"pcs",factor:1};
 const editing=!!name;
 modal(editing?"Edit unit":"Add unit",'<form onsubmit="slSaveUnit(event,\''+esc(name||"")+'\')"><div class="formgrid"><div class="field"><label>Unit name / symbol</label><input id="sluName" required maxlength="24" value="'+esc(u.unit)+'" placeholder="e.g. carton, tin, bag"></div><div class="field"><label>Category</label><input id="sluGroup" required maxlength="30" value="'+esc(u.group)+'" placeholder="e.g. Packaging"></div><div class="field"><label>Base unit</label><input id="sluBase" required maxlength="24" value="'+esc(u.baseUnit)+'" placeholder="e.g. pcs"></div><div class="field"><label>Conversion factor</label><input id="sluFactor" type="number" min="0.000001" step="any" required value="'+Number(u.factor)+'"></div></div><p class="muted">Example: Unit = carton, base unit = pcs, factor = 24 means 1 carton = 24 pieces.</p><button class="btn primary">Save unit</button></form>');
};
window.slSaveUnit=function(e,old){
 e.preventDefault();const unit=$('#sluName').value.trim(),group=$('#sluGroup').value.trim(),baseUnit=$('#sluBase').value.trim(),factor=Number($('#sluFactor').value);
 if(!unit||!group||!baseUnit||!Number.isFinite(factor)||factor<=0)return alert("Enter a valid unit and conversion factor.");
 if(old&&old!==unit)return alert("To rename a unit, create the new unit and update affected products first.");
 const list=read();if(all().some(x=>x.unit.toLowerCase()===unit.toLowerCase()&&x.unit!==old))return alert("This unit already exists.");
 const previous=all().find(x=>x.unit===old),previousFactor=previous?Number(previous.factor):1,engine=engineGroup(group);
 const next=list.filter(x=>x.unit!==old);next.push({unit,group,baseUnit,factor});write(next);syncCatalog();
 try{const products=get("items");let changed=false;products.forEach(p=>{if(p.unit!==unit)return;const sameBase=(p.baseUnit||baseUnit)===baseUnit,oldFactor=Number(p.unitFactor||1);if(sameBase&&engineGroup(p.unitGroup||engine)===engine&&(oldFactor===previousFactor||oldFactor===1)){p.baseUnit=baseUnit;p.unitFactor=factor;p.unitGroup=engine;changed=true}});if(changed)put("items",products)}catch(_){}
 closeModal();renderUnits();
};
window.slEditUnit=name=>window.slUnitForm(name);
window.slDeleteUnit=function(name){
 let linked=[];try{linked=get("items").filter(p=>p.unit===name)}catch(_){}
 if(linked.length)return alert("This unit is assigned to "+linked.length+" inventory item(s). Change those products to another unit before deleting it.");
 if(!confirm("Delete unit "+name+" from the unit master?"))return;
 write(read().filter(x=>x.unit!==name));syncCatalog();renderUnits();
};
function injectNav(){
 const nav=$('#nav');if(nav&&!nav.querySelector('[data-page="Units"]')){
  const b=document.createElement('button');b.dataset.page='Units';b.innerHTML='⚖ <span class="txt">Units &amp; Conversions</span>';
  const items=nav.querySelector('[data-page="Items"]');if(items)items.insertAdjacentElement('afterend',b);else nav.appendChild(b);
 }
}
function addUnitsMoreLink(){
 const view=$('#view'),grid=view&&view.querySelector('.more-grid');
 if(!grid||grid.querySelector('[data-units-link]'))return;
 const b=document.createElement('button');b.className='more-link';b.dataset.unitsLink='true';b.innerHTML='<span class="more-icon">⚖</span><span><b>Units &amp; Conversions</b><small>Manage measurement units, pack sizes and conversion ratios</small></span><span class="more-arrow">›</span>';
 b.addEventListener('click',()=>window.go('Units'));grid.insertBefore(b,grid.firstChild);
}
function navigate(p){
 if(p!=="Units")return false;
 injectNav();
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==="Units"));
 document.querySelectorAll('.mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==="More"));
 page="Units";
 if(typeof applyModuleTheme==="function")applyModuleTheme();
 if($('#pagetitle'))$('#pagetitle').textContent="Units & Conversions";
 renderUnits();return true;
}
function boot(){
 syncCatalog();
 injectNav();
 if(window.go&&!window.go.__unitsWrapped){
  const original=window.go;
  const wrapped=function(p){if(navigate(p))return;const out=original.apply(this,arguments);if(p==="More")addUnitsMoreLink();return out};
  wrapped.__unitsWrapped=true;window.go=wrapped;
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
document.addEventListener("change",e=>{
 const select=e.target;
 if(!select||!select.matches||!select.matches(".txnline .txunit"))return;
 const row=select.closest(".txnline"),index=Number(row.querySelector(".txitem")?.value),item=get("items")[index];
 if(!item)return;
 const selectedFactor=unitFactorForItem(item,select.value),primaryFactor=itemUnitFactor(item);
 if(selectedFactor===null||!primaryFactor)return;
 const baseRate=window.currentTxn==="sales"?Number(item.price||0):Number(item.purchase||0);
 row.querySelector(".txrate").value=String(baseRate*selectedFactor/primaryFactor);
 if(typeof updateTxnTotals==="function")updateTxnTotals();
});
window.addEventListener("storage",e=>{if(e.key===KEY&&document.querySelector('#pagetitle')?.textContent==="Units & Conversions")renderUnits()});
})();
// Release packaging revision: rebuild the signed Android release from the latest main branch.
