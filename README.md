# WHIPLASH: Market Change Detection

WHIPLASH is a market-watchlist application that helps users identify movements that are unusual relative to recent price, volatility, volume, market, and sector behavior.

## What it does

- Fetches live or most-recent official US market data from Yahoo Finance.
- Calculates daily change from the previous close.
- Calculates average volume from the previous 20 trading sessions.
- Calculates historical volatility from recent daily returns.
- Compares a symbol with the S&P 500 and, for supported symbols, a relevant sector ETF.
- Highlights price shocks, volume anomalies, divergence, reversals, and volatility expansion.
- Provides a timeline and a transparent signal-by-signal explanation.
- Validates symbols against the live provider before adding them to a watchlist.

## Market data status

During US regular market hours, the app shows the latest provider quote. Outside regular hours, it displays `Market closed - last close`; this is the latest official close rather than an unavailable value.

The built-in provider is suitable for a market-awareness product, but it does not provide exchange-licensed or guaranteed real-time data. A licensed market-data provider is required for regulated or trading-grade real-time use.

## Persistence

Watchlists and personal observation baselines are stored in browser local storage. They remain available after page refreshes, local backend restarts, and redeployment for the same browser profile. Clearing site data removes them. User accounts, cross-device sync, and database-backed persistence are the next planned Supabase integration.

## Run locally

Requirements: Node.js 20+ and npm 9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verify the app

1. Press **Refresh Market** to retrieve updated data.
2. Use **Manage** to add a valid US ticker.
3. Press **Establish Baseline**.
4. Return later and refresh to see the actual price change since that baseline.

## Tests and production build

```bash
npm run test
npm run build
npm start
```

## Project structure

```text
src/
  app/                  Next.js pages and API routes
  components/           Interface components
  services/
    attention/          Ranking and feed construction
    change-detection/   Signals, classifications, and explanations
    market-data/        Provider abstraction and Yahoo Finance provider
    snapshot/           Observation snapshot helpers
    user-state/         User baseline helpers
    watchlist/          Watchlist helpers
  tests/                Unit tests
```

## Supabase plan

Supabase will add authenticated users and durable PostgreSQL storage for watchlists, observations, and snapshots. Keep database passwords and privileged keys in `.env.local`; do not commit them to GitHub.
