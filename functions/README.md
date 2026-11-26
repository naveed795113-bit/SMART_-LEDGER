# SmartLedger legacy Firebase Functions

The current SmartLedger AI assistant does **not** use this Firebase Functions backend. Hosted AI requests are sent directly from the app to NVIDIA NIM using the user's NVIDIA Build API key, held in browser/app session storage only.

## Do not deploy this legacy function

This directory contains the earlier OpenAI/Firebase Functions prototype. It is retained as legacy source only and is not required for the NVIDIA integration. Do not run `firebase deploy --only functions` or configure an OpenAI API key for SmartLedger AI.

The app's Firebase Authentication setup remains separate and is not changed by this AI provider migration.

## NVIDIA AI setup

1. Open SmartLedger and launch AI Business Manager.
2. Ask a question; when prompted, enter your NVIDIA Build API key.
3. The key is held in session storage for the current app/browser session. Clear it using **Clear NVIDIA key** when finished.
4. The current default model is `meta/llama-3.3-70b-instruct`. The account must have access to that model in NVIDIA Build.

NVIDIA API endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`.

## Privacy and security

When hosted AI is used, a limited business snapshot containing selected sales, purchase, inventory, customer and supplier figures is sent to NVIDIA with the question. Do not use this option on a shared device. Session storage is not a secure vault: someone with access to the running app or browser developer tools may be able to read the key. Never commit the key to GitHub or paste it into ChatGPT.

The Insights, Inventory, Alerts and Reports tabs continue to run locally without a hosted AI key. Hosted NVIDIA AI availability and free usage limits are controlled by NVIDIA and may change.
