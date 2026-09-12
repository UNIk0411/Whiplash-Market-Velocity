# Implementation Plan: WHY MOVED? — Smart Market Watchlist & Market Change Detective

Build a smart market awareness and change detection system that shifts the primary financial interface from "price tables" to "market change stories and attention queues".

## Core Product Vision
- **Problem**: Investors don't want to repeatedly check static ticker tables; they need to know *what meaningfully changed* since their last check, *how unusual it is*, and *what deserves attention*.
- **Solution**: A Market Change Detective that tracks user memory snapshots, runs a 10-signal deterministic Meaningful Change Engine, classifies changes into semantic types (`PRICE_SHOCK`, `VOLUME_SHOCK`, `DIVERGENCE`, etc.), and delivers a forensic investigation experience ("Why Panel").

---

## Architecture & Component Design

```
+-----------------------------------------------------------------------------------+
|                                  NEXT.JS FRONTEND                                 |
|  +-----------------------------------------------------------------------------+  |
|  | Attention Board (Homepage)                                                   |  |
|  |  ├── Return Banner ("While you were away...")                                |  |
|  |  ├── Attention Queue (High / Notable Change Stories)                         |  |
|  |  ├── Normal Movement List ("Nothing important changed")                    |  |
|  |  └── Watchlist Manager & First-Time Onboarding                             |  |
|  +-----------------------------------------------------------------------------+  |
|  | Forensic "WHY?" View (Modal / Page)                                          |  |
|  |  ├── Micro Forensic Timeline & Evidence Matrix                             |  |
|  |  ├── Relative Context (Symbol vs Sector vs Market Index)                     |  |
|  |  └── Deterministic Natural Language Explanation                            |  |
|  +-----------------------------------------------------------------------------+  |
+----------------------------------------│------------------------------------------+
                                         │ REST API / Server Actions
+----------------------------------------▼------------------------------------------+
|                                API / SERVICE LAYER                                |
|  +---------------------------+  +---------------------------+  +----------------+  |
|  |   Change Detection Engine |  |     Snapshot Service      |  |  User Memory   |  |
|  |   - 10 Signals & Scoring  |  |   - Idempotent Ingestion  |  |  - Last-Seen   |  |
|  |   - Semantic Classification| |   - Hash & Ts Deduplication| |    Baselines    |  |
|  +---------------------------+  +---------------------------+  +----------------+  |
|                                        │                                          |
|  +-------------------------------------▼---------------------------------------+  |
|  |                          Market Data Abstraction                            |  |
|  |  ├── MarketDataProvider Interface                                           |  |
|  |  ├── MockMarketDataProvider (Deterministic scenarios)                        |  |
|  |  ├── ExternalMarketDataProvider (AlphaVantage / Yahoo / Finnhub)             |  |
|  |  └── Data Reconciler (Timestamp prioritization, conflict scoring, freshness)  |  |
|  +-----------------------------------------------------------------------------+  |
+----------------------------------------│------------------------------------------+
                                         │ Prisma ORM
+----------------------------------------▼------------------------------------------+
|                                    SQLITE DATABASE                                |
|   Users | Watchlists | WatchlistItems | MarketObservations | Snapshots | ChangeEvents|
+-----------------------------------------------------------------------------------+
```

---

## Proposed Modules & Domain Logic

### Services & Domain (`/src/services`)
- `market-data/`: `types.ts`, `provider-interface.ts`, `mock-provider.ts`, `reconciler.ts`
- `change-detection/`: `engine.ts` (10 signals & 0-100 scoring), `change-types.ts`, `story-generator.ts`
- `snapshot/`: `snapshot-service.ts` (Idempotent hashing & timestamp deduplication)
- `user-state/`: `memory-service.ts` (Per-user per-symbol "Last Seen" state & delta calculator)

### Database Layer (`/prisma`)
- `schema.prisma`: User, Watchlist, WatchlistItem, MarketObservation, UserObservation, ChangeEvent

### Frontend UI (`/src/app` & `/src/components`)
- `page.tsx`: Attention Board (Hero "While you were away", Attention Queue, Normal List)
- `WhyPanelModal.tsx`: Forensic timeline, sector vs market relative context, evidence breakdown
- `WatchlistManager.tsx`: Watchlist CRUD and symbol search

---

## Verification Plan

### Automated Tests
1. **Change Engine Tests**: Test 10 signals, threshold logic, and semantic change tags.
2. **Snapshot Idempotency**: Test rapid identical snapshots, ensuring no duplicate change events.
3. **Data Reconciler**: Test handling of out-of-order data and stale provider conflict flags.

### Manual Verification
1. First-time user baseline establishment.
2. Returning user comparison experience.
3. Responsive desktop, tablet, and mobile layouts.
