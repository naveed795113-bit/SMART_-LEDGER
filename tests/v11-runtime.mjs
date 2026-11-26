import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import assert from 'node:assert/strict';

const errors = [];
const alerts = [];
let prefersDark = false;
const appearanceListeners = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(readFileSync('index.html', 'utf8'), {
  url: 'https://smartledger.test/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.matchMedia = query => ({ matches: query.includes('prefers-color-scheme: dark') ? prefersDark : false, addEventListener: (event, fn) => appearanceListeners.push(fn), addListener: fn => appearanceListeners.push(fn) });
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
const themeButtons = window.document.querySelectorAll('.theme-switch button[data-theme-mode]');
assert.equal(themeButtons.length, 3, 'Three modern display mode controls render');
window.setTheme('light');
assert.ok(window.document.body.classList.contains('theme-light'), 'Light mode applies light body theme');
assert.equal(window.document.querySelector('[data-theme-mode="light"]').getAttribute('aria-pressed'), 'true', 'Light mode indicator updates');
window.setTheme('dark');
assert.ok(window.document.body.classList.contains('theme-dark'), 'Dark mode applies dark body theme');
assert.equal(window.document.querySelector('[data-theme-mode="dark"]').getAttribute('aria-pressed'), 'true', 'Dark mode indicator updates');
window.go('Items');
window.setTheme('light');
assert.ok(window.document.body.classList.contains('theme-light'), 'Light mode works inside an app section');
window.setTheme('dark');
assert.ok(window.document.body.classList.contains('theme-dark'), 'Dark mode works inside an app section');
window.setTheme('system');
assert.ok(window.document.body.classList.contains('theme-light'), 'System mode follows light device preference');
prefersDark = true; appearanceListeners.forEach(fn => fn());
assert.ok(window.document.body.classList.contains('theme-dark'), 'System mode responds to device switching to dark');
prefersDark = false; appearanceListeners.forEach(fn => fn());
assert.ok(window.document.body.classList.contains('theme-light'), 'System mode responds to device switching to light');
window.setTheme('light');

window.localStorage.setItem('sl_items', JSON.stringify([{name:'Original test item',code:'TEST-ORIG',qty:5,unit:'pcs',purchase:10,price:15,wholesale:13,gst:0,minStock:2}]));
window.go('Items');
assert.match(window.document.querySelector('#view').textContent, /Items & inventory/, 'Inventory page navigation works');
assert.ok(window.document.querySelectorAll('#itemrows .product-card').length === 1, 'Product detail cards render');
assert.match(window.document.querySelector('#itemrows').textContent, /Purchase price/, 'Product cards show purchase price');
assert.match(window.document.querySelector('#itemrows').textContent, /Reorder level/, 'Product cards show reorder level');
window.localStorage.setItem('sl_batches', JSON.stringify([{id:'RENAME-BATCH',item:'Original test item',batchNo:'OLD-NAME-BATCH',remaining:5,qtyReceived:5}]));
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
assert.ok(JSON.parse(window.localStorage.getItem('sl_items'))[0].aliases.includes('Original test item'), 'Renamed item retains its previous name for historical returns');
assert.equal(JSON.parse(window.localStorage.getItem('sl_batches'))[0].item, 'Edited test item', 'Renaming an item updates its batch records');
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
window.localStorage.setItem('sl_customers', JSON.stringify([{name:'Billing Test Customer',opening:120,phone:'999'}]));
window.localStorage.setItem('sl_sales', JSON.stringify([{id:100,date:'2026-11-01',invoice:'OLD-100',party:'Billing Test Customer',total:50,paid:10}]));
window.localStorage.setItem('sl_payments', JSON.stringify([]));
window.localStorage.setItem('sl_items', JSON.stringify([{name:'Billing Test Item',code:'BILL-1',qty:10,unit:'pcs',purchase:10,price:18,wholesale:15,gst:0,minStock:2}]));
window.transactionForm('sales');
window.addTxnLine();
const billingItem = window.document.querySelector('.txitem');
billingItem.value = '0';
window.txnRate(billingItem);
window.document.querySelector('.txqty').value = '2';
window.document.querySelector('#tparty').value = 'Billing Test Customer';
window.document.querySelector('#tpaid').value = '5';
window.updateTxnTotals();
assert.match(window.document.querySelector('#txnLastBalance').textContent, /160/, 'Billing shows previous customer balance including opening balance and earlier invoices');
assert.match(window.document.querySelector('#txnTotalBalance').textContent, /196/, 'Total balance adds current invoice to previous balance');
assert.match(window.document.querySelector('#txnRemainingBalance').textContent, /191/, 'Remaining balance subtracts amount paid');
window.document.querySelector('#modalbody form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
const savedBilling = JSON.parse(window.localStorage.getItem('sl_sales')).at(-1);
console.log('DEBUG_BILLING', JSON.stringify(savedBilling), 'salesCount', JSON.parse(window.localStorage.getItem('sl_sales')).length, 'lines', JSON.stringify(window.readTxnLines?.()), 'saveFn', String(window.saveTransaction).slice(0,180));
console.log('DEBUG_FORM', window.document.querySelector('#modalbody form')?.getAttribute('onsubmit'), 'alerts', JSON.stringify(alerts), 'invoice', window.document.querySelector('#tinvoice')?.value, 'party', window.document.querySelector('#tparty')?.value, 'paid', window.document.querySelector('#tpaid')?.value, 'total', window.document.querySelector('#txnTotal')?.textContent); console.log('DEBUG_ERRORS', JSON.stringify(errors), 'formOnsubmit', String(window.document.querySelector('#modalbody form')?.onsubmit));
assert.equal(savedBilling.lastBalance, 160, 'Saved invoice records the previous balance');
assert.equal(savedBilling.totalBalance, 196, 'Saved invoice records total balance');
assert.equal(savedBilling.balanceDue, 191, 'Saved invoice records remaining balance');
assert.match(window.document.querySelector('#invoicepaper').textContent, /Last Balance/, 'Invoice preview includes previous balance');
assert.match(window.document.querySelector('#invoicepaper').textContent, /Total Balance/, 'Invoice preview includes total balance');
assert.match(window.document.querySelector('#invoicepaper').textContent, /Remaining Balance/, 'Invoice preview includes remaining balance');
window.closeModal();
const customersBeforeDuplicate = JSON.parse(window.localStorage.getItem('sl_customers'));
window.transactionForm('sales');
window.addTxnLine();
const duplicateItem = window.document.querySelector('.txitem');
duplicateItem.value = '0';
window.txnRate(duplicateItem);
window.document.querySelector('.txqty').value = '1';
window.document.querySelector('#tparty').value = 'Customer Must Not Be Created';
window.document.querySelector('#tinvoice').value = 'OLD-100';
window.document.querySelector('#tpaid').value = '0';
window.document.querySelector('#modalbody form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_customers')), customersBeforeDuplicate, 'Duplicate invoice rejection must not create a stray customer');
window.closeModal();

window.localStorage.setItem('sl_batches', JSON.stringify([{id:'B-ATOMIC',item:'Billing Test Item',batchNo:'B-1',remaining:8,qtyReceived:8}]));
window.transactionForm('sales');
window.addTxnLine();
const atomicItem = window.document.querySelector('.txitem');
atomicItem.value = '0';
window.txnRate(atomicItem);
window.document.querySelector('.txqty').value = '1';
window.document.querySelector('#tparty').value = 'Atomic Failure Customer';
window.document.querySelector('#tinvoice').value = 'FAIL-ATOMIC-1';
window.document.querySelector('#tpaid').value = '0';
const originalStorageSet = window.Storage.prototype.setItem;
let failSalesWrite = true;
window.Storage.prototype.setItem = function(key, value) {
  if (key === 'sl_sales' && failSalesWrite) {
    failSalesWrite = false;
    throw new Error('simulated storage quota');
  }
  return originalStorageSet.call(this, key, value);
};
window.document.querySelector('#modalbody form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
window.Storage.prototype.setItem = originalStorageSet;
assert.equal(JSON.parse(window.localStorage.getItem('sl_items'))[0].qty, 8, 'Failed transaction restores inventory quantity');
assert.equal(JSON.parse(window.localStorage.getItem('sl_batches'))[0].remaining, 8, 'Failed transaction restores batch allocation');
assert.equal(JSON.parse(window.localStorage.getItem('sl_sales')).length, 2, 'Failed transaction does not append a sale');
assert.ok(!JSON.parse(window.localStorage.getItem('sl_customers')).some(x => x.name === 'Atomic Failure Customer'), 'Failed transaction does not create a customer');
window.closeModal();
window.closeModal();
window.go('Purchases');
assert.match(window.document.querySelector('#view').textContent, /New purchase/, 'Purchases page navigation works');
window.go('Reports');
assert.match(window.document.querySelector('#view').textContent, /Reports/, 'Reports page navigation works');
window.go('Ledgers');
assert.match(window.document.querySelector('#view').textContent, /Ledger/i, 'Ledger page navigation works');
window.go('Batch & Expiry');
assert.match(window.document.querySelector('#view').textContent, /Batch & expiry/, 'Batch and expiry page renders');
window.go('More');
assert.ok(window.document.body.classList.contains('module-more'), 'More page receives dedicated platinum theme class');
assert.match(window.document.querySelector('#view').textContent, /More tools/, 'More tools page renders');
window.go('Settings');
assert.ok(window.document.querySelector('#view').textContent.includes('SmartLedger v69.0'), 'Version settings render');
assert.ok(window.document.querySelector('#view').textContent.includes('Download full backup'), 'Backup control renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Business address'), 'Business address field renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Primary phone number'), 'Primary phone field renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Secondary phone number'), 'Secondary phone field renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Upload business logo'), 'Business logo upload renders');
assert.ok(window.document.querySelector('#view').textContent.includes('Upload signature image'), 'Signature upload renders');


