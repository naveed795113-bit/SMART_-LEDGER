import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1]).filter(s => s.trim());
assert.ok(inlineScripts.length, 'Inline application script exists');
for (const [i, source] of inlineScripts.entries()) new Script(source, { filename: 'index-inline-' + i + '.js' });

const checks = [
  ['release badge', html.includes('SMARTLEDGER v40.9')],
  ['item edit form fix', /function saveEditItem\(e,i\)/.test(html) && /Save Changes/.test(html)],
  ['product card catalogue', /data-item-card/.test(html) && /product-detail-grid/.test(html)],
  ['Business Suite theme uses readable light/dark palette tokens', /--v40-accent:#e2c98e/.test(readFileSync('business-suite-v40.js','utf8')) && /body\.theme-light #view/.test(readFileSync('business-suite-v40.js','utf8')) && /body\.theme-dark #view/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['version constants', html.includes("APP_VERSION='40.9.0'")],
  ['searchable 3D sales product picker', /txn-product-search/.test(html) && /txn-product-option/.test(html) && /function filterTxnProducts\(/.test(html)],
  ['inventory unit conversion catalogue', /UNIT_CATALOG/.test(html) && /function unitFactorForItem\(/.test(html) && /baseUnit/.test(html)],
  ['premium invoice with logo and signature', /invoice-logo/.test(html) && /invoice-signature-image/.test(html) && /amountInWordsINR/.test(html)],
  ['purchase rust and denim palette', /module-purchases\{--module-bg:#a64e32;--module-card:#315a7b/.test(html)],
  ['responsive module layout', /Compact responsive tables/.test(html)],
  ['mobile table cards across modules', /Attach semantic labels/.test(html) && /data-label/.test(html) && /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(html)],
  ['mobile invoice filters and action layout', /sales-filters #salesSearch/.test(html) && /sales-action \.btn/.test(html)],
  ['safe mobile dialogs and viewport fitting', /max-height:calc\(100dvh/.test(html) && /overscroll-behavior:contain/.test(html)],
  ['explicit mobile touch scrolling', /v40.4 — explicit touch scrolling/.test(html) && /overflow-y:scroll/.test(html) && /touch-action:pan-y/.test(html)],
  ['accounting module loaded', html.includes('<script src="./accounting.js"></script>')],
  ['v40 business suite module loaded', html.includes('<script src="./business-suite-v40.js"></script>')],
  ['accounting backup compatibility', html.includes('chartOfAccounts:JSON.parse') && html.includes('accountJournals:JSON.parse') && html.includes('BACKUP_SCHEMA_VERSION=5')],
  ['professional billing balance breakdown', /Last Balance/.test(html) && /Total Balance/.test(html) && /Remaining Balance/.test(html) && /lastBalance,totalBalance,balanceDue/.test(html)],
  ['business profile fields', /Business address/.test(html) && /Primary phone number/.test(html) && /Secondary phone number/.test(html)],
  ['business logo and signature upload', /Upload business logo/.test(html) && /Upload signature image/.test(html)],
  ['business profile backup', /address:localStorage\.bizaddress/.test(html) && /signature:localStorage\.bizsignature/.test(html)],
  ['high visibility typography', /app-wide high-visibility typography/.test(html) && /font-size:16px;line-height:1\.5/.test(html)],
  ['app-wide contrast palette', /v40.7 — Business Suite contrast and theme switching/.test(html) && /--module-ink:#fff/.test(html) && /--module-field-ink/.test(html)],
  ['platinum More workspace', /body\.module-more\{--module-bg:#d5d8dc/.test(html) && /body\.module-more #view \.more-link/.test(html) && /b\.classList\.add\('module-more'\)/.test(html)],
  ['dashboard theme exclusion retained', /if\(page==='Dashboard'\)return;if\(page==='More'\)/.test(html)],
  ['Business Suite inherits light and dark palettes', /body\.theme-light #view/.test(readFileSync('business-suite-v40.js','utf8')) && /body\.theme-dark #view/.test(readFileSync('business-suite-v40.js','utf8')) && /background:var\(--v40-card\)!important/.test(readFileSync('business-suite-v40.js','utf8')) && /color:var\(--v40-text\)!important/.test(readFileSync('business-suite-v40.js','utf8')) && /#view \.v40-table td/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['Business Suite no longer forces global dark mode', !/:root\{--blue:#171b1f/.test(readFileSync('business-suite-v40.js','utf8')) && !/body\{background:var\(--bg\);color:var\(--text\)\}/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['modern accessible theme icons', (html.match(/data-theme-mode=/g)||[]).length===3 && /aria-pressed/.test(html) && /<svg viewBox=\"0 0 24 24\"/.test(html)],
  ['light dark and system theme logic', /function setTheme\(mode\)/.test(html) && /prefers-color-scheme: dark/.test(html) && /document\.documentElement\.style\.colorScheme/.test(html)],
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
assert.ok(sw.includes('smartledger-v40.9'), 'Service worker cache version');
console.log('PASS service worker cache version');
console.log('PASS inline JavaScript syntax (' + inlineScripts.length + ' scripts)');
console.log('TOTAL ' + (checks.length + 2) + ' checks passed');
