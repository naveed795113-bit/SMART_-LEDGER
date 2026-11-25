/* SmartLedger v69 — reliable invoice sharing and transaction-form usability */
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const phoneDigits = value => {
    let d = String(value || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = d.slice(1);
    if (d.length === 10) d = "91" + d;
    return d;
  };
  const phoneFor = (kind, x) => {
    const key = kind === "purchases" ? "suppliers" : "customers";
    const list = typeof get === "function" ? get(key) : [];
    const p = list.find(v => String(v.name || "").toLowerCase() === String(x.party || "").toLowerCase());
    return String(x.partyPhone || p?.phone || "").trim();
  };

  const style = document.createElement("style");
  style.id = "smartledger-v69-transaction-ui";
  style.textContent = `
    #modal.show .dialog.sl-txn-dialog{display:flex!important;flex-direction:column!important;max-height:calc(100dvh - 16px)!important;overflow:hidden!important;padding-bottom:0!important}
    .sl-txn-dialog #modalbody{min-height:0!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;padding-bottom:8px!important}
    .sl-txn-dialog #modalbody form{display:block;min-width:0}
    .sl-txn-dialog #modalbody form>p:last-child{position:sticky!important;bottom:0!important;z-index:8!important;margin:14px -2px 0!important;padding:11px 2px calc(10px + env(safe-area-inset-bottom))!important;background:linear-gradient(180deg,rgba(255,255,255,.86),#fff 28%)!important;border-top:1px solid #ded6e5!important}
    .theme-dark .sl-txn-dialog #modalbody form>p:last-child{background:linear-gradient(180deg,rgba(35,28,40,.9),#231c28 28%)!important;border-color:#594966!important}
    .sl-txn-dialog #modalbody form>p:last-child .btn{display:block!important;width:100%!important;min-height:50px!important;font-size:16px!important;font-weight:800!important;box-shadow:0 5px 14px #3c096c35!important}
    .sl-txn-dialog #txnLines{display:grid;gap:12px}
    .sl-txn-dialog .txnline{padding:12px!important;border-radius:15px!important}
    .sl-txn-dialog .txn-product-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;max-height:220px!important;overflow-y:auto!important;overscroll-behavior:contain!important;padding:4px!important}
    .sl-txn-dialog .txn-product-option{min-height:78px!important;justify-content:space-between!important;padding:10px!important;border-radius:12px!important;gap:7px!important}
    .sl-txn-dialog .txn-product-option-top{align-items:flex-start!important}
    .sl-txn-dialog .txn-product-option-top b{font-size:13px!important;line-height:1.35!important}
    .sl-txn-dialog .txn-product-option-top em{font-size:11px!important}
    .sl-txn-dialog .txn-product-option-bottom{align-items:center!important}
    .sl-txn-dialog .txn-product-option-bottom small{font-size:10px!important}
    .sl-txn-dialog .txn-product-option-bottom strong{font-size:13px!important}
    .sl-txn-dialog .txn-product-option.selected:after{content:"SELECTED";display:block;font-size:9px;font-weight:900;letter-spacing:.8px;color:#b7e4c7}
    .sl-txn-dialog .txn-product-search{min-height:44px!important;font-size:15px!important}
    .sl-txn-dialog .txn-selected-product{font-size:12px!important;line-height:1.5!important;padding:10px!important}
    .sl-txn-dialog .txn-balance-summary{margin-top:12px!important}
    .sl-txn-dialog #txnPartyPhone{min-height:43px}
    @media(max-width:520px){.sl-txn-dialog .txn-product-grid{grid-template-columns:1fr!important;max-height:190px!important}.sl-txn-dialog .txn-product-option{min-height:66px!important}.sl-txn-dialog #modalbody form>p:last-child .btn{min-height:52px!important}}
  `;
  (document.head || document.documentElement).appendChild(style);

  function enhanceTransactionDialog() {
    const modal = $("#modal"), dialog = modal?.querySelector(".dialog"), body = $("#modalbody"), form = body?.querySelector("form");
    if (!modal?.classList.contains("show") || !dialog || !form || !$("#txnLines")) return;
    dialog.classList.add("sl-txn-dialog");
    body.classList.add("sl-txn-scroll");
    const partyInput = $("#tparty");
    if (partyInput && !$("#txnPartyPhone")) {
      const wrap = document.createElement("div");
      wrap.className = "field full";
      wrap.innerHTML = '<label for="txnPartyPhone">Customer / supplier WhatsApp number</label><input id="txnPartyPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 98765 43210"><small class="muted">Use the full country code. This number is saved with the transaction.</small>';
      partyInput.closest(".field")?.insertAdjacentElement("afterend", wrap);
    }
    const phoneInput = $("#txnPartyPhone");
    if (partyInput && phoneInput && !phoneInput.dataset.v69Bound) {
      const fill = () => {
        const type = window.currentTxn === "purchases" ? "suppliers" : "customers";
        const p = get(type).find(v => String(v.name || "").toLowerCase() === String(partyInput.value || "").trim().toLowerCase());
        if (!phoneInput.dataset.userEdited) phoneInput.value = p?.phone || "";
      };
      partyInput.addEventListener("change", fill);
      partyInput.addEventListener("input", fill);
      phoneInput.addEventListener("input", () => { phoneInput.dataset.userEdited = "1"; });
      phoneInput.dataset.v69Bound = "1";
      fill();
    }
    const save = form.querySelector('button[type="submit"],button:not([type])');
    if (save) {
      if (!save.hasAttribute("type")) save.setAttribute("type", "submit");
      const label = window.currentTxn === "purchases" ? "Save purchase bill" : "Save sale invoice";
      if (save.textContent !== label) save.textContent = label;
      if (save.getAttribute("aria-label") !== label) save.setAttribute("aria-label", label);
    }
  }

  const originalTxnForm = window.transactionForm;
  if (typeof originalTxnForm === "function") {
    window.transactionForm = function (kind) {
      const result = originalTxnForm.apply(this, arguments);
      window.currentTxn = kind;
      enhanceTransactionDialog();
      return result;
    };
  }

  const originalShowSales = window.showInvoice;
  if (typeof originalShowSales === "function") {
    window.showInvoice = function (record) {
      const result = originalShowSales.apply(this, arguments);
      const button = [...document.querySelectorAll("#modalbody button")].find(b => (b.getAttribute("onclick") || "").includes("shareInvoice"));
      if (button) button.textContent = "WhatsApp · PDF + HD image";
      return result;
    };
  }
  const originalShowPurchase = window.showPurchaseBill;
  if (typeof originalShowPurchase === "function") {
    window.showPurchaseBill = function (record) {
      const result = originalShowPurchase.apply(this, arguments);
      const button = [...document.querySelectorAll("#modalbody button")].find(b => (b.getAttribute("onclick") || "").includes("shareInvoice"));
      if (button) button.textContent = "WhatsApp · PDF + HD image";
      return result;
    };
  }

  /* Android Web Share shares the actual PDF and HD PNG. The browser cannot force
     WhatsApp's recipient field; the user chooses WhatsApp/contact and confirms Send. */
  window.shareInvoice = async function (id, kind) {
    kind = kind || window.lastInvoiceKind || "sales";
    const record = get(kind).find(v => String(v.id) === String(id)) || window.lastInvoice;
    if (!record) return alert("Invoice not found.");
    if (!$("#invoicepaper")) {
      if (kind === "purchases" && typeof window.showPurchaseBill === "function") window.showPurchaseBill(record);
      else if (typeof window.showInvoice === "function") window.showInvoice(record);
    }
    const paper = $("#invoicepaper");
    if (!paper) return alert("Invoice preview is not ready. Open the invoice again.");
    if (!window.html2canvas || !window.jspdf?.jsPDF) return alert("Invoice export tools did not load. Use Print / Save PDF.");
    const button = [...document.querySelectorAll("#modalbody button")].find(b => (b.getAttribute("onclick") || "").includes("shareInvoice"));
    if (button) { button.disabled = true; button.textContent = "Preparing invoice…"; }
    try {
      const canvas = await window.html2canvas(paper, { scale: 2.5, backgroundColor: "#fff", useCORS: true, logging: false, windowWidth: Math.max(paper.scrollWidth, 900) });
      const png = await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not create HD image.")), "image/png"));
      const PDF = window.jspdf.jsPDF;
      const pdf = new PDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = 190, pageHeight = 277, chunkHeight = Math.floor(canvas.width * pageHeight / pageWidth);
      let y = 0, page = 0;
      while (y < canvas.height) {
        const h = Math.min(chunkHeight, canvas.height - y), part = document.createElement("canvas");
        part.width = canvas.width; part.height = h;
        part.getContext("2d").drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        if (page++) pdf.addPage();
        pdf.addImage(part.toDataURL("image/jpeg", .94), "JPEG", 10, 10, pageWidth, h * pageWidth / canvas.width, undefined, "FAST");
        y += h;
      }
      const stem = (kind === "purchases" ? "Purchase-" : "Sales-") + "Invoice-" + String(record.invoice || record.id).replace(/[^a-z0-9-_]/gi, "-");
      const files = [
        new File([pdf.output("blob")], stem + ".pdf", { type: "application/pdf" }),
        new File([png], stem + "-HD.png", { type: "image/png" })
      ];
      const rawPhone = phoneFor(kind, record), digits = phoneDigits(rawPhone);
      const message = "SmartLedger invoice " + (record.invoice || "") + " from " + (localStorage.bizname || "SmartLedger") + (rawPhone ? "\nWhatsApp number: +" + digits : "");
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files }))) {
        await navigator.share({ files, title: stem, text: message });
      } else {
        files.forEach(file => {
          const url = URL.createObjectURL(file), a = document.createElement("a");
          a.href = url; a.download = file.name; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 30000);
        });
        if (digits) window.open("https://wa.me/" + digits + "?text=" + encodeURIComponent(message), "_blank");
        alert("The invoice PDF and HD image were downloaded. Attach the file in the WhatsApp chat and tap Send.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") alert("Invoice sharing failed: " + (error?.message || "Please try Print / Save PDF."));
    } finally {
      if (button?.isConnected) { button.disabled = false; button.textContent = "WhatsApp · PDF + HD image"; }
    }
  };

  window.smartLedgerV69Ready = true;
  enhanceTransactionDialog();
})();
