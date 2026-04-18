# Deploying the Pharma Bill Extractor (for first-time deployers)

This guide is written for someone who has never deployed a web app. You only need a browser. No command line, no installs.

You'll do this in 4 stages:

1. Get an Anthropic API key (you already know how — `console.anthropic.com`).
2. Put the code on GitHub (free).
3. Deploy it to Vercel (free).
4. Add two environment variables and share the URL with your team.

Total time: ~10 minutes.

---

## Stage 1 — Anthropic API key

1. Sign in at https://console.anthropic.com
2. Add a payment method under **Plans & Billing → Billing** (a small amount like $10 is plenty to start).
3. Go to **API Keys → Create Key**. Copy the key (starts with `sk-ant-...`). Keep it somewhere safe — you can't see it again later.

## Stage 2 — Put the code on GitHub

1. Go to https://github.com and sign up for a free account (if you don't have one).
2. Click the **+** button top-right → **New repository**.
3. Give it a name like `pharma-bill-extractor`. Leave it Public or Private (either works). Don't initialize with a README. Click **Create repository**.
4. On the next page, click **uploading an existing file**.
5. Drag this entire folder's contents (index.html, DEPLOY.md, vercel.json, and the `api` folder) into the upload box.
6. Scroll down and click **Commit changes**.

Your code is now on GitHub.

## Stage 3 — Deploy on Vercel

1. Go to https://vercel.com and click **Sign up**. Choose **Continue with GitHub** — this links the two accounts.
2. After signing up, click **Add New → Project**.
3. You'll see your GitHub repos listed. Click **Import** next to `pharma-bill-extractor`.
4. On the import screen, **don't change any settings** — just scroll down to **Environment Variables** and add:

   | Name                | Value                                |
   | ------------------- | ------------------------------------ |
   | `ANTHROPIC_API_KEY` | your `sk-ant-...` key from Stage 1   |
   | `TEAM_PASSWORD`     | any password you pick (e.g. `PharmaOnc2026`) |

5. Click **Deploy**. Wait ~30 seconds.
6. When it's done, Vercel gives you a URL like `pharma-bill-extractor-xyz.vercel.app`. That's your tool.

## Stage 4 — Share with your team

Send your team:
- The URL from Vercel.
- The `TEAM_PASSWORD` you chose.

They open the URL → enter the password once → use the tool. Their drug and vendor master lists are saved in their own browser. You can share lists by exporting/copying the textarea contents.

---

## Optional: custom domain

In Vercel project settings → **Domains** → add e.g. `billtool.oncarecancer.com`. Follow the DNS instructions. Takes 5 minutes.

## Changing the password or rotating the API key

Vercel project → **Settings → Environment Variables** → edit the value → click **Redeploy** on the latest deployment. Takes 20 seconds. No code change needed.

## Monitoring spend

Anthropic Console → **Plans & Billing → Usage**. You can set hard monthly caps there so the bill can never exceed X.

## Troubleshooting

- **"Incorrect password"** at the gate → check `TEAM_PASSWORD` env var in Vercel matches exactly (case-sensitive).
- **"Server not configured"** in the tool → `ANTHROPIC_API_KEY` env var is missing or misspelled in Vercel.
- **Timeouts on huge PDFs** → the Vercel free tier allows 60-second runs; very large bills may need to be split or retried.
- **File too large** → payload limit is ~4.5 MB. If a PDF is bigger, re-save it as a compressed PDF or upload page-by-page.
