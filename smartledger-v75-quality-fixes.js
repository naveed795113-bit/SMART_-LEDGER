/* SmartLedger v75: profile image reliability, Vyapar-style inventory units, validation and invoice polish. */
(function(){
"use strict";
const $=s=>document.querySelector(s), E=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toast=(message,type="error")=>{
 let box=$("#sl-v75-toast");if(!box){box=document.createElement("div");box.id="sl-v75-toast";document.body.appendChild(box)}
 box.className="sl-v75-toast "+type;box.textContent=message;box.classList.add("show");clearTimeout(box._timer);box._timer=setTimeout(()=>box.classList.remove("show"),4200);
};
const fileData=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=()=>reject(Error("The selected image could not be read."));r.readAsDataURL(blob)});
const imageBlob=(canvas,type,quality)=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("Image compression failed.")),type,quality));
async function compressImage(file,key){
 if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error("Choose a PNG, JPG or WebP image.");
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error("This image file could not be opened."));im.src=url});
  const max=key==="logo"?1400:1800,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
  const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  const ctx=canvas.getContext("2d",{alpha:true});ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
  let blob=await imageBlob(canvas,"image/webp",.88);
  for(let q=.82;blob.size>420*1024&&q>=.48;q-=.08)blob=await imageBlob(canvas,"image/webp",q);
  if(blob.size>480*1024)throw Error("This image is too detailed to fit safely. Choose a smaller image (under 8 MB) or crop it first.");
  return await fileData(blob);
 }finally{URL.revokeObjectURL(url)}
}
window.previewBusinessImage=async function(input,key,previewId){
 const file=input?.files?.[0];if(!file)return;
 if(file.size>8*1024*1024){toast("Choose an image smaller than 8 MB.");input.value="";return}
 const box=$("#"+previewId);if(box)box.innerHTML='<span>Optimising image…</span>';
 try{
  const data=await compressImage(file,key);window.profileImageDraft=window.profileImageDraft||{};window.profileImageDraft[key]=data;
  if(box)box.innerHTML='<img src="'+data+'" alt="'+(key==="logo"?"Business logo":"Authorised signature")+' preview">';
  toast("Image ready. It has been optimised for reliable saving.","success");
 }catch(err){if(box)box.innerHTML='<span>'+E(key==="logo"?"Logo":"Signature")+' preview</span>';input.value="";toast(err.message||"Image upload failed.");}
};
const oldSettings=window.settings;
if(typeof oldSettings==="function")window.settings=function(){oldSettings();document.querySelectorAll('.business-profile .profile-upload small').forEach(el=>{el.textContent=el.textContent.replace(/Maximum 450 KB\./,"Automatically optimised to fit safely (up to 8 MB source image).")})};
window.saveBusinessProfile=function(){
 const name=$("#bizname")?.value.trim();if(!name){toast("Enter your business name.");$("#bizname")?.focus();return}
 try{
  const draft=window.profileImageDraft||{};
  localStorage.setItem("bizname",name);localStorage.setItem("bizaddress",$("#bizaddress")?.value.trim()||"");
  localStorage.setItem("bizphone",$("#bizphone")?.value.trim()||"");localStorage.setItem("bizphone2",$("#bizphone2")?.value.trim()||"");
  localStorage.setItem("gstin",$("#gstin")?.value.trim()||"");
  if(Object.prototype.hasOwnProperty.call(draft,"logo"))localStorage.setItem("bizlogo",draft.logo);
  if(Object.prototype.hasOwnProperty.call(draft,"signature"))localStorage.setItem("bizsignature",draft.signature);
  toast("Business details, contact numbers and images saved successfully.","success");
 }catch(err){toast("Could not save the business profile. Browser storage is full. Remove an unused large image or export a backup, then try again.");}
};
/* Rebuild the Add Item form around primary/secondary units while retaining the existing stock schema. */
window.itemForm=function(){
 const units=window.unitFieldsHTML("i");
 modal("Add inventory item",'<form id="sl-v75-item-form" onsubmit="saveItem(event)"><div class="sl-v75-form-section"><h3>Item details</h3><div class="formgrid">'+field("Item name","iname")+field("SKU / Barcode","icode")+'<div class="field full"><label>Barcode scanner</label><button type="button" class="btn" onclick="scanBarcodeFor(\'icode\')">▦ Scan barcode</button></div></div></div><div class="sl-v75-form-section"><h3>Stock and units</h3><div class="formgrid">'+field("Opening stock quantity","iqty","number",'step="any" min="0" value="0"')+field("Low-stock alert quantity","imin","number",'step="any" min="0" value="5"')+units+'</div><p class="unit-help">Set the primary unit and (optionally) a secondary unit. Example: 1 Bag = 10 kg. Stock is stored consistently in the base unit.</p></div><div class="sl-v75-form-section"><h3>Pricing and tax</h3><div class="formgrid">'+field("Purchase price (₹)","ipurchase","number",'step="any" min="0" value="0"')+field("Retail sale price (₹)","iprice","number",'step="any" min="0" value="0"')+field("Wholesale price (₹)","iwholesale","number",'step="any" min="0" value="0"')+field("HSN / SAC code","ihsn")+'<div class="field"><label for="igst">GST rate</label><select id="igst"><option value="0">Exempt / 0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option></select></div></div></div><p class="sl-v75-form-actions"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn primary">Save item</button></p></form>');
};
window.saveItem=function(e){
 e.preventDefault();const a=get("items"),name=$("#iname")?.value.trim()||"",code=$("#icode")?.value.trim()||"",qty=num($("#iqty")?.value),purchase=num($("#ipurchase")?.value),price=num($("#iprice")?.value),wholesale=num($("#iwholesale")?.value),minStock=num($("#imin")?.value);
 const invalid=(el,msg)=>{if(el){el.focus();el.closest(".field")?.classList.add("sl-v75-invalid")}toast(msg);return false};
 document.querySelectorAll("#sl-v75-item-form .sl-v75-invalid").forEach(x=>x.classList.remove("sl-v75-invalid"));
 if(!name)return invalid($("#iname"),"Enter an item name.");
 if(a.some(x=>String(x.name).trim().toLowerCase()===name.toLowerCase()))return invalid($("#iname"),"This item name already exists. Use a different name.");
 if(code&&a.some(x=>String(x.code||"").trim().toLowerCase()===code.toLowerCase()))return invalid($("#icode"),"This SKU or barcode is already assigned to another item.");
 if([qty,purchase,price,wholesale,minStock].some(v=>!Number.isFinite(v)||v<0))return invalid($("#iqty"),"Quantities, stock alerts and prices must be zero or greater.");
 let unitData;try{unitData=window.readUnitFields("i")}catch(err){toast(err.message||"Check the primary and secondary unit details.");return}
 try{a.push({name,code,qty,...unitData,purchase,price,wholesale,hsn:$("#ihsn")?.value.trim()||"",gst:num($("#igst")?.value),minStock});put("items",a);closeModal();render();toast("Inventory item added successfully.","success")}catch(err){toast("The item could not be saved. Check available browser storage.");}
};
/* Inline field validation styling and more readable invoice hierarchy; dashboard remains untouched. */
const style=document.createElement("style");style.id="smartledger-v75-polish";style.textContent=`
#sl-v75-toast{position:fixed;left:50%;bottom:calc(82px + env(safe-area-inset-bottom));transform:translate(-50%,14px);opacity:0;pointer-events:none;z-index:200000;max-width:min(92vw,520px);padding:13px 17px;border-radius:13px;background:#34232a;color:#fff;font-size:13px;font-weight:650;line-height:1.45;box-shadow:0 12px 35px #0003;transition:opacity .18s,transform .18s}#sl-v75-toast.show{opacity:1;transform:translate(-50%,0)}#sl-v75-toast.success{background:#245b49}
#sl-v75-item-form .sl-v75-form-section{padding:14px;margin:0 0 13px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--card) 94%,var(--wine) 6%)}#sl-v75-item-form .sl-v75-form-section h3{font-size:14px;margin:0 0 12px;color:var(--text)}#sl-v75-item-form .formgrid{gap:12px}#sl-v75-item-form .unit-help{font-size:12px;line-height:1.55;margin:10px 0 0;color:var(--muted)}#sl-v75-item-form .sl-v75-form-actions{display:flex;gap:9px;position:sticky;bottom:0;padding:12px 0 4px;background:var(--card)}#sl-v75-item-form .sl-v75-form-actions .btn{flex:1;min-height:46px}
#sl-v75-item-form .sl-v75-invalid input,#sl-v75-item-form .sl-v75-invalid select{border-color:#c33!important;box-shadow:0 0 0 3px #c3323218!important}
.invoice-paper{font-size:11px!important;line-height:1.55!important;letter-spacing:.05px!important}.invoice-paper .invoice-heading{padding-top:20px!important;padding-bottom:18px!important;border-bottom:1px solid #c49a6c!important}.invoice-paper .invoice-heading h1{font-size:27px!important;letter-spacing:1.4px!important;line-height:1.2!important}.invoice-paper .invoice-eyebrow{font-size:9px!important;letter-spacing:2px!important}.invoice-paper .invoice-number{padding:11px 0 11px 16px!important;min-width:145px!important}.invoice-paper .invoice-number-value{font-size:18px!important;padding:10px 12px!important;line-height:1.35!important}.invoice-paper .invoice-info-grid{gap:13px!important;padding-top:8px!important;padding-bottom:18px!important}.invoice-paper .invoice-info-grid section{padding:14px 15px!important;line-height:1.65!important;border-radius:9px!important}.invoice-paper .invoice-info-grid section>small{font-size:9px!important;letter-spacing:1.5px!important}.invoice-paper .invoice-info-grid h3{font-size:14px!important;margin:7px 0!important}.invoice-paper .invoice-table-wrap{margin-top:6px!important}.invoice-paper .invoice-table th{font-size:9px!important;letter-spacing:.65px!important;padding:11px 7px!important}.invoice-paper .invoice-table td{font-size:10px!important;padding:10px 7px!important;line-height:1.55!important}.invoice-paper .invoice-summary-grid{gap:16px!important;margin-top:20px!important;padding-top:17px!important}.invoice-paper .invoice-amount-words{padding:16px!important;line-height:1.7!important}.invoice-paper .invoice-totals{padding:10px!important;border:1px solid #385675!important;border-radius:9px!important}.invoice-paper .pdf-total-row{padding:9px 8px!important;margin:2px 0!important;line-height:1.5!important}.invoice-paper .pdf-total-row span{font-size:10px!important}.invoice-paper .pdf-total-row b{font-size:11px!important}.invoice-paper .invoice-grand{padding:13px 10px!important;margin:8px 0!important;border-radius:6px!important}.invoice-paper .invoice-grand span,.invoice-paper .invoice-grand b{font-size:13px!important;font-weight:850!important}.invoice-paper .invoice-due{padding:12px 10px!important;margin-top:8px!important;border-radius:6px!important}.invoice-paper .invoice-footer{margin-top:26px!important;padding-top:18px!important;line-height:1.6!important}.invoice-paper .invoice-terms p{line-height:1.6!important;margin:6px 0!important}.invoice-paper .invoice-bottomline{margin-top:22px!important;height:5px!important}
@media(max-width:600px){#sl-v75-item-form .sl-v75-form-section{padding:11px}.invoice-paper .invoice-heading h1{font-size:21px!important}.invoice-paper .invoice-number{min-width:110px!important;padding-left:9px!important}.invoice-paper .invoice-number-value{font-size:14px!important}.invoice-paper .invoice-info-grid{gap:8px!important}.invoice-paper .invoice-info-grid section{padding:10px!important}.invoice-paper .invoice-table th,.invoice-paper .invoice-table td{font-size:8px!important;padding:7px 3px!important}.invoice-paper .invoice-summary-grid{gap:10px!important}.invoice-paper .invoice-totals{padding:7px!important}}
@media print{.invoice-paper .invoice-heading,.invoice-paper .invoice-info-grid section,.invoice-paper .invoice-summary-grid section,.invoice-paper .invoice-totals{break-inside:avoid!important;page-break-inside:avoid!important}}
`;document.head.appendChild(style);
})();