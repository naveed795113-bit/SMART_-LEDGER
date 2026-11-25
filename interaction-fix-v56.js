/* SmartLedger mobile interaction and persistent logout fix v58.0 */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    button, a, [role="button"] { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
    .mobile-logout { display:none; align-items:center; justify-content:center; min-width:38px; min-height:36px; margin-left:6px; padding:6px 10px; border:1px solid #b98b91; border-radius:10px; background:linear-gradient(145deg,#8b4352,#5b2332); color:#fff; font-size:18px; font-weight:800; cursor:pointer; pointer-events:auto; }
    @media (max-width:850px) { .mobile-logout { display:inline-flex !important; } #mobileNav { z-index:1000 !important; pointer-events:auto !important; } #mobileNav button { min-height:48px; pointer-events:auto !important; } }
    #slSidebarLogout, .more-link { pointer-events:auto !important; touch-action:manipulation !important; }
  `;
  document.head.appendChild(style);
  function runPage(page) {
    if (typeof window.go === "function") window.go(page);
    else document.dispatchEvent(new CustomEvent("smartledger:navigate", { detail: { page } }));
  }
  async function logout(button) {
    if (button && button.dataset.logoutBusy === "1") return;
    if (button) { button.dataset.logoutBusy = "1"; button.disabled = true; }
    try {
      let attempts = 0;
      while (typeof window.smartLedgerLogout !== "function" && attempts < 300) {
        await new Promise(resolve => window.setTimeout(resolve, 150));
        if (window.smartLedgerModuleState === "failed") throw window.smartLedgerModuleError || new Error("Firebase login module failed to load. Reload SmartLedger.");
        attempts++;
      }
      if (typeof window.smartLedgerLogout !== "function") throw new Error("Firebase login is still loading. Wait a moment, then tap Log out again.");
      await window.smartLedgerLogout();
    } catch (error) {
      console.error("SmartLedger logout failed:", error);
      const status = document.getElementById("slLoginStatus");
      if (status) status.textContent = error.message || "Logout failed. Please try again.";
      else alert(error.message || "Logout failed. Please try again.");
    } finally {
      if (button && button.isConnected) { button.disabled = false; delete button.dataset.logoutBusy; }
    }
  }
  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!target || !target.closest) return;
    const logoutButton = target.closest("#slMobileLogout, #slSidebarLogout");
    if (logoutButton) { event.preventDefault(); event.stopImmediatePropagation(); logout(logoutButton); return; }
    const mobileButton = target.closest("#mobileNav button[data-page]");
    if (mobileButton) { event.preventDefault(); event.stopImmediatePropagation(); runPage(mobileButton.dataset.page); return; }
    const moreButton = target.closest("#view .more-link");
    if (moreButton) {
      event.preventDefault(); event.stopImmediatePropagation();
      const label = moreButton.querySelector("b")?.textContent?.trim();
      if (label === "Log out" || moreButton.dataset.action === "logout") logout(moreButton);
      else if (label === "AI Assistant" && typeof window.openAIAssistant === "function") window.openAIAssistant();
      else if (label) runPage(label);
    }
  }, true);
})();