/* v48: More launcher and its linked child pages retain readable theme contrast. */
window.go('More');
window.eval(readFileSync('theme-v48-more-theme.js', 'utf8'));
await wait(40);
assert.ok(window.document.body.classList.contains('module-more'), 'More launcher keeps its dedicated theme scope');
assert.ok(window.document.getElementById('smartledger-v48-more-theme'), 'More dark/light surface theme loads');
window.setTheme('dark');
await wait(50);
assert.ok(window.document.querySelector('#view .more-link'), 'More launcher cards render in dark mode');
assert.ok(window.document.getElementById('smartledger-v48-more-theme').textContent.includes('body.theme-dark.module-more') && window.document.getElementById('smartledger-v48-more-theme').textContent.includes('color:#fff'), 'More dark-mode stylesheet uses white text on graphite surfaces');
window.setTheme('light');
await wait(50);
assert.ok([...window.document.querySelectorAll('style')].some(s=>s.textContent.includes('body.module-more #view .more-link b') && s.textContent.includes('color:#252c33')), 'More light-mode stylesheet uses graphite text on platinum surfaces');
const moreChildPages = ['Customers','Accounts','Suppliers','Expenses','Cash & Bank','Ledgers','Stock Alerts','Tax Reports','Reports','Stock Summary','Item Insights','Settings'];
for (const childPage of moreChildPages) {
  window.go(childPage);
  await wait(35);
  const heading = window.document.querySelector('#view h1, #view h2');
  assert.ok(heading, childPage + ' child section renders a heading');
  window.setTheme('dark');
  await wait(15);
  assert.ok(window.document.body.classList.contains('theme-dark'), childPage + ' opens in dark mode');
  window.setTheme('light');
  await wait(15);
  assert.ok(window.document.body.classList.contains('theme-light'), childPage + ' opens in light mode');
}
window.setTheme('light');
window.go('More');
await wait(35);
console.log('PASS v48 More launcher dark/light surfaces and linked child-section text contrast');

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

