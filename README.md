# SmartLedger — Version 69.0

**Release track:** SmartLedger v69.0 Android and PWA release, including offline bill OCR, native invoice sharing and full business accounting workflows.

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
