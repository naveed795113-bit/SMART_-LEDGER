/* SmartLedger v44.0 — app-wide adaptive text contrast.
   Chooses readable foregrounds from the rendered surface behind each text node,
   so white text is not left on white cards and dark text is not left on dark panels. */
(function(){
  "use strict";
  const STYLE_ID="smartledger-v44-global-contrast";
  const css=`
    html[data-sl-theme="light"]{--sl-v44-fallback:#17212b;--sl-v44-muted:#465463}
    html[data-sl-theme="dark"]{--sl-v44-fallback:#f5f7fa;--sl-v44-muted:#c4ced8}
    body.theme-light :is(input,select,textarea){color:#17212b!important;-webkit-text-fill-color:#17212b!important}
    body.theme-dark :is(input,select,textarea){color:#f5f7fa!important;-webkit-text-fill-color:#f5f7fa!important}
    body.theme-light :is(input,textarea)::placeholder{color:#687686!important;opacity:1}
    body.theme-dark :is(input,textarea)::placeholder{color:#b8c4cf!important;opacity:1}
    body.theme-light option{background:#fff;color:#17212b}
    body.theme-dark option{background:#151d25;color:#f5f7fa}
  `;
  let style=document.getElementById(STYLE_ID);
  if(!style){style=document.createElement("style");style.id=STYLE_ID;document.head.appendChild(style)}
  style.textContent=css;

  function rgba(value){
    if(!value||value==="transparent")return null;
    const m=value.match(/rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/i);
    if(!m)return null;
    let a=m[4]===undefined?1:parseFloat(m[4]);
    if(m[4]&&m[4].includes("%"))a/=100;
    return {r:+m[1],g:+m[2],b:+m[3],a};
  }
  function blend(fg,bg){
    if(!fg)return bg;
    if(!bg)return {r:255,g:255,b:255,a:1};
    const a=fg.a;
    return {r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a),a:1};
  }
  function luminance(c){
    const f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
  }
  function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
  const WHITE={r:255,g:255,b:255,a:1},BLACK={r:0,g:0,b:0,a:1};
  function backgroundFor(el){
    let node=el,bg=null;
    while(node&&node!==document.documentElement){
      const cs=getComputedStyle(node);
      const own=rgba(cs.backgroundColor);
      if(own&&own.a>.01)bg=blend(own,bg);
      if(cs.backgroundImage&&cs.backgroundImage!=="none"){
        const match=cs.backgroundImage.match(/rgba?\([^)]*\)/i);
        const gradientColor=match&&rgba(match[0]);
        if(gradientColor){bg=blend(gradientColor,bg);break}
      }
      if(bg&&bg.a>=.98)break;
      node=node.parentElement;
    }
    if(!bg||bg.a<.98){
      const dark=document.documentElement.dataset.slTheme==="dark";
      return dark?{r:24,g:31,b:39,a:1}:{r:255,g:255,b:255,a:1};
    }
    return bg;
  }
  function textColorFor(el,bg){
    const current=rgba(getComputedStyle(el).color)||BLACK;
    if(ratio(current,bg)>=4.5)return null;
    return ratio(BLACK,bg)>=ratio(WHITE,bg)?"#101820":"#ffffff";
  }
  function isExcluded(el){
    if(!el||!el.tagName)return true;
    const tag=el.tagName.toLowerCase();
    return /^(script|style|noscript|input|select|textarea|option|svg|path|canvas|img|video|audio|iframe)$/.test(tag)
      ||el.closest("[data-no-auto-contrast],svg,canvas");
  }
  function apply(){
    if(!document.body)return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const parents=new Set();
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(!node.nodeValue||!node.nodeValue.trim())continue;
      const el=node.parentElement;
      if(!isExcluded(el))parents.add(el);
    }
    parents.forEach(el=>{
      const bg=backgroundFor(el);
      const chosen=textColorFor(el,bg);
      if(chosen)el.style.setProperty("color",chosen,"important");
    });
    document.querySelectorAll("input,select,textarea").forEach(el=>{
      const dark=document.documentElement.dataset.slTheme==="dark";
      const color=dark?"#f5f7fa":"#17212b";
      el.style.setProperty("color",color,"important");
      el.style.setProperty("-webkit-text-fill-color",color,"important");
    });
  }
  let queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    Promise.resolve().then(()=>{queued=false;apply()});
  }
  const prevApply=window.applyTheme;
  window.applyTheme=function(){if(typeof prevApply==="function")prevApply();schedule()};
  const prevSet=window.setTheme;
  window.setTheme=function(mode){if(typeof prevSet==="function")prevSet(mode);schedule()};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  const observer=new MutationObserver(records=>{
    if(records.some(r=>r.type==="childList"||r.attributeName==="class"))schedule();
  });
  if(document.body)observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  window.__SMARTLEDGER_V44_CONTRAST__={version:"44.0.0",refresh:apply};
})();