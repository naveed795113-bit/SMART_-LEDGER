/* SmartLedger v47.0 — theme- and surface-aware black/white typography.
   Dark surfaces use white text; light/white surfaces use black text.
   Only text styling is adjusted; dashboard colours and layout remain untouched. */
(function(){
 "use strict";
 const ID="smartledger-v47-theme-text";
 const BLACK="#101010",WHITE="#ffffff";
 const css=`
 html[data-sl-theme="light"]{color-scheme:light}
 html[data-sl-theme="dark"]{color-scheme:dark}
 body.theme-light :is(input,select,textarea){color:#101010!important;-webkit-text-fill-color:#101010!important}
 body.theme-dark :is(input,select,textarea){color:#ffffff!important;-webkit-text-fill-color:#ffffff!important}
 body.theme-light :is(input,textarea)::placeholder{color:#454545!important;opacity:1}
 body.theme-dark :is(input,textarea)::placeholder{color:#e2e2e2!important;opacity:1}
 body.theme-light option{background:#fff;color:#101010}
 body.theme-dark option{background:#171717;color:#fff}
 body.theme-light :is(.dialog,.modal) :is(input,select,textarea){background:#fff!important;color:#101010!important;-webkit-text-fill-color:#101010!important}
 body.theme-dark :is(.dialog,.modal) :is(input,select,textarea){background:#171717!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
 `;
 let style=document.getElementById(ID);
 if(!style){style=document.createElement("style");style.id=ID;document.head.appendChild(style)}
 style.textContent=css;
 function parse(s){
  if(!s)return null;s=s.trim().toLowerCase();
  if(s==="transparent")return {r:0,g:0,b:0,a:0};
  let m=s.match(/^#([0-9a-f]{3,8})$/i);
  if(m){let h=m[1];if(h.length===3||h.length===4)h=[...h].map(x=>x+x).join("");if(h.length===6||h.length===8)return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length===8?parseInt(h.slice(6,8),16)/255:1}}
  m=s.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if(m){let a=m[4]===undefined?1:parseFloat(m[4]);if(m[4]&&m[4].includes("%"))a/=100;return {r:+m[1],g:+m[2],b:+m[3],a}}
  return null;
 }
 const mix=(top,bottom)=>{if(!top||top.a<=0)return bottom;if(!bottom)return top;let a=top.a;return {r:top.r*a+bottom.r*(1-a),g:top.g*a+bottom.g*(1-a),b:top.b*a+bottom.b*(1-a),a:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const ratio=(a,b)=>{let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 function gradientStops(s){
  if(!s||s==="none")return [];
  const out=[],re=/(#[0-9a-f]{3,8}\b|rgba?\(\s*[\d.]+\s*[, ]+\s*[\d.]+\s*[, ]+\s*[\d.]+(?:\s*[,/]\s*[\d.]+%?)?\s*\))/ig;let m;
  while((m=re.exec(s))){const c=parse(m[0]);if(c&&c.a>.01)out.push(c)}
  return out;
 }
 function backgrounds(el){
  const chain=[];for(let n=el;n&&n.nodeType===1;n=n.parentElement){chain.push(n);if(n===document.documentElement)break}
  chain.reverse();
  const dark=document.body&&document.body.classList.contains("theme-dark");
  let layers=[dark?{r:24,g:24,b:24,a:1}:{r:255,g:255,b:255,a:1}];
  for(const node of chain){
   const cs=getComputedStyle(node),bg=parse(cs.backgroundColor),stops=gradientStops(cs.backgroundImage);
   if(stops.length){const next=[];for(const under of layers)for(const top of stops)next.push(mix(top,under));layers=next}
   if(bg&&bg.a>.01)layers=layers.map(under=>mix(bg,under));
  }
  return layers.length?layers:[{r:255,g:255,b:255,a:1}];
 }
 function chosen(bgs){
  const black={r:16,g:16,b:16,a:1},white={r:255,g:255,b:255,a:1};
  const b= Math.min(...bgs.map(bg=>ratio(black,bg)));
  const w= Math.min(...bgs.map(bg=>ratio(white,bg)));
  return w>b?WHITE:BLACK;
 }
 function excluded(el){
  if(!el||!el.tagName)return true;
  if(el.closest("[data-no-auto-contrast],.invoice-paper,.pdf-report"))return true;
  return /^(script|style|noscript|input|select|textarea|option|canvas|img|video|audio|iframe)$/.test(el.tagName.toLowerCase());
 }
 function ownText(el){return [...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim())}
 function visible(el){const s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden"&&s.opacity!=="0"}
 function apply(){
  if(!document.body)return;
  document.body.querySelectorAll("*").forEach(el=>{
   if(excluded(el)||!visible(el))return;
   const has=ownText(el)||el.matches("button[aria-label],a[aria-label],label[for],summary,[role='button'],svg text");
   if(has){
    const color=chosen(backgrounds(el));
    el.style.setProperty("color",color,"important");
    if(el.matches("svg text"))el.style.setProperty("fill",color,"important");
   }
   if(el.matches("input,select,textarea")){
    const color=chosen(backgrounds(el));
    el.style.setProperty("color",color,"important");
    el.style.setProperty("-webkit-text-fill-color",color,"important");
   }
  });
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
 const oldApply=window.applyTheme;window.applyTheme=function(){if(typeof oldApply==="function")oldApply();schedule()};
 const oldSet=window.setTheme;window.setTheme=function(m){if(typeof oldSet==="function")oldSet(m);schedule()};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
 const observer=new MutationObserver(records=>{if(records.some(r=>r.type==="childList"||r.type==="attributes"||r.type==="characterData"))schedule()});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","style","hidden","aria-expanded","data-state"]});
 const rootObserver=new MutationObserver(schedule);rootObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-sl-theme"]});
 window.__SMARTLEDGER_V47_THEME_TEXT__={version:"47.0.0",refresh:apply,contrastFor:el=>{const bg=backgrounds(el),fg=parse(getComputedStyle(el).color)||{r:16,g:16,b:16,a:1};return Math.min(...bg.map(x=>ratio(fg,x)))}};
})();
