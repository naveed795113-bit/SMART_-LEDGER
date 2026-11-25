import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const ui=readFileSync("smartledger-enhancements-v67.js","utf8");
const native=readFileSync("android/app/src/main/java/com/smartledger/business/MainActivity.java","utf8");
const manifest=readFileSync("android/app/src/main/AndroidManifest.xml","utf8");
const paths=readFileSync("android/app/src/main/res/xml/file_paths.xml","utf8");

assert.match(ui,/shareFilesToWhatsApp/,"Invoice UI uses the native WhatsApp file-share bridge");
assert.match(ui,/window\.SmartLedgerShare\.pending/,"Invoice UI waits for the native share result");
assert.match(ui,/d\.length===10\)d="91"\+d/,"Ten-digit Indian customer numbers receive the +91 country code");
assert.match(native,/Intent\.ACTION_SEND_MULTIPLE/,"Android shares PDF and HD image together");
assert.match(native,/putExtra\("jid",\s*digits\s*\+/,"Android targets the saved WhatsApp phone number");
assert.match(native,/FileProvider\.getUriForFile/,"Attachments use secure content URIs");
assert.match(native,/FLAG_GRANT_READ_URI_PERMISSION/,"WhatsApp receives temporary read access only");
assert.match(manifest,/com\.whatsapp/,"Consumer WhatsApp package is visible to the app");
assert.match(manifest,/com\.whatsapp\.w4b/,"WhatsApp Business package is visible to the app");
assert.match(manifest,/androidx\.core\.content\.FileProvider/,"FileProvider is declared");
assert.match(paths,/cache-path[^>]+shared-invoices/,"Only generated invoice cache files can be shared");
console.log("PASS native WhatsApp PDF + HD image share bridge wiring");
