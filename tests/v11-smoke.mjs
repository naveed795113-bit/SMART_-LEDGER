import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1]).filter(s => s.trim());
assert.ok(inlineScripts.length, 'Inline application script exists');
for (const [i, source] of inlineScripts.entries()) new Script(source, { filename: 'index-inline-' + i + '.js' });

const checks = [
  ['release badge', /SMARTLEDGER v12\.0/.test(html)],
  ['version constants', /APP_VERSION=['"]12.0.0['"]/.test(html)],
  ['dashboard renderer', /function render\(\)/.test(html)],
  ['inventory page', /function listItems\(\)/.test(html)],
  ['sales and purchases', /function transactionForm\(k\)/.test(html)],
  ['reports', /function reports\(\)/.test(html)],
  ['ledger', /function ledgerPage\(\)/.test(html)],
  ['AI assistant', /function openAIAssistant\(\)/.test(html)],
  ['CSV/XLS/XLSX import', /['"]xls['"].*['"]xlsx['"].*['"]csv['"]/.test(html)],
  ['versioned backup export', /schemaVersion:BACKUP_SCHEMA_VERSION/.test(html)],
  ['restore schema validation', /Unsupported backup version/.test(html)],
  ['pre-restore safety backup', /exportData\(\);\s*keys\.forEach/.test(html)],
  ['legacy backup compatibility', /data\.schemaVersion!==undefined/.test(html)],
  ['theme controls', /function setTheme\(mode\)/.test(html)],
  ['service worker registration', /serviceWorker\.register/.test(html)]
];
for (const [name, ok] of checks) {
  assert.ok(ok, 'Missing or changed required feature: ' + name);
  console.log('PASS ' + name);
}
const sw = readFileSync('sw.js', 'utf8');
assert.match(sw, /smartledger-v12\.0/, 'Service worker cache version');
console.log('PASS service worker cache version');
console.log('PASS inline JavaScript syntax (' + inlineScripts.length + ' scripts)');
console.log('TOTAL ' + (checks.length + 2) + ' checks passed');
