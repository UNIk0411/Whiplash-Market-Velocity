# WHIPLASH ⚡ — Market Velocity & Anomaly Detective

> **CODE 2026 Submission**
> *"Users don't actually want to repeatedly check their watchlist. They want to know what changed, whether it is unusual, and what deserves their attention now."*

---

## # How I interpreted the brief

**The obvious solution is a stock watchlist table with price and percentage columns.**
**The actual problem is human attention.**

Every day, millions of investors refresh stock dashboards only to be greeted by generic green/red percentages (+0.4%, -0.2%) with zero contextual awareness. Traditional finance applications force users to manually compute:
1. *Is +3% normal or abnormal for NVDA vs AAPL?*
2. *Did the whole sector move or is this isolated?*
3. *What changed since I last checked yesterday afternoon?*

**WHY MOVED?** redefines the category. It replaces static CRUD ticker tables with an **Attention Board** driven by personal market memory, 10 deterministic signals, and semantic change stories (`PRICE_SHOCK`, `VOLUME_SHOCK`, `DIVERGENCE`, `REVERSAL`, etc.).

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  NEXT.JS FRONTEND                                 |
|  +-----------------------------------------------------------------------------+  |
|  | Attention Board (Homepage)                                                   |  |
|  |  ├── Return Hero ("While you were away...")                                  |  |
|  |  ├── Ranked Attention Queue (HIGH / ATTENTION / NOTABLE Change Stories)      |  |
|  |  ├── Normal Movement List ("Nothing important changed")                    |  |
|  |  └── Watchlist Manager & Baseline Onboarding                               |  |
|  +-----------------------------------------------------------------------------+  |
|  | Forensic "WHY?" Investigation Panel                                         |  |
|  |  ├── Micro Forensic Timeline (09:30 AM → 03:30 PM)                           |  |
|  |  ├── Relative Context (Symbol vs Sector vs S&P 500)                         |  |
|  |  └── Non-Causal Explanation Engine                                          |  |
|  +-----------------------------------------------------------------------------+  |
+----------------------------------------│------------------------------------------+
                                         │ REST API
+----------------------------------------▼------------------------------------------+
|                                API & SERVICE LAYER                                |
|  +---------------------------+  +---------------------------+  +----------------+  |
|  |  Change Detection Engine  |  |     Snapshot Service      |  |  User Memory   |  |
|  |  - 10 Signals & 0-100 Score |  |   - Idempotent Ingestion  |  |  - Last-Seen   |  |
|  |  - Semantic Tagging       |  |   - Hash Deduplication    |  |    Baselines    |  |
|  +---------------------------+  +---------------------------+  +----------------+  |
|                                        │                                          |
|  +-------------------------------------▼---------------------------------------+  |
|  |                          Market Data Abstraction                            |  |
|  |  ├── MarketDataProvider Interface                                           |  |
|  |  ├── MockMarketDataProvider (Deterministic rich test scenarios)             |  |
|  |  ├── DataReconciler (Conflict detection, timestamp ordering, freshness)       |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## Key Features

### 1. Market Memory ("Last time you checked")
Every time a user returns, the system compares the current market state against the user's stored baseline (e.g. *Yesterday, 4:42 PM*). It shows:
- Absolute and percentage delta since user's previous check
- Attention rank transition (e.g. `NORMAL → HIGH`)
- Dynamic return state transition animation ("Comparing with your last visit...")

### 2. Deterministic Meaningful Change Engine (10 Signals)
No black-box AI for numerical classification. The engine evaluates 10 explicit signals:
1. **Price Movement Magnitude**: Raw % move scaled to asset baseline.
2. **Relative Movement vs Volatility**: Compares move against 20-day historical standard deviation.
3. **Volume Anomaly**: Ratio vs 20-day average volume baseline.
4. **Market Index Divergence**: Outperformance/underperformance vs S&P 500 benchmark.
5. **Sector Benchmark Divergence**: Relative movement vs specific sector (e.g. Semiconductors XLK).
6. **Intraday Dynamics & Gap**: Span between opening price, high, low, and current price.
7. **Data Quality & Reliability**: Penalizes confidence if data is stale or conflicting.
8. **User Memory Delta**: Change relative to user's last observed timestamp.
9. **Trend Momentum**: Persistence of intraday direction.
10. **Direction Reversal Signal**: Identifies morning rallies that turned into afternoon declines.

