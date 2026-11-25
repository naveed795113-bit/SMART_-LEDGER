/* SmartLedger mandatory Google sign-in entry screen — premium responsive design (v51.0) */
(function(){
'use strict';
const CLIENT_ID='300668500980-0tnrrbavikc17s598f3dtsh1hj5vo42u.apps.googleusercontent.com';
let ready=false,started=false;
const css=document.createElement('style');
css.textContent=`
#slLoginGate{position:fixed;inset:0;z-index:99999;overflow:auto;display:grid;place-items:center;padding:clamp(14px,3vw,38px);background:radial-gradient(ellipse at 12% 8%,#824c5a 0%,transparent 38%),radial-gradient(ellipse at 88% 92%,#6c3545 0%,transparent 36%),linear-gradient(135deg,#21151b 0%,#39212a 52%,#24151c 100%);color:#21191b;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
#slLoginGate *{box-sizing:border-box}
#slLoginGate .sl-shell{width:min(1040px,100%);min-height:min(650px,calc(100dvh - 36px));display:grid;grid-template-columns:1.04fr .96fr;overflow:hidden;border:1px solid #ffffff35;border-radius:30px;background:#f8f5f1;box-shadow:0 35px 100px #10090db8,0 2px 8px #ffffff20}
#slLoginGate .sl-brand-panel{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:space-between;min-width:0;padding:clamp(28px,5vw,58px);overflow:hidden;background:linear-gradient(150deg,#754452 0%,#532c39 54%,#321d26 100%);color:#fff}
#slLoginGate .sl-brand-panel:before,#slLoginGate .sl-brand-panel:after{content:"";position:absolute;z-index:-1;border:1px solid #ffffff18;border-radius:50%;pointer-events:none}
#slLoginGate .sl-brand-panel:before{width:440px;height:440px;right:-220px;top:-160px;box-shadow:0 0 0 35px #ffffff08,0 0 0 75px #ffffff05}
#slLoginGate .sl-brand-panel:after{width:310px;height:310px;left:-210px;bottom:-170px;box-shadow:0 0 0 30px #ffffff07,0 0 0 65px #ffffff04}
#slLoginGate .sl-brand-top{display:flex;align-items:center;gap:13px}
#slLoginGate .sl-brand-mark{width:48px;height:48px;flex:0 0 48px;display:grid;place-items:center;border-radius:15px;border:1px solid #e8c7b777;background:linear-gradient(145deg,#d3a6a0,#8b5360 70%);box-shadow:inset 1px 1px 3px #ffffffa0,0 8px 22px #24101888}
#slLoginGate .sl-brand-mark svg{width:28px;height:28px}
#slLoginGate .sl-brand-name{font-size:17px;font-weight:800;letter-spacing:.25px;color:#fff}
#slLoginGate .sl-brand-kicker{margin-top:3px;font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#e7cbd0}
#slLoginGate .sl-brand-copy{max-width:440px;margin:50px 0}
#slLoginGate .sl-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid #ffffff35;border-radius:30px;background:#ffffff0e;color:#f3dfe2;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
#slLoginGate .sl-eyebrow:before{content:"";width:6px;height:6px;border-radius:50%;background:#e4c18a;box-shadow:0 0 12px #e4c18a}
#slLoginGate .sl-brand-copy h1{margin:22px 0 14px;max-width:430px;color:#fff;font-size:clamp(34px,4.5vw,51px);font-weight:750;letter-spacing:-1.8px;line-height:1.08}
#slLoginGate .sl-brand-copy h1 span{color:#e5c49a}
#slLoginGate .sl-brand-desc{max-width:370px;margin:0;color:#eadde0;font-size:14px;line-height:1.8}
#slLoginGate .sl-feature-list{display:grid;gap:13px;margin:30px 0 0;padding:0;list-style:none}
#slLoginGate .sl-feature-list li{display:flex;align-items:center;gap:11px;color:#f7ecee;font-size:12px;font-weight:600}
#slLoginGate .sl-feature-icon{width:27px;height:27px;flex:0 0 27px;display:grid;place-items:center;border:1px solid #ffffff30;border-radius:9px;background:#ffffff12;color:#f0d3b0;font-size:14px}
#slLoginGate .sl-brand-bottom{display:flex;justify-content:space-between;gap:12px;align-items:center;color:#d6bdc3;font-size:10px}
#slLoginGate .sl-brand-bottom span:last-child{color:#e8cda7;letter-spacing:1px;text-transform:uppercase;font-weight:700}
#slLoginGate .sl-auth-panel{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:clamp(28px,5vw,58px);background:linear-gradient(155deg,#fcfaf7,#f2eee8);text-align:center}
#slLoginGate .sl-auth-inner{width:min(360px,100%)}
#slLoginGate .sl-mobile-mark{display:none}
#slLoginGate .sl-auth-kicker{margin:0 0 12px;color:#966a70;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
#slLoginGate .sl-auth-panel h2{margin:0 0 10px;color:#292023;font-size:clamp(27px,3vw,34px);font-weight:800;letter-spacing:-1px;line-height:1.15}
#slLoginGate .sl-auth-desc{margin:0 auto 32px;max-width:300px;color:#71666a;font-size:13px;line-height:1.7}
#slLoginGate .sl-signin-box{padding:23px 18px 19px;border:1px solid #e6ddd6;border-radius:19px;background:#fff;box-shadow:0 12px 32px #38232b0c,inset 0 1px #fff}
#slLoginGate .sl-signin-label{margin:0 0 15px;color:#51464a;font-size:12px;font-weight:750}
#slLoginGate #slLoginGoogle{display:flex;justify-content:center;align-items:center;min-height:46px;margin:0 auto}
#slLoginGate #slLoginGoogle iframe{max-width:100%}
#slLoginGate .sl-login-status{min-height:34px;margin:13px 0 0;color:#796b70;font-size:11px;line-height:1.55}
#slLoginGate .sl-account-options{display:grid;gap:12px;margin-top:16px;font-size:12px}
#slLoginGate .sl-account-options a{color:#70404e;font-weight:750;text-decoration:none}
#slLoginGate .sl-account-options a:hover{text-decoration:underline}
#slLoginGate .sl-account-options button{border:1px solid #e5ddd7;border-radius:12px;padding:11px;background:#f4f0ec;color:#8b8081;font-weight:650}
#slLoginGate .sl-phone-note{margin:8px 0 0;color:#8b8081;font-size:10px;line-height:1.5}
#slLoginGate .sl-trust-row{display:flex;justify-content:center;align-items:center;gap:7px;margin:20px 0 0;color:#75696c;font-size:10px;line-height:1.5}
#slLoginGate .sl-trust-row svg{width:14px;height:14px;flex:0 0 14px;color:#8a5963}
#slLoginGate .sl-auth-footer{margin:34px 0 0;padding-top:18px;border-top:1px solid #e5ddd7;color:#8b8081;font-size:10px;line-height:1.7}
#slLoginGate .sl-auth-footer strong{color:#5d4d51;font-weight:750}
#slLoginGate .sl-login-spinner{display:inline-block;width:13px;height:13px;border:2px solid #8b596455;border-top-color:#8b5964;border-radius:50%;animation:slspin .8s linear infinite;vertical-align:-2px;margin-right:7px}
@keyframes slspin{to{transform:rotate(360deg)}}
@media(max-width:720px){
 #slLoginGate{padding:0;display:block;background:linear-gradient(160deg,#512d39,#291a21);min-height:100dvh}
 #slLoginGate .sl-shell{width:100%;min-height:100dvh;display:flex;flex-direction:column;border:0;border-radius:0;box-shadow:none;background:#f8f5f1}
 #slLoginGate .sl-brand-panel{flex:0 0 auto;min-height:270px;padding:25px 25px 30px}
 #slLoginGate .sl-brand-copy{margin:35px 0 0}
 #slLoginGate .sl-brand-copy h1{font-size:35px;letter-spacing:-1.2px;margin:16px 0 9px}
 #slLoginGate .sl-brand-desc{font-size:12px;line-height:1.6;max-width:340px}
 #slLoginGate .sl-feature-list{display:none}
 #slLoginGate .sl-brand-bottom{margin-top:26px}
 #slLoginGate .sl-auth-panel{flex:1;padding:34px 25px 25px;justify-content:flex-start}
 #slLoginGate .sl-auth-inner{width:min(390px,100%)}
 #slLoginGate .sl-auth-panel h2{font-size:29px}
 #slLoginGate .sl-auth-desc{margin-bottom:25px}
 #slLoginGate .sl-auth-footer{margin-top:28px}
}
@media(max-width:380px){
 #slLoginGate .sl-brand-panel{min-height:245px;padding:21px 20px 24px}
 #slLoginGate .sl-brand-copy{margin-top:27px}
 #slLoginGate .sl-brand-copy h1{font-size:31px}
 #slLoginGate .sl-auth-panel{padding:29px 19px 22px}
 #slLoginGate .sl-signin-box{padding:20px 12px 16px}
}
@media(prefers-reduced-motion:reduce){#slLoginGate *{animation:none!important;scroll-behavior:auto!important}}
`;
document.head.appendChild(css);
const gate=document.createElement('main');
gate.id='slLoginGate';
gate.setAttribute('role','dialog');
gate.setAttribute('aria-modal','true');
gate.setAttribute('aria-label','SmartLedger sign in');
gate.innerHTML=`
<div class="sl-shell">
 <section class="sl-brand-panel" aria-label="SmartLedger introduction">
  <div class="sl-brand-top">
   <div class="sl-brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 24V8h4.5l9 11V8H25v16h-4.3l-9.2-11.2V24H7Z" fill="white"/><path d="M5 27h22" stroke="#F0D6BA" stroke-width="2" stroke-linecap="round"/></svg></div>
   <div><div class="sl-brand-name">SmartLedger</div><div class="sl-brand-kicker">Business management</div></div>
  </div>
  <div class="sl-brand-copy">
   <div class="sl-eyebrow">Your business, in control</div>
   <h1>Run your shop.<br><span>Know your numbers.</span></h1>
   <p class="sl-brand-desc">A clearer way to manage daily sales, stock, customers and accounts — all in one workspace.</p>
   <ul class="sl-feature-list">
    <li><span class="sl-feature-icon">↗</span>Sales, purchases and inventory</li>
    <li><span class="sl-feature-icon">▤</span>Customer, supplier and financial ledgers</li>
    <li><span class="sl-feature-icon">☁</span>Google Drive backup and recovery</li>
   </ul>
  </div>
  <div class="sl-brand-bottom"><span>Built for everyday business</span><span>Simple · Clear · Connected</span></div>
 </section>
 <section class="sl-auth-panel" aria-label="Sign in">
  <div class="sl-auth-inner">
   <p class="sl-auth-kicker">Welcome to SmartLedger</p>
   <h2>Sign in to continue</h2>
   <p class="sl-auth-desc">Use your Google account to securely identify your workspace and get started.</p>
   <div class="sl-signin-box">
    <p class="sl-signin-label">Continue with your Google account</p>
    <div id="slLoginGoogle"></div>
    <p id="slLoginStatus" class="sl-login-status" role="status" aria-live="polite">Loading Google sign-in…</p>
    <div class="sl-account-options">
     <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer">Create a new Google account</a>
     <button type="button" disabled aria-disabled="true" title="Phone OTP sign-in requires secure backend setup">Phone number login · Coming soon</button>
    </div>
    <p class="sl-phone-note">Phone sign-in will be enabled after secure OTP verification is configured.</p>
   </div>
   <div class="sl-trust-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg><span>Sign-in is handled by Google. Your password is never shared with SmartLedger.</span></div>
   <div class="sl-auth-footer"><strong>SmartLedger</strong> · Your business. Your numbers. Your growth.<br>Business data is stored in this browser unless you create a Google Drive backup.</div>
  </div>
 </section>
</div>`;
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
 if(target)google.accounts.id.renderButton(target,{theme:'outline',size:'large',shape:'pill',text:'signin_with',logo_alignment:'left',width:300});
 message('Choose your Google account to continue.');
}
function load(){
 if(window.google&&google.accounts){init();return}
 if(document.getElementById('sl-login-gis'))return;
 message('Loading Google sign-in…');
 const s=document.createElement('script');s.id='sl-login-gis';s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;
 s.onload=()=>{init();message('Choose your Google account to continue.')};
 s.onerror=()=>message('Google sign-in could not load. Check your internet connection and reload.');
 document.head.appendChild(s);
}
function savedProfile(){
 try{const p=JSON.parse(localStorage.getItem('sl_google_profile')||'null');return p&&p.email&&p.sub?p:null}catch(e){return null}
}
function start(){
 if(started)return;started=true;
 const profile=savedProfile();
 if(profile){
  window.smartLedgerSignedIn=true;
  window.dispatchEvent(new CustomEvent('smartledger:login',{detail:profile}));
  return;
 }
 document.body.appendChild(gate);load();
}
document.addEventListener('DOMContentLoaded',start,{once:true});
if(document.readyState!=='loading')start();
window.smartLedgerLogout=function(){
 window.smartLedgerSignedIn=false;
 try{localStorage.removeItem('sl_google_profile')}catch(e){}
 if(window.google&&google.accounts&&google.accounts.id)google.accounts.id.disableAutoSelect();
 location.reload();
};
})();