import { describe, expect, it } from 'vitest';
import { DataReconciler } from '../services/market-data/reconciler';
import { MarketObservation } from '../services/market-data/types';

describe('DataReconciler', () => {
  const obsA: MarketObservation = {
    symbol: 'INTC',
    companyName: 'Intel Corp',
    sector: 'Semiconductors',
    price: 21.4,
    change: -0.75,
    changePercent: -3.3,
    volume: 54000000,
    avgVolume: 42000000,
    volatility: 2.0,
    high: 22.4,
    low: 21.5,
    open: 22.3,
    marketReturn: 0.4,
    sectorReturn: 1.0,
    source: 'Provider A',
    freshness: 'LIVE',
    confidence: 0.95,
    observedAt: '2026-09-04T10:01:00.000Z',
  };

  const obsB: MarketObservation = {
    ...obsA,
    price: 21.85, // Disagrees with Provider A (>1% diff)
    source: 'Provider B',
    observedAt: '2026-09-04T10:00:52.000Z',
  };

  it('detects provider conflict and reduces confidence score', () => {
    const reconciled = DataReconciler.reconcile([obsA, obsB]);
    expect(reconciled.price).toBe(21.4); // Prefers newer timestamp
    expect(reconciled.confidence).toBeLessThanOrEqual(0.65);
    expect(reconciled.conflictWarning).toContain('Market data disagreement');
  });

  it('calculates freshness correctly based on timestamp age', () => {
    const nowIso = new Date().toISOString();
    const staleIso = new Date(Date.now() - 45 * 60 * 1000).toISOString(); // 45m ago

    expect(DataReconciler.calculateFreshness(nowIso)).toBe('LIVE');
    expect(DataReconciler.calculateFreshness(staleIso)).toBe('STALE');
  });
});
