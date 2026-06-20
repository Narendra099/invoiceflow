# Deploying InvoiceFlow

The project is set up as a **single web service**: in production, Express serves both the REST API (`/api/*`) and the built React app (everything else) from one URL. That means **one deploy, one link, no CORS setup**.

Recommended host: **Render** (free tier, runs a real Node server — the right fit for Express + SQLite). Railway works the same way. Vercel/Netlify are **not** recommended for this app because they're serverless and won't persist the SQLite database.

---

## Part 1 — Push to GitHub (one time)

1. Create a new **empty** repo on GitHub (no README/license) — e.g. `invoiceflow`.
   https://github.com/new
2. In this folder, connect and push:

```bash
cd /Users/narendra/projects/invoiceflow
git branch -M main
git remote add origin https://github.com/Narendra099/invoiceflow.git   # <-- use your repo URL
git push -u origin main
```

If GitHub asks for a password, use a **Personal Access Token** (Settings → Developer settings → Tokens), not your account password.

---

## Part 2 — Deploy on Render (free)

**Option A — Blueprint (easiest, uses `render.yaml` already in the repo):**

1. Go to https://dashboard.render.com → **New +** → **Blueprint**.
2. Connect your GitHub and select the `invoiceflow` repo.
3. Render reads `render.yaml`, shows one web service → click **Apply**.
4. Wait ~2–4 min for the first build. You'll get a URL like `https://invoiceflow.onrender.com`.

**Option B — Manual web service:**

1. **New +** → **Web Service** → pick the repo.
2. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
3. Add environment variable `NODE_ENV = production`.
4. **Create Web Service.**

That's it — your live portfolio link is the Render URL. 🎉

---

## Notes & gotchas

- **Free tier sleeps:** Render free services spin down after ~15 min idle; the first request afterward takes ~30s to wake. Fine for a demo/portfolio.
- **Data resets on free tier:** the SQLite file lives on an ephemeral disk, so demo data clears on each redeploy/restart. To make data persistent, upgrade and attach a disk, then set `DB_PATH=/data/invoiceflow.db` (see the commented section in `render.yaml`).
- **Custom domain:** Render lets you add one for free under the service's *Settings → Custom Domains*.

---

## Deploying on Railway instead (alternative)

1. https://railway.app → **New Project** → **Deploy from GitHub repo**.
2. Railway auto-detects Node. Set:
   - **Build:** `npm run build`
   - **Start:** `npm start`
3. Add `NODE_ENV=production`. Deploy → open the generated domain.

---

## Local production test (optional)

To preview exactly what the host runs:

```bash
npm run build
cd server && NODE_ENV=production npm start
# open http://localhost:4000
```
