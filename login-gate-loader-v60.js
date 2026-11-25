/* SmartLedger Firebase module bootstrap — v64.
 * Reports the complete runtime stack so login initialization failures can be traced.
 */
(function () {
  const box = document.createElement("div");
  box.id = "slModuleBootstrap";
  box.setAttribute("role", "status");
  box.style.cssText = "position:fixed;inset:0;z-index:1000000;display:grid;place-items:center;padding:24px;background:#21151b;color:#fff;font:600 15px/1.6 system-ui;text-align:center";
  box.textContent = "Connecting securely to SmartLedger…";
  document.body.appendChild(box);
  window.smartLedgerModuleState = "loading";
  const load = import("./login-gate-v50.js?v=63");
  const timeout = new Promise((_, reject) => window.setTimeout(() => reject(new Error("Firebase login module took longer than 45 seconds to load. Check your internet connection and reload.")), 45000));
  Promise.race([load, timeout]).then(() => {
    window.smartLedgerModuleState = "ready";
    const current = document.getElementById("slModuleBootstrap");
    if (current) current.remove();
  }).catch(error => {
    window.smartLedgerModuleState = "failed";
    window.smartLedgerModuleError = error;
    console.error("SmartLedger Firebase module failed to load:", error);
    box.innerHTML = "";
    const panel = document.createElement("div");
    panel.style.cssText = "max-width:440px;padding:24px;border:1px solid #9d6875;border-radius:18px;background:#38232c";
    const title = document.createElement("div");
    title.textContent = "Secure login could not load";
    title.style.cssText = "font-size:21px;font-weight:800;margin-bottom:10px";
    const detail = document.createElement("p");
    const message = error && error.message ? error.message : "Firebase could not be reached. Check your internet connection and try again.";
    const stack = error && error.stack ? error.stack : "No JavaScript stack was provided by the browser.";
    detail.textContent = message + "\n\nDiagnostic details:\n" + stack;
    detail.style.cssText = "font-size:12px;font-weight:500;color:#f0dfe3;overflow-wrap:anywhere;white-space:pre-wrap;max-height:45vh;overflow:auto;text-align:left";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Reload SmartLedger";
    retry.style.cssText = "margin-top:12px;padding:12px 18px;border:0;border-radius:10px;background:#e2c29a;color:#24171d;font-weight:800";
    retry.addEventListener("click", () => location.reload());
    panel.append(title, detail, retry);
    box.appendChild(panel);
  });
})();
