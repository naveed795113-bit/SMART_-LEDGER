/* SmartLedger v45.0 — gradient-aware, surface-by-surface text contrast.
   Corrects nested cards and gradient panels independently in Light and Dark mode. */
(function(){
  "use strict";
  const STYLE_ID="smartledger-v45-contrast-runtime";
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
    body.theme-dark :is(.dialog,.modal) :is(input,select,textarea){background:#171d24!important;color:#f5f7fa!important;-webkit-text-fill-color:#f5f7fa!important}
  `;
  let style=document.getElementById(STYLE_ID);
  if(!style){style=document.createElement("style");style.id=STYLE_ID;document.head.appendChild(style)}
  style.textContent=css;

  const BLACK={r:0,g:0,b:0,a:1},WHITE={r:255,g:255,b:255,a:1};
  function parseColor(value){
    if(!value)return null;
    value=value.trim().toLowerCase();
    if(value==="transparent")return {r:0,g:0,b:0,a:0};
    let m=value.match(/^#([0-9a-f]{3,8})$/i);
    if(m){
      let h=m[1];
      if(h.length===3||h.length===4)h=h.split("").map(x=>x+x).join("");
      if(h.length===6||h.length===8)return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length===8?parseInt(h.slice(6,8),16)/255:1};
    }
    m=value.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
    if(m){let a=m[4]===undefined?1:parseFloat(m[4]);if(m[4]&&m[4].includes("%"))a/=100;return {r:+m[1],g:+m[2],b:+m[3],a};}
    return null;
  }
  function blend(fg,bg){
    if(!fg||fg.a<=0)return bg;
    if(!bg)return {r:255,g:255,b:255,a:1};
    const a=fg.a;
    return {r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a),a:1};
  }
  function luminance(c){
    const f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
  }
  function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
  function gradientStops(image){
    if(!image||image==="none")return [];
    const found=[];
    const re=/(#[0-9a-f]{3,8}\b|rgba?\(\s*[\d.]+\s*[, ]+\s*[\d.]+\s*[, ]+\s*[\d.]+(?:\s*[,/]\s*[\d.]+%?)?\s*\))/ig;
    let m;
    while((m=re.exec(image))!==null){const c=parseColor(m[0]);if(c&&c.a>.02)found.push(c);}
    return found;
  }
  function surfaceSamples(el){
    let node=el;
    while(node&&node!==document.documentElement){
      const cs=getComputedStyle(node);
      const bg=parseColor(cs.backgroundColor);
      const stops=gradientStops(cs.backgroundImage);
      if(stops.length){
        let samples=stops.map(c=>blend(c,bg&&bg.a>.02?bg:null));
        if(bg&&bg.a>.02)samples.push(bg);
        return samples;
      }
      if(bg&&bg.a>.02)return [bg];
      node=node.parentElement;
    }
    const dark=document.documentElement.dataset.slTheme==="dark";
    return [dark?{r:27,g:23,b:25,a:1}:{r:255,g:255,b:255,a:1}];
  }
  function minContrast(fg,samples){return Math.min.apply(null,samples.map(bg=>contrast(fg,bg)));}
  function isExcluded(el){
    if(!el||!el.tagName)return true;
    const tag=el.tagName.toLowerCase();
    return /^(script|style|noscript|input|select|textarea|option|svg|path|canvas|img|video|audio|iframe)$/.test(tag)
      ||el.closest("[data-no-auto-contrast],svg,canvas,[contenteditable='true']");
  }
  function apply(){
    if(!document.body)return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const elements=new Set();
    while(walker.nextNode()){
      const n=walker.currentNode;
      if(n.nodeValue&&n.nodeValue.trim()&&!isExcluded(n.parentElement))elements.add(n.parentElement);
    }
    elements.forEach(el=>{
      const samples=surfaceSamples(el);
      const current=parseColor(getComputedStyle(el).color);
      if(current&&minContrast(current,samples)>=4.5)return;
      const blackScore=minContrast(BLACK,samples),whiteScore=minContrast(WHITE,samples);
      el.style.setProperty("color",blackScore>=whiteScore?"#101820":"#ffffff","important");
    });
    const dark=document.documentElement.dataset.slTheme==="dark";
    document.querySelectorAll("input,select,textarea").forEach(el=>{
      const color=dark?"#f5f7fa":"#17212b";
      el.style.setProperty("color",color,"important");
      el.style.setProperty("-webkit-text-fill-color",color,"important");
    });
  }
  let queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply()});
  }
  const previousApply=window.applyTheme;
  window.applyTheme=function(){if(typeof previousApply==="function")previousApply();schedule()};
  const previousSet=window.setTheme;
  window.setTheme=function(mode){if(typeof previousSet==="function")previousSet(mode);schedule()};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
  const observer=new MutationObserver(records=>{
    if(records.some(r=>r.type==="childList"||r.attributeName==="class"||r.attributeName==="data-sl-theme"))schedule();
  });
  if(document.body)observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","data-sl-theme"]});
  const rootObserver=new MutationObserver(schedule);
  rootObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-sl-theme"]});
  window.__SMARTLEDGER_V45_CONTRAST__={version:"45.0.0",refresh:apply,contrastFor:(el)=>minContrast(parseColor(getComputedStyle(el).color)||BLACK,surfaceSamples(el))};
})();
