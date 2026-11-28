
## Version 79.0 — Cloud sync, isolated branches and server-enforced staff roles

- Firestore stores each business record under `accounts/{ownerUid}/branches/{branchId}/records`; staff membership is stored separately under the account.
- The cloud client compares local and remote record hashes. If both sides changed the same record since the last successful sync, it stops and reports a conflict rather than silently overwriting either copy.
- Branch switching caches the current local branch snapshot before loading the selected branch. Each branch uses a separate Firestore collection; browser-side branch caches are separated by business account and branch.
- Firestore rules enforce owner, manager, accountant, cashier and read-only roles on every record write. Cashier and accountant permissions include the item/stock records needed to post their permitted sales or purchase workflows; membership and branch assignments are controlled by the owner. All branch members can read the branch's records; role rules restrict writes, not per-field or per-record read visibility.
- Sync is explicit and offline-first. The login flow attempts a background sync only when the signed-in user is the business owner; staff can connect to the owner's UID from More → Cloud & Team Security.
- Staff access setup requires the staff member's Firebase UID. The owner creates the role and allowed branch assignment. The staff member then connects using the owner's UID.
- Firebase backend deployment is manual and requires the GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT_SMART_LEDGER_288A4`. Until the Firestore rules workflow has completed successfully, cloud sync and server-enforced staff controls are not active in the live service.
- Record values are transported over HTTPS and protected by Firebase Authentication + Firestore Security Rules. This release does not claim client-side end-to-end encryption; do not store passwords, payment card data or other secrets in business records.
- Individual record payloads are limited to 750 KB. Large attachments should use a dedicated secure object-storage service.

### Enable the Firebase backend

1. In Firebase Console for project `smart-ledger-288a4`, create the default Firestore database in Native mode if it does not already exist.
2. Create a Google Cloud service account with permission to deploy Firestore security rules. Store its complete JSON key as the GitHub repository Actions secret `FIREBASE_SERVICE_ACCOUNT_SMART_LEDGER_288A4`.
3. In GitHub → Actions, run **Deploy SmartLedger Firebase backend**. Wait for the Firestore rules deployment to succeed before using cloud sync.
4. Open SmartLedger → More → **Cloud & Team Security** and tap **Sync this branch now** on the owner device.
5. To add staff, have each staff member sign in and share the Firebase UID shown on that page. The owner adds that UID, chooses a role and assigns branch IDs. The staff member then enters the owner's Firebase UID and selects an assigned branch.

Cloud sync is user-initiated, not continuous real-time sync. Use **Sync this branch now** after important changes and before changing devices. The local branch cache is a convenience, not a substitute for a downloadable JSON backup. Branch members can read all records in their assigned branch; server rules restrict writes by role, but do not yet provide per-field or per-record read privacy. The app has not been security-audited or tested with production staff accounts.


## Version 78.0 — Enterprise Suite

SmartLedger v78 combines the planned enterprise programme into one integrated **More → Enterprise Suite** workspace. It builds on the existing item, invoice, customer, supplier, payment, return, GST summary, accounting, AI, backup and reporting modules.

### Enterprise workflows

- Multi-location stock balances and posted location transfers.
- Quotations and sales orders with conversion into the existing sales invoice workflow.
- Purchase orders with conversion into the existing purchase bill workflow.
- Customer-specific retail / wholesale / distributor price rules, default discounts and credit-limit checks.
- Salesperson profiles, supplier rate comparisons and supplier performance notes.
- Reorder estimates, stock valuation estimates, product profitability and sales run-rate forecasts.
- Due-date tracking, invoice-level payment allocation, cash-flow estimates and bank statement CSV matching.
- GST working CSV, e-invoice / e-way bill preparation records, and supporting document attachments.
- Recurring expense schedules, approval requests, local branch / role profiles, audit trail and enterprise backup.

### Data integrity and service boundaries

- New sales and purchase invoices continue to use the existing SmartLedger transaction engine and double-entry hooks.
- Location stock is initialized from current aggregate stock at first use. Transfers change location balances; total stock is preserved. Sales and purchases are posted against the selected location.
- Quote and order records only change to converted / fulfilled / received after the matching invoice or bill is saved.
- Historical invoices and balances are not rewritten. Customer credit limits apply to new sales only when configured.
- Bank reconciliation uses a user-imported CSV; it is not a direct bank feed.
- GST exports and e-invoice / e-way bill screens are working papers / drafts. They do not submit statutory returns or generate authorised IRNs / e-way bills.
- Branch and staff profiles are local configuration only. Server-enforced role permissions, true multi-branch data isolation and live multi-device cloud synchronisation require a deployed backend and security rules; these are not represented as active in v78.
- AI insights shown in the suite are deterministic summaries from saved data; the existing AI assistant remains a separate connected service.
- Document attachments and enterprise registers are included in SmartLedger account-scoped browser storage. Use the existing full backup export regularly.

The dashboard overview design is unchanged. Mobile layouts continue to use the existing section-specific themes.

# SmartLedger — Version 77.0

**Release track:** SmartLedger v79.0 Android and PWA release, including offline bill OCR, native invoice sharing and full business accounting workflows.

SmartLedger is a mobile-first business manager for Indian retail and wholesale shops.

## Included features

- Responsive dashboard and installable Progressive Web App (PWA).
- Product catalogue with SKU/barcode, unit, stock, purchase price, sale price, GST rate and low-stock threshold.
- Multi-item sales invoices and purchase bills.
- Item-level sales and purchase returns for multi-product invoices, including unit conversion, batch stock, returned cost, GST reversal and balanced accounting entries.
- Automatic stock movement when invoices and bills are saved.
- Weighted-average purchase cost update when stock is purchased.
- Line-level discounts and GST calculation.
- Intra-state CGST/SGST and inter-state IGST split on new invoices.
- Customer and supplier directories with opening balances.
- Customer receipts and supplier payments with payment mode and reference.
- Party-wise outstanding balances and customer gross-profit estimates.
- Expense register, cash/bank book, stock adjustments and low-stock alerts.
- GST management summary, profit/loss estimate and stock valuation.
- Professional sales and purchase invoice previews, print / PDF export, and Android WhatsApp sharing with PDF plus HD invoice image.
- JSON backup and restore with validation and confirmation.
- Offline app shell with automatic service-worker cache updates.
- Android APK: on-device offline supplier-bill OCR for English, Hindi and Urdu. Extracted text stays on the device; review it manually before saving a purchase.


## Version 77.0 — Unified 20-upgrade workspace

The combined upgrade groups existing capabilities and new operational workflows in one **Business Tools → Unified Business Workspace** entry.

- Existing capabilities retained and linked: stock adjustments, low-stock alerts, expiry/batch tracking, barcode scanning, sales and purchase returns, cashbook, GST management summaries, JSON backup/restore, AI business analysis and Business Suite analytics.
- New registers: quotations/estimates, purchase orders, stock transfer records, product price levels (retail/wholesale/distributor/custom), invoice due-date tracking, bank/UPI entries and day-closing snapshots.
- New records are included in the existing JSON backup/restore mapping.
- Mobile-first responsive cards and forms; the dashboard overview and its design are not modified.

### v77 data boundaries

- Quotations and purchase orders are planning records; they do not create sales/purchase invoices, post GST or change stock.
- Stock transfers record source, destination and quantity but do not change total stock. Location-specific opening stock and per-location balances are not yet implemented.
- Price levels are stored in a separate price book and can be read through `smartLedgerPriceFor(productName, level)`; existing sales invoice entry does not automatically switch prices by customer tier yet.
- Due-date reminders are separate tracking records and do not automatically change invoice balances or send notifications.
- Bank/UPI entries are a separate register and are not automatically reconciled with the existing cashbook or payment transactions.
- Day closing saves a snapshot of dated sales, purchases and expenses; it does not lock transactions or perform a certified cash reconciliation.
- Existing cloud-drive backup, login/account separation, AI and analytics capabilities retain their existing limitations. This release does not claim real-time multi-device cloud sync, role-based staff permissions, or statutory GST filing.

## Run and install

1. Serve the repository over HTTPS (GitHub Pages is supported).
2. Open the published site in Chrome on Android.
3. Open Chrome's menu and select **Install app** or **Add to Home screen**.
4. Open SmartLedger from the Android home screen.

Camera barcode scanning requires HTTPS, camera permission and a browser that supports the BarcodeDetector API. Manual SKU/barcode entry remains available.


## Android offline bill scanning

The Android APK bundles the Tesseract OCR engine and English, Hindi and Urdu language models. Open a new purchase bill and use **Scan bill** to extract printed text without sending the image to a cloud OCR service. SmartLedger can suggest an invoice number from the extracted text, but supplier, item, quantity, rate, tax and totals must be checked manually before saving. This scanner is available in the Android APK; the browser PWA continues to support manual purchase entry.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy-pages.yml` deploys the repository when changes are pushed to `main`.

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set the deployment source to **GitHub Actions**.
4. Open **Actions** and wait for **Deploy SmartLedger to GitHub Pages** to complete.
5. Open the Pages URL shown by the deployment.

