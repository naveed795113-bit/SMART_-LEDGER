/* SmartLedger v46.0 — complete element-level contrast pass.
   Covers nested mini-sections, dynamic panels, labels, table cells, controls,
   SVG text, and pseudo-element text. Dashboard visuals are intentionally excluded. */
(function(){
 "use strict";
 const ID="smartledger-v46-complete-contrast";
 const css=`
 html[data-sl-theme="light"]{color-scheme:light}
 html[data-sl-theme="dark"]{color-scheme:dark}
 body.theme-light :is(input,select,textarea){color:#17212b!important;-webkit-text-fill-color:#17212b!important}
 body.theme-dark :is(input,select,textarea){color:#f5f7fa!important;-webkit-text-fill-color:#f5f7fa!important}
 body.theme-light :is(input,textarea)::placeholder{color:#596777!important;opacity:1}
 body.theme-dark :is(input,textarea)::placeholder{color:#c4ced8!important;opacity:1}
 body.theme-light option{background:#fff;color:#17212b}
 body.theme-dark option{background:#171d24;color:#f5f7fa}
 body.theme-light :is(.dialog,.modal) :is(input,select,textarea){background:#fff!important;color:#17212b!important;-webkit-text-fill-color:#17212b!important}
 body.theme-dark :is(.dialog,.modal) :is(input,select,textarea){background:#171d24!important;color:#f5f7fa!important;-webkit-text-fill-color:#f5f7fa!important}\n [style*="--sl-pseudo-contrast"]::before,[style*="--sl-pseudo-contrast"]::after{color:var(--sl-pseudo-contrast)!important}
 `;
 let style=document.getElementById(ID);
 if(!style){style=document.createElement("style");style.id=ID;document.head.appendChild(style)}
 style.textContent=css;
 const BLACK={r:16,g:24,b:32,a:1},WHITE={r:255,g:255,b:255,a:1};
 const parse=s=>{
  if(!s)return null;s=s.trim().toLowerCase();
  if(s==="transparent")return {r:0,g:0,b:0,a:0};
  let m=s.match(/^#([0-9a-f]{3,8})$/i);
  if(m){let h=m[1];if(h.length===3||h.length===4)h=[...h].map(x=>x+x).join("");if(h.length===6||h.length===8)return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length===8?parseInt(h.slice(6,8),16)/255:1}}
  m=s.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if(m){let a=m[4]===undefined?1:parseFloat(m[4]);if(m[4]&&m[4].includes("%"))a/=100;return {r:+m[1],g:+m[2],b:+m[3],a}}
  return null;
 };
 const mix=(top,bottom)=>{if(!top||top.a<=0)return bottom;if(!bottom)return top;let a=top.a;return {r:top.r*a+bottom.r*(1-a),g:top.g*a+bottom.g*(1-a),b:top.b*a+bottom.b*(1-a),a:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const ratio=(a,b)=>{let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const stops=s=>{if(!s||s==="none")return [];let out=[],re=/(#[0-9a-f]{3,8}\b|rgba?\(\s*[\d.]+\s*[, ]+\s*[\d.]+\s*[, ]+\s*[\d.]+(?:\s*[,/]\s*[\d.]+%?)?\s*\))/ig,m;while((m=re.exec(s))){let c=parse(m[0]);if(c&&c.a>.01)out.push(c)}return out};
 function samples(el){
  let chain=[],n=el;
  while(n&&n.nodeType===1){chain.push(n);if(n===document.documentElement)break;n=n.parentElement}
  chain.reverse();
  let bases=[document.body&&document.body.classList.contains("theme-dark")?{r:24,g:27,b:32,a:1}:{r:255,g:255,b:255,a:1}];
  for(const node of chain){
   const cs=getComputedStyle(node),bg=parse(cs.backgroundColor),gs=stops(cs.backgroundImage);
   if(gs.length){let next=[];for(const under of bases)for(const g of gs)next.push(mix(g,under));bases=next}
   if(bg&&bg.a>.01)bases=bases.map(under=>mix(bg,under));
  }
  return bases.length?bases:[WHITE];
 }
 const score=(fg,bgs)=>Math.min(...bgs.map(bg=>ratio(fg,bg)));
 function excluded(el){
  if(!el||!el.tagName)return true;
  if(el.closest("[data-no-auto-contrast],.invoice-paper,.pdf-report"))return true;
  return /^(script|style|noscript|input|select|textarea|option|canvas|img|video|audio|iframe)$/.test(el.tagName.toLowerCase());
 }
 function dashboardOnly(el){return ![...document.body.classList].some(c=>c.startsWith("module-"))||!!el.closest("#dashboard,[data-page-view='Dashboard'],.dashboard-overview")||document.body.classList.contains("module-dashboard")}
 function hasOwnText(el){return [...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim())}
 function visible(el){const s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden"&&s.opacity!=="0"}
 function correct(el){
  if(excluded(el)||dashboardOnly(el)||!visible(el))return;
  const cs=getComputedStyle(el),fg=parse(cs.color);
  if(!fg)return;
  const bgs=samples(el);
  if(score(fg,bgs)>=4.5)return;
  el.style.setProperty("color",score(BLACK,bgs)>=score(WHITE,bgs)?"#101820":"#ffffff","important");
 }
 function apply(){
  if(!document.body)return;
  const all=document.body.querySelectorAll("*");
  all.forEach(el=>{
   if(hasOwnText(el)||el.matches("button[aria-label],a[aria-label],label[for],summary,[role='button'],svg text"))correct(el);
   if(el.matches("input,select,textarea")){const dark=document.body.classList.contains("theme-dark");const c=dark?"#f5f7fa":"#17212b";el.style.setProperty("color",c,"important");el.style.setProperty("-webkit-text-fill-color",c,"important")}
   for(const pseudo of ["::before","::after"]){const p=getComputedStyle(el,pseudo);if(p.content&&p.content!=="none"&&p.content!=="normal"){const fg=parse(p.color);if(fg&&score(fg,samples(el))<4.5)el.style.setProperty("--sl-pseudo-contrast",score(BLACK,samples(el))>=score(WHITE,samples(el))?"#101820":"#ffffff")}}
  });
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
 const old=window.applyTheme;window.applyTheme=function(){if(typeof old==="function")old();schedule()};
 const oldSet=window.setTheme;window.setTheme=function(m){if(typeof oldSet==="function")oldSet(m);schedule()};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
 const observer=new MutationObserver(records=>{if(records.some(r=>r.type==="childList"||r.type==="attributes"||r.type==="characterData"))schedule()});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","style","hidden","aria-expanded","data-state"]});
 const rootObserver=new MutationObserver(schedule);rootObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-sl-theme"]});
 window.__SMARTLEDGER_V46_CONTRAST__={version:"46.0.0",refresh:apply,contrastFor:el=>score(parse(getComputedStyle(el).color)||BLACK,samples(el))};
})();