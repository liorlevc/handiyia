<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cd5fa271-e785-42f8-8b00-53101e5a7805

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Render (onrender.com)

This app is a Vite SPA, so deploy it as a **Static Site** on Render.

### Option 1 (recommended): Deploy with `render.yaml`

This repository now includes a Render Blueprint config at [`render.yaml`](./render.yaml).

1. Push this repo to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select your repo and branch.
4. When prompted for environment variables, set:
   - `GEMINI_API_KEY` = your Gemini API key
5. Click **Apply** to create the service.

### Option 2: Manual setup in Render UI

If you do not use Blueprint:

- **Service type:** Static Site
- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Auto deploy:** On Commit (recommended)
- **Environment variable:** `GEMINI_API_KEY`
- **Rewrite rule (for SPA routing):**
  - Source: `/*`
  - Destination: `/index.html`

### Important security note

This project currently uses `GEMINI_API_KEY` in client-side code at build time. That means the key can be exposed to end users via bundled JavaScript. For production-grade security, move Gemini calls to a backend service and keep the API key server-side.