window.localStorage.setItem('sl_items', JSON.stringify([{ name: 'pre-failure-item' }]));
window.localStorage.setItem('sl_customers', JSON.stringify([{ name: 'pre-failure-customer' }]));
window.localStorage.setItem('bizname', 'Original Shop');
const quotaBackup = new window.File([JSON.stringify({
  app: 'SmartLedger', schemaVersion: 5,
  items: [{ name: 'partial-write-item' }],
  customers: [{ name: 'partial-write-customer' }]
})], 'quota-test.json', { type: 'application/json' });
const originalSetItem = window.Storage.prototype.setItem;
let failCustomerWrite = true;
window.Storage.prototype.setItem = function(key, value) {
  if (key === 'sl_customers' && failCustomerWrite) {
    failCustomerWrite = false;
    throw new Error('simulated storage quota');
  }
  return originalSetItem.call(this, key, value);
};
window.restoreData({ files: [quotaBackup], value: 'quota-test.json' });
await wait(50);
window.Storage.prototype.setItem = originalSetItem;
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_items')), [{ name: 'pre-failure-item' }], 'Failed restore rolls back item records already written');
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_customers')), [{ name: 'pre-failure-customer' }], 'Failed restore preserves customer records');
assert.equal(window.localStorage.getItem('bizname'), 'Original Shop', 'Failed restore preserves business profile');
assert.ok(alerts.some(x => x.includes('Existing data was rolled back')), 'Failed restore reports successful rollback');