Calculates **Meaningfulness Score (0–100)** mapped to Attention Levels:
- `0–31`: **NORMAL** ("Nothing important changed")
- `32–54`: **NOTABLE**
- `55–74`: **ATTENTION**
- `75–100`: **HIGH ATTENTION**

### 3. Change Stories & Non-Causal Explanations
Generates transparent, structured explanations strictly separating **OBSERVATIONS** (numerical facts) from **INTERPRETATIONS** (contextual statistical inferences).
*Never states unsupported external causation (e.g., "NVDA rose because of AI demand").*

### 4. Forensic "WHY?" Panel
Clicking any Change Story opens a forensic timeline:
- Intraday timeline progression (09:30 AM → 03:30 PM)
- Relative context comparison vs Sector and Market benchmarks
- 10-signal evidence breakdown matrix with confidence indicators

### 5. Semantic Change Types
Tagging engine identifies:
- `PRICE_SHOCK`: Unusually large price move (>2x volatility)
- `VOLUME_SHOCK`: Trading volume >1.8x baseline
- `DIVERGENCE`: Symbol moving opposite to its sector
- `REVERSAL`: Intraday direction shift after peak
- `VOLATILITY_EXPANSION`: Movement range expanded
- `RELATIVE_OUTPERFORMANCE`: Separating from benchmark
- `DATA_WARNING`: Stale data or multi-provider disagreement

---

## Data Reliability & Edge Cases

### Provider Conflict Resolution (`DataReconciler`)
- Detects discrepancies >1% between market providers (e.g. Provider A $21.40 vs Provider B $21.85).
- Prefers newer timestamps, flags `DATA_WARNING`, and reduces confidence score to 0.65.

### Freshness States
- `LIVE`: Updated <= 15 mins ago
- `RECENT`: Updated <= 30 mins ago
- `STALE`: Updated > 30 mins ago (displays yellow warning badge)
- `UNAVAILABLE`: Data unreachable

### Idempotent Snapshot Architecture
- Prevents duplicate snapshot or change event creation even if user refreshes 5 times in 5 seconds.
- Computes deterministic hash `symbol_price_volume_observedAt` to eliminate duplicate ingestion.

---

## Scalability & Performance

- **Market Data Normalization**: Shared observation cache prevents $N \times U$ API calls (1,000 users watching NVDA triggers 1 cached fetch, not 1,000 requests).
- **User Memory Separation**: User-specific "last seen" states stored independently from shared market snapshots.
- **Batch Processing**: Queries symbols in batch via `getBatchObservations`.

---

## Running the Application & Tests

### Installation
```bash
npm install
```

### Run Unit Tests
Runs Vitest test suite verifying Change Engine, Data Reconciler, and Snapshot Idempotency:
```bash
npm test
```

### Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Scenarios Included

The app includes a deterministic demo dataset covering crucial edge cases:
- **NVDA**: High Attention (+4.8%, 2.4x volume, sector divergence)
- **AMD**: High Attention (-3.7%, reversal, volume surge)
- **MSFT**: Notable (+2.1%, relative outperformance)
- **AAPL**: Normal (+0.4%, normal volume)
- **TSLA**: Stale data warning (observed 38m ago)
- **INTC**: Multi-provider disagreement warning (confidence penalty)
- **AMZN**: Intraday reversal (opened +2.5%, closed -1.8%)

---

## Intentionally NOT Built (Tradeoffs)

1. **Brokerage Trading / Buy/Sell Buttons**: This is an awareness and attention tool, not a trading platform.
2. **LLM Black-Box Math**: AI was NOT used for core numerical scoring; all signals are 100% deterministic and explainable.
3. **Complex Microservices**: Next.js service boundaries provide clean modular separation without unnecessary network latency.
