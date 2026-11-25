/* SmartLedger Firebase Authentication — v54.0
 * Google + phone OTP, Firebase-managed accounts, persistent local auth.
 * Firebase web config is public client configuration; never place service-account secrets here.
 */
// Load both Firebase modules from one CDN at a time. A failed static import
// prevents this module from running at all, so use dynamic imports with fallback.
async function loadFirebaseSdk() {
  const sources = [
    {
      app: "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js",
      auth: "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js"
    },
    {
      app: "https://esm.sh/firebase@11.10.0/app?bundle",
      auth: "https://esm.sh/firebase@11.10.0/auth?bundle"
    }
  ];
  let lastError;
  for (const source of sources) {
    try {
      const [appSdk, authSdk] = await Promise.all([import(source.app), import(source.auth)]);
      return { ...appSdk, ...authSdk };
    } catch (error) {
      lastError = error;
      console.warn("SmartLedger: Firebase SDK source failed; trying fallback.", error);
    }
  }
  throw lastError || new Error("No Firebase SDK source could be loaded.");
}
const firebaseSdk = await loadFirebaseSdk();
const {
  initializeApp, getAuth, setPersistence, browserLocalPersistence,
  GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword
} = firebaseSdk;

const firebaseConfig = {
  apiKey: "AIzaSyDlzohhg8W95yVcav46Cv-QFvR_tngzFXE",
  authDomain: "smart-ledger-288a4.firebaseapp.com",
  projectId: "smart-ledger-288a4",
  storageBucket: "smart-ledger-288a4.firebasestorage.app",
  messagingSenderId: "600259265217",
  appId: "1:600259265217:web:d3b7f038b5ce296ec80a40",
  measurementId: "G-F5FTS9Z5WE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let confirmationResult = null;
let recaptchaVerifier = null;
let authReady = false;
let gate = null;
let logoutInProgress = false;
let logoutPromise = null;
const LOGOUT_PENDING_KEY = "smartledger_logout_pending";
try { logoutInProgress = sessionStorage.getItem(LOGOUT_PENDING_KEY) === "1"; } catch (e) {}
function rememberLogoutLock() {
  logoutInProgress = true;
  try { sessionStorage.setItem(LOGOUT_PENDING_KEY, "1"); } catch (e) {}
}
function clearLogoutLock() {
  logoutInProgress = false;
  try { sessionStorage.removeItem(LOGOUT_PENDING_KEY); } catch (e) {}
}

const css = document.createElement("style");
css.textContent = `
#slLoginGate{position:fixed;inset:0;z-index:99999;overflow:auto;display:grid;place-items:center;padding:clamp(14px,3vw,38px);background:radial-gradient(ellipse at 12% 8%,#824c5a 0%,transparent 38%),radial-gradient(ellipse at 88% 92%,#6c3545 0%,transparent 36%),linear-gradient(135deg,#21151b 0%,#39212a 52%,#24151c 100%);color:#21191b;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
#slLoginGate *{box-sizing:border-box}#slLoginGate .sl-shell{width:min(1040px,100%);min-height:min(650px,calc(100dvh - 36px));display:grid;grid-template-columns:1.04fr .96fr;overflow:hidden;border:1px solid #ffffff35;border-radius:30px;background:#f8f5f1;box-shadow:0 35px 100px #10090db8,0 2px 8px #ffffff20}
#slLoginGate .sl-brand-panel{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:space-between;min-width:0;padding:clamp(28px,5vw,58px);overflow:hidden;background:linear-gradient(150deg,#754452 0%,#532c39 54%,#321d26 100%);color:#fff}
#slLoginGate .sl-brand-panel:before,#slLoginGate .sl-brand-panel:after{content:"";position:absolute;z-index:-1;border:1px solid #ffffff18;border-radius:50%;pointer-events:none}
#slLoginGate .sl-brand-panel:before{width:440px;height:440px;right:-220px;top:-160px;box-shadow:0 0 0 35px #ffffff08,0 0 0 75px #ffffff05}
#slLoginGate .sl-brand-panel:after{width:310px;height:310px;left:-210px;bottom:-170px;box-shadow:0 0 0 30px #ffffff07,0 0 0 65px #ffffff04}
#slLoginGate .sl-brand-top{display:flex;align-items:center;gap:13px}#slLoginGate .sl-brand-mark{width:48px;height:48px;flex:0 0 48px;display:grid;place-items:center;border-radius:15px;border:1px solid #e8c7b777;background:linear-gradient(145deg,#d3a6a0,#8b5360 70%);box-shadow:inset 1px 1px 3px #ffffffa0,0 8px 22px #24101888}
#slLoginGate .sl-brand-mark svg{width:28px;height:28px}#slLoginGate .sl-brand-name{font-size:17px;font-weight:800;letter-spacing:.25px;color:#fff}#slLoginGate .sl-brand-kicker{margin-top:3px;font-size:10px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#e7cbd0}
#slLoginGate .sl-brand-copy{max-width:440px;margin:50px 0}#slLoginGate .sl-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid #ffffff35;border-radius:30px;background:#ffffff0e;color:#f3dfe2;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
#slLoginGate .sl-eyebrow:before{content:"";width:6px;height:6px;border-radius:50%;background:#e4c18a;box-shadow:0 0 12px #e4c18a}#slLoginGate .sl-brand-copy h1{margin:22px 0 14px;max-width:430px;color:#fff;font-size:clamp(34px,4.5vw,51px);font-weight:750;letter-spacing:-1.8px;line-height:1.08}
#slLoginGate .sl-brand-copy h1 span{color:#e5c49a}#slLoginGate .sl-brand-desc{max-width:370px;margin:0;color:#eadde0;font-size:14px;line-height:1.8}
#slLoginGate .sl-feature-list{display:grid;gap:13px;margin:30px 0 0;padding:0;list-style:none}#slLoginGate .sl-feature-list li{display:flex;align-items:center;gap:11px;color:#f7ecee;font-size:12px;font-weight:600}
#slLoginGate .sl-feature-icon{width:27px;height:27px;flex:0 0 27px;display:grid;place-items:center;border:1px solid #ffffff30;border-radius:9px;background:#ffffff12;color:#f0d3b0;font-size:14px}
#slLoginGate .sl-brand-bottom{display:flex;justify-content:space-between;gap:12px;align-items:center;color:#d6bdc3;font-size:10px}#slLoginGate .sl-brand-bottom span:last-child{color:#e8cda7;letter-spacing:1px;text-transform:uppercase;font-weight:700}
#slLoginGate .sl-auth-panel{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:clamp(25px,4vw,48px);background:linear-gradient(155deg,#fcfaf7,#f2eee8);text-align:center}
#slLoginGate .sl-auth-inner{width:min(380px,100%)}#slLoginGate .sl-auth-kicker{margin:0 0 12px;color:#966a70;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
#slLoginGate .sl-auth-panel h2{margin:0 0 10px;color:#292023;font-size:clamp(27px,3vw,34px);font-weight:800;letter-spacing:-1px;line-height:1.15}
#slLoginGate .sl-auth-desc{margin:0 auto 22px;max-width:310px;color:#71666a;font-size:13px;line-height:1.7}
#slLoginGate .sl-signin-box{padding:20px 18px 17px;border:1px solid #e6ddd6;border-radius:19px;background:#fff;box-shadow:0 12px 32px #38232b0c,inset 0 1px #fff}
#slLoginGate .sl-action{width:100%;min-height:45px;border:1px solid #ded5d0;border-radius:11px;background:#fff;color:#33272c;font-weight:750;display:flex;justify-content:center;align-items:center;gap:9px}
#slLoginGate .sl-action.primary{background:#603543;border-color:#603543;color:white}#slLoginGate .sl-action:disabled{opacity:.55;cursor:not-allowed}
#slLoginGate .sl-divider{display:flex;align-items:center;gap:10px;margin:15px 0;color:#988b8d;font-size:10px}#slLoginGate .sl-divider:before,#slLoginGate .sl-divider:after{content:"";height:1px;background:#e8e0dc;flex:1}
#slLoginGate .sl-field{width:100%;height:44px;margin:0 0 10px;padding:0 12px;border:1px solid #ded5d0;border-radius:10px;background:#fff;color:#2d2327;outline:none}
#slLoginGate .sl-field:focus{border-color:#8c5c68;box-shadow:0 0 0 3px #8c5c6818}#slLoginGate .sl-phone-row{display:grid;grid-template-columns:1fr;gap:8px}#slLoginGate .sl-phone-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}#slLoginGate .sl-phone-actions .sl-action{font-size:12px;padding:0 8px}#slLoginGate .sl-phone-help{margin:2px 0 10px;color:#827579;font-size:10px;line-height:1.45;text-align:left}
#slLoginGate .sl-login-status{min-height:32px;margin:12px 0 0;color:#796b70;font-size:11px;line-height:1.55}
#slLoginGate .sl-account-note{margin:10px 0 0;color:#827579;font-size:10px;line-height:1.5}#slLoginGate .sl-trust-row{display:flex;justify-content:center;align-items:center;gap:7px;margin:16px 0 0;color:#75696c;font-size:10px;line-height:1.5}
#slLoginGate .sl-trust-row svg{width:14px;height:14px;flex:0 0 14px;color:#8a5963}#slLoginGate .sl-auth-footer{margin:23px 0 0;padding-top:16px;border-top:1px solid #e5ddd7;color:#8b8081;font-size:10px;line-height:1.7}
#slLoginGate .sl-auth-footer strong{color:#5d4d51;font-weight:750}#slLoginGate #slRecaptcha{display:flex;justify-content:center;overflow:hidden}
@media(max-width:720px){#slLoginGate{padding:0;display:block;background:linear-gradient(160deg,#512d39,#291a21);min-height:100dvh}#slLoginGate .sl-shell{width:100%;min-height:100dvh;display:flex;flex-direction:column;border:0;border-radius:0;box-shadow:none;background:#f8f5f1}
#slLoginGate .sl-brand-panel{flex:0 0 auto;min-height:225px;padding:23px 24px 24px}#slLoginGate .sl-brand-copy{margin:26px 0 0}#slLoginGate .sl-brand-copy h1{font-size:32px;letter-spacing:-1.2px;margin:14px 0 8px}
#slLoginGate .sl-brand-desc{font-size:11px;line-height:1.5;max-width:340px}#slLoginGate .sl-feature-list{display:none}#slLoginGate .sl-brand-bottom{margin-top:18px}
#slLoginGate .sl-auth-panel{flex:1;padding:27px 22px 23px;justify-content:flex-start}#slLoginGate .sl-auth-inner{width:min(390px,100%)}#slLoginGate .sl-auth-panel h2{font-size:27px}#slLoginGate .sl-auth-desc{margin-bottom:19px}
#slLoginGate .sl-auth-footer{margin-top:22px}}
@media(max-width:380px){#slLoginGate .sl-brand-panel{min-height:210px;padding:20px 19px}#slLoginGate .sl-brand-copy{margin-top:21px}#slLoginGate .sl-brand-copy h1{font-size:29px}#slLoginGate .sl-auth-panel{padding:24px 17px 20px}#slLoginGate .sl-signin-box{padding:17px 12px 14px}}
@media(prefers-reduced-motion:reduce){#slLoginGate *{animation:none!important;scroll-behavior:auto!important}}
`;
document.head.appendChild(css);

gate = document.createElement("main");
gate.id = "slLoginGate";
gate.setAttribute("role", "dialog");
gate.setAttribute("aria-modal", "true");
gate.setAttribute("aria-label", "SmartLedger sign in");
gate.innerHTML = `
<div class="sl-shell">
 <section class="sl-brand-panel" aria-label="SmartLedger introduction">
  <div class="sl-brand-top"><div class="sl-brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 24V8h4.5l9 11V8H25v16h-4.3l-9.2-11.2V24H7Z" fill="white"/><path d="M5 27h22" stroke="#F0D6BA" stroke-width="2" stroke-linecap="round"/></svg></div><div><div class="sl-brand-name">SmartLedger</div><div class="sl-brand-kicker">Business management</div></div></div>
  <div class="sl-brand-copy"><div class="sl-eyebrow">Your business, in control</div><h1>Run your shop.<br><span>Know your numbers.</span></h1><p class="sl-brand-desc">Manage daily sales, stock, customers and accounts in one workspace.</p>
   <ul class="sl-feature-list"><li><span class="sl-feature-icon">↗</span>Sales, purchases and inventory</li><li><span class="sl-feature-icon">▤</span>Customer, supplier and financial ledgers</li><li><span class="sl-feature-icon">☁</span>Google Drive backup and recovery</li></ul>
  </div><div class="sl-brand-bottom"><span>Built for everyday business</span><span>Simple · Clear · Connected</span></div>
 </section>
 <section class="sl-auth-panel" aria-label="Sign in"><div class="sl-auth-inner">
  <p class="sl-auth-kicker">Welcome to SmartLedger</p><h2>Sign in or create account</h2>
  <p class="sl-auth-desc">Continue with Google or use your mobile number and a password. No SMS charges for password login.</p>
  <div class="sl-signin-box">
   <button class="sl-action" id="slFirebaseGoogleSignIn" type="button"><span aria-hidden="true">G</span> Continue with Google</button>
   <div class="sl-divider">OR PHONE + PASSWORD</div>
   <div class="sl-phone-row"><input class="sl-field" id="slPhoneNumber" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 98765 43210" aria-label="Phone number with country code">
    <input class="sl-field" id="slPhonePassword" type="password" autocomplete="current-password" placeholder="Password (minimum 8 characters)" aria-label="Password">
    <input class="sl-field" id="slPhonePasswordConfirm" type="password" autocomplete="new-password" placeholder="Confirm password for new account" aria-label="Confirm password">
    <div class="sl-phone-actions"><button class="sl-action primary" id="slCreatePhoneAccount" type="button">Create free account</button><button class="sl-action" id="slPhonePasswordSignIn" type="button">Sign in</button></div>
    <p class="sl-phone-help">Phone number is used as your account ID but is not verified by SMS. Anyone who knows the number cannot access the account without its password. Keep your password safe; password recovery is not available for this sign-in method yet.</p>
    <div id="slOtpArea" hidden><input class="sl-field" id="slOtpCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Enter 6-digit OTP" aria-label="Verification code"><button class="sl-action primary" id="slVerifyOtp" type="button">Verify &amp; continue</button></div>
    <div id="slRecaptcha" hidden></div>
   </div>
   <p id="slLoginStatus" class="sl-login-status" role="status" aria-live="polite">Connecting securely to Firebase…</p>
   <p class="sl-account-note">Google login remains available. Phone + password accounts are separate from Google accounts unless both are linked later.</p>
  </div>
  <div class="sl-trust-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Firebase verifies your sign-in. Never share your OTP with anyone.</span></div>
  <div class="sl-auth-footer"><strong>SmartLedger</strong> · Your business. Your numbers. Your growth.<br>Your app data remains stored in this browser; Firebase authentication does not sync shop records between devices.</div>
 </div></section>
</div>`;

function status(message) {
  const el = document.getElementById("slLoginStatus");
  if (el) el.textContent = message;
}
function errorText(error) {
  const code = error && error.code || "";
  const map = {
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication settings.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase Console.",
    "auth/billing-not-enabled": "Firebase Phone Authentication requires a linked Cloud Billing account. Link this Firebase project to a billing account and use the Blaze pay-as-you-go plan; SMS charges may apply.",
    "auth/invalid-phone-number": "Enter a valid phone number with country code, for example +91XXXXXXXXXX.",
    "auth/email-already-in-use": "An account already exists for this phone number. Choose Sign in instead.",
    "auth/invalid-credential": "Phone number or password is incorrect.",
    "auth/weak-password": "Use a password with at least 8 characters.",
    "auth/user-not-found": "No account was found for this phone number. Choose Create free account.",
    "auth/wrong-password": "Phone number or password is incorrect.",
    "auth/too-many-requests": "Too many attempts. Wait before requesting another code.",
    "auth/captcha-check-failed": "reCAPTCHA verification failed. Reload and try again.",
    "auth/popup-blocked": "The sign-in window was blocked. Allow redirects/pop-ups and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/invalid-verification-code": "That OTP is incorrect. Check the code and try again.",
    "auth/code-expired": "That OTP has expired. Request a new verification code."
  };
  return map[code] || (error && error.message ? error.message.replace(/^Firebase:s*/,"") : "Sign-in failed. Please try again.");
}
function profileFor(user, loginPhone = "") {
  return {
    name: user.displayName || "",
    email: user.email || "",
    picture: user.photoURL || "",
    sub: user.uid,
    phoneNumber: user.phoneNumber || loginPhone || ""
  };
}
function unlock(user, loginPhone = "") {
  if (logoutInProgress) {
    window.smartLedgerSignedIn = false;
    showGate();
    return;
  }
  const profile = profileFor(user, loginPhone);
  try { localStorage.setItem("sl_google_profile", JSON.stringify(profile)); } catch (e) {}
  window.smartLedgerSignedIn = true;
  if (gate && gate.isConnected) gate.remove();
  window.dispatchEvent(new CustomEvent("smartledger:login", { detail: profile }));
}
function showGate() {
  if (!gate.isConnected && document.body) document.body.appendChild(gate);
}
async function sendOtp() {
  clearLogoutLock();
  const phone = document.getElementById("slPhoneNumber").value.trim().replace(/[\s()-]/g,"");
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    status("Enter your full phone number with country code, for example +91XXXXXXXXXX.");
    return;
  }
  const button = document.getElementById("slSendOtp");
  button.disabled = true;
  status("Verifying reCAPTCHA and sending OTP…");
  try {
    if (recaptchaVerifier) { try { await recaptchaVerifier.clear(); } catch (e) {} recaptchaVerifier = null; }
    document.getElementById("slRecaptcha").innerHTML = "";
    recaptchaVerifier = new RecaptchaVerifier(auth, "slRecaptcha", {
      size: "normal",
      callback: () => {},
      "expired-callback": () => status("reCAPTCHA expired. Please request a new code.")
    });
    await recaptchaVerifier.render();
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    document.getElementById("slOtpArea").hidden = false;
    document.getElementById("slOtpCode").focus();
    status("Verification code sent to " + phone + ". Enter the 6-digit code.");
  } catch (error) {
    status(errorText(error));
    if (recaptchaVerifier) { try { await recaptchaVerifier.clear(); } catch (e) {} recaptchaVerifier = null; }
  } finally {
    button.disabled = false;
  }
}
async function verifyOtp() {
  const code = document.getElementById("slOtpCode").value.trim();
  if (!/^\d{6}$/.test(code)) { status("Enter the 6-digit verification code."); return; }
  const button = document.getElementById("slVerifyOtp");
  button.disabled = true;
  status("Verifying your phone number…");
  try {
    await confirmationResult.confirm(code);
  } catch (error) {
    status(errorText(error));
  } finally {
    button.disabled = false;
  }
}
function phoneAccountEmail(rawPhone) {
  const phone = rawPhone.trim().replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error("Enter a valid phone number with country code, for example +91XXXXXXXXXX.");
  return "slphone_" + phone.slice(1) + "@accounts.smartledger.invalid";
}
async function phonePasswordAuth(createAccount) {
  clearLogoutLock();
  const phoneInput = gate.querySelector("#slPhoneNumber");
  const passwordInput = gate.querySelector("#slPhonePassword");
  const confirmInput = gate.querySelector("#slPhonePasswordConfirm");
  const createButton = gate.querySelector("#slCreatePhoneAccount");
  const signInButton = gate.querySelector("#slPhonePasswordSignIn");
  let email;
  try { email = phoneAccountEmail(phoneInput.value); }
  catch (error) { status(error.message); return; }
  const password = passwordInput.value;
  if (password.length < 8) { status("Use a password with at least 8 characters."); return; }
  if (createAccount && password !== confirmInput.value) { status("The passwords do not match."); return; }
  createButton.disabled = true;
  signInButton.disabled = true;
  status(createAccount ? "Creating your secure account…" : "Signing in securely…");
  try {
    const credential = createAccount
      ? await createUserWithEmailAndPassword(auth, email, password)
      : await signInWithEmailAndPassword(auth, email, password);
    if (credential && credential.user) unlock(credential.user, phoneInput.value.trim().replace(/[\s()-]/g, ""));
  } catch (error) {
    status(errorText(error));
  } finally {
    createButton.disabled = false;
    signInButton.disabled = false;
  }
}

