# SmartLedger OpenAI AI backend

SmartLedger AI uses the OpenAI Responses API through a Firebase HTTPS Function. The OpenAI key is stored in Firebase Secret Manager and is never shipped to the browser or APK.

## One-time setup

1. Open Firebase Console for project `smart-ledger-288a4` and upgrade the project to the Blaze plan (Cloud Functions deployment requires billing).
2. In a trusted terminal logged into the same Firebase project, from the repository root run:

```bash
npm install -g firebase-tools
firebase login
firebase use smart-ledger-288a4
firebase functions:secrets:set OPENAI_API_KEY
```

Paste your OpenAI API key only into the secure terminal prompt. Do not commit it, add it to GitHub source, or paste it into ChatGPT.
3. Install function dependencies and deploy:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions:smartLedgerAI
```

4. The function is deployed in `asia-south1` at:

`https://asia-south1-smart-ledger-288a4.cloudfunctions.net/smartLedgerAI`

## Data and privacy

The app asks for consent before the first AI request. It sends a limited snapshot of sales, purchases, inventory, balances and selected recent transactions to OpenAI so the model can answer questions about the shop. Firebase Authentication ID tokens are verified by the backend. The function does not accept unauthenticated requests. OpenAI Responses are requested with `store: false`.

The function currently permits the GitHub Pages app origin and the SmartLedger Firebase Hosting origins. Add any future production app origin to the allowlist in `functions/index.js` before deploying.

## Cost and access

OpenAI API usage is billed separately by OpenAI and is not included in a ChatGPT subscription. Monitor API usage and configure project spending limits in the OpenAI Platform. Firebase Functions and Secret Manager may also incur Google Cloud charges.