## Version 16.0 professional billing upgrade

- Billing displays the selected customer's or supplier's previous outstanding amount as **Last Balance**.
- **Total Balance** is calculated live as Last Balance plus the current invoice total.
- **Remaining Balance** updates as the amount paid is entered.
- The balance breakdown is saved with each new invoice and shown on the invoice preview, print/PDF output, and WhatsApp/SMS invoice message.
- Existing transactions and older invoices remain compatible; older invoices without a saved previous balance display zero for that field.

## Version 15.0 readability and business profile upgrade

- Increased text size, weight and contrast across dashboards, navigation, forms, labels, tables, product details and mobile controls.
- Expanded Settings → Business Details with business address, primary and secondary phone numbers, GSTIN, logo upload and authorised signature upload.
- Business logo, address, contact details and signature are included in printed invoice headers.
- Business profile fields and uploaded images are included in JSON backups and restored with older profile fields remaining compatible.

## Version 12.0 mobile workspace upgrade

- Fixed app-shell scrolling: the header and navigation stay in place while only the active page content scrolls. Dialogs keep their own scroll area.
- Replaced horizontal section shortcuts with responsive shortcut grids and a **Show more** tile that opens a full section launcher.
- Expanded item tools with stock summary, low-stock alerts, stock adjustments, spreadsheet import, and a new Item Insights page showing recorded sales/purchase movement, current stock cost value, retail value, and indicative unit margin.
- Added section-specific expanded action launchers across the main work areas.

