/* SmartLedger v43.0 — independent text-contrast profiles for Light and Dark mode.
   This layer changes text contrast only; module colours and dashboard layout remain intact. */
(function(){
  "use strict";
  const id="smartledger-v43-text-contrast";
  const css=`
    html[data-sl-theme="light"]{
      --sl-ink:#17212b;--sl-muted-ink:#4b5968;--sl-heading-ink:#111a23;
      --sl-field-ink:#17212b;--sl-placeholder-ink:#687686;
      --sl-border-contrast:#aeb9c4;
    }
    html[data-sl-theme="dark"]{
      --sl-ink:#f5f7fa;--sl-muted-ink:#c4ced8;--sl-heading-ink:#ffffff;
      --sl-field-ink:#f7f9fc;--sl-placeholder-ink:#b8c4cf;
      --sl-border-contrast:#526170;
    }

    /* LIGHT MODE: dark, high-contrast text on neutral/light surfaces. */
    body.theme-light #view :is(h1,h2,h3,h4,h5,p,label,legend,li,dt,dd,th,td,b,strong,em,span,small,.muted,.statlabel,.stat,.empty,.hint,.description,.field-label){
      color:var(--sl-ink);
    }
    body.theme-light #view :is(.muted,.statlabel,small,.hint,.description,.empty){color:var(--sl-muted-ink)}
    body.theme-light .dialog :is(h1,h2,h3,h4,p,label,span,small,b,strong,td,th){color:#17212b}
    body.theme-light #view :is(input,select,textarea),body.theme-light .dialog :is(input,select,textarea){
      color:var(--sl-field-ink)!important;background:#fff!important;
      -webkit-text-fill-color:var(--sl-field-ink)!important;border-color:#9eabb8!important;
    }
    body.theme-light #view :is(input,textarea)::placeholder,body.theme-light .dialog :is(input,textarea)::placeholder{color:var(--sl-placeholder-ink)!important;opacity:1}
    body.theme-light #view option,body.theme-light .dialog option{background:#fff;color:#17212b}
    body.theme-light #view :is(button,.btn,.tab,.more-link){text-shadow:none}
    body.theme-light #view .tablewrap :is(th,td){border-color:#c2ccd5!important}
    body.theme-light #view .tablewrap th{color:#17212b!important;background:#e7edf2!important}
    body.theme-light #view .tablewrap td{color:#17212b!important}

    /* DARK MODE: white/light text on dark surfaces, including muted and secondary labels. */
    body.theme-dark #view :is(h1,h2,h3,h4,h5,p,label,legend,li,dt,dd,th,td,b,strong,em,span,small,.muted,.statlabel,.stat,.empty,.hint,.description,.field-label){
      color:var(--sl-ink)!important;
    }
    body.theme-dark #view :is(.muted,.statlabel,small,.hint,.description,.empty){color:var(--sl-muted-ink)!important}
    body.theme-dark .dialog :is(h1,h2,h3,h4,p,label,span,small,b,strong,td,th){color:#f5f7fa!important}
    body.theme-dark #view :is(input,select,textarea),body.theme-dark .dialog :is(input,select,textarea){
      color:var(--sl-field-ink)!important;background:#151d25!important;
      -webkit-text-fill-color:var(--sl-field-ink)!important;border-color:#586777!important;
    }
    body.theme-dark #view :is(input,textarea)::placeholder,body.theme-dark .dialog :is(input,textarea)::placeholder{color:var(--sl-placeholder-ink)!important;opacity:1}
    body.theme-dark #view option,body.theme-dark .dialog option{background:#151d25;color:#f5f7fa}
    body.theme-dark #view .tablewrap :is(th,td){border-color:#465563!important}
    body.theme-dark #view .tablewrap th{color:#fff!important;background:#2a3743!important}
    body.theme-dark #view .tablewrap td{color:#f5f7fa!important}

    /* Retain white lettering on the existing saturated module surfaces in LIGHT mode. */
    body.theme-light:is(.module-inventory,.module-sales,.module-purchases,.module-other) #view :is(h1,h2,h3,h4,h5,p,label,legend,li,dt,dd,b,strong,em,span,small,.muted,.statlabel,.stat,.hint,.description,.field-label,th,td){color:#fff!important}
    body.theme-light.module-inventory #view :is(input,select,textarea){background:#fff!important;color:#17212b!important;-webkit-text-fill-color:#17212b!important}
    body.theme-light.module-sales #view :is(input,select,textarea){background:#fff!important;color:#241333!important;-webkit-text-fill-color:#241333!important}
    body.theme-light.module-purchases #view :is(input,select,textarea){background:#fff!important;color:#17212b!important;-webkit-text-fill-color:#17212b!important}
    body.theme-light.module-other #view :is(input,select,textarea){background:#fff!important;color:#17212b!important;-webkit-text-fill-color:#17212b!important}
    body.theme-light.module-ledger #view :is(h1,h2,h3,h4,p,label,span,b,strong,td){color:#5a3e2b!important}
    body.theme-light.module-ledger #view :is(.muted,.statlabel,small){color:#654d39!important}
    body.theme-light.module-ledger #view :is(input,select,textarea){color:#3b2b20!important;-webkit-text-fill-color:#3b2b20!important}
    body.theme-light.module-more #view :is(h1,h2,h3,h4,p,label,span,b,strong,small,.muted,.statlabel){color:#202833!important}

    /* Dark module profiles always use bright foregrounds; fields remain separately legible. */
    body.theme-dark:is(.module-inventory,.module-sales,.module-purchases,.module-ledger,.module-other,.module-more) #view :is(h1,h2,h3,h4,h5,p,label,legend,li,dt,dd,b,strong,em,span,small,.muted,.statlabel,.stat,.hint,.description,.field-label,th,td){color:#f7f9fc!important}
    body.theme-dark #view :is(.btn.primary,.btn.danger,.badge,.pill){-webkit-text-fill-color:currentColor}
    body.theme-dark.module-ledger #view :is(input,select,textarea){background:#171513!important;color:#fff2df!important;-webkit-text-fill-color:#fff2df!important}
    body.theme-dark.module-more #view :is(input,select,textarea){background:#151d25!important;color:#f5f7fa!important;-webkit-text-fill-color:#f5f7fa!important}

    /* Business Suite: its own cards, metrics, tabs, charts and tables receive explicit mode contrast. */
    body.theme-light #view :is(.v40-head,.v40-card,.v40-stat,.v40-tabs,.v40-table,.v40-panel,.v40-empty){
      color:#17212b;
    }
    body.theme-light #view :is(.v40-head h1,.v40-head p,.v40-card h2,.v40-stat small,.v40-stat strong,.v40-stat span,.v40-table th,.v40-table td,.v40-tab){color:#17212b!important}
    body.theme-light #view .v40-table th{background:#e7edf2!important}
    body.theme-dark #view :is(.v40-head,.v40-card,.v40-stat,.v40-tabs,.v40-table,.v40-panel,.v40-empty){color:#f5f7fa!important}
    body.theme-dark #view :is(.v40-head h1,.v40-head p,.v40-card h2,.v40-stat small,.v40-stat strong,.v40-stat span,.v40-table th,.v40-table td,.v40-tab){color:#f5f7fa!important}
    body.theme-dark #view .v40-table th{background:#2a3743!important}
    body.theme-dark #view .v40-table td{background:#1c252e!important}
    body.theme-dark #view .v40-card,body.theme-dark #view .v40-stat{border-color:#526170!important}
    /* Dashboard overview cards retain their original burgundy styling and white text. */
    body.theme-dark #view .overview-card :is(h1,h2,h3,p,span,small,b,strong,.stat,.statlabel){color:#fff8f0!important}
    body.theme-light #view .overview-card :is(h1,h2,h3,p,span,small,b,strong,.stat,.statlabel){color:#fff8f0!important}
  `;
  let style=document.getElementById(id);
  if(!style){style=document.createElement("style");style.id=id;document.head.appendChild(style)}
  style.textContent=css;
  window.__SMARTLEDGER_V43_CONTRAST__={version:"43.0.0",refresh:()=>{style.textContent=css}};
})();