/* SmartLedger v48.0 — More workspace dark/light surface correction.
   The More launcher uses platinum surfaces in Light Mode and graphite surfaces
   in Dark Mode. Child pages retain their own module palettes; v47 handles text
   contrast across every child page and dynamically-rendered subsection. */
(function(){
 "use strict";
 const ID="smartledger-v48-more-theme";
 const css=`
 body.theme-dark.module-more #view{
  background:linear-gradient(140deg,#252a30 0%,#171c22 100%)!important;
  color:#fff!important
 }
 body.theme-dark.module-more .top{
  background:linear-gradient(120deg,#252b32,#171c22)!important;
  color:#fff!important;border-bottom:1px solid #46505a!important
 }
 body.theme-dark.module-more .top strong{color:#fff!important}
 body.theme-dark.module-more #view .more-link,
 body.theme-dark.module-more #view .card,
 body.theme-dark.module-more #view .quick button,
 body.theme-dark.module-more #view .section-quick button,
 body.theme-dark.module-more #view .dialog,
 body.theme-dark.module-more #view .tablewrap{
  background:linear-gradient(145deg,#343b44,#252c34)!important;
  color:#fff!important;border:1px solid #505b66!important;
  box-shadow:inset 1px 1px 1px #ffffff18,0 7px 17px #00000035!important
 }
 body.theme-dark.module-more #view .more-link b,
 body.theme-dark.module-more #view .more-link small,
 body.theme-dark.module-more #view .more-arrow,
 body.theme-dark.module-more #view h1,
 body.theme-dark.module-more #view h2,
 body.theme-dark.module-more #view h3,
 body.theme-dark.module-more #view p,
 body.theme-dark.module-more #view .muted,
 body.theme-dark.module-more #view .statlabel,
 body.theme-dark.module-more #view .stat{color:#fff!important}
 body.theme-dark.module-more #view .more-icon{
  background:linear-gradient(145deg,#4b5662,#333d47)!important;
  color:#fff!important;border:1px solid #606d79!important
 }
 body.theme-dark.module-more #view .btn:not(.primary):not(.danger):not(.soft){
  background:#343c45!important;color:#fff!important;border-color:#58636e!important
 }
 body.theme-dark.module-more #view .btn.primary{
  background:linear-gradient(145deg,#687582,#414c58)!important;
  color:#fff!important;border-color:#65717d!important
 }
 body.theme-dark.module-more #view .field label{color:#fff!important}
 body.theme-dark.module-more #view .field input,
 body.theme-dark.module-more #view .field select,
 body.theme-dark.module-more #view .field textarea,
 body.theme-dark.module-more #view .search{
  background:#20262d!important;color:#fff!important;
  border-color:#596570!important
 }
 body.theme-dark.module-more #view .badge{
  background:#596673!important;color:#fff!important
 }
 body.theme-dark.module-more .mobile-nav{
  background:linear-gradient(120deg,#252b32,#171c22)!important;
  border-color:#46505a!important
 }
 body.theme-dark.module-more .mobile-nav button,
 body.theme-dark.module-more .mobile-nav button.active{color:#fff!important}
 body.theme-dark.module-more .mobile-nav button.active .mi{
  background:#46515d!important;color:#fff!important
 }
 `;
 let style=document.getElementById(ID);
 if(!style){style=document.createElement("style");style.id=ID;document.head.appendChild(style)}
 style.textContent=css;
 const refresh=()=>{const api=window.__SMARTLEDGER_V47_THEME_TEXT__;if(api&&typeof api.refresh==="function")api.refresh()};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
 else refresh();
 const observer=new MutationObserver(refresh);
 if(document.body)observer.observe(document.body,{attributes:true,attributeFilter:["class"]});
 window.__SMARTLEDGER_V48_MORE_THEME__={version:"48.0.0",refresh};
})();