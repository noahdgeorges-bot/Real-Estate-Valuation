# PropVal — Real Estate Valuation Engine

A professional React web app for generating real estate valuations across multiple property types using Cap Rate/NOI, DCF, and Comparable Sales analysis.

## Features

- **Property Types**: Residential, Multi-Family, Commercial, Industrial
- **Valuation Methods**:
  - Cap Rate / NOI valuation
  - Discounted Cash Flow (DCF) with IRR estimation
  - Comparable Sales (price per sqft analysis)
- Live recalculation as you change inputs
- DCF cash flow chart by year
- Valuation range comparison across all 3 methods

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Then open http://localhost:3000

---

## Deploy to Railway

### Option A: GitHub + Railway (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PropVal"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Connect to Railway**
   - Go to https://railway.app and sign in
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select your repository
   - Railway auto-detects the `railway.json` config
   - Click **Deploy** — your app will be live in ~2 minutes!

3. **Get your URL**
   - Railway will assign a URL like `https://propval-production.up.railway.app`
   - You can add a custom domain in Railway's settings

### Option B: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

---

## Project Structure

```
real-estate-valuation/
├── index.html                   # Entry HTML
├── vite.config.js               # Vite configuration
├── railway.json                 # Railway deployment config
├── package.json
└── src/
    ├── main.jsx                 # React root
    ├── App.jsx                  # Main layout + state
    ├── index.css                # Global design tokens
    ├── components/
    │   ├── Header.jsx           # Top bar
    │   ├── AssumptionsPanel.jsx # Input sidebar
    │   └── ResultsPanel.jsx     # Results + charts
    └── utils/
        └── valuations.js        # Valuation math engine
```

---

## Valuation Methodology

### Cap Rate / NOI
```
NOI = Effective Gross Income - Operating Expenses
EGI = Gross Rent × (1 - Vacancy Rate)
Value = NOI / Cap Rate
```

### DCF
```
Value = Σ(NOI_t / (1+r)^t) + Terminal Value / (1+r)^n
Terminal Value = NOI_(n+1) / Exit Cap Rate
```

### Comparable Sales
```
Price per sqft = Sale Price / Sqft  (for each comp)
Value = Median($/sqft) × Subject Sqft
```
