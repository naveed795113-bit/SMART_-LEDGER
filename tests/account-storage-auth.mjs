import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor(){ this.data=new Map(); }
  get length(){ return this.data.size; }
  key(i){ return [...this.data.keys()][i] ?? null; }
  getItem(k){ return this.data.has(String(k)) ? this.data.get(String(k)) : null; }
  setItem(k,v){ this.data.set(String(k),String(v)); }
  removeItem(k){ this.data.delete(String(k)); }
  clear(){ this.data.clear(); }
}
const raw = new MemoryStorage();
const firebaseKey = 'firebase:authUser:PUBLIC_API_KEY:[DEFAULT]';
raw.setItem(firebaseKey, JSON.stringify({uid:'firebase-user-1', refreshToken:'keep-me'}));
raw.setItem('sl_items', JSON.stringify([{name:'Legacy item'}]));
const listeners = {};
let reloads = 0;
const window = {
  localStorage: raw,
  addEventListener(name, fn){ listeners[name]=fn; },
  location: { reload(){ reloads++; } }
};
const source = readFileSync('account-storage-v1.js','utf8');
vm.runInNewContext(source,{window,location:window.location,console,encodeURIComponent,Set,Proxy,Object,Array,String});
const storage = window.localStorage;

// Firebase persistence must be readable/writable before and after login.
assert.equal(storage.getItem(firebaseKey), raw.getItem(firebaseKey));
storage.setItem('firebase:pendingRedirect:PUBLIC_API_KEY:[DEFAULT]', 'true');
assert.equal(raw.getItem('firebase:pendingRedirect:PUBLIC_API_KEY:[DEFAULT]'), 'true');

// First login migrates only legacy business data, never Firebase's auth session.
listeners['smartledger:login']({detail:{sub:'firebase-user-1'}});
assert.equal(raw.getItem(firebaseKey)?.includes('refreshToken'), true, 'Firebase auth session remains in native localStorage');
assert.equal(raw.getItem('sl_items'), null, 'Legacy business key is migrated');
assert.equal(storage.getItem('sl_items'), '[{"name":"Legacy item"}]', 'Migrated business data is visible to its owner');
assert.equal(raw.getItem('__sl_active_uid'), 'firebase-user-1');

// Another account cannot see the first account's business records.
listeners['smartledger:logout']();
listeners['smartledger:login']({detail:{sub:'firebase-user-2'}});
assert.equal(storage.getItem('sl_items'), null, 'Second account cannot read first account business data');
assert.equal(raw.getItem(firebaseKey)?.includes('refreshToken'), true, 'Firebase persistence remains independent of account namespace');
assert.equal(reloads, 3, 'Account transitions reload to initialize the correct scoped workspace');
console.log('PASS Firebase auth persistence survives account-scoped storage and migration');
