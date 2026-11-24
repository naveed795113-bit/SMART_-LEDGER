import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import assert from 'node:assert/strict';

const errors = [];
const alerts = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(readFileSync('index.html', 'utf8'), {
  url: 'https://smartledger.test/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.matchMedia = () => ({ matches: false, addEventListener() {} });
    window.alert = message => alerts.push(String(message));
    window.confirm = () => true;
    window.URL.createObjectURL = () => 'blob:test';
    window.URL.revokeObjectURL = () => {};
    window.HTMLAnchorElement.prototype.click = function () {};
  }
});
const { window } = dom;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await wait(50);
assert.equal(errors.length, 0, 'App boot should not throw: ' + errors.join('; '));
assert.match(window.document.querySelector('#view').textContent, /Business overview/, 'Dashboard renders');
assert.match(window.document.querySelector('#view').textContent, /Sales overview/, 'Dashboard sales graph renders');

window.go('Items');
assert.match(window.document.querySelector('#view').textContent, /Items & inventory/, 'Inventory page navigation works');
assert.ok(window.document.querySelector('#view table'), 'Inventory table renders');
window.go('Sales');
assert.match(window.document.querySelector('#view').textContent, /Sales/, 'Sales page navigation works');
window.go('Purchases');
assert.match(window.document.querySelector('#view').textContent, /New purchase/, 'Purchases page navigation works');
window.go('Reports');
assert.match(window.document.querySelector('#view').textContent, /Reports/, 'Reports page navigation works');
window.go('Ledgers');
assert.match(window.document.querySelector('#view').textContent, /Ledger/i, 'Ledger page navigation works');
window.go('Settings');
assert.match(window.document.querySelector('#view').textContent, /SmartLedger v11\\.0/, 'Version settings render');
assert.ok(window.document.querySelector('#view').textContent.includes('Download full backup'), 'Backup control renders');

const css = [...window.document.querySelectorAll('style')].map(x => x.textContent).join('\\n');
assert.match(css, /@media\\s*\\(max-width:\\s*850px\\)/, 'Tablet/mobile responsive layout rules exist');
assert.match(css, /@media\\s*\\(max-width:\\s*520px\\)/, 'Small-phone responsive layout rules exist');

window.localStorage.setItem('sl_items', JSON.stringify([{ name: 'before-restore' }]));
const backup = {
  app: 'SmartLedger', appVersion: '11.0.0', schemaVersion: 2,
  items: [{ name: 'restored-item' }], customers: [], suppliers: [],
  sales: [], purchases: [], expenses: [], cash: [], payments: [], adjustments: [],
  profile: { name: 'Test Shop', phone: '000', gstin: '' }
};
const file = new window.File([JSON.stringify(backup)], 'smartledger-test.json', { type: 'application/json' });
window.restoreData({ files: [file], value: 'smartledger-test.json' });
await wait(50);
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_items')), [{ name: 'restored-item' }], 'Valid backup restores item records');
assert.equal(window.localStorage.getItem('bizname'), 'Test Shop', 'Valid backup restores business profile');

const preserved = window.localStorage.getItem('sl_items');
const invalid = new window.File([JSON.stringify({ app: 'OtherApp' })], 'invalid.json', { type: 'application/json' });
window.restoreData({ files: [invalid], value: 'invalid.json' });
await wait(30);
assert.equal(window.localStorage.getItem('sl_items'), preserved, 'Invalid backup must not change existing records');
assert.ok(alerts.some(x => x.includes('different application')), 'Invalid backup reports a clear error');

console.log('PASS app boot');
console.log('PASS dashboard and sales overview graph');
console.log('PASS inventory, sales, purchases, reports and ledger navigation');
console.log('PASS v11.0 settings and backup controls');
console.log('PASS responsive layout breakpoints');
console.log('PASS valid backup restore and business profile');
console.log('PASS invalid backup rejection without data loss');
console.log('TOTAL 7 runtime groups passed');
dom.window.close();
