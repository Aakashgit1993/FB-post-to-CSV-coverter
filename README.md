# FB Post → CSV Builder

Paste raw Facebook posts (with embedded URLs), AI parses and extracts structured data, download as CSV.

## Deploy to Render (5 minutes)

### Step 1 — Push to GitHub
1. Create a new GitHub repo (e.g. `fb-csv-builder`)
2. Upload all files from this folder to the repo root

### Step 2 — Create a Web Service on Render
1. Go to dashboard.render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: fb-csv-builder (or anything)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Click **Create Web Service**

### Step 3 — Add your Anthropic API key
1. In Render dashboard → your service → **Environment**
2. Add environment variable:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-...your key...`
3. Click **Save Changes** — Render auto-redeploys

Your app will be live at `https://fb-csv-builder.onrender.com` (or similar).

## Local development
```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... node server.js
# Open http://localhost:3000
```

## How it works
- **Frontend**: Plain HTML/CSS/JS (`public/index.html`)
- **Backend**: Express server (`server.js`) proxies Anthropic API — key stays secret
- **De-duplication**: by Author name + Content
- **CSV columns**: Type, Date, Author name, Author Profile URL, Content, Post Link, AI Summary Notes

## Notes
- Render's free tier spins down after inactivity — first load may take ~30 seconds
- Upgrade to a paid instance ($7/mo) for always-on performance
