/* SmartLedger v70 — persist transaction party contact details reliably. */
(function () {
  "use strict";
  if (window.smartLedgerV70Ready) return;
  const original = window.saveTransaction;
  if (typeof original !== "function") return;
  window.saveTransaction = function (event, kind) {
    const phone = String(document.querySelector("#txnPartyPhone")?.value || "").trim();
    const party = String(document.querySelector("#tparty")?.value || "").trim();
    const before = new Set((typeof get === "function" ? get(kind) : []).map(x => String(x.id)));
    const result = original.apply(this, arguments);
    const records = get(kind);
    const created = records.find(x => !before.has(String(x.id)) && String(x.party || "").toLowerCase() === party.toLowerCase());
    if (created) {
      if (phone) created.partyPhone = phone;
      put(kind, records);
      if (phone && party.toLowerCase() !== "walk-in") {
        const partyKey = kind === "purchases" ? "suppliers" : "customers";
        const parties = get(partyKey);
        const savedParty = parties.find(x => String(x.name || "").toLowerCase() === party.toLowerCase());
        if (savedParty) {
          savedParty.phone = phone;
          put(partyKey, parties);
        }
      }
      window.smartLedgerV70LastSaved = { kind, id: created.id, party, phone: created.partyPhone || "" };
    }
    return result;
  };
  window.smartLedgerV70Ready = true;
})();