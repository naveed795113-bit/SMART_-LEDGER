# SmartLedger

SmartLedger is a mobile-first business management web app for Indian retailers and wholesalers.

## Implemented in this repository
- Responsive dashboard and Android-installable PWA foundation
- Product catalogue with SKU/barcode value, purchase and sale prices, GST rate and low-stock threshold
- Sales and purchase entry with stock movement, discount, GST calculation and payment mode
- Customer and supplier directories with opening balances
- Customer/supplier payment register and party balance summaries
- Customer-wise gross profit estimate based on recorded item cost
- Expense register and cash/bank movement register
- Stock adjustments and low-stock alerts
- GST summary report (management estimate, not a statutory return)
- Invoice preview, browser print / Save as PDF, and WhatsApp text sharing
- JSON backup and restore
- Service-worker offline shell

## Run locally
Open `index.html` in a browser, or serve this folder over HTTPS. Camera barcode scanning requires a supported browser, camera permission and HTTPS.

## Publish with GitHub Pages
A GitHub Actions workflow is included at `.github/workflows/deploy-pages.yml`. In the repository, open **Settings → Pages** and set the build/deployment source to **GitHub Actions**. Then open the **Actions** tab and check the deployment run. Once published, open the Pages URL in Chrome on Android and use **Install app** / **Add to Home screen**.

## Data and production limitations
Current records are stored in browser local storage on one device. Use JSON backups; clearing browser data can remove records. Cloud synchronization, user authentication, multi-device access, server backups, official GST return/e-invoice integration, HSN/SAC and place-of-supply validation, separate CGST/SGST/IGST logic, thermal printer drivers, payment gateway, and automated WhatsApp delivery require backend services, provider credentials and further testing. GST totals are informational estimates only. The current billing workflow is not a certified accounting or tax-filing system.

This is an original SmartLedger product and interface. It is not a pixel-for-pixel copy of Vyapar and does not use Vyapar's proprietary branding or assets.