// The login gate is built while detached from the document. Resolve controls
// from the gate itself; document.getElementById() returns null until showGate().
const googleSignInButton = gate.querySelector("#slFirebaseGoogleSignIn");
const sendOtpButton = gate.querySelector("#slSendOtp");
const verifyOtpButton = gate.querySelector("#slVerifyOtp");
const createPhoneAccountButton = gate.querySelector("#slCreatePhoneAccount");
const phonePasswordSignInButton = gate.querySelector("#slPhonePasswordSignIn");

if (googleSignInButton) {
  googleSignInButton.addEventListener("click", async () => {
    clearLogoutLock();
    googleSignInButton.disabled = true;
    status("Opening secure Google sign-in…");
    try {
      // Popup avoids the cross-site storage restrictions that can break
      // Firebase redirect sign-in when the app is hosted on GitHub Pages.
      const credential = await signInWithPopup(auth, googleProvider);
      if (credential && credential.user) unlock(credential.user);
    } catch (error) {
      // Keep redirect as a fallback only when the browser blocks popups.
      if (error && error.code === "auth/popup-blocked") {
        status("Popup blocked. Switching to secure redirect sign-in…");
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          status(errorText(redirectError));
        }
      } else {
        status(errorText(error));
      }
      googleSignInButton.disabled = false;
    }
  });
}
if (sendOtpButton) sendOtpButton.addEventListener("click", sendOtp);
if (verifyOtpButton) verifyOtpButton.addEventListener("click", verifyOtp);
if (createPhoneAccountButton) createPhoneAccountButton.addEventListener("click", () => phonePasswordAuth(true));
if (phonePasswordSignInButton) phonePasswordSignInButton.addEventListener("click", () => phonePasswordAuth(false));
window.smartLedgerLogout = function () {
  if (logoutPromise) return logoutPromise;
  rememberLogoutLock();
  window.smartLedgerSignedIn = false;
  try { localStorage.removeItem("sl_google_profile"); } catch (e) {}
  showGate();
  status("Signing out securely…");
  logoutPromise = (async () => {
    try {
      await signOut(auth);
      if (auth.currentUser) throw new Error("Firebase still reports an active user after sign-out.");
      clearLogoutLock();
      window.smartLedgerSignedIn = false;
      showGate();
      status("You have been signed out. Sign in to continue.");
      return true;
    } catch (error) {
      rememberLogoutLock();
      window.smartLedgerSignedIn = false;
      showGate();
      status("Sign-out was not confirmed. Your workspace remains locked. Check your connection and tap Log out again.");
      console.error("SmartLedger sign-out:", error);
      throw error;
    } finally {
      logoutPromise = null;
    }
  })();
  return logoutPromise;
};

showGate();
try {
  await setPersistence(auth, browserLocalPersistence);
  try {
    const redirectCredential = await getRedirectResult(auth);
    if (redirectCredential && redirectCredential.user) unlock(redirectCredential.user);
  } catch (redirectError) {
    status(errorText(redirectError));
    console.error("SmartLedger Google redirect result:", redirectError);
  }
  onAuthStateChanged(auth, user => {
    authReady = true;
    if (user) {
      if (logoutInProgress) {
        window.smartLedgerSignedIn = false;
        showGate();
        if (!logoutPromise) {
          window.smartLedgerLogout().catch(error => {
            console.error("SmartLedger pending sign-out retry:", error);
          });
        }
        return;
      }
      unlock(user);
    } else {
      clearLogoutLock();
      window.smartLedgerSignedIn = false;
      showGate();
      status("Choose Google or use your phone number and password to continue.");
    }
  }, error => {
    authReady = true;
    showGate();
    status(errorText(error));
  });
} catch (error) {
  showGate();
  status("Firebase could not initialize. Both Firebase module sources failed: " + errorText(error) + " Reload the page when your internet connection is stable.");
  console.error("SmartLedger Firebase initialization:", error);
}
