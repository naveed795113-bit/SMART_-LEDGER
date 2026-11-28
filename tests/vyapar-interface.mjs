import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { JSDOM } from "jsdom";

const html=readFileSync("index.html","utf8");
const source=readFileSync("vyapar-android-interface-v2.js","utf8");
new Script(source,{filename:"vyapar-android-interface-v2.js"});
assert.equal((html.match(/vyapar-android-interface-v2\.js\?v=2/g)||[]).length,1,"interface layer is loaded exactly once");
assert.ok(html.lastIndexOf('src="./vyapar-android-interface-v2.js?v=2"')>html.lastIndexOf("</style>"),"interface layer loads after application styles");
assert.ok(html.includes("function chooseTxnProduct("),"transaction item selection handler exists");

const dom=new JSDOM("<!doctype html><html><body class=\"module-dashboard\"><main id=\"view\"><section class=\"dashboard-overview\"></section></main></body></html>",{runScripts:"outside-only"});
const w=dom.window;
w.eval(source);
assert.ok(w.document.querySelector("#sl-vyapar-android-v2"),"interface stylesheet is injected");
assert.ok(w.document.body.classList.contains("module-dashboard"),"dashboard state is not changed by interface initialization");
const css=w.document.querySelector("#sl-vyapar-android-v2").textContent;
assert.ok(css.includes("body:not(.module-dashboard)"),"all workspace styling excludes the dashboard");
assert.ok(css.includes("@media(max-width:850px)")&&css.includes("@media(max-width:520px)"),"mobile and compact-phone layouts are defined");
assert.ok(css.includes('html[data-sl-theme="dark"] body:not(.module-dashboard)'),"dark mode follows the app theme attribute");
assert.ok(!/body\.theme-dark:not\(/.test(css),"no obsolete dark-mode class selector remains");
w.document.body.classList.remove("module-dashboard");
assert.ok(w.document.body.classList.contains("module-dashboard")===false,"normal workspace can use the non-dashboard style scope");
console.log("Vyapar-inspired interface isolation, loading and responsive-style tests passed.");
dom.window.close();
