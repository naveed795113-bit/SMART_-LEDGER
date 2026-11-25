/* SmartLedger v42.0 — consistent light, dark and system appearance.
   Keeps the dashboard's burgundy overview design and each module's identity colours. */
(function () {
  "use strict";
  const STYLE_ID = "smartledger-v42-theme-system";
  const css = `
    :root{color-scheme:light;--sl-page:#f4f6f8;--sl-surface:#ffffff;--sl-surface-2:#f7f9fb;--sl-text:#202833;--sl-muted:#586574;--sl-line:#d8e0e8;--sl-input:#fff;--sl-input-text:#202833;--sl-shadow:0 8px 22px #17212b12}
    html[data-sl-theme="dark"]{color-scheme:dark;--sl-page:#11171d;--sl-surface:#1c252e;--sl-surface-2:#222d37;--sl-text:#f3f6f9;--sl-muted:#bdc8d2;--sl-line:#3a4855;--sl-input:#151d25;--sl-input-text:#f3f6f9;--sl-shadow:0 8px 22px #0005}
    body.theme-light{background:var(--sl-page)!important;color:var(--sl-text)!important}
    body.theme-dark{background:var(--sl-page)!important;color:var(--sl-text)!important}
    body.theme-light .main>.top{background:var(--sl-surface)!important;color:var(--sl-text)!important;border-color:var(--sl-line)!important}
    body.theme-dark .main>.top{background:var(--sl-surface)!important;color:var(--sl-text)!important;border-color:var(--sl-line)!important}
    body.theme-light .top strong,body.theme-dark .top strong{color:var(--sl-text)!important}
    body.theme-light .content{background:var(--sl-page)!important;color:var(--sl-text)!important}
    body.theme-dark .content{background:var(--sl-page)!important;color:var(--sl-text)!important}
    body.theme-light #view,body.theme-dark #view{color:var(--sl-text)}
    body.theme-light #view .card,body.theme-light #view .tablewrap,body.theme-light #view .more-link,body.theme-light #view .quick button,body.theme-light #view .section-quick button,body.theme-light #view .tabs button,body.theme-light #view .sales-kpi,body.theme-light #view .sales-panel{background:var(--sl-surface)!important;color:var(--sl-text)!important;border-color:var(--sl-line)!important}
    body.theme-dark #view .card,body.theme-dark #view .tablewrap,body.theme-dark #view .more-link,body.theme-dark #view .quick button,body.theme-dark #view .section-quick button,body.theme-dark #view .tabs button,body.theme-dark #view .sales-kpi,body.theme-dark #view .sales-panel{background:var(--sl-surface)!important;color:var(--sl-text)!important;border-color:var(--sl-line)!important}
    body.theme-light #view h1,body.theme-light #view h2,body.theme-light #view h3,body.theme-light #view p,body.theme-light #view label,body.theme-light #view .muted,body.theme-light #view .statlabel,body.theme-light #view small,body.theme-light #view td{color:var(--sl-text)}
    body.theme-dark #view h1,body.theme-dark #view h2,body.theme-dark #view h3,body.theme-dark #view p,body.theme-dark #view label,body.theme-dark #view .muted,body.theme-dark #view .statlabel,body.theme-dark #view small,body.theme-dark #view td{color:var(--sl-text)!important}
    body.theme-light #view .muted,body.theme-light #view .statlabel,body.theme-light #view small{color:var(--sl-muted)}
    body.theme-dark #view .muted,body.theme-dark #view .statlabel,body.theme-dark #view small{color:var(--sl-muted)!important}
    body.theme-light #view th{background:#e9eef3!important;color:#263544!important;border-color:var(--sl-line)!important}
    body.theme-dark #view th{background:#2a3743!important;color:#f5f8fb!important;border-color:var(--sl-line)!important}
    body.theme-light #view td{background:var(--sl-surface)!important;border-color:var(--sl-line)!important}
    body.theme-dark #view td{background:var(--sl-surface)!important;color:var(--sl-text)!important;border-color:var(--sl-line)!important}
    body.theme-light #view tbody tr:nth-child(even) td{background:#f3f6f9!important}
    body.theme-dark #view tbody tr:nth-child(even) td{background:#202b35!important}
    body.theme-light #view input,body.theme-light #view select,body.theme-light #view textarea,body.theme-light #view .search,
    body.theme-light .dialog input,body.theme-light .dialog select,body.theme-light .dialog textarea{background:var(--sl-input)!important;color:var(--sl-input-text)!important;border:1px solid var(--sl-line)!important}
    body.theme-dark #view input,body.theme-dark #view select,body.theme-dark #view textarea,body.theme-dark #view .search,
    body.theme-dark .dialog input,body.theme-dark .dialog select,body.theme-dark .dialog textarea{background:var(--sl-input)!important;color:var(--sl-input-text)!important;border:1px solid var(--sl-line)!important}
    body.theme-light #view input::placeholder,body.theme-light #view textarea::placeholder{color:#788594!important}
    body.theme-dark #view input::placeholder,body.theme-dark #view textarea::placeholder{color:#aab6c2!important}
    body.theme-light #view .field label,body.theme-light .dialog label{color:#465463!important}
    body.theme-dark #view .field label,body.theme-dark .dialog label{color:#d9e1e8!important}
    body.theme-light .dialog{background:#fff!important;color:#202833!important;border:1px solid #d8e0e8!important}
    body.theme-dark .dialog{background:#1c252e!important;color:#f3f6f9!important;border:1px solid #3a4855!important}
    body.theme-dark .dialog h1,body.theme-dark .dialog h2,body.theme-dark .dialog h3,body.theme-dark .dialog p,body.theme-dark .dialog small,body.theme-dark .dialog b,body.theme-dark .dialog span{color:inherit}
    body.theme-light .notice{background:#fff7e6!important;color:#654b1c!important;border-color:#ead6a9!important}
    body.theme-dark .notice{background:#3a3020!important;color:#ffe4a8!important;border-color:#725c34!important}
    body.theme-light .empty{color:#687584!important}
    body.theme-dark .empty{color:#c2ccd6!important}
    body.theme-light .mobile-nav{background:#fff!important;border-color:var(--sl-line)!important}
    body.theme-dark .mobile-nav{background:#1c252e!important;border-color:#3a4855!important}
    body.theme-light .mobile-nav button{color:#5b6876!important}
    body.theme-dark .mobile-nav button{color:#c3ced8!important}
    body.theme-dark .mobile-nav button.active{color:#f0c4ce!important}
    body.theme-light .theme-switch{background:#eceff3!important;border-color:#d5dde5!important}
    body.theme-dark .theme-switch{background:#202a34!important;border-color:#43515f!important}
    body.theme-light .theme-switch button{color:#596777!important}
    body.theme-dark .theme-switch button{color:#d5dee7!important}
    body.theme-light .theme-switch button.selected{background:#702b3a!important;color:#fff!important}
    body.theme-dark .theme-switch button.selected{background:#a65b6c!important;color:#fff!important}
    body.theme-light .btn:not(.primary):not(.danger){background:#fff!important;color:#263544!important;border-color:#cbd5df!important}
    body.theme-dark .btn:not(.primary):not(.danger){background:#2a3743!important;color:#f3f6f9!important;border-color:#536170!important}
    body.theme-dark .btn.primary{background:linear-gradient(145deg,#a65b6c,#702b3a)!important;color:#fff!important;border-color:#b87887!important}
    body.theme-light .btn.primary{color:#fff!important}
    body.theme-dark .badge{background:#183d31!important;color:#9ce4c1!important}
    body.theme-dark .pill{background:#3b2930!important;color:#f3dce1!important;border-color:#68424d!important}
    body.theme-dark .more-icon{background:#392830!important;color:#f1cbd4!important}
    body.theme-dark .tablewrap{box-shadow:var(--sl-shadow)!important}
    body.theme-dark .tablewrap table{border-color:var(--sl-line)!important}
    body.theme-dark .tablewrap th,body.theme-dark .tablewrap td{border-color:var(--sl-line)!important}
    body.theme-dark .chartbar{background:#34414d!important}
    body.theme-dark .section-quick button{color:#f2d9df!important}
    body.theme-dark .modal{background:#080d12cc!important}
    body.theme-dark .close{background:#34414d!important;color:#fff!important}
    /* Module palettes keep their identity, while the selected appearance controls contrast. */
    body.theme-light.module-inventory #view{background:#435d50!important;color:#fff!important}
    body.theme-light.module-inventory #view .card,body.theme-light.module-inventory #view .tablewrap,body.theme-light.module-inventory #view .more-link,body.theme-light.module-inventory #view .quick button,body.theme-light.module-inventory #view .section-quick button,body.theme-light.module-inventory #view .dialog{background:#526f60!important;color:#fff!important}
    body.theme-dark.module-inventory #view{background:#1b2a22!important;color:#f6fff8!important}
    body.theme-dark.module-inventory #view .card,body.theme-dark.module-inventory #view .tablewrap,body.theme-dark.module-inventory #view .more-link,body.theme-dark.module-inventory #view .quick button,body.theme-dark.module-inventory #view .section-quick button{background:#293d32!important;color:#f6fff8!important;border-color:#597765!important}
    body.theme-dark.module-inventory #view :is(h1,h2,h3,p,label,small,b,strong,span,.muted,.statlabel,.stat,td){color:#f6fff8!important}
    body.theme-dark.module-inventory #view th{background:#354e43!important;color:#fff!important}
    body.theme-dark.module-inventory #view td{background:#293d32!important;color:#f6fff8!important}
    body.theme-light.module-sales #view{background:#3c096c!important;color:#fff!important}
    body.theme-light.module-sales #view .card,body.theme-light.module-sales #view .tablewrap,body.theme-light.module-sales #view .more-link,body.theme-light.module-sales #view .quick button,body.theme-light.module-sales #view .section-quick button{background:#4c187d!important;color:#fff!important}
    body.theme-dark.module-sales #view{background:#1d102b!important;color:#fff!important}
    body.theme-dark.module-sales #view .card,body.theme-dark.module-sales #view .tablewrap,body.theme-dark.module-sales #view .more-link,body.theme-dark.module-sales #view .quick button,body.theme-dark.module-sales #view .section-quick button{background:#30203f!important;color:#fff!important;border-color:#8d62aa!important}
    body.theme-dark.module-sales #view :is(h1,h2,h3,p,label,small,b,strong,span,.muted,.statlabel,.stat,td){color:#fff!important}
    body.theme-dark.module-sales #view th{background:#260d3d!important;color:#f4dcff!important}
    body.theme-dark.module-sales #view td{background:#30203f!important;color:#fff!important}
    body.theme-light.module-purchases #view{background:#a64e32!important;color:#fff!important}
    body.theme-light.module-purchases #view .card,body.theme-light.module-purchases #view .tablewrap,body.theme-light.module-purchases #view .more-link,body.theme-light.module-purchases #view .quick button,body.theme-light.module-purchases #view .section-quick button{background:#315a7b!important;color:#fff!important}
    body.theme-light.module-purchases #view :is(h1,h2,h3,p,label,small,b,strong,span,.muted,.statlabel,.stat,td,th){color:#fff!important}
    body.theme-dark.module-purchases #view{background:#211b1a!important;color:#fff!important}
    body.theme-dark.module-purchases #view .card,body.theme-dark.module-purchases #view .tablewrap,body.theme-dark.module-purchases #view .more-link,body.theme-dark.module-purchases #view .quick button,body.theme-dark.module-purchases #view .section-quick button{background:#29465f!important;color:#fff!important;border-color:#b86a4e!important}
    body.theme-dark.module-purchases #view :is(h1,h2,h3,p,label,small,b,strong,span,.muted,.statlabel,.stat,td,th){color:#fff!important}
    body.theme-dark.module-purchases #view th{background:#a64e32!important;color:#fff!important}
    body.theme-dark.module-purchases #view td{background:#29465f!important;color:#fff!important}
    body.theme-light.module-ledger #view{background:#f8f5ef!important;color:#5a3e2b!important}
    body.theme-light.module-ledger #view .card,body.theme-light.module-ledger #view .tablewrap,body.theme-light.module-ledger #view .more-link,body.theme-light.module-ledger #view .quick button,body.theme-light.module-ledger #view .section-quick button{background:#c6a77b!important;color:#5a3e2b!important}
    body.theme-dark.module-ledger #view{background:#201c17!important;color:#fff2df!important}
    body.theme-dark.module-ledger #view .card,body.theme-dark.module-ledger #view .tablewrap,body.theme-dark.module-ledger #view .more-link,body.theme-dark.module-ledger #view .quick button,body.theme-dark.module-ledger #view .section-quick button{background:#392f25!important;color:#fff2df!important;border-color:#8b7458!important}
    body.theme-dark.module-ledger #view :is(h1,h2,h3,p,label,small,b,strong,span,.muted,.statlabel,.stat,td){color:#fff2df!important}
    body.theme-dark.module-ledger #view th{background:#171513!important;color:#fff!important}
    body.theme-dark.module-ledger #view td{background:#392f25!important;color:#fff2df!important}
    body.theme-dark.module-ledger #view input,body.theme-dark.module-ledger #view select,body.theme-dark.module-ledger #view textarea,body.theme-dark.module-ledger #view .search{background:#171513!important;color:#fff2df!important;border-color:#8b7458!important}
    body.theme-light.module-other #view{background:#536e7b!important;color:#fff!important}
    body.theme-light.module-other #view .card,body.theme-light.module-other #view .tablewrap,body.theme-light.module-other #view .more-link,body.theme-light.module-other #view .quick button,body.theme-light.module-other #view .section-quick button{background:#6c8490!important;color:#fff!important}
    body.theme-dark.module-other #view{background:#1b2930!important;color:#f5fbff!important}
    body.theme-dark.module-other #view .card,body.theme-dark.module-other #view .tablewrap,body.theme-dark.module-other #view .more-link,body.theme-dark.module-other #view .quick button,body.theme-dark.module-other #view .section-quick button{background:#2b3e48!important;color:#f5fbff!important;border-color:#66808d!important}
    body.theme-dark.module-other #view :is(h1,h2,h3,p,label,small,b,strong,span,.muted,.statlabel,.stat,td){color:#f5fbff!important}
    body.theme-dark.module-other #view th{background:#354e59!important;color:#fff!important}
    body.theme-dark.module-other #view td{background:#2b3e48!important;color:#f5fbff!important}
    body.theme-dark.module-more #view{background:#171d24!important;color:#f3f6f9!important}
    body.theme-dark.module-more #view .more-link,body.theme-dark.module-more #view .card{background:#222c36!important;color:#f3f6f9!important;border-color:#3c4a57!important}
    /* Keep the existing dashboard burgundy overview cards, quick actions and chart styling intact. */
    body.theme-dark #view .overview-card{color:#fff8f0!important}
    body.theme-dark #view .overview-card :is(.statlabel,.stat,small){color:#fff8f0!important}
    body.theme-dark #view .dashboard-quick button{color:#f5e7e4!important}
    body.theme-dark #view .sales-overview-card{color:#f0d9dd!important}
    body.theme-dark #view .sales-overview-card :is(h2,p,span,small){color:#f0d9dd!important}
    @media(prefers-reduced-motion:no-preference){.theme-switch button{transition:background .18s ease,color .18s ease,transform .18s ease}}
  `;
  function ensureStyle(){let node=document.getElementById(STYLE_ID);if(!node){node=document.createElement("style");node.id=STYLE_ID;document.head.appendChild(node)}node.textContent=css}
  function activeMode(){const saved=localStorage.getItem("slTheme")||"light";return saved==="system"?(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):saved}
  function syncTheme(){
    const mode=activeMode(),saved=localStorage.getItem("slTheme")||"light",dark=mode==="dark";
    document.documentElement.dataset.slTheme=mode;
    document.documentElement.style.colorScheme=mode;
    document.body.classList.toggle("theme-dark",dark);
    document.body.classList.toggle("theme-light",!dark);
    document.body.dataset.themeMode=saved;
    document.querySelectorAll(".theme-switch button[data-theme-mode]").forEach(button=>{
      const selected=button.dataset.themeMode===saved;
      button.classList.toggle("selected",selected);
      button.setAttribute("aria-pressed",selected?"true":"false");
    });
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute("content",dark?"#11171d":"#702b3a");
    const choice=document.getElementById("themechoice");
    if(choice&&choice.value!==saved)choice.value=saved;
  }
  ensureStyle();
  const previousApply=window.applyTheme;
  window.applyTheme=function(){if(typeof previousApply==="function")previousApply();syncTheme()};
  const previousSet=window.setTheme;
  window.setTheme=function(mode){
    if(!["light","dark","system"].includes(mode))mode="light";
    localStorage.setItem("slTheme",mode);
    if(typeof previousSet==="function")previousSet(mode);
    syncTheme();
  };
  if(window.matchMedia){
    const media=window.matchMedia("(prefers-color-scheme: dark)");
    const onChange=()=>{if((localStorage.getItem("slTheme")||"light")==="system")syncTheme()};
    if(media.addEventListener)media.addEventListener("change",onChange);
    else if(media.addListener)media.addListener(onChange);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",syncTheme,{once:true});
  else syncTheme();
  window.__SMARTLEDGER_V42_THEME__={version:"42.0.0",sync:syncTheme,activeMode};
})();