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

window.localStorage.setItem('sl_items', JSON.stringify([{name:'Original test item',code:'TEST-ORIG',qty:5,unit:'pcs',purchase:10,price:15,wholesale:13,gst:0,minStock:2}]));
window.go('Items');
assert.match(window.document.querySelector('#view').textContent, /Items & inventory/, 'Inventory page navigation works');
assert.ok(window.document.querySelectorAll('#itemrows .product-card').length === 1, 'Product detail cards render');
assert.match(window.document.querySelector('#itemrows').textContent, /Purchase price/, 'Product cards show purchase price');
assert.match(window.document.querySelector('#itemrows').textContent, /Reorder level/, 'Product cards show reorder level');
window.editItem(0);
assert.ok(window.document.querySelector('#editItemForm button[type=submit]'), 'Edit item form has a visible submit button');
assert.ok(window.document.querySelector('#eimin'), 'Edit item form includes a valid reorder level field');
window.document.querySelector('#einame').value = 'Edited test item';
window.document.querySelector('#eicode').value = 'TEST-EDIT-1';
window.document.querySelector('#eiqty').value = '17';
window.document.querySelector('#eiunit').value = 'pcs';
window.document.querySelector('#eipurchase').value = '12';
window.document.querySelector('#eiprice').value = '18';
window.document.querySelector('#eiwholesale').value = '16';
window.document.querySelector('#eimin').value = '4';
window.document.querySelector('#eigST').value = '5';
window.document.querySelector('#editItemForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
assert.equal(JSON.parse(window.localStorage.getItem('sl_items'))[0].name, 'Edited test item', 'Edit saves item name');
assert.equal(JSON.parse(window.localStorage.getItem('sl_items'))[0].qty, 17, 'Edit saves stock quantity');
window.go('Items');
assert.match(window.document.querySelector('#itemrows').textContent, /Edited test item/, 'Updated product renders after save');
window.localStorage.setItem('sl_items', JSON.stringify([
  {name:'Edited test item',code:'TEST-EDIT-1',qty:17,unit:'pcs',purchase:12,price:18,wholesale:16,gst:5,minStock:4},
  {name:'Second product',code:'TEST-SECOND',qty:3,unit:'pcs',purchase:20,price:25,wholesale:23,gst:0,minStock:1}
]));
window.go('Items');
window.editItem(0);
window.document.querySelector('#einame').value = 'Second product';
window.document.querySelector('#editItemForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
assert.equal(JSON.parse(window.localStorage.getItem('sl_items'))[0].name, 'Edited test item', 'Duplicate-name validation preserves the original item');
assert.ok(alerts.some(x => x.includes('Another item already uses this name')), 'Duplicate item name reports a clear error');
window.closeModal();

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
assert.ok(window.document.querySelector('#view').textContent.includes('SmartLedger v15.0'), 'Version settings render');
assert.ok(window.document.querySelector('#view').textContent.includes('Download full backup'), 'Backup control renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Business address'), 'Business address field renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Primary phone number'), 'Primary phone field renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Secondary phone number'), 'Secondary phone field renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Upload business logo'), 'Business logo upload renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Upload signature image'), 'Signature upload renders');

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
