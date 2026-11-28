/* SmartLedger — Vyapar-inspired Android workspace v2.
   Presentation layer only: preserves data, workflows, page renderers and dashboard. */
(function(){
  "use strict";
  if(window.__SL_VYAPAR_ANDROID_V2__)return;
  window.__SL_VYAPAR_ANDROID_V2__=true;
  const css=`
  :root{
    --vy-blue:#1673c8;--vy-blue-dark:#105fa8;--vy-blue-soft:#eaf4fd;
    --vy-bg:#f5f7fa;--vy-surface:#fff;--vy-ink:#263442;--vy-muted:#738191;
    --vy-line:#e1e7ed;--vy-green:#168653;--vy-red:#d94b55;
    --vy-shadow:0 2px 8px rgba(24,52,78,.055);
  }
  body:not(.module-dashboard){
    --blue:var(--vy-blue);--wine:var(--vy-blue);--navy:#173e62;
    --bg:var(--vy-bg);--card:var(--vy-surface);--text:var(--vy-ink);
    --muted:var(--vy-muted);--line:var(--vy-line);
    background:var(--vy-bg)!important;color:var(--vy-ink)!important;
    font-family:Roboto,Inter,"Segoe UI",Arial,sans-serif!important;
  }
  body:not(.module-dashboard) .side{
    background:#fff!important;color:var(--vy-ink)!important;
    border-right:1px solid var(--vy-line)!important;box-shadow:2px 0 12px #193b5908!important;
  }
  body:not(.module-dashboard) .brand{
    color:#fff!important;background:var(--vy-blue)!important;
    min-height:62px;padding:14px 16px!important;margin:-22px -14px 14px!important;
    border-radius:0!important;font-size:19px!important;letter-spacing:.1px!important;
  }
  body:not(.module-dashboard) .brand:before{display:none!important}
  body:not(.module-dashboard) .brand small{color:#eaf4ff!important}
  body:not(.module-dashboard) .navlabel{
    color:#8996a4!important;font-size:10px!important;font-weight:750!important;
    letter-spacing:1px!important;padding:13px 12px 6px!important;
  }
  body:not(.module-dashboard) .nav button{
    display:flex!important;align-items:center!important;min-height:43px!important;
    padding:10px 12px!important;margin:2px 0!important;border-radius:7px!important;
    color:#445363!important;background:transparent!important;font-weight:550!important;
    box-shadow:none!important;border:0!important;
  }
  body:not(.module-dashboard) .nav button.active{
    color:var(--vy-blue)!important;background:var(--vy-blue-soft)!important;
    font-weight:700!important;border-left:3px solid var(--vy-blue)!important;
  }
  body:not(.module-dashboard) .nav button:hover{background:#f1f6fb!important;color:var(--vy-blue)!important}
  body:not(.module-dashboard) .main,body:not(.module-dashboard) .content,
  body:not(.module-dashboard) #view{background:var(--vy-bg)!important;color:var(--vy-ink)!important}
  body:not(.module-dashboard) .top{
    min-height:58px!important;background:#fff!important;color:var(--vy-ink)!important;
    border-bottom:1px solid var(--vy-line)!important;box-shadow:0 1px 3px #17324a08!important;
    padding:0 22px!important;
  }
  body:not(.module-dashboard) .top strong{color:var(--vy-ink)!important;font-size:17px!important;font-weight:650!important}
  body:not(.module-dashboard) .content{padding:20px 22px!important}
  body:not(.module-dashboard) #view :is(h1,h2,h3,h4){color:var(--vy-ink)!important;letter-spacing:0!important}
  body:not(.module-dashboard) #view h1{font-size:22px!important;font-weight:700!important}
  body:not(.module-dashboard) #view h2{font-size:16px!important;font-weight:700!important}
  body:not(.module-dashboard) #view :is(p,label,.muted,small,.statlabel){color:var(--vy-muted)}
  body:not(.module-dashboard) #view .welcome{margin-bottom:18px!important}
  body:not(.module-dashboard) #view .section{margin-top:17px!important}
  body:not(.module-dashboard) #view .sectionhead{margin-bottom:12px!important}
  body:not(.module-dashboard) #view .card,
  body:not(.module-dashboard) #view .tablewrap,
  body:not(.module-dashboard) #view .more-link,
  body:not(.module-dashboard) #view .quick button,
  body:not(.module-dashboard) #view .section-quick button,
  body:not(.module-dashboard) #view .tabs button{
    background:#fff!important;color:var(--vy-ink)!important;
    border:1px solid var(--vy-line)!important;border-radius:9px!important;
    box-shadow:var(--vy-shadow)!important;
  }
  body:not(.module-dashboard) #view .card{padding:16px!important}
  body:not(.module-dashboard) #view .btn{
    min-height:37px!important;padding:8px 13px!important;border-radius:7px!important;
    font-size:13px!important;font-weight:650!important;box-shadow:none!important;
  }
  body:not(.module-dashboard) #view .btn.primary,
  body:not(.module-dashboard) #view button.primary{
    background:var(--vy-blue)!important;border:1px solid var(--vy-blue)!important;color:#fff!important;
  }
  body:not(.module-dashboard) #view .btn.primary:hover{background:var(--vy-blue-dark)!important}
  body:not(.module-dashboard) #view .btn:not(.primary){
    background:#fff!important;color:#3f5366!important;border:1px solid #cfd9e2!important;
  }
  body:not(.module-dashboard) #view :is(input,select,textarea,.search),
  body:not(.module-dashboard) #modal :is(input,select,textarea){
    min-height:41px!important;padding:9px 11px!important;border:1px solid #cbd6e0!important;
    border-radius:7px!important;background:#fff!important;color:var(--vy-ink)!important;
    box-shadow:none!important;font-size:14px!important;
  }
  body:not(.module-dashboard) #view :is(input,select,textarea):focus,
  body:not(.module-dashboard) #modal :is(input,select,textarea):focus{
    outline:0!important;border-color:#4592d1!important;box-shadow:0 0 0 3px #1673c81a!important;
  }
  body:not(.module-dashboard) #view .field label,
  body:not(.module-dashboard) #modal .field label{
    color:#596b7b!important;font-size:12px!important;font-weight:650!important;
  }
  body:not(.module-dashboard) #view .tablewrap{overflow:auto!important}
  body:not(.module-dashboard) #view table{
    min-width:560px!important;width:100%!important;border-collapse:separate!important;
    border-spacing:0!important;background:#fff!important;
  }
  body:not(.module-dashboard) #view th{
    position:sticky;top:0;background:#f0f4f8!important;color:#586a7b!important;
    border-color:#e0e6ec!important;font-size:11px!important;font-weight:750!important;
    text-transform:uppercase!important;letter-spacing:.35px!important;white-space:nowrap!important;
  }
  body:not(.module-dashboard) #view td{
    background:#fff!important;color:#2e3d4b!important;border-color:#e8edf1!important;
    font-size:13px!important;padding:11px 12px!important;
  }
  body:not(.module-dashboard) #view tbody tr:nth-child(even) td{background:#fafbfd!important}
  body:not(.module-dashboard) #view tbody tr:hover td{background:#f2f7fb!important}
  body:not(.module-dashboard) #view .more-icon{background:var(--vy-blue-soft)!important;color:var(--vy-blue)!important;border-radius:8px!important}
  body:not(.module-dashboard) #view .section-quick{gap:8px!important}
  body:not(.module-dashboard) #view .section-quick button{min-height:39px!important;box-shadow:none!important}
  body:not(.module-dashboard) #view .section-quick button.section-more{background:var(--vy-blue-soft)!important;color:var(--vy-blue)!important}
  body:not(.module-dashboard) #view .section-quick .more-mark{background:var(--vy-blue)!important}
  body:not(.module-dashboard) #view .stat{color:var(--vy-ink)!important;font-size:22px!important}
  body:not(.module-dashboard) #view .positive{color:var(--vy-green)!important}
  body:not(.module-dashboard) #view .negative{color:var(--vy-red)!important}
  body:not(.module-dashboard) #modal .dialog{
    background:#fff!important;color:var(--vy-ink)!important;border:1px solid #dce4eb!important;
    border-radius:11px!important;box-shadow:0 16px 46px #102b4430!important;
  }
  body:not(.module-dashboard) #modal .dialoghead{
    background:#fff!important;color:var(--vy-ink)!important;border-bottom:1px solid var(--vy-line)!important;
  }
  body:not(.module-dashboard) #modal .dialoghead h2{color:var(--vy-ink)!important}
  body:not(.module-dashboard) #modal .close{background:#eef3f7!important;color:#526577!important;border-radius:7px!important}
  body:not(.module-dashboard) .mobile-nav{
    background:#fff!important;border-top:1px solid var(--vy-line)!important;
    box-shadow:0 -3px 12px #17324a0c!important;
  }
  body:not(.module-dashboard) .mobile-nav button{color:#718091!important;font-weight:600!important}
  body:not(.module-dashboard) .mobile-nav button.active{color:var(--vy-blue)!important}
  body:not(.module-dashboard) .mobile-nav button.active .mi{background:var(--vy-blue-soft)!important;border-radius:8px!important}
  body:not(.module-dashboard) .pill{background:var(--vy-blue-soft)!important;color:var(--vy-blue)!important}
  body:not(.module-dashboard) .badge{background:#e9f7ef!important;color:#167a4b!important}
  body:not(.module-dashboard) .notice{background:#fff8e8!important;color:#745719!important;border:1px solid #f0dfb7!important}
  body:not(.module-dashboard) .unit-mapping-box{
    background:#f4f8fc!important;color:var(--vy-ink)!important;border:1px solid #d7e3ed!important;
    border-radius:9px!important;
  }
  body:not(.module-dashboard) .unit-mapping-title small{color:#6c7d8c!important}
  body:not(.module-dashboard) .unit-mapping-preview{background:#eaf4fd!important;color:#175e99!important;border:1px solid #cfe3f4!important}
  body:not(.module-dashboard) .bulk-unit-list{border-color:#dce4eb!important}
  body:not(.module-dashboard) .bulk-unit-item{color:var(--vy-ink)!important;border-color:#e6ebf0!important}
  body:not(.module-dashboard) .bulk-unit-item small{color:var(--vy-muted)!important}
  body:not(.module-dashboard) #itemrows tbody tr{background:#fff!important;border:1px solid var(--vy-line)!important;box-shadow:none!important}
  body:not(.module-dashboard) #itemrows td:nth-child(1){color:var(--vy-ink)!important}
  body:not(.module-dashboard) #itemrows td:before{color:#738191!important}
  body.theme-dark:not(.module-dashboard){
    --vy-bg:#171f28;--vy-surface:#202b36;--vy-ink:#e9f0f6;--vy-muted:#a9b7c4;--vy-line:#3a4a59;
  }
  body.theme-dark:not(.module-dashboard) .side,
  body.theme-dark:not(.module-dashboard) .top,
  body.theme-dark:not(.module-dashboard) .mobile-nav,
  body.theme-dark:not(.module-dashboard) #view .card,
  body.theme-dark:not(.module-dashboard) #view .tablewrap,
  body.theme-dark:not(.module-dashboard) #view .more-link,
  body.theme-dark:not(.module-dashboard) #view .quick button,
  body.theme-dark:not(.module-dashboard) #view .section-quick button,
  body.theme-dark:not(.module-dashboard) #modal .dialog,
  body.theme-dark:not(.module-dashboard) #modal .dialoghead{
    background:var(--vy-surface)!important;color:var(--vy-ink)!important;border-color:var(--vy-line)!important;
  }
  body.theme-dark:not(.module-dashboard) #view :is(h1,h2,h3,p,label,small,.muted,.statlabel){color:var(--vy-ink)!important}
  body.theme-dark:not(.module-dashboard) #view th{background:#2b3947!important;color:#dce7f0!important;border-color:var(--vy-line)!important}
  body.theme-dark:not(.module-dashboard) #view td{background:#202b36!important;color:#e9f0f6!important;border-color:var(--vy-line)!important}
  body.theme-dark:not(.module-dashboard) #view tbody tr:nth-child(even) td{background:#24313d!important}
  body.theme-dark:not(.module-dashboard) #view :is(input,select,textarea,.search),
  body.theme-dark:not(.module-dashboard) #modal :is(input,select,textarea){
    background:#18232d!important;color:#e9f0f6!important;border-color:#465766!important;
  }
  body.theme-dark:not(.module-dashboard) #view .btn:not(.primary){background:#263541!important;color:#e9f0f6!important;border-color:#465766!important}
  body.theme-dark:not(.module-dashboard) #view .unit-mapping-box{background:#253541!important;color:#e9f0f6!important;border-color:#465766!important}
  body.theme-dark:not(.module-dashboard) #view .unit-mapping-preview{background:#1b3040!important;color:#cfe7f8!important}
  @media(max-width:850px){
    body:not(.module-dashboard) .side{background:#fff!important}
    body:not(.module-dashboard) .side .brand{margin:0!important;min-height:62px!important;padding:0 14px!important;background:var(--vy-blue)!important}
    body:not(.module-dashboard) .content{padding:14px 13px calc(88px + env(safe-area-inset-bottom))!important}
    body:not(.module-dashboard) .top{padding:0 14px!important;min-height:52px!important}
    body:not(.module-dashboard) #view h1{font-size:20px!important}
    body:not(.module-dashboard) #view .card{padding:13px!important}
    body:not(.module-dashboard) #view .sectionhead{align-items:center!important;flex-wrap:wrap!important}
    body:not(.module-dashboard) #view .sectionhead .search{max-width:100%!important;width:100%!important}
    body:not(.module-dashboard) #view .tablewrap{border-radius:8px!important}
    body:not(.module-dashboard) #view th,body:not(.module-dashboard) #view td{font-size:12px!important;padding:9px 8px!important}
    body:not(.module-dashboard) #modal.show>.dialog{border-radius:0!important}
  }
  @media(max-width:520px){
    body:not(.module-dashboard) #view .grid{gap:9px!important}
    body:not(.module-dashboard) #view .stat{font-size:19px!important}
    body:not(.module-dashboard) #view .formgrid{gap:11px!important}
    body:not(.module-dashboard) #view .actions .btn{flex:1 1 auto}
    body:not(.module-dashboard) #view .section-quick{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    body:not(.module-dashboard) #view .section-quick button{min-width:0!important;padding:8px 6px!important;font-size:12px!important}
  }
  `;
  const style=document.createElement("style");style.id="sl-vyapar-android-v2";style.textContent=css;document.head.appendChild(style);
  // Ensure the dashboard keeps its existing appearance even when theme classes change.
  const observer=new MutationObserver(()=>{if(document.body.classList.contains("module-dashboard"))return;});
  observer.observe(document.body,{attributes:true,attributeFilter:["class"]});
})();