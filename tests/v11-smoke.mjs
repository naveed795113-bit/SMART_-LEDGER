import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1]).filter(s => s.trim());
assert.ok(inlineScripts.length, 'Inline application script exists');
for (const [i, source] of inlineScripts.entries()) new Script(source, { filename: 'index-inline-' + i + '.js' });

const checks = [
  ['release badge', /SMARTLEDGER v18\.0/.test(html)],
  ['item edit form fix', /function saveEditItem\(e,i\)/.test(html) && /Save Changes/.test(html)],
  ['product card catalogue', /data-item-card/.test(html) && /product-detail-grid/.test(html)],
  ['charcoal champagne theme', /v18\.0 — Deep charcoal/.test(html) && /--gold:#d8c18a/.test(html)],
  ['version constants', /APP_VERSION=['"]17.2.0['"]/.test(html)],
  ['professional billing balance breakdown', /Last Balance/.test(html) && /Total Balance/.test(html) && /Remaining Balance/.test(html) && /lastBalance,totalBalance,balanceDue/.test(html)],
  ['business profile fields', /Business address/.test(html) && /Primary phone number/.test(html) && /Secondary phone number/.test(html)],
  ['business logo and signature upload', /Upload business logo/.test(html) && /Upload signature image/.test(html)],
  ['business profile backup', /address:localStorage\.bizaddress/.test(html) && /signature:localStorage\.bizsignature/.test(html)],
  ['high visibility typography', /app-wide high-visibility typography/.test(html) && /font-size:16px;line-height:1\.5/.test(html)],
  ['dashboard renderer', /function render\(\)/.test(html)],
  ['inventory page', /function listItems\(\)/.test(html)],
  ['sales and purchases', /function transactionForm\(k\)/.test(html)],
  ['professional sales overview', /function filterSalesInvoices\(\)/.test(html) && /Top selling items/.test(html)],
  ['professional printable invoice', /TAX INVOICE/.test(html) && /function printInvoice\(\)/.test(html)],
  ['select or type customer', /salesCustomerList/.test(html) && /customers.push\(\{name:partyName/.test(html)],
  ['reports', /function reports\(\)/.test(html)],
  ['ledger', /function ledgerPage\(\)/.test(html)],
  ['AI assistant', /function openAIAssistant\(\)/.test(html)],
  ['CSV/XLS/XLSX import', /['"]xls['"].*['"]xlsx['"].*['"]csv['"]/.test(html)],
  ['sales multi-product and editable invoice descriptions', /Add another product/.test(html) && /txdescription/.test(html) && /description\|\|l\.item/.test(html)],
  ['heading-mapped bulk import and HSN field', /const aliases=\{name:/.test(html) && /hsn sac code/.test(html) && /eihsn/.test(html)],
  ['versioned backup export', /schemaVersion:BACKUP_SCHEMA_VERSION/.test(html)],
  ['restore schema validation', /Unsupported backup version/.test(html)],
  ['pre-restore safety backup', /exportData\(\);\s*keys\.forEach/.test(html)],
  ['legacy backup compatibility', /data\.schemaVersion!==undefined/.test(html)],
  ['theme controls', /function setTheme\(mode\)/.test(html)],
  ['service worker registration', /serviceWorker\.register/.test(html)],
  ['isolated page scrolling', /html,body\{height:100%;min-height:100%;overflow:hidden\}/.test(html) && /overscroll-behavior-y:contain/.test(html)],
  ['responsive show-more section launcher', /function openSectionMore\(\)/.test(html) && /section-more/.test(html)],
  ['item insights page', /function itemInsights\(\)/.test(html)],
  ['batch and expiry register', /function batchExpiryPage\(\)/.test(html)],
  ['sales and purchase returns', /function saveReturn\(e,kind\)/.test(html)],
  ['item barcode scanner', /function scanBarcodeFor\(target\)/.test(html)],
  ['v13 backup registers', /batches:'sl_batches'.*salesReturns:'sl_sales_returns'.*purchaseReturns:'sl_purchase_returns'/.test(html)]
];
for (const [name, ok] of checks) {
  assert.ok(ok, 'Missing or changed required feature: ' + name);
  console.log('PASS ' + name);
}
const sw = readFileSync('sw.js', 'utf8');
assert.match(sw, /smartledger-v18\.0/, 'Service worker cache version');
console.log('PASS service worker cache version');
console.log('PASS inline JavaScript syntax (' + inlineScripts.length + ' scripts)');
console.log('TOTAL ' + (checks.length + 2) + ' checks passed');
