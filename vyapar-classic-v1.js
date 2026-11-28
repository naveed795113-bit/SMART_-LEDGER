/* SmartLedger Classic Workspace v1: presentation-only; dashboard excluded. */
(function(){if(window.__SL_CLASSIC_WORKSPACE__)return;window.__SL_CLASSIC_WORKSPACE__=true;
const css=`
:root{--vc-ink:#263445;--vc-muted:#6d7b8b;--vc-line:#e1e6ec;--vc-bg:#f5f7f9;--vc-card:#fff}
html[data-sl-theme="dark"]{--vc-ink:#edf2f7;--vc-muted:#aab7c5;--vc-line:#394654;--vc-bg:#171e26;--vc-card:#202a35}
body:not(.module-dashboard){background:var(--vc-bg)!important;color:var(--vc-ink)!important;font-family:Inter,Roboto,"Segoe UI",Arial,sans-serif}
body:not(.module-dashboard) .side{background:var(--vc-card)!important;border-right:1px solid var(--vc-line)!important;box-shadow:2px 0 12px #10243a08!important}
body:not(.module-dashboard) .side .brand{background:#176fc0!important;color:#fff!important;padding:19px 17px!important}
body:not(.module-dashboard) .side .brand small{color:#e8f3ff!important}
body:not(.module-dashboard) .side .navlabel{color:#8995a3!important;font-size:10px!important;font-weight:700!important;letter-spacing:1px!important;text-transform:uppercase!important}
body:not(.module-dashboard) .side .nav button{min-height:43px!important;margin:2px 0!important;border-radius:7px!important;background:transparent!important;color:var(--vc-ink)!important;box-shadow:none!important;border:0!important}
body:not(.module-dashboard) .side .nav button.active{background:#eaf3fc!important;color:#176fc0!important;font-weight:650!important;border-left:3px solid #1976c9!important}
html[data-sl-theme="dark"] body:not(.module-dashboard) .side .nav button.active{background:#263b50!important;color:#8fc5ff!important}
body:not(.module-dashboard) .main,body:not(.module-dashboard) .content{background:var(--vc-bg)!important;color:var(--vc-ink)!important}
body:not(.module-dashboard) .main>.top{min-height:58px!important;padding:0 22px!important;background:var(--vc-card)!important;border-bottom:1px solid var(--vc-line)!important;box-shadow:0 1px 3px #14263b08!important}
body:not(.module-dashboard) .main>.top strong{font-size:17px!important;font-weight:650!important;color:var(--vc-ink)!important}
body:not(.module-dashboard) .content{padding:20px!important}
body:not(.module-dashboard) #view h1,body:not(.module-dashboard) #view h2,body:not(.module-dashboard) #view h3{color:var(--vc-ink)!important}
body:not(.module-dashboard) #view .card,body:not(.module-dashboard) #view .tablewrap,body:not(.module-dashboard) #view .more-link,body:not(.module-dashboard) #view .section-quick button,body:not(.module-dashboard) #view .tabs button,body:not(.module-dashboard) #view .sales-kpi{background:var(--vc-card)!important;color:var(--vc-ink)!important;border:1px solid var(--vc-line)!important;border-radius:9px!important;box-shadow:0 1px 3px #10243a08!important}
body:not(.module-dashboard) #view .muted,body:not(.module-dashboard) #view small{color:var(--vc-muted)!important}
body:not(.module-dashboard) #view .btn{border-radius:7px!important;box-shadow:none!important;font-weight:600!important}
body:not(.module-dashboard) #view .btn.primary,body:not(.module-dashboard) #view button.primary{background:#1976c9!important;border:1px solid #1976c9!important;color:#fff!important}
body:not(.module-dashboard) #view .btn:not(.primary){background:var(--vc-card)!important;border:1px solid #cfd8e2!important;color:var(--vc-ink)!important}
body:not(.module-dashboard) #view input,body:not(.module-dashboard) #view select,body:not(.module-dashboard) #view textarea,body:not(.module-dashboard) #modal input,body:not(.module-dashboard) #modal select,body:not(.module-dashboard) #modal textarea{min-height:40px;border:1px solid #cfd8e2!important;border-radius:7px!important;background:var(--vc-card)!important;color:var(--vc-ink)!important;box-shadow:none!important}
body:not(.module-dashboard) #view input:focus,body:not(.module-dashboard) #view select:focus,body:not(.module-dashboard) #view textarea:focus{outline:0!important;border-color:#2782ce!important;box-shadow:0 0 0 3px #2782ce1b!important}
body:not(.module-dashboard) #view table{border-collapse:separate!important;border-spacing:0!important;background:var(--vc-card)!important}
body:not(.module-dashboard) #view th{background:#f0f4f8!important;color:#526174!important;font-size:11px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.35px!important;border-bottom:1px solid var(--vc-line)!important}
html[data-sl-theme="dark"] body:not(.module-dashboard) #view th{background:#2b3948!important;color:#d1dbe5!important}
body:not(.module-dashboard) #view td{border-bottom:1px solid var(--vc-line)!important;color:var(--vc-ink)!important;font-size:13px!important}
body:not(.module-dashboard) #modal .dialog,body:not(.module-dashboard) #modal .dialoghead{background:var(--vc-card)!important;color:var(--vc-ink)!important;border-color:var(--vc-line)!important}
body:not(.module-dashboard) #modal .dialog{border-radius:11px!important;box-shadow:0 14px 42px #10243a30!important}
body:not(.module-dashboard) #modal .dialoghead{border-bottom:1px solid var(--vc-line)!important}
body:not(.module-dashboard) .mobile-nav{background:var(--vc-card)!important;border-top:1px solid var(--vc-line)!important}
body:not(.module-dashboard) .mobile-nav button.active{color:#1976c9!important}
@media(max-width:760px){body:not(.module-dashboard) .content{padding:13px!important}body:not(.module-dashboard) .main>.top{padding:0 14px!important}body:not(.module-dashboard) #view .card{padding:13px!important}}
`;
const st=document.createElement("style");st.id="sl-classic-workspace-v1";st.textContent=css;document.head.appendChild(st);
})();