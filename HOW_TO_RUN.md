# 🚀 How to Run WHIPLASH (WHY MOVED?)

Follow these simple steps to extract, set up, and run **WHIPLASH (Market Velocity & Anomaly Detective)** on your local machine.

---

## 📋 System Prerequisites

* **Node.js**: `v18.18.0` or higher (Recommended: Node.js 20+ LTS)
* **npm**: `v9.0.0` or higher (bundled with Node.js)
* **OS**: Windows, macOS, or Linux

---

## 🛠️ Step-by-Step Execution Guide

### 1. Extract the ZIP File
Extract `whiplash_submission.zip` into a directory of your choice.

```bash
# Navigate into the extracted project directory
cd groww_hack
```

---

### 2. Install Project Dependencies
Run `npm install` to install Next.js 16, React 19, Recharts, Lucide Icons, and Vitest.

```bash
npm install
```

---

### 3. Run the Development Server
Start the local Next.js development server:

```bash
npm run dev
```

Once started, open your web browser and navigate to:
👉 **`http://localhost:3000`**

---

### 4. Run the Automated Test Suite (Vitest)
To verify the **10-Signal Change Detection Engine**, **Data Reconciler**, and **Snapshot Idempotency**:

```bash
npm test
```
*All test suites should pass with 100% green indicators.*

---

### 5. Build for Production (Optional)
To verify that the TypeScript compiler and Next.js Turbopack build succeed without errors:

```bash
npm run build
npm start
```

---

## 🧪 Demo Scenarios to Try in the App

When you open `http://localhost:3000`:

1. **"While You Were Away..." Hero Banner**: Demonstrates return state detection comparing current market conditions against your last visit timestamp.
2. **NVDA (High Attention - ⚡ PRICE_SHOCK & 📊 VOLUME_SHOCK)**: Click on NVDA to open the **Forensic WHY? Panel** and see intraday timeline & relative context vs S&P 500 & Tech Sector.
3. **AMD (High Attention - ↩️ REVERSAL)**: Demonstrates an intraday direction shift (morning rally fading into afternoon drop).
4. **AAPL (Normal Movement)**: Muted in the collapsed list to avoid alert fatigue.
5. **TSLA & INTC (Data Health Warnings)**: Demonstrates handling stale feeds and provider conflicts.
6. **Watchlist Manager & Search**: Add or remove symbols to create custom watchlists.
7. **Simulate Returning Visit**: Click the **"Simulate Return Visit"** button in the header to trigger dynamic return animations and baseline recalculations.
