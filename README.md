# SmartLedger — Version 12.0

**Release track:** SmartLedger v12.0 mobile workspace upgrade. The v11.0 development branch is `release/smartledger-v11.0`; changes are being validated before merging to the live `main` branch.

SmartLedger is a mobile-first business manager for Indian retail and wholesale shops.

## Included features

- Responsive dashboard and installable Progressive Web App (PWA).
- Product catalogue with SKU/barcode, unit, stock, purchase price, sale price, GST rate and low-stock threshold.
- Multi-item sales invoices and purchase bills.
- Automatic stock movement when invoices and bills are saved.
- Weighted-average purchase cost update when stock is purchased.
- Line-level discounts and GST calculation.
- Intra-state CGST/SGST and inter-state IGST split on new invoices.
- Customer and supplier directories with opening balances.
- Customer receipts and supplier payments with payment mode and reference.
- Party-wise outstanding balances and customer gross-profit estimates.
- Expense register, cash/bank book, stock adjustments and low-stock alerts.
- GST management summary, profit/loss estimate and stock valuation.
- Printable invoice preview, browser print / Save as PDF, and WhatsApp invoice summary sharing.
- JSON backup and restore with validation and confirmation.
- Offline app shell with automatic service-worker cache updates.

## Run and install

1. Serve the repository over HTTPS (GitHub Pages is supported).
2. Open the published site in Chrome on Android.
3. Open Chrome's menu and select **Install app** or **Add to Home screen**.
4. Open SmartLedger from the Android home screen.

Camera barcode scanning requires HTTPS, camera permission and a browser that supports the BarcodeDetector API. Manual SKU/barcode entry remains available.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy-pages.yml` deploys the repository when changes are pushed to `main`.

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set the deployment source to **GitHub Actions**.
4. Open **Actions** and wait for **Deploy SmartLedger to GitHub Pages** to complete.
5. Open the Pages URL shown by the deployment.

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


## v13.0 — Advanced Inventory & Billing
- Purchase batches and optional expiry dates are recorded against purchase bills.
- Batch register highlights expired and near-expiry stock.
- Sales consume tracked batches by earliest expiry first; sales returns restore original batch allocations when available.
- Sales and purchase returns validate quantities against original transactions and update on-hand stock and cash movement.
- Barcode scan action is available while creating an inventory item where the browser supports BarcodeDetector and camera permission.
- Backup schema v3 includes batch and return registers while remaining compatible with v12 backups.
