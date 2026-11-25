import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1]).filter(s => s.trim());
assert.ok(inlineScripts.length, 'Inline application script exists');
for (const [i, source] of inlineScripts.entries()) new Script(source, { filename: 'index-inline-' + i + '.js' });

const checks = [
  ['phone password authentication imports Firebase email/password methods', /createUserWithEmailAndPassword/.test(readFileSync('login-gate-v50.js','utf8')) && /signInWithEmailAndPassword/.test(readFileSync('login-gate-v50.js','utf8'))],
  ['free phone password account creation and sign-in controls', /slCreatePhoneAccount/.test(readFileSync('login-gate-v50.js','utf8')) && /slPhonePasswordSignIn/.test(readFileSync('login-gate-v50.js','utf8')) && /function phonePasswordAuth\(createAccount\)/.test(readFileSync('login-gate-v50.js','utf8'))],
  ['phone number normalized into private Firebase account identifier', /function phoneAccountEmail\(rawPhone\)/.test(readFileSync('login-gate-v50.js','utf8')) && /accounts\\.smartledger\\.invalid/.test(readFileSync('login-gate-v50.js','utf8'))],
  ['phone password login warns number is not SMS-verified and recovery is not yet available', /not verified by SMS/.test(readFileSync('login-gate-v50.js','utf8')) && /password recovery is not available/.test(readFileSync('login-gate-v50.js','utf8'))],
  ['authentication v64 loader and service worker cache', /login-gate-v50\\.js\\?v=64/.test(readFileSync('login-gate-loader-v60.js','utf8')) && /smartledger-v63\\.0/.test(readFileSync('sw.js','utf8'))],

  ['release badge', html.includes('SMARTLEDGER v44.0')],
  ['item edit form fix', /function saveEditItem\(e,i\)/.test(html) && /Save Changes/.test(html)],
  ['product card catalogue', /data-item-card/.test(html) && /product-detail-grid/.test(html)],
  ['Business Suite theme uses readable light/dark palette tokens', /--v40-accent:#e2c98e/.test(readFileSync('business-suite-v40.js','utf8')) && /body\.theme-light #view/.test(readFileSync('business-suite-v40.js','utf8')) && /body\.theme-dark #view/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['version constants', html.includes("APP_VERSION='47.0.0'")],
  ['v47 theme-aware typography runtime syntax', new Script(readFileSync('theme-v47-theme-aware-text.js','utf8'), { filename: 'theme-v47-theme-aware-text.js' })],
  ['v47 theme-aware typography loaded and precached', html.includes('theme-v47-theme-aware-text.js') && readFileSync('sw.js','utf8').includes('theme-v47-theme-aware-text.js')],
  ['v47 black text on light surfaces and white text on dark surfaces', readFileSync('theme-v47-theme-aware-text.js','utf8').includes('function chosen(bgs)') && readFileSync('theme-v47-theme-aware-text.js','utf8').includes('const BLACK="#101010",WHITE="#ffffff"') && readFileSync('theme-v47-theme-aware-text.js','utf8').includes('new MutationObserver')],
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

  ['v44 app-wide adaptive contrast runtime JavaScript syntax', new Script(readFileSync('theme-v44-global-contrast.js','utf8'), { filename: 'theme-v44-global-contrast.js' })],
  ['v44 app-wide adaptive contrast runtime loaded and precached', /theme-v44-global-contrast\.js/.test(html) && /theme-v44-global-contrast\.js/.test(readFileSync('sw.js','utf8'))],
  ['v44 contrast checks rendered text against its actual background', /function backgroundFor\(el\)/.test(readFileSync('theme-v44-global-contrast.js','utf8')) && /ratio\(current,bg\)>=4\.5/.test(readFileSync('theme-v44-global-contrast.js','utf8')) && /new MutationObserver/.test(readFileSync('theme-v44-global-contrast.js','utf8'))],
  ['v43 contrast runtime JavaScript syntax', new Script(readFileSync('theme-v43-contrast.js','utf8'), { filename: 'theme-v43-contrast.js' })],
  ['v43 separate light and dark text contrast runtime', /theme-v43-contrast\.js/.test(html) && /html\[data-sl-theme="light"\]/.test(readFileSync('theme-v43-contrast.js','utf8')) && /html\[data-sl-theme="dark"\]/.test(readFileSync('theme-v43-contrast.js','utf8'))],
  ['v43 Business Suite text contrast in both modes', /body\.theme-light #view .*v40-stat/.test(readFileSync('theme-v43-contrast.js','utf8')) && /body\.theme-dark #view .*v40-stat/.test(readFileSync('theme-v43-contrast.js','utf8'))],
  ['v43 independent contrast asset precached', /theme-v43-contrast\.js/.test(readFileSync('sw.js','utf8'))],
  ['modern accessible theme icons', (html.match(/data-theme-mode=/g)||[]).length===3 && /aria-pressed/.test(html) && /<svg viewBox=\"0 0 24 24\"/.test(html)],
  ['light dark and system theme logic', /function setTheme\(mode\)/.test(html) && /prefers-color-scheme: dark/.test(html) && /document\.documentElement\.style\.colorScheme/.test(html)],


  ['v41.1 mobile document scroll removes fixed-height nested scroller', /\.main>\.content\{[^}]*height:auto!important[^}]*overflow:visible!important/s.test(readFileSync('business-suite-v40.js','utf8'))],
  ['v41.1 mini sections expand into page or dialog scroll', /\.txn-product-grid\{[^}]*max-height:none!important[^}]*overflow:visible!important/s.test(readFileSync('business-suite-v40.js','utf8')) && /\.v40-tabs\{[^}]*flex-wrap:wrap!important/s.test(readFileSync('business-suite-v40.js','utf8'))],
  ['v41.1 modal background position is restored', /sl-modal-scroll-top/.test(readFileSync('business-suite-v40.js','utf8')) && /body\.sl-modal-open\{position:fixed!important/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['v41 app-wide scroll owner and section reset', /v41\.0 — one predictable scroll owner/.test(readFileSync('business-suite-v40.js','utf8')) && /window\.go=function\(\)/.test(readFileSync('business-suite-v40.js','utf8')) && /resetWorkspaceScroll/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['v41 modal background lock and dialog-only scrolling', /lockBackground/.test(readFileSync('business-suite-v40.js','utf8')) && /unlockBackground/.test(readFileSync('business-suite-v40.js','utf8')) && /body\.sl-modal-open/.test(readFileSync('business-suite-v40.js','utf8')) && /\.modal\.show \.dialog/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['v41 native mobile document scroll and desktop workspace scroll', /overflow-y:auto!important/.test(readFileSync('business-suite-v40.js','utf8')) && /overflow-y:visible!important/.test(readFileSync('business-suite-v40.js','utf8')) && /touch-action:pan-y/.test(readFileSync('business-suite-v40.js','utf8'))],
  ['v42 theme runtime loaded after app modules', html.includes('<script src="./theme-v42.js"></script>') && /theme-v42.js/.test(readFileSync('sw.js','utf8'))],
  ['v42 theme runtime JavaScript syntax', new Script(readFileSync('theme-v42.js','utf8'), { filename: 'theme-v42.js' })],
  ['v42 explicit light and dark palette tokens', /--sl-page:#f4f6f8/.test(readFileSync('theme-v42.js','utf8')) && /--sl-page:#11171d/.test(readFileSync('theme-v42.js','utf8'))],
  ['v42 module-aware dark palettes and dashboard preservation', readFileSync('theme-v42.js','utf8').includes('body.theme-dark.module-sales #view') && readFileSync('theme-v42.js','utf8').includes('body.theme-dark.module-inventory #view') && /Keep the existing dashboard burgundy overview cards/.test(readFileSync('theme-v42.js','utf8'))],
  ['v42 persisted light dark system mode and OS listener', readFileSync('theme-v42.js','utf8').includes('localStorage.setItem("slTheme"') && /prefers-color-scheme: dark/.test(readFileSync('theme-v42.js','utf8')) && /aria-pressed/.test(readFileSync('theme-v42.js','utf8'))],
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
assert.ok(sw.includes('smartledger-v62.0') && sw.includes('./ai-assistant-v52.js') && html.includes('./ai-assistant-v52.js') && sw.includes('./interaction-fix-v56.js') && html.includes('./interaction-fix-v56.js') && sw.includes('./theme-v42.js') && sw.includes('./theme-v42.js') && sw.includes('./theme-v43-contrast.js') && sw.includes('./theme-v44-global-contrast.js') && sw.includes('./theme-v45-contrast.js') && sw.includes('./theme-v46-complete-contrast.js') && sw.includes('./theme-v47-theme-aware-text.js') && sw.includes('./theme-v48-more-theme.js') && sw.includes('./google-drive-v49.js') && sw.includes('./login-gate-v50.js'), 'Service worker cache version and login assets');
console.log('PASS service worker cache version');
assert.ok(/id="slSidebarLogout"/.test(html) && !/id="slSidebarLogout"[^>]*onclick=/.test(html), 'Sidebar logout uses the shared delegated handler');
assert.ok(/id="slMobileLogout"/.test(html) && !/id="slMobileLogout"[^>]*onclick=/.test(html), 'Mobile logout uses the shared delegated handler');
console.log('PASS shared logout entry points without competing inline handlers');
assert.ok(html.includes('id="slMobileLogout"') && /mobile-logout/.test(html) && /interaction-fix-v56\.js/.test(sw), 'Mobile header logout and touch interaction fix');
console.log('PASS mobile logout and touch interaction fix');
const firebaseLogin = readFileSync('login-gate-v50.js', 'utf8');
assert.ok(firebaseLogin.includes('async function loadFirebaseSdk()') && firebaseLogin.includes('https://esm.sh/firebase@11.10.0/app?bundle') && firebaseLogin.includes('https://esm.sh/firebase@11.10.0/auth?bundle'), 'Firebase SDK uses dynamic primary and fallback CDN loading');
console.log('PASS Firebase SDK fallback loading');
assert.ok(html.includes('<script src="./login-gate-loader-v60.js"></script>') && firebaseLogin.includes('signInWithPhoneNumber') && firebaseLogin.includes('RecaptchaVerifier') && firebaseLogin.includes('browserLocalPersistence') && firebaseLogin.includes('getRedirectResult') && firebaseLogin.includes('signInWithPopup') && firebaseLogin.includes('auth/billing-not-enabled'), 'Firebase phone OTP, popup/redirect Google sign-in, billing guidance and persistent auth integration');
assert.ok(firebaseLogin.includes('LOGOUT_PENDING_KEY') && firebaseLogin.includes('rememberLogoutLock') && firebaseLogin.includes('clearLogoutLock') && firebaseLogin.includes('if (auth.currentUser)'), 'Logout waits for Firebase confirmation and persists a pending lock');
assert.ok(firebaseLogin.includes('if (logoutInProgress)') && firebaseLogin.includes('window.smartLedgerLogout().catch'), 'Auth observer cannot unlock the app while logout is pending');
console.log('PASS Firebase phone OTP, Google redirect, persistent auth and guarded logout lifecycle');

const v45 = readFileSync('theme-v45-contrast.js', 'utf8');
assert.ok(html.includes('./theme-v45-contrast.js') && v45.includes('gradientStops') && v45.includes('surfaceSamples') && v45.includes('minContrast'), 'v45 gradient-aware surface contrast runtime');
console.log('PASS v45 gradient-aware surface contrast runtime');
console.log('PASS inline JavaScript syntax (' + inlineScripts.length + ' scripts)');
console.log('TOTAL ' + (checks.length + 2) + ' checks passed');

const v46 = readFileSync('theme-v46-complete-contrast.js', 'utf8');
assert.ok(html.includes('./theme-v46-complete-contrast.js') && v46.includes('function dashboardOnly') && v46.includes('function samples') && v46.includes('characterData:true') && v46.includes('svg text'), 'v46 complete element-level contrast runtime');
new Script(v46, { filename: 'theme-v46-complete-contrast.js' });
console.log('PASS v46 complete element-level contrast runtime');


const ai52 = readFileSync('ai-assistant-v52.js', 'utf8');
new Script(ai52, { filename: 'ai-assistant-v52.js' });
assert.ok(html.includes('./ai-assistant-v52.js') && sw.includes('./ai-assistant-v52.js'), 'v52 AI assistant loaded and precached');
for (const feature of ['SmartLedger AI Business Manager','data-ai-tab="chat"','data-ai-tab="insights"','data-ai-tab="inventory"','data-ai-tab="alerts"','data-ai-tab="reports"','smartLedgerVoiceInput','smartLedgerPrintReport','smartLedgerExportCSV','inventoryAdvice','buildAlerts','answerQuestion']) {
  assert.ok(ai52.includes(feature), 'Missing v52 AI feature: ' + feature);
}
assert.ok(ai52.includes('SpeechRecognition') && ai52.includes('sessionStorage') && ai52.includes('No cloud AI model is connected'), 'Voice, session history and local-first disclosure');
console.log('PASS v52 AI Business Manager syntax and feature coverage');

const firebaseLoader = readFileSync('login-gate-loader-v60.js', 'utf8');
new Script(firebaseLoader, { filename: 'login-gate-loader-v60.js' });
assert.ok(html.includes('./login-gate-loader-v60.js') && readFileSync('sw.js','utf8').includes('./login-gate-loader-v60.js') && firebaseLoader.includes('smartLedgerModuleState = "failed"') && firebaseLoader.includes('Reload SmartLedger'), 'Firebase bootstrap catches module-load errors and is precached');
console.log('PASS Firebase bootstrap diagnostics and reload recovery');
