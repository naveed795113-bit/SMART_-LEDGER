import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { webcrypto } from "node:crypto";
const source=fs.readFileSync(new URL("../smartledger-cloud-v79.js",import.meta.url),"utf8");
const remote=new Map();
let clock=0;
function makeWindow(seed={}){
 const dom=new JSDOM("<!doctype html><body><div id='view'></div><div id='pagetitle'></div><p id='slCloudStatus'></p></body>",{url:"https://smartledger.test/",runScripts:"dangerously"});
 const w=dom.window;
 Object.defineProperty(w,"crypto",{value:webcrypto});
 w.TextEncoder=TextEncoder;
 w.localStorage.setItem("sl_google_profile",JSON.stringify({sub:"owner-user-12345678"}));
 for(const [k,v] of Object.entries(seed))w.localStorage.setItem(k,v);
 w.smartLedgerGetIdToken=async()=>"test-id-token";
 w.render=()=>{};
 w.fetch=async(url,options={})=>{
  const u=new URL(url),path=u.pathname,method=options.method||"GET";
  if(path.endsWith("/branches/main")||/\/branches\/[^/]+$/.test(path)){
   if(method==="GET")return remote.has("branch:"+path)?{ok:true,status:200,json:async()=>remote.get("branch:"+path)}:{ok:false,status:404,json:async()=>({error:{message:"not found"}})};
   if(method==="PATCH"){const doc={name:path,fields:JSON.parse(options.body).fields};remote.set("branch:"+path,doc);return{ok:true,status:200,json:async()=>doc}}
  }
  if(path.endsWith("/records")&&method==="GET")return{ok:true,status:200,json:async()=>({documents:[...remote.values()].filter(x=>x.name?.includes("/records/"))})};
  if(path.includes("/records/")&&method==="PATCH"){const id=path.split("/").pop(),body=JSON.parse(options.body),doc={name:path,fields:body.fields,updateTime:"2026-11-28T00:00:"+(++clock).toString().padStart(2,"0")+"Z"};remote.set("record:"+path,doc);return{ok:true,status:200,json:async()=>doc}}
  return{ok:false,status:404,json:async()=>({error:{message:"unhandled "+method+" "+path}})};
 };
 w.eval(source);
 return{w,dom};
}
const first=makeWindow({sl_items:JSON.stringify([{name:"Rice",qty:20}]),sl_sales:JSON.stringify([{invoice:"S-1",total:500}])});
const pushed=await first.w.smartLedgerCloud.sync();
assert.equal(pushed.uploaded,2,"first device uploads its local records");
assert.equal(remote.size,3,"branch metadata and two record documents exist");
const second=makeWindow();
const pulled=await second.w.smartLedgerCloud.sync();
assert.equal(pulled.downloaded,2,"second device downloads cloud records");
assert.deepEqual(JSON.parse(second.w.localStorage.getItem("sl_items")),[{name:"Rice",qty:20}]);
assert.deepEqual(JSON.parse(second.w.localStorage.getItem("sl_sales")),[{invoice:"S-1",total:500}]);
first.w.localStorage.setItem("sl_sales",JSON.stringify([{invoice:"S-1",total:700}]));
const saleDoc=[...remote.values()].find(x=>x.fields?.recordKey?.stringValue==="sl_sales");
saleDoc.fields.payload.stringValue=JSON.stringify([{invoice:"S-1",total:600}]);
saleDoc.fields.hash.stringValue="remote-concurrent-change";
saleDoc.updateTime="2026-11-28T00:01:00Z";
await assert.rejects(()=>first.w.smartLedgerCloud.sync(),/both this device and cloud changed/,"concurrent edits must stop without overwriting");
first.w.__slCloudConflicts=["sl_sales"];
await first.w.slCloudResolve("local");
assert.equal([...remote.values()].find(x=>x.fields?.recordKey?.stringValue==="sl_sales").fields.payload.stringValue,JSON.stringify([{invoice:"S-1",total:700}]),"explicit keep-local resolution publishes the selected version");
first.dom.window.close();second.dom.window.close();
console.log("v79 cloud sync integration tests passed (upload, download, conflict protection)");
