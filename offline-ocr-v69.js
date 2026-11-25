/* SmartLedger v69 — offline invoice OCR for Android. */
(function(){
  "use strict";
  const $=s=>document.querySelector(s);
  const pending=new Map();
  let sequence=0;

  window.SmartLedgerOCR={
    resolve(id,text,error){
      const job=pending.get(id);
      if(!job)return;
      pending.delete(id);
      if(error)job.reject(new Error(error));
      else job.resolve(String(text||""));
    }
  };

  function injectTools(){
    if(window.currentTxn!=="purchases")return;
    const form=$("#modalbody form"),grid=form?.querySelector(".formgrid");
    if(!form||!grid||$("#slOcrTools"))return;
    const box=document.createElement("section");
    box.id="slOcrTools";
    box.className="section";
    box.style.cssText="margin:0 0 14px;padding:12px;border:1px solid var(--border,#d9dee5);border-radius:12px";
    box.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>Offline bill scanner</b><div class="muted">Read printed supplier bills on this device. Review extracted text before entering a purchase.</div></div><button type="button" class="btn" id="slOcrChoose">▧ Scan bill</button></div><div class="field" style="margin-top:10px"><label for="slOcrLanguage">Bill language</label><select id="slOcrLanguage"><option value="eng">English</option><option value="eng+hin">English + Hindi</option><option value="hin">Hindi</option><option value="urd">Urdu</option><option value="eng+urd">English + Urdu</option></select></div><input id="slOcrFile" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden><p id="slOcrStatus" class="muted" aria-live="polite"></p><div id="slOcrOutput" hidden><div class="field"><label for="slOcrText">Extracted text — check every value manually</label><textarea id="slOcrText" rows="8" spellcheck="false" dir="auto"></textarea></div><button type="button" class="btn" id="slOcrUseInvoice" hidden>Use detected invoice number</button></div>';
    grid.insertAdjacentElement("beforebegin",box);
    $("#slOcrChoose").addEventListener("click",()=>$("#slOcrFile").click());
    $("#slOcrFile").addEventListener("change",processImage);
  }

  function setStatus(message){const el=$("#slOcrStatus");if(el)el.textContent=message}
  function processImage(event){
    const file=event.target.files?.[0];
    if(!file)return;
    if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){setStatus("Choose a JPG, PNG or WebP bill photo.");return}
    if(file.size>15*1024*1024){setStatus("Image is too large. Choose a photo under 15 MB.");return}
    if(!window.SmartLedgerNative||typeof window.SmartLedgerNative.recognizeBill!=="function"){
      setStatus("Offline OCR is available in the installed Android app. The web version can still enter bills manually.");
      return;
    }
    setStatus("Preparing bill image…");
    const reader=new FileReader();
    reader.onerror=()=>setStatus("Could not read the selected image.");
    reader.onload=()=>{
      const image=new Image();
      image.onerror=()=>setStatus("The selected image could not be opened.");
      image.onload=()=>{
        const max=1800,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const ctx=canvas.getContext("2d");
        if(!ctx){setStatus("Image processing is unavailable on this device.");return}
        ctx.drawImage(image,0,0,canvas.width,canvas.height);
        const base64=canvas.toDataURL("image/jpeg",0.84).split(",")[1];
        const id="bill-ocr-"+(++sequence);
        const language=$("#slOcrLanguage")?.value||"eng";
        setStatus("Reading bill offline… This may take a few seconds.");
        pending.set(id,{
          resolve(text){
            const output=$("#slOcrOutput"),area=$("#slOcrText");
            if(!output||!area)return;
            area.value=text;
            output.hidden=false;
            const match=text.match(/(?:invoice|bill|inv)\s*(?:no\.?|number|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9\/-]{2,})/i);
            const use=$("#slOcrUseInvoice");
            if(match&&use){
              use.hidden=false;
              use.onclick=()=>{const field=$("#tinvoice");if(field)field.value=match[1];setStatus("Invoice number copied into the purchase form. Verify it before saving.");};
            }
            setStatus("Text extracted. Verify supplier, invoice number, quantities, rates and totals before saving.");
          },
          reject(error){setStatus(error.message||"Offline OCR failed.")}
        });
        try{window.SmartLedgerNative.recognizeBill(base64,language,id)}
        catch(error){pending.delete(id);setStatus("Could not start offline OCR: "+error.message)}
      };
      image.src=String(reader.result||"");
    };
    reader.readAsDataURL(file);
  }

  const original=window.transactionForm;
  if(typeof original==="function"){
    window.transactionForm=function(kind){
      const result=original.apply(this,arguments);
      if(kind==="purchases")requestAnimationFrame(injectTools);
      return result;
    };
  }
  window.addEventListener("smartledger:purchase-form-open",injectTools);
})();
