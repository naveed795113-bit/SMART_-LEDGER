import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import assert from "node:assert/strict";

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => errors.push(e.message));
const dom = new JSDOM(readFileSync("index.html", "utf8"), {
  url: "https://smartledger.test/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
    window.alert = () => {};
    window.confirm = () => true;
    window.URL.createObjectURL = () => "blob:test";
    window.URL.revokeObjectURL = () => {};
    window.HTMLAnchorElement.prototype.click = function () {};
  }
});
const { window } = dom;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await wait(40);
assert.equal(errors.length, 0, "Base app boot has no runtime errors: " + errors.join("; "));
window.eval(readFileSync("smartledger-workflow-v69.js", "utf8"));
assert.equal(window.smartLedgerV69Ready, true, "v69 enhancement initializes");

window.localStorage.setItem("sl_items", JSON.stringify([
  { name: "Rice 5kg", code: "RICE5", qty: 20, unit: "kg", purchase: 250, price: 280, gst: 5 },
  { name: "Sugar 1kg", code: "SUG1", qty: 30, unit: "kg", purchase: 42, price: 48, gst: 5 }
]));
window.localStorage.setItem("sl_customers", JSON.stringify([{ name: "Test Customer", phone: "+919876543210", opening: 0 }]));
window.localStorage.setItem("sl_suppliers", JSON.stringify([{ name: "Test Supplier", phone: "+919812345678", opening: 0 }]));
window.go("Sales");
window.transactionForm("sales");
await wait(10);
assert.ok(window.document.querySelector("#txnPartyPhone"), "Sales form includes WhatsApp phone field");
assert.equal(window.document.querySelector("#txnPartyPhone").value, "", "Walk-in starts without an unrelated saved phone");
window.document.querySelector("#tparty").value = "Test Customer";
window.document.querySelector("#tparty").dispatchEvent(new window.Event("change", { bubbles: true }));
assert.equal(window.document.querySelector("#txnPartyPhone").value, "+919876543210", "Selecting a saved customer fills their phone");
assert.ok(window.document.querySelector(".sl-txn-dialog"), "Sales dialog gets dedicated scroll layout");
assert.ok(window.document.querySelector(".txn-product-option"), "Product picker renders inventory product cards");
assert.match(window.document.querySelector(".txn-product-option").textContent, /Rice 5kg/, "Product cards show the product name");
assert.equal(window.document.querySelector("#modalbody form button[type=submit]").textContent, "Save sale invoice", "Sales save button is clearly labelled");
const styles = window.document.getElementById("smartledger-v69-transaction-ui").textContent;
assert.match(styles, /position:sticky!important;bottom:0/, "Save action remains sticky while the form scrolls");
assert.match(styles, /grid-template-columns:1fr!important/, "Small-phone product picker uses a readable single-column layout");

window.closeModal();
window.go("Purchases");
window.transactionForm("purchases");
await wait(10);
window.document.querySelector("#tparty").value = "Test Supplier";
window.document.querySelector("#tparty").dispatchEvent(new window.Event("change", { bubbles: true }));
assert.equal(window.document.querySelector("#txnPartyPhone").value, "+919812345678", "Selecting a saved supplier fills their phone");
assert.equal(window.document.querySelector("#modalbody form button[type=submit]").textContent, "Save purchase bill", "Purchase save button is clearly labelled");

let sharedPayload;
Object.defineProperty(window.navigator, "share", { configurable: true, value: async payload => { sharedPayload = payload; } });
Object.defineProperty(window.navigator, "canShare", { configurable: true, value: () => true });
window.html2canvas = async () => ({
  width: 600, height: 1200,
  toBlob(callback) { callback(new window.Blob(["png"], { type: "image/png" })); }
});
window.jspdf = { jsPDF: class {
  addPage() {}
  addImage() {}
  output() { return new window.Blob(["pdf"], { type: "application/pdf" }); }
} };
window.HTMLCanvasElement.prototype.getContext = function () { return { drawImage() {} }; };
window.HTMLCanvasElement.prototype.toDataURL = function () { return "data:image/jpeg;base64,dGVzdA=="; };
window.localStorage.setItem("sl_sales", JSON.stringify([{ id: 777, invoice: "SL-777", party: "Test Customer", partyPhone: "+919876543210", total: 100, paid: 0 }]));
window.document.querySelector("#modalbody").innerHTML = '<div id="invoicepaper">Invoice test</div>';
await window.shareInvoice(777, "sales");
assert.ok(sharedPayload, "Invoice share invokes the Android native share sheet");
assert.equal(sharedPayload.files.length, 2, "Share payload includes both PDF and HD image");
assert.match(sharedPayload.text, /WhatsApp number: \+919876543210/, "Share payload carries the selected party phone number");
assert.equal(sharedPayload.files[0].type, "application/pdf", "First attachment is a PDF");
assert.equal(sharedPayload.files[1].type, "image/png", "Second attachment is a PNG");

assert.equal(errors.length, 0, "v69 workflow has no uncaught runtime errors: " + errors.join("; "));
console.log("PASS v69 sales and purchase phone auto-fill");
console.log("PASS v69 responsive product picker and sticky visible save action");
console.log("PASS v69 invoice sharing sends PDF + HD PNG with selected WhatsApp number in share text");
console.log("TOTAL 3 v69 workflow groups passed");
dom.window.close();
