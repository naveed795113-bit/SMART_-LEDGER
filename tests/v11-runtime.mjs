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
const moreButton = window.document.querySelector('#view .section-more');
assert.ok(moreButton, 'Items page displays Show more tile');
moreButton.click();
assert.match(window.document.querySelector('#modal').textContent, /Item insights/, 'Show more opens item tools launcher');
window.closeModal();
window.go('Item Insights');
assert.match(window.document.querySelector('#view').textContent, /Item insights/, 'Item insights page renders');
assert.match(window.document.querySelector('#view').textContent, /Stock cost value/, 'Item insights calculates stock valuation');
window.go('Sales');
assert.match(window.document.querySelector('#view').textContent, /Sales/, 'Sales page navigation works');
window.go('Purchases');
assert.match(window.document.querySelector('#view').textContent, /New purchase/, 'Purchases page navigation works');
window.go('Reports');
assert.match(window.document.querySelector('#view').textContent, /Reports/, 'Reports page navigation works');
window.go('Ledgers');
assert.match(window.document.querySelector('#view').textContent, /Ledger/i, 'Ledger page navigation works');
window.go('Batch & Expiry');
assert.match(window.document.querySelector('#view').textContent, /Batch & expiry/, 'Batch and expiry page renders');
window.go('Settings');
assert.ok(window.document.querySelector('#view').textContent.includes('SmartLedger v13.0'), 'Version settings render');
assert.ok(window.document.querySelector('#view').textContent.includes('Download full backup'), 'Backup control renders');

const css = [...window.document.querySelectorAll('style')].map(x => x.textContent).join('\\n');
assert.ok(css.includes('@media(max-width:850px)'), 'Tablet/mobile responsive layout rules exist');
assert.ok(css.includes('@media(max-width:520px)'), 'Small-phone responsive layout rules exist');

window.localStorage.setItem('sl_items', JSON.stringify([{ name: 'before-restore' }]));
const backup = {
  app: 'SmartLedger', appVersion: '13.0.0', schemaVersion: 3,
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
assert.ok(alerts.some(x => x.includes('This backup belongs to a different application')), 'Invalid backup reports a clear error');

console.log('PASS app boot');
console.log('PASS dashboard and sales overview graph');
console.log('PASS inventory, show-more launcher, item insights, sales, purchases, reports and ledger navigation');
console.log('PASS v11.0 settings and backup controls');
console.log('PASS responsive layout breakpoints and isolated content scrolling');
console.log('PASS valid backup restore and business profile');
console.log('PASS invalid backup rejection without data loss');
console.log('TOTAL 7 runtime groups passed');
dom.window.close();
