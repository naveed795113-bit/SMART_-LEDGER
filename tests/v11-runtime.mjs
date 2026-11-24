import { JSDOM, VirtualConsole } from 'jsdom';
import assert from 'node:assert/strict';

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = await JSDOM.fromFile('index.html', {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.matchMedia = () => ({ matches: false, addEventListener() {} });
    window.alert = () => {};
    window.confirm = () => true;
    window.URL.createObjectURL = () => 'blob:test';
    window.URL.revokeObjectURL = () => {};
  }
});
const { window } = dom;
await new Promise(resolve => setTimeout(resolve, 50));
assert.equal(errors.length, 0, 'App boot should not throw: ' + errors.join('; '));
assert.match(window.document.querySelector('#view').textContent, /Business overview/, 'Dashboard renders');
assert.match(window.document.querySelector('#view').textContent, /Sales overview/, 'Dashboard sales graph renders');

window.go('Items');
assert.match(window.document.querySelector('#view').textContent, /Items & inventory/, 'Inventory page navigation works');
assert.ok(window.document.querySelector('#view table'), 'Inventory table renders');
window.go('Sales');
assert.match(window.document.querySelector('#view').textContent, /Sales/, 'Sales page navigation works');
window.go('Purchases');
assert.match(window.document.querySelector('#view').textContent, /Purchases/, 'Purchases page navigation works');
window.go('Reports');
assert.match(window.document.querySelector('#view').textContent, /Reports/, 'Reports page navigation works');
window.go('Ledgers');
assert.match(window.document.querySelector('#view').textContent, /Ledger/i, 'Ledger page navigation works');
window.go('Settings');
assert.match(window.document.querySelector('#view').textContent, /SmartLedger v11\.0/, 'Version settings render');
assert.ok(window.document.querySelector('#view').textContent.includes('Download full backup'), 'Backup control renders');
console.log('PASS app boot');
console.log('PASS dashboard and sales overview graph');
console.log('PASS inventory, sales, purchases, reports and ledger navigation');
console.log('PASS v11.0 settings and backup controls');
console.log('TOTAL 4 runtime groups passed');
dom.window.close();