window.localStorage.setItem('sl_payments', JSON.stringify([]));
window.localStorage.setItem('sl_cash', JSON.stringify([]));
window.paymentForm();
window.document.querySelector('#paydate').value = '2026-11-26';
window.document.querySelector('#payparty').value = 'Billing Test Customer';
window.document.querySelector('#payamount').value = '10';
const paymentSetItem = window.Storage.prototype.setItem;
let failPaymentCash = true;
window.Storage.prototype.setItem = function(key, value) {
  if (key === 'sl_cash' && failPaymentCash) { failPaymentCash = false; throw new Error('simulated storage quota'); }
  return paymentSetItem.call(this, key, value);
};
window.document.querySelector('#modalbody form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
window.Storage.prototype.setItem = paymentSetItem;
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_payments')), [], 'Failed payment save does not leave a payment without its cash entry');
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_cash')), [], 'Failed payment save restores the cash book');
window.closeModal();

window.localStorage.setItem('sl_expenses', JSON.stringify([]));
window.expenseForm();
window.document.querySelector('#edate').value = '2026-11-26';
window.document.querySelector('#eamount').value = '25';
const expenseSetItem = window.Storage.prototype.setItem;
let failExpenseCash = true;
window.Storage.prototype.setItem = function(key, value) {
  if (key === 'sl_cash' && failExpenseCash) { failExpenseCash = false; throw new Error('simulated storage quota'); }
  return expenseSetItem.call(this, key, value);
};
window.document.querySelector('#modalbody form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
window.Storage.prototype.setItem = expenseSetItem;
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_expenses')), [], 'Failed expense save does not leave an expense without its cash entry');
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_cash')), [], 'Failed expense save restores the cash book');
window.closeModal();
window.localStorage.setItem('sl_items', JSON.stringify([{name:'Adjustment Item',qty:10,unit:'pcs',purchase:1,price:2}]));
window.localStorage.setItem('sl_adjustments', JSON.stringify([]));
window.localStorage.setItem('sl_batches', JSON.stringify([{id:'ADJ-BATCH',item:'Adjustment Item',remaining:10,qtyReceived:10}]));
window.adjustForm(0);
window.document.querySelector('#adjqty').value = '2';
const adjustmentSetItem = window.Storage.prototype.setItem;
let failAdjustmentLog = true;
window.Storage.prototype.setItem = function(key, value) {
  if (key === 'sl_adjustments' && failAdjustmentLog) { failAdjustmentLog = false; throw new Error('simulated storage quota'); }
  return adjustmentSetItem.call(this, key, value);
};
window.document.querySelector('#modalbody form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
window.Storage.prototype.setItem = adjustmentSetItem;
assert.equal(JSON.parse(window.localStorage.getItem('sl_items'))[0].qty, 10, 'Failed stock adjustment restores item quantity');
assert.deepEqual(JSON.parse(window.localStorage.getItem('sl_adjustments')), [], 'Failed stock adjustment does not create an unlogged stock change');
assert.equal(JSON.parse(window.localStorage.getItem('sl_batches'))[0].remaining, 10, 'Failed stock adjustment restores the expiry batch quantity');
window.closeModal();

console.log('PASS app boot');
console.log('PASS dashboard and sales overview graph');
console.log('PASS v16 live billing balances, saved invoice values and printed invoice breakdown');
console.log('PASS inventory, show-more launcher, item insights, sales, purchases, reports and ledger navigation');
console.log('PASS v11.0 settings and backup controls');
console.log('PASS responsive layout breakpoints and isolated content scrolling');
console.log('PASS duplicate invoice and atomic transaction rollback');
console.log('PASS valid backup restore and business profile');
console.log('PASS invalid backup rejection without data loss');
console.log('PASS atomic backup restore rollback on storage failure');
console.log('PASS payment and expense ledger rollback on storage failure');
console.log('PASS stock adjustment rollback on storage failure');
console.log('TOTAL 8 runtime groups passed');
dom.window.close();
