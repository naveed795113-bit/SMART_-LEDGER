/* SmartLedger Google identity + Drive backup (client-side, v49.0) */
(function(){
'use strict';
const CLIENT_ID='300668500980-0tnrrbavikc17s598f3dtsh1hj5vo42u.apps.googleusercontent.com';
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
const BACKUP_MIME='application/json';
let driveToken=null, tokenClient=null, googleUser=null;
const $id=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function decodeJwt(token){try{return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return null}}
function status(message,kind){const el=$id('slGoogleStatus');if(el){el.textContent=message;el.dataset.kind=kind||'info'}}
function getBackup(){
 const data={app:'SmartLedger',appVersion:'49.0.0',schemaVersion:typeof BACKUP_SCHEMA_VERSION!=='undefined'?BACKUP_SCHEMA_VERSION:5,exportedAt:new Date().toISOString(),chartOfAccounts:JSON.parse(localStorage.getItem('sl_chart_accounts')||'[]'),accountJournals:JSON.parse(localStorage.getItem('sl_account_journals')||'[]'),v40PostingErrors:JSON.parse(localStorage.getItem('sl_v40_posting_errors')||'[]'),profile:{name:localStorage.bizname||'',address:localStorage.bizaddress||'',phone:localStorage.bizphone||'',phone2:localStorage.bizphone2||'',gstin:localStorage.gstin||'',logo:localStorage.bizlogo||'',signature:localStorage.bizsignature||''}};
 if(typeof db!=='undefined')Object.keys(db).forEach(k=>data[k]=typeof get==='function'?get(k):JSON.parse(localStorage.getItem(db[k])||'[]'));
 return data;
}
function paintAccount(){
 const box=$id('slGoogleAccount');if(!box)return;
 box.textContent=googleUser?(googleUser.name||googleUser.email||'Google account connected'):'Not signed in';
 const avatar=$id('slGoogleAvatar');if(avatar){avatar.src=googleUser&&googleUser.picture||'';avatar.hidden=!(googleUser&&googleUser.picture)}
}
function initGoogle(){
 if(!window.google||!google.accounts){status('Google services are still loading. Reload this page and try again.','error');return}
 google.accounts.id.initialize({client_id:CLIENT_ID,callback:function(response){
  const p=decodeJwt(response.credential);if(!p){status('Google sign-in response could not be read.','error');return}
  googleUser={name:p.name||'',email:p.email||'',picture:p.picture||''};
  try{localStorage.setItem('sl_google_profile',JSON.stringify(googleUser))}catch(e){}
  paintAccount();status('Google account identified. Connect Google Drive separately to enable backups.','success');
 }});
 const button=$id('slGoogleSignIn');if(button){button.innerHTML='';google.accounts.id.renderButton(button,{theme:document.body.classList.contains('theme-dark')?'filled_black':'outline',size:'large',shape:'pill',text:'signin_with',width:260})}
 tokenClient=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:DRIVE_SCOPE,callback:function(response){
  if(response.error){driveToken=null;status('Drive connection failed: '+response.error,'error');return}
  driveToken=response.access_token;status('Google Drive connected for this browser session.','success');
  const b=$id('slDriveBackup');if(b)b.disabled=false;
  const r=$id('slDriveRestore');if(r)r.disabled=false;
  if($id('slDriveConnect'))$id('slDriveConnect').textContent='Reconnect Google Drive';
 }});
}
function connectDrive(){
 if(!tokenClient){status('Google services are not ready. Reload the page.','error');return}
 tokenClient.requestAccessToken({prompt:driveToken?'':'consent'});
}
async function driveFetch(url,options){
 const response=await fetch(url,{...options,headers:{...(options&&options.headers||{}),Authorization:'Bearer '+driveToken}});
 if(!response.ok){const t=await response.text();throw new Error('Google Drive error '+response.status+': '+t.slice(0,240))}
 return response;
}
async function backupToDrive(){
 if(!driveToken){connectDrive();status('Approve Google Drive access, then tap Backup to Drive again.','info');return}
 const button=$id('slDriveBackup');if(button){button.disabled=true;button.textContent='Backing up…'}
 try{
  const data=getBackup(),json=JSON.stringify(data),boundary='sl_'+Math.random().toString(36).slice(2);
  const metadata={name:'SmartLedger backup '+new Date().toISOString().replace(/[:.]/g,'-')+'.json',mimeType:BACKUP_MIME,description:'SmartLedger full business data backup'};
  const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: '+BACKUP_MIME+'\r\n\r\n'+json+'\r\n--'+boundary+'--';
  const res=await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,size',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
  const file=await res.json();localStorage.setItem('sl_drive_last_backup',JSON.stringify({id:file.id,name:file.name,createdTime:file.createdTime,size:file.size||json.length}));
  status('Backup completed: '+file.name,'success');renderBackupMeta();
 }catch(e){status(e.message||'Backup failed.','error')}
 finally{if(button){button.disabled=!driveToken;button.textContent='Back up to Google Drive'}}
}
async function listBackups(){
 const q=encodeURIComponent("name contains 'SmartLedger backup' and trashed=false");
 const res=await driveFetch('https://www.googleapis.com/drive/v3/files?q='+q+'&orderBy=createdTime desc&pageSize=50&fields=files(id,name,createdTime,size,mimeType)');
 const data=await res.json();return (data.files||[]).filter(f=>f.mimeType===BACKUP_MIME);
}
async function restoreFromDrive(){
 if(!driveToken){connectDrive();status('Approve Google Drive access, then tap Restore from Drive again.','info');return}
 const button=$id('slDriveRestore');if(button){button.disabled=true;button.textContent='Finding backups…'}
 try{
  const files=await listBackups();if(!files.length){status('No SmartLedger backups found in this Google account.','info');return}
  const latest=files[0];if(!confirm('Restore this backup?\n'+latest.name+'\n\nCurrent data on this device will be replaced. Download a current backup first if needed.'))return;
  const response=await driveFetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(latest.id)+'?alt=media');
  const data=await response.json();
  if(!data||data.app!=='SmartLedger'||!Number.isInteger(data.schemaVersion)||data.schemaVersion<1||data.schemaVersion>(typeof BACKUP_SCHEMA_VERSION!=='undefined'?BACKUP_SCHEMA_VERSION:5))throw new Error('Backup format is invalid or unsupported.');
  if(typeof db==='undefined')throw new Error('SmartLedger storage map is unavailable.');
  const keys=Object.keys(db),optional=['batches','salesReturns','purchaseReturns'];
  if(!keys.filter(k=>!optional.includes(k)).every(k=>Array.isArray(data[k])))throw new Error('Backup is incomplete. No data was changed.');
  if(data.profile&&typeof data.profile==='object'){
   const p=data.profile;localStorage.bizname=p.name||'';localStorage.bizaddress=p.address||'';localStorage.bizphone=p.phone||'';localStorage.bizphone2=p.phone2||'';localStorage.gstin=p.gstin||'';localStorage.bizlogo=p.logo||'';localStorage.bizsignature=p.signature||'';
  }
  keys.forEach(k=>localStorage.setItem(db[k],JSON.stringify(Array.isArray(data[k])?data[k]:[])));
  ['chartOfAccounts','accountJournals'].forEach(k=>{const key=k==='chartOfAccounts'?'sl_chart_accounts':'sl_account_journals';if(Array.isArray(data[k]))localStorage.setItem(key,JSON.stringify(data[k]))});
  if(Array.isArray(data.v40PostingErrors))localStorage.setItem('sl_v40_posting_errors',JSON.stringify(data.v40PostingErrors));
  status('Restore completed from '+latest.name+'. Reloading SmartLedger…','success');setTimeout(()=>location.reload(),900);
 }catch(e){status(e.message||'Restore failed.','error')}
 finally{if(button){button.disabled=!driveToken;button.textContent='Restore latest backup'}}
}
function renderBackupMeta(){
 const el=$id('slGoogleLastBackup');if(!el)return;
 try{const x=JSON.parse(localStorage.getItem('sl_drive_last_backup')||'null');el.textContent=x?'Last backup: '+new Date(x.createdTime).toLocaleString()+' · '+x.name:'No Drive backup recorded on this device.'}catch(e){el.textContent='No Drive backup recorded on this device.'}
}
function mountSettings(){
 if(typeof window.settings!=='function'||window.settings.__slGoogleWrapped)return;
 const original=window.settings;
 const wrapped=function(){
  original();
  const view=$id('view');if(!view||$id('slGooglePanel'))return;
  const profile=(()=>{try{return JSON.parse(localStorage.getItem('sl_google_profile')||'null')}catch(e){return null}})();
  if(profile)googleUser=profile;
  const panel=document.createElement('section');panel.className='section card';panel.id='slGooglePanel';
  panel.innerHTML='<h2>Google account & cloud backup</h2><p class="muted">Connect your Google account, then authorize Drive access. SmartLedger stores backup files in your Drive. Your business records remain on this device until you restore or move them.</p><div class="sl-google-account"><img id="slGoogleAvatar" alt="" hidden><div><b id="slGoogleAccount">Not signed in</b><small>Google account identity</small></div></div><div id="slGoogleSignIn" class="sl-google-button"></div><div class="actions"><button type="button" class="btn" id="slDriveConnect">Connect Google Drive</button><button type="button" class="btn primary" id="slDriveBackup" disabled>Back up to Google Drive</button><button type="button" class="btn" id="slDriveRestore" disabled>Restore latest backup</button></div><p id="slGoogleStatus" class="notice" role="status">Sign in with Google, then connect Drive to authorize backups.</p><small id="slGoogleLastBackup" class="muted"></small><p class="muted sl-google-note">Automatic scheduled backups are not available while this static app is closed. This first version backs up when you request it. Google sign-in here identifies the account in this browser; secure multi-device user sessions require a backend.</p>';
  view.appendChild(panel);
  paintAccount();renderBackupMeta();
  $id('slDriveConnect').addEventListener('click',connectDrive);
  $id('slDriveBackup').addEventListener('click',backupToDrive);
  $id('slDriveRestore').addEventListener('click',restoreFromDrive);
  if(window.google&&google.accounts)initGoogle();
 };
 wrapped.__slGoogleWrapped=true;window.settings=wrapped;
}
function loadGoogle(){
 if(window.google&&google.accounts){mountSettings();return}
 if(document.getElementById('sl-google-identity-script'))return;
 const script=document.createElement('script');script.id='sl-google-identity-script';script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.onload=()=>{mountSettings();if($id('slGoogleSignIn'))initGoogle()};script.onerror=()=>status('Could not load Google Identity Services. Check your internet connection.','error');document.head.appendChild(script);
}
const style=document.createElement('style');style.textContent='#slGooglePanel .sl-google-account{display:flex;align-items:center;gap:12px;margin:14px 0}#slGooglePanel .sl-google-account img{width:42px;height:42px;border-radius:50%;object-fit:cover}#slGooglePanel .sl-google-account small{display:block;color:var(--muted,#777)}#slGooglePanel .sl-google-button{margin:12px 0;min-height:42px}#slGooglePanel .actions{display:flex;flex-wrap:wrap;gap:9px;margin:14px 0}#slGoogleStatus[data-kind=error]{border-color:#b94a48;color:#b94a48}#slGoogleStatus[data-kind=success]{border-color:#32865a}#slGoogleLastBackup{display:block;margin:8px 0;overflow-wrap:anywhere}#slGooglePanel .sl-google-note{font-size:12px;line-height:1.55}';document.head.appendChild(style);
const prior=window.settings;
if(prior)mountSettings();
const originalGo=window.go;
if(typeof originalGo==='function'){window.go=function(page){const r=originalGo.apply(this,arguments);if(page==='Settings')loadGoogle();return r}}
window.addEventListener('load',()=>{mountSettings();if(document.getElementById('slGooglePanel'))loadGoogle()});
window.smartLedgerGoogle={connectDrive,backupToDrive,restoreFromDrive};
})();