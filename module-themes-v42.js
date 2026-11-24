/* SmartLedger v42.0 — dedicated module colour systems; dashboard deliberately excluded */
(function(){
"use strict";
if(document.getElementById("sl-module-themes-v42"))return;
const css=`
/* Shared report/document palette — applied only to print/PDF output */
@media print{
 :root{color-scheme:light}
 html,body{background:#1A1A1A!important;color:#F5F5F5!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 #view,.content,.main{background:#1A1A1A!important;color:#F5F5F5!important}
 #view .card,#view .tablewrap,#view .section,#view .sales-panel,#view .sales-kpi{background:#242424!important;color:#F5F5F5!important;border:1px solid #4A4A4A!important;box-shadow:none!important}
 #view h1,#view h2,#view h3,#view th{color:#D4AF37!important}
 #view .muted,#view .statlabel,#view p,#view td{color:#F5F5F5!important}
 #view th{background:#303030!important;border-color:#4A4A4A!important}
 #view td{background:#1A1A1A!important;border-color:#4A4A4A!important}
 #view .btn{display:none!important}
}
body.sl-module-sales{--module-bg:#0A1628;--module-surface:#122239;--module-surface-2:#1a2b40;--module-accent:#C9A227;--module-secondary:#B8C0C8;--module-text:#FFFFFF;--module-line:#34465a;--module-muted:#c1cbd5}
body.sl-module-purchase{--module-bg:#1C2526;--module-surface:#263132;--module-surface-2:#303a3b;--module-accent:#B87333;--module-secondary:#5C5C5C;--module-text:#F0EDE8;--module-line:#53605f;--module-muted:#c6c1b9}
body.sl-module-inventory{--module-bg:#121212;--module-surface:#202326;--module-surface-2:#292e30;--module-accent:#A8B2B8;--module-secondary:#2A9D8F;--module-text:#E5E5E5;--module-line:#485256;--module-muted:#b8c2c5}
body.sl-module-ledgers{--module-bg:#0F1A14;--module-surface:#1b2921;--module-surface-2:#24352b;--module-accent:#C5A46B;--module-secondary:#F5F0E6;--module-text:#F8F4EC;--module-line:#46574a;--module-muted:#d0c8b8}
body.sl-module-reports{--module-bg:#1A1A1A;--module-surface:#242424;--module-surface-2:#303030;--module-accent:#D4AF37;--module-secondary:#4A4A4A;--module-text:#F5F5F5;--module-line:#4A4A4A;--module-muted:#c2c2c2}
/* Scope every visual change to the active module's content. No dashboard selectors here. */
body.sl-module-sales .content,body.sl-module-sales .top{background:var(--module-bg)!important;color:var(--module-text)!important}
body.sl-module-purchase .content,body.sl-module-purchase .top{background:var(--module-bg)!important;color:var(--module-text)!important}
body.sl-module-inventory .content,body.sl-module-inventory .top{background:var(--module-bg)!important;color:var(--module-text)!important}
body.sl-module-ledgers .content,body.sl-module-ledgers .top{background:var(--module-bg)!important;color:var(--module-text)!important}
body.sl-module-reports .content,body.sl-module-reports .top{background:var(--module-bg)!important;color:var(--module-text)!important}
body.sl-module-sales #view,body.sl-module-purchase #view,body.sl-module-inventory #view,body.sl-module-ledgers #view,body.sl-module-reports #view{color:var(--module-text)!important}
body.sl-module-sales #view .card,body.sl-module-sales #view .tablewrap,body.sl-module-sales #view .sales-panel,body.sl-module-sales #view .sales-kpi,body.sl-module-sales #view .sales-overview-card,body.sl-module-sales #view .quick button,
body.sl-module-purchase #view .card,body.sl-module-purchase #view .tablewrap,body.sl-module-purchase #view .quick button,
body.sl-module-inventory #view .card,body.sl-module-inventory #view .tablewrap,body.sl-module-inventory #view .quick button,
body.sl-module-ledgers #view .card,body.sl-module-ledgers #view .tablewrap,body.sl-module-ledgers #view .quick button,
body.sl-module-reports #view .card,body.sl-module-reports #view .tablewrap,body.sl-module-reports #view .quick button{background:linear-gradient(145deg,var(--module-surface-2),var(--module-surface))!important;border:1px solid var(--module-line)!important;color:var(--module-text)!important;box-shadow:0 8px 20px #0003!important}
body.sl-module-sales #view h1,body.sl-module-sales #view h2,body.sl-module-sales #view h3,body.sl-module-sales #view .stat,body.sl-module-sales #view .sales-kpi strong,
body.sl-module-purchase #view h1,body.sl-module-purchase #view h2,body.sl-module-purchase #view h3,body.sl-module-purchase #view .stat,
body.sl-module-inventory #view h1,body.sl-module-inventory #view h2,body.sl-module-inventory #view h3,body.sl-module-inventory #view .stat,
body.sl-module-ledgers #view h1,body.sl-module-ledgers #view h2,body.sl-module-ledgers #view h3,body.sl-module-ledgers #view .stat,
body.sl-module-reports #view h1,body.sl-module-reports #view h2,body.sl-module-reports #view h3,body.sl-module-reports #view .stat{color:var(--module-accent)!important}
body.sl-module-sales #view .muted,body.sl-module-sales #view .statlabel,body.sl-module-sales #view .field label,
body.sl-module-purchase #view .muted,body.sl-module-purchase #view .statlabel,body.sl-module-purchase #view .field label,
body.sl-module-inventory #view .muted,body.sl-module-inventory #view .statlabel,body.sl-module-inventory #view .field label,
body.sl-module-ledgers #view .muted,body.sl-module-ledgers #view .statlabel,body.sl-module-ledgers #view .field label,
body.sl-module-reports #view .muted,body.sl-module-reports #view .statlabel,body.sl-module-reports #view .field label{color:var(--module-muted)!important}
body.sl-module-sales #view .btn.primary{background:linear-gradient(135deg,#e0bd4e,#C9A227)!important;border-color:#C9A227!important;color:#0A1628!important}
body.sl-module-purchase #view .btn.primary{background:linear-gradient(135deg,#cf8a4d,#B87333)!important;border-color:#B87333!important;color:#1C2526!important}
body.sl-module-inventory #view .btn.primary{background:linear-gradient(135deg,#c5d0d5,#A8B2B8)!important;border-color:#A8B2B8!important;color:#121212!important}
body.sl-module-ledgers #view .btn.primary{background:linear-gradient(135deg,#dec18a,#C5A46B)!important;border-color:#C5A46B!important;color:#0F1A14!important}
body.sl-module-reports #view .btn.primary{background:linear-gradient(135deg,#f0d36e,#D4AF37)!important;border-color:#D4AF37!important;color:#1A1A1A!important}
body.sl-module-sales #view .btn,body.sl-module-purchase #view .btn,body.sl-module-inventory #view .btn,body.sl-module-ledgers #view .btn,body.sl-module-reports #view .btn{border-color:var(--module-line)!important;color:var(--module-text)!important}
body.sl-module-sales #view .btn.primary,body.sl-module-purchase #view .btn.primary,body.sl-module-inventory #view .btn.primary,body.sl-module-ledgers #view .btn.primary,body.sl-module-reports #view .btn.primary{color:#111!important}
body.sl-module-sales #view th,body.sl-module-purchase #view th,body.sl-module-inventory #view th,body.sl-module-ledgers #view th,body.sl-module-reports #view th{background:var(--module-surface-2)!important;color:var(--module-accent)!important;border-color:var(--module-line)!important}
body.sl-module-sales #view td,body.sl-module-purchase #view td,body.sl-module-inventory #view td,body.sl-module-ledgers #view td,body.sl-module-reports #view td{background:var(--module-surface)!important;color:var(--module-text)!important;border-color:var(--module-line)!important}
body.sl-module-sales #view .field input,body.sl-module-sales #view .field select,body.sl-module-sales #view .field textarea,
body.sl-module-purchase #view .field input,body.sl-module-purchase #view .field select,body.sl-module-purchase #view .field textarea,
body.sl-module-inventory #view .field input,body.sl-module-inventory #view .field select,body.sl-module-inventory #view .field textarea,
body.sl-module-ledgers #view .field input,body.sl-module-ledgers #view .field select,body.sl-module-ledgers #view .field textarea,
body.sl-module-reports #view .field input,body.sl-module-reports #view .field select,body.sl-module-reports #view .field textarea{background:var(--module-bg)!important;color:var(--module-text)!important;border-color:var(--module-line)!important}
body.sl-module-inventory #view .badge,body.sl-module-inventory #view .more-icon{background:#183b37!important;color:#70d0c1!important;border-color:#2A9D8F!important}
body.sl-module-ledgers .side{background:linear-gradient(160deg,#0F1A14,#17291f)!important}
body.sl-module-sales .side{background:linear-gradient(160deg,#0A1628,#142a47)!important}
body.sl-module-purchase .side{background:linear-gradient(160deg,#1C2526,#293637)!important}
body.sl-module-inventory .side{background:linear-gradient(160deg,#121212,#252b2d)!important}
body.sl-module-reports .side{background:linear-gradient(160deg,#1A1A1A,#303030)!important}
body.sl-module-sales .nav button.active,body.sl-module-sales .nav button:hover{background:#C9A227!important;color:#0A1628!important}
body.sl-module-purchase .nav button.active,body.sl-module-purchase .nav button:hover{background:#B87333!important;color:#1C2526!important}
body.sl-module-inventory .nav button.active,body.sl-module-inventory .nav button:hover{background:#2A9D8F!important;color:#121212!important}
body.sl-module-ledgers .nav button.active,body.sl-module-ledgers .nav button:hover{background:#C5A46B!important;color:#0F1A14!important}
body.sl-module-reports .nav button.active,body.sl-module-reports .nav button:hover{background:#D4AF37!important;color:#1A1A1A!important}
body.sl-module-sales .mobile-nav button.active{color:#C9A227!important}
body.sl-module-purchase .mobile-nav button.active{color:#B87333!important}
body.sl-module-inventory .mobile-nav button.active{color:#2A9D8F!important}
body.sl-module-ledgers .mobile-nav button.active{color:#C5A46B!important}
body.sl-module-reports .mobile-nav button.active{color:#D4AF37!important}
body.sl-module-sales #view .sales-status.paid{background:#214332!important;color:#b8efc8!important}
body.sl-module-sales #view .sales-status.partial{background:#4a4023!important;color:#f2d987!important}
body.sl-module-sales #view .sales-status.unpaid{background:#4a292c!important;color:#ffb5b5!important}
`;
const style=document.createElement("style");style.id="sl-module-themes-v42";style.textContent=css;document.head.appendChild(style);
function setModuleTheme(){
 const title=(document.getElementById("pagetitle")?.textContent||"").trim().toLowerCase();
 const classes=["sl-module-sales","sl-module-purchase","sl-module-inventory","sl-module-ledgers","sl-module-reports"];
 document.body.classList.remove(...classes);
 if(title==="sales")document.body.classList.add("sl-module-sales");
 else if(title==="purchases"||title==="purchase")document.body.classList.add("sl-module-purchase");
 else if(title==="items"||title==="items & stock"||title==="inventory"||title==="stock alerts")document.body.classList.add("sl-module-inventory");
 else if(title==="ledgers"||title==="ledgers & payments"||title==="accounts"||title==="cash & bank")document.body.classList.add("sl-module-ledgers");
 else if(title==="reports"||title==="gst reports"||title==="tax reports")document.body.classList.add("sl-module-reports");
}
setModuleTheme();
const title=document.getElementById("pagetitle");
if(title)new MutationObserver(setModuleTheme).observe(title,{childList:true,subtree:true,characterData:true});
const view=document.getElementById("view");
if(view)new MutationObserver(setModuleTheme).observe(view,{childList:true,subtree:false});
window.__SMARTLEDGER_MODULE_THEMES_V42__={version:"42.0.0",refresh:setModuleTheme};
})();