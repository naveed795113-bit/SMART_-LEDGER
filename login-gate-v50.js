/* SmartLedger mandatory Google sign-in entry screen (v50.0) */
(function(){
'use strict';
const CLIENT_ID='300668500980-0tnrrbavikc17s598f3dtsh1hj5vo42u.apps.googleusercontent.com';
let ready=false,started=false;
const css=document.createElement('style');
css.textContent=`
#slLoginGate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:22px;background:radial-gradient(ellipse at 20% 0%,#87505c 0%,transparent 48%),linear-gradient(145deg,#321923,#542632 58%,#21131a);color:#fff;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}
#slLoginGate *{box-sizing:border-box}
#slLoginGate .sl-login-card{width:min(430px,100%);padding:34px 26px 28px;border:1px solid #a87983;border-radius:26px;background:linear-gradient(145deg,#70404d,#542b38 58%,#43232e);box-shadow:inset 1px 1px 2px #ffffff35,inset -3px -4px 8px #24121a66,0 24px 70px #16090db0;text-align:center}
#slLoginGate .sl-login-mark{width:66px;height:66px;margin:0 auto 18px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(145deg,#bd8992,#672d3c);border:1px solid #d1a9b0;box-shadow:inset 2px 2px 5px #ffffff77,0 9px 22px #1d0d13;color:white;font-size:31px;font-weight:900}
#slLoginGate h1{font-size:27px;letter-spacing:.2px;margin:0 0 8px;color:#fff}
#slLoginGate .sl-login-sub{color:#f0dfe3;font-size:13px;line-height:1.6;margin:0 auto 25px;max-width:300px}
#slLoginGate .sl-login-label{font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#e8cbd1;margin-bottom:12px}
#slLoginGate #slLoginGoogle{display:flex;justify-content:center;min-height:46px;margin:0 auto 15px}
#slLoginGate .sl-login-status{min-height:20px;margin:12px 0 0;color:#f5dfe2;font-size:12px;line-height:1.5}
#slLoginGate .sl-login-foot{margin:23px 0 0;padding-top:16px;border-top:1px solid #a8798355;color:#d8c2c8;font-size:10px;line-height:1.5}
#slLoginGate .sl-login-spinner{display:inline-block;width:14px;height:14px;border:2px solid #ffffff55;border-top-color:#fff;border-radius:50%;animation:slspin .8s linear infinite;vertical-align:-2px;margin-right:7px}
@keyframes slspin{to{transform:rotate(360deg)}}
@media(max-width:420px){#slLoginGate .sl-login-card{padding:30px 19px 24px;border-radius:22px}#slLoginGate h1{font-size:24px}}
`;
document.head.appendChild(css);
const gate=document.createElement('main');
gate.id='slLoginGate';
gate.setAttribute('role','dialog');
gate.setAttribute('aria-modal','true');
gate.setAttribute('aria-label','SmartLedger sign in');
gate.innerHTML='<section class="sl-login-card"><div class="sl-login-mark">S</div><h1>SmartLedger</h1><p class="sl-login-sub">Your business. Your numbers. Your growth.</p><div class="sl-login-label">Secure access</div><div id="slLoginGoogle"></div><p id="slLoginStatus" class="sl-login-status" role="status">Sign in with your Google account to continue.</p><p class="sl-login-foot">Your account is used to identify you in this browser. Business data remains stored on this device unless you back it up to Google Drive.</p></section>';
function message(s){const el=document.getElementById('slLoginStatus');if(el)el.textContent=s}
function decode(token){try{return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return null}}
function unlock(response){
 const p=decode(response.credential||'');
 if(!p||!p.email){message('Google sign-in could not be verified. Please try again.');return}
 const profile={name:p.name||'',email:p.email||'',picture:p.picture||'',sub:p.sub||''};
 try{localStorage.setItem('sl_google_profile',JSON.stringify(profile))}catch(e){}
 window.smartLedgerSignedIn=true;
 gate.remove();
 window.dispatchEvent(new CustomEvent('smartledger:login',{detail:profile}));
}
function init(){
 if(!window.google||!google.accounts||ready)return;
 ready=true;
 google.accounts.id.initialize({client_id:CLIENT_ID,callback:unlock,auto_select:false,cancel_on_tap_outside:false});
 const target=document.getElementById('slLoginGoogle');
 if(target)google.accounts.id.renderButton(target,{theme:'filled_white',size:'large',shape:'pill',text:'signin_with',logo_alignment:'left',width:280});
}
function load(){
 if(window.google&&google.accounts){init();return}
 if(document.getElementById('sl-login-gis'))return;
 message('Loading Google sign-in…');
 const s=document.createElement('script');s.id='sl-login-gis';s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;
 s.onload=()=>{init();message('Sign in with your Google account to continue.')};
 s.onerror=()=>message('Google sign-in could not load. Check your internet connection and reload.');
 document.head.appendChild(s);
}
function start(){if(started)return;started=true;document.body.appendChild(gate);load()}
document.addEventListener('DOMContentLoaded',start,{once:true});
if(document.readyState!=='loading')start();
window.smartLedgerLogout=function(){window.smartLedgerSignedIn=false;location.reload()};
})();