/* SmartLedger v41.0 — app-wide responsive layout normalization */
(function(){
"use strict";
if(document.getElementById("sl-layout-v41")) return;
const css = `
:root{--sl-bg:#101418;--sl-surface:#1b2025;--sl-surface-2:#222930;--sl-text:#edf0f2;--sl-muted:#b8c0c7;--sl-line:#3a444d;--sl-gold:#d8c18a}
html,body{width:100%;max-width:100%;min-width:0;overflow-x:hidden!important}
body{background:var(--sl-bg);color:var(--sl-text)}
.app,.main,#view{min-width:0;max-width:100%;width:100%}
.main{overflow:hidden}
.content{min-width:0;max-width:100%;width:100%;padding:clamp(12px,2vw,25px);padding-bottom:calc(24px + env(safe-area-inset-bottom))}
#view>*{min-width:0;max-width:100%}
#view .welcome,#view .sectionhead{min-width:0;flex-wrap:wrap;gap:10px}
#view h1,#view h2,#view h3,#view p,#view label,#view small{overflow-wrap:anywhere}
#view .grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));min-width:0}
#view .formgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
#view .card,#view .section,#view .tablewrap,#view .sales-overview-card,#view .v40-card,#view .v40-stat{min-width:0;max-width:100%}
#view input,#view select,#view textarea{max-width:100%;min-width:0}
#view .actions,#view .actions>* ,#view .v40-actions>*{max-width:100%;min-width:0}
#view .tablewrap,#view .v40-table{width:100%;max-width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
#view .tablewrap table,#view .v40-table table{width:100%;min-width:620px;table-layout:auto;border-collapse:separate;border-spacing:0}
#view .tablewrap th,#view .tablewrap td,#view .v40-table th,#view .v40-table td{white-space:normal;overflow-wrap:anywhere;word-break:normal;line-height:1.4}
#view .tablewrap th,#view .v40-table th{position:sticky;top:0;z-index:1}
#view .section-quick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible}
#view .v40-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible}
#view .v40-tab{white-space:normal;min-width:0;min-height:40px}
#view .v40-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr))}
#view .v40-columns{grid-template-columns:repeat(2,minmax(0,1fr))}
.top{min-width:0;max-width:100%;padding-inline:clamp(12px,2vw,28px)}
.topright{min-width:0;gap:8px}
.topright #today{white-space:nowrap}
.mobile-nav{padding-bottom:calc(6px + env(safe-area-inset-bottom));height:calc(66px + env(safe-area-inset-bottom))}
.modal{padding:calc(12px + env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom))}
.dialog{width:min(680px,100%);max-height:calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow:auto}
#view .txnline{min-width:0}
#view .txnline .formgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
#view .txnline .field.full{grid-column:1/-1}
#view button{max-width:100%;overflow-wrap:anywhere}
.v40-head{align-items:flex-start;min-width:0}
.v40-head>div{min-width:0}
.v40-tabs{scrollbar-width:thin}
@media(max-width:850px){
 .side{width:100%;height:62px;inset:0 0 auto 0}
 .main{height:100dvh;min-height:0;padding-top:62px}
 .top{height:52px;flex:0 0 52px}
 .content{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;padding:14px 12px calc(92px + env(safe-area-inset-bottom))}
 .mobile-nav{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));height:calc(66px + env(safe-area-inset-bottom));padding-bottom:calc(6px + env(safe-area-inset-bottom))}
 .topright .pill{display:none}
 #view .v40-tabs{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
 #view .v40-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 #view .v40-columns{grid-template-columns:1fr}
}
@media(max-width:600px){
 .top{height:48px;flex-basis:48px;padding-inline:12px}
 .top strong{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .topright #today{display:none}
 .topright .theme-switch{transform:scale(.9);transform-origin:right center}
 .content{padding:12px 10px calc(94px + env(safe-area-inset-bottom))}
 #view .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 #view .card{padding:12px}
 #view .stat{font-size:clamp(16px,4.6vw,21px);overflow-wrap:anywhere}
 #view .formgrid,#view .txnline .formgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 #view .field.full,#view .txnline .field.full{grid-column:1/-1}
 #view .field input,#view .field select,#view .field textarea{width:100%;min-height:42px}
 #view .v40-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
 #view .v40-stat{padding:10px}
 #view .v40-stat strong{font-size:clamp(14px,4vw,18px)}
 #view .v40-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}
 #view .sectionhead{align-items:flex-start}
 #view .sectionhead>.actions{width:100%}
 #view .sectionhead>.actions button{flex:1}
 #view .dashboard-quick{grid-template-columns:repeat(4,minmax(0,1fr))}
 #view .dashboard-overview{grid-template-columns:repeat(2,minmax(0,1fr))}
 #view .quick{grid-template-columns:repeat(2,minmax(0,1fr))}
 #view .more-grid{grid-template-columns:1fr}
}
@media(max-width:380px){
 #view .grid,#view .v40-grid{grid-template-columns:1fr}
 #view .dashboard-quick{grid-template-columns:repeat(2,minmax(0,1fr))}
 #view .dashboard-overview{grid-template-columns:1fr}
 #view .formgrid,#view .txnline .formgrid{grid-template-columns:1fr}
 #view .field.full,#view .txnline .field.full{grid-column:auto}
}
/* On narrow screens, turn every record table into readable, labelled cards. */
@media(max-width:600px){
 #view .tablewrap table.sl-responsive-table,#view .v40-table table.sl-responsive-table{display:block;width:100%;min-width:0!important;table-layout:auto}
 #view .tablewrap table.sl-responsive-table thead,#view .v40-table table.sl-responsive-table thead{display:none}
 #view .tablewrap table.sl-responsive-table tbody,#view .v40-table table.sl-responsive-table tbody{display:grid;gap:9px;width:100%}
 #view .tablewrap table.sl-responsive-table tbody tr,#view .v40-table table.sl-responsive-table tbody tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;width:100%;min-width:0;border:1px solid var(--sl-line);border-radius:12px;overflow:hidden;background:var(--sl-surface);box-shadow:0 4px 12px #0002}
 #view .tablewrap table.sl-responsive-table tbody td,#view .v40-table table.sl-responsive-table tbody td{display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:0;padding:9px 8px;border:0;border-bottom:1px solid #ffffff12;background:transparent;color:var(--sl-text);font-size:12px;white-space:normal;overflow-wrap:anywhere}
 #view .tablewrap table.sl-responsive-table tbody td:before,#view .v40-table table.sl-responsive-table tbody td:before{content:attr(data-label);display:block;color:var(--sl-muted);font-size:9px;font-weight:800;letter-spacing:.45px;text-transform:uppercase}
 #view .tablewrap table.sl-responsive-table tbody td:first-child,#view .v40-table table.sl-responsive-table tbody td:first-child{grid-column:1/-1;font-weight:750;color:#f1dfb5;border-bottom:1px solid var(--sl-line)}
 #view .tablewrap table.sl-responsive-table tbody td[colspan],#view .v40-table table.sl-responsive-table tbody td[colspan]{grid-column:1/-1}
 #view .tablewrap table.sl-responsive-table tbody td:last-child:has(button),#view .v40-table table.sl-responsive-table tbody td:last-child:has(button){grid-column:1/-1;flex-direction:row;flex-wrap:wrap;gap:6px}
 #view .tablewrap table.sl-responsive-table tbody td:last-child:has(button):before,#view .v40-table table.sl-responsive-table tbody td:last-child:has(button):before{display:none}
 #view .tablewrap table.sl-responsive-table tbody td button,#view .v40-table table.sl-responsive-table tbody td button{flex:1 1 auto;min-width:0;padding:8px 7px;font-size:11px}
}
.theme-dark{--sl-bg:#101418;--sl-surface:#1b2025;--sl-line:#3a444d}
`;
const style=document.createElement("style");style.id="sl-layout-v41";style.textContent=css;document.head.appendChild(style);
function labelTables(root){
 (root||document).querySelectorAll("#view .tablewrap table,#view .v40-table table").forEach(table=>{
  if(table.closest("#invoicepaper")||table.dataset.slLabels==="1")return;
  const heads=Array.from(table.querySelectorAll("thead th")).map(th=>th.textContent.trim());
  if(!heads.length)return;
  table.classList.add("sl-responsive-table");
  table.querySelectorAll("tbody tr").forEach(row=>Array.from(row.cells).forEach((cell,i)=>{
   if(cell.hasAttribute("colspan"))return;
   cell.setAttribute("data-label",heads[i]||("Field "+(i+1)));
  }));
  table.dataset.slLabels="1";
 });
}
labelTables();
const view=document.getElementById("view");
if(view)new MutationObserver(()=>labelTables(view)).observe(view,{childList:true,subtree:true});
window.addEventListener("resize",()=>labelTables());
window.__SMARTLEDGER_LAYOUT_V41__={version:"41.0.0",labelTables};
})();