/* SmartLedger mobile interaction and logout reliability fix v56.0 */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    button, a, [role="button"] { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
    .mobile-logout { align-items:center; justify-content:center; min-width:38px; min-height:36px; margin-left:6px; padding:6px 10px; border:1px solid #b98b91; border-radius:10px; background:linear-gradient(145deg,#8b4352,#5b2332); color:#fff; font-size:18px; font-weight:800; cursor:pointer; pointer-events:auto; }
    @media (max-width:850px) { .mobile-logout { display:inline-flex !important; } #mobileNav { z-index:1000 !important; pointer-events:auto !important; } #mobileNav button { min-height:48px; pointer-events:auto !important; } }
    #slSidebarLogout, .more-link { pointer-events:auto !important; touch-action:manipulation !important; }
  `;
  document.head.appendChild(style);

  function runPage(page) {
    if (typeof window.go === "function") window.go(page);
    else document.dispatchEvent(new CustomEvent("smartledger:navigate", { detail: { page } }));
  }
  function logout() {
    const button = document.getElementById("slMobileLogout");
    if (typeof window.smartLedgerLogout === "function") {
      Promise.resolve(window.smartLedgerLogout()).catch(error => {
        console.error("SmartLedger logout failed:", error);
        if (button) button.textContent = "↪";
        alert("Logout failed. Check your connection and try again.");
      });
      return;
    }
    if (button) button.textContent = "…";
    window.setTimeout(function () {
      if (typeof window.smartLedgerLogout === "function") {
        Promise.resolve(window.smartLedgerLogout()).catch(error => {
          console.error("SmartLedger logout failed:", error);
          alert("Logout failed. Check your connection and try again.");
        });
      } else {
        if (button) button.textContent = "↪";
        alert("Login service did not load. Close SmartLedger and reopen it.");
      }
    }, 800);
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!target || !target.closest) return;

    const logoutButton = target.closest("#slMobileLogout, #slSidebarLogout");
    if (logoutButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      logout();
      return;
    }

    const mobileButton = target.closest("#mobileNav button[data-page]");
    if (mobileButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      runPage(mobileButton.dataset.page);
      return;
    }

    const moreButton = target.closest("#view .more-link");
    if (moreButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const label = moreButton.querySelector("b")?.textContent?.trim();
      if (label === "Log out") logout();
      else if (label === "AI Assistant" && typeof window.openAIAssistant === "function") window.openAIAssistant();
      else if (label) runPage(label);
    }
  }, true);
})();