## Version 11.0 data safety update

- Backup exports carry the SmartLedger app version, backup schema version, and export timestamp.
- Restore checks the app identity and supported backup schema before writing records.
- Existing SmartLedger backup files without version metadata remain supported.
- Before restoring, the app prompts to download a backup of the current records.
- The service-worker cache version is bumped so installed app shells can receive the v11.0 build.

## Data safety and production requirements

Current business records are stored in browser local storage on the device. They are not automatically shared between devices. Download JSON backups regularly and keep a copy outside the phone. Clearing browser site data can remove locally stored records.

This repository does not yet provide cloud accounts, server-side synchronization, multi-device access, server backups, role permissions, subscription billing, payment-gateway integration, official GST return/e-invoice filing, HSN/SAC and place-of-supply compliance checks, or thermal-printer integration. These require a backend, service-provider accounts/credentials, and additional end-to-end testing.

GST and profit figures are management estimates based on the data entered. They are not certified accounting statements or statutory tax returns. Verify tax treatment and reports with a qualified accountant before filing.

SmartLedger is an original product and interface. It is not a pixel-for-pixel copy of Vyapar and does not use Vyapar's proprietary branding or assets.


## Hosting

The app is published from the `main` branch using the GitHub Actions workflow in `.github/workflows/deploy-pages.yml` when GitHub Pages is configured to use GitHub Actions.


