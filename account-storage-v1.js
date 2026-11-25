/* SmartLedger account-isolated browser storage v1.
 * Local device separation only; this is not cloud sync or server-side security.
 */
(function(){
  "use strict";
  const raw=window.localStorage;
  const ACTIVE="__sl_active_uid";
  const OWNER="__sl_legacy_owner_uid";
  const PREFIX="__sl_uid__";
  const GLOBAL=new Set([ACTIVE,OWNER,"sl_google_profile","smartledger_logout_pending","slTheme"]);
  let uid="";
  try{uid=raw.getItem(ACTIVE)||"";}catch(e){}
  const scoped=k=>PREFIX+encodeURIComponent(uid)+"__"+k;
  // Firebase Auth browserLocalPersistence must remain available before login.
  // Keep Firebase SDK keys global while scoping only SmartLedger business data.
  const isFirebaseKey=k=>String(k).startsWith("firebase:");
  const globalKeys=()=>[...Array.from(GLOBAL).filter(k=>raw.getItem(k)!==null),...Array.from({length:raw.length},(_,i)=>raw.key(i)).filter(k=>k&&isFirebaseKey(k))];
  const keysForUser=()=>{const out=[];for(let i=0;i<raw.length;i++){const k=raw.key(i);if(k&&k.startsWith(scoped("")))out.push(k.slice(scoped("").length));}return out;};
  function migrate(userId){
    const owner=raw.getItem(OWNER);
    if(!owner){
      const legacy=[];
      for(let i=0;i<raw.length;i++){const k=raw.key(i);if(k&&!GLOBAL.has(k)&&!k.startsWith(PREFIX))legacy.push(k);}
      legacy.forEach(k=>{const v=raw.getItem(k);if(v!==null)raw.setItem(PREFIX+encodeURIComponent(userId)+"__"+k,v);});
      legacy.forEach(k=>raw.removeItem(k));
      raw.setItem(OWNER,userId);
    }
    uid=userId;raw.setItem(ACTIVE,userId);
  }
  function storageKey(k){const key=String(k);return GLOBAL.has(key)||isFirebaseKey(key)?key:(uid?scoped(key):null);}
  const proxy=new Proxy(raw,{
    get(target,prop){
      if(prop==="getItem")return k=>{const key=storageKey(k);return key===null?null:raw.getItem(key);};
      if(prop==="setItem")return (k,v)=>{const key=storageKey(k);if(key!==null)raw.setItem(key,String(v));};
      if(prop==="removeItem")return k=>{const key=storageKey(k);if(key!==null)raw.removeItem(key);};
      if(prop==="clear")return ()=>{if(uid)keysForUser().forEach(k=>raw.removeItem(scoped(k)));};
      if(prop==="key")return i=>{const visible=[...keysForUser(),...globalKeys()];return visible[i]??null;};
      if(prop==="length")return keysForUser().length+globalKeys().length;
      if(prop==="toString")return ()=>"[object Storage]";
      if(typeof prop==="string"&&(GLOBAL.has(prop)||isFirebaseKey(prop)))return raw.getItem(prop)??undefined;
      if(typeof prop==="string"&&!prop.startsWith("__")){const key=storageKey(prop);return key===null?undefined:(raw.getItem(key)??undefined);}
      const value=Reflect.get(target,prop,target);return typeof value==="function"?value.bind(target):value;
    },
    set(target,prop,value){
      if(typeof prop!=="string")return false;
      const key=storageKey(prop);if(key!==null)raw.setItem(key,String(value));
      return true;
    },
    deleteProperty(target,prop){
      if(typeof prop!=="string")return true;
      const key=storageKey(prop);if(key!==null)raw.removeItem(key);
      return true;
    },
    ownKeys(){
      return [...new Set([...keysForUser(),...globalKeys()])];
    },
    getOwnPropertyDescriptor(target,prop){
      if(typeof prop==="string"&&(GLOBAL.has(prop)||isFirebaseKey(prop)||keysForUser().includes(prop)))return {configurable:true,enumerable:true,writable:true,value:proxy[prop]};
      return undefined;
    }
  });
  try{Object.defineProperty(window,"localStorage",{configurable:true,enumerable:true,value:proxy});}
  catch(e){console.error("SmartLedger account storage could not initialize:",e);return;}
  window.addEventListener("smartledger:login",event=>{
    const next=event&&event.detail&&event.detail.sub;
    if(!next)return;
    if(uid===next)return;
    migrate(String(next));
    location.reload();
  });
  window.addEventListener("smartledger:logout",()=>{
    if(!uid)return;
    uid="";raw.removeItem(ACTIVE);location.reload();
  });
  window.smartLedgerStorage={getActiveAccount:()=>uid||null};
})();