## v14.0 — Advanced Inventory & Billing
- Purchase batches and optional expiry dates are recorded against purchase bills.
- Batch register highlights expired and near-expiry stock.
- Sales consume tracked batches by earliest expiry first; sales returns restore original batch allocations when available.
- Sales and purchase returns validate quantities against original transactions and update on-hand stock and cash movement.
- Barcode scan action is available while creating an inventory item where the browser supports BarcodeDetector and camera permission.
- Backup schema v3 includes batch and return registers while remaining compatible with v12 backups.


## v14.0 — Premium inventory experience
- Fixed item edit form markup and save handling, including duplicate name/SKU validation.
- Rebuilt the inventory catalogue as responsive product cards with larger, clearer product details.
- Added a unified matte maroon and metallic light-grey visual system with high-contrast white text on dark surfaces.
- Updated the service-worker cache to v14.0 while preserving existing local records.


## Version 18.0 — Advanced accounting foundation

- Adds a chart of accounts with standard asset, liability, equity, income and expense accounts, plus custom accounts.
- Adds a balanced double-entry general journal with date, reference, narration and multiple debit/credit lines.
- Rejects incomplete, duplicate-reference, negative, one-sided and unbalanced journal entries.
- Adds journal-based trial balance, account ledger, and journal-only profit and balance-sheet summaries with CSV export and print/PDF.
- Includes the new chart of accounts and journal entries in full JSON backup and restore (schema version 4).
- Existing sales, purchases, receipts, payments and expenses are preserved but are not automatically posted into the general ledger yet. Financial statements in this release are explicitly journal-only until transaction migration and opening-balance reconciliation are completed.


## Version 40.0 — Unified Business Suite

This consolidated release brings the planned business-management upgrades into one major application update.

- **Business Suite workspace:** overview, finance, inventory, GST, customer insights, supplier insights, reorder planning and data health.
- **Automatic double-entry posting for new activity:** new sales, purchase bills, customer receipts, supplier payments, expenses and returns post source-linked journal entries. Posting IDs prevent duplicate entries.
- **Financial intelligence:** recorded sales, sales returns, recorded item cost, expenses, gross profit and estimated net profit.
- **Inventory intelligence:** stock-at-cost and potential retail valuation, low-stock monitoring, slow-moving candidates, batch expiry watch and reorder suggestions based on current stock and the previous 30 days of sales.
- **GST management summary:** taxable sales/purchases, output/input GST, CGST/SGST/IGST summary and CSV export.
- **Customer and supplier analysis:** party sales/purchase totals, invoice counts and outstanding balances.
- **Data health:** duplicate invoice and SKU checks, negative-stock checks, uncosted sales warnings, journal balance checks and automatic-posting exception list.
- **Export and recovery:** CSV summaries and full JSON backup/restore including chart of accounts, journals and posting exceptions.
- **App-wide charcoal / near-black and champagne theme** with higher contrast, responsive Business Suite screens and updated offline cache.

### Accounting and data boundaries

- Existing records are preserved. **Only new transactions saved after v40.0 are automatically posted** to the general ledger; historical records are not migrated automatically.
- Sales and purchase return journals are simplified management entries. Tax and inventory valuation treatment must be reviewed before using them for statutory books.
- Profit is an estimate based on saved item costs and saved expenses. Missing historical costs can affect accuracy.
- GST screens are management summaries, not GST returns or e-filing.
- The app remains local-first on this device. Cloud sync, staff accounts, remote access, encrypted server backup, payment gateways, SMS providers and e-invoice integrations require separate backend services and credentials.
